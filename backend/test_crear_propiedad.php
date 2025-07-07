<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    include("config.php");
    
    $conexion = conectar();
    
    // Datos de prueba
    $datos_prueba = [
        'titulopropiedad' => 'Casa de prueba',
        'descripcion' => 'Descripción de prueba',
        'precio_pesos' => 50000000,
        'idtipo_propiedad' => 1,
        'idsectores' => 1,
        'idusuario' => 1,
        'cant_banos' => 2,
        'cant_domitorios' => 3,
        'area_total' => 150,
        'area_construida' => 120,
        'precio_uf' => 1500.50,
        'bodega' => 1,
        'estacionamiento' => 1,
        'logia' => 0,
        'cocinaamoblada' => 1,
        'antejardin' => 0,
        'patiotrasero' => 1,
        'piscina' => 0
    ];
    
    // Verificar si la tabla existe
    $sql_check = "SHOW TABLES LIKE 'propiedades'";
    $result_check = mysqli_query($conexion, $sql_check);
    
    if (mysqli_num_rows($result_check) == 0) {
        echo json_encode([
            'success' => false,
            'message' => 'La tabla propiedades no existe'
        ]);
        exit;
    }
    
    // Verificar si hay usuarios
    $sql_users = "SELECT id FROM usuarios LIMIT 1";
    $result_users = mysqli_query($conexion, $sql_users);
    
    if (mysqli_num_rows($result_users) == 0) {
        echo json_encode([
            'success' => false,
            'message' => 'No hay usuarios en la base de datos'
        ]);
        exit;
    }
    
    $user = mysqli_fetch_assoc($result_users);
    $datos_prueba['idusuario'] = $user['id'];
    
    // Verificar si hay sectores
    $sql_sectores = "SELECT idsectores FROM sectores LIMIT 1";
    $result_sectores = mysqli_query($conexion, $sql_sectores);
    
    if (mysqli_num_rows($result_sectores) == 0) {
        echo json_encode([
            'success' => false,
            'message' => 'No hay sectores en la base de datos'
        ]);
        exit;
    }
    
    $sector = mysqli_fetch_assoc($result_sectores);
    $datos_prueba['idsectores'] = $sector['idsectores'];
    
    // Intentar crear la propiedad
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
        $datos_prueba['titulopropiedad'],
        $datos_prueba['descripcion'],
        $datos_prueba['cant_banos'],
        $datos_prueba['cant_domitorios'],
        $datos_prueba['area_total'],
        $datos_prueba['area_construida'],
        $datos_prueba['precio_pesos'],
        $datos_prueba['precio_uf'],
        $datos_prueba['bodega'],
        $datos_prueba['estacionamiento'],
        $datos_prueba['logia'],
        $datos_prueba['cocinaamoblada'],
        $datos_prueba['antejardin'],
        $datos_prueba['patiotrasero'],
        $datos_prueba['piscina'],
        $datos_prueba['idtipo_propiedad'],
        $datos_prueba['idsectores'],
        $datos_prueba['idusuario']
    );
    
    if (mysqli_stmt_execute($stmt)) {
        $id_propiedad = mysqli_insert_id($conexion);
        echo json_encode([
            'success' => true,
            'message' => 'Propiedad de prueba creada exitosamente',
            'id_propiedad' => $id_propiedad,
            'datos_usados' => $datos_prueba
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Error al crear propiedad: ' . mysqli_stmt_error($stmt)
        ]);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?> 