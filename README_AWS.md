# 🚀 Wuten Inmobiliaria - Guía Completa de Despliegue AWS

## 📋 Descripción del Proyecto

**Wuten Inmobiliaria** es una aplicación web React para gestión inmobiliaria con backend PHP, diseñada para funcionar en instancias AWS Linux con IP dinámica.

## 🏗️ Arquitectura

- **Frontend:** React + Vite
- **Backend:** PHP (Apache)
- **Servidor:** AWS Linux 2 / Amazon Linux 2023
- **Base de Datos:** MySQL/MariaDB
- **Gestión DB:** phpMyAdmin
- **Configuración:** Sistema centralizado de IP dinámica

## 🚀 PASO A PASO COMPLETO DE DESPLIEGUE

### 📋 Prerrequisitos

- ✅ Instancia AWS Linux 2 o Amazon Linux 2023
- ✅ Acceso SSH a la instancia
- ✅ Git configurado
- ✅ Permisos de sudo
- ✅ Base de datos funcional "wuten" (para migrar)

### 🚀 Instalación Automática (Después del LAMP Stack)

```bash
# 1. Conectar a tu instancia AWS
ssh -i tu-key.pem ec2-user@TU_IP_AWS

# 2. Limpiar instalación anterior (si existe)
wget https://raw.githubusercontent.com/tu-usuario/react-wuten/main/cleanup-aws.sh
chmod +x cleanup-aws.sh
./cleanup-aws.sh

# 3. Configurar Base de Datos (después del LAMP stack)
wget https://raw.githubusercontent.com/tu-usuario/react-wuten/main/setup-database.sh
chmod +x setup-database.sh
./setup-database.sh

# 4. Instalación de la aplicación
wget https://raw.githubusercontent.com/tu-usuario/react-wuten/main/install-wuten-aws.sh
chmod +x install-wuten-aws.sh

# Editar la URL del repositorio si es necesario
nano install-wuten-aws.sh
# Cambiar: REPO_URL="https://github.com/tu-usuario/react-wuten.git"

# Ejecutar instalación
./install-wuten-aws.sh
```

---

## 🔧 PASO 1: PREPARACIÓN DE LA INSTANCIA AWS

### 1.1 Crear Instancia AWS
```bash
# Configuración recomendada:
# - Tipo: t3.micro (gratis) o t3.small (recomendado)
# - Sistema: Amazon Linux 2023
# - Almacenamiento: 20GB mínimo
# - Grupos de seguridad: 
#   * SSH (puerto 22) - para conexión remota
#   * HTTP (puerto 80) - para acceso web
#   * HTTPS (puerto 443) - para SSL (opcional)
#   * MySQL/Aurora (puerto 3306) - para acceso remoto a BD (opcional)

# Referencia: https://docs.aws.amazon.com/es_es/linux/al2023/ug/ec2-lamp-amazon-linux-2023.html
```

### 1.2 Conectar a la Instancia
```bash
# Conectar via SSH
ssh -i tu-key.pem ec2-user@TU_IP_AWS

# Actualizar sistema
sudo dnf upgrade -y
```

### 1.3 Configurar IP Elástica (Recomendado)
```bash
# En la consola AWS:
# 1. Ir a EC2 > Elastic IPs
# 2. Allocate Elastic IP
# 3. Associate con tu instancia
# 4. Anotar la IP elástica
```

---

## 🗄️ PASO 2: INSTALACIÓN MANUAL DE LAMP STACK

