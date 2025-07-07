<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

// Obtener datos del formulario
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Datos inválidos']);
    exit;
}

// Validar campos requeridos
$required_fields = ['nombre', 'email', 'telefono', 'mensaje', 'id_propiedad'];
foreach ($required_fields as $field) {
    if (empty($input[$field])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => "Campo requerido: $field"]);
        exit;
    }
}

// Sanitizar datos
$nombre = htmlspecialchars(trim($input['nombre']));
$email = filter_var(trim($input['email']), FILTER_SANITIZE_EMAIL);
$telefono = htmlspecialchars(trim($input['telefono']));
$mensaje = htmlspecialchars(trim($input['mensaje']));
$id_propiedad = intval($input['id_propiedad']);

// Validar email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email inválido']);
    exit;
}

// Crear estructura del mensaje
$contacto = [
    'id' => uniqid(),
    'fecha' => date('Y-m-d H:i:s'),
    'nombre' => $nombre,
    'email' => $email,
    'telefono' => $telefono,
    'mensaje' => $mensaje,
    'id_propiedad' => $id_propiedad,
    'estado' => 'nuevo'
];

// Crear directorio si no existe
$file_dir = '../public/file';
if (!is_dir($file_dir)) {
    mkdir($file_dir, 0755, true);
}

// Guardar mensaje individual
$filename = $file_dir . '/contacto_' . $contacto['id'] . '.json';
if (file_put_contents($filename, json_encode($contacto, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
    
    // Actualizar archivo de índice
    $index_file = $file_dir . '/contactos.json';
    $contactos = [];
    
    if (file_exists($index_file)) {
        $contactos = json_decode(file_get_contents($index_file), true) ?: [];
    }
    
    $contactos[] = $contacto;
    file_put_contents($index_file, json_encode($contactos, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    
    // Enviar respuesta exitosa
    echo json_encode([
        'success' => true,
        'message' => 'Mensaje enviado correctamente',
        'contacto_id' => $contacto['id']
    ]);
    
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error al guardar el mensaje']);
}
?> 