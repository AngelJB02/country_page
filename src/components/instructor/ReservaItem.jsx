import React from 'react';


const ReservaItem = ({ reserva, updateAsistencia }) => {

  const getEstadoClass = (estado) => {
    switch (estado) {
      case 'confirmada': return 'estado-confirmada';
      case 'pendiente': return 'estado-pendiente';
      case 'cancelada': return 'estado-cancelada';
      default: return 'estado-otro';
    }
  };

  const getAsistenciaClass = (asistencia) => {
    switch (asistencia) {
      case 'asistió': return 'asistio';
      case 'no_asistió': return 'no-asistio';
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
          <p><strong>Actividad:</strong> {reserva.actividad}</p>
        </div>

        {/* Detalles de la reserva */}
        <div>
          <p><strong>📅 Fecha:</strong> {new Date(reserva.fecha).toLocaleDateString('es-ES')}</p>
          <p><strong>🐎 Caballo:</strong> {reserva.caballo || 'Sin asignar'}</p>
          <div className={`estado ${getEstadoClass(reserva.estado)}`}>
            {reserva.estado}
          </div>
        </div>

        {/* Estado de asistencia */}
        <div>
          <p>Estado de Asistencia:</p>
          {reserva.asistencia ? (
            <span className={`asistencia-badge ${getAsistenciaClass(reserva.asistencia)}`}>
              {reserva.asistencia === 'asistió' ? '✅ Asistió' : '❌ No Asistió'}
            </span>
          ) : (
            <span className="asistencia-pendiente">Pendiente de registro</span>
          )}
        </div>
      </div>

      {/* Botones de acción */}
      <div className="reserva-item-buttons">
        <button
          onClick={() => updateAsistencia(reserva.id,'asistió')}
          disabled={reserva.asistencia==='asistió'}
          className="button-asistio"
        >
          ✅ Asistió
        </button>
        <button
          onClick={() => updateAsistencia(reserva.id,'no_asistió')}
          disabled={reserva.asistencia==='no_asistió'}
          className="button-no-asistio"
        >
          ❌ No Asistió
        </button>
      </div>
    </div>
  );
};

export default ReservaItem;
