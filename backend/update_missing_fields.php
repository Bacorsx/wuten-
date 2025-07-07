<?php
// Script para agregar campos faltantes a la tabla usuarios
// Basado en el dump de la base de datos proporcionado

try {
    include("config.php");
    $conexion = conectar();
    
    echo "Iniciando actualización de campos faltantes...\n";
    
    // Verificar si el campo telefono ya existe
    $result = mysqli_query($conexion, "SHOW COLUMNS FROM usuarios LIKE 'telefono'");
    if (mysqli_num_rows($result) == 0) {
        $sql = "ALTER TABLE usuarios ADD COLUMN telefono VARCHAR(20) NULL AFTER ap_materno";
        if (mysqli_query($conexion, $sql)) {
            echo "✓ Campo telefono agregado correctamente\n";
        } else {
            echo "✗ Error al agregar campo telefono: " . mysqli_error($conexion) . "\n";
        }
    } else {
        echo "✓ Campo telefono ya existe\n";
    }
    
    // Verificar si el campo numeroBienRaiz ya existe
    $result = mysqli_query($conexion, "SHOW COLUMNS FROM usuarios LIKE 'numeroBienRaiz'");
    if (mysqli_num_rows($result) == 0) {
        $sql = "ALTER TABLE usuarios ADD COLUMN numeroBienRaiz VARCHAR(50) NULL AFTER telefono";
        if (mysqli_query($conexion, $sql)) {
            echo "✓ Campo numeroBienRaiz agregado correctamente\n";
        } else {
            echo "✗ Error al agregar campo numeroBienRaiz: " . mysqli_error($conexion) . "\n";
        }
    } else {
        echo "✓ Campo numeroBienRaiz ya existe\n";
    }
    
    // Verificar si el campo certificadoAntecedentes ya existe
    $result = mysqli_query($conexion, "SHOW COLUMNS FROM usuarios LIKE 'certificadoAntecedentes'");
    if (mysqli_num_rows($result) == 0) {
        $sql = "ALTER TABLE usuarios ADD COLUMN certificadoAntecedentes VARCHAR(255) NULL AFTER numeroBienRaiz";
        if (mysqli_query($conexion, $sql)) {
            echo "✓ Campo certificadoAntecedentes agregado correctamente\n";
        } else {
            echo "✗ Error al agregar campo certificadoAntecedentes: " . mysqli_error($conexion) . "\n";
        }
    } else {
        echo "✓ Campo certificadoAntecedentes ya existe\n";
    }
    
    // Verificar si el índice único para RUT ya existe
    $result = mysqli_query($conexion, "SHOW INDEX FROM usuarios WHERE Key_name = 'idx_rut'");
    if (mysqli_num_rows($result) == 0) {
        $sql = "ALTER TABLE usuarios ADD UNIQUE INDEX idx_rut (rut)";
        if (mysqli_query($conexion, $sql)) {
            echo "✓ Índice único para RUT agregado correctamente\n";
        } else {
            echo "✗ Error al agregar índice RUT: " . mysqli_error($conexion) . "\n";
        }
    } else {
        echo "✓ Índice único para RUT ya existe\n";
    }
    
    // Actualizar usuarios existentes que no tienen foto
    $sql_update = "UPDATE usuarios SET foto = 'comodin.png' WHERE foto IS NULL OR foto = ''";
    if (mysqli_query($conexion, $sql_update)) {
        $affected_rows = mysqli_affected_rows($conexion);
        if ($affected_rows > 0) {
            echo "✓ Actualizados $affected_rows usuarios con foto por defecto\n";
        } else {
            echo "✓ Todos los usuarios ya tienen foto asignada\n";
        }
    } else {
        echo "✗ Error al actualizar fotos por defecto: " . mysqli_error($conexion) . "\n";
    }
    
    // Mostrar estructura final de la tabla
    echo "\n--- Estructura final de la tabla usuarios ---\n";
    $result = mysqli_query($conexion, "DESCRIBE usuarios");
    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            echo $row['Field'] . " - " . $row['Type'] . " - " . $row['Null'] . " - " . $row['Key'] . "\n";
        }
    }
    
    echo "\n✅ Actualización completada exitosamente!\n";
    echo "La tabla usuarios está lista para el nuevo sistema de registro.\n";
    
    mysqli_close($conexion);
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?> 