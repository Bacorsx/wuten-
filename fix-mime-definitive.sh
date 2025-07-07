#!/bin/bash

echo "=== SOLUCIÓN DEFINITIVA PARA ERRORES MIME TYPE ==="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Backup current configuration
print_status "Haciendo backup de configuración actual..."
sudo cp /etc/httpd/conf.d/wuten.conf /etc/httpd/conf.d/wuten.conf.backup.$(date +%Y%m%d_%H%M%S)

# Stop Apache temporarily
print_status "Deteniendo Apache temporalmente..."
sudo systemctl stop httpd

# Create a completely new, clean Apache configuration
print_status "Creando configuración Apache completamente nueva..."
sudo tee /etc/httpd/conf.d/wuten.conf > /dev/null << 'EOF'
# Configuración definitiva para Wuten - Solución MIME types
<VirtualHost *:80>
    ServerName 54.163.209.36
    DocumentRoot /var/www/html/wuten/dist
    
    # Configuración principal del directorio
    <Directory /var/www/html/wuten/dist>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        
        # MIME types explícitos para JavaScript
        AddType application/javascript .js
        AddType application/javascript .mjs
        
        # Headers específicos para archivos JavaScript
        <FilesMatch "\.js$">
            Header set Content-Type "application/javascript"
            Header set X-Content-Type-Options "nosniff"
            Header set Cache-Control "public, max-age=31536000"
        </FilesMatch>
        
        <FilesMatch "\.mjs$">
            Header set Content-Type "application/javascript"
            Header set X-Content-Type-Options "nosniff"
            Header set Cache-Control "public, max-age=31536000"
        </FilesMatch>
        
        # Headers para CSS
        <FilesMatch "\.css$">
            Header set Content-Type "text/css"
            Header set Cache-Control "public, max-age=31536000"
        </FilesMatch>
        
        # Headers para HTML
        <FilesMatch "\.html$">
            Header set Content-Type "text/html"
        </FilesMatch>
        
        # Headers para imágenes
        <FilesMatch "\.(png|jpg|jpeg|gif|ico|svg)$">
            Header set Cache-Control "public, max-age=31536000"
        </FilesMatch>
        
        # Headers para fuentes
        <FilesMatch "\.(woff|woff2|ttf|eot)$">
            Header set Cache-Control "public, max-age=31536000"
        </FilesMatch>
    </Directory>
    
    # Alias para múltiples rutas
    Alias /wuten /var/www/html/wuten/dist
    Alias /wuten-frontend /var/www/html/wuten/dist
    Alias /app /var/www/html/wuten/dist
    
    # Configuración específica para cada alias
    <Directory /var/www/html/wuten/dist>
        RewriteEngine On
        
        # Si el archivo o directorio no existe, servir index.html
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule ^(.*)$ index.html [QSA,L]
    </Directory>
    
    # Logs específicos
    ErrorLog logs/wuten_error.log
    CustomLog logs/wuten_access.log combined
    
    # Configuración de seguridad
    Header always set X-Frame-Options DENY
    Header always set X-Content-Type-Options nosniff
    Header always set X-XSS-Protection "1; mode=block"
</VirtualHost>
EOF

# Create a minimal .htaccess file
print_status "Creando archivo .htaccess mínimo..."
sudo tee /var/www/html/wuten/dist/.htaccess > /dev/null << 'EOF'
RewriteEngine On
RewriteBase /

# MIME types para JavaScript modules
<FilesMatch "\.js$">
    SetHandler application/javascript
    Header set Content-Type "application/javascript"
    Header set X-Content-Type-Options "nosniff"
</FilesMatch>

<FilesMatch "\.mjs$">
    SetHandler application/javascript
    Header set Content-Type "application/javascript"
    Header set X-Content-Type-Options "nosniff"
</FilesMatch>

# Handle client-side routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.html [QSA,L]
EOF

# Verify files exist
print_status "Verificando que los archivos existen..."
if [ ! -f "/var/www/html/wuten/dist/index.html" ]; then
    print_error "index.html no existe en /var/www/html/wuten/dist/"
    print_error "Asegúrate de que el proyecto esté construido correctamente"
    exit 1
fi

if [ ! -d "/var/www/html/wuten/dist/assets" ]; then
    print_error "Directorio assets no existe en /var/www/html/wuten/dist/"
    print_error "Asegúrate de que el proyecto esté construido correctamente"
    exit 1
fi

# Set proper permissions
print_status "Configurando permisos..."
sudo chown -R apache:apache /var/www/html/wuten
sudo chmod -R 755 /var/www/html/wuten

# Test Apache configuration
print_status "Verificando configuración de Apache..."
sudo httpd -t

if [ $? -ne 0 ]; then
    print_error "Error en la configuración de Apache"
    print_error "Restaurando configuración anterior..."
    sudo cp /etc/httpd/conf.d/wuten.conf.backup.* /etc/httpd/conf.d/wuten.conf
    sudo systemctl start httpd
    exit 1
fi

# Start Apache
print_status "Iniciando Apache..."
sudo systemctl start httpd

# Verify Apache is running
if sudo systemctl is-active --quiet httpd; then
    print_status "Apache está ejecutándose correctamente"
else
    print_error "Error al iniciar Apache"
    exit 1
fi

# Test file serving
print_status "Probando servicio de archivos..."
echo "Probando index.html..."
curl -I http://localhost/ | head -5

echo "Probando archivo JavaScript..."
JS_FILE=$(find /var/www/html/wuten/dist/assets -name "*.js" | head -1)
if [ -n "$JS_FILE" ]; then
    JS_PATH=$(echo $JS_FILE | sed 's|/var/www/html/wuten/dist||')
    echo "Probando: $JS_PATH"
    curl -I http://localhost$JS_PATH | head -5
else
    print_warning "No se encontraron archivos JavaScript para probar"
fi

# Final verification
print_status "Verificación final..."
echo ""
echo "=== CONFIGURACIÓN APLICADA EXITOSAMENTE ==="
echo ""
echo "Tu aplicación debería estar disponible en:"
echo "  - http://54.163.209.36/"
echo "  - http://54.163.209.36/wuten/"
echo "  - http://54.163.209.36/wuten-frontend/"
echo "  - http://54.163.209.36/app/"
echo ""
echo "Para verificar que funciona:"
echo "1. Limpia completamente el caché del navegador (Ctrl+Shift+Delete)"
echo "2. Accede a http://54.163.209.36/"
echo "3. Abre las herramientas de desarrollador (F12)"
echo "4. Ve a la pestaña Network y recarga la página"
echo "5. Verifica que los archivos .js tengan Content-Type: application/javascript"
echo ""
echo "Si sigues teniendo problemas:"
echo "  sudo tail -f /etc/httpd/logs/wuten_error.log"
echo ""
echo "Para restaurar configuración anterior:"
echo "  sudo cp /etc/httpd/conf.d/wuten.conf.backup.* /etc/httpd/conf.d/wuten.conf"
echo "  sudo systemctl restart httpd" 