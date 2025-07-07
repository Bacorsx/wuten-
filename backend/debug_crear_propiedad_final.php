<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Obtener datos de entrada
$input = json_decode(file_get_contents('php://input'), true);
$post_data = $_POST;

// Verificar campos requeridos
$campos_requeridos = ['titulopropiedad', 'descripcion', 'precio_pesos', 'idtipo_propiedad', 'idsectores', 'idusuario'];
$campos_faltantes = [];
$campos_enviados = [];

foreach ($campos_requeridos as $campo) {
    if (empty($input[$campo])) {
        $campos_faltantes[] = $campo;
    } else {
        $campos_enviados[$campo] = $input[$campo];
    }
}

// Intentar crear la propiedad si todos los campos están presentes
$resultado_creacion = null;
if (empty($campos_faltantes)) {
    try {
        include("config.php");
        $conexion = conectar();
        
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
            $input['titulopropiedad'],
            $input['descripcion'],
            $input['cant_banos'] ?? 0,
            $input['cant_domitorios'] ?? 0,
            $input['area_total'] ?? 0,
            $input['area_construida'] ?? 0,
            $input['precio_pesos'],
            $input['precio_uf'] ?? 0,
            $input['bodega'] ?? 0,
            $input['estacionamiento'] ?? 0,
            $input['logia'] ?? 0,
            $input['cocinaamoblada'] ?? 0,
            $input['antejardin'] ?? 0,
            $input['patiotrasero'] ?? 0,
            $input['piscina'] ?? 0,
            $input['idtipo_propiedad'],
            $input['idsectores'],
            $input['idusuario']
        );
        
        if (mysqli_stmt_execute($stmt)) {
            $id_propiedad = mysqli_insert_id($conexion);
            $resultado_creacion = [
                'success' => true,
                'id_propiedad' => $id_propiedad,
                'message' => 'Propiedad creada exitosamente'
            ];
        } else {
            $resultado_creacion = [
                'success' => false,
                'error' => mysqli_stmt_error($stmt)
            ];
        }
        
        mysqli_close($conexion);
    } catch (Exception $e) {
        $resultado_creacion = [
            'success' => false,
            'error' => $e->getMessage()
        ];
    }
}

echo json_encode([
    'success' => empty($campos_faltantes),
    'debug_info' => [
        'method' => $_SERVER['REQUEST_METHOD'],
        'content_type' => $_SERVER['CONTENT_TYPE'] ?? 'no especificado',
        'input_json' => $input,
        'post_data' => $post_data,
        'raw_input' => file_get_contents('php://input'),
        'campos_requeridos' => $campos_requeridos,
        'campos_faltantes' => $campos_faltantes,
        'campos_enviados' => $campos_enviados,
        'resultado_creacion' => $resultado_creacion
    ]
]);
?> 