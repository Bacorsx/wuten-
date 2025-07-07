import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { propiedadesApi } from '../../api/propiedadesApi';

const EditarUsuario = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [errors, setErrors] = useState({});

  const tiposUsuario = [
    { value: 'administrador', label: 'Administrador' },
    { value: 'gestor', label: 'Gestor' },
    { value: 'propietario', label: 'Propietario' }
  ];

  useEffect(() => {
    cargarUsuario();
  }, [id]);

  const cargarUsuario = async () => {
    try {
      const response = await propiedadesApi.obtenerUsuario(id);
      if (response.success) {
        setUsuario(response.usuario);
      }
    } catch (error) {
      console.error('Error al cargar usuario:', error);
      alert('Error al cargar el usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUsuario(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!usuario.nombres?.trim()) {
      nuevosErrores.nombres = 'Los nombres son requeridos';
    }

    if (!usuario.ap_paterno?.trim()) {
      nuevosErrores.ap_paterno = 'El apellido paterno es requerido';
    }

    if (!usuario.usuario?.trim()) {
      nuevosErrores.usuario = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(usuario.usuario)) {
      nuevosErrores.usuario = 'El email no es válido';
    }

    if (!usuario.tipo_usuario) {
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

    setSaving(true);
    try {
      const datosActualizados = {
        nombres: usuario.nombres.trim(),
        ap_paterno: usuario.ap_paterno.trim(),
        ap_materno: usuario.ap_materno?.trim() || '',
        usuario: usuario.usuario.trim().toLowerCase(),
        telefono: usuario.telefono?.trim() || '',
        tipo_usuario: usuario.tipo_usuario
      };

      await propiedadesApi.actualizarUsuario(id, datosActualizados);
      alert('Usuario actualizado exitosamente');
      navigate('/admin/usuarios');
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      alert('Error al actualizar el usuario: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCambiarEstado = async () => {
    const nuevoEstado = !usuario.activo;
    const accion = nuevoEstado ? 'activar' : 'desactivar';
    
    if (!confirm(`¿Está seguro de que desea ${accion} este usuario?`)) {
      return;
    }

    try {
      await propiedadesApi.cambiarEstadoUsuario(id, nuevoEstado);
      alert(`Usuario ${accion}do exitosamente`);
      await cargarUsuario(); // Recargar datos
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error al cambiar el estado del usuario: ' + error.message);
    }
  };

  const handleEliminar = async () => {
    if (!confirm('¿Está seguro de que desea eliminar este usuario? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await propiedadesApi.eliminarUsuario(id);
      alert('Usuario eliminado exitosamente');
      navigate('/admin/usuarios');
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      alert('Error al eliminar el usuario: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body text-center">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-2">Cargando usuario...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body text-center">
                <h4>Usuario no encontrado</h4>
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/admin/usuarios')}
                >
                  Volver a Usuarios
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="card-title">
                <i className="fas fa-user-edit me-2"></i>
                Editar Usuario
              </h4>
              <div className="btn-group">
                <button
                  className={`btn ${usuario.activo ? 'btn-warning' : 'btn-success'}`}
                  onClick={handleCambiarEstado}
                >
                  <i className={`fas ${usuario.activo ? 'fa-user-slash' : 'fa-user-check'} me-2`}></i>
                  {usuario.activo ? 'Desactivar' : 'Activar'}
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleEliminar}
                >
                  <i className="fas fa-trash me-2"></i>
                  Eliminar
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate('/admin/usuarios')}
                >
                  <i className="fas fa-arrow-left me-2"></i>
                  Volver
                </button>
              </div>
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
                        value={usuario.nombres || ''}
                        onChange={handleInputChange}
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
                        value={usuario.ap_paterno || ''}
                        onChange={handleInputChange}
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
                        value={usuario.ap_materno || ''}
                        onChange={handleInputChange}
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
                        value={usuario.usuario || ''}
                        onChange={handleInputChange}
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
                        value={usuario.telefono || ''}
                        onChange={handleInputChange}
                      />
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
                        value={usuario.tipo_usuario || ''}
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

                {/* Información del Usuario */}
                <div className="row mb-4">
                  <div className="col-12">
                    <h5 className="border-bottom pb-2">
                      <i className="fas fa-info-circle me-2"></i>
                      Información del Usuario
                    </h5>
                  </div>
                  
                  <div className="col-md-3">
                    <div className="mb-3">
                      <label className="form-label">Estado</label>
                      <div>
                        <span className={`badge ${usuario.activo ? 'bg-success' : 'bg-danger'}`}>
                          {usuario.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="mb-3">
                      <label className="form-label">Fecha de Registro</label>
                      <div className="form-control-plaintext">
                        {usuario.fecha_registro_formateada || 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="mb-3">
                      <label className="form-label">Último Acceso</label>
                      <div className="form-control-plaintext">
                        {usuario.ultimo_acceso_formateado || 'Nunca'}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="mb-3">
                      <label className="form-label">Propiedades</label>
                      <div className="form-control-plaintext">
                        {usuario.propiedades_count || 0} propiedades
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advertencia sobre contraseña */}
                <div className="row mb-4">
                  <div className="col-12">
                    <div className="alert alert-warning">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      <strong>Nota:</strong> Para cambiar la contraseña del usuario, 
                      el administrador debe contactar al usuario directamente o usar 
                      la función de recuperación de contraseña.
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
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Guardando...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-save me-2"></i>
                            Guardar Cambios
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

export default EditarUsuario; 