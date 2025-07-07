<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    include("config.php");
    
    $conexion = conectar();
    
    $sql = "SELECT idregion, nombre_region FROM regiones ORDER BY nombre_region";
    $result = mysqli_query($conexion, $sql);
    
    if (!$result) {
        throw new Exception("Error en la consulta: " . mysqli_error($conexion));
    }
    
    $regiones = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $regiones[] = [
            'idregion' => $row['idregion'],
            'nombre_region' => $row['nombre_region']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'regiones' => $regiones
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor: ' . $e->getMessage()
    ]);
}

mysqli_close($conexion);
?> 