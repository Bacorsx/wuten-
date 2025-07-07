<?php
include("config.php");

try {
    $conexion = conectar();
    
    echo "=== VERIFICANDO DATOS DE GALERIA ===\n";
    
    // Verificar datos de la tabla galeria
    $sql = "SELECT * FROM galeria ORDER BY idpropiedades, principal DESC";
    $result = mysqli_query($conexion, $sql);
    
    while ($row = mysqli_fetch_assoc($result)) {
        echo "ID Galeria: " . $row['idgaleria'] . "\n";
        echo "ID Propiedad: " . $row['idpropiedades'] . "\n";
        echo "Foto: " . $row['foto'] . "\n";
        echo "Estado: " . $row['estado'] . "\n";
        echo "Principal: " . $row['principal'] . "\n";
        
        // Verificar si el archivo existe
        $ruta_archivo = '../public/img/propiedades/' . $row['foto'];
        if (file_exists($ruta_archivo)) {
            echo "✓ Archivo existe: $ruta_archivo\n";
        } else {
            echo "✗ Archivo NO existe: $ruta_archivo\n";
        }
        echo "---\n";
    }
    
    // Verificar propiedades que tienen imágenes
    echo "\n=== PROPIEDADES CON IMAGENES ===\n";
    $sql = "
        SELECT 
            p.idpropiedades,
            p.titulopropiedad,
            COUNT(g.idgaleria) as total_imagenes,
            SUM(CASE WHEN g.principal = 1 THEN 1 ELSE 0 END) as imagenes_principales
        FROM propiedades p
        LEFT JOIN galeria g ON p.idpropiedades = g.idpropiedades AND g.estado = 1
        GROUP BY p.idpropiedades, p.titulopropiedad
        ORDER BY p.idpropiedades
    ";
    
    $result = mysqli_query($conexion, $sql);
    
    while ($row = mysqli_fetch_assoc($result)) {
        echo "ID: " . $row['idpropiedades'] . "\n";
        echo "Título: " . $row['titulopropiedad'] . "\n";
        echo "Total imágenes: " . $row['total_imagenes'] . "\n";
        echo "Imágenes principales: " . $row['imagenes_principales'] . "\n";
        echo "---\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

mysqli_close($conexion);
?> 