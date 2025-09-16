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
      
      // El backend ahora devuelve todos los caballos con ocupado: true/false
      const horses = response.data.horses || [];
      setHorsesAvailability(horses);

    } catch (error) {
      console.error('Error obteniendo disponibilidad de caballos:', error);

      // Fallback: usar lógica anterior basada en reservations prop
      const fallbackAvailability = Array.from({ length: totalSpots }, (_, i) => ({
        id: i + 1,
        ocupado: i < reservations.length // ocupado si está reservado
      }));
      setHorsesAvailability(fallbackAvailability);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedTime) {
    return null;
  }

  // Usar SIEMPRE la respuesta del backend si selectedDate y selectedTime existen
  let horses = [];
  if (selectedDate && selectedTime) {
    if (horsesAvailability.length > 0) {
      horses = horsesAvailability;
    } else {
      // Si el backend no responde, fallback
      horses = Array.from({ length: totalSpots }, (_, i) => ({ id: i + 1, ocupado: false }));
    }
  }

  return (
    <div className="horse-availability-container">
      <div className="availability-header">
        <h5>Disponibilidad de Caballos</h5>
        {loading && <span className="loading-indicator">Cargando...</span>}
      </div>
      <div className="horses-grid">
        {horses.map((horse, index) => (
          <div
            key={horse.id || index}
            className={`horse-spot ${!horse.ocupado ? 'available' : 'occupied'}`}
            title={
              !horse.ocupado
                ? `Caballo ${horse.nombre ? horse.nombre : index + 1} - Disponible`
                : `Caballo ${horse.nombre ? horse.nombre : index + 1} - Ocupado`
            }
          >
            <FontAwesomeIcon
              icon={faHorse}
              className={`horse-icon ${!horse.ocupado ? 'available-horse' : 'occupied-horse'}`}
            />
            <span className="spot-number">{horse.nombre ? horse.nombre : index + 1}</span>
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
