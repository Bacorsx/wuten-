<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Debug: Log all incoming data
error_log("TEST_IMAGE - REQUEST_METHOD: " . $_SERVER['REQUEST_METHOD']);
error_log("TEST_IMAGE - CONTENT_TYPE: " . ($_SERVER['CONTENT_TYPE'] ?? 'not set'));
error_log("TEST_IMAGE - POST data: " . json_encode($_POST));
error_log("TEST_IMAGE - FILES data: " . json_encode($_FILES));
error_log("TEST_IMAGE - php://input: " . file_get_contents('php://input'));

$response = [
    'success' => false,
    'message' => 'Test endpoint',
    'debug' => [
        'request_method' => $_SERVER['REQUEST_METHOD'],
        'content_type' => $_SERVER['CONTENT_TYPE'] ?? 'not set',
        'post_data' => $_POST,
        'files_data' => $_FILES,
        'raw_input' => file_get_contents('php://input')
    ]
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!empty($_FILES['imagen'])) {
        $archivo = $_FILES['imagen'];
        $response['message'] = 'Archivo recibido correctamente';
        $response['success'] = true;
        $response['file_info'] = [
            'name' => $archivo['name'],
            'type' => $archivo['type'],
            'size' => $archivo['size'],
            'tmp_name' => $archivo['tmp_name'],
            'error' => $archivo['error']
        ];
        
        // Intentar mover el archivo a una carpeta de prueba
        $test_dir = '../public/img/test/';
        if (!is_dir($test_dir)) {
            mkdir($test_dir, 0777, true);
        }
        
        $test_file = $test_dir . 'test_' . time() . '_' . $archivo['name'];
        if (move_uploaded_file($archivo['tmp_name'], $test_file)) {
            $response['file_saved'] = true;
            $response['file_path'] = $test_file;
        } else {
            $response['file_saved'] = false;
            $response['error'] = 'No se pudo mover el archivo';
        }
    } else {
        $response['message'] = 'No se recibió ningún archivo';
    }
}

echo json_encode($response);
?> 