<?php
// Configuración de conexión a la base de datos wuten con soporte para variables de entorno
function conectar()
{
    // Obtener configuración desde variables de entorno o usar valores por defecto
    $host = getenv('DB_HOST') ?: 'localhost';
    $usuario = getenv('DB_USER') ?: 'root';
    $password = getenv('DB_PASSWORD') ?: 'Admin12345';
    $base_datos = getenv('DB_NAME') ?: 'wuten';
    
    $con = mysqli_connect($host, $usuario, $password, $base_datos);
    
    if (!$con) {
        throw new Exception("Error de conexión: " . mysqli_connect_error());
    }
    
    // Configurar charset
    mysqli_set_charset($con, "utf8");
    
    return $con;
}

// Función para contar usuarios (para verificación)
function contarusu()
{
    $sql = "SELECT * FROM usuarios";
    $result = mysqli_query(conectar(), $sql);
    $contar = mysqli_num_rows($result);
    return $contar;
}

// Función para obtener UF actual (simulada)
function obtenerUF()
{
    // Por ahora retornamos un valor fijo, pero se puede conectar a una API real
    return [
        'valor' => 35000,
        'fecha' => date('Y-m-d')
    ];
}

// Función para obtener configuración del entorno
function getEnvironmentConfig()
{
    return [
        'db_host' => getenv('DB_HOST') ?: 'localhost',
        'db_name' => getenv('DB_NAME') ?: 'wuten',
        'db_user' => getenv('DB_USER') ?: 'root',
        'app_env' => getenv('APP_ENV') ?: 'development',
        'php_version' => PHP_VERSION,
        'server_time' => date('Y-m-d H:i:s')
    ];
}

// Función para validar conexión a la base de datos
function testDatabaseConnection()
{
    try {
        $con = conectar();
        $result = mysqli_query($con, "SELECT 1");
        mysqli_close($con);
        return true;
    } catch (Exception $e) {
        return false;
    }
}
?> 