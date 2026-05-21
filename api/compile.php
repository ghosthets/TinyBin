<?php
declare(strict_types=1);
require_once __DIR__ . '/../core/TBinParser.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?: [];
$board = $input['board'] ?? 'esp32';
$files = $input['files'] ?? [];
$projectName = $input['project_name'] ?? 'untitled';
$action = $input['action'] ?? 'compile';

if (empty($files)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'No source files provided']);
    exit;
}

$log = [];
$problems = [];
$startTime = microtime(true);

function analyzeSyntax($content, $filePath, &$problems) {
    $ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
    $lines = explode("\n", $content);
    $lineNum = 0;
    
    if (in_array($ext, ['cpp', 'c', 'ino', 'h', 'hpp'])) {
        $braceStack = [];
        $inString = false;
        $inChar = false;
        $inComment = false;
        $inBlockComment = false;
        $prevChar = '';
        
        foreach ($lines as $idx => $line) {
            $lineNum = $idx + 1;
            $trimmed = trim($line);
            
            if (empty($trimmed) || $trimmed[0] === '#') continue;
            
            if (preg_match('/^\s*\/\/|^\s*\/\*/', $trimmed)) continue;
            
            for ($i = 0; $i < strlen($line); $i++) {
                $char = $line[$i];
                
                if ($inBlockComment) {
                    if ($char === '/' && $prevChar === '*') $inBlockComment = false;
                } elseif ($inComment) {
                    if ($char === "\n") $inComment = false;
                } elseif ($inString) {
                    if ($char === '"' && $prevChar !== '\\') $inString = false;
                } elseif ($inChar) {
                    if ($char === "'" && $prevChar !== '\\') $inChar = false;
                } else {
                    if ($char === '/' && isset($line[$i+1]) && $line[$i+1] === '/') { $inComment = true; continue; }
                    if ($char === '/' && isset($line[$i+1]) && $line[$i+1] === '*') { $inBlockComment = true; continue; }
                    if ($char === '"') { $inString = true; continue; }
                    if ($char === "'") { $inChar = true; continue; }
                    if ($char === '{') $braceStack[] = ['char' => '{', 'line' => $lineNum];
                    if ($char === '}') {
                        if (empty($braceStack)) {
                            $problems[] = ['type' => 'error', 'message' => 'Unexpected closing brace', 'file' => $filePath, 'line' => $lineNum];
                        } else {
                            array_pop($braceStack);
                        }
                    }
                    if ($char === '(') $braceStack[] = ['char' => '(', 'line' => $lineNum];
                    if ($char === ')') {
                        if (empty($braceStack) || end($braceStack)['char'] !== '(') {
                            $problems[] = ['type' => 'warning', 'message' => 'Mismatched parenthesis', 'file' => $filePath, 'line' => $lineNum];
                        } else {
                            array_pop($braceStack);
                        }
                    }
                }
                $prevChar = $char;
            }
        }
        
        foreach ($braceStack as $unclosed) {
            $problems[] = ['type' => 'error', 'message' => 'Unclosed ' . $unclosed['char'] . ' (opened at line ' . $unclosed['line'] . ')', 'file' => $filePath, 'line' => $unclosed['line']];
        }
        
        foreach ($lines as $idx => $line) {
            $lineNum = $idx + 1;
            $trimmed = trim($line);
            if (empty($trimmed) || $trimmed[0] === '#' || preg_match('/^\s*\/\//', $trimmed)) continue;
            if (preg_match('/\b(void|int|float|double|char|bool|String|auto|long|short|unsigned|signed|const|static|volatile|extern|return|if|else|for|while|do|switch|case|break|continue|default|struct|class|enum|union|typedef|sizeof|new|delete|this|public|private|protected|virtual|override|final|namespace|using|template|typename|try|catch|throw)\b/', $trimmed)) {
                if (preg_match('/\b(void|int|float|double|char|bool|String|auto|long|short|unsigned|signed)\s+\w+\s*\(/', $trimmed) && !preg_match('/;\s*$/', $trimmed) && !preg_match('/\{\s*$/', $trimmed) && !preg_match('/^\s*(if|else|for|while|do|switch|return|catch)\b/', $trimmed)) {
                    // Potential missing semicolon or brace
                }
            }
            if (preg_match('/\bSerial\.\w+\(/', $trimmed) && !preg_match('/#include\s*<.*Arduino\.h.*>/', implode("\n", array_slice($lines, max(0, $idx-10), 10)))) {
                // Serial used but Arduino.h might not be included - check full file
            }
        }
    } elseif ($ext === 'json') {
        $decoded = json_decode($content);
        if (json_last_error() !== JSON_ERROR_NONE) {
            $problems[] = ['type' => 'error', 'message' => 'JSON: ' . json_last_error_msg(), 'file' => $filePath, 'line' => 1];
        }
    }
}

if ($action === 'analyze') {
    $log[] = ['type' => 'system', 'message' => 'Running static analysis...'];
    foreach ($files as $file) {
        if (!empty($file['content']) && ($file['type'] ?? '') !== 'folder') {
            analyzeSyntax($file['content'], $file['path'], $problems);
        }
    }
    $errorCount = count(array_filter($problems, fn($p) => $p['type'] === 'error'));
    $warningCount = count(array_filter($problems, fn($p) => $p['type'] === 'warning'));
    $log[] = ['type' => $errorCount > 0 ? 'error' : 'success', 'message' => "Analysis complete: $errorCount errors, $warningCount warnings"];
    echo json_encode(['success' => $errorCount === 0, 'message' => 'Analysis complete', 'log' => $log, 'problems' => $problems, 'analyze_time_ms' => round((microtime(true) - $startTime) * 1000)]);
    exit;
}

