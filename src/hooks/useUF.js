import { useState, useEffect } from 'react';
import { propiedadesApi } from '../api/propiedadesApi';

export const useUF = () => {
  const [uf, setUf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUF = async () => {
      try {
        setLoading(true);
        const ufData = await propiedadesApi.getUF();
        setUf(ufData);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching UF:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUF();
  }, []);

  const convertirPesosAUF = (pesos) => {
    if (!uf) return 0;
    return (pesos / uf.valor).toFixed(2);
  };

  const convertirUFPesos = (ufValue) => {
    if (!uf) return 0;
    return Math.round(ufValue * uf.valor);
  };

  return {
    uf,
    loading,
    error,
    convertirPesosAUF,
    convertirUFPesos
  };
}; 