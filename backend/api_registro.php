<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

// Log de debug
error_log("API Registro - Método: " . $_SERVER['REQUEST_METHOD']);
error_log("API Registro - Content-Type: " . ($_SERVER['CONTENT_TYPE'] ?? 'no definido'));

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

try {
    include("config.php");

    // Obtener datos del formulario (puede ser JSON o FormData)
    $raw_input = file_get_contents('php://input');
    $input = json_decode($raw_input, true);
    
    // Log de debug
    error_log("API Registro - Raw input: " . $raw_input);
    error_log("API Registro - POST data: " . print_r($_POST, true));
    error_log("API Registro - FILES data: " . print_r($_FILES, true));
    
    // Si no es JSON, usar $_POST (para FormData)
    if (!$input) {
        $input = $_POST;
    }
    
    if (!$input) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Datos inválidos']);
        exit;
    }

    // Validar campos requeridos
    $required_fields = ['nombres', 'ap_paterno', 'email', 'telefono', 'password', 'tipoUsuario', 'rut'];
    foreach ($required_fields as $field) {
        if (empty($input[$field])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => "Campo requerido: $field"]);
            exit;
        }
    }

    // Sanitizar datos
    $nombres = htmlspecialchars(trim($input['nombres']));
    $ap_paterno = htmlspecialchars(trim($input['ap_paterno']));
    $ap_materno = htmlspecialchars(trim($input['ap_materno'] ?? ''));
    $email = filter_var(trim($input['email']), FILTER_SANITIZE_EMAIL);
    $telefono = htmlspecialchars(trim($input['telefono']));
    $password = $input['password'];
    $tipoUsuario = htmlspecialchars(trim($input['tipoUsuario']));
    $rut = htmlspecialchars(trim($input['rut']));

    // Validar email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Email inválido']);
        exit;
    }

    // Validar RUT chileno
    function validarRut($rut) {
        // Limpiar el RUT de puntos y guión
        $rut = preg_replace('/[^0-9kK]/', '', $rut);
        
        if (strlen($rut) < 2) {
            return false;
        }
        
        $dv = substr($rut, -1);
        $numero = substr($rut, 0, -1);
        
        if (!is_numeric($numero)) {
            return false;
        }
        
        $i = 2;
        $suma = 0;
        
        foreach(array_reverse(str_split($numero)) as $v) {
            if($i == 8) $i = 2;
            $suma += $v * $i;
            ++$i;
        }
        
        $dvEsperado = 11 - ($suma % 11);
        
        if($dvEsperado == 11) {
            $dvEsperado = '0';
        } elseif($dvEsperado == 10) {
            $dvEsperado = 'K';
        } else {
            $dvEsperado = (string)$dvEsperado;
        }
        
        return strtoupper($dv) == $dvEsperado;
    }
    
    if (!validarRut($rut)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'RUT inválido']);
        exit;
    }

    // Validar contraseña
    if (strlen($password) < 6) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'La contraseña debe tener al menos 6 caracteres']);
        exit;
    }

    // Validar tipo de usuario
    $tipos_validos = ['propietario', 'gestor'];
    if (!in_array($tipoUsuario, $tipos_validos)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Tipo de usuario inválido']);
        exit;
    }

    // Validar campos específicos por tipo de usuario (opcional para la base de datos actual)
    if ($tipoUsuario === 'propietario') {
        if (empty($input['numeroBienRaiz'])) {
            // Solo mostrar advertencia, no bloquear el registro
            error_log("Propietario registrado sin número de bien raíz: " . $email);
        }
    }

    if ($tipoUsuario === 'gestor') {
        if (empty($_FILES['certificadoAntecedentes'])) {
            // Solo mostrar advertencia, no bloquear el registro
            error_log("Gestor registrado sin certificado de antecedentes: " . $email);
        } else {
            $archivo = $_FILES['certificadoAntecedentes'];
            if ($archivo['type'] !== 'application/pdf') {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'El certificado de antecedentes debe ser un archivo PDF']);
                exit;
            }
        }
    }

    $conexion = conectar();

    // Verificar si el email ya existe
    $sql_check = "SELECT id FROM usuarios WHERE usuario = ?";
    $stmt_check = mysqli_prepare($conexion, $sql_check);
    
    if (!$stmt_check) {
        throw new Exception("Error en prepare check: " . mysqli_error($conexion));
    }
    
    mysqli_stmt_bind_param($stmt_check, "s", $email);
    mysqli_stmt_execute($stmt_check);
    $result_check = mysqli_stmt_get_result($stmt_check);
    
    if (mysqli_num_rows($result_check) > 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'El email ya está registrado']);
        exit;
    }
    
    mysqli_stmt_close($stmt_check);

    // Procesar foto de usuario
    $nombre_foto = 'comodin.png'; // Foto por defecto
    if (!empty($_FILES['fotoUsuario'])) {
        $archivo_foto = $_FILES['fotoUsuario'];
        
        // Validar tipo de archivo
        $tipos_permitidos = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!in_array($archivo_foto['type'], $tipos_permitidos)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'La foto debe ser JPG o PNG']);
            exit;
        }
        
        // Validar tamaño (máximo 5MB)
        if ($archivo_foto['size'] > 5 * 1024 * 1024) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'La foto no puede superar 5MB']);
            exit;
        }
        
        // Crear directorio si no existe
        $directorio_destino = '../public/img/usuarios/';
        if (!is_dir($directorio_destino)) {
            mkdir($directorio_destino, 0777, true);
        }
        
        // Generar nombre único para el archivo
        $extension = pathinfo($archivo_foto['name'], PATHINFO_EXTENSION);
        $nombre_foto = 'usuario_' . time() . '_' . uniqid() . '.' . $extension;
        $ruta_destino = $directorio_destino . $nombre_foto;
        
        // Mover archivo
        if (!move_uploaded_file($archivo_foto['tmp_name'], $ruta_destino)) {
            throw new Exception("Error al subir la foto de usuario");
        }
    }

    // Procesar archivo de certificado de antecedentes si es gestor
    $nombre_archivo_certificado = null;
    if ($tipoUsuario === 'gestor' && !empty($_FILES['certificadoAntecedentes'])) {
        $archivo = $_FILES['certificadoAntecedentes'];
        
        // Crear directorio si no existe
        $directorio_destino = '../public/file/certificados/';
        if (!is_dir($directorio_destino)) {
            mkdir($directorio_destino, 0777, true);
        }
        
        // Generar nombre único para el archivo
        $extension = pathinfo($archivo['name'], PATHINFO_EXTENSION);
        $nombre_archivo_certificado = 'certificado_' . time() . '_' . uniqid() . '.' . $extension;
        $ruta_destino = $directorio_destino . $nombre_archivo_certificado;
        
        // Mover archivo
        if (!move_uploaded_file($archivo['tmp_name'], $ruta_destino)) {
            throw new Exception("Error al subir el certificado de antecedentes");
        }
    }

    // Hash de la contraseña
    $password_hash = password_hash($password, PASSWORD_DEFAULT);

    // Insertar nuevo usuario (estado = 0 para usuarios inactivos)
    // Usando solo los campos que existen en la tabla actual
    $sql = "INSERT INTO usuarios (nombres, ap_paterno, ap_materno, usuario, contrasenaHash, tipoUsuario, estado, rut, foto) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)";
    $stmt = mysqli_prepare($conexion, $sql);
    
    if (!$stmt) {
        throw new Exception("Error en prepare: " . mysqli_error($conexion));
    }
    
    mysqli_stmt_bind_param($stmt, "ssssssss", 
        $nombres, 
        $ap_paterno, 
        $ap_materno, 
        $email, 
        $password_hash, 
        $tipoUsuario,
        $rut,
        $nombre_foto
    );
    
    if (!mysqli_stmt_execute($stmt)) {
        throw new Exception("Error en execute: " . mysqli_stmt_error($stmt));
    }
    
    $id_usuario = mysqli_insert_id($conexion);
    
    if ($id_usuario) {
        echo json_encode([
            'success' => true,
            'message' => 'Usuario registrado correctamente. Debes esperar la aprobación del administrador para poder acceder.',
            'user_id' => $id_usuario
        ]);
    } else {
        throw new Exception("Error al insertar el usuario");
    }
    
    mysqli_stmt_close($stmt);
    mysqli_close($conexion);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor: ' . $e->getMessage()
    ]);
}
?> 