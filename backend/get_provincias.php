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
    
    $id_region = $_GET['id_region'] ?? null;
    
    if (!$id_region) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'ID de región requerido'
        ]);
        exit;
    }
    
    $sql = "SELECT idprovincias, nombre_provincia, idregion FROM provincias WHERE idregion = ? ORDER BY nombre_provincia";
    $stmt = mysqli_prepare($conexion, $sql);
    mysqli_stmt_bind_param($stmt, "i", $id_region);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if (!$result) {
        throw new Exception("Error en la consulta: " . mysqli_stmt_error($stmt));
    }
    
    $provincias = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $provincias[] = [
            'idprovincias' => $row['idprovincias'],
            'nombre_provincia' => $row['nombre_provincia'],
            'idregion' => $row['idregion']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'provincias' => $provincias
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