<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER["REQUEST_METHOD"] === "GET") {
    // Por ahora retornamos un valor fijo, pero se puede conectar a una API real
    $uf = [
        'valor' => 35000,
        'fecha' => date('Y-m-d'),
        'fuente' => 'Simulado para desarrollo'
    ];
    
    echo json_encode([
        'success' => true,
        'uf' => $uf
    ]);
    
} else {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido'
    ]);
}
?> 