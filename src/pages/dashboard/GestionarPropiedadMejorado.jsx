import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { propiedadesApi } from '../../api/propiedadesApi';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Swal from 'sweetalert2';

const GestionarPropiedadMejorado = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [propiedad, setPropiedad] = useState(null);
  const [opciones, setOpciones] = useState({});
  const [errors, setErrors] = useState({});
  const [imagenes, setImagenes] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    cargarPropiedad();
    cargarOpciones();
  }, [id]);

  const cargarPropiedad = async () => {
    try {
      const response = await propiedadesApi.obtenerPropiedad(id);
      if (response.success) {
        const propiedadData = response.propiedad;
        
        // Verificar que el usuario logueado sea el propietario de la propiedad
        if (user?.tipoUsuario === 'propietario' && propiedadData.idusuario != user?.id) {
          setAccessDenied(true);
          setLoading(false);
          return;
        }
        
        setPropiedad(propiedadData);
        // Las imágenes vienen con el formato correcto de la tabla galeria
        setImagenes(propiedadData.imagenes || []);
        
        // Cargar ubicación
        if (propiedadData.idsectores) {
          await cargarUbicacion(propiedadData.idsectores);
        }
      }
    } catch (error) {
      console.error('Error al cargar propiedad:', error);
      Swal.fire('Error', 'Error al cargar la propiedad', 'error');
    } finally {
      setLoading(false);
    }
  };

  const cargarOpciones = async () => {
    try {
      const data = await propiedadesApi.getOpcionesFiltros();
      setOpciones(data);
      
      // Cargar regiones
      const regiones = await propiedadesApi.getRegiones();
      setOpciones(prev => ({ ...prev, regiones }));
    } catch (error) {
      console.error('Error al cargar opciones:', error);
    }
  };

  const cargarUbicacion = async (idSector) => {
    try {
      // Primero necesitamos obtener la información del sector desde la base de datos
      // Para esto, vamos a usar una consulta directa o modificar la API
      
      // Por ahora, vamos a cargar la ubicación de forma manual
      // Esto requiere que modifiquemos la API para obtener la ubicación completa
      
      // Cargar regiones primero
      const regiones = await propiedadesApi.getRegiones();
      setOpciones(prev => ({ ...prev, regiones }));
      
      // Como no tenemos una función para obtener la ubicación completa,
      // vamos a usar los datos que ya tenemos de la propiedad
      if (propiedad) {
        // Usar los datos de la propiedad para cargar la ubicación
        const ubicacionActual = {
          idRegion: propiedad.idregion,
          idProvincia: propiedad.idprovincias,
          idComuna: propiedad.idcomunas,
          idSector: propiedad.idsectores
        };
        
        // Cargar provincias de la región
        if (ubicacionActual.idRegion) {
          const provincias = await propiedadesApi.getProvincias(ubicacionActual.idRegion);
          setOpciones(prev => ({ ...prev, provincias }));
        }
        
        // Cargar comunas de la provincia
        if (ubicacionActual.idProvincia) {
          const comunas = await propiedadesApi.getComunas(ubicacionActual.idProvincia);
          setOpciones(prev => ({ ...prev, comunas }));
        }
        
        // Cargar sectores de la comuna
        if (ubicacionActual.idComuna) {
          const sectores = await propiedadesApi.getSectores(ubicacionActual.idComuna);
          setOpciones(prev => ({ 
            ...prev, 
            sectores,
            ubicacionActual 
          }));
        }
      }
    } catch (error) {
      console.error('Error al cargar ubicación:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPropiedad(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleUbicacionChange = async (e) => {
    const { name, value } = e.target;
    
    try {
      if (name === 'idRegion') {
        setOpciones(prev => ({ 
          ...prev, 
          provincias: [], 
          comunas: [], 
          sectores: [],
          ubicacionActual: {
            ...prev.ubicacionActual,
            idRegion: value,
            idProvincia: '',
            idComuna: '',
            idSector: ''
          }
        }));
        
        if (value) {
          const provincias = await propiedadesApi.getProvincias(value);
          setOpciones(prev => ({ ...prev, provincias }));
        }
      } else if (name === 'idProvincia') {
        setOpciones(prev => ({ 
          ...prev, 
          comunas: [], 
          sectores: [],
          ubicacionActual: {
            ...prev.ubicacionActual,
            idProvincia: value,
            idComuna: '',
            idSector: ''
          }
        }));
        
        if (value) {
          const comunas = await propiedadesApi.getComunas(value);
          setOpciones(prev => ({ ...prev, comunas }));
        }
      } else if (name === 'idComuna') {
        setOpciones(prev => ({ 
          ...prev, 
          sectores: [],
          ubicacionActual: {
            ...prev.ubicacionActual,
            idComuna: value,
            idSector: ''
          }
        }));
        
        if (value) {
          const sectores = await propiedadesApi.getSectores(value);
          setOpciones(prev => ({ ...prev, sectores }));
        }
      } else if (name === 'idSector') {
        setOpciones(prev => ({
          ...prev,
          ubicacionActual: {
            ...prev.ubicacionActual,
            idSector: value
          }
        }));
        setPropiedad(prev => ({ ...prev, idsectores: value }));
      }
    } catch (error) {
      console.error('Error al cargar ubicación:', error);
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!propiedad.titulopropiedad?.trim()) {
      nuevosErrores.titulopropiedad = 'El título es requerido';
    }

    if (!propiedad.descripcion?.trim()) {
      nuevosErrores.descripcion = 'La descripción es requerida';
    }

    if (!propiedad.precio_pesos || propiedad.precio_pesos <= 0) {
      nuevosErrores.precio_pesos = 'El precio es requerido y debe ser mayor a 0';
    }

    if (!propiedad.idtipo_propiedad) {
      nuevosErrores.idtipo_propiedad = 'El tipo de propiedad es requerido';
    }

    if (!propiedad.idsectores) {
      nuevosErrores.idsectores = 'La ubicación es requerida';
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
        ...propiedad,
        precio_pesos: parseInt(propiedad.precio_pesos),
        precio_uf: propiedad.precio_uf ? parseFloat(propiedad.precio_uf) : 0,
        cant_banos: parseInt(propiedad.cant_banos),
        cant_domitorios: parseInt(propiedad.cant_domitorios),
        area_total: propiedad.area_total ? parseInt(propiedad.area_total) : 0,
        area_construida: propiedad.area_construida ? parseInt(propiedad.area_construida) : 0
      };

      await propiedadesApi.actualizarPropiedad(id, datosActualizados);
      Swal.fire('Éxito', 'Propiedad actualizada exitosamente', 'success');
      setEditMode(false);
      await cargarPropiedad(); // Recargar datos
    } catch (error) {
      console.error('Error al actualizar propiedad:', error);
      Swal.fire('Error', 'Error al actualizar la propiedad: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCambiarEstado = async () => {
    const nuevoEstado = propiedad.estado === 'Disponible' ? 'No disponible' : 'Disponible';
    const result = await Swal.fire({
      title: `¿${nuevoEstado === 'Disponible' ? 'Publicar' : 'Ocultar'} propiedad?`,
      text: `¿Deseas ${nuevoEstado === 'Disponible' ? 'publicar' : 'ocultar'} esta propiedad?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const response = await propiedadesApi.cambiarEstadoPropiedad(id, nuevoEstado === 'Disponible');
        if (response.success) {
          setPropiedad(prev => ({ ...prev, estado: nuevoEstado }));
          Swal.fire('Actualizado', response.message, 'success');
        } else {
          Swal.fire('Error', response.message || 'Error al cambiar estado', 'error');
        }
      } catch (error) {
        console.error('Error al cambiar estado:', error);
        Swal.fire('Error', 'Error al cambiar el estado de la propiedad', 'error');
      }
    }
  };

  const handleEliminar = async () => {
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
        await propiedadesApi.eliminarPropiedad(id);
        Swal.fire('Eliminada', 'Propiedad eliminada exitosamente', 'success');
        navigate('/dashboard/admin/propiedades');
      } catch (error) {
        console.error('Error al eliminar propiedad:', error);
        Swal.fire('Error', 'Error al eliminar la propiedad: ' + error.message, 'error');
      }
    }
  };

  const handleSubirImagen = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/gif'];
    if (!tiposPermitidos.includes(file.type)) {
      Swal.fire('Error', 'Tipo de archivo no permitido. Solo JPG, PNG y GIF', 'error');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire('Error', 'El archivo es demasiado grande. Máximo 5MB', 'error');
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('imagen', file);
      formData.append('action', 'subir_imagen');
      formData.append('id_propiedad', id);

      const response = await propiedadesApi.subirImagenPropiedad(id, formData);
      if (response.success) {
        await cargarPropiedad(); // Recargar imágenes
        Swal.fire('Éxito', 'Imagen subida exitosamente', 'success');
      } else {
        Swal.fire('Error', response.message || 'Error al subir imagen', 'error');
      }
    } catch (error) {
      console.error('Error al subir imagen:', error);
      Swal.fire('Error', 'Error al subir la imagen', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleEliminarImagen = async (idImagen) => {
    const result = await Swal.fire({
      title: '¿Eliminar imagen?',
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
        const response = await propiedadesApi.eliminarImagenPropiedad(idImagen);
        if (response.success) {
          await cargarPropiedad(); // Recargar imágenes
          Swal.fire('Eliminada', 'Imagen eliminada exitosamente', 'success');
        } else {
          Swal.fire('Error', response.message || 'Error al eliminar imagen', 'error');
        }
      } catch (error) {
        console.error('Error al eliminar imagen:', error);
        Swal.fire('Error', 'Error al eliminar la imagen', 'error');
      }
    }
  };

  const handleCambiarImagenPrincipal = async (idImagen) => {
    try {
      const response = await propiedadesApi.cambiarImagenPrincipal(idImagen, id);
      if (response.success) {
        await cargarPropiedad(); // Recargar imágenes
        Swal.fire('Éxito', 'Imagen principal cambiada exitosamente', 'success');
      } else {
        Swal.fire('Error', response.message || 'Error al cambiar imagen principal', 'error');
      }
    } catch (error) {
      console.error('Error al cambiar imagen principal:', error);
      Swal.fire('Error', 'Error al cambiar la imagen principal', 'error');
    }
  };

  const handleOcultarImagen = async (idImagen) => {
    try {
      const response = await propiedadesApi.ocultarImagen(idImagen);
      if (response.success) {
        await cargarPropiedad(); // Recargar imágenes
        Swal.fire('Éxito', 'Imagen oculta exitosamente', 'success');
      } else {
        Swal.fire('Error', response.message || 'Error al ocultar imagen', 'error');
      }
    } catch (error) {
      console.error('Error al ocultar imagen:', error);
      Swal.fire('Error', 'Error al ocultar la imagen', 'error');
    }
  };

  const handleMostrarImagen = async (idImagen) => {
    try {
      const response = await propiedadesApi.mostrarImagen(idImagen);
      if (response.success) {
        await cargarPropiedad(); // Recargar imágenes
        Swal.fire('Éxito', 'Imagen mostrada exitosamente', 'success');
      } else {
        Swal.fire('Error', response.message || 'Error al mostrar imagen', 'error');
      }
    } catch (error) {
      console.error('Error al mostrar imagen:', error);
      Swal.fire('Error', 'Error al mostrar la imagen', 'error');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Navbar />
        <div className="dashboard-content">
          <div className="loading">
            <div className="spinner"></div>
            <p>Cargando propiedad...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!propiedad) {
    return (
      <div className="dashboard-container">
        <Navbar />
        <div className="dashboard-content">
          <div className="error-message">
            <h4>Propiedad no encontrada</h4>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/dashboard/admin/propiedades')}
            >
              Volver a Propiedades
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="dashboard-container">
        <Navbar />
        <div className="dashboard-content">
          <div className="error-message">
            <h4>Acceso Denegado</h4>
            <p>No tienes permisos para editar esta propiedad.</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/dashboard/propietario')}
            >
              Volver al Dashboard
            </button>
          </div>
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
            <h1>{editMode ? 'Editar Propiedad' : 'Gestionar Propiedad'}</h1>
            <p>{propiedad.titulopropiedad}</p>
          </div>
          <div className="header-actions">
            {!editMode && (
              <>
                <button
                  className="btn-primary"
                  onClick={() => setEditMode(true)}
                >
                  Editar
                </button>
                <button
                  className={`btn ${propiedad.estado === 'Disponible' ? 'btn-warning' : 'btn-success'}`}
                  onClick={handleCambiarEstado}
                >
                  {propiedad.estado === 'Disponible' ? 'Ocultar' : 'Publicar'}
                </button>
                <button
                  className="btn-danger"
                  onClick={handleEliminar}
                >
                  Eliminar
                </button>
              </>
            )}
            <button
              className="btn-secondary"
              onClick={() => navigate('/dashboard/admin/propiedades')}
            >
              Volver
            </button>
          </div>
        </div>

        <div className="property-management-content">
          {editMode ? (
            <form onSubmit={handleSubmit} className="property-form">
              {/* Información Básica */}
              <div className="form-section">
                <h3>Información Básica</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Título de la Propiedad *</label>
                    <input
                      type="text"
                      name="titulopropiedad"
                      value={propiedad.titulopropiedad || ''}
                      onChange={handleInputChange}
                      className={errors.titulopropiedad ? 'error' : ''}
                    />
                    {errors.titulopropiedad && <span className="error-text">{errors.titulopropiedad}</span>}
                  </div>

                  <div className="form-group">
                    <label>Tipo de Propiedad *</label>
                    <select
                      name="idtipo_propiedad"
                      value={propiedad.idtipo_propiedad || ''}
                      onChange={handleInputChange}
                      className={errors.idtipo_propiedad ? 'error' : ''}
                    >
                      <option value="">Seleccionar tipo</option>
                      {opciones.tipos_propiedad?.map(tipo => (
                        <option key={tipo.idtipo_propiedad} value={tipo.idtipo_propiedad}>
                          {tipo.tipo}
                        </option>
                      ))}
                    </select>
                    {errors.idtipo_propiedad && <span className="error-text">{errors.idtipo_propiedad}</span>}
                  </div>

                  <div className="form-group full-width">
                    <label>Descripción *</label>
                    <textarea
                      name="descripcion"
                      value={propiedad.descripcion || ''}
                      onChange={handleInputChange}
                      rows="4"
                      className={errors.descripcion ? 'error' : ''}
                    />
                    {errors.descripcion && <span className="error-text">{errors.descripcion}</span>}
                  </div>
                </div>
              </div>

              {/* Ubicación */}
              <div className="form-section">
                <h3>Ubicación</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Región *</label>
                    <select
                      value={opciones.ubicacionActual?.idRegion || ''}
                      onChange={(e) => handleUbicacionChange('region', e.target.value)}
                      className={errors.idsectores ? 'error' : ''}
                    >
                      <option value="">Seleccionar región</option>
                      {opciones.regiones?.map(region => (
                        <option key={region.idregiones} value={region.idregiones}>
                          {region.nombre_region}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Provincia *</label>
                    <select
                      value={opciones.ubicacionActual?.idProvincia || ''}
                      onChange={(e) => handleUbicacionChange('provincia', e.target.value)}
                      disabled={!opciones.ubicacionActual?.idRegion}
                      className={errors.idsectores ? 'error' : ''}
                    >
                      <option value="">Seleccionar provincia</option>
                      {opciones.provincias?.map(provincia => (
                        <option key={provincia.idprovincias} value={provincia.idprovincias}>
                          {provincia.nombre_provincia}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Comuna *</label>
                    <select
                      value={opciones.ubicacionActual?.idComuna || ''}
                      onChange={(e) => handleUbicacionChange('comuna', e.target.value)}
                      disabled={!opciones.ubicacionActual?.idProvincia}
                      className={errors.idsectores ? 'error' : ''}
                    >
                      <option value="">Seleccionar comuna</option>
                      {opciones.comunas?.map(comuna => (
                        <option key={comuna.idcomunas} value={comuna.idcomunas}>
                          {comuna.nombre_comuna}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Sector *</label>
                    <select
                      value={opciones.ubicacionActual?.idSector || ''}
                      onChange={(e) => handleUbicacionChange('sector', e.target.value)}
                      disabled={!opciones.ubicacionActual?.idComuna}
                      className={errors.idsectores ? 'error' : ''}
                    >
                      <option value="">Seleccionar sector</option>
                      {opciones.sectores?.map(sector => (
                        <option key={sector.idsectores} value={sector.idsectores}>
                          {sector.nombre_sector}
                        </option>
                      ))}
                    </select>
                    {errors.idsectores && <span className="error-text">{errors.idsectores}</span>}
                  </div>
                </div>
              </div>

              {/* Precios */}
              <div className="form-section">
                <h3>Precios</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Precio en Pesos *</label>
                    <input
                      type="number"
                      name="precio_pesos"
                      value={propiedad.precio_pesos || ''}
                      onChange={handleInputChange}
                      min="0"
                      className={errors.precio_pesos ? 'error' : ''}
                    />
                    {errors.precio_pesos && <span className="error-text">{errors.precio_pesos}</span>}
                  </div>

                  <div className="form-group">
                    <label>Precio en UF</label>
                    <input
                      type="number"
                      name="precio_uf"
                      value={propiedad.precio_uf || ''}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              {/* Características */}
              <div className="form-section">
                <h3>Características</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Dormitorios</label>
                    <input
                      type="number"
                      name="cant_domitorios"
                      value={propiedad.cant_domitorios || 0}
                      onChange={handleInputChange}
                      min="0"
                    />
                  </div>

                  <div className="form-group">
                    <label>Baños</label>
                    <input
                      type="number"
                      name="cant_banos"
                      value={propiedad.cant_banos || 0}
                      onChange={handleInputChange}
                      min="0"
                    />
                  </div>

                  <div className="form-group">
                    <label>Área Total (m²)</label>
                    <input
                      type="number"
                      name="area_total"
                      value={propiedad.area_total || ''}
                      onChange={handleInputChange}
                      min="0"
                    />
                  </div>

                  <div className="form-group">
                    <label>Área Construida (m²)</label>
                    <input
                      type="number"
                      name="area_construida"
                      value={propiedad.area_construida || ''}
                      onChange={handleInputChange}
                      min="0"
                    />
                  </div>
                </div>

                {/* Características booleanas */}
                <div className="form-grid">
                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        name="bodega"
                        checked={propiedad.bodega || false}
                        onChange={handleInputChange}
                      />
                      Bodega
                    </label>
                  </div>

                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        name="estacionamiento"
                        checked={propiedad.estacionamiento || false}
                        onChange={handleInputChange}
                      />
                      Estacionamiento
                    </label>
                  </div>

                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        name="logia"
                        checked={propiedad.logia || false}
                        onChange={handleInputChange}
                      />
                      Logia
                    </label>
                  </div>

                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        name="cocinaamoblada"
                        checked={propiedad.cocinaamoblada || false}
                        onChange={handleInputChange}
                      />
                      Cocina Amoblada
                    </label>
                  </div>

                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        name="antejardin"
                        checked={propiedad.antejardin || false}
                        onChange={handleInputChange}
                      />
                      Antejardín
                    </label>
                  </div>

                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        name="piscina"
                        checked={propiedad.piscina || false}
                        onChange={handleInputChange}
                      />
                      Piscina
                    </label>
                  </div>
                </div>
              </div>

              {/* Estado */}
              <div className="form-section">
                <h3>Estado</h3>
                <div className="form-group">
                  <label>Estado de la Propiedad</label>
                  <select
                    name="estado"
                    value={propiedad.estado ? 'Disponible' : 'No disponible'}
                    onChange={handleInputChange}
                  >
                    <option value="Disponible">Disponible</option>
                    <option value="No disponible">No disponible</option>
                  </select>
                </div>
              </div>

              {/* Botones */}
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditMode(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          ) : (
            <div className="property-view">
              {/* Vista de solo lectura */}
              <div className="property-info">
                <div className="property-header">
                  <div className="property-title">
                    <h2>{propiedad.titulopropiedad}</h2>
                    <p className="property-location">
                      {propiedad.nombre_comuna}, {propiedad.nombre_provincia}, {propiedad.nombre_region}
                    </p>
                  </div>
                  <div className="property-price">
                    <h3>${propiedad.precio_pesos?.toLocaleString()}</h3>
                    {propiedad.precio_uf && (
                      <p>{propiedad.precio_uf} UF</p>
                    )}
                  </div>
                </div>

                <div className="property-description">
                  <h4>Descripción</h4>
                  <p>{propiedad.descripcion}</p>
                </div>

                <div className="property-details">
                  <div className="details-section">
                    <h4>Características</h4>
                    <ul>
                      <li><strong>Tipo:</strong> {propiedad.tipo_propiedad}</li>
                      <li><strong>Dormitorios:</strong> {propiedad.cant_domitorios}</li>
                      <li><strong>Baños:</strong> {propiedad.cant_banos}</li>
                      {propiedad.area_construida && (
                        <li><strong>Área construida:</strong> {propiedad.area_construida} m²</li>
                      )}
                      {propiedad.area_total && (
                        <li><strong>Área total:</strong> {propiedad.area_total} m²</li>
                      )}
                    </ul>
                  </div>

                  <div className="details-section">
                    <h4>Servicios</h4>
                    <ul>
                      {propiedad.bodega && <li>Bodega</li>}
                      {propiedad.estacionamiento && <li>Estacionamiento</li>}
                      {propiedad.logia && <li>Logia</li>}
                      {propiedad.cocinaamoblada && <li>Cocina Amoblada</li>}
                      {propiedad.antejardin && <li>Antejardín</li>}
                      {propiedad.piscina && <li>Piscina</li>}
                    </ul>
                  </div>

                  <div className="details-section">
                    <h4>Información Adicional</h4>
                    <ul>
                      <li><strong>Estado:</strong> 
                        <span className={`status ${propiedad.estado ? 'disponible' : 'no-disponible'}`}>
                          {propiedad.estado ? 'Disponible' : 'No disponible'}
                        </span>
                      </li>
                      <li><strong>Propietario:</strong> {propiedad.propietario_nombre}</li>
                      <li><strong>Publicada:</strong> {new Date(propiedad.fecha_publicacion).toLocaleDateString()}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Gestión de Imágenes */}
          <div className="images-section">
            <h3>Gestión de Imágenes</h3>
            
            <div className="upload-section">
              <input
                type="file"
                accept="image/*"
                onChange={handleSubirImagen}
                disabled={uploadingImage}
                id="image-upload"
                style={{ display: 'none' }}
              />
              <label htmlFor="image-upload" className="upload-button">
                {uploadingImage ? 'Subiendo...' : 'Subir Nueva Imagen'}
              </label>
            </div>

            <div className="images-grid">
              {imagenes.map((imagen, index) => (
                <div key={imagen.id} className={`image-item ${imagen.es_principal ? 'principal' : ''} ${imagen.estado === 0 ? 'oculta' : ''}`}>
                  <img 
                    src={`/img/propiedades/${imagen.nombre_archivo}`} 
                    alt={`Imagen ${index + 1}`}
                    onError={(e) => {
                      e.target.src = '/img/propiedades/sin_imagen.jpg';
                    }}
                  />
                  <div className="image-overlay">
                    {imagen.es_principal && <span className="badge principal">Principal</span>}
                    {imagen.estado === 0 && <span className="badge oculta">Oculta</span>}
                    <div className="image-actions">
                      {!imagen.es_principal && (
                        <button
                          className="btn-small btn-primary"
                          onClick={() => handleCambiarImagenPrincipal(imagen.id)}
                          title="Hacer principal"
                        >
                          Principal
                        </button>
                      )}
                      {imagen.estado === 1 ? (
                        <button
                          className="btn-small btn-warning"
                          onClick={() => handleOcultarImagen(imagen.id)}
                          title="Ocultar imagen"
                        >
                          Ocultar
                        </button>
                      ) : (
                        <button
                          className="btn-small btn-success"
                          onClick={() => handleMostrarImagen(imagen.id)}
                          title="Mostrar imagen"
                        >
                          Mostrar
                        </button>
                      )}
                      <button
                        className="btn-small btn-danger"
                        onClick={() => handleEliminarImagen(imagen.id)}
                        title="Eliminar"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {imagenes.length === 0 && (
              <div className="no-images">
                <p>No hay imágenes para esta propiedad</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default GestionarPropiedadMejorado; 