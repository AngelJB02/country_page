import React from 'react';
import ElRefugio from '../img/ElrefugioCountryClub .webp';

const EventBanner = () => {
  return (
    <section className="event-banner">
      <div className="banner-background">
        <img 
          src={ElRefugio} 
          alt="El Refugio - Espacio natural para eventos"
          className="banner-image"
        />
        <div className="banner-overlay"></div>
      </div>
      
      <div className="banner-content">
        <div className="banner-text">
          <h2 className="banner-title">
            Eventos Inolvidables en un Entorno Natural
          </h2>
          <p className="banner-description">
            Organiza tu evento especial en nuestro refugio, rodeado de naturaleza y aire puro. 
            Ideal para bodas, celebraciones familiares, retiros empresariales y momentos únicos 
            que merecen un espacio especial.
          </p>
          <div className="banner-features">
            <div className="feature-item">
              <span className="feature-icon">🌿</span>
              <span>Ambiente natural</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🏡</span>
              <span>Espacios amplios</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🌄</span>
              <span>Vista panorámica</span>
            </div>
          </div>
          <button className="banner-cta" onClick={() => {
            document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' });
          }}>
            Planifica tu Evento
          </button>
        </div>
      </div>
    </section>
  );
};

export default EventBanner;
