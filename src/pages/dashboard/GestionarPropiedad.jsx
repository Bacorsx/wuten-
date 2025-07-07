import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { propiedadesApi } from '../../api/propiedadesApi';

const GestionarPropiedad = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [propiedad, setPropiedad] = useState(null);
  const [opciones, setOpciones] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    cargarPropiedad();
    cargarOpciones();
  }, [id]);

  const cargarPropiedad = async () => {
    try {
      const response = await propiedadesApi.obtenerPropiedad(id);
      if (response.success) {
        setPropiedad(response.propiedad);
        
        // Cargar ubicación
        if (response.propiedad.idsectores) {
          await cargarUbicacion(response.propiedad.idsectores);
        }
      }
    } catch (error) {
      console.error('Error al cargar propiedad:', error);
      alert('Error al cargar la propiedad');
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
      // Cargar sector y comuna
      const sectores = await propiedadesApi.getSectores();
      const sector = sectores.find(s => s.idsectores == idSector);
      if (sector) {
        const comunas = await propiedadesApi.getComunas(sector.idcomunas);
        const comuna = comunas.find(c => c.idcomunas == sector.idcomunas);
        if (comuna) {
          const provincias = await propiedadesApi.getProvincias(comuna.idprovincias);
          const provincia = provincias.find(p => p.idprovincias == comuna.idprovincias);
          if (provincia) {
            setOpciones(prev => ({
              ...prev,
              sectores,
              comunas,
              provincias,
              ubicacionActual: {
                idRegion: provincia.idregiones,
                idProvincia: provincia.idprovincias,
                idComuna: comuna.idcomunas,
                idSector: sector.idsectores
              }
            }));
          }
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
      alert('Propiedad actualizada exitosamente');
      setEditMode(false);
      await cargarPropiedad(); // Recargar datos
    } catch (error) {
      console.error('Error al actualizar propiedad:', error);
      alert('Error al actualizar la propiedad: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEliminar = async () => {
    if (!confirm('¿Está seguro de que desea eliminar esta propiedad? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await propiedadesApi.eliminarPropiedad(id);
      alert('Propiedad eliminada exitosamente');
      navigate('/admin/propiedades');
    } catch (error) {
      console.error('Error al eliminar propiedad:', error);
      alert('Error al eliminar la propiedad: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body text-center">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-2">Cargando propiedad...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!propiedad) {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body text-center">
                <h4>Propiedad no encontrada</h4>
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/admin/propiedades')}
                >
                  Volver a Propiedades
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="card-title">
                <i className="fas fa-home me-2"></i>
                {editMode ? 'Editar Propiedad' : 'Gestionar Propiedad'}
              </h4>
              <div className="btn-group">
                {!editMode && (
                  <>
                    <button
                      className="btn btn-primary"
                      onClick={() => setEditMode(true)}
                    >
                      <i className="fas fa-edit me-2"></i>
                      Editar
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={handleEliminar}
                    >
                      <i className="fas fa-trash me-2"></i>
                      Eliminar
                    </button>
                  </>
                )}
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate('/admin/propiedades')}
                >
                  <i className="fas fa-arrow-left me-2"></i>
                  Volver
                </button>
              </div>
            </div>
            <div className="card-body">
              {editMode ? (
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
                        <label className="form-label">Título de la Propiedad *</label>
                        <input
                          type="text"
                          className={`form-control ${errors.titulopropiedad ? 'is-invalid' : ''}`}
                          name="titulopropiedad"
                          value={propiedad.titulopropiedad || ''}
                          onChange={handleInputChange}
                        />
                        {errors.titulopropiedad && (
                          <div className="invalid-feedback">{errors.titulopropiedad}</div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Tipo de Propiedad *</label>
                        <select
                          className={`form-select ${errors.idtipo_propiedad ? 'is-invalid' : ''}`}
                          name="idtipo_propiedad"
                          value={propiedad.idtipo_propiedad || ''}
                          onChange={handleInputChange}
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
                        <label className="form-label">Descripción *</label>
                        <textarea
                          className={`form-control ${errors.descripcion ? 'is-invalid' : ''}`}
                          name="descripcion"
                          value={propiedad.descripcion || ''}
                          onChange={handleInputChange}
                          rows="4"
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
                        <label className="form-label">Precio en Pesos *</label>
                        <div className="input-group">
                          <span className="input-group-text">$</span>
                          <input
                            type="number"
                            className={`form-control ${errors.precio_pesos ? 'is-invalid' : ''}`}
                            name="precio_pesos"
                            value={propiedad.precio_pesos || ''}
                            onChange={handleInputChange}
                            min="0"
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
                            value={propiedad.precio_uf || ''}
                            onChange={handleInputChange}
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
                          value={propiedad.cant_domitorios || 0}
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
                          value={propiedad.cant_banos || 0}
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
                          value={propiedad.area_total || ''}
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
                          value={propiedad.area_construida || ''}
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
                              checked={propiedad.bodega || false}
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
                              checked={propiedad.estacionamiento || false}
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
                              checked={propiedad.logia || false}
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
                              checked={propiedad.cocinaamoblada || false}
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
                              checked={propiedad.antejardin || false}
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
                              checked={propiedad.piscina || false}
                              onChange={handleInputChange}
                            />
                            <label className="form-check-label">Piscina</label>
                          </div>
                        </div>
                      </div>
                    </div>
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
                          name="estado"
                          value={propiedad.estado ? 'Disponible' : 'No disponible'}
                          onChange={handleInputChange}
                        >
                          <option value="Disponible">Disponible</option>
                          <option value="No disponible">No disponible</option>
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
                          onClick={() => setEditMode(false)}
                        >
                          <i className="fas fa-times me-2"></i>
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={saving}
                        >
                          {saving ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              Guardando...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-save me-2"></i>
                              Guardar Cambios
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                <div>
                  {/* Vista de solo lectura */}
                  <div className="row">
                    <div className="col-md-8">
                      <h3>{propiedad.titulopropiedad}</h3>
                      <p className="text-muted">
                        <i className="fas fa-map-marker-alt me-2"></i>
                        {propiedad.nombre_comuna}, {propiedad.nombre_provincia}
                      </p>
                    </div>
                    <div className="col-md-4 text-end">
                      <h4 className="text-primary">${propiedad.precio_pesos?.toLocaleString()}</h4>
                      {propiedad.precio_uf && (
                        <p className="text-muted">{propiedad.precio_uf} UF</p>
                      )}
                    </div>
                  </div>

                  <div className="row mt-4">
                    <div className="col-md-8">
                      <h5>Descripción</h5>
                      <p>{propiedad.descripcion}</p>
                    </div>
                    <div className="col-md-4">
                      <h5>Características</h5>
                      <ul className="list-unstyled">
                        <li><i className="fas fa-bed me-2"></i> {propiedad.cant_domitorios} dormitorios</li>
                        <li><i className="fas fa-bath me-2"></i> {propiedad.cant_banos} baños</li>
                        {propiedad.area_construida && (
                          <li><i className="fas fa-ruler-combined me-2"></i> {propiedad.area_construida} m² construidos</li>
                        )}
                        {propiedad.area_total && (
                          <li><i className="fas fa-expand-arrows-alt me-2"></i> {propiedad.area_total} m² totales</li>
                        )}
                      </ul>

                      <h6>Servicios</h6>
                      <ul className="list-unstyled">
                        {propiedad.bodega && <li><i className="fas fa-check text-success me-2"></i>Bodega</li>}
                        {propiedad.estacionamiento && <li><i className="fas fa-check text-success me-2"></i>Estacionamiento</li>}
                        {propiedad.logia && <li><i className="fas fa-check text-success me-2"></i>Logia</li>}
                        {propiedad.cocinaamoblada && <li><i className="fas fa-check text-success me-2"></i>Cocina Amoblada</li>}
                        {propiedad.antejardin && <li><i className="fas fa-check text-success me-2"></i>Antejardín</li>}
                        {propiedad.piscina && <li><i className="fas fa-check text-success me-2"></i>Piscina</li>}
                      </ul>
                    </div>
                  </div>

                  <div className="row mt-4">
                    <div className="col-12">
                      <h5>Información Adicional</h5>
                      <div className="row">
                        <div className="col-md-3">
                          <strong>Tipo:</strong> {propiedad.tipo_propiedad}
                        </div>
                        <div className="col-md-3">
                          <strong>Estado:</strong> 
                          <span className={`badge ms-2 ${
                            propiedad.estado ? 'bg-success' : 'bg-secondary'
                          }`}>
                            {propiedad.estado ? 'Disponible' : 'No disponible'}
                          </span>
                        </div>
                        <div className="col-md-3">
                          <strong>Propietario:</strong> {propiedad.propietario_nombre}
                        </div>
                        <div className="col-md-3">
                          <strong>Publicada:</strong> {new Date(propiedad.fecha_publicacion).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GestionarPropiedad; 