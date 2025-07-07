# 🏠 Wuten Inmobiliaria - React App

Esta es la versión React con Vite de la aplicación Wuten Inmobiliaria, migrada desde la versión original en PHP/HTML. **Optimizada para producción con despliegue automatizado en AWS.**

## 🚀 Características

- **Autenticación de usuarios** con diferentes roles (Admin, Gestor, Propietario)
- **Gestión de propiedades** con CRUD completo
- **Sistema de filtros** avanzado por región, provincia, comuna
- **Dashboard personalizado** según el tipo de usuario
- **Recuperación de contraseña** con código de verificación
- **Interfaz moderna** y responsive
- **Integración con API** backend PHP
- **Configuración dinámica de IP** para AWS
- **Despliegue automatizado** con scripts optimizados
- **Optimizaciones de producción** (minificación, compresión, caching)

## 📋 Prerrequisitos

- Node.js (versión 16 o superior)
- npm o yarn
- Servidor web local (WAMP, XAMPP, etc.)
- Backend PHP de Wuten configurado
- **Para producción:** Instancia AWS Linux

## 🛠️ Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/Bacorsx/wuten-.git
   cd react-wuten
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   ```bash
   # Para desarrollo local
   npm run setup:local
   
   # Para AWS
   npm run setup:aws
   
   # Para ambos entornos
   npm run setup:all
   ```
   
   Editar los archivos según el entorno:
   
   **Desarrollo local (.env):**
   ```env
   VITE_API_URL=http://localhost/wuten/backend
   VITE_APP_TITLE=Wuten Inmobiliaria
   VITE_APP_VERSION=1.0.0
   VITE_APP_ENV=development
   ```
   
   **AWS Producción (.env.production):**
   ```env
   VITE_API_URL=http://TU_IP_AWS/wuten-/backend
   VITE_APP_TITLE=Wuten Inmobiliaria
   VITE_APP_VERSION=1.0.0
   VITE_APP_ENV=production
   ```

4. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

5. **Abrir en el navegador:**
   ```
   http://localhost:3000
   ```

## 🏗️ Estructura del Proyecto

```
react-wuten/
├── config/              # Configuración centralizada
│   └── ip-config.js     # Gestión de IPs dinámicas
├── scripts/             # Scripts de automatización
│   ├── update-ip.js     # Actualizar IP automáticamente
│   ├── check-ip.cjs     # Verificar configuración
│   └── deploy-production.sh # Despliegue automatizado
├── src/
│   ├── api/             # Servicios de API
│   │   └── propiedadesApi.js
│   ├── components/      # Componentes reutilizables
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   └── SessionNotification.jsx
│   ├── config/          # Configuraciones
│   │   ├── config.js
│   │   └── production.js # Configuración específica de producción
│   ├── context/         # Contextos de React
│   │   └── AuthContext.jsx
│   ├── hooks/           # Hooks personalizados
│   │   ├── useFiltro.js
│   │   └── useUF.js
│   ├── pages/           # Páginas de la aplicación
│   │   ├── Login.jsx
│   │   ├── Recuperar.jsx
│   │   ├── registro.jsx
│   │   ├── Home.jsx
│   │   ├── descripcion.jsx
│   │   ├── detalle.jsx
│   │   ├── Error404.jsx
│   │   └── dashboard/
│   │       ├── DashboardAdmin.jsx
│   │       ├── DashboardGestor.jsx
│   │       ├── DashboardPropietario.jsx
│   │       ├── AdminUsuarios.jsx
│   │       └── AdminPropiedades.jsx
│   ├── styles/          # Archivos CSS
│   │   ├── components.css
│   │   ├── login.css
│   │   ├── recovery.css
│   │   └── error.css
│   ├── App.jsx          # Componente principal
│   └── main.jsx         # Punto de entrada
├── backend/             # Backend PHP
│   ├── production.config.php # Configuración de producción
│   └── .htaccess.production  # Configuración Apache para producción
├── public/              # Archivos estáticos
├── dist/                # Build de producción (generado)
├── .env.example         # Plantilla para desarrollo
├── .env.production      # Variables de producción
├── vite.config.js       # Configuración de Vite optimizada
└── package.json         # Dependencias y scripts
```

