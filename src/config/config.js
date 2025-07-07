// Configuración de la aplicación
export const config = {
  // URLs de la API
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost/react-wuten/backend',
  
  // Información de la aplicación
  APP_TITLE: import.meta.env.VITE_APP_TITLE || 'Wuten Inmobiliaria',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // Configuración de desarrollo
  IS_DEV: import.meta.env.DEV,
  
  // Configuración de SweetAlert2
  SWAL_CONFIG: {
    confirmButtonColor: '#667eea',
    cancelButtonColor: '#6c757d',
    timer: 3000,
    timerProgressBar: true
  },
  
  // Configuración de paginación
  ITEMS_PER_PAGE: 12,
  
  // Configuración de imágenes
  IMAGE_UPLOAD: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    UPLOAD_PATH: '/uploads/'
  }
};

// Configuración de axios
export const axiosConfig = {
  baseURL: config.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
};

// Configuración de rutas
export const routes = {
  HOME: '/',
  LOGIN: '/login',
  REGISTRO: '/registro',
  DASHBOARD: '/dashboard',
  DASHBOARD_ADMIN: '/dashboard/admin',
  DASHBOARD_GESTOR: '/dashboard/gestor',
  DASHBOARD_PROPIETARIO: '/dashboard/propietario',
  DESCRIPCION: '/descripcion',
  DETALLE: '/detalle'
};

// Configuración de roles de usuario
export const userRoles = {
  ADMIN: 'admin',
  GESTOR: 'gestor',
  PROPIETARIO: 'propietario'
};

// Configuración de tipos de propiedad
export const propertyTypes = {
  CASA: 'casa',
  DEPARTAMENTO: 'departamento',
  TERRENO: 'terreno',
  OFICINA: 'oficina',
  LOCAL: 'local'
};

export default config; 