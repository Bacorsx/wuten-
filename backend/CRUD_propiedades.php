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
            listarPropiedades($conexion, $input);
            break;
        case 'crear':
            crearPropiedad($conexion, $input);
            break;
        case 'actualizar':
            actualizarPropiedad($conexion, $input);
            break;
        case 'eliminar':
            eliminarPropiedad($conexion, $input);
            break;
        case 'obtener':
            obtenerPropiedad($conexion, $input);
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

function listarPropiedades($conexion, $filtros) {
    $page = $filtros['page'] ?? 1;
    $limit = $filtros['limit'] ?? 20;
    $offset = ($page - 1) * $limit;
    
    $where_conditions = ["p.estado = 1"];
    $params = [];
    $types = "";
    
    // Filtros
    if (!empty($filtros['estado'])) {
        $where_conditions[] = "p.estado = ?";
        $params[] = $filtros['estado'] === 'Disponible' ? 1 : 0;
        $types .= "i";
    }
    
    if (!empty($filtros['tipo_propiedad'])) {
        $where_conditions[] = "tp.tipo = ?";
        $params[] = $filtros['tipo_propiedad'];
        $types .= "s";
    }
    
    if (!empty($filtros['comuna'])) {
        $where_conditions[] = "c.nombre_comuna LIKE ?";
        $params[] = "%" . $filtros['comuna'] . "%";
        $types .= "s";
    }
    
    if (!empty($filtros['precio_min'])) {
        $where_conditions[] = "p.precio_pesos >= ?";
        $params[] = $filtros['precio_min'];
        $types .= "i";
    }
    
    if (!empty($filtros['precio_max'])) {
        $where_conditions[] = "p.precio_pesos <= ?";
        $params[] = $filtros['precio_max'];
        $types .= "i";
    }
    
    $where_clause = implode(" AND ", $where_conditions);
    
    // Consulta para contar total
    $sql_count = "
        SELECT COUNT(*) as total
        FROM propiedades p
        INNER JOIN sectores s ON p.idsectores = s.idsectores
        INNER JOIN comunas c ON s.idcomunas = c.idcomunas
        INNER JOIN tipo_propiedad tp ON p.idtipo_propiedad = tp.idtipo_propiedad
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
            p.idpropiedades,
            p.titulopropiedad,
            p.precio_pesos,
            p.precio_uf,
            p.fecha_publicacion,
            p.estado,
            p.cant_domitorios as dormitorios,
            p.cant_banos as banos,
            p.area_construida as metros_cuadrados,
            c.nombre_comuna as comuna,
            pr.nombre_provincia as provincia,
            tp.tipo as tipo_propiedad,
            CONCAT(u.nombres, ' ', u.ap_paterno, ' ', u.ap_materno) as propietario_nombre,
            u.usuario as propietario_email
        FROM propiedades p
        INNER JOIN sectores s ON p.idsectores = s.idsectores
        INNER JOIN comunas c ON s.idcomunas = c.idcomunas
        INNER JOIN provincias pr ON c.idprovincias = pr.idprovincias
        INNER JOIN tipo_propiedad tp ON p.idtipo_propiedad = tp.idtipo_propiedad
        INNER JOIN usuarios u ON p.idusuario = u.id
        WHERE $where_clause
        ORDER BY p.fecha_publicacion DESC
        LIMIT ? OFFSET ?
    ";
    
    $stmt = mysqli_prepare($conexion, $sql);
    $params[] = $limit;
    $params[] = $offset;
    $types .= "ii";
    
    mysqli_stmt_bind_param($stmt, $types, ...$params);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    $propiedades = [];
    while ($row = mysqli_fetch_assoc($result)) {
        // Formatear estado
        $row['estado'] = $row['estado'] ? 'Disponible' : 'No disponible';
        $propiedades[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'propiedades' => $propiedades,
        'total' => $total,
        'page' => $page,
        'limit' => $limit,
        'total_pages' => ceil($total / $limit)
    ]);
}

function crearPropiedad($conexion, $datos) {
    // Validar datos requeridos
    $campos_requeridos = ['titulopropiedad', 'descripcion', 'precio_pesos', 'idtipo_propiedad', 'idsectores', 'idusuario'];
    foreach ($campos_requeridos as $campo) {
        if (empty($datos[$campo])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => "Campo requerido: $campo"]);
            return;
        }
    }
    
    $sql = "
        INSERT INTO propiedades (
            titulopropiedad, descripcion, cant_banos, cant_domitorios, 
            area_total, area_construida, precio_pesos, precio_uf, 
            fecha_publicacion, bodega, estacionamiento, logia, 
            cocinaamoblada, antejardin, patiotrasero, piscina, 
            idtipo_propiedad, idsectores, idusuario, estado
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    ";
    
    $stmt = mysqli_prepare($conexion, $sql);
    mysqli_stmt_bind_param($stmt, "ssiiiiidiiiiiiiiii", 
        $datos['titulopropiedad'],
        $datos['descripcion'],
        $datos['cant_banos'] ?? 0,
        $datos['cant_domitorios'] ?? 0,
        $datos['area_total'] ?? 0,
        $datos['area_construida'] ?? 0,
        $datos['precio_pesos'],
        $datos['precio_uf'] ?? 0,
        $datos['bodega'] ?? 0,
        $datos['estacionamiento'] ?? 0,
        $datos['logia'] ?? 0,
        $datos['cocinaamoblada'] ?? 0,
        $datos['antejardin'] ?? 0,
        $datos['patiotrasero'] ?? 0,
        $datos['piscina'] ?? 0,
        $datos['idtipo_propiedad'],
        $datos['idsectores'],
        $datos['idusuario']
    );
    
    if (mysqli_stmt_execute($stmt)) {
        $id_propiedad = mysqli_insert_id($conexion);
        echo json_encode([
            'success' => true,
            'message' => 'Propiedad creada exitosamente',
            'id_propiedad' => $id_propiedad
        ]);
    } else {
        throw new Exception("Error al crear propiedad: " . mysqli_stmt_error($stmt));
    }
}

