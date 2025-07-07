<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

try {
    $file_dir = '../public/file';
    $index_file = $file_dir . '/contactos.json';
    
    if (!file_exists($index_file)) {
        echo json_encode([
            'success' => true,
            'contactos' => [],
            'total' => 0
        ]);
        exit;
    }
    
    $contactos = json_decode(file_get_contents($index_file), true) ?: [];
    
    // Ordenar por fecha más reciente
    usort($contactos, function($a, $b) {
        return strtotime($b['fecha']) - strtotime($a['fecha']);
    });
    
    // Obtener parámetros de paginación
    $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
    $offset = ($page - 1) * $limit;
    
    // Aplicar paginación
    $contactos_paginados = array_slice($contactos, $offset, $limit);
    
    echo json_encode([
        'success' => true,
        'contactos' => $contactos_paginados,
        'total' => count($contactos),
        'page' => $page,
        'limit' => $limit,
        'total_pages' => ceil(count($contactos) / $limit)
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al cargar contactos: ' . $e->getMessage()
    ]);
}
?> 