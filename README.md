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
   cp env.example .env
   ```
   
   Editar `.env` con tus configuraciones:
   ```env
   VITE_API_BASE_URL=http://localhost/wuten/backend
   VITE_APP_TITLE=Wuten Inmobiliaria
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
npm run dev

# Construir para producción
npm run build

# Vista previa de producción
npm run preview
```

## 🌐 Configuración del Proxy

El proyecto está configurado para hacer proxy de las llamadas API al backend PHP:

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

## 📁 Archivos Importantes

- **`src/App.jsx`**: Configuración de rutas y estructura principal
- **`src/context/AuthContext.jsx`**: Manejo de autenticación
- **`src/api/propiedadesApi.js`**: Servicios de API
- **`src/config/config.js`**: Configuraciones globales

## 🚨 Notas Importantes

1. **Backend requerido:** Esta aplicación requiere el backend PHP de Wuten funcionando
2. **Imágenes:** Las imágenes se copian automáticamente desde la versión original
3. **Base de datos:** Asegúrate de que la base de datos esté configurada correctamente
4. **CORS:** El proxy de Vite maneja los problemas de CORS en desarrollo

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