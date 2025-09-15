import React from 'react';

const Logo = ({ className = "", size = "medium" }) => {
  const sizes = {
    small: { width: "40px", height: "50px", fontSize: "0.8rem" },
    medium: { width: "60px", height: "75px", fontSize: "1.2rem" },
    large: { width: "80px", height: "100px", fontSize: "1.5rem" },
    xlarge: { width: "120px", height: "150px", fontSize: "2rem" }
  };

  const currentSize = sizes[size] || sizes.medium;

  return (
    <div className={`refugio-logo ${className}`} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>

      <img 
        src="/El_refugio_logo.png" 
        alt="Logo El Refugio" 
        style={{
          width: currentSize.width,
          height: currentSize.height,
          objectFit: 'contain'
        }}
      />
      
      <div className="logo-text">
        <h1 style={{ 
          fontFamily: 'var(--font-primary)',
          fontSize: currentSize.fontSize,
          fontWeight: '700',
          color: 'var(--dark-brown)',
          letterSpacing: '2px',
          margin: 0,
          textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
        }}>
          EL REFUGIO
        </h1>
      </div>
    </div>
  );
};

export default Logo;
