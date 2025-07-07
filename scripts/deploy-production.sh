#!/bin/bash

# ========================================
# SCRIPT DE DESPLIEGUE PARA PRODUCCIÓN
# ========================================
# 
# Este script automatiza el proceso de despliegue en producción
# Incluye optimizaciones, verificaciones y configuración automática

set -e  # Salir en caso de error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    error "No se encontró package.json. Ejecuta este script desde la raíz del proyecto."
fi

# Verificar que existe el archivo de configuración de IP
if [ ! -f "config/ip-config.js" ]; then
    error "No se encontró config/ip-config.js. Verifica la configuración del proyecto."
fi

# Función para verificar dependencias
check_dependencies() {
    log "Verificando dependencias..."
    
    if ! command -v node &> /dev/null; then
        error "Node.js no está instalado"
    fi
    
    if ! command -v npm &> /dev/null; then
        error "npm no está instalado"
    fi
    
    log "Dependencias verificadas correctamente"
}

# Función para instalar dependencias
install_dependencies() {
    log "Instalando dependencias..."
    
    if [ ! -d "node_modules" ]; then
        npm install
    else
        npm install --production=false
    fi
    
    log "Dependencias instaladas correctamente"
}

# Función para verificar configuración de IP
check_ip_config() {
    log "Verificando configuración de IP..."
    
    # Extraer IP actual del archivo de configuración
    CURRENT_IP=$(grep -o "export const AWS_IP = '[^']*'" config/ip-config.js | cut -d"'" -f2)
    
    if [ -z "$CURRENT_IP" ]; then
        error "No se pudo obtener la IP de AWS del archivo de configuración"
    fi
    
    log "IP configurada: $CURRENT_IP"
    
    # Verificar si la IP es válida
    if [[ ! $CURRENT_IP =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        error "IP inválida: $CURRENT_IP"
    fi
    
    return 0
}

# Función para construir para producción
build_production() {
    log "Construyendo para producción..."
    
    # Limpiar build anterior
    if [ -d "dist" ]; then
        rm -rf dist
        log "Build anterior eliminado"
    fi
    
    # Construir con optimizaciones de producción
    npm run build:aws
    
    if [ ! -d "dist" ]; then
        error "La construcción falló. No se generó la carpeta dist/"
    fi
    
    log "Construcción completada exitosamente"
}

# Función para optimizar archivos
optimize_files() {
    log "Optimizando archivos..."
    
    # Comprimir archivos CSS y JS adicionales si es necesario
    if command -v gzip &> /dev/null; then
        find dist -name "*.css" -o -name "*.js" | xargs gzip -k
        log "Archivos comprimidos con gzip"
    fi
    
    # Verificar tamaño de archivos
    TOTAL_SIZE=$(du -sh dist | cut -f1)
    log "Tamaño total del build: $TOTAL_SIZE"
    
    # Verificar archivos críticos
    if [ ! -f "dist/index.html" ]; then
        error "No se encontró index.html en el build"
    fi
    
    log "Optimización completada"
}

# Función para verificar configuración de entorno
check_environment() {
    log "Verificando configuración de entorno..."
    
    # Verificar archivo .env.production
    if [ ! -f ".env.production" ]; then
        warn "No se encontró .env.production. Creando desde plantilla..."
        cp env.production.example .env.production
    fi
    
    # Verificar que las variables críticas estén configuradas
    if ! grep -q "VITE_API_URL" .env.production; then
        error "VITE_API_URL no está configurada en .env.production"
    fi
    
    if ! grep -q "VITE_APP_ENV=production" .env.production; then
        warn "VITE_APP_ENV no está configurado como production"
    fi
    
    log "Configuración de entorno verificada"
}

# Función para crear archivo de información de build
create_build_info() {
    log "Creando información de build..."
    
    cat > dist/build-info.json << EOF
{
    "build_time": "$(date -u +'%Y-%m-%dT%H:%M:%SZ')",
    "version": "$(node -p "require('./package.json').version")",
    "environment": "production",
    "node_version": "$(node --version)",
    "npm_version": "$(npm --version)",
    "git_commit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
    "git_branch": "$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')"
}
EOF
    
    log "Información de build creada"
}

# Función para verificar conectividad del backend
test_backend_connection() {
    log "Verificando conectividad del backend..."
    
    CURRENT_IP=$(grep -o "export const AWS_IP = '[^']*'" config/ip-config.js | cut -d"'" -f2)
    BACKEND_URL="http://$CURRENT_IP/wuten-/backend/heartbeat.php"
    
    if command -v curl &> /dev/null; then
        if curl -s --max-time 10 "$BACKEND_URL" > /dev/null; then
            log "✅ Backend responde correctamente"
        else
            warn "⚠️  No se pudo conectar al backend en $BACKEND_URL"
        fi
    else
        warn "curl no está disponible. No se puede verificar la conectividad del backend"
    fi
}

# Función para crear archivo de despliegue
create_deployment_script() {
    log "Creando script de despliegue..."
    
    cat > dist/deploy-to-server.sh << 'EOF'
#!/bin/bash

# Script para desplegar en el servidor
# Ejecutar en el servidor de destino

set -e

echo "🚀 Iniciando despliegue..."

# Variables
BACKUP_DIR="/var/www/html/backup_$(date +%Y%m%d_%H%M%S)"
CURRENT_DIR="/var/www/html/wuten"
NEW_BUILD="/tmp/wuten-build"

# Crear backup
if [ -d "$CURRENT_DIR" ]; then
    echo "📦 Creando backup..."
    sudo mkdir -p "$BACKUP_DIR"
    sudo cp -r "$CURRENT_DIR" "$BACKUP_DIR/"
    echo "✅ Backup creado en $BACKUP_DIR"
fi

# Desplegar nueva versión
echo "📤 Desplegando nueva versión..."
sudo mkdir -p "$NEW_BUILD"
sudo cp -r . "$NEW_BUILD/"

# Configurar permisos
echo "🔐 Configurando permisos..."
sudo chown -R www-data:www-data "$NEW_BUILD"
sudo chmod -R 755 "$NEW_BUILD"

# Reemplazar versión actual
echo "🔄 Reemplazando versión actual..."
sudo rm -rf "$CURRENT_DIR"
sudo mv "$NEW_BUILD" "$CURRENT_DIR"

echo "✅ Despliegue completado exitosamente"
echo "🌐 La aplicación está disponible en: http://$(hostname -I | awk '{print $1}')/wuten/"
EOF
    
    chmod +x dist/deploy-to-server.sh
    log "Script de despliegue creado"
}

# Función para mostrar resumen
show_summary() {
    log "=== RESUMEN DEL DESPLIEGUE ==="
    echo
    echo "📁 Build generado en: dist/"
    echo "📊 Tamaño total: $(du -sh dist | cut -f1)"
    echo "🔗 IP configurada: $(grep -o "export const AWS_IP = '[^']*'" config/ip-config.js | cut -d"'" -f2)"
    echo "🌐 URL del backend: http://$(grep -o "export const AWS_IP = '[^']*'" config/ip-config.js | cut -d"'" -f2)/wuten-/backend/"
    echo "🌐 URL del frontend: http://$(grep -o "export const AWS_IP = '[^']*'" config/ip-config.js | cut -d"'" -f2)/wuten/"
    echo
    echo "📋 Próximos pasos:"
    echo "1. Subir la carpeta dist/ al servidor"
    echo "2. Ejecutar el script de despliegue en el servidor"
    echo "3. Verificar que la aplicación funcione correctamente"
    echo
    log "Despliegue preparado exitosamente"
}

# Función principal
main() {
    echo "🚀 INICIANDO DESPLIEGUE PARA PRODUCCIÓN"
    echo "======================================"
    echo
    
    check_dependencies
    install_dependencies
    check_ip_config
    check_environment
    build_production
    optimize_files
    create_build_info
    test_backend_connection
    create_deployment_script
    show_summary
}

# Ejecutar función principal
main "$@" 