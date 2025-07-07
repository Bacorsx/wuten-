import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const SessionNotification = () => {
  const [showNotification, setShowNotification] = useState(false);
  const { user, clearSession } = useAuth();

  useEffect(() => {
    // Mostrar notificación si el usuario estaba logueado pero ahora no
    const wasLoggedIn = localStorage.getItem('wasLoggedIn') === 'true';
    const isCurrentlyLoggedIn = !!user;
    
    if (wasLoggedIn && !isCurrentlyLoggedIn) {
      setShowNotification(true);
      // Limpiar el flag
      localStorage.removeItem('wasLoggedIn');
    }
    
    // Marcar si está logueado
    if (isCurrentlyLoggedIn) {
      localStorage.setItem('wasLoggedIn', 'true');
    }
  }, [user]);

  const handleClose = () => {
    setShowNotification(false);
  };

  if (!showNotification) return null;

  return (
    <div className="alert alert-warning alert-dismissible fade show position-fixed" 
         style={{ top: '20px', right: '20px', zIndex: 9999, minWidth: '300px' }}
         role="alert">
      <strong>¡Atención!</strong> Tu sesión ha sido cerrada automáticamente debido a un reinicio del servidor.
      <button type="button" className="btn-close" onClick={handleClose}></button>
    </div>
  );
};

export default SessionNotification; 