# Guía de Migración: PHP + JavaScript → React + Vite

## 📋 Resumen del Proyecto

Este proyecto migra la aplicación **Wuten Inmobiliaria** desde PHP + JavaScript a React + Vite, manteniendo la funcionalidad existente y mejorando la experiencia del usuario.

## 🎯 Estado Actual

### ✅ Completado
- [x] **Estructura base del proyecto React + Vite**
- [x] **Sistema de autenticación con Context API**
- [x] **Rutas protegidas por tipo de usuario**
- [x] **API service con axios y proxy configurado**
- [x] **Hooks personalizados (useUF, useFiltro)**
- [x] **Componentes de navegación (Navbar, Footer)**
- [x] **Páginas principales (Login, Registro, Home)**
- [x] **Dashboards por tipo de usuario**
- [x] **Estilos CSS modernos y responsivos**
- [x] **Configuración de desarrollo completa**

### 🚧 En Progreso
- [ ] Migración de formularios específicos
- [ ] Integración con estilos CSS existentes
- [ ] Componentes de CRUD de propiedades
- [ ] Sistema de carga de imágenes

### 📋 Pendiente
- [ ] Migración de páginas de detalle
- [ ] Integración completa con backend PHP
- [ ] Pruebas de funcionalidad
- [ ] Optimización de rendimiento

## 🚀 Configuración Inicial

### 1. Instalación de Dependencias
```bash
npm install
```

### 2. Configuración del Backend
- Coloca los archivos PHP en `C:\wamp64\www\wuten\backend\`
- Asegúrate de que WampServer esté corriendo
- Verifica la conexión a la base de datos MySQL

### 3. Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto:
```env
VITE_API_BASE_URL=http://localhost/wuten/backend
VITE_APP_TITLE=Wuten Inmobiliaria
VITE_APP_VERSION=1.0.0
```

### 4. Iniciar Desarrollo
```bash
npm run dev
```

## 📁 Estructura del Proyecto

```
react-wuten/
├── public/                     # Archivos estáticos
├── src/
│   ├── api/                   # Servicios de API
│   │   └── propiedadesApi.js
│   ├── components/            # Componentes reutilizables
│   │   ├── Navbar.jsx
│   │   └── Footer.jsx
│   ├── config/                # Configuración
│   │   └── config.js
│   ├── context/               # Contexto de autenticación
│   │   └── AuthContext.jsx
│   ├── hooks/                 # Hooks personalizados
│   │   ├── useUF.js
│   │   └── useFiltro.js
│   ├── pages/                 # Páginas de la aplicación
│   │   ├── login.jsx
│   │   ├── registro.jsx
│   │   ├── Home.jsx
│   │   ├── descripcion.jsx
│   │   ├── detalle.jsx
│   │   └── dashboard/
│   │       ├── DashboardPropietario.jsx
│   │       ├── DashboardGestor.jsx
│   │       ├── DashboardAdmin.jsx
│   │       ├── AdminUsuarios.jsx
│   │       └── AdminPropiedades.jsx
│   ├── styles/                # Estilos CSS
│   │   └── components.css
│   ├── App.jsx                # Componente principal
│   ├── main.jsx               # Punto de entrada
│   └── index.css              # Estilos globales
├── vite.config.js             # Configuración de Vite
├── package.json
└── README.md
```

## 🔄 Mapeo de Migración

### Autenticación
| PHP Original | React Nuevo | Estado |
|--------------|-------------|--------|
| `login.html` | `src/pages/login.jsx` | ✅ Completado |
| `procesa.php` | `src/api/propiedadesApi.js` | ✅ Completado |
| `recuperar.html` | `src/pages/recuperar.jsx` | 📋 Pendiente |

### Registro
| PHP Original | React Nuevo | Estado |
|--------------|-------------|--------|
| `RegistroPro.html` | `src/pages/registro.jsx` | ✅ Completado |
| `registrogestorPro.html` | `src/pages/registro.jsx` | ✅ Completado |
| `registro.php` | Backend PHP | 🔄 Mantenido |

### Propiedades
| PHP Original | React Nuevo | Estado |
|--------------|-------------|--------|
| `index.html` | `src/pages/Home.jsx` | ✅ Completado |
| `descripcion.html` | `src/pages/descripcion.jsx` | 📋 Pendiente |
| `cargar_propiedades.php` | `src/api/propiedadesApi.js` | ✅ Completado |

### Dashboards
| PHP Original | React Nuevo | Estado |
|--------------|-------------|--------|
| `dashboard_propietario.php` | `src/pages/dashboard/DashboardPropietario.jsx` | ✅ Completado |
| `dashboardadmin.php` | `src/pages/dashboard/DashboardAdmin.jsx` | ✅ Completado |
| `mantenedorusuarios.php` | `src/pages/dashboard/AdminUsuarios.jsx` | ✅ Completado |

## 🎨 Estilos CSS

### Archivos CSS a Migrar
- [ ] `formulario.css` → `src/styles/formulario.css`
- [ ] `login.css` → `src/styles/login.css`
- [ ] `crud.css` → `src/styles/crud.css`
- [ ] `dashboard.css` → `src/styles/dashboard.css`
- [ ] `propiedades.css` → `src/styles/propiedades.css`

### Integración de Estilos
```javascript
// En cada componente React
import '../styles/formulario.css';
import '../styles/login.css';
// etc.
```

## 🔧 Configuración de Desarrollo

### Proxy de Desarrollo
El proyecto está configurado para hacer proxy de las llamadas `/api` al backend PHP:

```javascript
// vite.config.js
proxy: {
  '/api': {
    target: 'http://localhost/wuten/backend',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '')
  }
}
```

### Usuario de Desarrollo
Para desarrollo, se usa un usuario simulado en `AuthContext.jsx`:
```javascript
const [user, setUser] = useState({ 
  id_usuario: 1, 
  tipoUsuario: 'admin',
  nombre: 'Usuario Admin',
  email: 'admin@wuten.com'
});
```

## 📝 Próximos Pasos

### 1. Migración de Formularios
- [ ] Crear componentes de formulario reutilizables
- [ ] Migrar formularios de registro de propiedades
- [ ] Implementar validación de formularios
- [ ] Integrar con SweetAlert2 para notificaciones

### 2. Integración de Backend
- [ ] Probar conexión con endpoints PHP
- [ ] Implementar manejo de errores
- [ ] Configurar CORS si es necesario
- [ ] Optimizar llamadas a la API

### 3. Funcionalidades Avanzadas
- [ ] Sistema de carga de imágenes
- [ ] Filtros avanzados de propiedades
- [ ] Paginación de resultados
- [ ] Búsqueda en tiempo real

### 4. Optimización
- [ ] Lazy loading de componentes
- [ ] Optimización de imágenes
- [ ] Caching de datos
- [ ] Compresión de assets

## 🐛 Solución de Problemas

### Error de Conexión al Backend
```bash
# Verificar que WampServer esté corriendo
# Verificar la ruta del backend
# Revisar la configuración del proxy en vite.config.js
```

### Error de Módulos
```bash
npm install
npm audit fix
```

### Puerto Ocupado
Cambiar el puerto en `vite.config.js`:
```javascript
server: {
  port: 3001
}
```

## 📞 Soporte

Para dudas sobre la migración:
1. Revisar el documento original: `Migración de Aplicación PHP + JavaScript a React + Vite.txt`
2. Consultar la documentación de React y Vite
3. Verificar la configuración del backend PHP

## 🎉 Conclusión

El proyecto React + Vite está configurado y listo para continuar con la migración incremental. La estructura base permite una migración gradual sin afectar la funcionalidad existente del backend PHP. 