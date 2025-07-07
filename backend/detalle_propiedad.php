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

    if ($_SERVER["REQUEST_METHOD"] === "GET") {
        $id_propiedad = $_GET['id'] ?? null;
        
        if (!$id_propiedad) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'ID de propiedad requerido'
            ]);
            exit;
        }
        
        $conexion = conectar();
        
        // Consulta principal de la propiedad
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
                p.estado,
                s.nombre_sector,
                c.nombre_comuna,
                pr.nombre_provincia,
                r.nombre_region,
                tp.tipo as tipo_propiedad,
                u.nombres,
                u.ap_paterno,
                u.ap_materno,
                u.usuario as email_propietario
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
        if (!$stmt) {
            throw new Exception("Error en prepare: " . mysqli_error($conexion));
        }
        
        mysqli_stmt_bind_param($stmt, "i", $id_propiedad);
        
        if (!mysqli_stmt_execute($stmt)) {
            throw new Exception("Error en execute: " . mysqli_stmt_error($stmt));
        }
        
        $result = mysqli_stmt_get_result($stmt);
        if (!$result) {
            throw new Exception("Error en get_result: " . mysqli_stmt_error($stmt));
        }
        
        $propiedad = mysqli_fetch_assoc($result);
        
        if (!$propiedad) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Propiedad no encontrada'
            ]);
            exit;
        }
        
        // Obtener galería de imágenes
        $sql_galeria = "SELECT idgaleria, foto, principal FROM galeria WHERE idpropiedades = ? AND estado = 1 ORDER BY principal DESC, idgaleria ASC";
        $stmt_galeria = mysqli_prepare($conexion, $sql_galeria);
        mysqli_stmt_bind_param($stmt_galeria, "i", $id_propiedad);
        mysqli_stmt_execute($stmt_galeria);
        $result_galeria = mysqli_stmt_get_result($stmt_galeria);
        
        $imagenes = [];
        while ($imagen = mysqli_fetch_assoc($result_galeria)) {
            $imagen['url'] = "/img/propiedades/" . $imagen['foto'];
            $imagen['descripcion'] = 'Imagen de la propiedad';
            $imagenes[] = $imagen;
        }
        
        // Si no hay imágenes, agregar imagen por defecto
        if (empty($imagenes)) {
            $imagenes[] = [
                'idgaleria' => 0,
                'foto' => 'sin_imagen.jpg',
                'descripcion' => 'Imagen por defecto',
                'principal' => 1,
                'url' => '/img/propiedades/sin_imagen.jpg'
            ];
        }
        
        // Formatear datos
        $propiedad['precio_formateado'] = '$' . number_format($propiedad['precio_pesos'], 0, ',', '.');
        $propiedad['fecha_formateada'] = date('d/m/Y', strtotime($propiedad['fecha_publicacion']));
        $propiedad['direccion'] = $propiedad['nombre_sector'] . ', ' . $propiedad['nombre_comuna'] . ', ' . $propiedad['nombre_provincia'] . ', ' . $propiedad['nombre_region'];
        $propiedad['nombre_propietario'] = trim($propiedad['nombres'] . ' ' . $propiedad['ap_paterno'] . ' ' . $propiedad['ap_materno']);
        
        // Mapear campos para el frontend
        $propiedad['dormitorios'] = $propiedad['cant_domitorios'];
        $propiedad['banos'] = $propiedad['cant_banos'];
        $propiedad['metros_cuadrados'] = $propiedad['area_construida'];
        $propiedad['comuna'] = $propiedad['nombre_comuna'];
        $propiedad['provincia'] = $propiedad['nombre_provincia'];
        $propiedad['gastos_comunes'] = 0; // Campo por defecto
        $propiedad['contribuciones'] = 0; // Campo por defecto
        
        // Información del propietario
        $propiedad['propietario'] = [
            'nombre' => $propiedad['nombre_propietario'],
            'email' => $propiedad['email_propietario'],
            'telefono' => 'No disponible'
        ];
        
        // Características de la propiedad
        $caracteristicas = [];
        if ($propiedad['bodega']) $caracteristicas[] = 'Bodega';
        if ($propiedad['estacionamiento']) $caracteristicas[] = 'Estacionamiento';
        if ($propiedad['logia']) $caracteristicas[] = 'Logia';
        if ($propiedad['cocinaamoblada']) $caracteristicas[] = 'Cocina amoblada';
        if ($propiedad['antejardin']) $caracteristicas[] = 'Antejardín';
        if ($propiedad['patiotrasero']) $caracteristicas[] = 'Patio trasero';
        if ($propiedad['piscina']) $caracteristicas[] = 'Piscina';
        
        $propiedad['caracteristicas'] = $caracteristicas;
        $propiedad['imagenes'] = $imagenes;
        
        echo json_encode([
            'success' => true,
            'propiedad' => $propiedad
        ]);
        
        mysqli_stmt_close($stmt);
        mysqli_stmt_close($stmt_galeria);
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