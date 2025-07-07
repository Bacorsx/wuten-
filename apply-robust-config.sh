#!/bin/bash

echo "=== Aplicando configuración robusta de Apache ==="

# Backup current configuration
echo "Haciendo backup de la configuración actual..."
sudo cp /etc/httpd/conf.d/wuten.conf /etc/httpd/conf.d/wuten.conf.backup.$(date +%Y%m%d_%H%M%S)

# Apply robust configuration
echo "Aplicando configuración robusta..."
sudo tee /etc/httpd/conf.d/wuten.conf > /dev/null << 'EOF'
# Configuración robusta para Wuten
<VirtualHost *:80>
    ServerName 54.163.209.36
    DocumentRoot /var/www/html/wuten/dist
    
    # Configuración del directorio principal
    <Directory /var/www/html/wuten/dist>
        Options Indexes FollowSymLinks MultiViews
        AllowOverride All
        Require all granted
        
        # MIME types para JavaScript modules
        AddType application/javascript .js
        AddType application/javascript .mjs
        
        # Headers específicos para JavaScript
        <FilesMatch "\.js$">
            Header set Content-Type "application/javascript"
            Header set X-Content-Type-Options "nosniff"
        </FilesMatch>
        
        <FilesMatch "\.mjs$">
            Header set Content-Type "application/javascript"
            Header set X-Content-Type-Options "nosniff"
        </FilesMatch>
        
        # Headers para CSS
        <FilesMatch "\.css$">
            Header set Content-Type "text/css"
        </FilesMatch>
        
        # Headers para imágenes
        <FilesMatch "\.(png|jpg|jpeg|gif|ico|svg)$">
            Header set Cache-Control "public, max-age=31536000"
        </FilesMatch>
    </Directory>
    
    # Alias para diferentes rutas posibles
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

# Update .htaccess with robust configuration
echo "Actualizando .htaccess..."
sudo tee /var/www/html/wuten/dist/.htaccess > /dev/null << 'EOF'
RewriteEngine On
RewriteBase /

# Handle client-side routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.html [QSA,L]

# MIME types for JavaScript modules
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
    echo "Configuración válida. Reiniciando Apache..."
    sudo systemctl restart httpd
    
    echo "=== Configuración robusta aplicada exitosamente ==="
    echo ""
    echo "Tu aplicación ahora debería estar disponible en:"
    echo "  - http://54.163.209.36/"
    echo "  - http://54.163.209.36/wuten/"
    echo "  - http://54.163.209.36/wuten-frontend/"
    echo "  - http://54.163.209.36/app/"
    echo ""
    echo "Para verificar:"
    echo "1. Limpia el caché del navegador (Ctrl+Shift+R)"
    echo "2. Accede a cualquiera de las URLs anteriores"
    echo "3. Verifica en las herramientas de desarrollador que no hay errores 404"
    echo ""
    echo "Para ver logs:"
    echo "  sudo tail -f /etc/httpd/logs/wuten_error.log"
else
    echo "ERROR: Configuración de Apache inválida!"
    echo "Restaurando configuración anterior..."
    sudo cp /etc/httpd/conf.d/wuten.conf.backup.* /etc/httpd/conf.d/wuten.conf
    sudo systemctl restart httpd
fi 