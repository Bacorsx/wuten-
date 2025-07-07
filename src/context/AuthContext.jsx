import React, { createContext, useContext, useState, useEffect } from 'react';
import { config } from '../config/config';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Verificar si hay un usuario guardado en localStorage
    const savedUser = localStorage.getItem('user');
    const lastServerTime = localStorage.getItem('lastServerTime');
    const currentTime = Date.now();
    
    console.log('AuthContext - Inicializando usuario:', { savedUser, lastServerTime, currentTime });
    
    // Si no hay timestamp del servidor o han pasado más de 10 minutos, limpiar sesión
    if (!lastServerTime || (currentTime - parseInt(lastServerTime)) > 10 * 60 * 1000) {
      console.log('AuthContext - Limpiando sesión por timeout');
      localStorage.removeItem('user');
      localStorage.removeItem('lastServerTime');
      return null;
    }
    
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      console.log('AuthContext - Usuario cargado desde localStorage:', parsedUser);
      return parsedUser;
    }
    
    console.log('AuthContext - No hay usuario guardado');
    return null;
  });

  // Verificar estado del servidor y limpiar sesión si es necesario
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const response = await fetch(`${config.API_BASE_URL}/heartbeat.php`);
        const data = await response.json();
        
        if (data.success) {
          // Servidor activo, actualizar timestamp
          localStorage.setItem('lastServerTime', Date.now().toString());
        }
      } catch (error) {
        // Si no se puede conectar al servidor, limpiar sesión
        console.log('Servidor no disponible, limpiando sesión...');
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('lastServerTime');
      }
    };

    // Verificar inmediatamente al cargar
    checkServerStatus();
    
    // Verificar cada 2 minutos
    const interval = setInterval(checkServerStatus, 2 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const login = async (email, password) => {
    try {
      console.log('AuthContext - Intentando login con:', email);
      
      const response = await fetch(`${config.API_BASE_URL}/api_login.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario: email,
          clave: password
        })
      });

      const data = await response.json();
      console.log('AuthContext - Respuesta del login:', data);

      if (data.success) {
        console.log('AuthContext - Login exitoso, guardando usuario:', data.user);
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        // Actualizar timestamp al hacer login
        localStorage.setItem('lastServerTime', Date.now().toString());
        return true;
      } else {
        console.error('Error de login:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Error en login:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('lastServerTime');
  };

  const clearSession = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('lastServerTime');
  };

  const value = {
    user,
    login,
    logout,
    clearSession,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 