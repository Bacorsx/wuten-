import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/error.css';

const Error404 = () => {
  return (
    <div className="error-page">
      <div className="error-container">
        <div className="error-code">404</div>
        <div className="error-message">
          <h1>¡Oops! Página no encontrada</h1>
          <p>La página que buscas no existe o ha sido movida.</p>
          <Link to="/" className="btn-glass">
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Error404; 