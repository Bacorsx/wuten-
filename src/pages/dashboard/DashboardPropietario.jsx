import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { propiedadesApi } from '../../api/propiedadesApi';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Swal from 'sweetalert2';

const DashboardPropietario = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPropiedades: 0,
    propiedadesDisponibles: 0,
    propiedadesVendidas: 0,
    propiedadesReservadas: 0,
    totalContactos: 0
  });
  const [misPropiedades, setMisPropiedades] = useState([]);
  const [recentContacts, setRecentContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    try {
      setLoading(true);
      
      // Cargar propiedades del propietario
      const propertiesResponse = await propiedadesApi.getPropiedades({ 
        id_usuario: user?.id,
        limit: 10 
      });
      
      if (propertiesResponse.success) {
        setMisPropiedades(propertiesResponse.propiedades);
        
        // Calcular estadísticas
        const total = propertiesResponse.propiedades.length;
        const disponibles = propertiesResponse.propiedades.filter(p => p.estado == 1).length;
        const vendidas = propertiesResponse.propiedades.filter(p => p.estado == 0).length;
        const reservadas = 0; // Por ahora no hay estado reservada
        
        setStats({
          totalPropiedades: total,
          propiedadesDisponibles: disponibles,
          propiedadesVendidas: vendidas,
          propiedadesReservadas: reservadas,
          totalContactos: 0 // Se calculará por separado
        });
      }

      // Cargar contactos recientes (filtrar por propiedades del usuario)
      const contactsResponse = await propiedadesApi.listarContactos(1, 10);
      if (contactsResponse.success) {
        // Filtrar contactos de las propiedades del usuario
        const misPropiedadesIds = misPropiedades.map(p => p.idpropiedades);
        const contactosFiltrados = contactsResponse.contactos.filter(
          c => misPropiedadesIds.includes(c.id_propiedad)
        );
        setRecentContacts(contactosFiltrados.slice(0, 5));
        setStats(prev => ({ ...prev, totalContactos: contactosFiltrados.length }));
      }

    } catch (error) {
      console.error('Error al cargar dashboard:', error);
      Swal.fire('Error', 'Error al cargar el dashboard', 'error');
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="dashboard-container">
        <Navbar />
        <div className="loading">
          <div className="spinner"></div>
          <p>Cargando dashboard...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Navbar />

      <div className="dashboard-content">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-info">
            <h1>Panel de Propietario</h1>
            <p>Bienvenido, {user?.nombre}</p>
          </div>
          <div className="header-actions">
            <Link to="/dashboard/propietario/propiedades/nueva" className="btn-primary">
              Nueva Propiedad
            </Link>
            <Link to="/dashboard/propietario/propiedades" className="btn-secondary">
              Ver Mis Propiedades
            </Link>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="stats-section">
          <h2>Mis Estadísticas</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🏠</div>
              <div className="stat-content">
                <h3>Total Propiedades</h3>
                <div className="stat-number">{stats.totalPropiedades}</div>
                <small>En el sistema</small>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <h3>Disponibles</h3>
                <div className="stat-number available">{stats.propiedadesDisponibles}</div>
                <small>Para venta/arriendo</small>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <h3>Vendidas</h3>
                <div className="stat-number sold">{stats.propiedadesVendidas}</div>
                <small>Transacciones completadas</small>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <div className="stat-content">
                <h3>Reservadas</h3>
                <div className="stat-number reserved">{stats.propiedadesReservadas}</div>
                <small>En proceso</small>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📧</div>
              <div className="stat-content">
                <h3>Contactos</h3>
                <div className="stat-number">{stats.totalContactos}</div>
                <small>Mensajes recibidos</small>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="actions-section">
          <h2>Acciones Rápidas</h2>
          <div className="actions-grid">
            <Link to="/dashboard/propietario/propiedades/nueva" className="action-card">
              <div className="action-icon">➕</div>
              <h3>Publicar Propiedad</h3>
              <p>Agregar una nueva propiedad al catálogo</p>
            </Link>

            <Link to="/dashboard/propietario/propiedades" className="action-card">
              <div className="action-icon">📋</div>
              <h3>Gestionar Propiedades</h3>
              <p>Editar o actualizar tus propiedades</p>
            </Link>

            <Link to="/contactos" className="action-card">
              <div className="action-icon">📧</div>
              <h3>Ver Contactos</h3>
              <p>Revisar mensajes de interesados</p>
            </Link>

            <Link to="/reportes" className="action-card">
              <div className="action-icon">📊</div>
              <h3>Reportes</h3>
              <p>Ver estadísticas detalladas</p>
            </Link>
          </div>
        </div>

        {/* Mis Propiedades */}
        <div className="properties-section">
          <div className="section-header">
            <h2>Mis Propiedades</h2>
            <Link to="/dashboard/propietario/propiedades" className="btn-secondary">Ver todas</Link>
          </div>
          
          {misPropiedades.length > 0 ? (
            <div className="properties-table">
              <table>
                <thead>
                  <tr>
                    <th>Propiedad</th>
                    <th>Precio</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {misPropiedades.map((propiedad) => (
                    <tr key={propiedad.idpropiedades}>
                      <td>
                        <div className="property-info">
                          <h4>{propiedad.titulopropiedad}</h4>
                          <p>{propiedad.comuna}, {propiedad.provincia}</p>
                        </div>
                      </td>
                      <td>{formatearPrecio(propiedad.precio_pesos)}</td>
                      <td>
                        <span className={`status ${propiedad.estado == 1 ? 'disponible' : 'vendida'}`}>
                          {propiedad.estado == 1 ? 'Disponible' : 'Vendida'}
                        </span>
                      </td>
                      <td>{formatearFecha(propiedad.fecha_publicacion)}</td>
                      <td>
                        <div className="actions">
                          <Link to={`/detalle/${propiedad.idpropiedades}`} className="btn-small">
                            Ver
                          </Link>
                          <Link to={`/dashboard/propietario/propiedades/editar/${propiedad.idpropiedades}`} className="btn-small">
                            Editar
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-properties">
              <h3>No tienes propiedades publicadas</h3>
              <p>Comienza publicando tu primera propiedad</p>
              <Link to="/dashboard/propietario/propiedades/nueva" className="btn-primary">
                Publicar Propiedad
              </Link>
            </div>
          )}
        </div>

        {/* Contactos Recientes */}
        {recentContacts.length > 0 && (
          <div className="activity-section">
            <div className="section-header">
              <h2>Contactos Recientes</h2>
              <Link to="/contactos" className="btn-secondary">Ver todos</Link>
            </div>
            
            <div className="activity-list">
              {recentContacts.map((contacto) => (
                <div key={contacto.id} className="activity-item">
                  <div className="activity-icon">📧</div>
                  <div className="activity-content">
                    <div className="activity-description">
                      <strong>{contacto.nombre}</strong> envió un mensaje sobre la propiedad #{contacto.id_propiedad}
                    </div>
                    <div className="activity-meta">
                      <span className="activity-date">{formatearFecha(contacto.fecha)}</span>
                      <span className="activity-user">{contacto.email}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default DashboardPropietario; 