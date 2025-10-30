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
          {userBookings.map((b) => {
            const [day, time] = b.timeSlotId.split('-');
            return (
              <li key={b.id} className="mc-booking-item">
                <div className="mc-booking-info">
                  <span className="mc-booking-day">{day}</span>
                  <span className="mc-booking-time">{time}</span>
                </div>
                <button
                  className="mc-booking-cancel"
                  onClick={() => onCancelBooking && onCancelBooking(b.id)}
                >
                  Cancelar
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default ReservacionTabla
