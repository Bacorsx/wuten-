# Configuración de Wuten Inmobiliaria - React + Vite

## 🚀 Configuración Rápida

### 1. Instalación de Dependencias
```bash
npm install
```

### 2. Configuración del Backend PHP
- Coloca los archivos PHP en `C:\wamp64\www\wuten\backend\`
- Asegúrate de que WampServer esté corriendo
- Verifica la conexión a MySQL

### 3. Variables de Entorno
Copia `env.example` a `.env` y configura:
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
├── README.md
├── MIGRATION_GUIDE.md
└── SETUP.md
```

## 🔧 Configuración Técnica

### Proxy de Desarrollo
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
```javascript
// src/context/AuthContext.jsx
const [user, setUser] = useState({ 
  id_usuario: 1, 
  tipoUsuario: 'admin',
  nombre: 'Usuario Admin',
  email: 'admin@wuten.com'
});
```

## 🎯 Funcionalidades Implementadas

### ✅ Autenticación
- Login con validación
- Registro de usuarios
- Context API para manejo de sesión
- Rutas protegidas por tipo de usuario

### ✅ Navegación
- Navbar responsivo
- Footer informativo
- Enrutamiento con React Router

### ✅ Dashboards
- Dashboard de Propietario
- Dashboard de Gestor
- Dashboard de Administrador
- Gestión de usuarios y propiedades

### ✅ API Service
- Configuración con axios
- Proxy para backend PHP
- Manejo de errores
- Hooks personalizados

## 🎨 Estilos

### CSS Implementado
- Estilos modernos y responsivos
- Diseño adaptativo para móviles
- Componentes estilizados
- Gradientes y animaciones

### Clases CSS Principales
- `.login-container`, `.registro-container`
- `.home-container`, `.dashboard-container`
- `.navbar`, `.footer`
- `.form-group`, `.btn-primary`

## 🚀 Comandos Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo

# Producción
npm run build        # Construye para producción
npm run preview      # Vista previa de producción
```

## 🔗 URLs de Acceso

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost/wuten/backend/
- **Login**: http://localhost:3000/login
- **Registro**: http://localhost:3000/registro
- **Dashboard**: http://localhost:3000/dashboard

## 🐛 Solución de Problemas

### Error de Conexión al Backend
1. Verificar que WampServer esté corriendo
2. Confirmar la ruta del backend
3. Revisar la configuración del proxy

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

## 📝 Próximos Pasos

1. **Configurar backend PHP** en WampServer
2. **Migrar estilos CSS** existentes
3. **Implementar formularios** específicos
4. **Conectar con base de datos** MySQL
5. **Probar funcionalidad** completa

## 🎉 Estado del Proyecto

✅ **Configuración completa** - Listo para desarrollo
✅ **Estructura base** - Implementada
✅ **Componentes principales** - Funcionando
✅ **Estilos CSS** - Aplicados
✅ **Sistema de rutas** - Configurado

El proyecto está **listo para continuar** con la migración incremental de funcionalidades específicas. 