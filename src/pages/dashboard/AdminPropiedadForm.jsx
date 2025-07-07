import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { propiedadesApi } from '../../api/propiedadesApi';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Swal from 'sweetalert2';

const AdminPropiedadForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = !!id;
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [propiedad, setPropiedad] = useState({
    titulopropiedad: '',
    descripcion: '',
    precio_pesos: '',
    precio_uf: '',
    cant_banos: '',
    cant_domitorios: '',
    area_total: '',
    area_construida: '',
    estado_propiedad: 'Disponible',
    idtipo_propiedad: '',
    idsectores: '',
    idusuario: '',
    bodega: false,
    estacionamiento: false,
    logia: false,
    cocinaamoblada: false,
    antejardin: false,
    patiotrasero: false,
    piscina: false
  });

  const [opciones, setOpciones] = useState({
    tipos_propiedad: [],
    sectores: [],
    usuarios: []
  });

  useEffect(() => {
    cargarOpciones();
    if (isEditing) {
      cargarPropiedad();
    }
  }, [id]);

  const cargarOpciones = async () => {
    try {
      const [filtrosResponse, usuariosResponse] = await Promise.all([
        propiedadesApi.getOpcionesFiltros(),
        propiedadesApi.listarUsuarios({ limit: 100 })
      ]);

      if (filtrosResponse.success) {
        setOpciones(prev => ({
          ...prev,
          tipos_propiedad: filtrosResponse.tipos_propiedad || [],
          sectores: filtrosResponse.sectores || []
        }));
      }

      if (usuariosResponse.success) {
        setOpciones(prev => ({
          ...prev,
          usuarios: usuariosResponse.usuarios || []
        }));
      }
    } catch (error) {
      console.error('Error al cargar opciones:', error);
      Swal.fire('Error', 'Error al cargar las opciones', 'error');
    }
  };

  const cargarPropiedad = async () => {
    try {
      setLoading(true);
      const response = await propiedadesApi.obtenerPropiedad(id);
      
      if (response.success) {
        setPropiedad(response.propiedad);
      } else {
        Swal.fire('Error', response.message || 'Error al cargar la propiedad', 'error');
        navigate('/admin/propiedades');
      }
    } catch (error) {
      console.error('Error al cargar propiedad:', error);
      Swal.fire('Error', 'Error al cargar la propiedad', 'error');
      navigate('/admin/propiedades');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPropiedad(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!propiedad.titulopropiedad || !propiedad.descripcion || !propiedad.precio_pesos) {
      Swal.fire('Error', 'Por favor completa todos los campos requeridos', 'error');
      return;
    }

    try {
      setSaving(true);
      
      let response;
      if (isEditing) {
        response = await propiedadesApi.actualizarPropiedad(id, propiedad);
      } else {
        response = await propiedadesApi.crearPropiedad(propiedad);
      }

      if (response.success) {
        Swal.fire({
          title: 'Éxito',
          text: response.message,
          icon: 'success',
          confirmButtonText: 'OK'
        }).then(() => {
          navigate('/admin/propiedades');
        });
      } else {
        Swal.fire('Error', response.message || 'Error al guardar la propiedad', 'error');
      }
    } catch (error) {
      console.error('Error al guardar:', error);
      Swal.fire('Error', 'Error al guardar la propiedad', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Navbar />
        <div className="loading">
          <div className="spinner"></div>
          <p>Cargando propiedad...</p>
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
            <h1>{isEditing ? 'Editar Propiedad' : 'Nueva Propiedad'}</h1>
            <p>{isEditing ? 'Modifica los datos de la propiedad' : 'Crea una nueva propiedad en el sistema'}</p>
          </div>
          <div className="header-actions">
            <button 
              type="button" 
              className="btn-secondary"
              onClick={() => navigate('/admin/propiedades')}
            >
              Cancelar
            </button>
          </div>
        </div>

        {/* Formulario */}
        <div className="form-section">
          <form onSubmit={handleSubmit} className="property-form">
            <div className="form-grid">
              {/* Información básica */}
              <div className="form-group">
                <label htmlFor="titulopropiedad">Título de la Propiedad *</label>
                <input
                  type="text"
                  id="titulopropiedad"
                  name="titulopropiedad"
                  value={propiedad.titulopropiedad}
                  onChange={handleInputChange}
                  required
                  placeholder="Ej: Casa en Las Condes"
                />
              </div>

              <div className="form-group">
                <label htmlFor="descripcion">Descripción *</label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={propiedad.descripcion}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  placeholder="Describe la propiedad..."
                />
              </div>

              {/* Precios */}
              <div className="form-group">
                <label htmlFor="precio_pesos">Precio en Pesos *</label>
                <input
                  type="number"
                  id="precio_pesos"
                  name="precio_pesos"
                  value={propiedad.precio_pesos}
                  onChange={handleInputChange}
                  required
                  placeholder="50000000"
                />
              </div>

              <div className="form-group">
                <label htmlFor="precio_uf">Precio en UF</label>
                <input
                  type="number"
                  id="precio_uf"
                  name="precio_uf"
                  value={propiedad.precio_uf}
                  onChange={handleInputChange}
                  step="0.01"
                  placeholder="1500.50"
                />
              </div>

              {/* Características */}
              <div className="form-group">
                <label htmlFor="cant_domitorios">Dormitorios</label>
                <input
                  type="number"
                  id="cant_domitorios"
                  name="cant_domitorios"
                  value={propiedad.cant_domitorios}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="cant_banos">Baños</label>
                <input
                  type="number"
                  id="cant_banos"
                  name="cant_banos"
                  value={propiedad.cant_banos}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="2"
                />
              </div>

              <div className="form-group">
                <label htmlFor="area_construida">Área Construida (m²)</label>
                <input
                  type="number"
                  id="area_construida"
                  name="area_construida"
                  value={propiedad.area_construida}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="120"
                />
              </div>

              <div className="form-group">
                <label htmlFor="area_total">Área Total (m²)</label>
                <input
                  type="number"
                  id="area_total"
                  name="area_total"
                  value={propiedad.area_total}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="150"
                />
              </div>

              {/* Selectores */}
              <div className="form-group">
                <label htmlFor="idtipo_propiedad">Tipo de Propiedad *</label>
                <select
                  id="idtipo_propiedad"
                  name="idtipo_propiedad"
                  value={propiedad.idtipo_propiedad}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecciona un tipo</option>
                  {opciones.tipos_propiedad.map(tipo => (
                    <option key={tipo.idtipo_propiedad} value={tipo.idtipo_propiedad}>
                      {tipo.tipo}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="idsectores">Sector *</label>
                <select
                  id="idsectores"
                  name="idsectores"
                  value={propiedad.idsectores}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecciona un sector</option>
                  {opciones.sectores.map(sector => (
                    <option key={sector.idsectores} value={sector.idsectores}>
                      {sector.nombre_sector}, {sector.nombre_comuna}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="idusuario">Propietario *</label>
                <select
                  id="idusuario"
                  name="idusuario"
                  value={propiedad.idusuario}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecciona un propietario</option>
                  {opciones.usuarios
                    .filter(u => u.tipo_usuario === 'Propietario' || u.tipo_usuario === 'Admin')
                    .map(usuario => (
                      <option key={usuario.id} value={usuario.id}>
                        {usuario.nombre_completo} ({usuario.email})
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="estado_propiedad">Estado</label>
                <select
                  id="estado_propiedad"
                  name="estado_propiedad"
                  value={propiedad.estado_propiedad}
                  onChange={handleInputChange}
                >
                  <option value="Disponible">Disponible</option>
                  <option value="Reservada">Reservada</option>
                  <option value="Vendida">Vendida</option>
                </select>
              </div>
            </div>

            {/* Características adicionales */}
            <div className="form-section">
              <h3>Características Adicionales</h3>
              <div className="checkbox-grid">
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="bodega"
                    name="bodega"
                    checked={propiedad.bodega}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="bodega">Bodega</label>
                </div>

                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="estacionamiento"
                    name="estacionamiento"
                    checked={propiedad.estacionamiento}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="estacionamiento">Estacionamiento</label>
                </div>

                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="logia"
                    name="logia"
                    checked={propiedad.logia}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="logia">Logia</label>
                </div>

                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="cocinaamoblada"
                    name="cocinaamoblada"
                    checked={propiedad.cocinaamoblada}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="cocinaamoblada">Cocina Amoblada</label>
                </div>

                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="antejardin"
                    name="antejardin"
                    checked={propiedad.antejardin}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="antejardin">Antejardín</label>
                </div>

                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="patiotrasero"
                    name="patiotrasero"
                    checked={propiedad.patiotrasero}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="patiotrasero">Patio Trasero</label>
                </div>

                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="piscina"
                    name="piscina"
                    checked={propiedad.piscina}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="piscina">Piscina</label>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/admin/propiedades')}
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={saving}
              >
                {saving ? 'Guardando...' : (isEditing ? 'Actualizar Propiedad' : 'Crear Propiedad')}
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminPropiedadForm; 