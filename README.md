# Wuten Inmobiliaria - React App

Esta es la versión React con Vite de la aplicación Wuten Inmobiliaria, migrada desde la versión original en PHP/HTML.

## 🚀 Características

- **Autenticación de usuarios** con diferentes roles (Admin, Gestor, Propietario)
- **Gestión de propiedades** con CRUD completo
- **Sistema de filtros** avanzado por región, provincia, comuna
- **Dashboard personalizado** según el tipo de usuario
- **Recuperación de contraseña** con código de verificación
- **Interfaz moderna** y responsive
- **Integración con API** backend PHP

## 📋 Prerrequisitos

- Node.js (versión 16 o superior)
- npm o yarn
- Servidor web local (WAMP, XAMPP, etc.)
- Backend PHP de Wuten configurado

## 🛠️ Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone <repository-url>
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
   
   **📁 Archivos de ejemplo disponibles:**
   - `env.example` - Plantilla para desarrollo local
   - `env.production.example` - Plantilla para AWS con checklist de despliegue

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
src/
├── api/                 # Servicios de API
│   └── propiedadesApi.js
├── components/          # Componentes reutilizables
│   ├── Navbar.jsx
│   └── Footer.jsx
├── config/             # Configuraciones
│   └── config.js
├── context/            # Contextos de React
│   └── AuthContext.jsx
├── hooks/              # Hooks personalizados
│   ├── useFiltro.js
│   └── useUF.js
├── pages/              # Páginas de la aplicación
│   ├── Login.jsx
│   ├── Recuperar.jsx
│   ├── registro.jsx
│   ├── Home.jsx
│   ├── descripcion.jsx
│   ├── detalle.jsx
│   ├── Error404.jsx
│   └── dashboard/
│       ├── DashboardAdmin.jsx
│       ├── DashboardGestor.jsx
│       ├── DashboardPropietario.jsx
│       ├── AdminUsuarios.jsx
│       └── AdminPropiedades.jsx
├── styles/             # Archivos CSS
│   ├── components.css
│   ├── login.css
│   ├── recovery.css
│   └── error.css
├── App.jsx             # Componente principal
└── main.jsx           # Punto de entrada
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
  - Vite
  - React Router DOM
  - Bootstrap 5
  - SweetAlert2
  - Axios

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

```bash
# Desarrollo
npm run dev              # Desarrollo local
npm run dev:local        # Desarrollo con modo explícito
npm run dev:aws          # Desarrollo con configuración AWS

# Construir para producción
npm run build            # Construcción estándar
npm run build:dev        # Construcción para desarrollo
npm run build:prod       # Construcción para producción
npm run build:aws        # Construcción para AWS

# Despliegue
npm run deploy:aws       # Desplegar a AWS
npm run preview          # Vista previa estándar
npm run preview:prod     # Vista previa de producción

# Utilidades
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

## 📁 Archivos Importantes

- **`src/App.jsx`**: Configuración de rutas y estructura principal
- **`src/context/AuthContext.jsx`**: Manejo de autenticación
- **`src/api/propiedadesApi.js`**: Servicios de API
- **`src/config/config.js`**: Configuraciones globales

## 🚨 Notas Importantes

1. **Backend requerido:** Esta aplicación requiere el backend PHP de Wuten funcionando
2. **Variables de entorno:** Configura correctamente los archivos `.env` y `.env.production`
3. **IP Dinámica AWS:** Actualiza `VITE_API_URL` en `.env.production` cuando cambie la IP de tu instancia
4. **Base de datos:** Asegúrate de que la base de datos esté configurada correctamente
5. **CORS:** El proxy de Vite maneja los problemas de CORS en desarrollo
6. **Monitoreo:** Usa el componente `EnvironmentInfo` para verificar la configuración

## 🚀 Despliegue en AWS

Para desplegar en AWS con IPs dinámicas, consulta la [Guía de Despliegue AWS](AWS_DEPLOYMENT_GUIDE.md).

## 🖥️ Configuración Centralizada de IP

El proyecto incluye un sistema centralizado para gestionar IPs fácilmente:

### Actualizar IP (Método Rápido)
```bash
# Cambiar IP con un solo comando
npm run update-ip 54.163.209.36
```

### Gestión Visual
```jsx
import IpConfigManager from './components/IpConfigManager';
<IpConfigManager show={true} />
```

Para más detalles, consulta la [Guía de Configuración de IP](IP_CONFIGURATION.md).

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