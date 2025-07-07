<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

try {
    // Intentar conexión directa
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
    
    // Verificar si las tablas necesarias existen
    $tablas_requeridas = ['usuarios', 'propiedades', 'regiones', 'provincias', 'comunas', 'sectores', 'tipo_propiedad'];
    $tablas_faltantes = array_diff($tablas_requeridas, $tablas);
    
    // Intentar consultar algunas tablas
    $datos = [];
    
    if (in_array('usuarios', $tablas)) {
        $result = mysqli_query($con, "SELECT COUNT(*) as total FROM usuarios");
        if ($result) {
            $datos['usuarios'] = mysqli_fetch_assoc($result)['total'];
        }
    }
    
    if (in_array('propiedades', $tablas)) {
        $result = mysqli_query($con, "SELECT COUNT(*) as total FROM propiedades");
        if ($result) {
            $datos['propiedades'] = mysqli_fetch_assoc($result)['total'];
        }
    }
    
    if (in_array('regiones', $tablas)) {
        $result = mysqli_query($con, "SELECT COUNT(*) as total FROM regiones");
        if ($result) {
            $datos['regiones'] = mysqli_fetch_assoc($result)['total'];
        }
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Conexión exitosa',
        'tablas_encontradas' => $tablas,
        'tablas_faltantes' => array_values($tablas_faltantes),
        'datos' => $datos,
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