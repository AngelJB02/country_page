import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHorse } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import '../CSS/DisponibilidadCaballos.css';

const DisponibilidadCaballos = ({ totalSpots = 11, reservations = [], selectedTime, selectedDate }) => {
  const [horsesAvailability, setHorsesAvailability] = useState([]);
  const [loading, setLoading] = useState(false);

  // Obtener disponibilidad de caballos cuando cambia la fecha o el horario seleccionado
  useEffect(() => {
    if (selectedDate && selectedTime) {
      fetchHorsesAvailability();
    }
  }, [selectedDate, selectedTime]);

  // Consultar al backend las reservas de caballos para una fecha específica
  const fetchHorsesAvailability = async () => {
    setLoading(true);
    try {
      const dateString = selectedDate.toISOString().split('T')[0];
      const response = await axios.get('https://country-page.onrender.com/api/reservas/horses-availability', {
        params: { 
          fecha: dateString,
          horario: selectedTime 
        }
      });
      
      // Procesar la respuesta para generar el array de disponibilidad
      const availability = Array.from({ length: totalSpots }, (_, index) => {
        const caballoId = index + 1;
        const isOccupied = response.data.occupied_horses.includes(caballoId);
        return !isOccupied; // true = disponible, false = ocupado
      });
      
      setHorsesAvailability(availability);
    } catch (error) {
      console.error('Error obteniendo disponibilidad de caballos:', error);
      // Fallback: usar lógica anterior basada en reservations prop
      const fallbackAvailability = Array.from({ length: totalSpots }, (_, i) => 
        i >= reservations.length
      );
      setHorsesAvailability(fallbackAvailability);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedTime) {
    return null;
  }

  // Usar la disponibilidad obtenida del backend o fallback
  const horses = horsesAvailability.length > 0 ? horsesAvailability : 
    Array.from({ length: totalSpots }, (_, i) => i >= reservations.length);

  return (
    <div className="horse-availability-container">
      <div className="availability-header">
        <h5>Disponibilidad de Caballos</h5>
        {loading && <span className="loading-indicator">Cargando...</span>}
      </div>
      <div className="horses-grid">
        {horses.map((isAvailable, index) => (
          <div
            key={index}
            className={`horse-spot ${isAvailable ? 'available' : 'occupied'}`}
            title={isAvailable ? `Caballo ${index + 1} - Disponible` : `Caballo ${index + 1} - Ocupado`}
          >
            <FontAwesomeIcon
              icon={faHorse}
              className={`horse-icon ${isAvailable ? 'available-horse' : 'occupied-horse'}`}
            />
            <span className="spot-number">{index + 1}</span>
          </div>
        ))}
      </div>
      <div className="legend">
        <div className="legend-item">
          <FontAwesomeIcon icon={faHorse} className="legend-icon available-horse" />
          <span>Disponible</span>
        </div>
        <div className="legend-item">
          <FontAwesomeIcon icon={faHorse} className="legend-icon occupied-horse" />
          <span>Ocupado</span>
        </div>
      </div>
    </div>
  );
};

export default DisponibilidadCaballos;