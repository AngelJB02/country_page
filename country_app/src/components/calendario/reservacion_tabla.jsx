import React from 'react'

// Componente que despliega las reservas del usuario y permite cancelarlas.
export function ReservacionTabla({ userBookings = [], onCancelBooking }) {
  return (
    <div className="mc-user-bookings">
      <h3 className="mc-section-title">Tus reservas</h3>
      {userBookings.length === 0 ? (
        <p className="mc-no-bookings">No tienes reservas.</p>
      ) : (
        <ul className="mc-bookings-list">
          {userBookings.filter(
            b => b.estatus !== 'cancelada' || b.estatus === 'cancelada_instructor'
          ).map((b) => {
            let day = '', time = '', clase = '';
            if (typeof b.timeSlotId === 'string' && b.timeSlotId.includes('-')) {
              [day, time] = b.timeSlotId.split('-');
              clase = b.clase_nombre || '';
            } else {
              // Reserva real del backend
              if (b.fecha && b.hora_inicio) {
                // Extraer fecha sin conversión de zona horaria
                const fechaStr = b.fecha.split('T')[0]; // YYYY-MM-DD
                const [year, month, dayNum] = fechaStr.split('-');
                const fechaObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(dayNum));
                day = fechaObj.toLocaleDateString('es-MX', { weekday: 'long', day: '2-digit', month: '2-digit' });
                time = b.hora_inicio.slice(0,5);
                clase = b.clase_nombre || '';
              }
            }
            // Mostrar estatus visualmente
            let statusLabel = '';
            let statusClass = '';
            if (b.estatus === 'completada') {
              statusLabel = 'Completada';
              statusClass = 'mc-booking-status-completada';
            } else if (b.estatus === 'confirmada') {
              statusLabel = 'Confirmada';
              statusClass = 'mc-booking-status-confirmada';
            } else if (b.estatus === 'pendiente') {
              statusLabel = 'Pendiente';
              statusClass = 'mc-booking-status-pendiente';
            } else if (b.estatus === 'cancelada_instructor') {
              statusLabel = 'Cancelada por instructor';
              statusClass = 'mc-booking-status-cancelada-instructor';
            }
            
            return (
              <li key={b.id} className="mc-booking-item">
                <div className="mc-booking-info">
                  <span className="mc-booking-day">{day}</span>
                  <span className="mc-booking-time">🕐 {time}</span>
                  {clase && <span className="mc-booking-class">📚 {clase}</span>}
                  {statusLabel && (
                    <span className={`mc-booking-status ${statusClass}`}>{statusLabel}</span>
                  )}
                </div>
                {(b.estatus === 'pendiente' || b.estatus === 'confirmada') && (
                  <button
                    className="mc-booking-cancel"
                    onClick={() => onCancelBooking && onCancelBooking(b.id)}
                    title="Cancelar reserva"
                  >
                    ✕ Cancelar
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default ReservacionTabla
