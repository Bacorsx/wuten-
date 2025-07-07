import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { propiedadesApi } from '../api/propiedadesApi';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Swal from 'sweetalert2';
import '../styles/detalle.css';
import '../styles/icons.css';

const Detalle = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [propiedad, setPropiedad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    mensaje: ''
  });

  useEffect(() => {
    cargarPropiedad();
  }, [id]);

  const cargarPropiedad = async () => {
    try {
      setLoading(true);
      const response = await propiedadesApi.getDetallePropiedad(id);
      
      if (response.success) {
        setPropiedad(response.propiedad);
      } else {
        console.error('Error al cargar propiedad:', response.message);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.message || 'Error al cargar la propiedad'
        });
      }
    } catch (error) {
      console.error('Error loading property:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cargar la propiedad'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const datosContacto = {
        ...formData,
        id_propiedad: id
      };
      
      const response = await propiedadesApi.enviarContacto(datosContacto);
      
      if (response.success) {
        Swal.fire({
          icon: 'success',
          title: '¡Mensaje enviado!',
          text: response.message || 'Nos pondremos en contacto contigo pronto',
          timer: 3000,
          showConfirmButton: false
        });
        
        setFormData({
          nombre: '',
          email: '',
          telefono: '',
          mensaje: ''
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.message || 'Error al enviar el mensaje'
        });
      }
    } catch (error) {
      console.error('Error al enviar contacto:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al enviar el mensaje'
      });
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
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="detalle-container">
        <Navbar />
        <div className="loading">
          <div className="spinner"></div>
          <p>Cargando detalles de la propiedad...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!propiedad) {
    return (
      <div className="detalle-container">
        <Navbar />
        <div className="error-container">
          <h2>Propiedad no encontrada</h2>
          <p>La propiedad que buscas no existe o ha sido removida.</p>
          <Link to="/" className="btn-primary">Volver al inicio</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="detalle-container">
      <Navbar />

      <div className="detalle-content">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">Inicio</Link>
          <span> / </span>
          <Link to="/">Propiedades</Link>
          <span> / </span>
          <span>{propiedad.titulopropiedad}</span>
        </nav>

        <div className="detalle-grid">
          {/* Columna izquierda - Detalles principales */}
          <div className="detalle-main">
            {/* Header de la propiedad */}
            <div className="detalle-header">
                          <h1>{propiedad.titulopropiedad}</h1>
            <div className="detalle-precio">
              <span className="precio-principal">{formatearPrecio(propiedad.precio_pesos)}</span>
              <span className="precio-uf">({propiedad.precio_uf} UF)</span>
            </div>
              <div className="detalle-estado">
                <span className={`estado ${propiedad.estado == 1 ? 'disponible' : 'vendida'}`}>
                  {propiedad.estado == 1 ? 'Disponible' : 'Vendida'}
                </span>
              </div>
            </div>

            {/* Características principales */}
            <div className="caracteristicas-principales">
              <div className="caracteristica">
                <i className="icon-bed"></i>
                <span>{propiedad.dormitorios} Dormitorios</span>
              </div>
              <div className="caracteristica">
                <i className="icon-bath"></i>
                <span>{propiedad.banos} Baños</span>
              </div>
              <div className="caracteristica">
                <i className="icon-size"></i>
                <span>{propiedad.metros_cuadrados}m²</span>
              </div>
              <div className="caracteristica">
                <i className="icon-location"></i>
                <span>{propiedad.comuna}, {propiedad.provincia}</span>
              </div>
            </div>

            {/* Galería de imágenes */}
            {propiedad.imagenes && propiedad.imagenes.length > 0 && (
              <div className="seccion-galeria">
                <h3>Galería de Imágenes</h3>
                <div className="galeria-grid">
                  {propiedad.imagenes.map((imagen, index) => (
                    <div key={imagen.idgaleria || index} className="imagen-item">
                      <img 
                        src={imagen.url} 
                        alt={`${propiedad.titulopropiedad} - Imagen ${index + 1}`}
                        className={imagen.principal ? 'imagen-principal' : 'imagen-secundaria'}
                        onError={(e) => {
                          e.target.src = '/img/propiedades/sin_imagen.jpg';
                        }}
                      />
                      {imagen.principal && (
                        <div className="badge-principal">Principal</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Descripción */}
            <div className="seccion-descripcion">
              <h3>Descripción</h3>
              <p>{propiedad.descripcion}</p>
            </div>

            {/* Características detalladas */}
            {propiedad.caracteristicas && propiedad.caracteristicas.length > 0 && (
              <div className="seccion-descripcion">
                <h3>Características</h3>
                <ul className="lista-caracteristicas">
                  {propiedad.caracteristicas.map((caracteristica, index) => (
                    <li key={index}>
                      <i className="icon-check"></i>
                      {caracteristica}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Información adicional */}
            <div className="seccion-descripcion">
              <h3>Información Adicional</h3>
              <div className="info-adicional">
                <div className="info-item">
                  <strong>Dirección:</strong> {propiedad.direccion}
                </div>
                <div className="info-item">
                  <strong>Fecha de publicación:</strong> {formatearFecha(propiedad.fecha_publicacion)}
                </div>
                <div className="info-item">
                  <strong>Gastos comunes:</strong> {formatearPrecio(propiedad.gastos_comunes)}
                </div>
                <div className="info-item">
                  <strong>Contribuciones:</strong> {formatearPrecio(propiedad.contribuciones)}
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha - Formulario de contacto */}
          <div className="detalle-sidebar">
            <div className="formulario-contacto">
              <h3>Contactar Propietario</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="nombre">Nombre completo</label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    placeholder="Tu nombre completo"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Correo electrónico</label>
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
                  <label htmlFor="telefono">Teléfono</label>
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
                  <label htmlFor="mensaje">Mensaje</label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    value={formData.mensaje}
                    onChange={handleChange}
                    required
                    placeholder="Escribe tu mensaje aquí..."
                    rows="4"
                  ></textarea>
                </div>

                <button type="submit" className="btn-enviar">
                  Enviar Mensaje
                </button>
              </form>
            </div>

            {/* Información del propietario */}
            <div className="propietario-details">
              <h3>Información del Propietario</h3>
              <div className="propietario-item">
                <strong>Nombre:</strong> {propiedad.propietario.nombre}
              </div>
              <div className="propietario-item">
                <strong>Email:</strong> 
                <a href={`mailto:${propiedad.propietario.email}`}>
                  {propiedad.propietario.email}
                </a>
              </div>
              <div className="propietario-item">
                <strong>Teléfono:</strong> 
                <a href={`tel:${propiedad.propietario.telefono}`}>
                  {propiedad.propietario.telefono}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Detalle; 