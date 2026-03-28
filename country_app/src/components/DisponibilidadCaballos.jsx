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
      // Formatear horario a HH:MM:SS
      let horarioParam = selectedTime;
      if (horarioParam && horarioParam.length === 5) {
        horarioParam = horarioParam + ':00';
      }
      const response = await axios.get('http://192.168.1.68:3001/api/reservas/horses-availability', {
        params: { 
          fecha: dateString,
          horario: horarioParam 
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

  // Calcular cuántos caballos están ocupados en total
  const totalOcupados = horses.filter(h => h.ocupado).length;

  // Generar los 11 espacios visuales, ocupados según la cantidad real
  const visualSpaces = Array.from({ length: totalSpots }, (_, i) => ({
    ocupado: i < totalOcupados
  }));

  return (
    <div className="horse-availability-container">
      <div className="availability-header">
        <h5>Disponibilidad de Caballos</h5>
        {loading && <span className="loading-indicator">Cargando...</span>}
      </div>
      <div className="horses-grid">
        {visualSpaces.map((space, index) => (
          <div
            key={index}
            className={`horse-spot ${!space.ocupado ? 'available' : 'occupied'}`}
            title={
              !space.ocupado
                ? `Caballo ${index + 1} - Disponible`
                : `Caballo ${index + 1} - Ocupado`
            }
          >
            <FontAwesomeIcon
              icon={faHorse}
              className={`horse-icon ${!space.ocupado ? 'available-horse' : 'occupied-horse'}`}
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
