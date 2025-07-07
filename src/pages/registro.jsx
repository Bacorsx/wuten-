import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Swal from 'sweetalert2';
import { config } from '../config/config';

const Registro = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombres: '',
    ap_paterno: '',
    ap_materno: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: '',
    tipoUsuario: 'propietario',
    rut: '',
    numeroBienRaiz: '',
    certificadoAntecedentes: null,
    fotoUsuario: null
  });

  const [fotoPreviewUrl, setFotoPreviewUrl] = useState(null);

  const handleChange = (e) => {
    let value = e.target.value;
    
    // Formatear RUT automáticamente
    if (e.target.name === 'rut') {
      // Limpiar el RUT de puntos y guión
      const rutLimpio = value.replace(/[^0-9kK]/g, '');
      
      // Formatear con puntos y guión
      if (rutLimpio.length > 1) {
        const numero = rutLimpio.slice(0, -1);
        const dv = rutLimpio.slice(-1);
        
        // Agregar puntos cada 3 dígitos desde la derecha
        let numeroFormateado = '';
        for (let i = numero.length - 1, j = 0; i >= 0; i--, j++) {
          if (j > 0 && j % 3 === 0) {
            numeroFormateado = '.' + numeroFormateado;
          }
          numeroFormateado = numero[i] + numeroFormateado;
        }
        
        value = numeroFormateado + '-' + dv;
      } else {
        value = rutLimpio;
      }
    }
    
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const fieldName = e.target.name;
    
    // Limpiar URL anterior si existe
    if (fotoPreviewUrl) {
      URL.revokeObjectURL(fotoPreviewUrl);
    }
    
    // Crear nueva URL para vista previa si es foto
    if (fieldName === 'fotoUsuario' && file) {
      const url = URL.createObjectURL(file);
      setFotoPreviewUrl(url);
    } else {
      setFotoPreviewUrl(null);
    }
    
    setFormData({
      ...formData,
      [fieldName]: file
    });
  };

  // Función para validar RUT chileno
  const validarRut = (rut) => {
    // Limpiar el RUT de puntos y guión
    const rutLimpio = rut.replace(/[^0-9kK]/g, '');
    
    if (rutLimpio.length < 2) {
      return false;
    }
    
    const dv = rutLimpio.slice(-1);
    const numero = rutLimpio.slice(0, -1);
    
    if (!/^\d+$/.test(numero)) {
      return false;
    }
    
    let suma = 0;
    let multiplicador = 2;
    
    for (let i = numero.length - 1; i >= 0; i--) {
      suma += parseInt(numero[i]) * multiplicador;
      multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }
    
    const dvEsperado = 11 - (suma % 11);
    let dvCalculado;
    
    if (dvEsperado === 11) {
      dvCalculado = '0';
    } else if (dvEsperado === 10) {
      dvCalculado = 'K';
    } else {
      dvCalculado = dvEsperado.toString();
    }
    
    return dv.toUpperCase() === dvCalculado;
  };

  const validateForm = async () => {
    if (!formData.nombres.trim()) {
      Swal.fire('Error', 'El nombre es requerido', 'error');
      return false;
    }
    if (!formData.ap_paterno.trim()) {
      Swal.fire('Error', 'El apellido paterno es requerido', 'error');
      return false;
    }
    if (!formData.rut.trim()) {
      Swal.fire('Error', 'El RUT es requerido', 'error');
      return false;
    }
    if (!validarRut(formData.rut)) {
      Swal.fire('Error', 'El RUT ingresado no es válido', 'error');
      return false;
    }
    if (!formData.email.trim()) {
      Swal.fire('Error', 'El email es requerido', 'error');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      Swal.fire('Error', 'El formato del email no es válido', 'error');
      return false;
    }
    if (!formData.telefono.trim()) {
      Swal.fire('Error', 'El teléfono es requerido', 'error');
      return false;
    }
    if (formData.password.length < 6) {
      Swal.fire('Error', 'La contraseña debe tener al menos 6 caracteres', 'error');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Swal.fire('Error', 'Las contraseñas no coinciden', 'error');
      return false;
    }
    
    // Validaciones específicas por tipo de usuario (opcionales)
    if (formData.tipoUsuario === 'propietario') {
      if (!formData.numeroBienRaiz.trim()) {
        // Mostrar advertencia pero permitir continuar
        const result = await Swal.fire({
          title: 'Advertencia',
          text: 'No has ingresado un número de bien raíz. ¿Deseas continuar sin este dato?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, continuar',
          cancelButtonText: 'Cancelar'
        });
        
        if (!result.isConfirmed) {
          return false;
        }
      }
    }
    
    if (formData.tipoUsuario === 'gestor') {
      if (!formData.certificadoAntecedentes) {
        // Mostrar advertencia pero permitir continuar
        const result = await Swal.fire({
          title: 'Advertencia',
          text: 'No has subido un certificado de antecedentes. ¿Deseas continuar sin este documento?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, continuar',
          cancelButtonText: 'Cancelar'
        });
        
        if (!result.isConfirmed) {
          return false;
        }
      } else if (formData.certificadoAntecedentes.type !== 'application/pdf') {
        Swal.fire('Error', 'El certificado de antecedentes debe ser un archivo PDF', 'error');
        return false;
      }
    }
    
    return true;
  };

  // Limpiar URL del objeto cuando se desmonte el componente
  useEffect(() => {
    return () => {
      if (fotoPreviewUrl) {
        URL.revokeObjectURL(fotoPreviewUrl);
      }
    };
  }, [fotoPreviewUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!(await validateForm())) {
      return;
    }

    setLoading(true);

    try {
      // Crear FormData para enviar archivos
      const formDataToSend = new FormData();
      formDataToSend.append('nombres', formData.nombres.trim());
      formDataToSend.append('ap_paterno', formData.ap_paterno.trim());
      formDataToSend.append('ap_materno', formData.ap_materno.trim());
      formDataToSend.append('email', formData.email.trim());
      formDataToSend.append('telefono', formData.telefono.trim());
      formDataToSend.append('password', formData.password);
      formDataToSend.append('tipoUsuario', formData.tipoUsuario);
      formDataToSend.append('rut', formData.rut.trim());
      
      // Agregar foto de usuario si existe
      if (formData.fotoUsuario) {
        formDataToSend.append('fotoUsuario', formData.fotoUsuario);
      }
      
      if (formData.tipoUsuario === 'propietario') {
        formDataToSend.append('numeroBienRaiz', formData.numeroBienRaiz.trim());
      }
      
      if (formData.tipoUsuario === 'gestor' && formData.certificadoAntecedentes) {
        formDataToSend.append('certificadoAntecedentes', formData.certificadoAntecedentes);
      }

      console.log('Config API_BASE_URL:', config.API_BASE_URL);
      console.log('URL completa:', `${config.API_BASE_URL}/api_registro.php`);
      
      const response = await fetch(`${config.API_BASE_URL}/api_registro.php`, {
        method: 'POST',
        body: formDataToSend
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: '¡Registro exitoso!',
          text: 'Tu cuenta ha sido creada correctamente. Debes esperar la aprobación del administrador para poder acceder.',
          timer: 5000,
          showConfirmButton: true
        });
        
        // Redirigir al login en lugar de hacer auto-login
        navigate('/login');
      } else {
        Swal.fire('Error', data.message || 'Error al registrar usuario', 'error');
      }
    } catch (error) {
      console.error('Error en registro:', error);
      Swal.fire('Error', 'Error de conexión', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registro-container">
      <Navbar />
      
      <div className="registro-content">
        <div className="registro-form">
          <div className="registro-header">
            <h2>Crear Cuenta</h2>
            <p>Únete a Wuten y encuentra tu propiedad ideal</p>
            <div className="user-types-info">
              <p><strong>Tipos de usuario disponibles:</strong></p>
              <ul>
                <li><strong>Propietario:</strong> Para personas que quieren publicar sus propiedades</li>
                <li><strong>Gestor:</strong> Para profesionales inmobiliarios que gestionan propiedades</li>
              </ul>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nombres">Nombres *</label>
                <input
                  type="text"
                  id="nombres"
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleChange}
                  required
                  placeholder="Ingresa tus nombres"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="ap_paterno">Apellido Paterno *</label>
                <input
                  type="text"
                  id="ap_paterno"
                  name="ap_paterno"
                  value={formData.ap_paterno}
                  onChange={handleChange}
                  required
                  placeholder="Ingresa tu apellido paterno"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="ap_materno">Apellido Materno</label>
              <input
                type="text"
                id="ap_materno"
                name="ap_materno"
                value={formData.ap_materno}
                onChange={handleChange}
                placeholder="Ingresa tu apellido materno"
              />
            </div>

            <div className="form-group">
              <label htmlFor="rut">RUT *</label>
              <input
                type="text"
                id="rut"
                name="rut"
                value={formData.rut}
                onChange={handleChange}
                required
                placeholder="12.345.678-9"
                maxLength="12"
              />
              <small className="form-text text-muted">
                Ingresa tu RUT sin puntos ni guión (ej: 123456789)
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo Electrónico *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="tu@email.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="telefono">Teléfono *</label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                required
                placeholder="+56 9 1234 5678"
              />
            </div>

            <div className="form-group">
              <label htmlFor="fotoUsuario">Foto de Perfil (Opcional)</label>
              <input
                type="file"
                id="fotoUsuario"
                name="fotoUsuario"
                onChange={handleFileChange}
                accept="image/jpeg,image/jpg,image/png"
              />
              <small className="form-text text-muted">
                Sube una foto de perfil (JPG o PNG, máximo 5MB). Si no subes una foto, se usará la imagen por defecto.
              </small>
              {fotoPreviewUrl && (
                <div className="mt-2">
                  <div className="foto-preview">
                    <img 
                      src={fotoPreviewUrl} 
                      alt="Vista previa" 
                      style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%', border: '2px solid #667eea' }}
                    />
                    <small className="text-success d-block mt-1">
                      ✓ Foto seleccionada: {formData.fotoUsuario.name}
                    </small>
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="tipoUsuario">Tipo de Usuario *</label>
              <select
                id="tipoUsuario"
                name="tipoUsuario"
                value={formData.tipoUsuario}
                onChange={handleChange}
                required
              >
                <option value="propietario">Propietario</option>
                <option value="gestor">Gestor</option>
              </select>
            </div>

            {/* Campo específico para propietarios */}
            {formData.tipoUsuario === 'propietario' && (
              <div className="form-group specific-field">
                <label htmlFor="numeroBienRaiz">Número de Bien Raíz (Opcional)</label>
                <input
                  type="number"
                  id="numeroBienRaiz"
                  name="numeroBienRaiz"
                  value={formData.numeroBienRaiz}
                  onChange={handleChange}
                  placeholder="Ej: 123456789"
                  min="1"
                />
                <small className="form-text text-muted">
                  Ingresa el número de bien raíz de tu propiedad (solo números). Este campo es opcional.
                </small>
              </div>
            )}

            {/* Campo específico para gestores */}
            {formData.tipoUsuario === 'gestor' && (
              <div className="form-group specific-field">
                <label htmlFor="certificadoAntecedentes">Certificado de Antecedentes (Opcional)</label>
                <input
                  type="file"
                  id="certificadoAntecedentes"
                  name="certificadoAntecedentes"
                  onChange={handleFileChange}
                  accept=".pdf"
                />
                <small className="form-text text-muted">
                  Sube tu certificado de antecedentes en formato PDF. Este campo es opcional.
                </small>
                {formData.certificadoAntecedentes && (
                  <div className="mt-2">
                    <small className="text-success">
                      ✓ Archivo seleccionado: {formData.certificadoAntecedentes.name}
                    </small>
                  </div>
                )}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="password">Contraseña *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Mínimo 6 caracteres"
                minLength="6"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Contraseña *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Repite tu contraseña"
                minLength="6"
              />
            </div>

            <button 
              type="submit" 
              className="btn-registro"
              disabled={loading}
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>

          <div className="registro-links">
            <p>¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link></p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Registro; 