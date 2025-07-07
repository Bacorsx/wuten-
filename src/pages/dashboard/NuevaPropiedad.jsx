import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { propiedadesApi } from '../../api/propiedadesApi';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import { config } from '../../config/config';

// Estilos CSS para validación visual
const styles = {
  requiredField: {
    color: '#dc3545',
    fontWeight: 'bold'
  },
  errorField: {
    borderColor: '#dc3545',
    boxShadow: '0 0 0 0.2rem rgba(220, 53, 69, 0.25)'
  },
  successField: {
    borderColor: '#198754',
    boxShadow: '0 0 0 0.2rem rgba(25, 135, 84, 0.25)'
  }
};

const NuevaPropiedad = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [opciones, setOpciones] = useState({});
  const [formData, setFormData] = useState({
    titulopropiedad: '',
    descripcion: '',
    precio_pesos: '',
    precio_uf: '',
    cant_banos: 0,
    cant_domitorios: 0,
    area_total: '',
    area_construida: '',
    estado_propiedad: 1, // 1 = Disponible, 0 = No publicar
    idtipo_propiedad: '',
    idusuario: user?.id || '',
    // Características
    bodega: false,
    estacionamiento: false,
    logia: false,
    cocinaamoblada: false,
    antejardin: false,
    patiotrasero: false,
    piscina: false
  });
  const [imagenes, setImagenes] = useState([]);
  const [imagenesSubidas, setImagenesSubidas] = useState([]);
  const [ubicacion, setUbicacion] = useState({
    idRegion: '',
    idProvincia: '',
    idComuna: '',
    idSector: ''
  });
  const [errors, setErrors] = useState({});

  // Redirección automática si no hay usuario
  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: 'dashboard', message: 'Debes iniciar sesión para acceder al dashboard de propietario.' } });
    }
  }, [user, navigate]);

  // Actualizar idusuario cuando el usuario esté disponible
  useEffect(() => {
    if (user && user.id) {
      setFormData(prev => ({
        ...prev,
        idusuario: user.id
      }));
      console.log('Usuario detectado:', user);
    }
  }, [user]);

  // Debug: mostrar estado del usuario
  useEffect(() => {
    console.log('Estado actual del usuario:', user);
    console.log('Estado actual de formData:', formData);
  }, [user, formData]);

  // Calcular progreso del formulario
  const calcularProgreso = () => {
    const camposRequeridos = [
      formData.titulopropiedad.trim(),
      formData.descripcion.trim(),
      formData.precio_pesos > 0,
      formData.idtipo_propiedad,
      ubicacion.idRegion,
      ubicacion.idProvincia,
      ubicacion.idComuna,
      ubicacion.idSector
    ];
    
    const camposCompletados = camposRequeridos.filter(Boolean).length;
    return Math.round((camposCompletados / camposRequeridos.length) * 100);
  };

  useEffect(() => {
    cargarOpciones();
  }, []);



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



  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Manejar valores numéricos para el estado
    let finalValue = value;
    if (name === 'estado_propiedad') {
      finalValue = parseInt(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : finalValue
    }));
    
    // Validación en tiempo real
    if (errors[name]) {
      let isValid = true;
      
      // Validar según el tipo de campo
      if (name === 'titulopropiedad' && !value.trim()) {
        isValid = false;
      } else if (name === 'descripcion' && !value.trim()) {
        isValid = false;
      } else if (name === 'precio_pesos' && (!value || value <= 0)) {
        isValid = false;
      } else if (name === 'idtipo_propiedad' && !value) {
        isValid = false;
      }
      
      if (isValid) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };

  const handleUbicacionChange = async (e) => {
    const { name, value } = e.target;
    setUbicacion(prev => ({ ...prev, [name]: value }));
    
    // Limpiar errores de ubicación cuando se selecciona un valor
    if (name === 'idRegion' && errors.region) {
      setErrors(prev => ({ ...prev, region: '' }));
    } else if (name === 'idProvincia' && errors.provincia) {
      setErrors(prev => ({ ...prev, provincia: '' }));
    } else if (name === 'idComuna' && errors.comuna) {
      setErrors(prev => ({ ...prev, comunas: '' }));
    } else if (name === 'idSector' && errors.sector) {
      setErrors(prev => ({ ...prev, sector: '' }));
    }
    
    // Resetear campos dependientes
    if (name === 'idRegion') {
      setUbicacion(prev => ({ ...prev, idProvincia: '', idComuna: '', idSector: '' }));
      setOpciones(prev => ({ ...prev, provincias: [], comunas: [], sectores: [] }));
      
      // Cargar provincias si se seleccionó una región
      if (value) {
        try {
          const provincias = await propiedadesApi.getProvincias(value);
          setOpciones(prev => ({ ...prev, provincias }));
        } catch (error) {
          console.error('Error al cargar provincias:', error);
        }
      }
    } else if (name === 'idProvincia') {
      setUbicacion(prev => ({ ...prev, idComuna: '', idSector: '' }));
      setOpciones(prev => ({ ...prev, comunas: [], sectores: [] }));
      
      // Cargar comunas si se seleccionó una provincia
      if (value) {
        try {
          const comunas = await propiedadesApi.getComunas(value);
          setOpciones(prev => ({ ...prev, comunas }));
        } catch (error) {
          console.error('Error al cargar comunas:', error);
        }
      }
    } else if (name === 'idComuna') {
      setUbicacion(prev => ({ ...prev, idSector: '' }));
      setOpciones(prev => ({ ...prev, sectores: [] }));
      
      // Cargar sectores si se seleccionó una comuna
      if (value) {
        try {
          const sectores = await propiedadesApi.getSectores(value);
          setOpciones(prev => ({ ...prev, sectores }));
        } catch (error) {
          console.error('Error al cargar sectores:', error);
        }
      }
    }
  };

  const handleImagenChange = (e) => {
    const files = Array.from(e.target.files);
    const nuevasImagenes = files.filter(file => {
      const esImagen = file.type.startsWith('image/');
      const tamanoValido = file.size <= 5 * 1024 * 1024; // 5MB máximo
      return esImagen && tamanoValido;
    });

    if (imagenes.length + nuevasImagenes.length > 10) {
      Swal.fire('Error', 'Máximo 10 imágenes permitidas', 'error');
      return;
    }

    setImagenes(prev => [...prev, ...nuevasImagenes]);
  };

  const eliminarImagen = (index) => {
    setImagenes(prev => prev.filter((_, i) => i !== index));
  };

  const subirImagenes = async (idPropiedad) => {
    console.log('=== DEBUG SUBIR IMÁGENES ===');
    console.log('ID Propiedad:', idPropiedad);
    console.log('Número de imágenes:', imagenes.length);
    
    const imagenesSubidas = [];
    
    for (let i = 0; i < imagenes.length; i++) {
      const imagen = imagenes[i];
      console.log(`Procesando imagen ${i + 1}:`, imagen.name, imagen.type, imagen.size);
      
      const formData = new FormData();
      formData.append('action', 'subir_imagen');
      formData.append('id_propiedad', idPropiedad);
      formData.append('imagen', imagen);
      
      console.log('FormData creado:', formData);
      
      try {
        console.log(`Enviando imagen ${i + 1} al backend...`);
        const response = await propiedadesApi.subirImagenPropiedad(idPropiedad, formData);
        console.log(`Respuesta imagen ${i + 1}:`, response);
        
        if (response.success) {
          imagenesSubidas.push(response);
          console.log(`Imagen ${i + 1} subida exitosamente`);
        } else {
          console.error(`Error en respuesta imagen ${i + 1}:`, response);
        }
      } catch (error) {
        console.error(`Error al subir imagen ${i + 1}:`, error);
        console.error('Detalles del error:', error.response?.data);
      }
    }
    
    console.log('Total imágenes subidas:', imagenesSubidas.length);
    return imagenesSubidas;
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    // Validar título
    if (!formData.titulopropiedad.trim()) {
      nuevosErrores.titulopropiedad = 'El título es requerido';
    }

    // Validar descripción
    if (!formData.descripcion.trim()) {
      nuevosErrores.descripcion = 'La descripción es requerida';
    }

    // Validar precio
    if (!formData.precio_pesos || formData.precio_pesos <= 0) {
      nuevosErrores.precio_pesos = 'El precio es requerido y debe ser mayor a 0';
    }

    // Validar tipo de propiedad
    if (!formData.idtipo_propiedad) {
      nuevosErrores.idtipo_propiedad = 'El tipo de propiedad es requerido';
    }

    // Validar ubicación
    if (!ubicacion.idRegion) {
      nuevosErrores.region = 'Debe seleccionar una región';
    }
    if (!ubicacion.idProvincia) {
      nuevosErrores.provincia = 'Debe seleccionar una provincia';
    }
    if (!ubicacion.idComuna) {
      nuevosErrores.comuna = 'Debe seleccionar una comuna';
    }
    if (!ubicacion.idSector) {
      nuevosErrores.sector = 'Debe seleccionar un sector';
    }

    // Validar usuario
    if (!user || !user.id) {
      nuevosErrores.usuario = 'Debe estar logueado para crear una propiedad';
    }

    setErrors(nuevosErrores);
    return nuevosErrores;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const nuevosErrores = validarFormulario();
    if (Object.keys(nuevosErrores).length > 0) {
      const erroresCount = Object.keys(nuevosErrores).length;
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos incompletos',
        html: `
          <p>Por favor, complete los siguientes campos requeridos:</p>
          <ul style="text-align: left; margin: 10px 0;">
            ${Object.values(nuevosErrores).map(error => `<li>• ${error}</li>`).join('')}
          </ul>
          <p><strong>Total: ${erroresCount} campo(s) faltante(s)</strong></p>
        `,
        confirmButtonText: 'Entendido'
      });
      return;
    }

    setLoading(true);
    try {
      const datosPropiedad = {
        ...formData,
        idsectores: ubicacion.idSector,
        idusuario: user.id, // Asegurar que se envíe el id del usuario
        estado: formData.estado_propiedad, // Enviar el estado como número (1 o 0)
        precio_pesos: parseInt(formData.precio_pesos),
        precio_uf: formData.precio_uf ? parseFloat(formData.precio_uf) : 0,
        cant_banos: parseInt(formData.cant_banos),
        cant_domitorios: parseInt(formData.cant_domitorios),
        area_total: formData.area_total ? parseInt(formData.area_total) : 0,
        area_construida: formData.area_construida ? parseInt(formData.area_construida) : 0
      };

      console.log('=== DEBUG ENVÍO DE DATOS ===');
      console.log('Usuario actual:', user);
      console.log('formData completo:', formData);
      console.log('ubicacion:', ubicacion);
      console.log('datosPropiedad a enviar:', datosPropiedad);
      
      // Crear la propiedad
      const response = await propiedadesApi.crearPropiedad(datosPropiedad);
      console.log('Respuesta del backend:', response);
      
      if (response.success && imagenes.length > 0) {
        // Subir imágenes si se seleccionaron
        await subirImagenes(response.id_propiedad);
      }
      
      Swal.fire('¡Éxito!', 'Propiedad creada exitosamente', 'success');
      navigate('/dashboard/propietario');
    } catch (error) {
      console.error('Error al crear propiedad:', error);
      console.error('Detalles del error:', error.response?.data);
      Swal.fire('Error', 'Error al crear la propiedad: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">
                <i className="fas fa-plus-circle me-2"></i>
                Nueva Propiedad
              </h4>
            </div>
            <div className="card-body">
              {/* Indicador de progreso */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted">Progreso del formulario</span>
                  <span className="badge bg-primary">{calcularProgreso()}%</span>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div 
                    className="progress-bar bg-primary" 
                    role="progressbar" 
                    style={{ width: `${calcularProgreso()}%` }}
                    aria-valuenow={calcularProgreso()} 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  ></div>
                </div>
                <small className="text-muted">
                  {calcularProgreso() === 100 ? '¡Formulario completo!' : `${8 - Math.round((calcularProgreso() / 100) * 8)} campos requeridos faltantes`}
                </small>
              </div>

              {/* Debug: Mostrar estado del usuario */}
              <div className="mb-3 p-2 border rounded" style={{ backgroundColor: '#f8f9fa' }}>
                <small className="text-muted">
                  <strong>Debug - Estado del usuario:</strong><br />
                  Usuario logueado: {user ? 'Sí' : 'No'}<br />
                  ID del usuario: {user?.id || 'No disponible'}<br />
                  Email: {user?.usuario || 'No disponible'}<br />
                  Tipo: {user?.tipoUsuario || 'No disponible'}
                </small>
                <button 
                  type="button" 
                  className="btn btn-sm btn-outline-info mt-2"
                  onClick={() => {
                    console.log('=== DEBUG USUARIO ===');
                    console.log('user del contexto:', user);
                    console.log('localStorage user:', localStorage.getItem('user'));
                    console.log('localStorage lastServerTime:', localStorage.getItem('lastServerTime'));
                    console.log('formData.idusuario:', formData.idusuario);
                    alert(`Usuario: ${JSON.stringify(user, null, 2)}\nlocalStorage: ${localStorage.getItem('user')}`);
                  }}
                >
                  Debug Usuario
                </button>
                <button 
                  type="button" 
                  className="btn btn-sm btn-outline-warning mt-2 ms-2"
                  onClick={() => {
                    localStorage.removeItem('user');
                    localStorage.removeItem('lastServerTime');
                    window.location.reload();
                  }}
                >
                  Limpiar Sesión
                </button>
                <button 
                  type="button" 
                  className="btn btn-sm btn-outline-secondary mt-2 ms-2"
                  onClick={async () => {
                    try {
                      const response = await fetch(`${config.API_BASE_URL}/debug_logs.php`);
                      const data = await response.json();
                      console.log('Logs del servidor:', data);
                      alert(`Logs del servidor:\n${data.logs.join('\n')}`);
                    } catch (error) {
                      console.error('Error al obtener logs:', error);
                      alert('Error al obtener logs del servidor');
                    }
                  }}
                >
                  Ver Logs Servidor
                </button>
                <button 
                  type="button" 
                  className="btn btn-sm btn-outline-success mt-2 ms-2"
                  onClick={async () => {
                    if (imagenes.length === 0) {
                      alert('Por favor seleccione al menos una imagen para probar');
                      return;
                    }
                    
                    try {
                      const formData = new FormData();
                      formData.append('imagen', imagenes[0]);
                      
                      console.log('=== TEST IMAGE UPLOAD ===');
                      console.log('Imagen seleccionada:', imagenes[0]);
                      
                      const response = await propiedadesApi.testImageUpload(formData);
                      console.log('Respuesta del test:', response);
                      
                      alert(`Test completado:\n${JSON.stringify(response, null, 2)}`);
                    } catch (error) {
                      console.error('Error en test de imagen:', error);
                      alert('Error en test de imagen: ' + error.message);
                    }
                  }}
                >
                  Test Imagen
                </button>
              </div>
              
              <form onSubmit={handleSubmit}>
                {/* Información Básica */}
                <div className="row mb-4">
                  <div className="col-12">
                    <h5 className="border-bottom pb-2">
                      <i className="fas fa-info-circle me-2"></i>
                      Información Básica
                    </h5>
                  </div>
                  
                  <div className="col-md-8">
                    <div className="mb-3">
                      <label className="form-label">
                        Título de la Propiedad 
                        <span style={styles.requiredField}> *</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.titulopropiedad ? 'is-invalid' : ''}`}
                        name="titulopropiedad"
                        value={formData.titulopropiedad}
                        onChange={handleInputChange}
                        placeholder="Ej: Hermosa casa en Las Condes"
                        style={errors.titulopropiedad ? styles.errorField : {}}
                      />
                      {errors.titulopropiedad && (
                        <div className="invalid-feedback">{errors.titulopropiedad}</div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label">
                        Tipo de Propiedad 
                        <span style={styles.requiredField}> *</span>
                      </label>
                      <select
                        className={`form-select ${errors.idtipo_propiedad ? 'is-invalid' : ''}`}
                        name="idtipo_propiedad"
                        value={formData.idtipo_propiedad}
                        onChange={handleInputChange}
                        style={errors.idtipo_propiedad ? styles.errorField : {}}
                      >
                        <option value="">Seleccionar tipo</option>
                        {opciones.tipos_propiedad?.map(tipo => (
                          <option key={tipo.idtipo_propiedad} value={tipo.idtipo_propiedad}>
                            {tipo.tipo}
                          </option>
                        ))}
                      </select>
                      {errors.idtipo_propiedad && (
                        <div className="invalid-feedback">{errors.idtipo_propiedad}</div>
                      )}
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="mb-3">
                      <label className="form-label">
                        Descripción 
                        <span style={styles.requiredField}> *</span>
                      </label>
                      <textarea
                        className={`form-control ${errors.descripcion ? 'is-invalid' : ''}`}
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleInputChange}
                        rows="4"
                        placeholder="Describe las características principales de la propiedad..."
                        style={errors.descripcion ? styles.errorField : {}}
                      />
                      {errors.descripcion && (
                        <div className="invalid-feedback">{errors.descripcion}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Precios */}
                <div className="row mb-4">
                  <div className="col-12">
                    <h5 className="border-bottom pb-2">
                      <i className="fas fa-dollar-sign me-2"></i>
                      Precios
                    </h5>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        Precio en Pesos 
                        <span style={styles.requiredField}> *</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">$</span>
                        <input
                          type="number"
                          className={`form-control ${errors.precio_pesos ? 'is-invalid' : ''}`}
                          name="precio_pesos"
                          value={formData.precio_pesos}
                          onChange={handleInputChange}
                          placeholder="0"
                          min="0"
                          style={errors.precio_pesos ? styles.errorField : {}}
                        />
                      </div>
                      {errors.precio_pesos && (
                        <div className="invalid-feedback">{errors.precio_pesos}</div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Precio en UF</label>
                      <div className="input-group">
                        <span className="input-group-text">UF</span>
                        <input
                          type="number"
                          className="form-control"
                          name="precio_uf"
                          value={formData.precio_uf}
                          onChange={handleInputChange}
                          placeholder="0"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Características */}
                <div className="row mb-4">
                  <div className="col-12">
                    <h5 className="border-bottom pb-2">
                      <i className="fas fa-home me-2"></i>
                      Características
                    </h5>
                  </div>
                  
                  <div className="col-md-3">
                    <div className="mb-3">
                      <label className="form-label">Dormitorios</label>
                      <input
                        type="number"
                        className="form-control"
                        name="cant_domitorios"
                        value={formData.cant_domitorios}
                        onChange={handleInputChange}
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="mb-3">
                      <label className="form-label">Baños</label>
                      <input
                        type="number"
                        className="form-control"
                        name="cant_banos"
                        value={formData.cant_banos}
                        onChange={handleInputChange}
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="mb-3">
                      <label className="form-label">Área Total (m²)</label>
                      <input
                        type="number"
                        className="form-control"
                        name="area_total"
                        value={formData.area_total}
                        onChange={handleInputChange}
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="mb-3">
                      <label className="form-label">Área Construida (m²)</label>
                      <input
                        type="number"
                        className="form-control"
                        name="area_construida"
                        value={formData.area_construida}
                        onChange={handleInputChange}
                        min="0"
                      />
                    </div>
                  </div>

                  {/* Características booleanas */}
                  <div className="col-12">
                    <div className="row">
                      <div className="col-md-2">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            name="bodega"
                            checked={formData.bodega}
                            onChange={handleInputChange}
                          />
                          <label className="form-check-label">Bodega</label>
                        </div>
                      </div>
                      <div className="col-md-2">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            name="estacionamiento"
                            checked={formData.estacionamiento}
                            onChange={handleInputChange}
                          />
                          <label className="form-check-label">Estacionamiento</label>
                        </div>
                      </div>
                      <div className="col-md-2">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            name="logia"
                            checked={formData.logia}
                            onChange={handleInputChange}
                          />
                          <label className="form-check-label">Logia</label>
                        </div>
                      </div>
                      <div className="col-md-2">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            name="cocinaamoblada"
                            checked={formData.cocinaamoblada}
                            onChange={handleInputChange}
                          />
                          <label className="form-check-label">Cocina Amoblada</label>
                        </div>
                      </div>
                      <div className="col-md-2">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            name="antejardin"
                            checked={formData.antejardin}
                            onChange={handleInputChange}
                          />
                          <label className="form-check-label">Antejardín</label>
                        </div>
                      </div>
                      <div className="col-md-2">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            name="piscina"
                            checked={formData.piscina}
                            onChange={handleInputChange}
                          />
                          <label className="form-check-label">Piscina</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ubicación */}
                <div className="row mb-4">
                  <div className="col-12">
                    <h5 className="border-bottom pb-2">
                      <i className="fas fa-map-marker-alt me-2"></i>
                      Ubicación
                    </h5>
                  </div>
                  
                  <div className="col-md-3">
                    <div className="mb-3">
                      <label className="form-label">
                        Región 
                        <span style={styles.requiredField}> *</span>
                      </label>
                      <select
                        className={`form-select ${errors.region ? 'is-invalid' : ''}`}
                        name="idRegion"
                        value={ubicacion.idRegion}
                        onChange={handleUbicacionChange}
                        style={errors.region ? styles.errorField : {}}
                      >
                        <option value="">Seleccionar región</option>
                        {opciones.regiones?.map(region => (
                          <option key={region.idregion} value={region.idregion}>
                            {region.nombre_region}
                          </option>
                        ))}
                      </select>
                      {errors.region && (
                        <div className="invalid-feedback">{errors.region}</div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="mb-3">
                      <label className="form-label">
                        Provincia 
                        <span style={styles.requiredField}> *</span>
                      </label>
                      <select
                        className={`form-select ${errors.provincia ? 'is-invalid' : ''}`}
                        name="idProvincia"
                        value={ubicacion.idProvincia}
                        onChange={handleUbicacionChange}
                        disabled={!ubicacion.idRegion}
                        style={errors.provincia ? styles.errorField : {}}
                      >
                        <option value="">Seleccionar provincia</option>
                        {opciones.provincias?.map(provincia => (
                          <option key={provincia.idprovincias} value={provincia.idprovincias}>
                            {provincia.nombre_provincia}
                          </option>
                        ))}
                      </select>
                      {errors.provincia && (
                        <div className="invalid-feedback">{errors.provincia}</div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="mb-3">
                      <label className="form-label">
                        Comuna 
                        <span style={styles.requiredField}> *</span>
                      </label>
                      <select
                        className={`form-select ${errors.comuna ? 'is-invalid' : ''}`}
                        name="idComuna"
                        value={ubicacion.idComuna}
                        onChange={handleUbicacionChange}
                        disabled={!ubicacion.idProvincia}
                        style={errors.comuna ? styles.errorField : {}}
                      >
                        <option value="">Seleccionar comuna</option>
                        {opciones.comunas?.map(comuna => (
                          <option key={comuna.idcomunas} value={comuna.idcomunas}>
                            {comuna.nombre_comuna}
                          </option>
                        ))}
                      </select>
                      {errors.comuna && (
                        <div className="invalid-feedback">{errors.comuna}</div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="mb-3">
                      <label className="form-label">
                        Sector 
                        <span style={styles.requiredField}> *</span>
                      </label>
                      <select
                        className={`form-select ${errors.sector ? 'is-invalid' : ''}`}
                        name="idSector"
                        value={ubicacion.idSector}
                        onChange={handleUbicacionChange}
                        disabled={!ubicacion.idComuna}
                        style={errors.sector ? styles.errorField : {}}
                      >
                        <option value="">Seleccionar sector</option>
                        {opciones.sectores?.map(sector => (
                          <option key={sector.idsectores} value={sector.idsectores}>
                            {sector.nombre_sector}
                          </option>
                        ))}
                      </select>
                      {errors.sector && (
                        <div className="invalid-feedback">{errors.sector}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Imágenes */}
                <div className="row mb-4">
                  <div className="col-12">
                    <h5 className="border-bottom pb-2">
                      <i className="fas fa-images me-2"></i>
                      Imágenes de la Propiedad
                    </h5>
                  </div>
                  
                  <div className="col-12">
                    <div className="mb-3">
                      <label className="form-label">Seleccionar Imágenes (Máximo 10)</label>
                      <input
                        type="file"
                        className="form-control"
                        multiple
                        accept="image/*"
                        onChange={handleImagenChange}
                        disabled={imagenes.length >= 10}
                      />
                      <div className="form-text">
                        Puedes seleccionar hasta 10 imágenes. Formatos permitidos: JPG, PNG, GIF. Tamaño máximo: 5MB por imagen.
                      </div>
                    </div>
                  </div>

                  {/* Vista previa de imágenes */}
                  {imagenes.length > 0 && (
                    <div className="col-12">
                      <div className="row">
                        {imagenes.map((imagen, index) => (
                          <div key={index} className="col-md-3 col-sm-4 col-6 mb-3">
                            <div className="card">
                              <img
                                src={URL.createObjectURL(imagen)}
                                className="card-img-top"
                                alt={`Imagen ${index + 1}`}
                                style={{ height: '150px', objectFit: 'cover' }}
                              />
                              <div className="card-body p-2">
                                <button
                                  type="button"
                                  className="btn btn-danger btn-sm w-100"
                                  onClick={() => eliminarImagen(index)}
                                >
                                  <i className="fas fa-trash me-1"></i>
                                  Eliminar
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2">
                        <small className="text-muted">
                          {imagenes.length} de 10 imágenes seleccionadas
                        </small>
                      </div>
                    </div>
                  )}
                </div>

                                {/* Estado */}
                <div className="row mb-4">
                  <div className="col-12">
                    <h5 className="border-bottom pb-2">
                      <i className="fas fa-toggle-on me-2"></i>
                      Estado
                    </h5>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Estado de la Propiedad</label>
                      <select
                        className="form-select"
                        name="estado_propiedad"
                        value={formData.estado_propiedad}
                        onChange={handleInputChange}
                      >
                        <option value={1}>Disponible</option>
                        <option value={0}>No publicar</option>
                      </select>
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
                        onClick={() => navigate('/admin/propiedades')}
                      >
                        <i className="fas fa-times me-2"></i>
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Creando...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-save me-2"></i>
                            Crear Propiedad
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

export default NuevaPropiedad; 