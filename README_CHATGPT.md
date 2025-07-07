# 🤖 README para ChatGPT - Wuten Inmobiliaria React + Vite

## 📋 Información del Proyecto

**Nombre:** Wuten Inmobiliaria  
**Tecnologías:** React 18 + Vite + PHP Backend  
**Propósito:** Aplicación web inmobiliaria con gestión de propiedades y usuarios  
**Estado:** Configurado para desarrollo local y despliegue en AWS  

## 🏗️ Estructura del Proyecto

```
react-wuten/
├── config/
│   └── ip-config.js              # ⭐ CONFIGURACIÓN CENTRAL DE IP
├── src/
│   ├── api/
│   │   └── propiedadesApi.js     # Servicios de API con axios
│   ├── components/
│   │   ├── EnvironmentInfo.jsx   # Componente para verificar entorno
│   │   ├── IpConfigManager.jsx   # ⭐ Gestor visual de configuración IP
│   │   ├── Navbar.jsx
│   │   └── Footer.jsx
│   ├── config/
│   │   └── config.js             # Configuración principal de la app
│   ├── context/
│   │   └── AuthContext.jsx       # Contexto de autenticación
│   ├── hooks/
│   │   ├── useFiltro.js
│   │   └── useUF.js
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Home.jsx
│   │   └── dashboard/            # Dashboards por tipo de usuario
│   └── styles/
├── backend/                      # ⭐ Backend PHP
│   ├── config.php               # Configuración de base de datos
│   ├── check_environment.php    # Endpoint para verificar entorno
│   ├── api_login.php
│   ├── api_registro.php
│   └── ... (otros archivos PHP)
├── scripts/
│   └── update-ip.js             # ⭐ Script para actualizar IP automáticamente
├── env.example                   # Plantilla de variables de entorno
├── env.production.example        # Plantilla para producción AWS
├── vite.config.js               # Configuración de Vite
└── package.json                 # Dependencias y scripts
```

## ⭐ SISTEMA DE CONFIGURACIÓN DE IP

### Archivo Principal: `config/ip-config.js`
```javascript
// IP de tu instancia AWS (cambia esta cuando sea necesario)
export const AWS_IP = '54.163.209.36';

// IP de desarrollo local
export const LOCAL_IP = 'localhost';

// Detección automática de entorno
const isDevelopment = import.meta.env.DEV || import.meta.env.VITE_APP_ENV === 'development';
const isProduction = import.meta.env.PROD || import.meta.env.VITE_APP_ENV === 'production';

// URL base según el entorno
export const getBaseUrl = () => {
  if (isDevelopment) {
    return `http://${LOCAL_IP}/wuten/backend`;
  } else {
    return `http://${AWS_IP}/wuten-/backend`;
  }
};
```

### Comando para Actualizar IP
```bash
npm run update-ip 192.168.1.100
```

### Componente Visual de Gestión
```jsx
import IpConfigManager from './components/IpConfigManager';
<IpConfigManager show={true} />
```

## 🔧 Configuración de Entornos

### Desarrollo Local
- **URL API:** `http://localhost/wuten/backend`
- **Frontend:** `http://localhost:3000`
- **Comando:** `npm run dev`

### Producción AWS
- **URL API:** `http://54.163.209.36/wuten-/backend`
- **Frontend:** `http://54.163.209.36/wuten`
- **Comando:** `npm run build:aws`

## 📦 Dependencias Principales

```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "bootstrap": "^5.3.2",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.18.0",
    "sweetalert2": "^11.9.0"
  }
}
```

## 🚀 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Desarrollo local
npm run dev:local        # Desarrollo con modo explícito
npm run dev:aws          # Desarrollo con configuración AWS

# Construcción
npm run build            # Construcción estándar
npm run build:aws        # Construcción para AWS
npm run build:prod       # Construcción para producción

