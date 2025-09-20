import React from 'react';

const ReservaItem = ({ reserva, updateAsistencia }) => {

  const getEstadoClass = (estado) => {
    switch (estado) {
      case 'confirmada': return 'estado-confirmada';
      case 'pendiente': return 'estado-pendiente';
      case 'cancelada': return 'estado-cancelada';
      default: return '';
    }
  };

  const getAsistenciaClass = (asistencia) => {
    switch (asistencia) {
      case 'asistio': return 'asistio';
      case 'falto': return 'no-asistio';
      case 'pendiente': return 'pendiente';
      case 'cancelar': return 'cancelada';
      default: return '';
    }
  };

  return (
    <div className={`reserva-item ${getAsistenciaClass(reserva.asistencia)}`}>
      <div className="reserva-item-grid">
        {/* Información del cliente */}
        <div>
          <h4 className="reserva-nombre">👤 {reserva.nombre}</h4>
          <p><strong>Edad:</strong> {reserva.edad} años</p>
        </div>

        {/* Detalles de la reserva */}
        <div>
          <p><strong>📅 Fecha:</strong> {(() => {
            const fechaStr = reserva.fecha.split('T')[0];
            const [year, month, day] = fechaStr.split('-');
            return `${day}/${month}/${year}`;
          })()}</p>
          <p><strong>🐎 Caballo:</strong> {reserva.caballo || 'Sin asignar'}</p>
          {/* Mostrando la clase_id */}
          <p><strong>Clase:</strong> {reserva.clase_nombre}</p>
          <div className={`estado ${getEstadoClass(reserva.estado)}`}>
            {reserva.estado}
          </div>
        </div>

        {/* Estado de asistencia */}
        <div>
          <p>Estado de Asistencia:</p>
          <span className={`asistencia-badge ${getAsistenciaClass(reserva.asistencia)}`}>
            { reserva.asistencia === 'asistio' ? '✅ Asistió' :
              reserva.asistencia === 'falto' ? '❌ No Asistió' :
              reserva.asistencia === 'cancelar' ? '🚫 Cancelada' :
             '⏳ Pendiente'}
          </span>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="reserva-item-buttons">
        <button
          onClick={() => updateAsistencia(reserva.id, 'asistio')}
          disabled={reserva.asistencia === 'asistio'}
          className="button-asistio"
        >
          ✅ Asistió
        </button>
        <button
          onClick={() => updateAsistencia(reserva.id, 'falto')}
          disabled={reserva.asistencia === 'falto'}
          className="button-no-asistio"
        >
          ❌ No Asistió
        </button>
                <button
          onClick={() => updateAsistencia(reserva.id, 'cancelar')}
          disabled={reserva.asistencia === 'cancelar'}
          className="button-cancelar"
        >
          🚫 Cancelar clase
        </button>
      </div>
    </div>
  );
};

export default ReservaItem;
