# 🚀 Guía de Despliegue en AWS - Wuten Inmobiliaria

## 📋 Resumen

Esta guía te ayudará a desplegar la aplicación Wuten Inmobiliaria en AWS Linux, configurando las variables de entorno para manejar IPs dinámicas.

## 🎯 Configuración de Variables de Entorno

### 1. Archivos de Entorno

El proyecto ahora usa variables de entorno de Vite para manejar diferentes configuraciones:

#### `.env` (Desarrollo Local)
```env
VITE_API_URL=http://localhost/wuten/backend
VITE_APP_TITLE=Wuten Inmobiliaria
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development
```

#### `.env.production` (AWS Producción)
```env
VITE_API_URL=http://TU_IP_AWS/wuten-/backend
VITE_APP_TITLE=Wuten Inmobiliaria
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=production
```

**📁 Archivos de ejemplo disponibles:**
- `env.example` - Plantilla completa para desarrollo con comentarios explicativos
- `env.production.example` - Plantilla para AWS con checklist de despliegue y solución de problemas

### 2. Configuración Automática

El proyecto detecta automáticamente el entorno y usa la configuración correspondiente:

- **Desarrollo**: `npm run dev` → usa `.env`
- **Producción**: `npm run build --mode production` → usa `.env.production`

## 🛠️ Pasos de Despliegue

### Paso 1: Preparar el Proyecto Local

```bash
# Clonar el repositorio
git clone <tu-repositorio>
cd react-wuten

# Instalar dependencias
npm install

# Configurar archivos de entorno
npm run setup:all      # Crea ambos archivos de entorno
# O individualmente:
npm run setup:local    # Crea .env para desarrollo
npm run setup:aws      # Crea .env.production para AWS
```

### Paso 2: Configurar Variables de Entorno

#### Para Desarrollo Local:
```bash
# Editar .env
VITE_API_URL=http://localhost/wuten/backend
```

#### Para AWS:
```bash
# Editar .env.production
VITE_API_URL=http://TU_IP_AWS/wuten-/backend
```

**⚠️ Importante**: Reemplaza `TU_IP_AWS` con la IP actual de tu instancia AWS cada vez que reinicies la instancia (a menos que uses IP Elástica).

### Paso 3: Construir para Producción

```bash
# Construir para AWS
npm run build:aws

# O alternativamente:
npm run build --mode production
```

### Paso 4: Desplegar en AWS

#### Opción A: Subir archivos manualmente
```bash
# Construir el proyecto
npm run build:aws

# Subir la carpeta dist/ a tu servidor AWS
# Usar SCP, SFTP, o el método que prefieras
scp -r dist/ usuario@tu-ip-aws:/var/www/html/
```

#### Opción B: Usar script de despliegue
```bash
# Ejecutar script de despliegue
npm run deploy:aws
```

## 🔧 Configuración del Servidor AWS

### 1. Instalar Software Necesario

```bash
# Actualizar sistema
sudo yum update -y

# Instalar Apache
sudo yum install httpd -y
sudo systemctl start httpd
sudo systemctl enable httpd

# Instalar PHP
sudo yum install php php-mysqlnd php-json -y

# Instalar MySQL/MariaDB
sudo yum install mariadb-server mariadb -y
sudo systemctl start mariadb
sudo systemctl enable mariadb
```

### 2. Configurar Apache

```bash
# Crear directorio para la aplicación
sudo mkdir -p /var/www/html/wuten

# Configurar permisos
sudo chown -R apache:apache /var/www/html/wuten
sudo chmod -R 755 /var/www/html/wuten
```

### 3. Configurar Base de Datos

```bash
# Configurar MySQL
sudo mysql_secure_installation

# Crear base de datos
mysql -u root -p
CREATE DATABASE wuten;
USE wuten;
# Importar estructura de base de datos
source /path/to/your/database.sql;
```

## 📁 Estructura de Archivos en AWS

