<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    include("config.php");
    
    $conexion = conectar();
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? $_POST['action'] ?? 'listar';
    
    switch ($action) {
        case 'listar':
            listarUsuarios($conexion, $input);
            break;
        case 'crear':
            crearUsuario($conexion, $input);
            break;
        case 'actualizar':
            actualizarUsuario($conexion, $input);
            break;
        case 'eliminar':
            eliminarUsuario($conexion, $input);
            break;
        case 'obtener':
            obtenerUsuario($conexion, $input);
            break;
        case 'cambiar_estado':
            cambiarEstadoUsuario($conexion, $input);
            break;
        case 'subir_imagen':
            subirImagenUsuario($conexion, $input);
            break;
        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Acción no válida']);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor: ' . $e->getMessage()
    ]);
}

function listarUsuarios($conexion, $filtros) {
    $page = $filtros['page'] ?? 1;
    $limit = $filtros['limit'] ?? 20;
    $offset = ($page - 1) * $limit;
    
    $where_conditions = ["1=1"]; // Mostrar todos los usuarios (activos e inactivos)
    $params = [];
    $types = "";
    
    // Filtros
    if (!empty($filtros['tipo_usuario'])) {
        $where_conditions[] = "u.tipoUsuario = ?";
        $params[] = $filtros['tipo_usuario'];
        $types .= "s";
    }
    
    if (!empty($filtros['estado'])) {
        $where_conditions[] = "u.estado = ?";
        $params[] = $filtros['estado'] === 'Activo' ? 1 : 0;
        $types .= "i";
    }
    
    if (!empty($filtros['busqueda'])) {
        $where_conditions[] = "(u.nombres LIKE ? OR u.ap_paterno LIKE ? OR u.usuario LIKE ?)";
        $busqueda = "%" . $filtros['busqueda'] . "%";
        $params[] = $busqueda;
        $params[] = $busqueda;
        $params[] = $busqueda;
        $types .= "sss";
    }
    
    $where_clause = implode(" AND ", $where_conditions);
    
    // Consulta para contar total
    $sql_count = "
        SELECT COUNT(*) as total
        FROM usuarios u
        WHERE $where_clause
    ";
    
    $stmt_count = mysqli_prepare($conexion, $sql_count);
    if (!empty($params)) {
        mysqli_stmt_bind_param($stmt_count, $types, ...$params);
    }
    mysqli_stmt_execute($stmt_count);
    $result_count = mysqli_stmt_get_result($stmt_count);
    $total = mysqli_fetch_assoc($result_count)['total'];
    
    // Consulta principal
    $sql = "
        SELECT 
            u.id,
            u.nombres,
            u.ap_paterno,
            u.ap_materno,
            u.usuario as email,
            u.tipoUsuario as tipo_usuario,
            u.estado,
            u.numeroBienRaiz,
            u.certificadoAntecedentes,
            CONCAT(u.nombres, ' ', u.ap_paterno, ' ', u.ap_materno) as nombre_completo,
            (SELECT COUNT(*) FROM propiedades p WHERE p.idusuario = u.id AND p.estado = 1) as propiedades_count
        FROM usuarios u
        WHERE $where_clause
        ORDER BY u.estado ASC, u.id DESC
        LIMIT ? OFFSET ?
    ";
    
    $stmt = mysqli_prepare($conexion, $sql);
    $params[] = $limit;
    $params[] = $offset;
    $types .= "ii";
    
    mysqli_stmt_bind_param($stmt, $types, ...$params);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    $usuarios = [];
    while ($row = mysqli_fetch_assoc($result)) {
        // Formatear datos
        $row['estado'] = $row['estado'] ? 'Activo' : 'Inactivo';
        $row['id_usuario'] = $row['id'];
        $row['nombre'] = $row['nombre_completo'];
        $usuarios[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'usuarios' => $usuarios,
        'total' => $total,
        'page' => $page,
        'limit' => $limit,
        'total_pages' => ceil($total / $limit)
    ]);
}

