import React from 'react';
import ReservaItem from './ReservaItem';

const ReservaList = ({ reservas, updateAsistencia }) => {
  // Agrupar reservas por hora
  const groupReservasByHour = (reservas) => {
    return reservas.reduce((groups, reserva) => {
      const hour = reserva.horario; // se usa 'horario' de la tabla reservas
      if (!groups[hour]) groups[hour] = [];
      groups[hour].push(reserva);
      return groups;
    }, {});
  };

  const grouped = groupReservasByHour(reservas);
  const sortedHours = Object.keys(grouped).sort();

  return (
    <div className="reserva-list">
      {sortedHours.map(hour => (
        <div key={hour} className="reserva-hora-container">
          <div className="reserva-hora-header">
            🕐 {hour} 
            <span className="reserva-hora-count">
              {grouped[hour].length} reserva{grouped[hour].length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="reserva-hora-list">
            {grouped[hour].map(reserva => (
              <ReservaItem key={reserva.id} reserva={reserva} updateAsistencia={updateAsistencia} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReservaList;
