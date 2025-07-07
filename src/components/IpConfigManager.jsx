import React, { useState, useEffect } from 'react';
import { getConfigInfo, getBaseUrl } from '../config/ip-config';
import { getIpConfigInfo } from '../config/config';

const IpConfigManager = ({ show = false, onIpChange }) => {
  const [configInfo, setConfigInfo] = useState(null);
  const [newIp, setNewIp] = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (show) {
      loadConfigInfo();
    }
  }, [show]);

  const loadConfigInfo = () => {
    const info = getConfigInfo();
    const ipConfig = getIpConfigInfo();
    setConfigInfo({ ...info, ipConfig });
    setNewIp(ipConfig.aws);
  };

  const handleIpUpdate = () => {
    if (!newIp.trim()) {
      setMessage('Por favor ingresa una IP válida');
      return;
    }

    // Aquí normalmente actualizarías el archivo de configuración
    // Por ahora, solo mostramos un mensaje
    setMessage(`IP actualizada a: ${newIp}. Recuerda actualizar config/ip-config.js`);
    
    // Simular actualización
    setTimeout(() => {
      setMessage('');
      setShowEdit(false);
      loadConfigInfo();
      if (onIpChange) onIpChange(newIp);
    }, 2000);
  };

  const testConnection = async () => {
    try {
      const response = await fetch(`${getBaseUrl()}/heartbeat.php`);
      const data = await response.json();
      setMessage(`✅ Conexión exitosa: ${data.status}`);
    } catch (error) {
      setMessage(`❌ Error de conexión: ${error.message}`);
    }
    
    setTimeout(() => setMessage(''), 3000);
  };

  if (!show) return null;

  return (
    <div className="ip-config-manager">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5>🖥️ Gestor de Configuración de IP</h5>
          <div>
            <button 
              className="btn btn-sm btn-outline-primary me-2"
              onClick={testConnection}
            >
              🔍 Probar Conexión
            </button>
            <button 
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setShowEdit(!showEdit)}
            >
              {showEdit ? '❌ Cancelar' : '✏️ Editar IP'}
            </button>
          </div>
        </div>
        
        <div className="card-body">
          {message && (
            <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-warning'}`}>
              {message}
            </div>
          )}
          
          {configInfo && (
            <div className="row">
              <div className="col-md-6">
                <h6>📊 Información Actual</h6>
                <table className="table table-sm">
                  <tbody>
                    <tr>
                      <td><strong>Entorno:</strong></td>
                      <td>
                        <span className={`badge ${configInfo.environment === 'production' ? 'bg-success' : 'bg-info'}`}>
                          {configInfo.environment}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td><strong>IP Actual:</strong></td>
                      <td>{configInfo.currentIP}</td>
                    </tr>
                    <tr>
                      <td><strong>URL API:</strong></td>
                      <td>
                        <code className="small">{configInfo.apiUrl}</code>
                      </td>
                    </tr>
                    <tr>
                      <td><strong>URL Frontend:</strong></td>
                      <td>
                        <code className="small">{configInfo.frontendUrl}</code>
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Última Actualización:</strong></td>
                      <td>{new Date(configInfo.lastUpdated).toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="col-md-6">
                <h6>⚙️ Configuración de IPs</h6>
                <table className="table table-sm">
                  <tbody>
                    <tr>
                      <td><strong>IP AWS:</strong></td>
                      <td>{configInfo.ipConfig.aws}</td>
                    </tr>
                    <tr>
                      <td><strong>IP Local:</strong></td>
                      <td>{configInfo.ipConfig.local}</td>
                    </tr>
                    <tr>
                      <td><strong>En Desarrollo:</strong></td>
                      <td>
                        <span className={`badge ${configInfo.ipConfig.isDevelopment ? 'bg-success' : 'bg-secondary'}`}>
                          {configInfo.ipConfig.isDevelopment ? 'Sí' : 'No'}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td><strong>En Producción:</strong></td>
                      <td>
                        <span className={`badge ${configInfo.ipConfig.isProduction ? 'bg-success' : 'bg-secondary'}`}>
                          {configInfo.ipConfig.isProduction ? 'Sí' : 'No'}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
                
                {showEdit && (
                  <div className="mt-3">
                    <h6>✏️ Actualizar IP de AWS</h6>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Nueva IP de AWS"
                        value={newIp}
                        onChange={(e) => setNewIp(e.target.value)}
                      />
                      <button 
                        className="btn btn-primary"
                        onClick={handleIpUpdate}
                      >
                        Actualizar
                      </button>
                    </div>
                    <small className="text-muted">
                      Ejemplo: 54.163.209.36
                    </small>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="mt-3">
            <div className="alert alert-info">
              <strong>💡 Instrucciones:</strong>
              <ul className="mb-0 mt-2">
                <li>Para cambiar la IP, edita el archivo <code>config/ip-config.js</code></li>
                <li>Modifica la variable <code>AWS_IP</code> con tu nueva IP</li>
                <li>La aplicación detectará automáticamente el cambio</li>
                <li>Usa "Probar Conexión" para verificar que funcione</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IpConfigManager; 