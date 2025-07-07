<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include("config.php");

if ($_SERVER["REQUEST_METHOD"] === "GET") {
    try {
        // Obtener configuración del entorno
        $envConfig = getEnvironmentConfig();
        
        // Probar conexión a la base de datos
        $dbConnection = testDatabaseConnection();
        
        // Obtener información del servidor
        $serverInfo = [
            'php_version' => PHP_VERSION,
            'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
            'server_time' => date('Y-m-d H:i:s'),
            'timezone' => date_default_timezone_get(),
            'memory_limit' => ini_get('memory_limit'),
            'max_execution_time' => ini_get('max_execution_time')
        ];
        
        // Obtener variables de entorno relevantes
        $environmentVars = [
            'DB_HOST' => getenv('DB_HOST') ?: 'localhost (default)',
            'DB_NAME' => getenv('DB_NAME') ?: 'wuten (default)',
            'DB_USER' => getenv('DB_USER') ?: 'root (default)',
            'APP_ENV' => getenv('APP_ENV') ?: 'development (default)',
            'VITE_API_URL' => getenv('VITE_API_URL') ?: 'Not set'
        ];
        
        echo json_encode([
            'success' => true,
            'message' => 'Configuración del entorno obtenida exitosamente',
            'environment' => [
                'config' => $envConfig,
                'database_connection' => $dbConnection,
                'server_info' => $serverInfo,
                'environment_vars' => $environmentVars
            ],
            'timestamp' => time()
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al obtener configuración del entorno: ' . $e->getMessage(),
            'timestamp' => time()
        ]);
    }
    
} else {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido',
        'timestamp' => time()
    ]);
}
?> 