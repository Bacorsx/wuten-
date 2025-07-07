# 🚀 GUÍA DE DESPLIEGUE EN AWS LINUX - WUTEN INMOBILIARIA

## 📋 Índice
1. [Requisitos Previos](#requisitos-previos)
2. [Método 1: Clonación Directa (Recomendado)](#método-1-clonación-directa-recomendado)
3. [Método 2: Despliegue Automatizado](#método-2-despliegue-automatizado)
4. [Método 3: Subida Manual con PuTTY](#método-3-subida-manual-con-putty)
5. [Método 4: Sincronización Automática](#método-4-sincronización-automática)
6. [Configuración del Servidor](#configuración-del-servidor)
7. [Verificación y Testing](#verificación-y-testing)
8. [Mantenimiento](#mantenimiento)
9. [Troubleshooting](#troubleshooting)

---

## 🔧 Requisitos Previos

### Software Necesario
- **PuTTY** (para conexión SSH)
- **PuTTY SCP** (pscp.exe) para transferencia de archivos
- **Git** instalado en tu máquina local
- **Node.js** y **npm** en tu máquina local

### Información Requerida
- **IP pública de tu instancia AWS**: `54.163.209.36`
- **Archivo de clave privada**: `tu-key.pem` o `tu-key.ppk`
- **Usuario de la instancia**: `ubuntu` (por defecto)
- **URL del repositorio**: `https://github.com/Bacorsx/wuten-.git`

---

## 🎯 Método 1: Clonación Directa (Recomendado)

### Paso 1: Conectar a la instancia AWS
```bash
# Usando PuTTY o línea de comandos
ssh -i tu-key.pem ubuntu@54.163.209.36
```

### Paso 2: Actualizar el sistema
```bash
sudo apt update
sudo apt upgrade -y
```

### Paso 3: Instalar Git
```bash
sudo apt install git -y
git --version
```

### Paso 4: Configurar Git
```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
```

### Paso 5: Navegar al directorio web
```bash
cd /var/www/html
ls -la
```

### Paso 6: Clonar el repositorio
```bash
# Clonar el repositorio
sudo git clone https://github.com/Bacorsx/wuten-.git wuten

# Verificar que se clonó correctamente
ls -la wuten/
```

### Paso 7: Configurar permisos
```bash
# Cambiar propietario
sudo chown -R www-data:www-data wuten

# Configurar permisos
sudo chmod -R 755 wuten

# Verificar permisos
ls -la wuten/
```

### Paso 8: Instalar dependencias (si es necesario)
```bash
cd wuten

# Instalar Node.js si no está instalado
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalación
node --version
npm --version

# Instalar dependencias del proyecto
npm install
```

---

## 🚀 Método 2: Despliegue Automatizado

### Paso 1: Preparar el build en tu máquina local
```bash
# Navegar al proyecto
cd C:\wamp64\www\react-wuten

# Actualizar IP si es necesario
npm run update-ip

# Verificar configuración
npm run check:ip

# Construir para producción
npm run build:aws
```

### Paso 2: Subir archivos usando SCP
```bash
# Usando SCP desde línea de comandos
scp -i tu-key.pem -r dist/* ubuntu@54.163.209.36:/tmp/wuten-build/

# O usando PuTTY SCP (pscp)
pscp -i tu-key.ppk -r dist/* ubuntu@54.163.209.36:/tmp/wuten-build/
```

### Paso 3: Conectar a AWS y ejecutar despliegue
```bash
# Conectar a la instancia
ssh -i tu-key.pem ubuntu@54.163.209.36

# Navegar al directorio temporal
cd /tmp/wuten-build

# Verificar archivos
ls -la

# Ejecutar script de despliegue
chmod +x deploy-to-server.sh
./deploy-to-server.sh
```

### Paso 4: Verificar el despliegue
```bash
# Verificar que la aplicación esté funcionando
curl -I http://54.163.209.36/wuten/

# Verificar logs
sudo tail -f /var/log/apache2/error.log
```

---

## 📁 Método 3: Subida Manual con PuTTY

### Paso 1: Preparar archivos localmente
```bash
# Construir el proyecto
npm run build:aws

# Verificar que se generó la carpeta dist/
ls -la dist/
```

### Paso 2: Usar PuTTY SCP (pscp)
```bash
# Subir archivos individuales
pscp -i tu-key.ppk archivo.php ubuntu@54.163.209.36:/var/www/html/wuten/

# Subir carpeta completa
pscp -i tu-key.ppk -r dist/* ubuntu@54.163.209.36:/var/www/html/wuten/
```

### Paso 3: Conectar y configurar
```bash
# Conectar a AWS
ssh -i tu-key.pem ubuntu@54.163.209.36

# Navegar al directorio
cd /var/www/html/wuten

# Configurar permisos
sudo chown -R www-data:www-data .
sudo chmod -R 755 .

# Verificar archivos
ls -la
```

### Paso 4: Alternativa usando WinSCP
1. Descargar e instalar **WinSCP**
2. Conectar usando:
   - **Protocolo**: SCP
   - **Host name**: `54.163.209.36`
   - **User name**: `ubuntu`
   - **Private key file**: Seleccionar tu archivo `.ppk`
3. Arrastrar y soltar archivos desde tu máquina local

---

## 🔄 Método 4: Sincronización Automática

### Paso 1: Crear script de actualización
```bash
# Conectar a AWS
ssh -i tu-key.pem ubuntu@54.163.209.36

# Crear script de actualización
sudo nano /var/www/html/update-wuten.sh
```

### Paso 2: Contenido del script
```bash
#!/bin/bash

# Script de actualización automática
echo "Iniciando actualización de Wuten..."

# Navegar al directorio del proyecto
cd /var/www/html/wuten

# Hacer backup de la versión actual
sudo cp -r . ../wuten-backup-$(date +%Y%m%d_%H%M%S)

# Actualizar desde Git
sudo git pull origin main

# Instalar dependencias si es necesario
if [ -f "package.json" ]; then
    npm install --production
fi

# Configurar permisos
sudo chown -R www-data:www-data .
sudo chmod -R 755 .

# Limpiar caché de Apache
sudo systemctl reload apache2

echo "Actualización completada: $(date)"
```

### Paso 3: Hacer el script ejecutable
```bash
sudo chmod +x /var/www/html/update-wuten.sh
```

### Paso 4: Configurar actualización automática
```bash
# Editar crontab
sudo crontab -e

# Agregar una de estas líneas:
# Actualizar cada hora
0 * * * * /var/www/html/update-wuten.sh

# Actualizar cada día a las 2 AM
0 2 * * * /var/www/html/update-wuten.sh

# Actualizar cada 15 minutos
*/15 * * * * /var/www/html/update-wuten.sh
```

---

## ⚙️ Configuración del Servidor

### Paso 1: Instalar Apache y PHP
```bash
# Actualizar repositorios
sudo apt update

# Instalar Apache
sudo apt install apache2 -y

# Instalar PHP y extensiones
sudo apt install php php-mysql php-curl php-gd php-mbstring php-xml php-zip -y

# Habilitar módulos necesarios
sudo a2enmod rewrite
sudo a2enmod headers
sudo a2enmod expires
sudo a2enmod deflate
```

### Paso 2: Configurar Virtual Host
```bash
# Crear configuración del sitio
sudo nano /etc/apache2/sites-available/wuten.conf
```

### Paso 3: Contenido del Virtual Host
```apache
<VirtualHost *:80>
    ServerName 54.163.209.36
    ServerAdmin webmaster@localhost
    DocumentRoot /var/www/html/wuten
    
    # Configuración de seguridad
    <Directory /var/www/html/wuten>
        AllowOverride All
        Require all granted
        
        # Headers de seguridad
        Header always set X-Content-Type-Options nosniff
        Header always set X-Frame-Options DENY
        Header always set X-XSS-Protection "1; mode=block"
    </Directory>
    
    # Configuración de logs
    ErrorLog ${APACHE_LOG_DIR}/wuten_error.log
    CustomLog ${APACHE_LOG_DIR}/wuten_access.log combined
    
    # Configuración de compresión
    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css application/javascript application/json
    </IfModule>
</VirtualHost>
```

### Paso 4: Habilitar el sitio
```bash
# Deshabilitar sitio por defecto
sudo a2dissite 000-default.conf

# Habilitar nuestro sitio
sudo a2ensite wuten.conf

# Recargar Apache
sudo systemctl reload apache2

# Verificar estado
sudo systemctl status apache2
```

### Paso 5: Configurar MySQL (si es necesario)
```bash
# Instalar MySQL
sudo apt install mysql-server -y

# Configurar MySQL
sudo mysql_secure_installation

# Crear base de datos
sudo mysql -u root -p
```

```sql
CREATE DATABASE wuten;
CREATE USER 'wuten_user'@'localhost' IDENTIFIED BY 'tu_password_seguro';
GRANT ALL PRIVILEGES ON wuten.* TO 'wuten_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## ✅ Verificación y Testing

### Paso 1: Verificar conectividad
```bash
# Verificar que Apache esté funcionando
sudo systemctl status apache2

# Verificar puertos abiertos
sudo netstat -tulpn | grep :80
```

### Paso 2: Probar endpoints
```bash
# Probar frontend
curl -I http://54.163.209.36/wuten/

# Probar backend
curl -I http://54.163.209.36/wuten-/backend/heartbeat.php

# Probar API
curl http://54.163.209.36/wuten-/backend/heartbeat.php
```

### Paso 3: Verificar logs
```bash
# Ver logs de Apache
sudo tail -f /var/log/apache2/access.log
sudo tail -f /var/log/apache2/error.log

# Ver logs de PHP
sudo tail -f /var/log/php/error.log
```

### Paso 4: Verificar permisos
```bash
# Verificar estructura de archivos
ls -la /var/www/html/wuten/

# Verificar permisos de archivos críticos
ls -la /var/www/html/wuten/index.html
ls -la /var/www/html/wuten/backend/
```

---

## 🔧 Mantenimiento

### Actualizaciones Regulares
```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Actualizar dependencias del proyecto
cd /var/www/html/wuten
npm update

# Limpiar logs antiguos
sudo find /var/log -name "*.log" -mtime +30 -delete
```

### Backups Automáticos
```bash
# Crear script de backup
sudo nano /var/www/html/backup-wuten.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/wuten"

# Crear directorio de backup
sudo mkdir -p $BACKUP_DIR

# Backup de archivos
sudo tar -czf $BACKUP_DIR/wuten-files-$DATE.tar.gz /var/www/html/wuten

# Backup de base de datos
sudo mysqldump -u root -p wuten > $BACKUP_DIR/wuten-db-$DATE.sql

# Comprimir backup de BD
sudo gzip $BACKUP_DIR/wuten-db-$DATE.sql

# Limpiar backups antiguos (mantener últimos 7 días)
sudo find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
sudo find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completado: $DATE"
```

### Monitoreo de Recursos
```bash
# Verificar uso de disco
df -h

# Verificar uso de memoria
free -h

# Verificar procesos
ps aux | grep -E "(apache|php|mysql)"
```

---

## 🐛 Troubleshooting

### Problema: Error 500 - Internal Server Error
```bash
# Verificar logs de error
sudo tail -f /var/log/apache2/error.log

# Verificar permisos
sudo chown -R www-data:www-data /var/www/html/wuten
sudo chmod -R 755 /var/www/html/wuten

# Verificar configuración de PHP
php -v
php -m | grep -E "(mysql|curl|gd)"
```

### Problema: Error de conexión a base de datos
```bash
# Verificar estado de MySQL
sudo systemctl status mysql

# Verificar conexión
sudo mysql -u root -p -e "SHOW DATABASES;"

# Verificar configuración en backend/config.php
sudo nano /var/www/html/wuten/backend/config.php
```

### Problema: Archivos no se cargan
```bash
# Verificar configuración de Apache
sudo apache2ctl configtest

# Verificar módulos habilitados
sudo apache2ctl -M

# Verificar permisos de archivos
ls -la /var/www/html/wuten/
```

### Problema: CORS errors
```bash
# Verificar configuración de CORS en backend
sudo nano /var/www/html/wuten/backend/production.config.php

# Verificar headers en Apache
sudo a2enmod headers
sudo systemctl reload apache2
```

### Comandos de Diagnóstico
```bash
# Verificar estado general del servidor
sudo systemctl status apache2 mysql

# Verificar espacio en disco
df -h

# Verificar memoria disponible
free -h

# Verificar conexiones de red
netstat -tulpn | grep :80

# Verificar logs en tiempo real
sudo tail -f /var/log/apache2/access.log
```

---

## 📞 Soporte y Contacto

### Información de Contacto
- **Desarrollador**: [Tu contacto]
- **Administrador de Sistemas**: [Contacto del admin]
- **Hosting**: AWS Support

### Recursos Útiles
- [Documentación de Apache](https://httpd.apache.org/docs/)
- [Documentación de PHP](https://www.php.net/manual/)
- [Guía de AWS EC2](https://docs.aws.amazon.com/ec2/)
- [Documentación de PuTTY](https://www.putty.org/)

---

## 📝 Checklist de Despliegue

- [ ] Conectar a instancia AWS
- [ ] Instalar dependencias del sistema
- [ ] Clonar repositorio o subir archivos
- [ ] Configurar permisos
- [ ] Configurar Apache Virtual Host
- [ ] Configurar base de datos
- [ ] Probar endpoints
- [ ] Verificar logs
- [ ] Configurar backups
- [ ] Configurar monitoreo
- [ ] Documentar configuración

---

**Última actualización**: $(date)  
**Versión**: 1.0.0  
**Compatible con**: AWS Linux, Ubuntu 20.04+ 