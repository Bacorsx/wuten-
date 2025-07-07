// Importar configuración centralizada de IP
import { getBaseUrl, ipConfig } from './ip-config';

// Configuración de la aplicación usando variables de entorno de Vite
export const config = {
  // URLs de la API (usando configuración centralizada)
  API_BASE_URL: getBaseUrl(),
  
  // Información de la aplicación
  APP_TITLE: import.meta.env.VITE_APP_TITLE || 'Wuten Inmobiliaria',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  APP_ENV: import.meta.env.VITE_APP_ENV || 'development',
  
  // Configuración de desarrollo
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
  
  // Configuración de la base de datos (para referencia)
  DB_HOST: import.meta.env.VITE_DB_HOST || 'localhost',
  DB_NAME: import.meta.env.VITE_DB_NAME || 'wuten',
  DB_USER: import.meta.env.VITE_DB_USER || 'root',
  DB_PASSWORD: import.meta.env.VITE_DB_PASSWORD || 'Admin12345',
  
  // Configuración de API
  API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
  API_RETRY_ATTEMPTS: parseInt(import.meta.env.VITE_API_RETRY_ATTEMPTS) || 3,
  
  // Configuración de SweetAlert2
  SWAL_CONFIG: {
    confirmButtonColor: import.meta.env.VITE_SWAL_CONFIRM_COLOR || '#667eea',
    cancelButtonColor: import.meta.env.VITE_SWAL_CANCEL_COLOR || '#6c757d',
    timer: parseInt(import.meta.env.VITE_SWAL_TIMER) || 3000,
    timerProgressBar: true
  },
  
  // Configuración de paginación
  ITEMS_PER_PAGE: parseInt(import.meta.env.VITE_ITEMS_PER_PAGE) || 12,
  
  // Configuración de imágenes
  IMAGE_UPLOAD: {
    MAX_SIZE: parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: (import.meta.env.VITE_ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp').split(','),
    UPLOAD_PATH: '/uploads/'
  }
};

// Configuración de axios con variables de entorno
export const axiosConfig = {
  baseURL: config.API_BASE_URL,
  timeout: config.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  // Configuración para reintentos en producción
  retry: config.IS_PROD ? config.API_RETRY_ATTEMPTS : 0,
  retryDelay: 1000
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

// Función para obtener la URL de la API según el entorno
export const getApiUrl = (endpoint = '') => {
  const baseUrl = config.API_BASE_URL;
  return endpoint ? `${baseUrl}/${endpoint}` : baseUrl;
};

// Función para validar si estamos en producción
export const isProduction = () => {
  return config.IS_PROD || config.APP_ENV === 'production';
};

// Función para obtener información de la configuración de IP
export const getIpConfigInfo = () => {
  return ipConfig;
};

// Función para obtener configuración específica del entorno
export const getEnvironmentConfig = () => {
  return {
    isDev: config.IS_DEV,
    isProd: isProduction(),
    apiUrl: config.API_BASE_URL,
    appTitle: config.APP_TITLE,
    appVersion: config.APP_VERSION
  };
};

export default config; 