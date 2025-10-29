import { TimeSlotCard } from './time-slot-card';
import { SCHEDULE_CONFIGS } from './lib/schedule-config';
import { useBookings } from './lib/booking-context';
import './css/weekly-calendar.css'

export function WeeklyCalendar({ userLevel, userId, onSlotClick }) {
  const config = SCHEDULE_CONFIGS[userLevel];
  // bookings proviene del contexto y contiene todas las reservas actuales.
  // Ejemplo de booking: { id: 'b1', userId: 'user123', userName: 'Juan', timeSlotId: 'Sábado-11:00' }
  const { bookings } = useBookings();
  const generateTimeSlots = () => {
    const slots = [];

    // Recorremos todos los días y franjas horarias configuradas para el nivel
    config.days.forEach((day) => {
      config.timeSlots.forEach((time) => {
        const slotId = `${day}-${time}`;

        // Reservas que pertenecen exactamente a este slot
        const slotBookings = bookings.filter((b) => b.timeSlotId === slotId);

        // Capacidad: prioridad a specialCapacity (ej. ciertos horarios con plazas distintas)
        const capacity = config.specialCapacity?.[time] || config.capacity;

        // Regla de bloqueo: ejemplo simple para nivel "Iniciación" (horas >= 17)
        const hour = parseInt(time.split(":")[0], 10);
        const isBlocked = userLevel === "Iniciación" && hour >= 17;

        slots.push({
          id: slotId,
          day,
          time,
          capacity,
          bookings: slotBookings,
          isBlocked,
        });
      });
    });

    return slots;
  };

  const timeSlots = generateTimeSlots();
  const slotsByDay = config.days.map((day) => ({
    day,
    slots: timeSlots.filter((slot) => slot.day === day),
  }));

  return (
    <div className="wc-root">
      {/* Leyenda: explicación visual rápida de los estados posibles */}
      <div className="wc-legend">
        <div className="wc-legend-item">
          <div className="wc-legend-box wc-legend-box--available"></div>
          <span className="wc-legend-text">Disponible</span>
        </div>
        <div className="wc-legend-item">
          <div className="wc-legend-box wc-legend-box--user"></div>
          <span className="wc-legend-text">Tu reserva</span>
        </div>
        <div className="wc-legend-item">
          <div className="wc-legend-box wc-legend-box--full"></div>
          <span className="wc-legend-text">Completo/Bloqueado</span>
        </div>
      </div>

      {/* Grid del calendario: una columna por día en pantallas grandes, auto-fit en pantallas pequeñas */}
      <div className="wc-grid">
        {slotsByDay.map(({ day, slots }) => (
          <div key={day} className="wc-day">
            {/* Título del día */}
            <h3 className="wc-day-title">{day}</h3>

            {/* Grid de franjas para el día (2 columnas) */}
            <div className="wc-day-grid">
              {slots.map((slot) => {
                // Determina si el slot ya está reservado por este usuario
                const isBookedByUser = slot.bookings.some((b) => b.userId === userId);
                return (
                  <TimeSlotCard
                    key={slot.id}
                    time={slot.time}
                    capacity={slot.capacity}
                    bookedCount={slot.bookings.length}
                    isBookedByUser={isBookedByUser}
                    isBlocked={slot.isBlocked || false}
                    onClick={() => onSlotClick(slot)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Notas informativas condicionales según el nivel del usuario */}
      {userLevel === "Intermedio" && (
        <div className="wc-notes wc-notes--intermedio">
          <p className="wc-note-text"><span className="wc-note-strong">Nota:</span> Los horarios de 10:00, 13:00, 16:00 y 19:00 son clases de "Paseo" con capacidad de 5 plazas.</p>
        </div>
      )}

      {userLevel === "Iniciación" && (
        <div className="wc-notes wc-notes--iniciacion">
          <p className="wc-note-text"><span className="wc-note-strong">Nota:</span> Los horarios a partir de las 17:00 están bloqueados para el nivel Iniciación.</p>
        </div>
      )}
    </div>
  );
}