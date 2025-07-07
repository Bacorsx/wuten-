import axios from 'axios';
import { config } from '../config/config';

// Configuración de axios
const api = axios.create({
  baseURL: config.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const propiedadesApi = {
  // Cargar propiedades
  getPropiedades: async (filtros = {}) => {
    try {
      const response = await api.post('/cargar_propiedades.php', filtros);
      return response.data;
    } catch (error) {
      console.error('Error al cargar propiedades:', error);
      throw new Error('Error al cargar propiedades');
    }
  },

  // Obtener opciones de filtros
  getOpcionesFiltros: async () => {
    try {
      const response = await api.get('/opciones_filtros.php');
      return response.data.success ? response.data.opciones : {};
    } catch (error) {
      console.error('Error al cargar opciones de filtros:', error);
      // Retornar datos de prueba en caso de error
      return {
        regiones: [
          { idregion: 1, nombre_region: 'Región Metropolitana' },
          { idregion: 2, nombre_region: 'Valparaíso' },
          { idregion: 3, nombre_region: 'O\'Higgins' }
        ],
        provincias: [
          { idprovincias: 1, nombre_provincia: 'Santiago', idregion: 1 },
          { idprovincias: 2, nombre_provincia: 'Valparaíso', idregion: 2 },
          { idprovincias: 3, nombre_provincia: 'Cachapoal', idregion: 3 }
        ],
        comunas: [
          { idcomunas: 1, nombre_comuna: 'Las Condes', idprovincias: 1 },
          { idcomunas: 2, nombre_comuna: 'Providencia', idprovincias: 1 },
          { idcomunas: 3, nombre_comuna: 'Viña del Mar', idprovincias: 2 }
        ],
        sectores: [
          { idsectores: 1, nombre_sector: 'Centro', idcomunas: 1 },
          { idsectores: 2, nombre_sector: 'Norte', idcomunas: 1 },
          { idsectores: 3, nombre_sector: 'Sur', idcomunas: 2 }
        ],
        tipos_propiedad: [
          { idtipo_propiedad: 1, tipo: 'Departamento' },
          { idtipo_propiedad: 2, tipo: 'Casa' },
          { idtipo_propiedad: 3, tipo: 'Oficina' }
        ],
        rangos_precio: { precio_min: 50000000, precio_max: 500000000 }
      };
    }
  },

  // Obtener UF actual
  getUF: async () => {
    try {
      const response = await api.get('/api_uf.php');
      return response.data.uf;
    } catch (error) {
      console.error('Error al obtener UF:', error);
      throw new Error('Error al obtener UF');
    }
  },

  // Obtener detalle de propiedad
  getDetallePropiedad: async (id) => {
    try {
      const response = await api.get(`/detalle_propiedad.php?id=${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al cargar detalle de propiedad:', error);
      throw new Error('Error al cargar detalle de propiedad');
    }
  },

  // Enviar formulario de contacto
  enviarContacto: async (datos) => {
    try {
      const response = await api.post('/enviar_contacto.php', datos);
      return response.data;
    } catch (error) {
      console.error('Error al enviar contacto:', error);
      throw new Error('Error al enviar contacto');
    }
  },

  // Listar contactos (para administración)
  listarContactos: async (page = 1, limit = 10) => {
    try {
      const response = await api.get(`/listar_contactos.php?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error al cargar contactos:', error);
      throw new Error('Error al cargar contactos');
    }
  },

  // Obtener estadísticas del dashboard
  getEstadisticas: async () => {
    try {
      const response = await api.get('/estadisticas.php');
      return response.data;
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      throw new Error('Error al cargar estadísticas');
    }
  },

  // Registrar nuevo usuario
  registrarUsuario: async (datos) => {
    try {
      const response = await api.post('/api_registro.php', datos);
      return response.data;
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      throw new Error('Error al registrar usuario');
    }
  },

  // Obtener regiones
  getRegiones: async () => {
    try {
      const response = await api.get('/get_regiones.php');
      return response.data.success ? response.data.regiones : [];
    } catch (error) {
      // Retornar datos de prueba en caso de error
      return [
        { idregion: 1, nombre_region: 'Región Metropolitana' },
        { idregion: 2, nombre_region: 'Valparaíso' },
        { idregion: 3, nombre_region: 'O\'Higgins' }
      ];
    }
  },

  // Obtener provincias por región
  getProvincias: async (idRegion) => {
    try {
      const response = await api.get(`/get_provincias.php?id_region=${idRegion}`);
      return response.data.success ? response.data.provincias : [];
    } catch (error) {
      // Retornar datos de prueba en caso de error
      const provinciasPrueba = [
        { idprovincias: 1, nombre_provincia: 'Santiago', idregion: 1 },
        { idprovincias: 2, nombre_provincia: 'Valparaíso', idregion: 2 },
        { idprovincias: 3, nombre_provincia: 'Cachapoal', idregion: 3 }
      ];
      return provinciasPrueba.filter(p => p.idregion == idRegion);
    }
  },

  // Obtener comunas por provincia
  getComunas: async (idProvincia) => {
    try {
      const response = await api.get(`/get_comunas.php?id_provincia=${idProvincia}`);
      return response.data.success ? response.data.comunas : [];
    } catch (error) {
      // Retornar datos de prueba en caso de error
      const comunasPrueba = [
        { idcomunas: 1, nombre_comuna: 'Las Condes', idprovincias: 1 },
        { idcomunas: 2, nombre_comuna: 'Providencia', idprovincias: 1 },
        { idcomunas: 3, nombre_comuna: 'Viña del Mar', idprovincias: 2 }
      ];
      return comunasPrueba.filter(c => c.idprovincias == idProvincia);
    }
  },

  // Obtener sectores por comuna
  getSectores: async (idComuna) => {
    try {
      const response = await api.get(`/get_sectores.php?id_comuna=${idComuna}`);
      return response.data.success ? response.data.sectores : [];
    } catch (error) {
      // Retornar datos de prueba en caso de error
      const sectoresPrueba = [
        { idsectores: 1, nombre_sector: 'Centro', idcomunas: 1 },
        { idsectores: 2, nombre_sector: 'Norte', idcomunas: 1 },
        { idsectores: 3, nombre_sector: 'Sur', idcomunas: 2 }
      ];
      return sectoresPrueba.filter(s => s.idcomunas == idComuna);
    }
  },

  // CRUD de propiedades
  crearPropiedad: async (propiedadData) => {
    try {
      console.log('API - Enviando datos a crearPropiedad:', propiedadData);
      
      const response = await api.post('/CRUD_propiedades_mejorado.php', {
        action: 'crear',
        ...propiedadData
      });
      
      console.log('API - Respuesta del backend:', response.data);
      return response.data;
    } catch (error) {
      console.error('API - Error en crearPropiedad:', error);
      throw new Error('Error al crear propiedad: ' + (error.response?.data?.message || error.message));
    }
  },

  actualizarPropiedad: async (id, propiedadData) => {
    try {
      const response = await api.post('/CRUD_propiedades_mejorado.php', {
        action: 'actualizar',
        id_propiedad: id,
        ...propiedadData
      });
      return response.data;
    } catch (error) {
      throw new Error('Error al actualizar propiedad');
    }
  },

  eliminarPropiedad: async (id) => {
    try {
      const response = await api.post('/CRUD_propiedades_mejorado.php', {
        action: 'eliminar',
        id_propiedad: id
      });
      return response.data;
    } catch (error) {
      throw new Error('Error al eliminar propiedad');
    }
  },

  obtenerPropiedad: async (id) => {
    try {
      const response = await api.post('/CRUD_propiedades_mejorado.php', {
        action: 'obtener',
        id_propiedad: id
      });
      return response.data;
    } catch (error) {
      throw new Error('Error al obtener propiedad');
    }
  },

  // Listar propiedades (para administración)
  listarPropiedades: async (filtros = {}) => {
    try {
      const response = await api.post('/CRUD_propiedades_mejorado.php', {
        action: 'listar',
        ...filtros
      });
      return response.data;
    } catch (error) {
      throw new Error('Error al cargar propiedades');
    }
  },

  // CRUD de usuarios
  listarUsuarios: async (filtros = {}) => {
    try {
      const response = await api.get('/listar_usuarios.php', { params: filtros });
      return response.data;
    } catch (error) {
      throw new Error('Error al cargar usuarios');
    }
  },

  crearUsuario: async (usuarioData) => {
    try {
      const response = await api.post('/CRUD_usuarios.php', {
        action: 'crear',
        ...usuarioData
      });
      return response.data;
    } catch (error) {
      throw new Error('Error al crear usuario');
    }
  },

  actualizarUsuario: async (id, usuarioData) => {
    try {
      const response = await api.post('/CRUD_usuarios.php', {
        action: 'actualizar',
        id_usuario: id,
        ...usuarioData
      });
      return response.data;
    } catch (error) {
      throw new Error('Error al actualizar usuario');
    }
  },

  eliminarUsuario: async (id) => {
    try {
      const response = await api.post('/eliminar_usuario.php', {
        id: id
      });
      return response.data;
    } catch (error) {
      throw new Error('Error al eliminar usuario');
    }
  },

  obtenerUsuario: async (id) => {
    try {
      const response = await api.post('/CRUD_usuarios.php', {
        action: 'obtener',
        id_usuario: id
      });
      return response.data;
    } catch (error) {
      throw new Error('Error al obtener usuario');
    }
  },

  cambiarEstadoUsuario: async (id, activo) => {
    try {
      const response = await api.post('/cambiar_estado_usuario.php', {
        id: id,
        activo: activo
      });
      return response.data;
    } catch (error) {
      throw new Error('Error al cambiar estado del usuario');
    }
  },

  // Eliminar imagen
  eliminarImagen: async (idImagen) => {
    try {
      const response = await api.post('/eliminar_imagen.php', {
        id_imagen: idImagen
      });
      return response.data;
    } catch (error) {
      throw new Error('Error al eliminar imagen');
    }
  },

  // Cambiar estado de propiedad
  cambiarEstadoPropiedad: async (id, disponible) => {
    try {
      const response = await api.post('/CRUD_propiedades_mejorado.php', {
        action: 'cambiar_estado',
        id_propiedad: id,
        estado: disponible ? 'Disponible' : 'No disponible'
      });
      return response.data;
    } catch (error) {
      throw new Error('Error al cambiar estado de la propiedad');
    }
  },

  // Subir imagen de propiedad
  subirImagenPropiedad: async (idPropiedad, formData) => {
    try {
      console.log('API - subirImagenPropiedad - ID Propiedad:', idPropiedad);
      console.log('API - subirImagenPropiedad - FormData:', formData);
      
      // Verificar contenido del FormData
      for (let [key, value] of formData.entries()) {
        console.log(`API - FormData entry: ${key} =`, value);
      }
      
      const response = await api.post('/CRUD_propiedades_mejorado.php', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('API - Respuesta subirImagenPropiedad:', response.data);
      return response.data;
    } catch (error) {
      console.error('API - Error en subirImagenPropiedad:', error);
      console.error('API - Detalles del error:', error.response?.data);
      throw new Error('Error al subir imagen: ' + (error.response?.data?.message || error.message));
    }
  },

  // Eliminar imagen de propiedad
  eliminarImagenPropiedad: async (idImagen) => {
    try {
      const response = await api.post('/CRUD_propiedades_mejorado.php', {
        action: 'eliminar_imagen',
        id_imagen: idImagen
      });
      return response.data;
    } catch (error) {
      throw new Error('Error al eliminar imagen');
    }
  },

  // Cambiar imagen principal
  cambiarImagenPrincipal: async (idImagen, idPropiedad) => {
    try {
      const response = await api.post('/CRUD_propiedades_mejorado.php', {
        action: 'cambiar_imagen_principal',
        id_imagen: idImagen,
        id_propiedad: idPropiedad
      });
      return response.data;
    } catch (error) {
      throw new Error('Error al cambiar imagen principal');
    }
  },

  // Función para ocultar imagen
  ocultarImagen: async (idImagen) => {
    try {
      const response = await api.post('/CRUD_propiedades_mejorado.php', {
        action: 'ocultar_imagen',
        id_imagen: idImagen
      });
      return response.data;
    } catch (error) {
      throw new Error('Error al ocultar imagen');
    }
  },

  // Función para mostrar imagen
  mostrarImagen: async (idImagen) => {
    try {
      const response = await api.post('/CRUD_propiedades_mejorado.php', {
        action: 'mostrar_imagen',
        id_imagen: idImagen
      });
      return response.data;
    } catch (error) {
      throw new Error('Error al mostrar imagen');
    }
  },

  // Subir imagen de usuario
  subirImagenUsuario: async (idUsuario, formData) => {
    try {
      const response = await api.post('/CRUD_usuarios.php', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error('Error al subir imagen de usuario');
    }
  },

  // Test de subida de imagen
  testImageUpload: async (formData) => {
    try {
      console.log('API - testImageUpload - FormData:', formData);
      
      // Verificar contenido del FormData
      for (let [key, value] of formData.entries()) {
        console.log(`API - Test FormData entry: ${key} =`, value);
      }
      
      const response = await api.post('/test_image_upload.php', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('API - Respuesta testImageUpload:', response.data);
      return response.data;
    } catch (error) {
      console.error('API - Error en testImageUpload:', error);
      console.error('API - Detalles del error:', error.response?.data);
      throw new Error('Error en test de imagen: ' + (error.response?.data?.message || error.message));
    }
  }
};

export default propiedadesApi; 