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

echo json_encode([
    'success' => true,
    'debug_info' => [
        'method' => $_SERVER['REQUEST_METHOD'],
        'content_type' => $_SERVER['CONTENT_TYPE'] ?? 'no especificado',
        'input_json' => $input,
        'post_data' => $post_data,
        'raw_input' => file_get_contents('php://input'),
        'headers' => getallheaders()
    ]
]);
?> 