import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFiltro } from '../hooks/useFiltro';
import { propiedadesApi } from '../api/propiedadesApi';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Home = () => {
  const [propiedades, setPropiedades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFiltros, setShowFiltros] = useState(false);
  
  const { user, isAuthenticated } = useAuth();
  const {
    opciones,
    provincias,
    comunas,
    selectedRegion,
    selectedProvincia,
    selectedComuna,
    selectedTipo,
    precioMin,
    precioMax,
    loading: loadingFiltros,
    setSelectedRegion,
    setSelectedProvincia,
    setSelectedComuna,
    setSelectedTipo,
    setPrecioMin,
    setPrecioMax,
    resetFiltros,
    getFiltrosActuales
  } = useFiltro();

  useEffect(() => {
    cargarPropiedades();
  }, []);

  useEffect(() => {
    cargarPropiedades();
  }, [selectedRegion, selectedProvincia, selectedComuna, selectedTipo, precioMin, precioMax]);

  const cargarPropiedades = async () => {
    try {
      setLoading(true);
      const filtros = getFiltrosActuales();
      const response = await propiedadesApi.getPropiedades(filtros);
      
      if (response.success) {
        setPropiedades(response.propiedades);
      } else {
        console.error('Error al cargar propiedades:', response.message);
        setPropiedades([]);
      }
    } catch (error) {
      console.error('Error loading properties:', error);
      setPropiedades([]);
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

  return (
    <div className="home-container">
      <Navbar />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Encuentra tu Propiedad Ideal</h1>
          <p>La mejor plataforma inmobiliaria de Chile</p>
          <div className="hero-buttons">
            <button 
              className="btn-primary"
              onClick={() => setShowFiltros(!showFiltros)}
            >
              {showFiltros ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            </button>
            {isAuthenticated && (
              <Link to="/dashboard" className="btn-secondary">
                Mi Dashboard
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Filtros */}
      {showFiltros && (
        <section className="filtros-section">
          <h3>Filtros de Búsqueda</h3>
          {loadingFiltros ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Cargando filtros...</p>
            </div>
          ) : (
            <>
              <div className="filtros-grid">
                <div className="filtro-group">
                  <label>Región:</label>
                  <select 
                    value={selectedRegion} 
                    onChange={(e) => setSelectedRegion(e.target.value)}
                  >
                    <option value="">Seleccionar región</option>
                    {opciones.regiones.map(region => (
                      <option key={region.idregion} value={region.idregion}>
                        {region.nombre_region}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filtro-group">
                  <label>Provincia:</label>
                  <select 
                    value={selectedProvincia} 
                    onChange={(e) => setSelectedProvincia(e.target.value)}
                    disabled={!selectedRegion}
                  >
                    <option value="">Seleccionar provincia</option>
                    {provincias.map(provincia => (
                      <option key={provincia.idprovincias} value={provincia.idprovincias}>
                        {provincia.nombre_provincia}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filtro-group">
                  <label>Comuna:</label>
                  <select 
                    value={selectedComuna} 
                    onChange={(e) => setSelectedComuna(e.target.value)}
                    disabled={!selectedProvincia}
                  >
                    <option value="">Seleccionar comuna</option>
                    {comunas.map(comuna => (
                      <option key={comuna.idcomunas} value={comuna.idcomunas}>
                        {comuna.nombre_comuna}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filtro-group">
                  <label>Tipo de Propiedad:</label>
                  <select 
                    value={selectedTipo} 
                    onChange={(e) => setSelectedTipo(e.target.value)}
                  >
                    <option value="">Todos los tipos</option>
                    {opciones.tipos_propiedad.map(tipo => (
                      <option key={tipo.idtipo_propiedad} value={tipo.idtipo_propiedad}>
                        {tipo.tipo}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filtro-group">
                  <label>Precio Mínimo:</label>
                  <input 
                    type="number" 
                    placeholder="Precio mínimo"
                    value={precioMin}
                    onChange={(e) => setPrecioMin(e.target.value)}
                  />
                </div>

                <div className="filtro-group">
                  <label>Precio Máximo:</label>
                  <input 
                    type="number" 
                    placeholder="Precio máximo"
                    value={precioMax}
                    onChange={(e) => setPrecioMax(e.target.value)}
                  />
                </div>
              </div>

              <div className="filtros-buttons">
                <button className="btn-primary" onClick={cargarPropiedades}>
                  Aplicar Filtros
                </button>
                <button className="btn-secondary" onClick={resetFiltros}>
                  Limpiar Filtros
                </button>
              </div>
            </>
          )}
        </section>
      )}

      {/* Lista de Propiedades */}
      <section className="propiedades-section">
        <div className="section-header">
          <h3>Propiedades Disponibles</h3>
          <p>{propiedades.length} propiedades encontradas</p>
        </div>
        
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Cargando propiedades...</p>
          </div>
        ) : (
          <div className="propiedades-grid">
            {propiedades.map(propiedad => (
              <div key={propiedad.idpropiedades} className="propiedad-card">
                <div className="propiedad-imagen">
                  {propiedad.imagen_url ? (
                    <img 
                      src={propiedad.imagen_url} 
                      alt={propiedad.titulopropiedad}
                    />
                  ) : (
                    <div className="no-imagen">
                      <i className="icon-property"></i>
                      <span>Sin imagen</span>
                    </div>
                  )}
                  <div className="propiedad-badge">
                    {propiedad.tipo_propiedad}
                  </div>
                </div>
                
                <div className="propiedad-info">
                  <h4>{propiedad.titulopropiedad}</h4>
                  <p className="ubicacion">
                    <i className="icon-location"></i>
                    {propiedad.direccion}
                  </p>
                  <div className="propiedad-details">
                    <span><i className="icon-bed"></i> {propiedad.cant_domitorios} dorm.</span>
                    <span><i className="icon-bath"></i> {propiedad.cant_banos} baños</span>
                    <span><i className="icon-size"></i> {propiedad.area_total}m²</span>
                  </div>
                  <p className="precio">
                    {propiedad.precio_formateado}
                  </p>
                  <p className="descripcion">{propiedad.descripcion}</p>
                  
                  <div className="propiedad-actions">
                    <Link 
                      to={`/descripcion/${propiedad.idpropiedades}`}
                      className="btn-ver"
                    >
                      Ver Detalles
                    </Link>
                    <button className="btn-contacto">
                      Contactar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && propiedades.length === 0 && (
          <div className="no-propiedades">
            <i className="icon-no-results"></i>
            <h4>No se encontraron propiedades</h4>
            <p>Intenta ajustar los filtros de búsqueda</p>
          </div>
        )}
      </section>

      {/* Sección de Servicios */}
      <section className="servicios-section">
        <h3>Nuestros Servicios</h3>
        <div className="servicios-grid">
          <div className="servicio-card">
            <i className="icon-compra"></i>
            <h4>Compra</h4>
            <p>Encuentra la propiedad perfecta para ti</p>
          </div>
          <div className="servicio-card">
            <i className="icon-venta"></i>
            <h4>Venta</h4>
            <p>Vende tu propiedad de manera rápida y segura</p>
          </div>
          <div className="servicio-card">
            <i className="icon-arriendo"></i>
            <h4>Arriendo</h4>
            <p>Alquila o arrienda propiedades</p>
          </div>
          <div className="servicio-card">
            <i className="icon-asesoria"></i>
            <h4>Asesoría</h4>
            <p>Recibe asesoría especializada en bienes raíces</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home; 