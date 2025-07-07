<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

try {
    // Verificar si mysqli está disponible
    if (!extension_loaded('mysqli')) {
        throw new Exception('Extensión mysqli no está cargada');
    }
    
    // Intentar conexión
    $host = "localhost";
    $usuario = "root";
    $password = "";
    $base_datos = "wuten";
    
    $con = mysqli_connect($host, $usuario, $password, $base_datos);
    
    if (!$con) {
        throw new Exception("Error de conexión: " . mysqli_connect_error());
    }
    
    // Verificar si la base de datos existe
    $result = mysqli_query($con, "SHOW TABLES");
    if (!$result) {
        throw new Exception("Error al verificar tablas: " . mysqli_error($con));
    }
    
    $tablas = [];
    while ($row = mysqli_fetch_array($result)) {
        $tablas[] = $row[0];
    }
    
    // Verificar tabla usuarios
    $result = mysqli_query($con, "SELECT COUNT(*) as total FROM usuarios");
    if (!$result) {
        throw new Exception("Error al consultar usuarios: " . mysqli_error($con));
    }
    $usuarios = mysqli_fetch_assoc($result);
    
    // Verificar tabla propiedades
    $result = mysqli_query($con, "SELECT COUNT(*) as total FROM propiedades");
    if (!$result) {
        throw new Exception("Error al consultar propiedades: " . mysqli_error($con));
    }
    $propiedades = mysqli_fetch_assoc($result);
    
    echo json_encode([
        'success' => true,
        'message' => 'Conexión exitosa',
        'tablas' => $tablas,
        'total_usuarios' => $usuarios['total'],
        'total_propiedades' => $propiedades['total'],
        'php_version' => PHP_VERSION,
        'mysqli_version' => mysqli_get_client_info()
    ]);
    
    mysqli_close($con);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'php_version' => PHP_VERSION
    ]);
}
?> 