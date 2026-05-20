<?php
declare(strict_types=1);

class GitHubAPI
{
    private const API_BASE = 'https://api.github.com';
    private const RAW_BASE = 'https://raw.githubusercontent.com';
    private const USER_AGENT = 'TinyBin-IDE/3.0';

    public static function parseUrl(string $url): ?array
    {
        $url = rtrim(trim($url), '/');
        if (preg_match('/^https?:\/\/(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_.-]+)/i', $url, $m)) {
            return ['owner' => $m[1], 'repo' => $m[2], 'full_name' => $m[1] . '/' . $m[2]];
        }
        if (preg_match('/^git@github\.com:([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_.-]+)/i', $url, $m)) {
            return ['owner' => $m[1], 'repo' => $m[2], 'full_name' => $m[1] . '/' . $m[2]];
        }
        return null;
    }

    public static function getTree(string $owner, string $repo, string $branch = 'main', ?string $token = null): array
    {
        return self::request('/repos/' . $owner . '/' . $repo . '/git/trees/' . $branch . '?recursive=1', $token);
    }

    public static function getFile(string $owner, string $repo, string $path, string $branch = 'main', ?string $token = null): array
    {
        return self::request('/repos/' . $owner . '/' . $repo . '/contents/' . $path . '?ref=' . $branch, $token);
    }

    public static function getRawUrl(string $owner, string $repo, string $branch, string $path): string
    {
        return self::RAW_BASE . '/' . $owner . '/' . $repo . '/' . $branch . '/' . ltrim($path, '/');
    }

    public static function downloadBinary(string $owner, string $repo, string $branch, string $path): array
    {
        $url = self::getRawUrl($owner, $repo, $branch, $path);
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url, CURLOPT_RETURNTRANSFER => true, CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_TIMEOUT => 120, CURLOPT_CONNECTTIMEOUT => 15, CURLOPT_USERAGENT => self::USER_AGENT,
            CURLOPT_SSL_VERIFYPEER => true, CURLOPT_SSL_VERIFYHOST => 2,
        ]);
        $binary = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) return ['success' => false, 'message' => 'Download failed: ' . $error];
        if ($httpCode !== 200) return ['success' => false, 'message' => 'HTTP ' . $httpCode];
        return ['success' => true, 'data' => $binary, 'size' => strlen($binary), 'url' => $url];
    }

    public static function discoverTBinFiles(string $owner, string $repo, string $branch = 'main', ?string $token = null): array
    {
        $tree = self::getTree($owner, $repo, $branch, $token);
        if (!$tree['success'] || !isset($tree['data']['tree'])) {
            return ['success' => false, 'message' => 'Failed to fetch repository tree'];
        }

        $tbinFiles = [];
        foreach ($tree['data']['tree'] as $item) {
            if ($item['type'] === 'blob' && str_ends_with($item['path'], '.tbin')) {
                $content = self::getFile($owner, $repo, $item['path'], $branch, $token);
                if ($content['success'] && isset($content['data']['content'])) {
                    $decoded = base64_decode($content['data']['content'], true);
                    if ($decoded !== false) {
                        $tbinFiles[] = ['path' => $item['path'], 'content' => $decoded, 'size' => $item['size'] ?? 0];
                    }
                }
            }
        }

        return ['success' => true, 'files' => $tbinFiles];
    }

    private static function request(string $endpoint, ?string $token = null): array
    {
        $url = self::API_BASE . $endpoint;
        $headers = ['Accept: application/vnd.github.v3+json', 'User-Agent: ' . self::USER_AGENT];
        if ($token) $headers[] = 'Authorization: token ' . $token;

        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url, CURLOPT_RETURNTRANSFER => true, CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_TIMEOUT => 30, CURLOPT_CONNECTTIMEOUT => 10, CURLOPT_USERAGENT => self::USER_AGENT,
            CURLOPT_HTTPHEADER => $headers, CURLOPT_SSL_VERIFYPEER => true, CURLOPT_SSL_VERIFYHOST => 2,
        ]);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) return ['success' => false, 'message' => 'cURL error: ' . $error];
        if ($httpCode === 403) return ['success' => false, 'message' => 'GitHub API rate limit exceeded. Add a token in settings.'];
        if ($httpCode === 404) return ['success' => false, 'message' => 'Resource not found (404)'];
        if ($httpCode >= 400) return ['success' => false, 'message' => 'GitHub API error: HTTP ' . $httpCode];

        return ['success' => true, 'data' => json_decode($response, true), 'http_code' => $httpCode];
    }
}
