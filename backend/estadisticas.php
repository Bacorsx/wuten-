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
    include("config.php");
    $conexion = conectar();

    // Estadísticas de propiedades
    $sql_propiedades = "
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN estado = 'Disponible' THEN 1 ELSE 0 END) as disponibles,
            SUM(CASE WHEN estado = 'Vendida' THEN 1 ELSE 0 END) as vendidas,
            SUM(CASE WHEN estado = 'Reservada' THEN 1 ELSE 0 END) as reservadas
        FROM propiedades 
        WHERE estado = 1
    ";
    
    $result_propiedades = mysqli_query($conexion, $sql_propiedades);
    $stats_propiedades = mysqli_fetch_assoc($result_propiedades);

    // Estadísticas de usuarios
    $sql_usuarios = "SELECT COUNT(*) as total FROM usuarios WHERE estado = 1";
    $result_usuarios = mysqli_query($conexion, $sql_usuarios);
    $stats_usuarios = mysqli_fetch_assoc($result_usuarios);

    // Estadísticas de contactos
    $file_dir = '../public/file';
    $index_file = $file_dir . '/contactos.json';
    $total_contactos = 0;
    
    if (file_exists($index_file)) {
        $contactos = json_decode(file_get_contents($index_file), true) ?: [];
        $total_contactos = count($contactos);
    }

    // Compilar estadísticas
    $estadisticas = [
        'totalPropiedades' => intval($stats_propiedades['total']),
        'propiedadesDisponibles' => intval($stats_propiedades['disponibles']),
        'propiedadesVendidas' => intval($stats_propiedades['vendidas']),
        'propiedadesReservadas' => intval($stats_propiedades['reservadas']),
        'totalUsuarios' => intval($stats_usuarios['total']),
        'totalContactos' => $total_contactos
    ];

    echo json_encode([
        'success' => true,
        'stats' => $estadisticas
    ]);

    mysqli_close($conexion);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor: ' . $e->getMessage()
    ]);
}
?> 