function crearUsuario($conexion, $datos) {
    // Validar datos requeridos
    $campos_requeridos = ['nombres', 'ap_paterno', 'usuario', 'contrasena', 'tipo_usuario'];
    foreach ($campos_requeridos as $campo) {
        if (empty($datos[$campo])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => "Campo requerido: $campo"]);
            return;
        }
    }
    
    // Verificar si el email ya existe
    $sql_check = "SELECT id FROM usuarios WHERE usuario = ?";
    $stmt_check = mysqli_prepare($conexion, $sql_check);
    mysqli_stmt_bind_param($stmt_check, "s", $datos['usuario']);
    mysqli_stmt_execute($stmt_check);
    $result_check = mysqli_stmt_get_result($stmt_check);
    
    if (mysqli_num_rows($result_check) > 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'El email ya está registrado']);
        return;
    }
    
    // Hash de la contraseña
    $contrasena_hash = password_hash($datos['contrasena'], PASSWORD_DEFAULT);
    
    $sql = "
        INSERT INTO usuarios (
            nombres, ap_paterno, ap_materno, usuario, contrasenaHash, 
            tipoUsuario, estado
        ) VALUES (?, ?, ?, ?, ?, ?, 1)
    ";
    
    $stmt = mysqli_prepare($conexion, $sql);
    mysqli_stmt_bind_param($stmt, "ssssss", 
        $datos['nombres'],
        $datos['ap_paterno'],
        $datos['ap_materno'] ?? '',
        $datos['usuario'],
        $contrasena_hash,
        $datos['tipo_usuario']
    );
    
    if (mysqli_stmt_execute($stmt)) {
        $id_usuario = mysqli_insert_id($conexion);
        echo json_encode([
            'success' => true,
            'message' => 'Usuario creado exitosamente',
            'id_usuario' => $id_usuario
        ]);
    } else {
        throw new Exception("Error al crear usuario: " . mysqli_stmt_error($stmt));
    }
}

function actualizarUsuario($conexion, $datos) {
    if (empty($datos['id_usuario'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID de usuario requerido']);
        return;
    }
    
    // Verificar si el email ya existe en otro usuario
    if (!empty($datos['usuario'])) {
        $sql_check = "SELECT id FROM usuarios WHERE usuario = ? AND id != ?";
        $stmt_check = mysqli_prepare($conexion, $sql_check);
        mysqli_stmt_bind_param($stmt_check, "si", $datos['usuario'], $datos['id_usuario']);
        mysqli_stmt_execute($stmt_check);
        $result_check = mysqli_stmt_get_result($stmt_check);
        
        if (mysqli_num_rows($result_check) > 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'El email ya está registrado por otro usuario']);
            return;
        }
    }
    
    $sql = "
        UPDATE usuarios SET 
            nombres = ?, 
            ap_paterno = ?, 
            ap_materno = ?, 
            usuario = ?, 
            tipoUsuario = ?
        WHERE id = ?
    ";
    
    $stmt = mysqli_prepare($conexion, $sql);
    mysqli_stmt_bind_param($stmt, "sssssi", 
        $datos['nombres'],
        $datos['ap_paterno'],
        $datos['ap_materno'] ?? '',
        $datos['usuario'],
        $datos['tipo_usuario'],
        $datos['id_usuario']
    );
    
    if (mysqli_stmt_execute($stmt)) {
        echo json_encode([
            'success' => true,
            'message' => 'Usuario actualizado exitosamente'
        ]);
    } else {
        throw new Exception("Error al actualizar usuario: " . mysqli_stmt_error($stmt));
    }
}

