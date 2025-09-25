import React from 'react';

const AboutSection = () => {
  return (
    <section id="nosotros" className="about-section">
      <div className="container">
        <div className="section-header">
          <h2>Sobre El Refugio</h2>
          <p>
            Un espacio único donde la naturaleza y la elegancia se encuentran para crear 
            momentos inolvidables en tus celebraciones más importantes.
          </p>
        </div>
        
        <div className="about-content">
          <div className="about-intro-card">
            <p className="about-intro">
              En El Refugio, cada evento se convierte en una experiencia única. 
              Nuestro espacio combina la tranquilidad del entorno natural con 
              instalaciones modernas y elegantes, creando el ambiente perfecto 
              para cualquier celebración especial.
            </p>
          </div>
          
          <div className="about-features">
            <div className="feature">
              <div className="feature-icon">🌿</div>
              <h3>Entorno Natural</h3>
              <p>Rodeado de vegetación y paisajes que brindan un ambiente de paz y tranquilidad, perfecto para desconectar y disfrutar.</p>
            </div>
            
            <div className="feature">
              <div className="feature-icon">🏡</div>
              <h3>Instalaciones Completas</h3>
              <p>Espacios versátiles y bien equipados para todo tipo de eventos, con comodidades modernas en un entorno rústico.</p>
            </div>
            
            <div className="feature">
              <div className="feature-icon">👥</div>
              <h3>Servicio Personalizado</h3>
              <p>Atención dedicada y personalizada para hacer realidad la celebración de tus sueños, cuidando cada detalle.</p>
            </div>
          </div>
          
          <div className="stats-container">
            <div className="stats">
              <div className="stat">
                <h4>10+</h4>
                <p>Eventos realizados</p>
              </div>
              <div className="stat">
                <h4>5</h4>
                <p>Años de experiencia</p>
              </div>
              <div className="stat">
                <h4>1500+</h4>
                <p>Capacidad máxima en Jardin</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
