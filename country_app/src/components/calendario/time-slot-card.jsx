
import './css/tieme-slot-card.css'

// Tarjeta de franja horaria: muestra hora, plazas y estado (disponible/reservada/bloqueada).
// Usa clases CSS prefijadas `tsc-` y responde a click/Enter/Space para seleccionar la franja.

export function TimeSlotCard({ time, capacity, bookedCount, isBookedByUser, isBlocked, onClick }) {
  const isFull = bookedCount >= capacity;
  const availableSpots = capacity - bookedCount;

  // Nuevo: si hay reservas (pero no estás tú) aplicamos un estado 'partial' para cambiar color
  const hasSomeBookings = bookedCount > 0 && bookedCount < capacity;

  const stateClass = isBlocked
    ? 'tsc--blocked'
    : isBookedByUser
    ? 'tsc--booked' // tu reserva
    : isFull
    ? 'tsc--full' // completo
    : hasSomeBookings
    ? 'tsc--partial' // parcialmente reservado (otros usuarios)
    : 'tsc--available';

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !isBlocked && !isFull) {
      e.preventDefault();
      onClick && onClick();
    }
  };

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
          {isBlocked ? (
            "Bloqueado"
          ) : isBookedByUser ? (
            "Tu reserva"
          ) : isFull ? (
            "Completo"
          ) : (
            <span className="tsc-available-text">
              {availableSpots} {availableSpots === 1 ? "plaza" : "plazas"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}