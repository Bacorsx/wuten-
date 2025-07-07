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
    
    $id_provincia = $_GET['id_provincia'] ?? null;
    
    if (!$id_provincia) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'ID de provincia requerido'
        ]);
        exit;
    }
    
    $sql = "SELECT idcomunas, nombre_comuna, idprovincias FROM comunas WHERE idprovincias = ? ORDER BY nombre_comuna";
    $stmt = mysqli_prepare($conexion, $sql);
    mysqli_stmt_bind_param($stmt, "i", $id_provincia);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if (!$result) {
        throw new Exception("Error en la consulta: " . mysqli_stmt_error($stmt));
    }
    
    $comunas = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $comunas[] = [
            'idcomunas' => $row['idcomunas'],
            'nombre_comuna' => $row['nombre_comuna'],
            'idprovincias' => $row['idprovincias']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'comunas' => $comunas
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