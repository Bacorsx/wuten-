# Guía de Instalación Wuten en AWS Linux

## 📋 Prerrequisitos

- Instancia AWS Linux 2 o Amazon Linux 2023
- Acceso SSH a la instancia
- Git configurado en la instancia
- Permisos de sudo

## 🚀 Instalación Paso a Paso

### Paso 1: Conectar a la instancia AWS

```bash
# Usando PuTTY (Windows)
# Conectar a tu IP: 54.163.209.36
# Usuario: ec2-user

# O usando SSH directo
ssh -i tu-key.pem ec2-user@54.163.209.36
```

### Paso 2: Limpiar instalación anterior (si existe)

```bash
# Descargar script de limpieza
wget https://raw.githubusercontent.com/Bacorsx/wuten-/main/cleanup-aws.sh

# Dar permisos de ejecución
chmod +x cleanup-aws.sh

# Ejecutar limpieza
./cleanup-aws.sh
```

### Paso 3: Instalación completa automática

```bash
# Descargar script de instalación
wget https://raw.githubusercontent.com/Bacorsx/wuten-/main/install-wuten-aws.sh

# Dar permisos de ejecución
chmod +x install-wuten-aws.sh

# Editar el script para cambiar la URL del repositorio
nano install-wuten-aws.sh

# Cambiar esta línea:
# REPO_URL="https://github.com/tu-usuario/react-wuten.git"
# Por:
# REPO_URL="https://github.com/Bacorsx/wuten-.git"

# Ejecutar instalación
./install-wuten-aws.sh
```

### Paso 4: Verificación manual (opcional)

Si prefieres hacer la instalación manualmente:

```bash
# 1. Instalar Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# 2. Verificar instalación
node --version
npm --version

# 3. Crear directorio
sudo mkdir -p /var/www/html/wuten
sudo chown ec2-user:ec2-user /var/www/html/wuten

# 4. Clonar repositorio
cd /var/www/html/wuten
git clone https://github.com/Bacorsx/wuten-.git .

# 5. Instalar dependencias
npm install

# 6. Construir proyecto
npm run build

# 7. Configurar permisos
sudo chown -R apache:apache /var/www/html/wuten
sudo chmod -R 755 /var/www/html/wuten

# 8. Crear configuración Apache
sudo nano /etc/httpd/conf.d/wuten.conf
```

**Contenido para wuten.conf:**
```apache
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
```

```bash
# 9. Crear .htaccess
sudo nano /var/www/html/wuten/dist/.htaccess
```

**Contenido para .htaccess:**
```apache
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
```

```bash
# 10. Verificar configuración
sudo httpd -t

# 11. Iniciar Apache
sudo systemctl start httpd
sudo systemctl enable httpd

# 12. Configurar firewall
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

## 🔍 Verificación

### Verificar que Apache esté ejecutándose:
```bash
sudo systemctl status httpd
```

### Verificar que los archivos estén en su lugar:
```bash
ls -la /var/www/html/wuten/dist/
ls -la /var/www/html/wuten/dist/assets/
```

### Verificar logs:
```bash
sudo tail -f /etc/httpd/logs/wuten_error.log
```

### Probar acceso:
```bash
curl -I http://54.163.209.36/
curl -I http://54.163.209.36/wuten/
```

## 🌐 URLs de Acceso

Una vez instalado, tu aplicación estará disponible en:

- **URL Principal:** http://54.163.209.36/
- **URL con prefijo:** http://54.163.209.36/wuten/

## 🔧 Comandos Útiles

### Reiniciar Apache:
```bash
sudo systemctl restart httpd
```

### Ver logs en tiempo real:
```bash
sudo tail -f /etc/httpd/logs/wuten_error.log
sudo tail -f /etc/httpd/logs/wuten_access.log
```

### Actualizar aplicación:
```bash
cd /var/www/html/wuten
git pull origin main
npm install
npm run build
sudo chown -R apache:apache /var/www/html/wuten
sudo systemctl reload httpd
```

### Verificar permisos:
```bash
ls -la /var/www/html/wuten/
ls -la /var/www/html/wuten/dist/
```

## 🚨 Solución de Problemas

### Error 404 en assets:
- Verificar que el archivo `.htaccess` existe en `/var/www/html/wuten/dist/`
- Verificar permisos: `sudo chown -R apache:apache /var/www/html/wuten`
- Verificar configuración Apache: `sudo httpd -t`

### Error de permisos:
```bash
sudo chown -R apache:apache /var/www/html/wuten
sudo chmod -R 755 /var/www/html/wuten
```

### Apache no inicia:
```bash
sudo systemctl status httpd
sudo journalctl -u httpd -f
```

### SELinux bloqueando:
```bash
sudo setenforce 0  # Temporal
# O configurar SELinux correctamente
sudo setsebool -P httpd_can_network_connect 1
```

## 📝 Notas Importantes

1. **IP Dinámica:** Si tu IP cambia, actualiza `ServerName` en `/etc/httpd/conf.d/wuten.conf`
2. **Backup:** Siempre haz backup antes de actualizar: `sudo cp /etc/httpd/conf.d/wuten.conf /etc/httpd/conf.d/wuten.conf.backup`
3. **Logs:** Revisa los logs regularmente para detectar problemas
4. **Seguridad:** Considera configurar HTTPS con Let's Encrypt para producción

## 🎯 Resultado Final

Después de completar todos los pasos, deberías tener:

✅ Node.js y npm instalados  
✅ Repositorio clonado y construido  
✅ Apache configurado correctamente  
✅ Aplicación accesible en http://54.163.209.36/  
✅ Assets cargando correctamente  
✅ Logs funcionando  
✅ Firewall configurado 