# Configuración
npm run setup:local      # Configurar entorno local
npm run setup:aws        # Configurar entorno AWS
npm run setup:all        # Configurar ambos entornos

# Gestión de IP
npm run update-ip        # ⭐ Actualizar IP de AWS
npm run check-env        # Verificar variables de entorno

# Despliegue
npm run deploy:aws       # Desplegar a AWS
```

## 🔗 Configuración de API

### Frontend (React)
```javascript
// src/config/config.js
import { getBaseUrl } from './ip-config';

export const config = {
  API_BASE_URL: getBaseUrl(), // Usa configuración centralizada
  // ... otras configuraciones
};
```

### Backend (PHP)
```php
// backend/config.php
function conectar() {
    $host = getenv('DB_HOST') ?: 'localhost';
    $usuario = getenv('DB_USER') ?: 'root';
    $password = getenv('DB_PASSWORD') ?: 'Admin12345';
    $base_datos = getenv('DB_NAME') ?: 'wuten';
    // ...
}
```

## 🎯 Funcionalidades Principales

### Autenticación
- Login con validación
- Registro de usuarios
- Context API para manejo de sesión
- Rutas protegidas por tipo de usuario

### Dashboards por Rol
- **Administrador:** Gestión completa de usuarios y propiedades
- **Gestor:** Gestión de propiedades asignadas
- **Propietario:** Gestión de sus propias propiedades

### API Services
- Configuración con axios y reintentos automáticos
- Proxy automático para backend PHP
- Manejo de errores y notificaciones

## 🔒 Seguridad

### Variables de Entorno
- **Desarrollo:** `.env` (no subir a Git)
- **Producción:** `.env.production` (no subir a Git)
- **Ejemplos:** `env.example`, `env.production.example` (sí subir a Git)

### Base de Datos
- Credenciales en `backend/config.php` (no en variables de entorno)
- Variables de entorno solo para referencia del frontend

## 🧪 Verificación y Testing

### Verificar Configuración
```bash
npm run check-env
```

### Probar Conexión Backend
```bash
curl http://localhost/wuten/backend/heartbeat.php
```

### Componente de Verificación
```jsx
import EnvironmentInfo from './components/EnvironmentInfo';
<EnvironmentInfo show={true} />
```

## 📚 Documentación Disponible

- **`README.md`** - Documentación general del proyecto
- **`AWS_DEPLOYMENT_GUIDE.md`** - Guía completa de despliegue en AWS
- **`IP_CONFIGURATION.md`** - Guía específica del sistema de IP
- **`SETUP.md`** - Configuración rápida
- **`MIGRATION_GUIDE.md`** - Guía de migración desde PHP

## 🚨 Casos de Uso Comunes

### Cambiar IP de AWS
```bash
# Método 1: Comando automático
npm run update-ip 192.168.1.100

# Método 2: Edición manual
# Editar config/ip-config.js línea 15
```

### Desplegar en AWS
```bash
npm run setup:aws
# Editar .env.production con tu IP
npm run build:aws
# Subir carpeta dist/ al servidor
```

### Desarrollo Local
```bash
npm run setup:local
npm run dev
```

## 🔍 Archivos Importantes para Modificar

1. **`config/ip-config.js`** - ⭐ Configuración central de IP
2. **`backend/config.php`** - Configuración de base de datos
3. **`src/config/config.js`** - Configuración principal de la app
4. **`vite.config.js`** - Configuración de Vite y proxy
5. **`.env` / `.env.production`** - Variables de entorno

## 🎉 Estado Actual

✅ **Sistema de IP centralizado** implementado  
✅ **Scripts automáticos** para gestión  
✅ **Componentes visuales** para configuración  
✅ **Documentación completa** disponible  
✅ **Listo para AWS** con IPs dinámicas  
✅ **Configuración de seguridad** implementada  

---

**Este proyecto está completamente configurado para desarrollo local y despliegue en AWS con gestión automática de IPs dinámicas.** 