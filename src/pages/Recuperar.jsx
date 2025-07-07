import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/recovery.css';

const Recuperar = () => {
  const [email, setEmail] = useState('');
  const [showModal1, setShowModal1] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(120); // 2 minutos en segundos
  const [newPassword1, setNewPassword1] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [passwordError1, setPasswordError1] = useState('');
  const [passwordError2, setPasswordError2] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    let interval = null;
    if (showModal1 && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setShowModal1(false);
      setShowModal2(false);
      alert('Tiempo expirado. Por favor, intente nuevamente.');
    }
    return () => clearInterval(interval);
  }, [showModal1, timer]);

  const validarContraseña = (contraseña) => {
    if (contraseña.length < 8) {
      return "La contraseña debe tener al menos 8 caracteres.";
    }
    if (!/[A-Z]/.test(contraseña)) {
      return "La contraseña debe contener al menos una letra mayúscula.";
    }
    if (!/[a-z]/.test(contraseña)) {
      return "La contraseña debe contener al menos una letra minúscula.";
    }
    if (!/[^a-zA-Z0-9\s]/.test(contraseña)) {
      return "La contraseña debe contener al menos un carácter especial (ej: !, @, #, $, %).";
    }
    return null;
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      alert('Por favor, ingrese un email válido.');
      return;
    }
    setShowModal1(true);
    setTimer(120);
  };

  const handleCodeChange = (index, value) => {
    if (value.length <= 1) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      
      // Auto-focus al siguiente input
      if (value && index < 5) {
        const nextInput = document.getElementById(`code${index + 2}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleVerifyCode = () => {
    const codeString = code.join('');
    if (codeString.length !== 6) {
      alert('Por favor, complete el código de 6 dígitos.');
      return;
    }
    
    // Aquí iría la validación del código con el backend
    // Por ahora simulamos que es correcto
    setShowModal1(false);
    setShowModal2(true);
  };

  const handlePasswordChange = () => {
    const mensajeValidacion1 = validarContraseña(newPassword1);
    const mensajeValidacion2 = validarContraseña(newPassword2);

    setPasswordError1(mensajeValidacion1 || '');
    setPasswordError2(mensajeValidacion2 || '');

    if (mensajeValidacion1 || mensajeValidacion2) {
      return;
    }

    if (newPassword1 !== newPassword2) {
      setPasswordError2("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    
    // Aquí iría la lógica para guardar la nueva contraseña
    setTimeout(() => {
      alert("Contraseña actualizada correctamente.");
      setLoading(false);
      navigate('/login');
    }, 1000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="recovery-container">
      <div className="container">
        <h2>Recuperación de Contraseña</h2>
        
        <form onSubmit={handleEmailSubmit}>
          <label htmlFor="email">Ingresa tu correo electrónico:</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            placeholder="Correo electrónico" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
          <br />
          <button type="submit" className="btn-send-code">
            Enviar código
          </button>
        </form>

        {/* Modal 1 - Código de verificación */}
        {showModal1 && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-content">
                <button 
                  className="closeModal" 
                  onClick={() => setShowModal1(false)}
                >
                  X
                </button>
                
                <label htmlFor="code">Ingresa el código de 6 dígitos:</label>
                <div className="code-inputs">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength="1"
                      id={`code${index + 1}`}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      required
                    />
                  ))}
                </div>

                <div className="timer">
                  Tiempo restante: <span>{formatTime(timer)}</span>
                </div>

                <button 
                  className="btn-verify-code" 
                  onClick={handleVerifyCode}
                >
                  Verificar código
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal 2 - Nueva contraseña */}
        {showModal2 && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-content">
                <button 
                  className="closeModal" 
                  onClick={() => setShowModal2(false)}
                >
                  X
                </button>
                
                <label htmlFor="newPassword1">Crear Contraseña:</label>
                <div className="modal2-inputs">
                  <input
                    type="password"
                    minLength="8"
                    maxLength="16"
                    id="newPassword1"
                    name="newPassword1"
                    placeholder="Nueva Contraseña"
                    value={newPassword1}
                    onChange={(e) => setNewPassword1(e.target.value)}
                    required
                  />
                  {passwordError1 && (
                    <p className="error-message">{passwordError1}</p>
                  )}
                  
                  <input
                    type="password"
                    minLength="8"
                    maxLength="16"
                    id="newPassword2"
                    name="newPassword2"
                    placeholder="Confirmar Contraseña"
                    value={newPassword2}
                    onChange={(e) => setNewPassword2(e.target.value)}
                    required
                  />
                  {passwordError2 && (
                    <p className="error-message">{passwordError2}</p>
                  )}
                  
                  <button 
                    className="btn-create-password"
                    onClick={handlePasswordChange}
                    disabled={loading}
                  >
                    {loading ? 'Creando...' : 'Crear'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recuperar; 