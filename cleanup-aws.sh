#!/bin/bash

echo "=== Limpiando servidor AWS para nueva instalación ==="

# Detener Apache temporalmente
echo "Deteniendo Apache..."
sudo systemctl stop httpd

# Eliminar configuración de Apache
echo "Eliminando configuración de Apache..."
sudo rm -f /etc/httpd/conf.d/wuten.conf
sudo rm -f /etc/httpd/conf.d/wuten.conf.backup

# Eliminar logs de Apache
echo "Eliminando logs de Apache..."
sudo rm -f /etc/httpd/logs/wuten_error.log
sudo rm -f /etc/httpd/logs/wuten_access.log

# Eliminar directorio completo de wuten
echo "Eliminando directorio wuten..."
sudo rm -rf /var/www/html/wuten

# Limpiar archivos temporales
echo "Limpiando archivos temporales..."
sudo rm -rf /tmp/wuten*
sudo rm -rf /home/ec2-user/wuten

# Verificar que todo esté limpio
echo "Verificando limpieza..."
if [ -d "/var/www/html/wuten" ]; then
    echo "ADVERTENCIA: El directorio /var/www/html/wuten aún existe"
else
    echo "✓ Directorio wuten eliminado correctamente"
fi

if [ -f "/etc/httpd/conf.d/wuten.conf" ]; then
    echo "ADVERTENCIA: La configuración de Apache aún existe"
else
    echo "✓ Configuración de Apache eliminada correctamente"
fi

echo ""
echo "=== Limpieza completada ==="
echo "El servidor está listo para una nueva instalación limpia."
echo ""
echo "Próximos pasos:"
echo "1. Subir el código desde Git"
echo "2. Instalar dependencias"
echo "3. Construir el proyecto"
echo "4. Configurar Apache"
echo "5. Iniciar servicios" 