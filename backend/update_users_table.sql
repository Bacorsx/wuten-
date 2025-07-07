-- Script para actualizar la tabla usuarios con nuevos campos
-- Ejecutar este script en la base de datos para agregar los campos RUT y fotoUsuario

-- Agregar campo RUT
ALTER TABLE usuarios ADD COLUMN rut VARCHAR(12) NOT NULL AFTER ap_materno;

-- Verificar campo foto existente
-- La columna foto ya existe en la tabla usuarios

-- Agregar índice único para RUT
ALTER TABLE usuarios ADD UNIQUE INDEX idx_rut (rut);

-- Verificar que los campos se agregaron correctamente
DESCRIBE usuarios; 