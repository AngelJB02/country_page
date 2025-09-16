import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHorse } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import '../CSS/DisponibilidadCaballos.css';

const DisponibilidadCaballos = ({ selectedTime, selectedDate }) => {
  const [horses, setHorses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Obtener disponibilidad de caballos cuando cambia la fecha o el horario seleccionado
  useEffect(() => {
    if (selectedDate && selectedTime) {
      fetchHorsesAvailability();
    }
  }, [selectedDate, selectedTime]);

  // Consultar al backend la disponibilidad de caballos
  const fetchHorsesAvailability = async () => {
    setLoading(true);
    try {
      const dateString = selectedDate.toISOString().split('T')[0];
      const response = await axios.get(
        'https://country-page.onrender.com/api/reservas/horses-availability',
        {
          params: {
            fecha: dateString,
            horario: selectedTime,
          },
        }
      );

      // Guardamos directamente el array de caballos del backend
      setHorses(response.data.horses || []);
    } catch (error) {
      console.error('❌ Error obteniendo disponibilidad de caballos:', error);
      setHorses([]); // fallback vacío
    } finally {
      setLoading(false);
    }
  };

  if (!selectedTime) {
    return null;
  }

  return (
    <div className="horse-availability-container">
      <div className="availability-header">
        <h5>Disponibilidad de Caballos</h5>
        {loading && <span className="loading-indicator">Cargando...</span>}
      </div>

      <div className="horses-grid">
        {horses.map((horse) => (
          <div
            key={horse.id}
            className={`horse-spot ${horse.ocupado ? 'occupied' : 'available'}`}
            title={
              horse.ocupado
                ? `${horse.nombre || 'Caballo'} - Ocupado`
                : `${horse.nombre || 'Caballo'} - Disponible`
            }
          >
            <FontAwesomeIcon
              icon={faHorse}
              className={`horse-icon ${horse.ocupado ? 'occupied-horse' : 'available-horse'}`}
            />
            <span className="spot-number">{horse.nombre || `#${horse.id}`}</span>
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
