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

foreach ($campos_requeridos as $campo) {
    if (empty($input[$campo])) {
        $campos_faltantes[] = $campo;
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
        'campos_enviados' => array_keys($input ?? [])
    ]
]);
?> 