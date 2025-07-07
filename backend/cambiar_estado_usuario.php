<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

try {
    include("config.php");
    
    $conexion = conectar();
    
    // Obtener datos del formulario
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        $input = $_POST;
    }
    
    if (empty($input['id']) || !isset($input['activo'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID de usuario y estado son requeridos']);
        exit;
    }
    
    $id_usuario = intval($input['id']);
    $activo = $input['activo'] ? 1 : 0;
    
    // Verificar que el usuario existe
    $sql_check = "SELECT id, nombres, ap_paterno FROM usuarios WHERE id = ?";
    $stmt_check = mysqli_prepare($conexion, $sql_check);
    mysqli_stmt_bind_param($stmt_check, "i", $id_usuario);
    mysqli_stmt_execute($stmt_check);
    $result_check = mysqli_stmt_get_result($stmt_check);
    
    if (mysqli_num_rows($result_check) === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Usuario no encontrado']);
        exit;
    }
    
    $usuario = mysqli_fetch_assoc($result_check);
    
    // Actualizar estado del usuario
    $sql = "UPDATE usuarios SET estado = ? WHERE id = ?";
    $stmt = mysqli_prepare($conexion, $sql);
    mysqli_stmt_bind_param($stmt, "ii", $activo, $id_usuario);
    
    if (mysqli_stmt_execute($stmt)) {
        $estado_texto = $activo ? 'activado' : 'desactivado';
        $nombre_completo = $usuario['nombres'] . ' ' . $usuario['ap_paterno'];
        
        echo json_encode([
            'success' => true,
            'message' => "Usuario $nombre_completo ha sido $estado_texto correctamente",
            'usuario' => [
                'id' => $id_usuario,
                'estado' => $activo ? 'Activo' : 'Inactivo',
                'activo' => $activo
            ]
        ]);
    } else {
        throw new Exception("Error al actualizar el estado del usuario");
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor: ' . $e->getMessage()
    ]);
}
?> 