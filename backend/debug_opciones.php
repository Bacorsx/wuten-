<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    include("config.php");

    if ($_SERVER["REQUEST_METHOD"] === "GET") {
        $conexion = conectar();
        
        $debug_info = [];
        
        // Verificar conexión
        $debug_info['conexion'] = $conexion ? 'OK' : 'ERROR';
        
        // Verificar si las tablas existen
        $tablas = ['regiones', 'provincias', 'comunas', 'sectores', 'tipo_propiedad', 'propiedades'];
        foreach ($tablas as $tabla) {
            $sql = "SHOW TABLES LIKE '$tabla'";
            $result = mysqli_query($conexion, $sql);
            $debug_info['tablas'][$tabla] = mysqli_num_rows($result) > 0 ? 'EXISTE' : 'NO EXISTE';
        }
        
        // Verificar datos en cada tabla
        foreach ($tablas as $tabla) {
            $sql = "SELECT COUNT(*) as total FROM $tabla";
            $result = mysqli_query($conexion, $sql);
            if ($result) {
                $row = mysqli_fetch_assoc($result);
                $debug_info['datos'][$tabla] = $row['total'];
            } else {
                $debug_info['datos'][$tabla] = 'ERROR: ' . mysqli_error($conexion);
            }
        }
        
        // Intentar obtener opciones
        $opciones = [];
        
        // Obtener regiones
        $sql_regiones = "SELECT idregion, nombre_region FROM regiones ORDER BY nombre_region";
        $result_regiones = mysqli_query($conexion, $sql_regiones);
        if ($result_regiones) {
            $regiones = [];
            while ($row = mysqli_fetch_assoc($result_regiones)) {
                $regiones[] = $row;
            }
            $opciones['regiones'] = $regiones;
            $debug_info['regiones_count'] = count($regiones);
        } else {
            $debug_info['regiones_error'] = mysqli_error($conexion);
        }
        
        // Obtener provincias
        $sql_provincias = "SELECT idprovincias, nombre_provincia, idregion FROM provincias ORDER BY nombre_provincia";
        $result_provincias = mysqli_query($conexion, $sql_provincias);
        if ($result_provincias) {
            $provincias = [];
            while ($row = mysqli_fetch_assoc($result_provincias)) {
                $provincias[] = $row;
            }
            $opciones['provincias'] = $provincias;
            $debug_info['provincias_count'] = count($provincias);
        } else {
            $debug_info['provincias_error'] = mysqli_error($conexion);
        }
        
        // Obtener comunas
        $sql_comunas = "SELECT idcomunas, nombre_comuna, idprovincias FROM comunas ORDER BY nombre_comuna";
        $result_comunas = mysqli_query($conexion, $sql_comunas);
        if ($result_comunas) {
            $comunas = [];
            while ($row = mysqli_fetch_assoc($result_comunas)) {
                $comunas[] = $row;
            }
            $opciones['comunas'] = $comunas;
            $debug_info['comunas_count'] = count($comunas);
        } else {
            $debug_info['comunas_error'] = mysqli_error($conexion);
        }
        
        // Obtener sectores
        $sql_sectores = "SELECT idsectores, nombre_sector, idcomunas FROM sectores ORDER BY nombre_sector";
        $result_sectores = mysqli_query($conexion, $sql_sectores);
        if ($result_sectores) {
            $sectores = [];
            while ($row = mysqli_fetch_assoc($result_sectores)) {
                $sectores[] = $row;
            }
            $opciones['sectores'] = $sectores;
            $debug_info['sectores_count'] = count($sectores);
        } else {
            $debug_info['sectores_error'] = mysqli_error($conexion);
        }
        
        // Obtener tipos de propiedad
        $sql_tipos = "SELECT idtipo_propiedad, tipo FROM tipo_propiedad ORDER BY tipo";
        $result_tipos = mysqli_query($conexion, $sql_tipos);
        if ($result_tipos) {
            $tipos = [];
            while ($row = mysqli_fetch_assoc($result_tipos)) {
                $tipos[] = $row;
            }
            $opciones['tipos_propiedad'] = $tipos;
            $debug_info['tipos_count'] = count($tipos);
        } else {
            $debug_info['tipos_error'] = mysqli_error($conexion);
        }
        
        echo json_encode([
            'success' => true,
            'debug' => $debug_info,
            'opciones' => $opciones
        ]);
        
        mysqli_close($conexion);
        
    } else {
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'message' => 'Método no permitido'
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor: ' . $e->getMessage()
    ]);
}
?> 