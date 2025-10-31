import { TimeSlotCard } from './time-slot-card';
import { SCHEDULE_CONFIGS } from './lib/schedule-config';
import { useBookings } from './lib/booking-context';
import { getCurrentWeek, formatDayLabel } from './utils/week';
import { format, addDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { useState } from 'react'
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

  // fecha base para la semana mostrada (permite navegar semanas)
  const [currentDate, setCurrentDate] = useState(new Date())

  // mapear los días configurados a las fechas reales de la semana actualmente seleccionada
  const weekDates = getCurrentWeek(currentDate, 1) // semana empezando el lunes
  const dayNameToDate = {}
  weekDates.forEach(d => {
    // obtener nombre del día con primera letra en mayúscula para coincidir con config.days
    const name = format(d, 'EEEE', { locale: es })
    const cap = name.charAt(0).toUpperCase() + name.slice(1)
    dayNameToDate[cap] = d
  })

  const slotsByDay = config.days.map((day) => ({
    day,
    date: dayNameToDate[day],
    slots: timeSlots.filter((slot) => slot.day === day),
  }));

  return (
    <div className="wc-root">
      {/* Controles de navegación de semana */}
      
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
        {slotsByDay.map(({ day, date, slots }) => (
          <div key={day} className="wc-day">
            {/* Header del día: título, fecha y flechas de navegación por semana */}
            <div className="wc-day-header">
              <button
                className="wc-day-arrow wc-day-arrow--side wc-day-arrow--left"
                aria-label={`Semana anterior ${day}`}
                onClick={() => setCurrentDate((d) => addDays(d, -7))}
              >
                ◀
              </button>

              <div className="wc-day-header-main">
                <h3 className="wc-day-title">{day}</h3>
                {date && (
                  <div className="wc-day-date">{format(date, "d 'de' MMMM", { locale: es })}</div>
                )}
              </div>

              <button
                className="wc-day-arrow wc-day-arrow--side wc-day-arrow--right"
                aria-label={`Semana siguiente ${day}`}
                onClick={() => setCurrentDate((d) => addDays(d, 7))}
              >
                ▶
              </button>
            </div>

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
      
      {userLevel === "Iniciación" && (
        <div className="wc-notes wc-notes--iniciacion">
          <p className="wc-note-text"><span className="wc-note-strong">Nota:</span> Los horarios a partir de las 17:00 están bloqueados para el nivel Iniciación.</p>
        </div>
      )}
    </div>
  );
}