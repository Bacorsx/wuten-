<?php
// ========================================
// CONFIGURACIÓN DE PRODUCCIÓN - BACKEND
// ========================================
// 
// Este archivo contiene configuraciones específicas para producción
// Incluye optimizaciones de seguridad y rendimiento

// Configuración de errores para producción
error_reporting(E_ALL & ~E_DEPRECATED & ~E_STRICT);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', '/var/log/php/error.log');

// Configuración de seguridad
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 1);
ini_set('session.use_strict_mode', 1);
ini_set('session.cookie_samesite', 'Strict');

// Headers de seguridad
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('Permissions-Policy: geolocation=(), microphone=(), camera=()');

// Configuración de conexión a la base de datos para producción
function conectarProduccion()
{
    // Obtener configuración desde variables de entorno o usar valores por defecto
    $host = getenv('DB_HOST') ?: 'localhost';
    $usuario = getenv('DB_USER') ?: 'root';
    $password = getenv('DB_PASSWORD') ?: 'Admin12345';
    $base_datos = getenv('DB_NAME') ?: 'wuten';
    
    // Configuración de conexión persistente para mejor rendimiento
    $con = mysqli_connect($host, $usuario, $password, $base_datos);
    
    if (!$con) {
        // En producción, no mostrar errores detallados
        error_log("Error de conexión a la base de datos: " . mysqli_connect_error());
        throw new Exception("Error de conexión a la base de datos");
    }
    
    // Configurar charset y optimizaciones
    mysqli_set_charset($con, "utf8mb4");
    mysqli_query($con, "SET SESSION sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO'");
    
    return $con;
}

// Función para validar entrada de datos
function validarEntrada($datos, $tipo = 'string')
{
    switch ($tipo) {
        case 'email':
            return filter_var($datos, FILTER_VALIDATE_EMAIL) ? $datos : false;
        case 'int':
            return filter_var($datos, FILTER_VALIDATE_INT) ? (int)$datos : false;
        case 'float':
            return filter_var($datos, FILTER_VALIDATE_FLOAT) ? (float)$datos : false;
        case 'url':
            return filter_var($datos, FILTER_VALIDATE_URL) ? $datos : false;
        default:
            return htmlspecialchars(trim($datos), ENT_QUOTES, 'UTF-8');
    }
}

// Función para generar tokens seguros
function generarTokenSeguro($longitud = 32)
{
    return bin2hex(random_bytes($longitud));
}

// Función para verificar si estamos en producción
function esProduccion()
{
    return getenv('APP_ENV') === 'production' || 
           getenv('NODE_ENV') === 'production' ||
           !getenv('APP_ENV');
}

// Función para logging de producción
function logProduccion($mensaje, $nivel = 'INFO')
{
    $timestamp = date('Y-m-d H:i:s');
    $logEntry = "[$timestamp] [$nivel] $mensaje" . PHP_EOL;
    error_log($logEntry, 3, '/var/log/php/app.log');
}

// Función para respuesta JSON segura
function respuestaJSON($datos, $codigo = 200)
{
    http_response_code($codigo);
    header('Content-Type: application/json; charset=utf-8');
    
    // En producción, no incluir información sensible en errores
    if ($codigo >= 400 && esProduccion()) {
        $datos = ['error' => 'Ha ocurrido un error. Contacte al administrador.'];
    }
    
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}

// Función para verificar rate limiting básico
function verificarRateLimit($ip, $limite = 100, $ventana = 3600)
{
    $archivo = "/tmp/rate_limit_$ip.txt";
    $ahora = time();
    
    if (file_exists($archivo)) {
        $datos = json_decode(file_get_contents($archivo), true);
        if ($datos && ($ahora - $datos['timestamp']) < $ventana) {
            if ($datos['contador'] >= $limite) {
                return false; // Rate limit excedido
            }
            $datos['contador']++;
        } else {
            $datos = ['contador' => 1, 'timestamp' => $ahora];
        }
    } else {
        $datos = ['contador' => 1, 'timestamp' => $ahora];
    }
    
    file_put_contents($archivo, json_encode($datos));
    return true;
}

// Función para obtener información del entorno de producción
function getInfoProduccion()
{
    return [
        'entorno' => esProduccion() ? 'production' : 'development',
        'php_version' => PHP_VERSION,
        'servidor' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
        'timestamp' => date('Y-m-d H:i:s'),
        'memoria_limite' => ini_get('memory_limit'),
        'tiempo_maximo' => ini_get('max_execution_time'),
        'timezone' => date_default_timezone_get()
    ];
}

// Configuración de CORS para producción
function configurarCORS()
{
    $origenesPermitidos = [
        'http://localhost:3000',
        'http://localhost',
        'http://54.163.209.36',
        'https://54.163.209.36'
    ];
    
    $origen = $_SERVER['HTTP_ORIGIN'] ?? '';
    
    if (in_array($origen, $origenesPermitidos)) {
        header("Access-Control-Allow-Origin: $origen");
    }
    
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('Access-Control-Max-Age: 86400');
    
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}

// Inicializar configuración de producción
if (esProduccion()) {
    configurarCORS();
    logProduccion('Aplicación iniciada en modo producción');
}
?> 