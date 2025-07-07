<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Obtener los últimos logs del servidor
$logFile = ini_get('error_log');
if (!$logFile) {
    $logFile = '/tmp/php_errors.log'; // Log por defecto
}

$logs = [];
if (file_exists($logFile)) {
    $lines = file($logFile);
    // Obtener las últimas 50 líneas que contengan "DEBUG"
    $debugLines = array_filter($lines, function($line) {
        return strpos($line, 'DEBUG') !== false;
    });
    $logs = array_slice(array_reverse($debugLines), 0, 50);
}

echo json_encode([
    'success' => true,
    'logs' => $logs,
    'log_file' => $logFile,
    'timestamp' => date('Y-m-d H:i:s')
]);
?> 