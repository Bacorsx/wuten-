<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    include("config.php");
    
    $conexion = conectar();
    
    // Obtener parámetros de la petición
    $page = $_GET['page'] ?? $_POST['page'] ?? 1;
    $limit = $_GET['limit'] ?? $_POST['limit'] ?? 20;
    $tipo_usuario = $_GET['tipo_usuario'] ?? $_POST['tipo_usuario'] ?? '';
    $estado = $_GET['estado'] ?? $_POST['estado'] ?? '';
    $busqueda = $_GET['busqueda'] ?? $_POST['busqueda'] ?? '';
    
    $offset = ($page - 1) * $limit;
    
    $where_conditions = ["1=1"]; // Mostrar todos los usuarios (activos e inactivos)
    $params = [];
    $types = "";
    
    // Filtros
    if (!empty($tipo_usuario)) {
        $where_conditions[] = "u.tipoUsuario = ?";
        $params[] = $tipo_usuario;
        $types .= "s";
    }
    
    if (!empty($estado)) {
        $where_conditions[] = "u.estado = ?";
        $params[] = $estado === 'Activo' ? 1 : 0;
        $types .= "i";
    }
    
    if (!empty($busqueda)) {
        $where_conditions[] = "(u.nombres LIKE ? OR u.ap_paterno LIKE ? OR u.usuario LIKE ?)";
        $busqueda_param = "%" . $busqueda . "%";
        $params[] = $busqueda_param;
        $params[] = $busqueda_param;
        $params[] = $busqueda_param;
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
            u.foto,
            u.numeroBienRaiz,
            u.certificadoAntecedentes,
            CONCAT(u.nombres, ' ', u.ap_paterno, ' ', COALESCE(u.ap_materno, '')) as nombre_completo,
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
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor: ' . $e->getMessage()
    ]);
}
?> 