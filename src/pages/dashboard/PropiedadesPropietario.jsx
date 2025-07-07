import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { propiedadesApi } from '../../api/propiedadesApi';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Swal from 'sweetalert2';

const PropiedadesPropietario = () => {
  const { user } = useAuth();
  const [propiedades, setPropiedades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    estado: '',
    tipo_propiedad: '',
    comuna: '',
    precio_min: '',
    precio_max: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0
  });

  useEffect(() => {
    cargarPropiedades();
  }, [pagination.page, filtros]);

  const cargarPropiedades = async () => {
    try {
      setLoading(true);
      const response = await propiedadesApi.getPropiedades({
        ...filtros,
        id_usuario: user?.id,
        page: pagination.page,
        limit: pagination.limit
      });
      
      if (response.success) {
        setPropiedades(response.propiedades);
        setPagination(prev => ({
          ...prev,
          total: response.total || response.propiedades.length
        }));
      } else {
        Swal.fire('Error', response.message || 'Error al cargar propiedades', 'error');
      }
    } catch (error) {
      console.error('Error al cargar propiedades:', error);
      Swal.fire('Error', 'Error al cargar las propiedades', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleEliminarPropiedad = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar propiedad?',
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
        const response = await propiedadesApi.eliminarPropiedad(id);
        if (response.success) {
          Swal.fire('Eliminada', 'La propiedad ha sido eliminada', 'success');
          cargarPropiedades();
        } else {
          Swal.fire('Error', response.message || 'Error al eliminar', 'error');
        }
      } catch (error) {
        console.error('Error al eliminar:', error);
        Swal.fire('Error', 'Error al eliminar la propiedad', 'error');
      }
    }
  };

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(precio);
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
            <h1>Mis Propiedades</h1>
            <p>Gestiona tus propiedades publicadas</p>
          </div>
          <div className="header-actions">
            <Link to="/dashboard/propietario/propiedades/nueva" className="btn-primary">
              Nueva Propiedad
            </Link>
            <Link to="/dashboard/propietario" className="btn-secondary">
              Volver al Dashboard
            </Link>
          </div>
        </div>

        {/* Filtros */}
        <div className="filters-section">
          <h3>Filtros</h3>
          <div className="filters-grid">
            <div className="filter-group">
              <label>Estado:</label>
              <select 
                value={filtros.estado} 
                onChange={(e) => handleFiltroChange('estado', e.target.value)}
              >
                <option value="">Todos</option>
                <option value="1">Disponible</option>
                <option value="0">No disponible</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Tipo:</label>
              <select 
                value={filtros.tipo_propiedad} 
                onChange={(e) => handleFiltroChange('tipo_propiedad', e.target.value)}
              >
                <option value="">Todos</option>
                <option value="Casa">Casa</option>
                <option value="Departamento">Departamento</option>
                <option value="Oficina">Oficina</option>
                <option value="Terreno">Terreno</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Comuna:</label>
              <input 
                type="text" 
                placeholder="Buscar por comuna"
                value={filtros.comuna}
                onChange={(e) => handleFiltroChange('comuna', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>Precio mínimo:</label>
              <input 
                type="number" 
                placeholder="Precio mínimo"
                value={filtros.precio_min}
                onChange={(e) => handleFiltroChange('precio_min', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>Precio máximo:</label>
              <input 
                type="number" 
                placeholder="Precio máximo"
                value={filtros.precio_max}
                onChange={(e) => handleFiltroChange('precio_max', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <button 
                className="btn-secondary"
                onClick={() => {
                  setFiltros({
                    estado: '',
                    tipo_propiedad: '',
                    comuna: '',
                    precio_min: '',
                    precio_max: ''
                  });
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Tabla de Propiedades */}
        <div className="properties-section">
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Cargando propiedades...</p>
            </div>
          ) : propiedades.length > 0 ? (
            <>
              <div className="properties-table">
                <table>
                  <thead>
                    <tr>
                      <th>Propiedad</th>
                      <th>Ubicación</th>
                      <th>Precio</th>
                      <th>Estado</th>
                      <th>Fecha</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {propiedades.map(propiedad => (
                      <tr key={propiedad.idpropiedades}>
                        <td>
                          <div className="property-info">
                            <div className="property-image">
                              <img 
                                src={propiedad.imagen_url || '/img/propiedades/sin_imagen.jpg'} 
                                alt={propiedad.titulopropiedad}
                              />
                            </div>
                            <div className="property-details">
                              <h4>{propiedad.titulopropiedad}</h4>
                              <p>{propiedad.tipo_propiedad}</p>
                              <small>
                                {propiedad.cant_domitorios} dorm, {propiedad.cant_banos} baños
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="location-info">
                            <p>{propiedad.nombre_sector}</p>
                            <small>{propiedad.nombre_comuna}, {propiedad.nombre_provincia}</small>
                          </div>
                        </td>
                        <td>
                          <div className="price-info">
                            <strong>{formatearPrecio(propiedad.precio_pesos)}</strong>
                            {propiedad.precio_uf && (
                              <small>{propiedad.precio_uf} UF</small>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge ${propiedad.estado === 1 ? 'available' : 'unavailable'}`}>
                            {propiedad.estado === 1 ? 'Disponible' : 'No disponible'}
                          </span>
                        </td>
                        <td>
                          {formatearFecha(propiedad.fecha_publicacion)}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <Link 
                              to={`/dashboard/propietario/propiedades/editar/${propiedad.idpropiedades}`}
                              className="btn-edit"
                            >
                              Editar
                            </Link>
                            <button
                              className="btn-delete"
                              onClick={() => handleEliminarPropiedad(propiedad.idpropiedades)}
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
                    className="btn-page"
                    disabled={pagination.page === 1}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  >
                    Anterior
                  </button>
                  
                  <span className="page-info">
                    Página {pagination.page} de {totalPages}
                  </span>
                  
                  <button
                    className="btn-page"
                    disabled={pagination.page === totalPages}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🏠</div>
              <h3>No tienes propiedades</h3>
              <p>Comienza publicando tu primera propiedad</p>
              <Link to="/dashboard/propietario/propiedades/nueva" className="btn-primary">
                Publicar Propiedad
              </Link>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PropiedadesPropietario; 