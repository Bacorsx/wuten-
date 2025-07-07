#!/bin/bash

echo "=== Configuración de Base de Datos Wuten ==="

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

# Variables de configuración
DB_NAME="wuten"
DB_USER="wuten_user"
DB_PASSWORD=""

# Solicitar contraseña de root de MariaDB
echo -n "Ingresa la contraseña de root de MariaDB: "
read -s ROOT_PASSWORD
echo ""

# Solicitar contraseña para el usuario de la aplicación
echo -n "Ingresa la contraseña para el usuario $DB_USER: "
read -s DB_PASSWORD
echo ""

if [ -z "$DB_PASSWORD" ]; then
    print_error "La contraseña no puede estar vacía"
    exit 1
fi

# PASO 1: Crear Base de Datos
print_status "Creando base de datos '$DB_NAME'..."
mysql -u root -p"$ROOT_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

if [ $? -eq 0 ]; then
    print_status "✓ Base de datos '$DB_NAME' creada correctamente"
else
    print_error "✗ Error al crear la base de datos"
    exit 1
fi

# PASO 2: Crear Usuario
print_status "Creando usuario '$DB_USER'..."
mysql -u root -p"$ROOT_PASSWORD" -e "CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';"

if [ $? -eq 0 ]; then
    print_status "✓ Usuario '$DB_USER' creado correctamente"
else
    print_error "✗ Error al crear el usuario"
    exit 1
fi

# PASO 3: Asignar Permisos
print_status "Asignando permisos al usuario..."
mysql -u root -p"$ROOT_PASSWORD" -e "GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';"
mysql -u root -p"$ROOT_PASSWORD" -e "FLUSH PRIVILEGES;"

if [ $? -eq 0 ]; then
    print_status "✓ Permisos asignados correctamente"
else
    print_error "✗ Error al asignar permisos"
    exit 1
fi

# PASO 4: Verificar Configuración
print_status "Verificando configuración..."
mysql -u root -p"$ROOT_PASSWORD" -e "SHOW DATABASES LIKE '$DB_NAME';"
mysql -u root -p"$ROOT_PASSWORD" -e "SELECT User, Host FROM mysql.user WHERE User='$DB_USER';"

# PASO 5: Configurar Variables de Entorno del Sistema
print_status "Configurando variables de entorno del sistema..."
sudo tee -a /etc/environment > /dev/null << EOF

# Configuración de Base de Datos Wuten
DB_HOST=localhost
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=$DB_NAME
APP_ENV=production
EOF

# Recargar variables de entorno
source /etc/environment

print_status "✓ Variables de entorno configuradas"

# PASO 6: Crear Script de Backup
print_status "Creando script de backup..."
sudo tee /usr/local/bin/backup-wuten.sh > /dev/null << 'EOF'
#!/bin/bash
BACKUP_DIR="/backup"
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u wuten_user -p'$DB_PASSWORD' wuten > $BACKUP_DIR/wuten_$DATE.sql
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
echo "Backup completado: wuten_$DATE.sql"
EOF

# Crear directorio de backup si no existe
sudo mkdir -p /backup
sudo chmod +x /usr/local/bin/backup-wuten.sh

print_status "✓ Script de backup creado en /usr/local/bin/backup-wuten.sh"

# PASO 7: Verificar Conexión
print_status "Verificando conexión con el nuevo usuario..."
mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "SELECT 1 as test;" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    print_status "✓ Conexión exitosa con el usuario '$DB_USER'"
else
    print_error "✗ Error al conectar con el usuario '$DB_USER'"
    exit 1
fi

echo ""
echo "=== Configuración de Base de Datos Completada ==="
echo ""
echo "Información de la base de datos:"
echo "  - Nombre: $DB_NAME"
echo "  - Usuario: $DB_USER"
echo "  - Host: localhost"
echo "  - Contraseña: [Configurada]"
echo ""
echo "Variables de entorno configuradas en /etc/environment"
echo "Script de backup creado en /usr/local/bin/backup-wuten.sh"
echo ""
echo "Próximos pasos:"
echo "  1. Migrar base de datos existente (si aplica)"
echo "  2. Verificar phpMyAdmin con el nuevo usuario"
echo "  3. Instalar la aplicación Wuten"
echo ""
echo "Para migrar base de datos existente:"
echo "  mysql -u $DB_USER -p $DB_NAME < wuten_backup.sql"
echo ""
echo "Para acceder a phpMyAdmin:"
echo "  Usuario: $DB_USER"
echo "  Contraseña: [La que configuraste]" 