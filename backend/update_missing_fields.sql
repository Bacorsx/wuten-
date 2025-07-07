-- Script para agregar campos faltantes a la tabla usuarios
-- Basado en el dump de la base de datos proporcionado

-- Agregar campo telefono
ALTER TABLE usuarios ADD COLUMN telefono VARCHAR(20) NULL AFTER ap_materno;

-- Agregar campo numeroBienRaiz
ALTER TABLE usuarios ADD COLUMN numeroBienRaiz VARCHAR(50) NULL AFTER telefono;

-- Agregar campo certificadoAntecedentes
ALTER TABLE usuarios ADD COLUMN certificadoAntecedentes VARCHAR(255) NULL AFTER numeroBienRaiz;

-- Agregar índice único para RUT si no existe
ALTER TABLE usuarios ADD UNIQUE INDEX idx_rut (rut);

-- Actualizar usuarios existentes que no tienen foto
UPDATE usuarios SET foto = 'comodin.png' WHERE foto IS NULL OR foto = '';

-- Verificar la estructura final
DESCRIBE usuarios; 