import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { propiedadesApi } from '../api/propiedadesApi';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Swal from 'sweetalert2';
import '../styles/descripcion.css';
import '../styles/icons.css';

const Descripcion = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [propiedad, setPropiedad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imagenPrincipal, setImagenPrincipal] = useState(0);
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
      <div className="descripcion-container">
        <Navbar />
        <div className="loading">
          <div className="spinner"></div>
          <p>Cargando propiedad...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!propiedad) {
    return (
      <div className="descripcion-container">
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
    <div className="descripcion-container">
      <Navbar />

      <div className="descripcion-content">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">Inicio</Link>
          <span> / </span>
          <Link to="/">Propiedades</Link>
          <span> / </span>
          <span>{propiedad.titulopropiedad}</span>
        </nav>

        <div className="descripcion-grid">
          {/* Columna izquierda - Imágenes y detalles */}
          <div className="descripcion-main">
            {/* Galería de imágenes */}
            <div className="galeria">
              <div className="imagen-principal">
                {propiedad.imagenes && propiedad.imagenes[imagenPrincipal] ? (
                  <img 
                    src={propiedad.imagenes[imagenPrincipal].url} 
                    alt={propiedad.titulopropiedad}
                    onError={(e) => {
                      e.target.src = '/img/propiedades/sin_imagen.jpg';
                    }}
                  />
                ) : (
                  <div className="no-imagen">
                    <i className="icon-property"></i>
                    <span>Sin imagen</span>
                  </div>
                )}
              </div>
              
              {propiedad.imagenes && propiedad.imagenes.length > 1 && (
                <div className="imagenes-miniaturas">
                  {propiedad.imagenes.map((imagen, index) => (
                    <div 
                      key={imagen.idgaleria || index}
                      className={`miniatura ${index === imagenPrincipal ? 'activa' : ''}`}
                      onClick={() => setImagenPrincipal(index)}
                    >
                      <img 
                        src={imagen.url} 
                        alt={`${propiedad.titulopropiedad} ${index + 1}`}
                        onError={(e) => {
                          e.target.src = '/img/propiedades/sin_imagen.jpg';
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Información principal */}
            <div className="info-principal">
              <div className="header-info">
                <h1>{propiedad.titulopropiedad}</h1>
                <div className="precio-principal">
                  {formatearPrecio(propiedad.precio_pesos)}
                </div>
              </div>

              <div className="ubicacion-info">
                <i className="icon-location"></i>
                <span>{propiedad.direccion}</span>
              </div>

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
                  <span>{propiedad.metros_cuadrados} m²</span>
                </div>
                <div className="caracteristica">
                  <i className="icon-property"></i>
                  <span>{propiedad.tipo_propiedad}</span>
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div className="seccion-descripcion">
              <h3>Descripción</h3>
              <p>{propiedad.descripcion}</p>
            </div>

            {/* Características */}
            {propiedad.caracteristicas && propiedad.caracteristicas.length > 0 && (
              <div className="seccion-caracteristicas">
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
            <div className="seccion-adicional">
              <h3>Información Adicional</h3>
              <div className="info-adicional">
                <div className="info-item">
                  <strong>Estado:</strong>
                  <span className={`estado ${propiedad.estado == 1 ? 'disponible' : 'vendida'}`}>
                    {propiedad.estado == 1 ? 'Disponible' : 'Vendida'}
                  </span>
                </div>
                <div className="info-item">
                  <strong>Fecha de publicación:</strong>
                  <span>{formatearFecha(propiedad.fecha_publicacion)}</span>
                </div>
                <div className="info-item">
                  <strong>Gastos comunes:</strong>
                  <span>{formatearPrecio(propiedad.gastos_comunes)}</span>
                </div>
                <div className="info-item">
                  <strong>Contribuciones:</strong>
                  <span>{formatearPrecio(propiedad.contribuciones)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha - Formulario de contacto */}
          <div className="descripcion-sidebar">
            <div className="formulario-contacto">
              <h3>Contactar Propietario</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="nombre">Nombre completo *</label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
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
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="mensaje">Mensaje *</label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    value={formData.mensaje}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Escribe tu mensaje aquí..."
                    required
                  ></textarea>
                </div>

                <button type="submit" className="btn-enviar">
                  Enviar Mensaje
                </button>
              </form>
            </div>

            {/* Información del propietario */}
            <div className="info-propietario">
              <h3>Información del Propietario</h3>
              <div className="propietario-details">
                <div className="propietario-item">
                  <strong>Nombre:</strong>
                  <span>{propiedad.propietario.nombre}</span>
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
      </div>

      <Footer />
    </div>
  );
};

export default Descripcion; 