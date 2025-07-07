<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

try {
    include("config.php");
    $conexion = conectar();
    
    $resultados = [];
    
    // Verificar tabla regiones
    $sql = "SELECT COUNT(*) as total FROM regiones";
    $result = mysqli_query($conexion, $sql);
    if ($result) {
        $row = mysqli_fetch_assoc($result);
        $resultados['regiones'] = [
            'existe' => true,
            'total' => $row['total']
        ];
        
        // Obtener algunas regiones de ejemplo
        $sql_ejemplo = "SELECT idregion, nombre_region FROM regiones LIMIT 3";
        $result_ejemplo = mysqli_query($conexion, $sql_ejemplo);
        $ejemplos = [];
        while ($row = mysqli_fetch_assoc($result_ejemplo)) {
            $ejemplos[] = $row;
        }
        $resultados['regiones']['ejemplos'] = $ejemplos;
    } else {
        $resultados['regiones'] = [
            'existe' => false,
            'error' => mysqli_error($conexion)
        ];
    }
    
    // Verificar tabla propiedades
    $sql = "SELECT COUNT(*) as total FROM propiedades";
    $result = mysqli_query($conexion, $sql);
    if ($result) {
        $row = mysqli_fetch_assoc($result);
        $resultados['propiedades'] = [
            'existe' => true,
            'total' => $row['total']
        ];
        
        // Obtener algunas propiedades de ejemplo
        $sql_ejemplo = "SELECT idpropiedades, titulopropiedad, precio_pesos FROM propiedades LIMIT 3";
        $result_ejemplo = mysqli_query($conexion, $sql_ejemplo);
        $ejemplos = [];
        while ($row = mysqli_fetch_assoc($result_ejemplo)) {
            $ejemplos[] = $row;
        }
        $resultados['propiedades']['ejemplos'] = $ejemplos;
    } else {
        $resultados['propiedades'] = [
            'existe' => false,
            'error' => mysqli_error($conexion)
        ];
    }
    
    // Verificar tabla tipo_propiedad
    $sql = "SELECT COUNT(*) as total FROM tipo_propiedad";
    $result = mysqli_query($conexion, $sql);
    if ($result) {
        $row = mysqli_fetch_assoc($result);
        $resultados['tipo_propiedad'] = [
            'existe' => true,
            'total' => $row['total']
        ];
        
        // Obtener tipos de ejemplo
        $sql_ejemplo = "SELECT idtipo_propiedad, tipo FROM tipo_propiedad LIMIT 3";
        $result_ejemplo = mysqli_query($conexion, $sql_ejemplo);
        $ejemplos = [];
        while ($row = mysqli_fetch_assoc($result_ejemplo)) {
            $ejemplos[] = $row;
        }
        $resultados['tipo_propiedad']['ejemplos'] = $ejemplos;
    } else {
        $resultados['tipo_propiedad'] = [
            'existe' => false,
            'error' => mysqli_error($conexion)
        ];
    }
    
    echo json_encode([
        'success' => true,
        'resultados' => $resultados
    ]);
    
    mysqli_close($conexion);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?> 