#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Obtener la nueva IP desde los argumentos de línea de comandos
const newIp = process.argv[2];

if (!newIp) {
  console.log('❌ Error: Debes proporcionar una nueva IP');
  console.log('📖 Uso: npm run update-ip <nueva-ip>');
  console.log('📖 Ejemplo: npm run update-ip 54.163.209.36');
  process.exit(1);
}

// Validar formato de IP básico
const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
if (!ipRegex.test(newIp)) {
  console.log('❌ Error: Formato de IP inválido');
  console.log('📖 Ejemplo válido: 54.163.209.36');
  process.exit(1);
}

// Ruta al archivo de configuración
const configPath = path.join(__dirname, '..', 'config', 'ip-config.js');

try {
  // Leer el archivo de configuración
  let content = fs.readFileSync(configPath, 'utf8');
  
  // Buscar y reemplazar la IP actual
  const oldIpMatch = content.match(/export const AWS_IP = '([^']*)'/);
  
  if (!oldIpMatch) {
    console.log('❌ Error: No se pudo encontrar la configuración de AWS_IP en el archivo');
    process.exit(1);
  }
  
  const oldIp = oldIpMatch[1];
  
  // Reemplazar la IP
  content = content.replace(
    /export const AWS_IP = '[^']*'/,
    `export const AWS_IP = '${newIp}'`
  );
  
  // Escribir el archivo actualizado
  fs.writeFileSync(configPath, content);
  
  console.log('✅ IP actualizada exitosamente');
  console.log(`📊 Cambio: ${oldIp} → ${newIp}`);
  console.log('🔄 La aplicación usará la nueva IP automáticamente');
  console.log('🧪 Usa "npm run dev" para probar la nueva configuración');
  
} catch (error) {
  console.log('❌ Error al actualizar la IP:', error.message);
  process.exit(1);
} 