<?php
include("config.php");

try {
    $conexion = conectar();
    
    echo "<h2>Verificando estructura de tabla propiedades</h2>";
    
    // Verificar tabla propiedades
    echo "<h3>Tabla propiedades:</h3>";
    $sql = "SHOW COLUMNS FROM propiedades";
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
    }
    
    // Verificar algunos registros de propiedades
    echo "<h3>Registros de propiedades:</h3>";
    $sql = "SELECT * FROM propiedades LIMIT 3";
    $result = mysqli_query($conexion, $sql);
    
    if ($result) {
        echo "<table border='1'>";
        $first = true;
        while ($row = mysqli_fetch_assoc($result)) {
            if ($first) {
                echo "<tr>";
                foreach ($row as $key => $value) {
                    echo "<th>" . $key . "</th>";
                }
                echo "</tr>";
                $first = false;
            }
            echo "<tr>";
            foreach ($row as $value) {
                echo "<td>" . htmlspecialchars($value) . "</td>";
            }
            echo "</tr>";
        }
        echo "</table>";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}

mysqli_close($conexion);
?> 