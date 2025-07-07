<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include("config.php");

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $correo = $input["usuario"] ?? '';
    $clave = $input["clave"] ?? '';

    if (empty($correo) || empty($clave)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Usuario y contraseña son requeridos'
        ]);
        exit;
    }

    $conexion = conectar();

    $sql = "SELECT id, nombres, ap_paterno, ap_materno, usuario, contrasenaHash, tipoUsuario, estado FROM usuarios WHERE usuario = ? AND estado = 1";
    $stmt = mysqli_prepare($conexion, $sql);
    mysqli_stmt_bind_param($stmt, "s", $correo);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    if ($datos = mysqli_fetch_assoc($result)) {
        if (password_verify($clave, $datos['contrasenaHash'])) {
            $nombreCompleto = $datos['nombres'] . ' ' . $datos['ap_paterno'] . ' ' . $datos['ap_materno'];
            
            echo json_encode([
                'success' => true,
                'user' => [
                    'id' => $datos['id'],
                    'nombre' => trim($nombreCompleto),
                    'usuario' => $datos['usuario'],
                    'tipoUsuario' => $datos['tipoUsuario'],
                    'imagen' => '/img/usuarios/comodin.png'
                ],
                'message' => 'Login exitoso'
            ]);
        } else {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'Contraseña incorrecta'
            ]);
        }
    } else {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Usuario no encontrado o inactivo'
        ]);
    }

    mysqli_stmt_close($stmt);
    mysqli_close($conexion);
} else {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido'
    ]);
}
?> 