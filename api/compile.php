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

// ===== REAL TOOLCHAIN DETECTION =====
function detectToolchain() {
    $tools = [
        'arduino-cli' => ['cmd' => 'arduino-cli version', 'type' => 'arduino-cli'],
        'platformio' => ['cmd' => 'pio --version', 'type' => 'platformio'],
        'xtensa-esp32-elf-gcc' => ['cmd' => 'xtensa-esp32-elf-gcc --version', 'type' => 'esp32-gcc'],
        'avr-gcc' => ['cmd' => 'avr-gcc --version', 'type' => 'avr-gcc'],
        'gcc' => ['cmd' => 'gcc --version', 'type' => 'gcc'],
    ];
    
    foreach ($tools as $tool => $info) {
        $output = [];
        $return = 0;
        exec($info['cmd'] . ' 2>&1', $output, $return);
        if ($return === 0 && !empty($output)) {
            return ['name' => $tool, 'type' => $info['type'], 'version' => trim($output[0])];
        }
    }
    return null;
}

function cleanupOldBinaries($uploadDir, $maxAgeSeconds = 3600) {
    if (!is_dir($uploadDir)) return;
    $now = time();
    $files = glob($uploadDir . '/*.{bin,elf,hex}', GLOB_BRACE);
    foreach ($files as $file) {
        if ($now - filemtime($file) > $maxAgeSeconds) {
            @unlink($file);
        }
    }
    $dirs = glob($uploadDir . '/*', GLOB_ONLYDIR);
    foreach ($dirs as $dir) {
        if (preg_match('/_\d{10}$/', $dir) && $now - filemtime($dir) > $maxAgeSeconds) {
            array_map('unlink', glob($dir . '/*/*'));
            array_map('unlink', glob($dir . '/*'));
            @rmdir($dir);
        }
    }
}

function compileWithArduinoCli($board, $files, $projectName, &$log, &$problems) {
    $uploadDir = __DIR__ . '/../uploads';
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
    
    $projectDir = $uploadDir . '/' . $projectName . '_' . time();
    mkdir($projectDir . '/src', 0755, true);
    
    foreach ($files as $file) {
        if (($file['type'] ?? '') === 'folder') continue;
        if (empty($file['content'])) continue;
        $path = $file['path'];
        if (strpos($path, 'lib/') === 0) {
            $libPath = $projectDir . '/' . $path;
            $libDir = dirname($libPath);
            if (!is_dir($libDir)) mkdir($libDir, 0755, true);
            file_put_contents($libPath, $file['content']);
        } else {
            $srcPath = $projectDir . '/src/' . basename($path);
            file_put_contents($srcPath, $file['content']);
        }
    }
    
    $boardMap = [
        'esp32' => 'esp32:esp32:esp32',
        'esp32s2' => 'esp32:esp32:esp32s2',
        'esp32s3' => 'esp32:esp32:esp32s3',
        'esp32c3' => 'esp32:esp32:esp32c3',
        'esp8266' => 'esp8266:esp8266:nodemcuv2',
        'arduino_uno' => 'arduino:avr:uno',
        'arduino_nano' => 'arduino:avr:nano',
        'arduino_mega' => 'arduino:avr:mega',
    ];
    
    $arduinoBoard = $boardMap[$board] ?? 'esp32:esp32:esp32';
    
    $cmd = sprintf(
        'arduino-cli compile --fqbn %s --output-dir %s %s 2>&1',
        escapeshellarg($arduinoBoard),
        escapeshellarg($projectDir),
        escapeshellarg($projectDir . '/src')
    );
    
    $output = [];
    $return = 0;
    exec($cmd, $output, $return);
    
    $log[] = ['type' => 'info', 'message' => 'Tool: arduino-cli'];
    $log[] = ['type' => 'info', 'message' => 'Board: ' . $arduinoBoard];
    $log[] = ['type' => 'info', 'message' => 'Command: ' . $cmd];
    
    foreach ($output as $line) {
        if (preg_match('/error:/', $line)) {
            $problems[] = ['type' => 'error', 'message' => trim($line), 'file' => '', 'line' => 0];
        } elseif (preg_match('/warning:/', $line)) {
            $problems[] = ['type' => 'warning', 'message' => trim($line), 'file' => '', 'line' => 0];
        }
        $log[] = ['type' => 'info', 'message' => $line];
    }
    
    if ($return === 0) {
        $binFiles = glob($projectDir . '/*.bin');
        if (!empty($binFiles)) {
            $binFile = $binFiles[0];
            $binName = basename($binFile);
            $binSize = filesize($binFile);
            $binDest = $uploadDir . '/' . $binName;
            copy($binFile, $binDest);
            
            return [
                'success' => true,
                'binary_name' => $binName,
                'binary_size' => $binSize,
                'binary_path' => 'uploads/' . $binName,
            ];
        }
    }
    
    return null;
}