```
/var/www/html/
├── wuten/                    # Frontend React (carpeta dist/)
│   ├── index.html
│   ├── assets/
│   └── ...
└── wuten-/                   # Backend PHP
    ├── backend/
    │   ├── config.php
    │   ├── api_login.php
    │   └── ...
    └── public/
        └── img/
```

## 🔄 Actualización de IP Dinámica

### Método 1: Script Automático

Crear un script que actualice automáticamente la IP:

```bash
#!/bin/bash
# update-ip.sh

# Obtener IP actual
CURRENT_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

# Actualizar .env.production
sed -i "s|VITE_API_URL=http://.*/wuten-/backend|VITE_API_URL=http://$CURRENT_IP/wuten-/backend|g" .env.production

# Reconstruir aplicación
npm run build:aws

echo "IP actualizada a: $CURRENT_IP"
```

### Método 2: IP Elástica (Recomendado)

1. **Asignar IP Elástica** en AWS Console
2. **Asociar** la IP a tu instancia
3. **Usar la IP Elástica** en `.env.production`

```env
VITE_API_URL=http://TU_IP_ELASTICA/wuten-/backend
```

## 🧪 Verificación del Despliegue

### 1. Verificar Frontend
```bash
# Acceder a la aplicación
http://TU_IP_AWS/wuten/
```

### 2. Verificar Backend
```bash
# Probar endpoint de heartbeat
curl http://TU_IP_AWS/wuten-/backend/heartbeat.php

# Verificar configuración del entorno
curl http://TU_IP_AWS/wuten-/backend/check_environment.php
```

### 3. Usar Componente de Verificación

En la aplicación, puedes usar el componente `EnvironmentInfo` para verificar la configuración:

```jsx
import EnvironmentInfo from './components/EnvironmentInfo';

// En tu componente
<EnvironmentInfo show={true} />
```

## 🔍 Comandos Útiles

### Desarrollo Local
```bash
npm run dev              # Desarrollo local
npm run dev:local        # Desarrollo con modo explícito
npm run check-env        # Verificar variables de entorno
```

### Producción AWS
```bash
npm run build:aws        # Construir para AWS
npm run deploy:aws       # Desplegar a AWS
npm run preview:prod     # Vista previa de producción
```

### Verificación
```bash
# Verificar configuración del entorno
npm run check-env

# Verificar conexión a la base de datos
curl http://localhost/wuten/backend/check_environment.php
```

## 🚨 Solución de Problemas

### Error: "Cannot find module"
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Error: "API URL not found"
```bash
# Verificar archivo .env
cat .env

# Verificar variables de entorno
npm run check-env
```

### Error: "Database connection failed"
```bash
# Verificar configuración de MySQL
sudo systemctl status mariadb

# Verificar credenciales en backend/config.php
```

### Error: "CORS issues"
```bash
# Verificar configuración de Apache
sudo nano /etc/httpd/conf/httpd.conf

# Agregar headers CORS si es necesario
Header always set Access-Control-Allow-Origin "*"
```

## 📝 Notas Importantes

1. **IP Dinámica**: Si no usas IP Elástica, actualiza `VITE_API_URL` en `.env.production` cada vez que reinicies la instancia.

2. **Seguridad**: En producción, considera usar HTTPS y configurar CORS apropiadamente.

3. **Backup**: Haz backup regular de la base de datos y archivos de configuración.

4. **Monitoreo**: Usa el componente `EnvironmentInfo` para monitorear el estado de la aplicación.

## 🎉 ¡Listo!

Tu aplicación Wuten Inmobiliaria está ahora configurada para usar variables de entorno y puede ser desplegada fácilmente en AWS con IPs dinámicas.

Para actualizar la IP en el futuro, simplemente:
1. Edita `.env.production`
2. Ejecuta `npm run build:aws`
3. Sube la nueva carpeta `dist/` a tu servidor

---

**Desarrollado con ❤️ para Wuten Inmobiliaria** 