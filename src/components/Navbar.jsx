import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: '¿Estás seguro de que quieres salir?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#667eea',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate('/');
        Swal.fire({
          icon: 'success',
          title: 'Sesión cerrada',
          text: 'Has cerrado sesión correctamente',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    
    switch (user.tipoUsuario) {
      case 'admin':
        return '/dashboard/admin';
      case 'gestor':
        return '/dashboard/gestor';
      case 'propietario':
        return '/dashboard/propietario';
      default:
        return '/dashboard';
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/" className="navbar-logo">
            Wuten Inmobiliaria
          </Link>
        </div>

        <div className="navbar-menu">
          <Link to="/" className="navbar-link">
            Inicio
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link to={getDashboardLink()} className="navbar-link">
                Dashboard
              </Link>
              <div className="navbar-user">
                <img 
                  src={user?.imagen || '/img/usuarios/comodin.png'} 
                  alt="Usuario" 
                  className="user-avatar"
                />
                <span className="user-name">Hola, {user?.nombre}</span>
                <button onClick={handleLogout} className="btn-logout">
                  Cerrar Sesión
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">
                Iniciar Sesión
              </Link>
              <Link to="/registro" className="navbar-link">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 