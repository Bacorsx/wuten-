#!/bin/bash

echo "=== Fixing Apache Configuration for Wuten ==="

# Backup current configuration
echo "Backing up current Apache configuration..."
sudo cp /etc/httpd/conf.d/wuten.conf /etc/httpd/conf.d/wuten.conf.backup

# Update Apache configuration
echo "Updating Apache configuration..."
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

    ErrorLog logs/wuten_error.log
    CustomLog logs/wuten_access.log combined
</VirtualHost>
EOF

# Create .htaccess file in dist directory
echo "Creating .htaccess file..."
sudo tee /var/www/html/wuten/dist/.htaccess > /dev/null << 'EOF'
RewriteEngine On
RewriteBase /

# Handle client-side routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.html [QSA,L]

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

# Set proper permissions
echo "Setting permissions..."
sudo chown -R apache:apache /var/www/html/wuten/dist/
sudo chmod -R 755 /var/www/html/wuten/dist/

# Test Apache configuration
echo "Testing Apache configuration..."
sudo httpd -t

if [ $? -eq 0 ]; then
    echo "Configuration is valid. Reloading Apache..."
    sudo systemctl reload httpd
    
    echo "=== Configuration Updated Successfully ==="
    echo "Your app should now be accessible at:"
    echo "  - http://54.163.209.36/ (root)"
    echo "  - http://54.163.209.36/wuten/ (with /wuten/ prefix)"
    echo ""
    echo "To check for errors, run:"
    echo "  sudo tail -f /etc/httpd/logs/wuten_error.log"
else
    echo "ERROR: Apache configuration is invalid!"
    echo "Please check the configuration manually."
fi 