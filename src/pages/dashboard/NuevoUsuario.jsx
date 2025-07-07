import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { propiedadesApi } from '../../api/propiedadesApi';

const NuevoUsuario = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombres: '',
    ap_paterno: '',
    ap_materno: '',
    usuario: '',
    contrasena: '',
    confirmar_contrasena: '',
    telefono: '',
    tipo_usuario: ''
  });
  const [errors, setErrors] = useState({});

  const tiposUsuario = [
    { value: 'administrador', label: 'Administrador' },
    { value: 'gestor', label: 'Gestor' },
    { value: 'propietario', label: 'Propietario' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.nombres.trim()) {
      nuevosErrores.nombres = 'Los nombres son requeridos';
    }

    if (!formData.ap_paterno.trim()) {
      nuevosErrores.ap_paterno = 'El apellido paterno es requerido';
    }

    if (!formData.usuario.trim()) {
      nuevosErrores.usuario = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.usuario)) {
      nuevosErrores.usuario = 'El email no es válido';
    }

    if (!formData.contrasena) {
      nuevosErrores.contrasena = 'La contraseña es requerida';
    } else if (formData.contrasena.length < 6) {
      nuevosErrores.contrasena = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (formData.contrasena !== formData.confirmar_contrasena) {
      nuevosErrores.confirmar_contrasena = 'Las contraseñas no coinciden';
    }

    if (!formData.tipo_usuario) {
      nuevosErrores.tipo_usuario = 'El tipo de usuario es requerido';
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    setLoading(true);
    try {
      const datosUsuario = {
        nombres: formData.nombres.trim(),
        ap_paterno: formData.ap_paterno.trim(),
        ap_materno: formData.ap_materno.trim(),
        usuario: formData.usuario.trim().toLowerCase(),
        contrasena: formData.contrasena,
        telefono: formData.telefono.trim(),
        tipo_usuario: formData.tipo_usuario
      };

      await propiedadesApi.crearUsuario(datosUsuario);
      alert('Usuario creado exitosamente');
      navigate('/admin/usuarios');
    } catch (error) {
      console.error('Error al crear usuario:', error);
      alert('Error al crear el usuario: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">
                <i className="fas fa-user-plus me-2"></i>
                Nuevo Usuario
              </h4>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {/* Información Personal */}
                <div className="row mb-4">
                  <div className="col-12">
                    <h5 className="border-bottom pb-2">
                      <i className="fas fa-user me-2"></i>
                      Información Personal
                    </h5>
                  </div>
                  
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label">Nombres *</label>
                      <input
                        type="text"
                        className={`form-control ${errors.nombres ? 'is-invalid' : ''}`}
                        name="nombres"
                        value={formData.nombres}
                        onChange={handleInputChange}
                        placeholder="Ej: Juan Carlos"
                      />
                      {errors.nombres && (
                        <div className="invalid-feedback">{errors.nombres}</div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label">Apellido Paterno *</label>
                      <input
                        type="text"
                        className={`form-control ${errors.ap_paterno ? 'is-invalid' : ''}`}
                        name="ap_paterno"
                        value={formData.ap_paterno}
                        onChange={handleInputChange}
                        placeholder="Ej: González"
                      />
                      {errors.ap_paterno && (
                        <div className="invalid-feedback">{errors.ap_paterno}</div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label">Apellido Materno</label>
                      <input
                        type="text"
                        className="form-control"
                        name="ap_materno"
                        value={formData.ap_materno}
                        onChange={handleInputChange}
                        placeholder="Ej: Silva"
                      />
                    </div>
                  </div>
                </div>

                {/* Información de Contacto */}
                <div className="row mb-4">
                  <div className="col-12">
                    <h5 className="border-bottom pb-2">
                      <i className="fas fa-envelope me-2"></i>
                      Información de Contacto
                    </h5>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Email *</label>
                      <input
                        type="email"
                        className={`form-control ${errors.usuario ? 'is-invalid' : ''}`}
                        name="usuario"
                        value={formData.usuario}
                        onChange={handleInputChange}
                        placeholder="usuario@ejemplo.com"
                      />
                      {errors.usuario && (
                        <div className="invalid-feedback">{errors.usuario}</div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Teléfono</label>
                      <input
                        type="tel"
                        className="form-control"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleInputChange}
                        placeholder="+56 9 1234 5678"
                      />
                    </div>
                  </div>
                </div>

                {/* Seguridad */}
                <div className="row mb-4">
                  <div className="col-12">
                    <h5 className="border-bottom pb-2">
                      <i className="fas fa-lock me-2"></i>
                      Seguridad
                    </h5>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Contraseña *</label>
                      <input
                        type="password"
                        className={`form-control ${errors.contrasena ? 'is-invalid' : ''}`}
                        name="contrasena"
                        value={formData.contrasena}
                        onChange={handleInputChange}
                        placeholder="Mínimo 6 caracteres"
                      />
                      {errors.contrasena && (
                        <div className="invalid-feedback">{errors.contrasena}</div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Confirmar Contraseña *</label>
                      <input
                        type="password"
                        className={`form-control ${errors.confirmar_contrasena ? 'is-invalid' : ''}`}
                        name="confirmar_contrasena"
                        value={formData.confirmar_contrasena}
                        onChange={handleInputChange}
                        placeholder="Repita la contraseña"
                      />
                      {errors.confirmar_contrasena && (
                        <div className="invalid-feedback">{errors.confirmar_contrasena}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tipo de Usuario */}
                <div className="row mb-4">
                  <div className="col-12">
                    <h5 className="border-bottom pb-2">
                      <i className="fas fa-users-cog me-2"></i>
                      Tipo de Usuario
                    </h5>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Rol *</label>
                      <select
                        className={`form-select ${errors.tipo_usuario ? 'is-invalid' : ''}`}
                        name="tipo_usuario"
                        value={formData.tipo_usuario}
                        onChange={handleInputChange}
                      >
                        <option value="">Seleccionar rol</option>
                        {tiposUsuario.map(tipo => (
                          <option key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </option>
                        ))}
                      </select>
                      {errors.tipo_usuario && (
                        <div className="invalid-feedback">{errors.tipo_usuario}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Información de Roles */}
                <div className="row mb-4">
                  <div className="col-12">
                    <div className="alert alert-info">
                      <h6><i className="fas fa-info-circle me-2"></i>Información sobre los roles:</h6>
                      <ul className="mb-0">
                        <li><strong>Administrador:</strong> Acceso completo al sistema, puede gestionar usuarios, propiedades y ver todas las estadísticas.</li>
                        <li><strong>Gestor:</strong> Puede gestionar propiedades, ver contactos y estadísticas limitadas.</li>
                        <li><strong>Propietario:</strong> Puede crear y gestionar sus propias propiedades.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Botones */}
                <div className="row">
                  <div className="col-12">
                    <div className="d-flex justify-content-end gap-2">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate('/admin/usuarios')}
                      >
                        <i className="fas fa-times me-2"></i>
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Creando...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-save me-2"></i>
                            Crear Usuario
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NuevoUsuario; 