function actualizarPropiedad($conexion, $datos) {
    if (empty($datos['id_propiedad'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID de propiedad requerido']);
        return;
    }
    
    // Preparar variables para evitar problemas de referencia
    $titulo = $datos['titulopropiedad'] ?? '';
    $descripcion = $datos['descripcion'] ?? '';
    $banos = $datos['cant_banos'] ?? 0;
    $dormitorios = $datos['cant_domitorios'] ?? 0;
    $area_total = $datos['area_total'] ?? 0;
    $area_construida = $datos['area_construida'] ?? 0;
    $precio_pesos = $datos['precio_pesos'] ?? 0;
    $precio_uf = $datos['precio_uf'] ?? 0;
    $bodega = $datos['bodega'] ?? 0;
    $estacionamiento = $datos['estacionamiento'] ?? 0;
    $logia = $datos['logia'] ?? 0;
    $cocina_amoblada = $datos['cocinaamoblada'] ?? 0;
    $antejardin = $datos['antejardin'] ?? 0;
    $patio_trasero = $datos['patiotrasero'] ?? 0;
    $piscina = $datos['piscina'] ?? 0;
    $estado = ($datos['estado'] === 'Disponible') ? 1 : 0;
    $tipo_propiedad = $datos['idtipo_propiedad'] ?? 1;
    $sector = $datos['idsectores'] ?? 1;
    $id_propiedad = $datos['id_propiedad'];
    
    $sql = "
        UPDATE propiedades SET 
            titulopropiedad = ?, 
            descripcion = ?, 
            cant_banos = ?, 
            cant_domitorios = ?, 
            area_total = ?, 
            area_construida = ?, 
            precio_pesos = ?, 
            precio_uf = ?, 
            bodega = ?, 
            estacionamiento = ?, 
            logia = ?, 
            cocinaamoblada = ?, 
            antejardin = ?, 
            patiotrasero = ?, 
            piscina = ?, 
            estado = ?, 
            idtipo_propiedad = ?, 
            idsectores = ?
        WHERE idpropiedades = ?
    ";
    
    $stmt = mysqli_prepare($conexion, $sql);
    mysqli_stmt_bind_param($stmt, "ssiiiiidiiiiiiiiii", 
        $titulo,
        $descripcion,
        $banos,
        $dormitorios,
        $area_total,
        $area_construida,
        $precio_pesos,
        $precio_uf,
        $bodega,
        $estacionamiento,
        $logia,
        $cocina_amoblada,
        $antejardin,
        $patio_trasero,
        $piscina,
        $estado,
        $tipo_propiedad,
        $sector,
        $id_propiedad
    );
    
    if (mysqli_stmt_execute($stmt)) {
        echo json_encode([
            'success' => true,
            'message' => 'Propiedad actualizada exitosamente'
        ]);
    } else {
        throw new Exception("Error al actualizar propiedad: " . mysqli_stmt_error($stmt));
    }
}

function eliminarPropiedad($conexion, $datos) {
    if (empty($datos['id_propiedad'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID de propiedad requerido']);
        return;
    }
    
    // Soft delete - cambiar estado a 0
    $sql = "UPDATE propiedades SET estado = 0 WHERE idpropiedades = ?";
    $stmt = mysqli_prepare($conexion, $sql);
    mysqli_stmt_bind_param($stmt, "i", $datos['id_propiedad']);
    
    if (mysqli_stmt_execute($stmt)) {
        echo json_encode([
            'success' => true,
            'message' => 'Propiedad eliminada exitosamente'
        ]);
    } else {
        throw new Exception("Error al eliminar propiedad: " . mysqli_stmt_error($stmt));
    }
}

function obtenerPropiedad($conexion, $datos) {
    if (empty($datos['id_propiedad'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID de propiedad requerido']);
        return;
    }
    
    $sql = "
        SELECT 
            p.*,
            tp.tipo as tipo_propiedad,
            c.nombre_comuna,
            pr.nombre_provincia,
            r.nombre_region,
            s.nombre_sector,
            CONCAT(u.nombres, ' ', u.ap_paterno, ' ', u.ap_materno) as propietario_nombre,
            u.usuario as propietario_email
        FROM propiedades p
        INNER JOIN sectores s ON p.idsectores = s.idsectores
        INNER JOIN comunas c ON s.idcomunas = c.idcomunas
        INNER JOIN provincias pr ON c.idprovincias = pr.idprovincias
        INNER JOIN regiones r ON pr.idregion = r.idregion
        INNER JOIN tipo_propiedad tp ON p.idtipo_propiedad = tp.idtipo_propiedad
        INNER JOIN usuarios u ON p.idusuario = u.id
        WHERE p.idpropiedades = ? AND p.estado = 1
    ";
    
    $stmt = mysqli_prepare($conexion, $sql);
    mysqli_stmt_bind_param($stmt, "i", $datos['id_propiedad']);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    $propiedad = mysqli_fetch_assoc($result);
    
    if (!$propiedad) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Propiedad no encontrada']);
        return;
    }
    
    echo json_encode([
        'success' => true,
        'propiedad' => $propiedad
    ]);
}

mysqli_close($conexion);
?> 