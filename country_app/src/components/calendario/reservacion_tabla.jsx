import React, { useState } from 'react'

// Componente que despliega las reservas del usuario y permite cancelarlas.
export function ReservacionTabla({ userBookings = [], onCancelBooking }) {
  const [confirmBooking, setConfirmBooking] = useState(null);

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
              if (b.fecha && b.hora_inicio) {
                const fechaStr = b.fecha.split('T')[0];
                const [year, month, dayNum] = fechaStr.split('-');
                const fechaObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(dayNum));
                day = fechaObj.toLocaleDateString('es-MX', { weekday: 'long', day: '2-digit', month: '2-digit' });
                time = b.hora_inicio.slice(0,5);
                clase = b.clase_nombre || '';
              }
            }
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
                <div className="mc-booking-left">
                  <span className="mc-booking-day">{day}</span>
                  {statusLabel && (
                    <span className={`mc-booking-status ${statusClass}`}>{statusLabel}</span>
                  )}
                </div>
                <div className="mc-booking-center">
                  <span className="mc-booking-time">{time}</span>
                  {clase && <span className="mc-booking-class">{clase}</span>}
                  {b.instructora_nombre && (
                    <span className="mc-booking-instructor">
                      Instructor: {b.instructora_nombre}{b.instructora_apellido ? ` ${b.instructora_apellido}` : ''}
                    </span>
                  )}
                </div>
                {(b.estatus === 'pendiente' || b.estatus === 'confirmada') && (
                  <button
                    className="mc-booking-cancel"
                    onClick={() => setConfirmBooking({ id: b.id, day, time, clase })}
                    title="Cancelar reserva"
                  >
                    Cancelar
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {/* Modal de confirmación */}
      {confirmBooking && (
        <div className="mc-cancel-overlay" onClick={() => setConfirmBooking(null)}>
          <div className="mc-cancel-modal" onClick={e => e.stopPropagation()}>
            <p className="mc-cancel-title">Cancelar reserva</p>
            <p className="mc-cancel-desc">
              {confirmBooking.day} a las <strong>{confirmBooking.time}</strong>
              {confirmBooking.clase && <> — {confirmBooking.clase}</>}
            </p>
            <p className="mc-cancel-question">¿Estas seguro de que deseas cancelar esta reserva?</p>
            <div className="mc-cancel-actions">
              <button
                className="mc-cancel-btn-no"
                onClick={() => setConfirmBooking(null)}
              >
                No, volver
              </button>
              <button
                className="mc-cancel-btn-yes"
                onClick={() => {
                  onCancelBooking && onCancelBooking(confirmBooking.id);
                  setConfirmBooking(null);
                }}
              >
                Si, cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReservacionTabla
