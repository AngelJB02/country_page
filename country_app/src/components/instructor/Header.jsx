import React from 'react';


const Header = ({ logoutComponent }) => (
  <div style={{ 
    background: 'var(--warm-white)',
    backdropFilter: 'blur(10px)', 
    padding: '2rem', 
    borderRadius: 'var(--radius-xl)', 
    boxShadow: 'var(--medium-shadow)', 
    marginBottom: '2rem', 
    border: '2px solid rgba(255,255,255,0.3)',
    position: 'relative'
  }}>
    
    {/* Botón de logout arriba a la derecha */}
    <div style={{
      position: 'absolute',
      top: '1rem',
      right: '1rem'
    }}>
      {logoutComponent}
    </div>

    <h1 style={{ 
      color: 'var(--primary-brown)', 
      fontSize: '2.5rem', 
      fontWeight: '700', 
      textAlign: 'center', 
      marginBottom: '1rem', 
      fontFamily: 'var(--font-primary)' 
    }}>
      📋 Gestión de Reservas
    </h1>

    <p style={{ 
      textAlign: 'center', 
      color: 'var(--charcoal)', 
      fontSize: '1.1rem', 
      opacity: '0.8'
    }}>
      Revisa y gestiona la asistencia de tus clientes
    </p>
  </div>
);

export default Header;
