<?php
// Configuración de conexión a la base de datos wuten
function conectar()
{
    $host = "localhost";
    $usuario = "root";
    $password = "";
    $base_datos = "wuten";
    
    $con = mysqli_connect($host, $usuario, $password, $base_datos);
    
    if (!$con) {
        throw new Exception("Error de conexión: " . mysqli_connect_error());
    }
    
    // Configurar charset
    mysqli_set_charset($con, "utf8");
    
    return $con;
}

// Función para contar usuarios (para verificación)
function contarusu()
{
    $sql = "SELECT * FROM usuarios";
    $result = mysqli_query(conectar(), $sql);
    $contar = mysqli_num_rows($result);
    return $contar;
}

// Función para obtener UF actual (simulada)
function obtenerUF()
{
    // Por ahora retornamos un valor fijo, pero se puede conectar a una API real
    return [
        'valor' => 35000,
        'fecha' => date('Y-m-d')
    ];
}
?> 