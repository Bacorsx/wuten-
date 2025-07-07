import React, { useState, useEffect } from 'react';
import { getEnvironmentConfig, isProduction } from '../config/config';
import { propiedadesApi } from '../api/propiedadesApi';

const EnvironmentInfo = ({ show = false }) => {
  const [envInfo, setEnvInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (show) {
      loadEnvironmentInfo();
    }
  }, [show]);

  const loadEnvironmentInfo = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Obtener información del frontend
      const frontendConfig = getEnvironmentConfig();
      
      // Obtener información del backend
      let backendInfo = null;
      try {
        const response = await propiedadesApi.checkEnvironment();
        backendInfo = response.environment;
      } catch (err) {
        console.warn('No se pudo obtener información del backend:', err);
      }
      
      setEnvInfo({
        frontend: frontendConfig,
        backend: backendInfo,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="environment-info">
      <div className="card">
        <div className="card-header">
          <h5>Información del Entorno</h5>
          <button 
            className="btn btn-sm btn-outline-secondary"
            onClick={loadEnvironmentInfo}
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Actualizar'}
          </button>
        </div>
        <div className="card-body">
          {error && (
            <div className="alert alert-danger">
              Error: {error}
            </div>
          )}
          
          {envInfo && (
            <div className="row">
              <div className="col-md-6">
                <h6>Frontend (React)</h6>
                <table className="table table-sm">
                  <tbody>
                    <tr>
                      <td><strong>Entorno:</strong></td>
                      <td>{envInfo.frontend.isProd ? 'Producción' : 'Desarrollo'}</td>
                    </tr>
                    <tr>
                      <td><strong>URL API:</strong></td>
                      <td>{envInfo.frontend.apiUrl}</td>
                    </tr>
                    <tr>
                      <td><strong>Título:</strong></td>
                      <td>{envInfo.frontend.appTitle}</td>
                    </tr>
                    <tr>
                      <td><strong>Versión:</strong></td>
                      <td>{envInfo.frontend.appVersion}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              {envInfo.backend && (
                <div className="col-md-6">
                  <h6>Backend (PHP)</h6>
                  <table className="table table-sm">
                    <tbody>
                      <tr>
                        <td><strong>Entorno:</strong></td>
                        <td>{envInfo.backend.config.app_env}</td>
                      </tr>
                      <tr>
                        <td><strong>Base de Datos:</strong></td>
                        <td>{envInfo.backend.config.db_name}</td>
                      </tr>
                      <tr>
                        <td><strong>Host DB:</strong></td>
                        <td>{envInfo.backend.config.db_host}</td>
                      </tr>
                      <tr>
                        <td><strong>Conexión DB:</strong></td>
                        <td>
                          <span className={`badge ${envInfo.backend.database_connection ? 'bg-success' : 'bg-danger'}`}>
                            {envInfo.backend.database_connection ? 'Conectado' : 'Error'}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td><strong>PHP:</strong></td>
                        <td>{envInfo.backend.server_info.php_version}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          
          <div className="mt-3">
            <small className="text-muted">
              Última actualización: {envInfo?.timestamp || 'Nunca'}
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentInfo; 