## 🔐 Usuarios de Prueba

Para desarrollo, puedes usar estos usuarios simulados:

- **Administrador:**
  - Email: `admin@wuten.com`
  - Contraseña: `admin123`

- **Gestor:**
  - Email: `gestor@wuten.com`
  - Contraseña: `gestor123`

- **Propietario:**
  - Email: `propietario@wuten.com`
  - Contraseña: `propietario123`

## 🎨 Tecnologías Utilizadas

- **Frontend:**
  - React 18
  - Vite 5.4.19
  - React Router DOM
  - Bootstrap 5
  - SweetAlert2
  - Axios

- **Producción:**
  - Terser (minificación)
  - Gzip/Brotli (compresión)
  - Service Workers (caching)
  - Code Splitting (optimización)

- **Estilos:**
  - CSS3
  - Bootstrap 5
  - Diseño responsive

## 📱 Funcionalidades por Rol

### 👨‍💼 Administrador
- Gestión completa de usuarios
- Gestión completa de propiedades
- Estadísticas del sistema
- Acceso a todos los dashboards

### 👨‍💻 Gestor
- Gestión de propiedades asignadas
- Contacto con propietarios
- Reportes de gestión

### 🏠 Propietario
- Gestión de sus propias propiedades
- Ver estadísticas de sus propiedades
- Contacto con gestores

## 🔧 Scripts Disponibles

### 🚀 Desarrollo
```bash
npm run dev              # Desarrollo local
npm run dev:local        # Desarrollo con modo explícito
npm run dev:aws          # Desarrollo con configuración AWS
```

### 🏗️ Construcción
```bash
npm run build            # Construcción estándar
npm run build:dev        # Construcción para desarrollo
npm run build:prod       # Construcción para producción
npm run build:aws        # Construcción optimizada para AWS
```

### 🚀 Despliegue
```bash
npm run deploy:prod      # Despliegue automatizado
npm run deploy:full      # Despliegue completo (IP + build + deploy)
npm run preview          # Vista previa estándar
npm run preview:prod     # Vista previa de producción
```

### 🔧 Utilidades
```bash
npm run check:ip         # Verificar configuración de IP
npm run update-ip        # Actualizar IP automáticamente
npm run check-env        # Verificar variables de entorno
npm run setup:local      # Configurar entorno local
npm run setup:aws        # Configurar entorno AWS
```

## 🌐 Configuración del Proxy y Variables de Entorno

El proyecto está configurado para usar variables de entorno y hacer proxy de las llamadas API al backend PHP:

### Variables de Entorno
```javascript
// src/config/config.js
export const config = {
  API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost/wuten/backend',
  APP_TITLE: import.meta.env.VITE_APP_TITLE || 'Wuten Inmobiliaria',
  APP_ENV: import.meta.env.VITE_APP_ENV || 'development',
  // ... más configuraciones
};
```

### Proxy Configurado
```javascript
// vite.config.js
proxy: {
  '/api': {
    target: env.VITE_API_URL || 'http://localhost/wuten/backend',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '')
  }
}
```

### Entornos Soportados
- **Desarrollo**: `.env` → `http://localhost/wuten/backend`
- **Producción**: `.env.production` → `http://TU_IP_AWS/wuten-/backend`

## 🖥️ Configuración Centralizada de IP

El proyecto incluye un sistema centralizado para gestionar IPs fácilmente:

### Actualizar IP (Método Rápido)
```bash
# Cambiar IP con un solo comando
npm run update-ip

# O especificar la IP directamente
npm run update-ip 54.163.209.36
```

### Verificar Configuración
```bash
# Verificar que todo esté configurado correctamente
npm run check:ip
```

### Gestión Visual
```jsx
import IpConfigManager from './components/IpConfigManager';
<IpConfigManager show={true} />
```

## 🚀 Despliegue en AWS

