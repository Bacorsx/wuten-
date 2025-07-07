<?php
// Script para verificar que la imagen comodín existe y es accesible

echo "Verificando imagen comodín...\n";

$ruta_comodin = '../public/img/usuarios/comodin.png';

if (file_exists($ruta_comodin)) {
    echo "✓ Imagen comodín existe: $ruta_comodin\n";
    
    // Verificar permisos
    if (is_readable($ruta_comodin)) {
        echo "✓ Imagen comodín es legible\n";
    } else {
        echo "✗ Imagen comodín no es legible\n";
    }
    
    // Verificar tamaño
    $tamano = filesize($ruta_comodin);
    echo "✓ Tamaño de la imagen: " . number_format($tamano / 1024, 2) . " KB\n";
    
    // Verificar tipo de imagen
    $info_imagen = getimagesize($ruta_comodin);
    if ($info_imagen) {
        echo "✓ Tipo de imagen válido: " . $info_imagen['mime'] . "\n";
        echo "✓ Dimensiones: " . $info_imagen[0] . "x" . $info_imagen[1] . " píxeles\n";
    } else {
        echo "✗ No es una imagen válida\n";
    }
    
} else {
    echo "✗ Imagen comodín no existe: $ruta_comodin\n";
    echo "Creando imagen comodín por defecto...\n";
    
    // Crear una imagen comodín simple si no existe
    $imagen = imagecreate(200, 200);
    $color_fondo = imagecolorallocate($imagen, 102, 126, 234); // Color azul de la app
    $color_texto = imagecolorallocate($imagen, 255, 255, 255); // Blanco
    
    // Dibujar un círculo
    imagefilledellipse($imagen, 100, 100, 150, 150, $color_texto);
    imagefilledellipse($imagen, 100, 100, 140, 140, $color_fondo);
    
    // Agregar texto
    $texto = "USER";
    $fuente = 5; // Fuente por defecto
    $ancho_texto = imagefontwidth($fuente) * strlen($texto);
    $alto_texto = imagefontheight($fuente);
    $x = (200 - $ancho_texto) / 2;
    $y = (200 - $alto_texto) / 2;
    
    imagestring($imagen, $fuente, $x, $y, $texto, $color_texto);
    
    // Crear directorio si no existe
    $directorio = dirname($ruta_comodin);
    if (!is_dir($directorio)) {
        mkdir($directorio, 0777, true);
    }
    
    // Guardar imagen
    if (imagepng($imagen, $ruta_comodin)) {
        echo "✓ Imagen comodín creada exitosamente\n";
    } else {
        echo "✗ Error al crear imagen comodín\n";
    }
    
    imagedestroy($imagen);
}

echo "\nVerificación completada.\n";
?> 