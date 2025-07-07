// ========================================
// CONFIGURACIÓN ESPECÍFICA PARA PRODUCCIÓN
// ========================================
// 
// Este archivo contiene configuraciones específicas para el entorno de producción
// Se importa automáticamente cuando VITE_APP_ENV=production

import { ipConfig } from './ip-config';

// Configuración de producción
export const productionConfig = {
  // Configuración de API
  api: {
    baseURL: ipConfig.api,
    timeout: 15000,
    retryAttempts: 5,
    retryDelay: 2000,
    // Headers adicionales para producción
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'X-Environment': 'production'
    }
  },

  // Configuración de logging
  logging: {
    level: 'error', // Solo errores en producción
    enableConsole: false, // Deshabilitar console.log
    enableRemoteLogging: true, // Habilitar logging remoto
    remoteEndpoint: `${ipConfig.api}/log.php`
  },

  // Configuración de caché
  cache: {
    enableServiceWorker: true,
    cacheVersion: 'v1.0.0',
    maxAge: 31536000, // 1 año
    strategies: {
      images: 'cache-first',
      css: 'stale-while-revalidate',
      js: 'stale-while-revalidate',
      api: 'network-first'
    }
  },

  // Configuración de seguridad
  security: {
    enableCSP: true,
    enableHSTS: true,
    enableXSSProtection: true,
    allowedOrigins: [
      ipConfig.frontend,
      ipConfig.api
    ]
  },

  // Configuración de rendimiento
  performance: {
    enableLazyLoading: true,
    enableImageOptimization: true,
    enableCodeSplitting: true,
    enablePreloading: true,
    maxConcurrentRequests: 5
  },

  // Configuración de errores
  errorHandling: {
    enableGlobalErrorBoundary: true,
    enableErrorReporting: true,
    errorReportingEndpoint: `${ipConfig.api}/error-report.php`,
    showUserFriendlyErrors: true,
    logUnhandledErrors: true
  },

  // Configuración de monitoreo
  monitoring: {
    enablePerformanceMonitoring: true,
    enableUserAnalytics: true,
    analyticsEndpoint: `${ipConfig.api}/analytics.php`,
    performanceMetrics: ['FCP', 'LCP', 'CLS', 'FID']
  }
};

// Función para verificar si estamos en producción
export const isProduction = () => {
  return import.meta.env.PROD || 
         import.meta.env.VITE_APP_ENV === 'production' ||
         window.location.hostname !== 'localhost';
};

// Función para obtener configuración según el entorno
export const getConfig = () => {
  return isProduction() ? productionConfig : {};
};

// Función para logging de producción
export const logProduction = (message, level = 'info', data = {}) => {
  if (!isProduction()) return;

  const logData = {
    timestamp: new Date().toISOString(),
    level,
    message,
    data,
    userAgent: navigator.userAgent,
    url: window.location.href,
    environment: 'production'
  };

  // Enviar a servidor de logging
  if (productionConfig.logging.enableRemoteLogging) {
    fetch(productionConfig.logging.remoteEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logData)
    }).catch(() => {
      // Silenciar errores de logging
    });
  }
};

// Función para manejo de errores en producción
export const handleProductionError = (error, errorInfo = {}) => {
  if (!isProduction()) return;

  const errorData = {
    message: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent
  };

  // Enviar error al servidor
  if (productionConfig.errorHandling.enableErrorReporting) {
    fetch(productionConfig.errorHandling.errorReportingEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(errorData)
    }).catch(() => {
      // Silenciar errores de reporting
    });
  }

  // Mostrar error amigable al usuario
  if (productionConfig.errorHandling.showUserFriendlyErrors) {
    console.error('Ha ocurrido un error. Por favor, recarga la página.');
  }
};

// Función para monitoreo de rendimiento
export const trackPerformance = (metric, value) => {
  if (!isProduction() || !productionConfig.monitoring.enablePerformanceMonitoring) return;

  const performanceData = {
    metric,
    value,
    timestamp: new Date().toISOString(),
    url: window.location.href
  };

  // Enviar métrica al servidor
  fetch(productionConfig.monitoring.analyticsEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(performanceData)
  }).catch(() => {
    // Silenciar errores de analytics
  });
};

// Configurar interceptores globales para producción
export const setupProductionInterceptors = () => {
  if (!isProduction()) return;

  // Interceptor para logging de errores de red
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    try {
      const response = await originalFetch(...args);
      
      if (!response.ok) {
        logProduction(`HTTP Error: ${response.status} ${response.statusText}`, 'error', {
          url: args[0],
          status: response.status
        });
      }
      
      return response;
    } catch (error) {
      logProduction(`Network Error: ${error.message}`, 'error', {
        url: args[0],
        error: error.message
      });
      throw error;
    }
  };

  // Interceptor para console.log
  if (!productionConfig.logging.enableConsole) {
    console.log = () => {};
    console.info = () => {};
    console.debug = () => {};
  }
};

// Inicializar configuración de producción
if (isProduction()) {
  setupProductionInterceptors();
  logProduction('Aplicación iniciada en modo producción', 'info');
}

export default productionConfig; 