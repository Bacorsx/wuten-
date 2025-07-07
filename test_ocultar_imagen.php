<?php
// Script de prueba para verificar la funcionalidad de ocultar/mostrar imágenes

// Incluir el archivo de configuración
require_once 'backend/config.php';

// Conectar a la base de datos usando la función conectar()
$conexion = conectar();

echo "=== PRUEBA DE FUNCIONALIDAD OCULTAR/MOSTRAR IMÁGENES ===\n\n";

// 1. Verificar estructura de la tabla galeria
echo "1. Verificando estructura de la tabla galeria:\n";
$sql_estructura = "DESCRIBE galeria";
$result_estructura = mysqli_query($conexion, $sql_estructura);

if ($result_estructura) {
    while ($row = mysqli_fetch_assoc($result_estructura)) {
        echo "  - {$row['Field']}: {$row['Type']} " . ($row['Null'] === 'NO' ? 'NOT NULL' : 'NULL') . "\n";
    }
} else {
    echo "  Error al verificar estructura: " . mysqli_error($conexion) . "\n";
}

echo "\n";

// 2. Verificar imágenes existentes
echo "2. Verificando imágenes existentes:\n";
$sql_imagenes = "SELECT idgaleria, foto, principal, estado, idpropiedades FROM galeria LIMIT 5";
$result_imagenes = mysqli_query($conexion, $sql_imagenes);

if ($result_imagenes && mysqli_num_rows($result_imagenes) > 0) {
    while ($imagen = mysqli_fetch_assoc($result_imagenes)) {
        $estado_texto = $imagen['estado'] == 1 ? 'Visible' : 'Oculta';
        $principal_texto = $imagen['principal'] == 1 ? 'Sí' : 'No';
        echo "  - ID: {$imagen['idgaleria']}, Foto: {$imagen['foto']}, Principal: {$principal_texto}, Estado: {$estado_texto}, Propiedad: {$imagen['idpropiedades']}\n";
    }
} else {
    echo "  No hay imágenes en la base de datos\n";
}

echo "\n";

// 3. Probar función de ocultar imagen (si hay imágenes)
$result_imagenes = mysqli_query($conexion, $sql_imagenes);
if ($result_imagenes && mysqli_num_rows($result_imagenes) > 0) {
    $imagen = mysqli_fetch_assoc($result_imagenes);
    $id_imagen = $imagen['idgaleria'];
    
    echo "3. Probando función de ocultar imagen (ID: $id_imagen):\n";
    
    // Ocultar imagen
    $sql_ocultar = "UPDATE galeria SET estado = 0 WHERE idgaleria = ?";
    $stmt_ocultar = mysqli_prepare($conexion, $sql_ocultar);
    mysqli_stmt_bind_param($stmt_ocultar, "i", $id_imagen);
    
    if (mysqli_stmt_execute($stmt_ocultar)) {
        echo "  ✓ Imagen oculta exitosamente\n";
        
        // Verificar estado
        $sql_check = "SELECT estado FROM galeria WHERE idgaleria = ?";
        $stmt_check = mysqli_prepare($conexion, $sql_check);
        mysqli_stmt_bind_param($stmt_check, "i", $id_imagen);
        mysqli_stmt_execute($stmt_check);
        $result_check = mysqli_stmt_get_result($stmt_check);
        $estado_actual = mysqli_fetch_assoc($result_check)['estado'];
        echo "  - Estado actual: " . ($estado_actual == 0 ? 'Oculta' : 'Visible') . "\n";
        
        // Mostrar imagen
        echo "\n4. Probando función de mostrar imagen:\n";
        $sql_mostrar = "UPDATE galeria SET estado = 1 WHERE idgaleria = ?";
        $stmt_mostrar = mysqli_prepare($conexion, $sql_mostrar);
        mysqli_stmt_bind_param($stmt_mostrar, "i", $id_imagen);
        
        if (mysqli_stmt_execute($stmt_mostrar)) {
            echo "  ✓ Imagen mostrada exitosamente\n";
            
            // Verificar estado final
            mysqli_stmt_execute($stmt_check);
            $result_check = mysqli_stmt_get_result($stmt_check);
            $estado_final = mysqli_fetch_assoc($result_check)['estado'];
            echo "  - Estado final: " . ($estado_final == 1 ? 'Visible' : 'Oculta') . "\n";
        } else {
            echo "  ✗ Error al mostrar imagen: " . mysqli_stmt_error($stmt_mostrar) . "\n";
        }
    } else {
        echo "  ✗ Error al ocultar imagen: " . mysqli_stmt_error($stmt_ocultar) . "\n";
    }
} else {
    echo "3. No hay imágenes para probar\n";
}

echo "\n=== PRUEBA COMPLETADA ===\n";

mysqli_close($conexion);
?> 