function eliminarUsuario($conexion, $datos) {
    if (empty($datos['id_usuario'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID de usuario requerido']);
        return;
    }
    
    // Soft delete - cambiar estado a 0
    $sql = "UPDATE usuarios SET estado = 0 WHERE id = ?";
    $stmt = mysqli_prepare($conexion, $sql);
    mysqli_stmt_bind_param($stmt, "i", $datos['id_usuario']);
    
    if (mysqli_stmt_execute($stmt)) {
        echo json_encode([
            'success' => true,
            'message' => 'Usuario eliminado exitosamente'
        ]);
    } else {
        throw new Exception("Error al eliminar usuario: " . mysqli_stmt_error($stmt));
    }
}

function obtenerUsuario($conexion, $datos) {
    if (empty($datos['id_usuario'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID de usuario requerido']);
        return;
    }
    
    $sql = "
        SELECT 
            u.*,
            CONCAT(u.nombres, ' ', u.ap_paterno, ' ', u.ap_materno) as nombre_completo,
            (SELECT COUNT(*) FROM propiedades p WHERE p.idusuario = u.id AND p.estado = 1) as propiedades_count
        FROM usuarios u
        WHERE u.id = ? AND u.estado = 1
    ";
    
    $stmt = mysqli_prepare($conexion, $sql);
    mysqli_stmt_bind_param($stmt, "i", $datos['id_usuario']);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    $usuario = mysqli_fetch_assoc($result);
    
    if (!$usuario) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Usuario no encontrado']);
        return;
    }
    
    // Formatear datos
    $usuario['estado'] = $usuario['estado'] ? 'Activo' : 'Inactivo';
    $usuario['activo'] = $usuario['estado'] == 1;
    
    echo json_encode([
        'success' => true,
        'usuario' => $usuario
    ]);
}

function cambiarEstadoUsuario($conexion, $datos) {
    if (empty($datos['id_usuario']) || !isset($datos['activo'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID de usuario y estado requeridos']);
        return;
    }
    
    $estado = $datos['activo'] ? 1 : 0;
    $estado_texto = $datos['activo'] ? 'activado' : 'desactivado';
    
    $sql = "UPDATE usuarios SET estado = ? WHERE id = ?";
    $stmt = mysqli_prepare($conexion, $sql);
    mysqli_stmt_bind_param($stmt, "ii", $estado, $datos['id_usuario']);
    
    if (mysqli_stmt_execute($stmt)) {
        echo json_encode([
            'success' => true,
            'message' => "Usuario $estado_texto exitosamente"
        ]);
    } else {
        throw new Exception("Error al cambiar estado del usuario: " . mysqli_stmt_error($stmt));
    }
}

function subirImagenUsuario($conexion, $datos) {
    if (empty($datos['id_usuario']) || empty($_FILES['imagen'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID de usuario e imagen requeridos']);
        return;
    }
    
    $id_usuario = $datos['id_usuario'];
    $archivo = $_FILES['imagen'];
    
    // Validar archivo
    $tipos_permitidos = ['image/jpeg', 'image/png', 'image/gif'];
    if (!in_array($archivo['type'], $tipos_permitidos)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Tipo de archivo no permitido']);
        return;
    }
    
    // Verificar si el usuario existe
    $sql_check_user = "SELECT id FROM usuarios WHERE id = ?";
    $stmt_check_user = mysqli_prepare($conexion, $sql_check_user);
    mysqli_stmt_bind_param($stmt_check_user, "i", $id_usuario);
    mysqli_stmt_execute($stmt_check_user);
    $result_check_user = mysqli_stmt_get_result($stmt_check_user);
    
    if (mysqli_num_rows($result_check_user) == 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Usuario no encontrado']);
        return;
    }
    
    // Obtener el siguiente número de archivo para este usuario
    $sql_count = "SELECT COUNT(*) as total FROM usuarios WHERE id = ? AND foto != ''";
    $stmt_count = mysqli_prepare($conexion, $sql_count);
    mysqli_stmt_bind_param($stmt_count, "i", $id_usuario);
    mysqli_stmt_execute($stmt_count);
    $result_count = mysqli_stmt_get_result($stmt_count);
    $total_archivos = mysqli_fetch_assoc($result_count)['total'];
    
    // Generar nombre único con numeración secuencial
    $extension = pathinfo($archivo['name'], PATHINFO_EXTENSION);
    $numero_archivo = $total_archivos + 1;
    $nombre_archivo = "usuario_{$id_usuario}_imagen_{$numero_archivo}.{$extension}";
    $ruta_destino = '../public/img/usuarios/' . $nombre_archivo;
    
    // Crear directorio si no existe
    if (!is_dir('../public/img/usuarios/')) {
        mkdir('../public/img/usuarios/', 0777, true);
    }
    
    // Mover archivo
    if (move_uploaded_file($archivo['tmp_name'], $ruta_destino)) {
        // Actualizar la foto del usuario en la base de datos
        $sql = "UPDATE usuarios SET foto = ? WHERE id = ?";
        $stmt = mysqli_prepare($conexion, $sql);
        mysqli_stmt_bind_param($stmt, "si", $nombre_archivo, $id_usuario);
        
        if (mysqli_stmt_execute($stmt)) {
            echo json_encode([
                'success' => true,
                'message' => 'Imagen de usuario subida exitosamente',
                'nombre_archivo' => $nombre_archivo
            ]);
        } else {
            throw new Exception("Error al guardar imagen en base de datos");
        }
    } else {
        throw new Exception("Error al subir archivo");
    }
}

mysqli_close($conexion);
?> 