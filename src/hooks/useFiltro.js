import { useState, useEffect } from 'react';
import { propiedadesApi } from '../api/propiedadesApi';

export const useFiltro = () => {
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedProvincia, setSelectedProvincia] = useState('');
  const [selectedComuna, setSelectedComuna] = useState('');
  const [selectedTipo, setSelectedTipo] = useState('');
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');
  
  const [opciones, setOpciones] = useState({
    regiones: [],
    provincias: [],
    comunas: [],
    sectores: [],
    tipos_propiedad: [],
    rangos_precio: { precio_min: 0, precio_max: 0 }
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar opciones de filtros al montar el componente
  useEffect(() => {
    const cargarOpciones = async () => {
      try {
        setLoading(true);
        const data = await propiedadesApi.getOpcionesFiltros();
        setOpciones(data || {
          regiones: [],
          provincias: [],
          comunas: [],
          sectores: [],
          tipos_propiedad: [],
          rangos_precio: { precio_min: 0, precio_max: 0 }
        });
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error al cargar opciones de filtros:', err);
        // Mantener opciones por defecto en caso de error
        setOpciones({
          regiones: [],
          provincias: [],
          comunas: [],
          sectores: [],
          tipos_propiedad: [],
          rangos_precio: { precio_min: 0, precio_max: 0 }
        });
      } finally {
        setLoading(false);
      }
    };

    cargarOpciones();
  }, []);

  const resetFiltros = () => {
    setSelectedRegion('');
    setSelectedProvincia('');
    setSelectedComuna('');
    setSelectedTipo('');
    setPrecioMin('');
    setPrecioMax('');
  };

  const getFiltrosActuales = () => {
    const filtros = {};
    
    if (selectedRegion) filtros.id_region = selectedRegion;
    if (selectedProvincia) filtros.id_provincia = selectedProvincia;
    if (selectedComuna) filtros.id_comuna = selectedComuna;
    if (selectedTipo) filtros.id_tipo_propiedad = selectedTipo;
    if (precioMin) filtros.precio_min = parseInt(precioMin);
    if (precioMax) filtros.precio_max = parseInt(precioMax);
    
    return filtros;
  };

  // Filtrar provincias por región seleccionada
  const provinciasFiltradas = selectedRegion && opciones?.provincias
    ? opciones.provincias.filter(p => p.idregion == selectedRegion)
    : (opciones?.provincias || []);

  // Filtrar comunas por provincia seleccionada
  const comunasFiltradas = selectedProvincia && opciones?.comunas
    ? opciones.comunas.filter(c => c.idprovincias == selectedProvincia)
    : (opciones?.comunas || []);

  return {
    // Estados
    opciones,
    provincias: provinciasFiltradas,
    comunas: comunasFiltradas,
    selectedRegion,
    selectedProvincia,
    selectedComuna,
    selectedTipo,
    precioMin,
    precioMax,
    loading,
    error,
    
    // Setters
    setSelectedRegion,
    setSelectedProvincia,
    setSelectedComuna,
    setSelectedTipo,
    setPrecioMin,
    setPrecioMax,
    
    // Funciones
    resetFiltros,
    getFiltrosActuales
  };
}; 