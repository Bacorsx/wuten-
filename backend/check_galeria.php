<?php
include("config.php");

try {
    $conexion = conectar();
    
    echo "=== VERIFICANDO TABLA GALERIA ===\n";
    
    // Verificar si existe la tabla galeria
    $sql_check = "SHOW TABLES LIKE 'galeria'";
    $result_check = mysqli_query($conexion, $sql_check);
    
    if (mysqli_num_rows($result_check) > 0) {
        echo "✓ Tabla galeria existe\n";
        
        // Mostrar estructura
        echo "\n=== ESTRUCTURA TABLA GALERIA ===\n";
        $sql = "SHOW COLUMNS FROM galeria";
        $result = mysqli_query($conexion, $sql);
        
        while ($row = mysqli_fetch_assoc($result)) {
            echo $row['Field'] . " (" . $row['Type'] . ")\n";
        }
        
        // Mostrar algunos registros
        echo "\n=== REGISTROS DE GALERIA ===\n";
        $sql = "SELECT * FROM galeria LIMIT 5";
        $result = mysqli_query($conexion, $sql);
        
        while ($row = mysqli_fetch_assoc($result)) {
            echo "ID: " . $row['idgaleria'] . "\n";
            echo "ID Propiedad: " . $row['idpropiedades'] . "\n";
            echo "Foto: " . $row['foto'] . "\n";
            echo "Estado: " . $row['estado'] . "\n";
            echo "Principal: " . $row['principal'] . "\n";
            echo "---\n";
        }
        
        // Contar total de imágenes
        $sql_count = "SELECT COUNT(*) as total FROM galeria";
        $result_count = mysqli_query($conexion, $sql_count);
        $total = mysqli_fetch_assoc($result_count)['total'];
        echo "Total de imágenes en galeria: $total\n";
        
    } else {
        echo "✗ Tabla galeria NO existe\n";
    }
    
    // Verificar tabla imagenes_propiedades
    echo "\n=== VERIFICANDO TABLA IMAGENES_PROPIEDADES ===\n";
    $sql_check2 = "SHOW TABLES LIKE 'imagenes_propiedades'";
    $result_check2 = mysqli_query($conexion, $sql_check2);
    
    if (mysqli_num_rows($result_check2) > 0) {
        echo "✓ Tabla imagenes_propiedades existe\n";
        
        // Mostrar estructura
        echo "\n=== ESTRUCTURA TABLA IMAGENES_PROPIEDADES ===\n";
        $sql = "SHOW COLUMNS FROM imagenes_propiedades";
        $result = mysqli_query($conexion, $sql);
        
        while ($row = mysqli_fetch_assoc($result)) {
            echo $row['Field'] . " (" . $row['Type'] . ")\n";
        }
        
        // Mostrar algunos registros
        echo "\n=== REGISTROS DE IMAGENES_PROPIEDADES ===\n";
        $sql = "SELECT * FROM imagenes_propiedades LIMIT 5";
        $result = mysqli_query($conexion, $sql);
        
        while ($row = mysqli_fetch_assoc($result)) {
            echo "ID: " . $row['id'] . "\n";
            echo "ID Propiedad: " . $row['idpropiedades'] . "\n";
            echo "Nombre archivo: " . $row['nombre_archivo'] . "\n";
            echo "Es principal: " . $row['es_principal'] . "\n";
            echo "Orden: " . $row['orden'] . "\n";
            echo "---\n";
        }
        
        // Contar total de imágenes
        $sql_count = "SELECT COUNT(*) as total FROM imagenes_propiedades";
        $result_count = mysqli_query($conexion, $sql_count);
        $total = mysqli_fetch_assoc($result_count)['total'];
        echo "Total de imágenes en imagenes_propiedades: $total\n";
        
    } else {
        echo "✗ Tabla imagenes_propiedades NO existe\n";
    }
    
    // Verificar directorios
    echo "\n=== VERIFICANDO DIRECTORIOS ===\n";
    $directorio_galeria = '../public/img/galeria/';
    $directorio_propiedades = '../public/img/propiedades/';
    
    if (is_dir($directorio_galeria)) {
        echo "✓ Directorio galeria existe: $directorio_galeria\n";
        $archivos_galeria = scandir($directorio_galeria);
        echo "Archivos en galeria: " . (count($archivos_galeria) - 2) . " (excluyendo . y ..)\n";
    } else {
        echo "✗ Directorio galeria NO existe: $directorio_galeria\n";
    }
    
    if (is_dir($directorio_propiedades)) {
        echo "✓ Directorio propiedades existe: $directorio_propiedades\n";
        $archivos_propiedades = scandir($directorio_propiedades);
        echo "Archivos en propiedades: " . (count($archivos_propiedades) - 2) . " (excluyendo . y ..)\n";
        
        // Mostrar algunos archivos
        echo "\nArchivos en propiedades:\n";
        foreach ($archivos_propiedades as $archivo) {
            if ($archivo != '.' && $archivo != '..') {
                echo "- $archivo\n";
            }
        }
    } else {
        echo "✗ Directorio propiedades NO existe: $directorio_propiedades\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

mysqli_close($conexion);
?> 