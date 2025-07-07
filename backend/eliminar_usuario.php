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
    
    if (empty($input['id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID de usuario es requerido']);
        exit;
    }
    
    $id_usuario = intval($input['id']);
    
    // Verificar que el usuario existe
    $sql_check = "SELECT id, nombres, ap_paterno, tipoUsuario FROM usuarios WHERE id = ?";
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
    
    // Verificar si el usuario tiene propiedades asociadas
    $sql_propiedades = "SELECT COUNT(*) as total FROM propiedades WHERE idusuario = ?";
    $stmt_propiedades = mysqli_prepare($conexion, $sql_propiedades);
    mysqli_stmt_bind_param($stmt_propiedades, "i", $id_usuario);
    mysqli_stmt_execute($stmt_propiedades);
    $result_propiedades = mysqli_stmt_get_result($stmt_propiedades);
    $propiedades_count = mysqli_fetch_assoc($result_propiedades)['total'];
    
    if ($propiedades_count > 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false, 
            'message' => "No se puede eliminar el usuario porque tiene $propiedades_count propiedades asociadas"
        ]);
        exit;
    }
    
    // Eliminar usuario
    $sql = "DELETE FROM usuarios WHERE id = ?";
    $stmt = mysqli_prepare($conexion, $sql);
    mysqli_stmt_bind_param($stmt, "i", $id_usuario);
    
    if (mysqli_stmt_execute($stmt)) {
        $nombre_completo = $usuario['nombres'] . ' ' . $usuario['ap_paterno'];
        
        echo json_encode([
            'success' => true,
            'message' => "Usuario $nombre_completo ha sido eliminado correctamente",
            'usuario' => [
                'id' => $id_usuario,
                'nombre' => $nombre_completo
            ]
        ]);
    } else {
        throw new Exception("Error al eliminar el usuario");
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor: ' . $e->getMessage()
    ]);
}
?> 