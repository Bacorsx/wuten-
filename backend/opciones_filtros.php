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
        
        $opciones = [];
        
        // Obtener regiones
        $sql_regiones = "SELECT idregion, nombre_region FROM regiones WHERE estado = 1 ORDER BY nombre_region";
        $result_regiones = mysqli_query($conexion, $sql_regiones);
        if (!$result_regiones) {
            throw new Exception("Error en consulta regiones: " . mysqli_error($conexion));
        }
        $regiones = [];
        while ($row = mysqli_fetch_assoc($result_regiones)) {
            $regiones[] = $row;
        }
        $opciones['regiones'] = $regiones;
        
        // Obtener provincias
        $sql_provincias = "SELECT idprovincias, nombre_provincia, idregion FROM provincias WHERE estado = 1 ORDER BY nombre_provincia";
        $result_provincias = mysqli_query($conexion, $sql_provincias);
        if (!$result_provincias) {
            throw new Exception("Error en consulta provincias: " . mysqli_error($conexion));
        }
        $provincias = [];
        while ($row = mysqli_fetch_assoc($result_provincias)) {
            $provincias[] = $row;
        }
        $opciones['provincias'] = $provincias;
        
        // Obtener comunas
        $sql_comunas = "SELECT idcomunas, nombre_comuna, idprovincias FROM comunas WHERE estado = 1 ORDER BY nombre_comuna";
        $result_comunas = mysqli_query($conexion, $sql_comunas);
        if (!$result_comunas) {
            throw new Exception("Error en consulta comunas: " . mysqli_error($conexion));
        }
        $comunas = [];
        while ($row = mysqli_fetch_assoc($result_comunas)) {
            $comunas[] = $row;
        }
        $opciones['comunas'] = $comunas;
        
        // Obtener sectores
        $sql_sectores = "SELECT idsectores, nombre_sector, idcomunas FROM sectores WHERE estado = 1 ORDER BY nombre_sector";
        $result_sectores = mysqli_query($conexion, $sql_sectores);
        if (!$result_sectores) {
            throw new Exception("Error en consulta sectores: " . mysqli_error($conexion));
        }
        $sectores = [];
        while ($row = mysqli_fetch_assoc($result_sectores)) {
            $sectores[] = $row;
        }
        $opciones['sectores'] = $sectores;
        
        // Obtener tipos de propiedad
        $sql_tipos = "SELECT idtipo_propiedad, tipo FROM tipo_propiedad WHERE estado = 1 ORDER BY tipo";
        $result_tipos = mysqli_query($conexion, $sql_tipos);
        if (!$result_tipos) {
            throw new Exception("Error en consulta tipos: " . mysqli_error($conexion));
        }
        $tipos = [];
        while ($row = mysqli_fetch_assoc($result_tipos)) {
            $tipos[] = $row;
        }
        $opciones['tipos_propiedad'] = $tipos;
        
        // Obtener rangos de precios
        $sql_precios = "SELECT MIN(precio_pesos) as precio_min, MAX(precio_pesos) as precio_max FROM propiedades WHERE estado = 1";
        $result_precios = mysqli_query($conexion, $sql_precios);
        if (!$result_precios) {
            throw new Exception("Error en consulta precios: " . mysqli_error($conexion));
        }
        $precios = mysqli_fetch_assoc($result_precios);
        $opciones['rangos_precio'] = $precios;
        
        echo json_encode([
            'success' => true,
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