**⚠️ IMPORTANTE:** Este paso debe realizarse MANUALMENTE siguiendo la [documentación oficial de AWS](https://docs.aws.amazon.com/es_es/linux/al2023/ug/ec2-lamp-amazon-linux-2023.html) antes de continuar con la instalación de la aplicación.

### 2.1 Actualizar Sistema
```bash
# Actualizar todos los paquetes de software
sudo dnf upgrade -y
```

### 2.2 Instalar Apache y PHP
```bash
# Instalar Apache y PHP (versión 8.1 en AL2023)
sudo dnf install -y httpd wget php-fpm php-mysqli php-json php php-devel

# Iniciar y habilitar Apache
sudo systemctl start httpd
sudo systemctl enable httpd

# Verificar estado
sudo systemctl status httpd
sudo systemctl is-enabled httpd
```

### 2.3 Instalar MariaDB
```bash
# Instalar MariaDB 10.5 (versión disponible en AL2023)
sudo dnf install mariadb105-server

# Verificar versión instalada
sudo dnf info mariadb105

# Iniciar y habilitar MariaDB
sudo systemctl start mariadb
sudo systemctl enable mariadb

# Verificar estado
sudo systemctl status mariadb
```

### 2.4 Configurar MariaDB
```bash
# Ejecutar configuración de seguridad
sudo mysql_secure_installation

# Respuestas recomendadas:
# - Enter current password for root: [Enter] (vacío)
# - Set root password? [Y/n]: Y
# - New password: [Tu contraseña segura]
# - Remove anonymous users? [Y/n]: Y
# - Disallow root login remotely? [Y/n]: Y
# - Remove test database? [Y/n]: Y
# - Reload privilege tables? [Y/n]: Y
```

### 2.5 Instalar phpMyAdmin
```bash
# Instalar dependencias requeridas
sudo dnf install php-mbstring php-xml -y

# Reiniciar servicios
sudo systemctl restart httpd
sudo systemctl restart php-fpm

# Navegar al directorio de documentos de Apache
cd /var/www/html

# Descargar phpMyAdmin más reciente
wget https://www.phpmyadmin.net/downloads/phpMyAdmin-latest-all-languages.tar.gz

# Crear directorio y extraer
mkdir phpMyAdmin && tar -xvzf phpMyAdmin-latest-all-languages.tar.gz -C phpMyAdmin --strip-components 1

# Limpiar archivo descargado
rm phpMyAdmin-latest-all-languages.tar.gz

# Configurar acceso (opcional - para desarrollo)
sudo nano /etc/httpd/conf.d/phpMyAdmin.conf
# Comentar las líneas de restricción IP si es necesario
```

---

## 🗃️ PASO 3: CONFIGURACIÓN DE BASE DE DATOS

**💡 OPCIÓN A:** Configuración Manual (recomendada para producción)
**💡 OPCIÓN B:** Script Automático (para desarrollo/pruebas)

### 3.1 Crear Base de Datos y Usuario (Manual)
```bash
# Conectar a MariaDB
sudo mysql -u root -p

# Crear base de datos
CREATE DATABASE wuten CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Crear usuario
CREATE USER 'wuten_user'@'localhost' IDENTIFIED BY 'TuPasswordSegura123!';

# Asignar permisos
GRANT ALL PRIVILEGES ON wuten.* TO 'wuten_user'@'localhost';
FLUSH PRIVILEGES;

# Verificar
SHOW DATABASES;
SELECT User, Host FROM mysql.user;

# Salir
EXIT;
```

### 3.2 Migrar Base de Datos Existente
```bash
# En tu servidor actual (WAMP/XAMPP):
mysqldump -u root -p wuten > wuten_backup.sql

# Transferir archivo a AWS (desde tu PC):
scp -i tu-key.pem wuten_backup.sql ec2-user@TU_IP_AWS:~/

# En AWS, importar la base de datos:
mysql -u wuten_user -p wuten < wuten_backup.sql

# Verificar importación
mysql -u wuten_user -p wuten -e "SHOW TABLES;"
```

### 3.3 Verificar phpMyAdmin
```bash
# Acceder a phpMyAdmin
# URL: http://TU_IP_ELASTICA/phpMyAdmin
# Usuario: root (para configuración inicial)
# Contraseña: [La contraseña que configuraste en mysql_secure_installation]

# Verificar que la base de datos "wuten" esté presente
# Verificar que las tablas estén importadas correctamente

# Nota: Para producción, se recomienda crear un usuario específico para la aplicación
```

### 3.4 Configuración Automática (Alternativa)

Si prefieres usar el script automático para configurar la base de datos:

```bash
# Descargar y ejecutar script de configuración
wget https://raw.githubusercontent.com/tu-usuario/react-wuten/main/setup-database.sh
chmod +x setup-database.sh
./setup-database.sh
```

**⚠️ NOTA:** El script automático solicitará las contraseñas de forma interactiva.

---

## 🚀 PASO 4: INSTALACIÓN DE LA APLICACIÓN

**✅ PREREQUISITO:** Asegúrate de haber completado los pasos 1, 2 y 3 (LAMP stack y base de datos configurados).

### 4.1 Instalar Node.js
```bash
# Instalar Node.js 18.x
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo dnf install -y nodejs

# Verificar instalación
node --version
npm --version
```

### 4.2 Clonar y Configurar Proyecto
```bash
# Crear directorio de la aplicación
sudo mkdir -p /var/www/html/wuten
sudo chown ec2-user:ec2-user /var/www/html/wuten

# Clonar repositorio
cd /var/www/html/wuten
git clone https://github.com/tu-usuario/react-wuten.git .

# Instalar dependencias
npm install

# Verificar instalación
npm run check-env
```

### 4.3 Configurar Variables de Entorno
```bash
# Crear archivo de configuración de producción
cp env.production.example .env.production

# Editar configuración
nano .env.production

# Configurar con tu IP elástica:
VITE_API_URL=http://TU_IP_ELASTICA/wuten/backend
VITE_APP_ENV=production
```

### 4.4 Construir Aplicación
```bash
# Construir para producción
npm run build:aws

# Verificar que se creó la carpeta dist
ls -la dist/
```

### 4.5 Configurar Permisos
```bash
# Asignar permisos correctos
sudo chown -R apache:apache /var/www/html/wuten
sudo chmod -R 755 /var/www/html/wuten

# Verificar permisos
ls -la /var/www/html/wuten/
```

---

## 🌐 PASO 5: CONFIGURACIÓN DE APACHE

### 5.1 Aplicar Configuración Robusta
```bash
# Descargar script de configuración
wget https://raw.githubusercontent.com/tu-usuario/react-wuten/main/apply-robust-config.sh
chmod +x apply-robust-config.sh

# Editar script para tu IP
nano apply-robust-config.sh
# Cambiar: ServerName TU_IP_ELASTICA

# Ejecutar configuración
./apply-robust-config.sh
```

### 5.2 Verificar Configuración
```bash
# Verificar sintaxis de Apache
sudo httpd -t

# Si hay errores, revisar configuración
sudo nano /etc/httpd/conf.d/wuten.conf

# Reiniciar Apache
sudo systemctl restart httpd
```

### 5.3 Configurar Grupos de Seguridad AWS
```bash
# En la consola AWS EC2:
# 1. Ir a Instances > Seleccionar tu instancia
# 2. En la pestaña Security, hacer clic en el grupo de seguridad
# 3. Agregar reglas de entrada:
#    - Tipo: HTTP, Puerto: 80, Fuente: 0.0.0.0/0
#    - Tipo: HTTPS, Puerto: 443, Fuente: 0.0.0.0/0
#    - Tipo: MySQL/Aurora, Puerto: 3306, Fuente: 0.0.0.0/0 (solo si necesitas acceso remoto)

# Verificar configuración local (si usas firewalld)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
sudo firewall-cmd --list-services
```

---

## 🔧 PASO 6: CONFIGURACIÓN DEL BACKEND

### 6.1 Configurar Conexión a Base de Datos
```bash
# Editar configuración del backend
nano backend/config.php

# Verificar que use las variables de entorno correctas:
# $host = getenv('DB_HOST') ?: 'localhost';
# $usuario = getenv('DB_USER') ?: 'wuten_user';
# $password = getenv('DB_PASSWORD') ?: 'TuPasswordSegura123!';
# $base_datos = getenv('DB_NAME') ?: 'wuten';
```

### 6.2 Configurar Variables de Entorno del Sistema
```bash
# Crear archivo de variables de entorno
sudo nano /etc/environment

# Agregar:
DB_HOST=localhost
DB_USER=wuten_user
DB_PASSWORD=TuPasswordSegura123!
DB_NAME=wuten
APP_ENV=production

# Recargar variables
source /etc/environment
```

### 6.3 Verificar Backend
```bash
# Probar conexión a base de datos
curl http://TU_IP_ELASTICA/wuten/backend/test_connection.php

# Verificar configuración del entorno
curl http://TU_IP_ELASTICA/wuten/backend/check_environment.php
```

---

## ✅ PASO 7: VERIFICACIÓN FINAL

### 7.1 Verificar URLs de Acceso
```bash
# URLs principales:
# - http://TU_IP_ELASTICA/ (página de prueba de Apache)
# - http://TU_IP_ELASTICA/wuten/ (aplicación principal)
# - http://TU_IP_ELASTICA/phpMyAdmin (gestión de base de datos)

# Probar acceso
curl -I http://TU_IP_ELASTICA/
curl -I http://TU_IP_ELASTICA/wuten/

# Verificar que aparece "It works!" en la página principal de Apache
```

### 7.2 Verificar Funcionalidad
```bash
# Verificar logs de Apache
sudo tail -f /etc/httpd/logs/wuten_error.log
sudo tail -f /etc/httpd/logs/wuten_access.log

# Verificar estado de servicios
sudo systemctl status httpd
sudo systemctl status mariadb
```

### 7.3 Checklist de Verificación
- [ ] ✅ Apache ejecutándose
- [ ] ✅ MariaDB ejecutándose
- [ ] ✅ phpMyAdmin accesible
- [ ] ✅ Base de datos "wuten" importada
- [ ] ✅ Frontend React cargando
- [ ] ✅ Backend PHP respondiendo
- [ ] ✅ Conexión a base de datos funcionando
- [ ] ✅ Logs sin errores críticos

---

## 🔧 COMANDOS ÚTILES DE MANTENIMIENTO

### Reiniciar Servicios
```bash
# Reiniciar Apache
sudo systemctl restart httpd

# Reiniciar MariaDB
sudo systemctl restart mariadb

# Recargar configuración Apache
sudo systemctl reload httpd
```

### Actualizar Aplicación
```bash
# Actualizar código
cd /var/www/html/wuten
git pull origin main

# Reinstalar dependencias (si es necesario)
npm install

# Reconstruir
npm run build:aws

# Actualizar permisos
sudo chown -R apache:apache /var/www/html/wuten

# Recargar Apache
sudo systemctl reload httpd
```

### Backup de Base de Datos
```bash
# Crear backup
mysqldump -u wuten_user -p wuten > /backup/wuten_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
mysql -u wuten_user -p wuten < /backup/wuten_20241201_120000.sql
```

---

## 🚨 SOLUCIÓN DE PROBLEMAS

### No puedo conectarme al servidor web
**Síntoma:** No se puede acceder a la aplicación desde el navegador

**Solución:**
```bash
# Verificar que Apache está ejecutándose
sudo systemctl is-enabled httpd
sudo systemctl status httpd

# Verificar grupos de seguridad en AWS
# Ir a EC2 > Instances > Security Groups
# Asegurar que hay regla HTTP (puerto 80) permitida

# Verificar firewall local (si aplica)
sudo firewall-cmd --list-services
```

### Error: MIME type para JavaScript
**Síntoma:** `Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "text/html"`

**Solución:**
```bash
# Aplicar configuración robusta
./apply-robust-config.sh
```

### Error: 404 en assets
**Síntoma:** `GET http://TU_IP_AWS/assets/... 404 (Not Found)`

**Solución:**
```bash
# Verificar que los archivos existen
ls -la /var/www/html/wuten/dist/assets/

# Verificar permisos
sudo chown -R apache:apache /var/www/html/wuten

# Aplicar configuración robusta
./apply-robust-config.sh
```

### Error: Conexión a Base de Datos
**Síntoma:** `Error de conexión: Access denied for user`

**Solución:**
```bash
# Verificar credenciales
mysql -u wuten_user -p wuten

# Verificar variables de entorno
echo $DB_USER
echo $DB_PASSWORD

# Reconfigurar si es necesario
sudo nano /etc/environment
source /etc/environment
```

### Error: Apache no inicia
**Síntoma:** `Failed to start httpd.service`

**Solución:**
```bash
# Verificar configuración
sudo httpd -t

# Ver logs detallados
sudo journalctl -u httpd -f

# Restaurar configuración anterior si es necesario
sudo cp /etc/httpd/conf.d/wuten.conf.backup.* /etc/httpd/conf.d/wuten.conf
```

### Error: SELinux bloqueando
**Síntoma:** Permisos denegados a pesar de configuración correcta

**Solución:**
```bash
# Deshabilitar SELinux temporalmente
sudo setenforce 0

# O configurar SELinux correctamente
sudo setsebool -P httpd_can_network_connect 1
sudo setsebool -P httpd_unified 1
```

---

## 🔒 CONFIGURACIÓN DE SEGURIDAD

### Configurar SSL (Opcional)
```bash
# Instalar Certbot
sudo yum install -y certbot python3-certbot-apache

# Obtener certificado (si tienes dominio)
sudo certbot --apache -d tu-dominio.com

# Configurar renovación automática
sudo crontab -e
# Agregar: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Configurar Backups Automáticos
```bash
# Crear script de backup
sudo nano /usr/local/bin/backup-wuten.sh

# Contenido del script:
#!/bin/bash
BACKUP_DIR="/backup"
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u wuten_user -p'TuPasswordSegura123!' wuten > $BACKUP_DIR/wuten_$DATE.sql
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete

# Hacer ejecutable
sudo chmod +x /usr/local/bin/backup-wuten.sh

# Configurar cron job
sudo crontab -e
# Agregar: 0 2 * * * /usr/local/bin/backup-wuten.sh
```

---

## 📊 MONITOREO Y LOGS

### Logs Importantes
```bash
# Logs de error de la aplicación
sudo tail -f /etc/httpd/logs/wuten_error.log

# Logs de acceso
sudo tail -f /etc/httpd/logs/wuten_access.log

# Logs del sistema
sudo journalctl -u httpd -f
sudo journalctl -u mariadb -f
```

### Métricas Básicas
```bash
# Uso de memoria
free -h

# Uso de disco
df -h

# Procesos de Apache
ps aux | grep httpd

# Conexiones activas
sudo netstat -tulpn | grep :80
```

---

## 📞 INFORMACIÓN DE CONTACTO Y SOPORTE

### Información del Sistema
```bash
# Versión de Node.js
node --version

# Versión de npm
npm --version

# Versión de Apache
httpd -v

# Versión de MariaDB
mysql --version

# Sistema operativo
cat /etc/os-release
```

### Archivos de Configuración Importantes
- **Apache:** `/etc/httpd/conf.d/wuten.conf`
- **MariaDB:** `/etc/my.cnf`
- **PHP:** `/etc/php.ini`
- **Aplicación:** `/var/www/html/wuten/`
- **Logs:** `/etc/httpd/logs/wuten_*.log`
- **Backup:** `/etc/httpd/conf.d/wuten.conf.backup.*`

---

## 🎯 CHECKLIST FINAL DE VERIFICACIÓN

- [ ] ✅ Instancia AWS Linux 2023 creada
- [ ] ✅ IP Elástica configurada
- [ ] ✅ LAMP Stack instalado (Apache, MariaDB, PHP)
- [ ] ✅ phpMyAdmin instalado y configurado
- [ ] ✅ Base de datos "wuten" creada e importada
- [ ] ✅ Usuario de base de datos configurado
- [ ] ✅ Node.js instalado
- [ ] ✅ Repositorio clonado correctamente
- [ ] ✅ Dependencias instaladas (`npm install`)
- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ Proyecto construido (`npm run build:aws`)
- [ ] ✅ Permisos configurados (apache:apache)
- [ ] ✅ Configuración Apache aplicada
- [ ] ✅ Firewall configurado
- [ ] ✅ Apache ejecutándose (`systemctl status httpd`)
- [ ] ✅ MariaDB ejecutándose (`systemctl status mariadb`)
- [ ] ✅ Aplicación accesible en todas las URLs
- [ ] ✅ phpMyAdmin accesible
- [ ] ✅ Assets cargando correctamente
- [ ] ✅ Backend respondiendo
- [ ] ✅ Conexión a base de datos funcionando
- [ ] ✅ Logs funcionando sin errores críticos
- [ ] ✅ Backup de configuración creado

---

## 📚 RECURSOS ADICIONALES

- [Tutorial oficial AWS LAMP en AL2023](https://docs.aws.amazon.com/es_es/linux/al2023/ug/ec2-lamp-amazon-linux-2023.html)
- [Documentación de Apache](https://httpd.apache.org/docs/)
- [Guía de AWS Linux 2023](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/amazon-linux-2023-user-guide.html)
- [Documentación de MariaDB](https://mariadb.com/kb/en/documentation/)
- [Documentación de phpMyAdmin](https://docs.phpmyadmin.net/)
- [Documentación de Vite](https://vitejs.dev/guide/)
- [Documentación de React](https://react.dev/)

---

**🎉 ¡Felicidades! Tu aplicación Wuten Inmobiliaria está ahora desplegada en AWS Linux 2023 con MariaDB y phpMyAdmin.**

## 📋 RESUMEN DEL PROCESO

1. **✅ LAMP Stack:** Instalado manualmente siguiendo la documentación oficial de AWS
2. **✅ Base de Datos:** Configurada y migrada desde tu servidor actual
3. **✅ phpMyAdmin:** Instalado y configurado para gestión de base de datos
4. **✅ Aplicación:** Desplegada y funcionando correctamente

## 🔄 PRÓXIMOS PASOS RECOMENDADOS

- **Configurar SSL/TLS** para mayor seguridad
- **Configurar backups automáticos** de la base de datos
- **Monitorear logs** y rendimiento de la aplicación
- **Configurar alertas** para disponibilidad del servicio

**Nota:** Esta guía está basada en el [tutorial oficial de AWS para LAMP en Amazon Linux 2023](https://docs.aws.amazon.com/es_es/linux/al2023/ug/ec2-lamp-amazon-linux-2023.html) y optimizada para esta distribución específica. Para otras distribuciones, algunos comandos pueden variar. 