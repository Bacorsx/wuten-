#!/bin/bash

echo "=== Corrigiendo MIME types para JavaScript modules ==="

# Backup current configuration
echo "Haciendo backup de la configuración actual..."
sudo cp /etc/httpd/conf.d/wuten.conf /etc/httpd/conf.d/wuten.conf.backup.$(date +%Y%m%d_%H%M%S)

# Update Apache configuration with proper MIME types
echo "Actualizando configuración de Apache..."
sudo tee /etc/httpd/conf.d/wuten.conf > /dev/null << 'EOF'
<VirtualHost *:80>
    ServerName 54.163.209.36
    
    # Serve the main application at /wuten/
    Alias /wuten /var/www/html/wuten/dist
    
    <Directory /var/www/html/wuten/dist>
        AllowOverride All
        Require all granted
        
        # Handle client-side routing
        RewriteEngine On
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule ^(.*)$ index.html [QSA,L]
    </Directory>
    
    # Also serve at root for convenience
    DocumentRoot /var/www/html/wuten/dist
    
    <Directory /var/www/html/wuten/dist>
        AllowOverride All
        Require all granted
    </Directory>

    # Proper MIME types for JavaScript modules
    <FilesMatch "\.js$">
        SetHandler application/javascript
        Header set Content-Type "application/javascript"
    </FilesMatch>
    
    <FilesMatch "\.mjs$">
        SetHandler application/javascript
        Header set Content-Type "application/javascript"
    </FilesMatch>

    ErrorLog logs/wuten_error.log
    CustomLog logs/wuten_access.log combined
</VirtualHost>
EOF

# Update .htaccess with MIME types
echo "Actualizando .htaccess..."
sudo tee /var/www/html/wuten/dist/.htaccess > /dev/null << 'EOF'
RewriteEngine On
RewriteBase /

# Handle client-side routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.html [QSA,L]

# Proper MIME types for JavaScript modules
<FilesMatch "\.js$">
    SetHandler application/javascript
    Header set Content-Type "application/javascript"
</FilesMatch>

<FilesMatch "\.mjs$">
    SetHandler application/javascript
    Header set Content-Type "application/javascript"
</FilesMatch>

# Cache static assets
<FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 year"
    Header set Cache-Control "public, immutable"
</FilesMatch>

# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>
EOF

# Test Apache configuration
echo "Verificando configuración de Apache..."
sudo httpd -t

if [ $? -eq 0 ]; then
    echo "Configuración válida. Recargando Apache..."
    sudo systemctl reload httpd
    
    echo "=== MIME types corregidos exitosamente ==="
    echo ""
    echo "Para verificar que funciona:"
    echo "1. Limpia el caché del navegador (Ctrl+F5)"
    echo "2. Accede a http://54.163.209.36/"
    echo "3. Verifica en las herramientas de desarrollador que los archivos .js se cargan correctamente"
    echo ""
    echo "Para ver logs:"
    echo "  sudo tail -f /etc/httpd/logs/wuten_error.log"
else
    echo "ERROR: Configuración de Apache inválida!"
    echo "Restaurando configuración anterior..."
    sudo cp /etc/httpd/conf.d/wuten.conf.backup.* /etc/httpd/conf.d/wuten.conf
    sudo systemctl reload httpd
fi 