<?php
include("config.php");

try {
    $conexion = conectar();
    
    echo "<h2>Verificando estructura de tablas de ubicación</h2>";
    
    // Verificar tabla regiones
    echo "<h3>Tabla regiones:</h3>";
    $sql = "DESCRIBE regiones";
    $result = mysqli_query($conexion, $sql);
    
    if ($result) {
        echo "<table border='1'>";
        echo "<tr><th>Campo</th><th>Tipo</th><th>Null</th><th>Key</th><th>Default</th></tr>";
        while ($row = mysqli_fetch_assoc($result)) {
            echo "<tr>";
            echo "<td>" . $row['Field'] . "</td>";
            echo "<td>" . $row['Type'] . "</td>";
            echo "<td>" . $row['Null'] . "</td>";
            echo "<td>" . $row['Key'] . "</td>";
            echo "<td>" . $row['Default'] . "</td>";
            echo "</tr>";
        }
        echo "</table>";
    } else {
        echo "Error: " . mysqli_error($conexion);
    }
    
    // Verificar tabla provincias
    echo "<h3>Tabla provincias:</h3>";
    $sql = "DESCRIBE provincias";
    $result = mysqli_query($conexion, $sql);
    
    if ($result) {
        echo "<table border='1'>";
        echo "<tr><th>Campo</th><th>Tipo</th><th>Null</th><th>Key</th><th>Default</th></tr>";
        while ($row = mysqli_fetch_assoc($result)) {
            echo "<tr>";
            echo "<td>" . $row['Field'] . "</td>";
            echo "<td>" . $row['Type'] . "</td>";
            echo "<td>" . $row['Null'] . "</td>";
            echo "<td>" . $row['Key'] . "</td>";
            echo "<td>" . $row['Default'] . "</td>";
            echo "</tr>";
        }
        echo "</table>";
    } else {
        echo "Error: " . mysqli_error($conexion);
    }
    
    // Verificar tabla comunas
    echo "<h3>Tabla comunas:</h3>";
    $sql = "DESCRIBE comunas";
    $result = mysqli_query($conexion, $sql);
    
    if ($result) {
        echo "<table border='1'>";
        echo "<tr><th>Campo</th><th>Tipo</th><th>Null</th><th>Key</th><th>Default</th></tr>";
        while ($row = mysqli_fetch_assoc($result)) {
            echo "<tr>";
            echo "<td>" . $row['Field'] . "</td>";
            echo "<td>" . $row['Type'] . "</td>";
            echo "<td>" . $row['Null'] . "</td>";
            echo "<td>" . $row['Key'] . "</td>";
            echo "<td>" . $row['Default'] . "</td>";
            echo "</tr>";
        }
        echo "</table>";
    } else {
        echo "Error: " . mysqli_error($conexion);
    }
    
    // Verificar tabla sectores
    echo "<h3>Tabla sectores:</h3>";
    $sql = "DESCRIBE sectores";
    $result = mysqli_query($conexion, $sql);
    
    if ($result) {
        echo "<table border='1'>";
        echo "<tr><th>Campo</th><th>Tipo</th><th>Null</th><th>Key</th><th>Default</th></tr>";
        while ($row = mysqli_fetch_assoc($result)) {
            echo "<tr>";
            echo "<td>" . $row['Field'] . "</td>";
            echo "<td>" . $row['Type'] . "</td>";
            echo "<td>" . $row['Null'] . "</td>";
            echo "<td>" . $row['Key'] . "</td>";
            echo "<td>" . $row['Default'] . "</td>";
            echo "</tr>";
        }
        echo "</table>";
    } else {
        echo "Error: " . mysqli_error($conexion);
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}

mysqli_close($conexion);
?> 