import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { propiedadesApi } from '../../api/propiedadesApi';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Swal from 'sweetalert2';
import '../../styles/dashboard.css';

const AdminUsuarios = () => {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    tipo_usuario: '',
    estado: '',
    busqueda: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0
  });

  useEffect(() => {
    cargarUsuarios();
  }, [pagination.page, filtros]);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      
      const response = await propiedadesApi.listarUsuarios({
        ...filtros,
        page: pagination.page,
        limit: pagination.limit
      });
      
      if (response.success) {
        setUsuarios(response.usuarios);
        setPagination(prev => ({
          ...prev,
          total: response.total
        }));
      } else {
        Swal.fire('Error', response.message || 'Error al cargar usuarios', 'error');
      }

    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      Swal.fire('Error', 'Error al cargar los usuarios', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleCambiarEstado = async (id, nuevoEstado) => {
    const result = await Swal.fire({
      title: `¿${nuevoEstado === 'Activo' ? 'Activar' : 'Desactivar'} usuario?`,
      text: `¿Deseas ${nuevoEstado === 'Activo' ? 'activar' : 'desactivar'} este usuario?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const activo = nuevoEstado === 'Activo';
        const response = await propiedadesApi.cambiarEstadoUsuario(id, activo);
        
        if (response.success) {
          setUsuarios(prev => prev.map(u => 
            u.id === id ? { ...u, estado: nuevoEstado, activo: activo } : u
          ));
          Swal.fire('Actualizado', response.message, 'success');
        } else {
          Swal.fire('Error', response.message || 'Error al cambiar estado', 'error');
        }
      } catch (error) {
        console.error('Error al cambiar estado:', error);
        Swal.fire('Error', 'Error al cambiar el estado del usuario', 'error');
      }
    }
  };

  const handleEliminarUsuario = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar usuario?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const response = await propiedadesApi.eliminarUsuario(id);
        
        if (response.success) {
          setUsuarios(prev => prev.filter(u => u.id !== id));
          Swal.fire('Eliminado', response.message, 'success');
        } else {
          Swal.fire('Error', response.message || 'Error al eliminar', 'error');
        }
      } catch (error) {
        console.error('Error al eliminar:', error);
        Swal.fire('Error', 'Error al eliminar el usuario', 'error');
      }
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="dashboard-container">
      <Navbar />

      <div className="dashboard-content">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-info">
            <h1>Gestión de Usuarios</h1>
            <p>Administra todos los usuarios del sistema</p>
          </div>
          <div className="header-actions">
            <Link to="/dashboard/admin/usuarios/nuevo" className="btn-primary">
              Nuevo Usuario
            </Link>
            <Link to="/dashboard/admin" className="btn-secondary">
              Volver al Dashboard
            </Link>
          </div>
        </div>

        {/* Filtros */}
        <div className="filters-section">
          <h3>Filtros</h3>
          <div className="filters-grid">
            <div className="filter-group">
              <label>Tipo de Usuario:</label>
              <select 
                value={filtros.tipo_usuario} 
                onChange={(e) => handleFiltroChange('tipo_usuario', e.target.value)}
              >
                <option value="">Todos</option>
                <option value="Admin">Administrador</option>
                <option value="Gestor">Gestor</option>
                <option value="Propietario">Propietario</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Estado:</label>
              <select 
                value={filtros.estado} 
                onChange={(e) => handleFiltroChange('estado', e.target.value)}
              >
                <option value="">Todos</option>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Buscar:</label>
              <input 
                type="text" 
                placeholder="Nombre o email"
                value={filtros.busqueda}
                onChange={(e) => handleFiltroChange('busqueda', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <button 
                className="btn-secondary"
                onClick={() => {
                  setFiltros({
                    tipo_usuario: '',
                    estado: '',
                    busqueda: ''
                  });
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Tabla de usuarios */}
        <div className="users-section">
          <div className="section-header">
            <h2>Usuarios ({pagination.total})</h2>
            <div className="section-actions">
              <span>Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total}</span>
            </div>
          </div>

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Cargando usuarios...</p>
            </div>
          ) : (
            <>
              <div className="users-table">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Foto</th>
                      <th>Usuario</th>
                      <th>Tipo</th>
                      <th>Estado</th>
                      <th>Documentos</th>
                      <th>Propiedades</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((usuario) => (
                      <tr key={usuario.id_usuario}>
                        <td>#{usuario.id_usuario}</td>
                        <td>
                          <div className="user-photo">
                            <img 
                              src={`http://localhost/react-wuten/public/img/usuarios/${usuario.foto || 'comodin.png'}`}
                              alt={`Foto de ${usuario.nombre_completo}`}
                              onError={(e) => {
                                e.target.src = 'http://localhost/react-wuten/public/img/usuarios/comodin.png';
                              }}
                            />
                          </div>
                        </td>
                        <td>
                          <div className="user-info">
                            <h4>{usuario.nombre_completo}</h4>
                            <p>{usuario.email}</p>
                          </div>
                        </td>
                        <td>
                          <span className={`user-type ${usuario.tipo_usuario ? usuario.tipo_usuario.toLowerCase() : 'usuario'}`}>
                            {usuario.tipo_usuario || 'Usuario'}
                          </span>
                        </td>
                        <td>
                          <span className={`status ${usuario.estado ? 'activo' : 'inactivo'}`}>
                            {usuario.estado ? 'Activo' : 'Pendiente'}
                          </span>
                        </td>
                        <td>
                          <div className="documents-info">
                            {usuario.tipo_usuario === 'propietario' && usuario.numeroBienRaiz && (
                              <div className="document-item">
                                <small className="text-muted">Bien Raíz: {usuario.numeroBienRaiz}</small>
                              </div>
                            )}
                            {usuario.tipo_usuario === 'gestor' && usuario.certificadoAntecedentes && (
                              <div className="document-item">
                                <small className="text-muted">
                                  <a href={`/public/file/certificados/${usuario.certificadoAntecedentes}`} target="_blank" rel="noopener noreferrer">
                                    📄 Ver Certificado
                                  </a>
                                </small>
                              </div>
                            )}
                            {!usuario.numeroBienRaiz && !usuario.certificadoAntecedentes && (
                              <small className="text-muted">Sin documentos</small>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="properties-count">
                            {usuario.propiedades_count} propiedades
                          </span>
                        </td>
                        <td>
                          <div className="actions">
                            <Link to={`/dashboard/admin/usuarios/editar/${usuario.id_usuario}`} className="btn-small">
                              Editar
                            </Link>
                            <button 
                              className={`btn-small ${usuario.estado === 'Activo' ? 'btn-warning' : 'btn-success'}`}
                              onClick={() => handleCambiarEstado(usuario.id_usuario, usuario.estado === 'Activo' ? 'Inactivo' : 'Activo')}
                            >
                              {usuario.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                            </button>
                            <button 
                              className="btn-small btn-danger"
                              onClick={() => handleEliminarUsuario(usuario.id_usuario)}
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    className="btn-secondary"
                    disabled={pagination.page === 1}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  >
                    Anterior
                  </button>
                  
                  <div className="page-numbers">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        className={`btn-small ${pagination.page === page ? 'active' : ''}`}
                        onClick={() => setPagination(prev => ({ ...prev, page }))}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  
                  <button 
                    className="btn-secondary"
                    disabled={pagination.page === totalPages}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminUsuarios; 