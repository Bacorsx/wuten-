import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { propiedadesApi } from '../../api/propiedadesApi';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Swal from 'sweetalert2';

const AdminPropiedades = () => {
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
            <h1>Gestión de Propiedades</h1>
            <p>Administra todas las propiedades del sistema</p>
          </div>
          <div className="header-actions">
            <Link to="/dashboard/admin/propiedades/nueva-propiedad" className="btn-primary">
              Nueva Propiedad
            </Link>
            <Link to="/admin" className="btn-secondary">
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
                <option value="Disponible">Disponible</option>
                <option value="Reservada">Reservada</option>
                <option value="Vendida">Vendida</option>
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

        {/* Tabla de propiedades */}
        <div className="properties-section">
          <div className="section-header">
            <h2>Propiedades ({pagination.total})</h2>
            <div className="section-actions">
              <span>Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total}</span>
            </div>
          </div>

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Cargando propiedades...</p>
            </div>
          ) : (
            <>
              <div className="properties-table">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Propiedad</th>
                      <th>Propietario</th>
                      <th>Precio</th>
                      <th>Estado</th>
                      <th>Fecha</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {propiedades.map((propiedad) => (
                      <tr key={propiedad.idpropiedades}>
                        <td>#{propiedad.idpropiedades}</td>
                        <td>
                          <div className="property-info">
                            <h4>{propiedad.titulopropiedad}</h4>
                            <p>{propiedad.tipo_propiedad} • {propiedad.comuna}, {propiedad.provincia}</p>
                            <small>{propiedad.dormitorios} dorm, {propiedad.banos} baños, {propiedad.metros_cuadrados}m²</small>
                          </div>
                        </td>
                        <td>
                          <span className="client-type">
                            {propiedad.propietario?.nombre || 'N/A'}
                          </span>
                        </td>
                        <td>{formatearPrecio(propiedad.precio_pesos)}</td>
                                              <td>
                        <span className={`status ${propiedad.estado ? propiedad.estado.toLowerCase() : 'disponible'}`}>
                          {propiedad.estado || 'Disponible'}
                        </span>
                      </td>
                        <td>{formatearFecha(propiedad.fecha_publicacion)}</td>
                        <td>
                          <div className="actions">
                            <Link to={`/dashboard/admin/propiedades/gestionar/${propiedad.idpropiedades}`} className="btn-small">
                              Ver
                            </Link>
                            <Link to={`/dashboard/admin/propiedades/editar/${propiedad.idpropiedades}`} className="btn-small">
                              Editar
                            </Link>
                            <button 
                              className="btn-small btn-danger"
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

export default AdminPropiedades; 