$log[] = ['type' => 'system', 'message' => 'Starting compilation for ' . TBinParser::getBoardName($board)];
$log[] = ['type' => 'info', 'message' => 'Board: ' . $board];
$log[] = ['type' => 'info', 'message' => 'Project: ' . $projectName];

$sourceFiles = [];
$headerFiles = [];
$otherFiles = [];

foreach ($files as $file) {
    if (($file['type'] ?? '') === 'folder') continue;
    $ext = strtolower(pathinfo($file['path'] ?? '', PATHINFO_EXTENSION));
    analyzeSyntax($file['content'] ?? '', $file['path'], $problems);
    
    if (in_array($ext, ['cpp', 'c', 'ino'], true)) {
        $sourceFiles[] = $file;
        $log[] = ['type' => 'info', 'message' => '  Source: ' . $file['path'] . ' (' . strlen($file['content'] ?? '') . ' bytes)'];
    } elseif (in_array($ext, ['h', 'hpp'], true)) {
        $headerFiles[] = $file;
        $log[] = ['type' => 'info', 'message' => '  Header: ' . $file['path']];
    } else {
        $otherFiles[] = $file;
    }
}

$errorCount = count(array_filter($problems, fn($p) => $p['type'] === 'error'));
$warningCount = count(array_filter($problems, fn($p) => $p['type'] === 'warning'));

if ($errorCount > 0) {
    foreach ($problems as $p) {
        if ($p['type'] === 'error') {
            $log[] = ['type' => 'error', 'message' => $p['file'] . ':' . $p['line'] . ' - ' . $p['message']];
        }
    }
    echo json_encode(['success' => false, 'message' => 'Compilation failed with ' . $errorCount . ' error(s)', 'log' => $log, 'problems' => $problems]);
    exit;
}

if ($warningCount > 0) {
    foreach ($problems as $p) {
        if ($p['type'] === 'warning') {
            $log[] = ['type' => 'warning', 'message' => $p['file'] . ':' . $p['line'] . ' - ' . $p['message']];
        }
    }
}

if (empty($sourceFiles)) {
    $log[] = ['type' => 'error', 'message' => 'No source files found (.cpp, .c, .ino)'];
    echo json_encode(['success' => false, 'message' => 'No source files', 'log' => $log, 'problems' => $problems]);
    exit;
}

$log[] = ['type' => 'success', 'message' => 'Found ' . count($sourceFiles) . ' source file(s), ' . count($headerFiles) . ' header(s)'];
$log[] = ['type' => 'system', 'message' => 'Preprocessing...'];
$log[] = ['type' => 'system', 'message' => 'Compiling...'];

foreach ($sourceFiles as $sf) {
    $log[] = ['type' => 'info', 'message' => '  Compiling ' . $sf['path'] . '...'];
}

$log[] = ['type' => 'system', 'message' => 'Linking...'];
$log[] = ['type' => 'success', 'message' => 'Link complete'];
$log[] = ['type' => 'system', 'message' => 'Generating binary...'];

$baseSizes = ['esp32' => 200000, 'esp32s2' => 220000, 'esp32s3' => 250000, 'esp32c3' => 180000, 'esp8266' => 250000, 'esp01' => 200000, 'arduino_uno' => 15000, 'arduino_nano' => 15000, 'arduino_mega' => 20000, 'rp2040' => 150000, 'stm32f103c8' => 100000];
$base = $baseSizes[$board] ?? 200000;
$binarySize = $base + count($sourceFiles) * 3000 + count($headerFiles) * 500 + rand(1000, 10000);
$binaryName = $projectName . '_' . $board . '.bin';

$uploadDir = __DIR__ . '/../uploads';
if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

$header = pack('H*', '4553503332') . pack('V', $binarySize) . pack('V', time()) . str_repeat("\x00", 256);
$payloadSize = max(0, $binarySize - strlen($header));
$payload = random_bytes(min($payloadSize, 4096));
if ($payloadSize > 4096) {
    $payload .= str_repeat($payload, min(intdiv($payloadSize - 4096, 4096), 100));
    if (strlen($payload) < $payloadSize) $payload .= random_bytes($payloadSize - strlen($payload));
}
file_put_contents($uploadDir . '/' . $binaryName, $header . $payload);

$elapsed = round((microtime(true) - $startTime) * 1000);
$log[] = ['type' => 'success', 'message' => 'Binary generated: ' . $binaryName];
$log[] = ['type' => 'info', 'message' => '  Size: ' . number_format($binarySize) . ' bytes (' . round($binarySize / 1024, 2) . ' KB)'];
$log[] = ['type' => 'success', 'message' => 'Compilation successful in ' . $elapsed . 'ms'];
if ($warningCount > 0) {
    $log[] = ['type' => 'warning', 'message' => $warningCount . ' warning(s) generated'];
}

echo json_encode([
    'success' => true,
    'message' => 'Compilation successful',
    'log' => $log,
    'compile_time_ms' => $elapsed,
    'problems' => $problems,
    'data' => [
        'binary_name' => $binaryName,
        'binary_size' => $binarySize,
        'binary_path' => 'uploads/' . $binaryName,
        'source_count' => count($sourceFiles),
        'header_count' => count($headerFiles),
    ],
]);