function compileWithGCC($board, $files, $projectName, &$log, &$problems) {
    $uploadDir = __DIR__ . '/../uploads';
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
    
    $srcDir = $uploadDir . '/src_' . $projectName . '_' . time();
    mkdir($srcDir, 0755, true);
    
    foreach ($files as $file) {
        if (($file['type'] ?? '') === 'folder') continue;
        if (empty($file['content'])) continue;
        $ext = pathinfo($file['path'], PATHINFO_EXTENSION);
        if (in_array($ext, ['cpp', 'c', 'ino', 'h', 'hpp'])) {
            file_put_contents($srcDir . '/' . basename($file['path']), $file['content']);
        }
    }
    
    $sourceFiles = glob($srcDir . '/*.{cpp,c,ino}', GLOB_BRACE);
    if (empty($sourceFiles)) {
        $log[] = ['type' => 'error', 'message' => 'No source files found'];
        return null;
    }
    
    $binName = $projectName . '_' . $board . '.bin';
    $binPath = $uploadDir . '/' . $binName;
    
    $boardFlags = [
        'esp32' => '-mcpu=esp32 -Os -ffunction-sections -fdata-sections',
        'esp8266' => '-mcpu=esp8266 -Os -ffunction-sections -fdata-sections',
        'arduino_uno' => '-mmcu=atmega328p -Os -ffunction-sections -fdata-sections',
        'arduino_nano' => '-mmcu=atmega328p -Os -ffunction-sections -fdata-sections',
        'arduino_mega' => '-mmcu=atmega2560 -Os -ffunction-sections -fdata-sections',
    ];
    
    $flags = $boardFlags[$board] ?? '-Os';
    $sources = implode(' ', array_map('escapeshellarg', $sourceFiles));
    
    $cmd = sprintf(
        'gcc %s %s -o %s 2>&1',
        $flags,
        $sources,
        escapeshellarg($binPath)
    );
    
    $output = [];
    $return = 0;
    exec($cmd, $output, $return);
    
    foreach ($output as $line) {
        if (preg_match('/error:/', $line)) {
            $problems[] = ['type' => 'error', 'message' => trim($line), 'file' => '', 'line' => 0];
        } elseif (preg_match('/warning:/', $line)) {
            $problems[] = ['type' => 'warning', 'message' => trim($line), 'file' => '', 'line' => 0];
        }
        $log[] = ['type' => 'info', 'message' => $line];
    }
    
    if ($return === 0 && file_exists($binPath)) {
        return [
            'success' => true,
            'binary_name' => $binName,
            'binary_size' => filesize($binPath),
            'binary_path' => 'uploads/' . $binName,
        ];
    }
    
    return null;
}

// ===== MAIN LOGIC =====
$uploadDir = __DIR__ . '/../uploads';
cleanupOldBinaries($uploadDir);

$log[] = ['type' => 'system', 'message' => '=== REAL COMPILATION STARTED ==='];
$log[] = ['type' => 'info', 'message' => 'Board: ' . TBinParser::getBoardName($board) . ' (' . $board . ')'];
$log[] = ['type' => 'info', 'message' => 'Project: ' . $projectName];
$log[] = ['type' => 'info', 'message' => 'Files: ' . count($files)];

$toolchain = detectToolchain();
if ($toolchain) {
    $log[] = ['type' => 'success', 'message' => 'Toolchain detected: ' . $toolchain['name'] . ' (' . $toolchain['version'] . ')'];
} else {
    $log[] = ['type' => 'error', 'message' => 'NO REAL TOOLCHAIN FOUND ON SERVER'];
    $log[] = ['type' => 'error', 'message' => 'Install one of: arduino-cli, platformio, xtensa-esp32-elf-gcc, avr-gcc, or gcc'];
    $log[] = ['type' => 'info', 'message' => 'For ESP32: sudo apt install arduino-cli && arduino-cli core install esp32:esp32'];
    $log[] = ['type' => 'info', 'message' => 'For Arduino: sudo apt install arduino-cli && arduino-cli core install arduino:avr'];
    echo json_encode([
        'success' => false,
        'message' => 'No compilation toolchain installed on server. Install arduino-cli or gcc to enable real compilation.',
        'log' => $log,
        'problems' => [],
        'toolchain_missing' => true,
    ]);
    exit;
}

$result = null;
if ($toolchain['type'] === 'arduino-cli') {
    $result = compileWithArduinoCli($board, $files, $projectName, $log, $problems);
} elseif (in_array($toolchain['type'], ['gcc', 'esp32-gcc', 'avr-gcc'])) {
    $result = compileWithGCC($board, $files, $projectName, $log, $problems);
}

if ($result && $result['success']) {
    $elapsed = round((microtime(true) - $startTime) * 1000);
    $log[] = ['type' => 'success', 'message' => '✓ REAL COMPILATION SUCCESSFUL'];
    $log[] = ['type' => 'info', 'message' => 'Binary: ' . $result['binary_name'] . ' (' . number_format($result['binary_size']) . ' bytes)'];
    $log[] = ['type' => 'info', 'message' => 'Time: ' . $elapsed . 'ms'];
    
    echo json_encode([
        'success' => true,
        'message' => 'Real compilation successful',
        'log' => $log,
        'compile_time_ms' => $elapsed,
        'problems' => $problems,
        'data' => [
            'binary_name' => $result['binary_name'],
            'binary_size' => $result['binary_size'],
            'binary_path' => $result['binary_path'],
        ],
    ]);
} else {
    $errorCount = count(array_filter($problems, fn($p) => $p['type'] === 'error'));
    $log[] = ['type' => 'error', 'message' => '✗ COMPILATION FAILED (' . $errorCount . ' errors)'];
    
    echo json_encode([
        'success' => false,
        'message' => 'Compilation failed with ' . $errorCount . ' error(s)',
        'log' => $log,
        'problems' => $problems,
    ]);
}
