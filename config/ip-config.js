// ========================================
// CONFIGURACIÓN CENTRALIZADA DE IP
// ========================================
// 
// Este archivo centraliza la configuración de IP para toda la aplicación.
// Modifica solo este archivo cuando cambie la IP de tu servidor.
//
// INSTRUCCIONES:
// 1. Cambia la IP en la variable AWS_IP cuando sea necesario
// 2. La aplicación usará automáticamente esta configuración
// 3. No necesitas modificar otros archivos
//
// ========================================

// ========================================
// CONFIGURACIÓN DE IPs
// ========================================

// IP de tu instancia AWS (cambia esta cuando sea necesario)
export const AWS_IP = '54.163.209.36';

// IP de desarrollo local
export const LOCAL_IP = 'localhost';

// ========================================
// CONFIGURACIÓN DE ENTORNOS
// ========================================

// Detectar entorno automáticamente
const isDevelopment = import.meta.env.DEV || import.meta.env.VITE_APP_ENV === 'development';
const isProduction = import.meta.env.PROD || import.meta.env.VITE_APP_ENV === 'production';

// ========================================
// URLs CONFIGURADAS
// ========================================

// URL base según el entorno
export const getBaseUrl = () => {
  // Ahora siempre usa la variable de entorno VITE_API_URL definida en .env.production o .env.local
  return import.meta.env.VITE_API_URL;
};

// URL del frontend según el entorno
export const getFrontendUrl = () => {
  if (isDevelopment) {
    return `http://${LOCAL_IP}:3000`;
  } else {
    return `http://${AWS_IP}/wuten`;
  }
};

// ========================================
// CONFIGURACIÓN COMPLETA
// ========================================

export const ipConfig = {
  // IPs
  aws: AWS_IP,
  local: LOCAL_IP,
  
  // URLs
  api: getBaseUrl(),
  frontend: getFrontendUrl(),
  
  // Entorno
  isDevelopment,
  isProduction,
  
  // Información útil
  environment: isDevelopment ? 'development' : 'production',
  timestamp: new Date().toISOString()
};

// ========================================
// FUNCIONES UTILITARIAS
// ========================================

// Obtener URL completa para un endpoint específico
export const getApiUrl = (endpoint = '') => {
  const baseUrl = getBaseUrl();
  return endpoint ? `${baseUrl}/${endpoint}` : baseUrl;
};

// Verificar si estamos en AWS
export const isAWS = () => {
  return isProduction;
};

// Obtener información de configuración
export const getConfigInfo = () => {
  return {
    currentIP: isDevelopment ? LOCAL_IP : AWS_IP,
    environment: ipConfig.environment,
    apiUrl: ipConfig.api,
    frontendUrl: ipConfig.frontend,
    lastUpdated: ipConfig.timestamp
  };
};

// ========================================
// EXPORTACIÓN PREDETERMINADA
// ========================================

export default ipConfig; 