
import './css/tieme-slot-card.css'

// Tarjeta de franja horaria: muestra hora, plazas y estado (disponible/reservada/bloqueada).
// Usa clases CSS prefijadas `tsc-` y responde a click/Enter/Space para seleccionar la franja.

export function TimeSlotCard({ time, capacity, bookedCount, isBookedByUser, isBlocked, isWithin2Hours, hasPassed, userStatus, instructoraNombre, motivoCancelacion, onClick }) {
  const isFull = bookedCount >= capacity;
  const availableSpots = capacity - bookedCount;
  const hasSomeBookings = bookedCount > 0 && bookedCount < capacity;
  
  // ⚠️ IMPORTANTE: userStatus indica si el USUARIO tiene una reserva en este slot
  // Si userStatus es 'confirmada' o 'pendiente', significa que el usuario tiene reserva
  const userHasBooking = userStatus === 'confirmada' || userStatus === 'pendiente';

  // Estado visual según el estatus de la reserva del usuario
  // PRIORIDAD: Si userStatus indica que el usuario tiene reserva, mostrar como 'booked' independientemente de isBookedByUser
  let stateClass = isBlocked
    ? 'tsc--blocked'
    : userHasBooking
    ? 'tsc--booked'
    : isFull
    ? 'tsc--full'
    : hasSomeBookings
    ? 'tsc--partial'
    : 'tsc--available';

  // Si el usuario tiene reserva completada, mostrar estado especial
  // Las canceladas (incluyendo cancelada_instructor) ya no se muestran como reservadas
  if (isBookedByUser && userStatus === 'completada') {
    stateClass = 'tsc--attended';
  }

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !isBlocked && !isFull) {
      e.preventDefault();
      onClick && onClick();
    }
  };

  let metaText = null;
  if (isBlocked) {
    // Mensaje específico según el tipo de bloqueo
    if (hasPassed) {
      metaText = 'Clase finalizada';
    } else if (isWithin2Hours) {
      metaText = 'Muy pronto (2h anticipación)';
    } else {
      metaText = 'Bloqueado';
    }
  } else if (userStatus === 'completada') {
    metaText = 'Ya asististe';
  } else if (userHasBooking) {
    metaText = 'Tu reserva';
  } else if (isFull) {
    metaText = 'Completo';
  } else {
    metaText = <span className="tsc-available-text">{availableSpots} {availableSpots === 1 ? "plaza" : "plazas"}</span>;
  }

  return (
    <div
      className={`tsc-card ${stateClass}`}
      onClick={!isBlocked && !isFull ? onClick : undefined}
      onKeyDown={!isBlocked && !isFull ? handleKeyDown : undefined}
      role={!isBlocked && !isFull ? 'button' : undefined}
      tabIndex={!isBlocked && !isFull ? 0 : -1}
    >
      <div className="tsc-inner">
        <div className="tsc-time">{time}</div>

        <div className="tsc-horses">
          {Array.from({ length: capacity }).map((_, index) => (
            <span
              key={index}
              className={`tsc-horse ${index < bookedCount ? 'tsc-horse--filled' : 'tsc-horse--empty'}`}
              title={index < bookedCount ? "Reservado" : "Disponible"}
            >
              🐴
            </span>
          ))}
        </div>

        <div className="tsc-meta">
          {metaText}
          {userHasBooking && instructoraNombre && (
            <div className="tsc-instructora">Instructora: {instructoraNombre}</div>
          )}
        </div>
      </div>
    </div>
  );
}