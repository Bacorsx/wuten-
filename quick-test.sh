#!/bin/bash

echo "=== PRUEBA RÁPIDA DE MIME TYPES ==="

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_ok() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Test 1: Check if Apache is running
echo "1. Verificando estado de Apache..."
if sudo systemctl is-active --quiet httpd; then
    print_ok "Apache está ejecutándose"
else
    print_error "Apache NO está ejecutándose"
    exit 1
fi

# Test 2: Check if files exist
echo "2. Verificando archivos..."
if [ -f "/var/www/html/wuten/dist/index.html" ]; then
    print_ok "index.html existe"
else
    print_error "index.html NO existe"
fi

if [ -d "/var/www/html/wuten/dist/assets" ]; then
    print_ok "Directorio assets existe"
    JS_COUNT=$(find /var/www/html/wuten/dist/assets -name "*.js" | wc -l)
    echo "   - Archivos JavaScript encontrados: $JS_COUNT"
else
    print_error "Directorio assets NO existe"
fi

# Test 3: Test HTTP responses
echo "3. Probando respuestas HTTP..."

# Test index.html
echo "   Probando index.html..."
INDEX_RESPONSE=$(curl -s -I http://localhost/ | head -1)
if echo "$INDEX_RESPONSE" | grep -q "200"; then
    print_ok "index.html responde con 200"
else
    print_error "index.html no responde correctamente: $INDEX_RESPONSE"
fi

# Test JavaScript file
JS_FILE=$(find /var/www/html/wuten/dist/assets -name "*.js" | head -1)
if [ -n "$JS_FILE" ]; then
    JS_PATH=$(echo $JS_FILE | sed 's|/var/www/html/wuten/dist||')
    echo "   Probando archivo JavaScript: $JS_PATH"
    
    JS_RESPONSE=$(curl -s -I http://localhost$JS_PATH)
    JS_STATUS=$(echo "$JS_RESPONSE" | head -1)
    JS_CONTENT_TYPE=$(echo "$JS_RESPONSE" | grep -i "content-type")
    
    if echo "$JS_STATUS" | grep -q "200"; then
        print_ok "Archivo JavaScript responde con 200"
    else
        print_error "Archivo JavaScript no responde correctamente: $JS_STATUS"
    fi
    
    if echo "$JS_CONTENT_TYPE" | grep -q "application/javascript"; then
        print_ok "Content-Type correcto: application/javascript"
    else
        print_error "Content-Type incorrecto: $JS_CONTENT_TYPE"
    fi
else
    print_warning "No se encontraron archivos JavaScript para probar"
fi

# Test 4: Check Apache configuration
echo "4. Verificando configuración de Apache..."
if sudo httpd -t > /dev/null 2>&1; then
    print_ok "Configuración de Apache válida"
else
    print_error "Configuración de Apache inválida"
fi

# Test 5: Check recent errors
echo "5. Verificando errores recientes..."
RECENT_ERRORS=$(sudo tail -5 /etc/httpd/logs/wuten_error.log 2>/dev/null)
if [ -n "$RECENT_ERRORS" ]; then
    print_warning "Errores recientes encontrados:"
    echo "$RECENT_ERRORS"
else
    print_ok "No hay errores recientes"
fi

echo ""
echo "=== RESUMEN ==="
echo "Si todos los tests pasaron, tu aplicación debería funcionar correctamente."
echo ""
echo "Para verificar en el navegador:"
echo "1. Limpia el caché (Ctrl+Shift+Delete)"
echo "2. Accede a http://54.163.209.36/"
echo "3. Abre F12 → Network → Recarga la página"
echo "4. Verifica que los archivos .js tengan Content-Type: application/javascript"
echo ""
echo "Si hay problemas, ejecuta:"
echo "  sudo tail -f /etc/httpd/logs/wuten_error.log" 