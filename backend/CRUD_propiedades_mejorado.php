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
    
    // Debug: Log all incoming data
    error_log("DEBUG - REQUEST_METHOD: " . $_SERVER['REQUEST_METHOD']);
    error_log("DEBUG - CONTENT_TYPE: " . ($_SERVER['CONTENT_TYPE'] ?? 'not set'));
    error_log("DEBUG - POST data: " . json_encode($_POST));
    error_log("DEBUG - FILES data: " . json_encode($_FILES));
    error_log("DEBUG - php://input: " . file_get_contents('php://input'));
    
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? $_POST['action'] ?? 'listar';
    
    // Para multipart/form-data, usar $_POST en lugar de $input
    $requestData = ($_SERVER['CONTENT_TYPE'] && strpos($_SERVER['CONTENT_TYPE'], 'multipart/form-data') !== false) ? $_POST : $input;
    
    error_log("DEBUG - Action determined: " . $action);
    error_log("DEBUG - Input data: " . json_encode($input));
    error_log("DEBUG - Request data: " . json_encode($requestData));
    
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
        case 'subir_imagen':
            subirImagen($conexion, $requestData);
            break;
        case 'eliminar_imagen':
            eliminarImagen($conexion, $requestData);
            break;
        case 'cambiar_imagen_principal':
            cambiarImagenPrincipal($conexion, $requestData);
            break;
        case 'ocultar_imagen':
            ocultarImagen($conexion, $requestData);
            break;
        case 'mostrar_imagen':
            mostrarImagen($conexion, $requestData);
            break;
        case 'cambiar_estado':
            cambiarEstado($conexion, $input);
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
            r.nombre_region as region,
            tp.tipo as tipo_propiedad,
            CONCAT(u.nombres, ' ', u.ap_paterno, ' ', u.ap_materno) as propietario_nombre,
            u.usuario as propietario_email,
            (SELECT COUNT(*) FROM galeria g WHERE g.idpropiedades = p.idpropiedades AND g.estado = 1) as total_imagenes
        FROM propiedades p
        INNER JOIN sectores s ON p.idsectores = s.idsectores
        INNER JOIN comunas c ON s.idcomunas = c.idcomunas
        INNER JOIN provincias pr ON c.idprovincias = pr.idprovincias
        INNER JOIN regiones r ON pr.idregion = r.idregion
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
    // Debug: Log de datos recibidos
    error_log("DEBUG - Datos recibidos en crearPropiedad: " . json_encode($datos));
    
    // Validar datos requeridos
    $campos_requeridos = ['titulopropiedad', 'descripcion', 'precio_pesos', 'idtipo_propiedad', 'idsectores', 'idusuario'];
    foreach ($campos_requeridos as $campo) {
        if (empty($datos[$campo])) {
            error_log("DEBUG - Campo requerido faltante: $campo");
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => "Campo requerido: $campo"]);
            return;
        }
    }
    
    // Usar el estado enviado desde el frontend (1 = Disponible, 0 = No publicar)
    $estado = isset($datos['estado']) ? intval($datos['estado']) : 1;
    error_log("DEBUG - Estado de la propiedad: $estado");
    
    // Preparar todas las variables antes de bind_param
    $titulo = $datos['titulopropiedad'];
    $descripcion = $datos['descripcion'];
    $cant_banos = intval($datos['cant_banos'] ?? 0);
    $cant_domitorios = intval($datos['cant_domitorios'] ?? 0);
    $area_total = intval($datos['area_total'] ?? 0);
    $area_construida = intval($datos['area_construida'] ?? 0);
    $precio_pesos = intval($datos['precio_pesos']);
    $precio_uf = floatval($datos['precio_uf'] ?? 0);
    $bodega = intval($datos['bodega'] ?? 0);
    $estacionamiento = intval($datos['estacionamiento'] ?? 0);
    $logia = intval($datos['logia'] ?? 0);
    $cocinaamoblada = intval($datos['cocinaamoblada'] ?? 0);
    $antejardin = intval($datos['antejardin'] ?? 0);
    $patiotrasero = intval($datos['patiotrasero'] ?? 0);
    $piscina = intval($datos['piscina'] ?? 0);
    $idtipo_propiedad = intval($datos['idtipo_propiedad']);
    $idsectores = intval($datos['idsectores']);
    $idusuario = intval($datos['idusuario']);
    
    $sql = "
        INSERT INTO propiedades (
            titulopropiedad, descripcion, cant_banos, cant_domitorios, 
            area_total, area_construida, precio_pesos, precio_uf, 
            fecha_publicacion, bodega, estacionamiento, logia, 
            cocinaamoblada, antejardin, patiotrasero, piscina, 
            idtipo_propiedad, idsectores, idusuario, estado
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ";
    
    error_log("DEBUG - SQL preparado: $sql");
    
    $stmt = mysqli_prepare($conexion, $sql);
    if (!$stmt) {
        error_log("DEBUG - Error preparando statement: " . mysqli_error($conexion));
        throw new Exception("Error preparando statement: " . mysqli_error($conexion));
    }
    
    mysqli_stmt_bind_param($stmt, "ssiiiiidiiiiiiiiiii", 
        $titulo,
        $descripcion,
        $cant_banos,
        $cant_domitorios,
        $area_total,
        $area_construida,
        $precio_pesos,
        $precio_uf,
        $bodega,
        $estacionamiento,
        $logia,
        $cocinaamoblada,
        $antejardin,
        $patiotrasero,
        $piscina,
        $idtipo_propiedad,
        $idsectores,
        $idusuario,
        $estado
    );
    
    error_log("DEBUG - Intentando ejecutar statement");
    
    if (mysqli_stmt_execute($stmt)) {
        $id_propiedad = mysqli_insert_id($conexion);
        error_log("DEBUG - Propiedad creada exitosamente con ID: $id_propiedad");
        echo json_encode([
            'success' => true,
            'message' => 'Propiedad creada exitosamente',
            'id_propiedad' => $id_propiedad
        ]);
    } else {
        $error = mysqli_stmt_error($stmt);
        error_log("DEBUG - Error al crear propiedad: $error");
        throw new Exception("Error al crear propiedad: $error");
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
            p.idusuario,
            tp.tipo as tipo_propiedad,
            c.nombre_comuna,
            pr.nombre_provincia,
            r.nombre_region,
            s.nombre_sector,
            s.idsectores,
            c.idcomunas,
            pr.idprovincias,
            r.idregion,
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
    
    // Obtener imágenes de la propiedad
    $sql_imagenes = "
        SELECT idgaleria as id, foto as nombre_archivo, principal as es_principal, estado, idgaleria as orden
        FROM galeria 
        WHERE idpropiedades = ?
        ORDER BY principal DESC, idgaleria ASC
    ";
    
    $stmt_imagenes = mysqli_prepare($conexion, $sql_imagenes);
    mysqli_stmt_bind_param($stmt_imagenes, "i", $datos['id_propiedad']);
    mysqli_stmt_execute($stmt_imagenes);
    $result_imagenes = mysqli_stmt_get_result($stmt_imagenes);
    
    $imagenes = [];
    while ($imagen = mysqli_fetch_assoc($result_imagenes)) {
        $imagenes[] = $imagen;
    }
    
    $propiedad['imagenes'] = $imagenes;
    
    echo json_encode([
        'success' => true,
        'propiedad' => $propiedad
    ]);
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

function cambiarEstado($conexion, $datos) {
    if (empty($datos['id_propiedad']) || !isset($datos['estado'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID de propiedad y estado requeridos']);
        return;
    }
    
    $estado = $datos['estado'] === 'Disponible' ? 1 : 0;
    $estado_texto = $datos['estado'] === 'Disponible' ? 'publicada' : 'oculta';
    
    $sql = "UPDATE propiedades SET estado = ? WHERE idpropiedades = ?";
    $stmt = mysqli_prepare($conexion, $sql);
    mysqli_stmt_bind_param($stmt, "ii", $estado, $datos['id_propiedad']);
    
    if (mysqli_stmt_execute($stmt)) {
        echo json_encode([
            'success' => true,
            'message' => "Propiedad $estado_texto exitosamente"
        ]);
    } else {
        throw new Exception("Error al cambiar estado de la propiedad: " . mysqli_stmt_error($stmt));
    }
}

function subirImagen($conexion, $datos) {
    error_log("DEBUG - Iniciando subirImagen");
    error_log("DEBUG - Datos recibidos: " . json_encode($datos));
    error_log("DEBUG - FILES: " . json_encode($_FILES));
    
    if (empty($datos['id_propiedad']) || empty($_FILES['imagen'])) {
        error_log("DEBUG - Error: ID de propiedad o imagen faltante");
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID de propiedad e imagen requeridos']);
        return;
    }
    
    $id_propiedad = $datos['id_propiedad'];
    $archivo = $_FILES['imagen'];
    
    error_log("DEBUG - ID Propiedad: $id_propiedad");
    error_log("DEBUG - Archivo: " . json_encode($archivo));
    
    // Validar archivo
    $tipos_permitidos = ['image/jpeg', 'image/png', 'image/gif'];
    if (!in_array($archivo['type'], $tipos_permitidos)) {
        error_log("DEBUG - Error: Tipo de archivo no permitido: " . $archivo['type']);
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Tipo de archivo no permitido']);
        return;
    }
    
    // Obtener el nombre de la propiedad
    $sql_nombre = "SELECT titulopropiedad FROM propiedades WHERE idpropiedades = ?";
    $stmt_nombre = mysqli_prepare($conexion, $sql_nombre);
    mysqli_stmt_bind_param($stmt_nombre, "i", $id_propiedad);
    mysqli_stmt_execute($stmt_nombre);
    $result_nombre = mysqli_stmt_get_result($stmt_nombre);
    $propiedad = mysqli_fetch_assoc($result_nombre);
    
    if (!$propiedad) {
        error_log("DEBUG - Error: Propiedad no encontrada con ID: $id_propiedad");
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Propiedad no encontrada']);
        return;
    }
    
    error_log("DEBUG - Propiedad encontrada: " . $propiedad['titulopropiedad']);
    
    // Limpiar el nombre de la propiedad para usarlo en el nombre del archivo
    $nombre_propiedad = preg_replace('/[^a-zA-Z0-9]/', '_', $propiedad['titulopropiedad']);
    $nombre_propiedad = strtolower($nombre_propiedad);
    $nombre_propiedad = substr($nombre_propiedad, 0, 30); // Limitar a 30 caracteres
    
    // Obtener el siguiente número de archivo para esta propiedad
    $sql_count = "SELECT COUNT(*) as total FROM galeria WHERE idpropiedades = ?";
    $stmt_count = mysqli_prepare($conexion, $sql_count);
    mysqli_stmt_bind_param($stmt_count, "i", $id_propiedad);
    mysqli_stmt_execute($stmt_count);
    $result_count = mysqli_stmt_get_result($stmt_count);
    $total_archivos = mysqli_fetch_assoc($result_count)['total'];
    
    // Generar nombre único con nombre de propiedad + numeración secuencial
    $extension = pathinfo($archivo['name'], PATHINFO_EXTENSION);
    $numero_archivo = $total_archivos + 1;
    $nombre_archivo = "{$nombre_propiedad}_{$numero_archivo}.{$extension}";
    $ruta_destino = '../public/img/propiedades/' . $nombre_archivo;
    
    error_log("DEBUG - Nombre archivo: $nombre_archivo");
    error_log("DEBUG - Ruta destino: $ruta_destino");
    
    // Crear directorio si no existe
    if (!is_dir('../public/img/propiedades/')) {
        error_log("DEBUG - Creando directorio: ../public/img/propiedades/");
        mkdir('../public/img/propiedades/', 0777, true);
    }
    
    // Mover archivo
    if (move_uploaded_file($archivo['tmp_name'], $ruta_destino)) {
        error_log("DEBUG - Archivo movido exitosamente");
        
        // Verificar si es la primera imagen (será principal)
        $sql_check = "SELECT COUNT(*) as total FROM galeria WHERE idpropiedades = ?";
        $stmt_check = mysqli_prepare($conexion, $sql_check);
        mysqli_stmt_bind_param($stmt_check, "i", $id_propiedad);
        mysqli_stmt_execute($stmt_check);
        $result_check = mysqli_stmt_get_result($stmt_check);
        $total = mysqli_fetch_assoc($result_check)['total'];
        
        $es_principal = $total == 0 ? 1 : 0;
        
        error_log("DEBUG - Es principal: $es_principal");
        
        // Insertar en base de datos
        $sql = "INSERT INTO galeria (idpropiedades, foto, principal, estado) VALUES (?, ?, ?, 1)";
        $stmt = mysqli_prepare($conexion, $sql);
        mysqli_stmt_bind_param($stmt, "isi", $id_propiedad, $nombre_archivo, $es_principal);
        
        if (mysqli_stmt_execute($stmt)) {
            $id_imagen = mysqli_insert_id($conexion);
            error_log("DEBUG - Imagen guardada en BD con ID: $id_imagen");
            echo json_encode([
                'success' => true,
                'message' => 'Imagen subida exitosamente',
                'id_imagen' => $id_imagen,
                'nombre_archivo' => $nombre_archivo,
                'es_principal' => $es_principal
            ]);
        } else {
            $error = mysqli_stmt_error($stmt);
            error_log("DEBUG - Error al guardar en BD: $error");
            throw new Exception("Error al guardar imagen en base de datos: $error");
        }
    } else {
        error_log("DEBUG - Error al mover archivo");
        throw new Exception("Error al subir archivo");
    }
}

function eliminarImagen($conexion, $datos) {
    if (empty($datos['id_imagen'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID de imagen requerido']);
        return;
    }
    
    // Obtener información de la imagen
    $sql_get = "SELECT foto, principal, idpropiedades FROM galeria WHERE idgaleria = ?";
    $stmt_get = mysqli_prepare($conexion, $sql_get);
    mysqli_stmt_bind_param($stmt_get, "i", $datos['id_imagen']);
    mysqli_stmt_execute($stmt_get);
    $result_get = mysqli_stmt_get_result($stmt_get);
    $imagen = mysqli_fetch_assoc($result_get);
    
    if (!$imagen) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Imagen no encontrada']);
        return;
    }
    
    // Eliminar archivo físico
    $ruta_archivo = '../public/img/propiedades/' . $imagen['foto'];
    if (file_exists($ruta_archivo)) {
        unlink($ruta_archivo);
    }
    
    // Eliminar de base de datos
    $sql = "DELETE FROM galeria WHERE idgaleria = ?";
    $stmt = mysqli_prepare($conexion, $sql);
    mysqli_stmt_bind_param($stmt, "i", $datos['id_imagen']);
    
    if (mysqli_stmt_execute($stmt)) {
        // Si era la imagen principal, hacer principal la siguiente
        if ($imagen['principal']) {
            $sql_next = "UPDATE galeria SET principal = 1 WHERE idpropiedades = ? ORDER BY idgaleria ASC LIMIT 1";
            $stmt_next = mysqli_prepare($conexion, $sql_next);
            mysqli_stmt_bind_param($stmt_next, "i", $imagen['idpropiedades']);
            mysqli_stmt_execute($stmt_next);
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Imagen eliminada exitosamente'
        ]);
    } else {
        throw new Exception("Error al eliminar imagen de base de datos");
    }
}

function cambiarImagenPrincipal($conexion, $datos) {
    if (empty($datos['id_imagen']) || empty($datos['id_propiedad'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID de imagen y propiedad requeridos']);
        return;
    }
    
    // Quitar principal de todas las imágenes de la propiedad
    $sql_reset = "UPDATE galeria SET principal = 0 WHERE idpropiedades = ?";
    $stmt_reset = mysqli_prepare($conexion, $sql_reset);
    mysqli_stmt_bind_param($stmt_reset, "i", $datos['id_propiedad']);
    mysqli_stmt_execute($stmt_reset);
    
    // Establecer nueva imagen principal
    $sql_set = "UPDATE galeria SET principal = 1 WHERE idgaleria = ?";
    $stmt_set = mysqli_prepare($conexion, $sql_set);
    mysqli_stmt_bind_param($stmt_set, "i", $datos['id_imagen']);
    
    if (mysqli_stmt_execute($stmt_set)) {
        echo json_encode([
            'success' => true,
            'message' => 'Imagen principal cambiada exitosamente'
        ]);
    } else {
        throw new Exception("Error al cambiar imagen principal");
    }
}

function ocultarImagen($conexion, $datos) {
    if (empty($datos['id_imagen'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID de imagen requerido']);
        return;
    }

    $sql = "UPDATE galeria SET estado = 0 WHERE idgaleria = ?";
    $stmt = mysqli_prepare($conexion, $sql);
    mysqli_stmt_bind_param($stmt, "i", $datos['id_imagen']);

    if (mysqli_stmt_execute($stmt)) {
        echo json_encode([
            'success' => true,
            'message' => 'Imagen oculta exitosamente'
        ]);
    } else {
        throw new Exception("Error al ocultar imagen: " . mysqli_stmt_error($stmt));
    }
}

function mostrarImagen($conexion, $datos) {
    if (empty($datos['id_imagen'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID de imagen requerido']);
        return;
    }

    $sql = "UPDATE galeria SET estado = 1 WHERE idgaleria = ?";
    $stmt = mysqli_prepare($conexion, $sql);
    mysqli_stmt_bind_param($stmt, "i", $datos['id_imagen']);

    if (mysqli_stmt_execute($stmt)) {
        echo json_encode([
            'success' => true,
            'message' => 'Imagen mostrada exitosamente'
        ]);
    } else {
        throw new Exception("Error al mostrar imagen: " . mysqli_stmt_error($stmt));
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

mysqli_close($conexion);
?> 