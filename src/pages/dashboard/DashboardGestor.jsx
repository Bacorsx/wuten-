import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { propiedadesApi } from '../../api/propiedadesApi';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Swal from 'sweetalert2';

const DashboardGestor = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPropiedades: 0,
    propiedadesDisponibles: 0,
    propiedadesVendidas: 0,
    propiedadesReservadas: 0,
    totalClientes: 0,
    totalContactos: 0
  });
  const [recentProperties, setRecentProperties] = useState([]);
  const [recentContacts, setRecentContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    try {
      setLoading(true);
      
      // Cargar estadísticas generales
      const statsResponse = await propiedadesApi.getEstadisticas();
      if (statsResponse.success) {
        setStats(statsResponse.stats);
      }

      // Cargar propiedades recientes
      const propertiesResponse = await propiedadesApi.getPropiedades({ limit: 5 });
      if (propertiesResponse.success) {
        setRecentProperties(propertiesResponse.propiedades);
      }

      // Cargar contactos recientes
      const contactsResponse = await propiedadesApi.listarContactos(1, 5);
      if (contactsResponse.success) {
        setRecentContacts(contactsResponse.contactos);
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
            <h1>Panel de Gestor Inmobiliario</h1>
            <p>Bienvenido, {user?.nombre}</p>
          </div>
          <div className="header-actions">
            <Link to="/admin/propiedades" className="btn-primary">
              Gestionar Propiedades
            </Link>
            <Link to="/admin/clientes" className="btn-secondary">
              Gestionar Clientes
            </Link>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="stats-section">
          <h2>Estadísticas del Sistema</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🏠</div>
              <div className="stat-content">
                <h3>Total Propiedades</h3>
                <div className="stat-number">{stats.totalPropiedades}</div>
                <small>En el catálogo</small>
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
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>Clientes</h3>
                <div className="stat-number">{stats.totalUsuarios}</div>
                <small>Registrados</small>
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
            <Link to="/admin/propiedades/nueva" className="action-card">
              <div className="action-icon">➕</div>
              <h3>Nueva Propiedad</h3>
              <p>Agregar una nueva propiedad al catálogo</p>
            </Link>

            <Link to="/admin/clientes/nuevo" className="action-card">
              <div className="action-icon">👤</div>
              <h3>Nuevo Cliente</h3>
              <p>Registrar un nuevo cliente</p>
            </Link>

            <Link to="/admin/contactos" className="action-card">
              <div className="action-icon">📧</div>
              <h3>Ver Contactos</h3>
              <p>Revisar mensajes de contacto</p>
            </Link>

            <Link to="/admin/reportes" className="action-card">
              <div className="action-icon">📊</div>
              <h3>Reportes</h3>
              <p>Generar reportes del sistema</p>
            </Link>
          </div>
        </div>

        {/* Propiedades Recientes */}
        <div className="properties-section">
          <div className="section-header">
            <h2>Propiedades Recientes</h2>
            <Link to="/admin/propiedades" className="btn-secondary">Ver todas</Link>
          </div>
          
          <div className="properties-table">
            <table>
              <thead>
                <tr>
                  <th>Propiedad</th>
                  <th>Propietario</th>
                  <th>Precio</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {recentProperties.map((propiedad) => (
                  <tr key={propiedad.idpropiedades}>
                    <td>
                      <div className="property-info">
                        <h4>{propiedad.titulopropiedad}</h4>
                        <p>{propiedad.comuna}, {propiedad.provincia}</p>
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
                        <Link to={`/detalle/${propiedad.idpropiedades}`} className="btn-small">
                          Ver
                        </Link>
                        <Link to={`/admin/propiedades/editar/${propiedad.idpropiedades}`} className="btn-small">
                          Editar
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Contactos Recientes */}
        <div className="activity-section">
          <div className="section-header">
            <h2>Contactos Recientes</h2>
            <Link to="/admin/contactos" className="btn-secondary">Ver todos</Link>
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

        {/* Acciones de Gestión */}
        <div className="quick-actions-section">
          <h2>Gestión Rápida</h2>
          <div className="quick-actions-grid">
            <Link to="/admin/propiedades/pendientes" className="quick-action-btn">
              <span>⏳</span>
              <span>Propiedades Pendientes</span>
            </Link>
            <Link to="/admin/clientes/activos" className="quick-action-btn">
              <span>👥</span>
              <span>Clientes Activos</span>
            </Link>
            <Link to="/admin/contactos/nuevos" className="quick-action-btn">
              <span>📧</span>
              <span>Contactos Nuevos</span>
            </Link>
            <Link to="/admin/reportes/ventas" className="quick-action-btn">
              <span>💰</span>
              <span>Reporte de Ventas</span>
            </Link>
            <Link to="/admin/configuracion" className="quick-action-btn">
              <span>⚙️</span>
              <span>Configuración</span>
            </Link>
            <Link to="/admin/backup" className="quick-action-btn">
              <span>💾</span>
              <span>Respaldo</span>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DashboardGestor; 