<?php
include("config.php");

try {
    $conexion = conectar();
    
    echo "Creando tabla imagenes_propiedades...\n";
    
    $sql = "
    CREATE TABLE IF NOT EXISTS imagenes_propiedades (
        id INT AUTO_INCREMENT PRIMARY KEY,
        idpropiedades INT NOT NULL,
        nombre_archivo VARCHAR(255) NOT NULL,
        es_principal TINYINT(1) DEFAULT 0,
        orden INT DEFAULT 0,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (idpropiedades) REFERENCES propiedades(idpropiedades) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ";
    
    if (mysqli_query($conexion, $sql)) {
        echo "Tabla imagenes_propiedades creada exitosamente\n";
    } else {
        echo "Error al crear tabla: " . mysqli_error($conexion) . "\n";
    }
    
    // Crear directorio para imágenes si no existe
    $directorio = '../public/img/propiedades/';
    if (!is_dir($directorio)) {
        if (mkdir($directorio, 0777, true)) {
            echo "Directorio de imágenes creado: $directorio\n";
        } else {
            echo "Error al crear directorio de imágenes\n";
        }
    } else {
        echo "Directorio de imágenes ya existe: $directorio\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

mysqli_close($conexion);
?> 