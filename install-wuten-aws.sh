#!/bin/bash

echo "=== Instalación completa de Wuten en AWS ==="

# Variables
REPO_URL="https://github.com/tu-usuario/react-wuten.git"  # Cambiar por tu repo
APP_DIR="/var/www/html/wuten"
BUILD_DIR="$APP_DIR/dist"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar si Node.js está instalado
print_status "Verificando Node.js..."
if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado. Instalando..."
    curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
    sudo yum install -y nodejs
else
    print_status "Node.js ya está instalado: $(node --version)"
fi

# Verificar si npm está instalado
if ! command -v npm &> /dev/null; then
    print_error "npm no está instalado"
    exit 1
else
    print_status "npm ya está instalado: $(npm --version)"
fi

# Crear directorio de la aplicación
print_status "Creando directorio de la aplicación..."
sudo mkdir -p $APP_DIR
sudo chown ec2-user:ec2-user $APP_DIR

# Clonar el repositorio
print_status "Clonando repositorio desde Git..."
cd $APP_DIR
if [ -d ".git" ]; then
    print_status "Repositorio ya existe, actualizando..."
    git pull origin main
else
    git clone $REPO_URL .
fi

# Instalar dependencias
print_status "Instalando dependencias de Node.js..."
npm install

if [ $? -ne 0 ]; then
    print_error "Error al instalar dependencias"
    exit 1
fi

# Construir el proyecto
print_status "Construyendo el proyecto..."
npm run build

if [ $? -ne 0 ]; then
    print_error "Error al construir el proyecto"
    exit 1
fi

# Configurar permisos
print_status "Configurando permisos..."
sudo chown -R apache:apache $APP_DIR
sudo chmod -R 755 $APP_DIR

# Crear configuración de Apache
print_status "Creando configuración de Apache..."
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

# Crear .htaccess
print_status "Creando archivo .htaccess..."
sudo tee $BUILD_DIR/.htaccess > /dev/null << 'EOF'
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

# Verificar configuración de Apache
print_status "Verificando configuración de Apache..."
sudo httpd -t

if [ $? -ne 0 ]; then
    print_error "Error en la configuración de Apache"
    exit 1
fi

# Iniciar Apache
print_status "Iniciando Apache..."
sudo systemctl start httpd
sudo systemctl enable httpd

# Verificar estado de Apache
if sudo systemctl is-active --quiet httpd; then
    print_status "Apache está ejecutándose correctamente"
else
    print_error "Error al iniciar Apache"
    exit 1
fi

# Configurar firewall si es necesario
print_status "Configurando firewall..."
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload

# Verificar instalación
print_status "Verificando instalación..."
if [ -f "$BUILD_DIR/index.html" ]; then
    print_status "✓ Archivo index.html encontrado"
else
    print_error "✗ Archivo index.html no encontrado"
fi

if [ -d "$BUILD_DIR/assets" ]; then
    print_status "✓ Directorio assets encontrado"
else
    print_error "✗ Directorio assets no encontrado"
fi

echo ""
echo "=== Instalación completada exitosamente ==="
echo ""
echo "Tu aplicación está disponible en:"
echo "  - http://54.163.209.36/"
echo "  - http://54.163.209.36/wuten/"
echo ""
echo "Para verificar logs:"
echo "  sudo tail -f /etc/httpd/logs/wuten_error.log"
echo ""
echo "Para reiniciar Apache:"
echo "  sudo systemctl restart httpd" 