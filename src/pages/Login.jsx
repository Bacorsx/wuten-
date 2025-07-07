import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    usuario: '',
    clave: ''
  });
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [redirectMessage, setRedirectMessage] = useState('');
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Mostrar mensajes desde la URL
    const mensaje = searchParams.get('mensaje');
    const errorParam = searchParams.get('error');

    if (mensaje === 'sesion_cerrada') {
      alert('Su sesión se ha cerrado correctamente.');
    } else if (mensaje === 'sesion_expirada') {
      alert('Su sesión ha expirado. Por favor, inicie sesión nuevamente.');
    } else if (errorParam === 'password') {
      setError('La contraseña ingresada es incorrecta.');
    } else if (errorParam === 'usuario') {
      setError('El usuario ingresado no existe o está inactivo.');
    }

    // Mostrar mensaje si viene redirigido desde una ruta protegida
    if (location.state && location.state.message) {
      setRedirectMessage(location.state.message);
    }
  }, [searchParams, location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Limpiar error al escribir
  };

  const validarCampos = () => {
    const { usuario, clave } = formData;
    
    if (usuario.trim() === '') {
      setError('Debe ingresar el usuario.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(usuario)) {
      setError('Debe ingresar un email válido.');
      return false;
    }

    if (clave === '') {
      setError('Debe ingresar la contraseña.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarCampos()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const success = await login(formData.usuario, formData.clave);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Credenciales inválidas. Por favor, intente nuevamente.');
      }
    } catch (err) {
      setError('Error al iniciar sesión. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Mensaje de redirección */}
      {redirectMessage && (
        <div className="alert alert-warning mt-3" role="alert">
          {redirectMessage}
        </div>
      )}
      <div id="iconos">
        <div className="row">
          <div className="col-sm centrarelementos">
            <img 
              src="/img/mostrar.png" 
              id="m" 
              width="24px" 
              alt="Mostrar"
              onClick={() => setShowLogin(true)}
              style={{ display: showLogin ? 'none' : 'block', cursor: 'pointer' }}
            />
          </div>
          <div className="col-sm centrarelementos">
            <img 
              src="/img/ocultar.png" 
              id="o" 
              width="24px" 
              alt="Ocultar"
              onClick={() => setShowLogin(false)}
              style={{ display: showLogin ? 'block' : 'none', cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>

      <div id="cajalogin" style={{ display: showLogin ? 'block' : 'none' }}>
        <div className="card">
          <div className="card-header titulo">Autenticación Sistema</div>

          <div className="card-body">
            <div className="row">
              <div className="col-sm centrarelementos">
                <img src="/img/login.png" width="200px" alt="Login" />
              </div>
              <div className="col-sm">
                <form onSubmit={handleSubmit} className="textoform centrarelementos">
                  <label htmlFor="usuario">Usuario:</label><br />
                  <input 
                    type="email" 
                    id="usuario" 
                    name="usuario" 
                    value={formData.usuario}
                    onChange={handleInputChange}
                    required 
                  /><br />
                  
                  <label htmlFor="clave">Contraseña:</label><br />
                  <input 
                    type="password" 
                    id="clave" 
                    name="clave" 
                    value={formData.clave}
                    onChange={handleInputChange}
                    minLength="8" 
                    maxLength="20" 
                    required 
                  /><br /><br />
                  
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}
                  
                  <button 
                    type="submit" 
                    className="btn btn-outline-success" 
                    id="btn"
                    disabled={loading}
                  >
                    {loading ? 'Ingresando...' : 'Ingresar'}
                  </button>
                </form>
              </div>
            </div>
          </div>
          
          <div className="card-footer">
            <div id="olvide" className="hipervinculos">
              <a href="/recuperar">Recuperar Contraseña</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 