<?php
include("config.php");

try {
    $conexion = conectar();
    
    echo "<h2>Actualizando estructura de tabla usuarios</h2>";
    
    // Verificar si existen los campos necesarios
    $sql_check = "SHOW COLUMNS FROM usuarios LIKE 'numeroBienRaiz'";
    $result_check = mysqli_query($conexion, $sql_check);
    
    if (mysqli_num_rows($result_check) == 0) {
        echo "<p>Agregando campo numeroBienRaiz...</p>";
        $sql_add = "ALTER TABLE usuarios ADD COLUMN numeroBienRaiz VARCHAR(50) NULL";
        if (mysqli_query($conexion, $sql_add)) {
            echo "<p>✓ Campo numeroBienRaiz agregado correctamente</p>";
        } else {
            echo "<p>✗ Error al agregar numeroBienRaiz: " . mysqli_error($conexion) . "</p>";
        }
    } else {
        echo "<p>✓ Campo numeroBienRaiz ya existe</p>";
    }
    
    $sql_check2 = "SHOW COLUMNS FROM usuarios LIKE 'certificadoAntecedentes'";
    $result_check2 = mysqli_query($conexion, $sql_check2);
    
    if (mysqli_num_rows($result_check2) == 0) {
        echo "<p>Agregando campo certificadoAntecedentes...</p>";
        $sql_add2 = "ALTER TABLE usuarios ADD COLUMN certificadoAntecedentes VARCHAR(255) NULL";
        if (mysqli_query($conexion, $sql_add2)) {
            echo "<p>✓ Campo certificadoAntecedentes agregado correctamente</p>";
        } else {
            echo "<p>✗ Error al agregar certificadoAntecedentes: " . mysqli_error($conexion) . "</p>";
        }
    } else {
        echo "<p>✓ Campo certificadoAntecedentes ya existe</p>";
    }
    
    // Verificar estructura final
    echo "<h3>Estructura final de la tabla usuarios:</h3>";
    $sql_structure = "SHOW COLUMNS FROM usuarios";
    $result_structure = mysqli_query($conexion, $sql_structure);
    
    if ($result_structure) {
        echo "<table border='1'>";
        echo "<tr><th>Campo</th><th>Tipo</th><th>Null</th><th>Key</th><th>Default</th></tr>";
        while ($row = mysqli_fetch_assoc($result_structure)) {
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
    
    echo "<h3>✓ Actualización completada</h3>";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}

mysqli_close($conexion);
?> 