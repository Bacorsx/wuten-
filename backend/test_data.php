<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header("Content-Type: application/json");
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Datos de prueba
$opciones = [
    'regiones' => [
        ['idregion' => 1, 'nombre_region' => 'Región Metropolitana'],
        ['idregion' => 2, 'nombre_region' => 'Valparaíso'],
        ['idregion' => 3, 'nombre_region' => 'O\'Higgins']
    ],
    'provincias' => [
        ['idprovincias' => 1, 'nombre_provincia' => 'Santiago', 'idregion' => 1],
        ['idprovincias' => 2, 'nombre_provincia' => 'Valparaíso', 'idregion' => 2],
        ['idprovincias' => 3, 'nombre_provincia' => 'Cachapoal', 'idregion' => 3]
    ],
    'comunas' => [
        ['idcomunas' => 1, 'nombre_comuna' => 'Las Condes', 'idprovincias' => 1],
        ['idcomunas' => 2, 'nombre_comuna' => 'Providencia', 'idprovincias' => 1],
        ['idcomunas' => 3, 'nombre_comuna' => 'Viña del Mar', 'idprovincias' => 2]
    ],
    'sectores' => [
        ['idsectores' => 1, 'nombre_sector' => 'Centro', 'idcomunas' => 1],
        ['idsectores' => 2, 'nombre_sector' => 'Norte', 'idcomunas' => 1],
        ['idsectores' => 3, 'nombre_sector' => 'Sur', 'idcomunas' => 2]
    ],
    'tipos_propiedad' => [
        ['idtipo_propiedad' => 1, 'tipo' => 'Departamento'],
        ['idtipo_propiedad' => 2, 'tipo' => 'Casa'],
        ['idtipo_propiedad' => 3, 'tipo' => 'Oficina']
    ],
    'rangos_precio' => [
        'precio_min' => 50000000,
        'precio_max' => 500000000
    ]
];

$propiedades = [
    [
        'idpropiedades' => 1,
        'titulopropiedad' => 'Hermoso departamento en Las Condes',
        'descripcion' => 'Departamento de 2 dormitorios, 2 baños, con vista a la cordillera',
        'cant_banos' => 2,
        'cant_domitorios' => 2,
        'area_total' => 85,
        'area_construida' => 75,
        'precio_pesos' => 85000000,
        'precio_uf' => 2428,
        'fecha_publicacion' => '2024-01-15',
        'bodega' => 1,
        'estacionamiento' => 1,
        'logia' => 1,
        'cocinaamoblada' => 1,
        'antejardin' => 0,
        'patiotrasero' => 0,
        'piscina' => 1,
        'nombre_sector' => 'Centro',
        'nombre_comuna' => 'Las Condes',
        'nombre_provincia' => 'Santiago',
        'nombre_region' => 'Región Metropolitana',
        'tipo_propiedad' => 'Departamento',
        'imagen_url' => '../img/propiedades/sin_imagen.jpg',
        'precio_formateado' => '$85.000.000',
        'fecha_formateada' => '15/01/2024',
        'direccion' => 'Centro, Las Condes, Santiago, Región Metropolitana'
    ],
    [
        'idpropiedades' => 2,
        'titulopropiedad' => 'Casa familiar en Providencia',
        'descripcion' => 'Casa de 3 dormitorios, 3 baños, con jardín y terraza',
        'cant_banos' => 3,
        'cant_domitorios' => 3,
        'area_total' => 150,
        'area_construida' => 120,
        'precio_pesos' => 250000000,
        'precio_uf' => 7142,
        'fecha_publicacion' => '2024-01-10',
        'bodega' => 1,
        'estacionamiento' => 2,
        'logia' => 0,
        'cocinaamoblada' => 1,
        'antejardin' => 1,
        'patiotrasero' => 1,
        'piscina' => 0,
        'nombre_sector' => 'Norte',
        'nombre_comuna' => 'Providencia',
        'nombre_provincia' => 'Santiago',
        'nombre_region' => 'Región Metropolitana',
        'tipo_propiedad' => 'Casa',
        'imagen_url' => '../img/propiedades/sin_imagen.jpg',
        'precio_formateado' => '$250.000.000',
        'fecha_formateada' => '10/01/2024',
        'direccion' => 'Norte, Providencia, Santiago, Región Metropolitana'
    ]
];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Endpoint para opciones de filtros
    echo json_encode([
        'success' => true,
        'opciones' => $opciones
    ]);
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Endpoint para propiedades
    echo json_encode([
        'success' => true,
        'propiedades' => $propiedades,
        'total' => count($propiedades)
    ]);
} else {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido'
    ]);
}
?> 