#!/bin/bash

echo "=== Debug de Apache y archivos ==="

echo ""
echo "1. Verificando estado de Apache:"
sudo systemctl status httpd --no-pager

echo ""
echo "2. Verificando configuración de Apache:"
sudo httpd -t

echo ""
echo "3. Verificando archivos en el directorio:"
ls -la /var/www/html/wuten/dist/

echo ""
echo "4. Verificando archivo index.html:"
if [ -f "/var/www/html/wuten/dist/index.html" ]; then
    echo "✓ index.html existe"
    head -20 /var/www/html/wuten/dist/index.html
else
    echo "✗ index.html NO existe"
fi

echo ""
echo "5. Verificando directorio assets:"
if [ -d "/var/www/html/wuten/dist/assets" ]; then
    echo "✓ Directorio assets existe"
    ls -la /var/www/html/wuten/dist/assets/
else
    echo "✗ Directorio assets NO existe"
fi

echo ""
echo "6. Verificando configuración de VirtualHost:"
sudo cat /etc/httpd/conf.d/wuten.conf

echo ""
echo "7. Verificando logs de error:"
sudo tail -10 /etc/httpd/logs/wuten_error.log

echo ""
echo "8. Probando acceso local:"
curl -I http://localhost/
curl -I http://localhost/wuten/

echo ""
echo "9. Verificando permisos:"
ls -la /var/www/html/wuten/
ls -la /var/www/html/wuten/dist/

echo ""
echo "=== Debug completado ===" 