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
    
    $id_comuna = $_GET['id_comuna'] ?? null;
    
    if (!$id_comuna) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'ID de comuna requerido'
        ]);
        exit;
    }
    
    $sql = "SELECT idsectores, nombre_sector, idcomunas FROM sectores WHERE idcomunas = ? ORDER BY nombre_sector";
    $stmt = mysqli_prepare($conexion, $sql);
    mysqli_stmt_bind_param($stmt, "i", $id_comuna);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if (!$result) {
        throw new Exception("Error en la consulta: " . mysqli_stmt_error($stmt));
    }
    
    $sectores = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $sectores[] = [
            'idsectores' => $row['idsectores'],
            'nombre_sector' => $row['nombre_sector'],
            'idcomunas' => $row['idcomunas']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'sectores' => $sectores
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