### Despliegue Automatizado (Recomendado)
```bash
# Despliegue completo con una sola línea
npm run deploy:full
```

Este comando:
1. Actualiza la IP automáticamente
2. Construye el proyecto optimizado
3. Prepara archivos para despliegue
4. Genera script de instalación en servidor

### Despliegue Manual
```bash
# 1. Actualizar IP
npm run update-ip

# 2. Verificar configuración
npm run check:ip

# 3. Construir para producción
npm run build:aws

# 4. Ejecutar despliegue
npm run deploy:prod
```

### En el Servidor AWS
```bash
# Conectar al servidor
ssh -i tu-key.pem ubuntu@TU_IP_AWS

# Navegar al directorio temporal
cd /tmp/wuten-build

# Ejecutar script de despliegue
chmod +x deploy-to-server.sh
./deploy-to-server.sh
```

## 📁 Archivos Importantes

- **`config/ip-config.js`**: Configuración centralizada de IPs
- **`src/App.jsx`**: Configuración de rutas y estructura principal
- **`src/context/AuthContext.jsx`**: Manejo de autenticación
- **`src/api/propiedadesApi.js`**: Servicios de API
- **`src/config/config.js`**: Configuraciones globales
- **`src/config/production.js`**: Configuración específica de producción
- **`vite.config.js`**: Configuración optimizada de Vite

## 🔒 Optimizaciones de Producción

### Frontend (Vite)
- **Code Splitting**: Separación automática de chunks
- **Tree Shaking**: Eliminación de código no utilizado
- **Minificación**: Compresión de archivos JS/CSS con Terser
- **Caching**: Headers de caché optimizados
- **Compresión**: Gzip/Brotli automática

### Backend (PHP)
- **Compresión GZIP**: Archivos comprimidos automáticamente
- **Conexiones Persistentes**: Mejor rendimiento de BD
- **Rate Limiting**: Protección contra ataques
- **Headers de Seguridad**: CSP, HSTS, XSS Protection

### Seguridad
- **Validación de entrada**: Sanitización de datos
- **CORS configurado**: Orígenes permitidos específicos
- **Rate limiting**: Protección contra spam
- **Logging seguro**: Sin información sensible en logs

## 🚨 Notas Importantes

1. **Backend requerido:** Esta aplicación requiere el backend PHP de Wuten funcionando
2. **Variables de entorno:** Configura correctamente los archivos `.env` y `.env.production`
3. **IP Dinámica AWS:** Usa `npm run update-ip` cuando cambie la IP de tu instancia
4. **Base de datos:** Asegúrate de que la base de datos esté configurada correctamente
5. **CORS:** El proxy de Vite maneja los problemas de CORS en desarrollo
6. **Monitoreo:** Usa `npm run check:ip` para verificar la configuración
7. **Backups:** El sistema incluye scripts de backup automático

## 📚 Documentación Adicional

- **[Guía de Despliegue AWS](README_DEPLOYMENT_AWS.md)**: Instrucciones detalladas para AWS
- **[Guía de Producción](PRODUCTION_GUIDE.md)**: Optimizaciones y configuración de producción
- **[Configuración de IP](IP_CONFIGURATION.md)**: Gestión de IPs dinámicas
- **[README para ChatGPT](README_CHATGPT.md)**: Resumen para IA

## 🐛 Troubleshooting

### Error: "terser not found"
```bash
npm install --save-dev terser
```

### Error: "getConfigInfo is not exported"
Verificar que las rutas de importación sean correctas:
```javascript
import { getConfigInfo } from '../../config/ip-config';
```

### Error: Build falla en producción
```bash
# Verificar configuración
npm run check:ip

# Limpiar y reinstalar
rm -rf node_modules package-lock.json
npm install
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 📞 Soporte

Para soporte técnico, contacta al equipo de desarrollo de Wuten Inmobiliaria.

---

**Desarrollado con ❤️ para Wuten Inmobiliaria**

**Versión**: 1.0.0  
**Última actualización**: $(date)  
**Compatible con**: Node.js 16+, AWS Linux, Ubuntu 20.04+ 