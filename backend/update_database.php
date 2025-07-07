<?php
// Script para actualizar la base de datos con los nuevos campos
// Ejecutar este archivo una vez para agregar los campos RUT y fotoUsuario

try {
    include("config.php");
    $conexion = conectar();
    
    echo "Iniciando actualización de la base de datos...\n";
    
    // Verificar si el campo RUT ya existe
    $result = mysqli_query($conexion, "SHOW COLUMNS FROM usuarios LIKE 'rut'");
    if (mysqli_num_rows($result) == 0) {
        // Agregar campo RUT
        $sql = "ALTER TABLE usuarios ADD COLUMN rut VARCHAR(12) NOT NULL AFTER ap_materno";
        if (mysqli_query($conexion, $sql)) {
            echo "✓ Campo RUT agregado correctamente\n";
        } else {
            echo "✗ Error al agregar campo RUT: " . mysqli_error($conexion) . "\n";
        }
    } else {
        echo "✓ Campo RUT ya existe\n";
    }
    
    // Verificar si el campo foto ya existe
    $result = mysqli_query($conexion, "SHOW COLUMNS FROM usuarios LIKE 'foto'");
    if (mysqli_num_rows($result) > 0) {
        echo "✓ Campo foto ya existe (usando columna existente)\n";
        
        // Verificar si hay usuarios sin foto y asignar comodin.png
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
    } else {
        echo "✗ Campo foto no existe en la tabla usuarios\n";
    }
    
    // Verificar si el índice único para RUT ya existe
    $result = mysqli_query($conexion, "SHOW INDEX FROM usuarios WHERE Key_name = 'idx_rut'");
    if (mysqli_num_rows($result) == 0) {
        // Agregar índice único para RUT
        $sql = "ALTER TABLE usuarios ADD UNIQUE INDEX idx_rut (rut)";
        if (mysqli_query($conexion, $sql)) {
            echo "✓ Índice único para RUT agregado correctamente\n";
        } else {
            echo "✗ Error al agregar índice RUT: " . mysqli_error($conexion) . "\n";
        }
    } else {
        echo "✓ Índice único para RUT ya existe\n";
    }
    
    // Crear directorios si no existen
    $directorios = [
        '../public/img/usuarios/',
        '../public/file/certificados/'
    ];
    
    foreach ($directorios as $directorio) {
        if (!is_dir($directorio)) {
            if (mkdir($directorio, 0777, true)) {
                echo "✓ Directorio creado: $directorio\n";
            } else {
                echo "✗ Error al crear directorio: $directorio\n";
            }
        } else {
            echo "✓ Directorio ya existe: $directorio\n";
        }
    }
    
    echo "\n✅ Actualización completada exitosamente!\n";
    echo "La base de datos está lista para el nuevo sistema de registro.\n";
    
    mysqli_close($conexion);
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?> 