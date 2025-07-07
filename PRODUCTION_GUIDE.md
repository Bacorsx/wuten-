# 🚀 GUÍA DE PRODUCCIÓN - WUTEN INMOBILIARIA

## 📋 Índice
1. [Preparación para Producción](#preparación-para-producción)
2. [Despliegue Automatizado](#despliegue-automatizado)
3. [Configuración de Seguridad](#configuración-de-seguridad)
4. [Optimizaciones de Rendimiento](#optimizaciones-de-rendimiento)
5. [Monitoreo y Logging](#monitoreo-y-logging)
6. [Mantenimiento](#mantenimiento)
7. [Troubleshooting](#troubleshooting)

---

## 🛠️ Preparación para Producción

### 1. Verificar Configuración

Antes de desplegar, asegúrate de que:

```bash
# Verificar configuración de IP
npm run check:ip

# Verificar archivos de entorno
ls -la .env.production

# Verificar dependencias
npm audit
```

### 2. Configurar Variables de Entorno

Edita `.env.production` con los valores correctos:

```env
# Configuración de la aplicación
VITE_APP_ENV=production
VITE_APP_TITLE=Wuten Inmobiliaria
VITE_APP_VERSION=1.0.0

# URL de la API (IP de AWS)
VITE_API_URL=http://54.163.209.36/wuten-/backend

# Configuración de seguridad
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_REPORTING=true
```

### 3. Actualizar IP de AWS

```bash
# Actualizar IP automáticamente
npm run update-ip

# O manualmente editando config/ip-config.js
```

---

## 🚀 Despliegue Automatizado

### Despliegue Completo

```bash
# Despliegue completo (actualiza IP + build + optimización)
npm run deploy:full
```

### Despliegue Manual

```bash
# 1. Actualizar IP
npm run update-ip

# 2. Construir para producción
npm run build:aws

# 3. Ejecutar script de despliegue
npm run deploy:prod
```

### En el Servidor AWS

```bash
# 1. Subir archivos al servidor
scp -r dist/* usuario@54.163.209.36:/tmp/wuten-build/

# 2. Conectar al servidor
ssh usuario@54.163.209.36

# 3. Ejecutar script de despliegue
cd /tmp/wuten-build
chmod +x deploy-to-server.sh
./deploy-to-server.sh
```

---

## 🔒 Configuración de Seguridad

### 1. Headers de Seguridad

El archivo `.htaccess.production` incluye:

- **X-XSS-Protection**: Protección contra XSS
- **X-Content-Type-Options**: Prevenir MIME sniffing
- **X-Frame-Options**: Prevenir clickjacking
- **Content-Security-Policy**: Política de seguridad de contenido
- **HSTS**: HTTP Strict Transport Security

### 2. Configuración de PHP

```php
// Archivo: backend/production.config.php
error_reporting(E_ALL & ~E_DEPRECATED & ~E_STRICT);
ini_set('display_errors', 0);
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 1);
```

### 3. Validación de Entrada

```php
// Ejemplo de uso
$email = validarEntrada($_POST['email'], 'email');
$nombre = validarEntrada($_POST['nombre'], 'string');
```

### 4. Rate Limiting

```php
// Verificar límite de requests
if (!verificarRateLimit($_SERVER['REMOTE_ADDR'])) {
    http_response_code(429);
    exit('Too Many Requests');
}
```

---

## ⚡ Optimizaciones de Rendimiento

### 1. Frontend (Vite)

- **Code Splitting**: Separación automática de chunks
- **Tree Shaking**: Eliminación de código no utilizado
- **Minificación**: Compresión de archivos JS/CSS
- **Caching**: Headers de caché optimizados

### 2. Backend (PHP)

- **Compresión GZIP**: Archivos comprimidos automáticamente
- **Conexiones Persistentes**: Mejor rendimiento de BD
- **Caching de Consultas**: Reducción de carga en BD

### 3. Base de Datos

```sql
-- Índices recomendados
CREATE INDEX idx_propiedades_estado ON propiedades(estado);
CREATE INDEX idx_propiedades_precio ON propiedades(precio);
CREATE INDEX idx_usuarios_email ON usuarios(email);
```

### 4. Imágenes

- **Optimización automática**: Compresión de imágenes
- **Lazy Loading**: Carga diferida de imágenes
- **Formatos modernos**: WebP cuando sea posible

---

## 📊 Monitoreo y Logging

### 1. Logging de Producción

```javascript
// En el frontend
import { logProduction } from './config/production';

logProduction('Usuario inició sesión', 'info', { userId: 123 });
```

```php
// En el backend
logProduccion('Nueva propiedad creada', 'INFO');
```

### 2. Monitoreo de Errores

```javascript
// Captura automática de errores
import { handleProductionError } from './config/production';

window.addEventListener('error', (event) => {
    handleProductionError(event.error);
});
```

### 3. Métricas de Rendimiento

```javascript
// Tracking de métricas
import { trackPerformance } from './config/production';

// First Contentful Paint
trackPerformance('FCP', performance.now());
```

### 4. Endpoints de Monitoreo

- `/backend/heartbeat.php` - Estado del servidor
- `/backend/log.php` - Logging remoto
- `/backend/error-report.php` - Reporte de errores
- `/backend/analytics.php` - Métricas de rendimiento

---

## 🔧 Mantenimiento

### 1. Backups Automáticos

```bash
# Script de backup automático
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u root -p wuten > backup_$DATE.sql
tar -czf backup_$DATE.tar.gz backup_$DATE.sql
```

### 2. Limpieza de Logs

```bash
# Limpiar logs antiguos (ejecutar semanalmente)
find /var/log/php -name "*.log" -mtime +7 -delete
find /var/log/apache2 -name "*.log" -mtime +30 -delete
```

### 3. Actualización de Dependencias

```bash
# Verificar actualizaciones de seguridad
npm audit
npm audit fix

# Actualizar dependencias
npm update
```

### 4. Monitoreo de Recursos

```bash
# Verificar uso de disco
df -h

# Verificar uso de memoria
free -h

# Verificar procesos PHP
ps aux | grep php
```

---

## 🐛 Troubleshooting

### Problemas Comunes

#### 1. Error 500 - Internal Server Error

```bash
# Verificar logs de error
tail -f /var/log/php/error.log
tail -f /var/log/apache2/error.log

# Verificar permisos
ls -la /var/www/html/wuten/
chmod -R 755 /var/www/html/wuten/
chown -R www-data:www-data /var/www/html/wuten/
```

#### 2. Problemas de CORS

```php
// Verificar configuración en production.config.php
function configurarCORS() {
    $origenesPermitidos = [
        'http://localhost:3000',
        'http://54.163.209.36',
        'https://54.163.209.36'
    ];
}
```

#### 3. Problemas de Base de Datos

```bash
# Verificar conexión
mysql -u root -p -e "USE wuten; SHOW TABLES;"

# Verificar configuración
cat /etc/mysql/mysql.conf.d/mysqld.cnf | grep max_connections
```

#### 4. Problemas de Rendimiento

```bash
# Verificar uso de CPU
top

# Verificar conexiones de red
netstat -tulpn | grep :80

# Verificar logs de acceso
tail -f /var/log/apache2/access.log
```

### Comandos de Diagnóstico

```bash
# Verificar estado del servidor
curl -I http://54.163.209.36/wuten-/backend/heartbeat.php

# Verificar configuración de PHP
php -i | grep -E "(memory_limit|max_execution_time)"

# Verificar módulos de Apache
apache2ctl -M | grep -E "(deflate|headers|expires)"

# Verificar SSL (si está configurado)
openssl s_client -connect 54.163.209.36:443
```

---

## 📞 Soporte

### Contactos de Emergencia

- **Desarrollador**: [Tu contacto]
- **Administrador de Sistemas**: [Contacto del admin]
- **Hosting**: AWS Support

### Recursos Útiles

- [Documentación de Vite](https://vitejs.dev/guide/)
- [Documentación de PHP](https://www.php.net/manual/)
- [Guía de Seguridad de Apache](https://httpd.apache.org/docs/2.4/misc/security_tips.html)
- [Mejores Prácticas de MySQL](https://dev.mysql.com/doc/refman/8.0/en/optimization.html)

---

## 📝 Checklist de Producción

- [ ] Variables de entorno configuradas
- [ ] IP de AWS actualizada
- [ ] Archivos de configuración de producción copiados
- [ ] Dependencias actualizadas
- [ ] Tests ejecutados
- [ ] Build de producción generado
- [ ] Archivos subidos al servidor
- [ ] Permisos configurados
- [ ] Logs verificados
- [ ] Funcionalidad probada
- [ ] Monitoreo configurado
- [ ] Backup inicial creado

---

**Última actualización**: $(date)
**Versión**: 1.0.0 