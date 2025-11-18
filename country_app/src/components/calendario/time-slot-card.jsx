
import './css/tieme-slot-card.css'

// Tarjeta de franja horaria: muestra hora, plazas y estado (disponible/reservada/bloqueada).
// Usa clases CSS prefijadas `tsc-` y responde a click/Enter/Space para seleccionar la franja.

export function TimeSlotCard({ time, capacity, bookedCount, isBookedByUser, isBlocked, isWithin2Hours, hasPassed, userStatus, instructoraNombre, motivoCancelacion, onClick }) {
  const isFull = bookedCount >= capacity;
  const availableSpots = capacity - bookedCount;
  const hasSomeBookings = bookedCount > 0 && bookedCount < capacity;

  // Estado visual según el estatus de la reserva del usuario
  let stateClass = isBlocked
    ? 'tsc--blocked'
    : isBookedByUser && (userStatus === 'confirmada' || userStatus === 'pendiente')
    ? 'tsc--booked'
    : isFull
    ? 'tsc--full'
    : hasSomeBookings
    ? 'tsc--partial'
    : 'tsc--available';

  // Si el usuario tiene reserva completada/cancelada, no marcar como reservado
  if (isBookedByUser && (userStatus === 'completada' || userStatus === 'cancelada' || userStatus === 'cancelada_instructor')) {
    if (userStatus === 'completada') {
      stateClass = 'tsc--attended';
    } else if (userStatus === 'cancelada_instructor') {
      stateClass = 'tsc--cancelled-instructor';
    } else {
      stateClass = 'tsc--cancelled';
    }
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
    if (userStatus === 'cancelada_instructor') {
      metaText = (
        <div className="tsc-cancelled-reason">
          <div>Cancelada por instructor</div>
          {motivoCancelacion && <div className="tsc-reason">Motivo: {motivoCancelacion}</div>}
        </div>
      );
    } else if (hasPassed) {
      metaText = 'Clase finalizada';
    } else if (isWithin2Hours) {
      metaText = 'Muy pronto (2h anticipación)';
    } else {
      metaText = 'Bloqueado';
    }
  } else if (isBookedByUser && userStatus === 'completada') {
    metaText = 'Ya asististe';
  } else if (isBookedByUser && userStatus === 'cancelada_instructor') {
    metaText = (
      <div className="tsc-cancelled-reason">
        <div>Cancelada por instructor</div>
        {motivoCancelacion && <div className="tsc-reason">Motivo: {motivoCancelacion}</div>}
      </div>
    );
  } else if (isBookedByUser && userStatus === 'cancelada') {
    metaText = 'Cancelada';
  } else if (isBookedByUser) {
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
          {isBookedByUser && instructoraNombre && (
            <div className="tsc-instructora">Instructora: {instructoraNombre}</div>
          )}
        </div>
      </div>
    </div>
  );
}