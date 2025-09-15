import React from 'react';

const DisponibilidadCaballos = ({ totalSpots = 12, availableSpots = 5, selectedTime }) => {
  // SVG del caballo personalizado
  const HorseIcon = ({ isAvailable, className }) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 2c-1.5 0-2.5 1-2.5 2.5S10.5 7 12 7s2.5-1 2.5-2.5S13.5 2 12 2z"/>
      <path d="M8 4c-1 0-2 .5-2.5 1.5S5 7.5 6 8.5 8.5 10 10 9.5 12 8 12 7s-.5-2-1.5-2.5S8.5 4 8 4z"/>
      <path d="M16 4c1 0 2 .5 2.5 1.5S19 7.5 18 8.5 15.5 10 14 9.5 12 8 12 7s.5-2 1.5-2.5S15.5 4 16 4z"/>
      <path d="M12 7v5"/>
      <path d="M8 12h8"/>
      <path d="M10 12v6l-2 2"/>
      <path d="M14 12v6l2 2"/>
      <path d="M6 14l2-1"/>
      <path d="M18 14l-2-1"/>
    </svg>
  );

  // Generar array de caballos
  const horses = Array.from({ length: totalSpots }, (_, i) => i < availableSpots);

  if (!selectedTime) {
    return null;
  }

  return (
    <div className="horse-availability-container">
      <div className="availability-header">
        <h5>Disponibilidad de Lugares</h5>
        <p className="availability-info">
          {availableSpots} de {totalSpots} lugares disponibles
        </p>
      </div>
      
      <div className="horses-grid">
        {horses.map((isAvailable, index) => (
          <div
            key={index}
            className={`horse-spot ${isAvailable ? 'available' : 'occupied'}`}
            title={isAvailable ? `Lugar ${index + 1} - Disponible` : `Lugar ${index + 1} - Ocupado`}
          >
            <HorseIcon
              isAvailable={isAvailable}
              className={`horse-icon ${
                isAvailable ? 'available-horse' : 'occupied-horse'
              }`}
            />
            <span className="spot-number">{index + 1}</span>
          </div>
        ))}
      </div>
      
      <div className="legend">
        <div className="legend-item">
          <HorseIcon isAvailable={true} className="legend-icon available-horse" />
          <span>Disponible</span>
        </div>
        <div className="legend-item">
          <HorseIcon isAvailable={false} className="legend-icon occupied-horse" />
          <span>Ocupado</span>
        </div>
      </div>
    </div>
  );
};

export default DisponibilidadCaballos;