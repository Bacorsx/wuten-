<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    include("config.php");

    if ($_SERVER["REQUEST_METHOD"] === "POST") {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $conexion = conectar();
        
        // Construir la consulta base
        $sql = "
            SELECT 
                p.idpropiedades,
                p.titulopropiedad,
                p.descripcion,
                p.cant_banos,
                p.cant_domitorios,
                p.area_total,
                p.area_construida,
                p.precio_pesos,
                p.precio_uf,
                p.fecha_publicacion,
                p.bodega,
                p.estacionamiento,
                p.logia,
                p.cocinaamoblada,
                p.antejardin,
                p.patiotrasero,
                p.piscina,
                s.nombre_sector,
                c.nombre_comuna,
                pr.nombre_provincia,
                r.nombre_region,
                tp.tipo as tipo_propiedad,
                g.foto as imagen_principal
            FROM propiedades p
            INNER JOIN sectores s ON p.idsectores = s.idsectores
            INNER JOIN comunas c ON s.idcomunas = c.idcomunas
            INNER JOIN provincias pr ON c.idprovincias = pr.idprovincias
            INNER JOIN regiones r ON pr.idregion = r.idregion
            INNER JOIN tipo_propiedad tp ON p.idtipo_propiedad = tp.idtipo_propiedad
            LEFT JOIN galeria g ON p.idpropiedades = g.idpropiedades AND g.principal = 1 AND g.estado = 1
            WHERE p.estado = 1
        ";
        
        $params = [];
        $types = "";
        
        // Aplicar filtros si se proporcionan
        if (!empty($input['id_usuario'])) {
            $sql .= " AND p.idusuario = ?";
            $params[] = $input['id_usuario'];
            $types .= "i";
        }
        
        if (!empty($input['id_region'])) {
            $sql .= " AND r.idregion = ?";
            $params[] = $input['id_region'];
            $types .= "i";
        }
        
        if (!empty($input['id_provincia'])) {
            $sql .= " AND pr.idprovincias = ?";
            $params[] = $input['id_provincia'];
            $types .= "i";
        }
        
        if (!empty($input['id_comuna'])) {
            $sql .= " AND c.idcomunas = ?";
            $params[] = $input['id_comuna'];
            $types .= "i";
        }
        
        if (!empty($input['id_tipo_propiedad'])) {
            $sql .= " AND p.idtipo_propiedad = ?";
            $params[] = $input['id_tipo_propiedad'];
            $types .= "i";
        }
        
        if (!empty($input['precio_min'])) {
            $sql .= " AND p.precio_pesos >= ?";
            $params[] = $input['precio_min'];
            $types .= "i";
        }
        
        if (!empty($input['precio_max'])) {
            $sql .= " AND p.precio_pesos <= ?";
            $params[] = $input['precio_max'];
            $types .= "i";
        }
        
        $sql .= " ORDER BY p.fecha_publicacion DESC";
        
        $stmt = mysqli_prepare($conexion, $sql);
        if (!$stmt) {
            throw new Exception("Error en prepare: " . mysqli_error($conexion));
        }
        
        if (!empty($params)) {
            mysqli_stmt_bind_param($stmt, $types, ...$params);
        }
        
        if (!mysqli_stmt_execute($stmt)) {
            throw new Exception("Error en execute: " . mysqli_stmt_error($stmt));
        }
        
        $result = mysqli_stmt_get_result($stmt);
        if (!$result) {
            throw new Exception("Error en get_result: " . mysqli_stmt_error($stmt));
        }
        
        $propiedades = [];
        
        while ($row = mysqli_fetch_assoc($result)) {
            // Formatear datos
            $row['precio_formateado'] = '$' . number_format($row['precio_pesos'], 0, ',', '.');
            $row['fecha_formateada'] = date('d/m/Y', strtotime($row['fecha_publicacion']));
            $row['direccion'] = $row['nombre_sector'] . ', ' . $row['nombre_comuna'] . ', ' . $row['nombre_provincia'] . ', ' . $row['nombre_region'];
            
            // Procesar imagen
            if ($row['imagen_principal']) {
                $row['imagen_url'] = "/img/propiedades/" . $row['imagen_principal'];
            } else {
                $row['imagen_url'] = "/img/propiedades/sin_imagen.jpg";
            }
            
            $propiedades[] = $row;
        }
        
        echo json_encode([
            'success' => true,
            'propiedades' => $propiedades,
            'total' => count($propiedades)
        ]);
        
        mysqli_stmt_close($stmt);
        mysqli_close($conexion);
        
    } else {
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'message' => 'Método no permitido'
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor: ' . $e->getMessage()
    ]);
}
?> 