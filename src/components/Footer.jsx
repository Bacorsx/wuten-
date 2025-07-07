import React from 'react';
import { config } from '../config/config';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h4>{config.APP_TITLE}</h4>
            <p>Tu plataforma inmobiliaria de confianza</p>
          </div>
          
          <div className="footer-section">
            <h4>Enlaces Útiles</h4>
            <ul>
              <li><a href="/">Inicio</a></li>
              <li><a href="/propiedades">Propiedades</a></li>
              <li><a href="/contacto">Contacto</a></li>
              <li><a href="/ayuda">Ayuda</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Contacto</h4>
            <ul>
              <li>Email: info@wuten.cl</li>
              <li>Teléfono: +56 2 2345 6789</li>
              <li>Dirección: Santiago, Chile</li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Síguenos</h4>
            <div className="social-links">
              <a href="#" aria-label="Facebook">Facebook</a>
              <a href="#" aria-label="Twitter">Twitter</a>
              <a href="#" aria-label="Instagram">Instagram</a>
              <a href="#" aria-label="LinkedIn">LinkedIn</a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {currentYear} {config.APP_TITLE}. Todos los derechos reservados.</p>
          <p>Versión {config.APP_VERSION}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 