<?php
include("config.php");

try {
    $conexion = conectar();
    
    echo "=== ESTRUCTURA TABLA PROPIEDADES ===\n";
    
    $sql = "SHOW COLUMNS FROM propiedades";
    $result = mysqli_query($conexion, $sql);
    
    while ($row = mysqli_fetch_assoc($result)) {
        echo $row['Field'] . " (" . $row['Type'] . ")\n";
    }
    
    echo "\n=== PRIMER REGISTRO ===\n";
    $sql = "SELECT * FROM propiedades LIMIT 1";
    $result = mysqli_query($conexion, $sql);
    $row = mysqli_fetch_assoc($result);
    
    if ($row) {
        foreach ($row as $key => $value) {
            echo $key . ": " . $value . "\n";
        }
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}

mysqli_close($conexion);
?> 