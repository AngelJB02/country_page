import { TimeSlotCard } from './time-slot-card';
import { SCHEDULE_CONFIGS_BY_CLASS } from './lib/schedule-config';
// import { useBookings } from './lib/booking-context';
import { getCurrentWeek, formatDayLabel } from './utils/week';
import { format, addDays, isBefore, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { useState } from 'react'
import './css/weekly-calendar.css'


export function WeeklyCalendar({ userLevel, userId, onSlotClick, userBookings = [], allWeekBookings = [], className, claseCupoMax }) {
  // Obtener configuración por clase específica
  const classConfig = SCHEDULE_CONFIGS_BY_CLASS[className];
  
  if (!classConfig) {
    console.warn(`No se encontró configuración para la clase: ${className}`);
    return <div>No hay horarios disponibles para esta clase</div>;
  }
  
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
  
  // Función para obtener los timeSlots correctos según el día
  const getTimeSlotsForDay = (dayName) => {
    const date = dayNameToDate[dayName];
    if (!date) return [];
    
    const dayOfWeek = date.getDay(); // 0 = domingo, 6 = sábado
    
    // Determinar qué configuración usar según el día
    if (classConfig.weekdays && dayOfWeek >= 1 && dayOfWeek <= 5) {
      return classConfig.weekdays.timeSlots;
    } else if (classConfig.saturday && dayOfWeek === 6) {
      return classConfig.saturday.timeSlots;
    } else if (classConfig.sunday && dayOfWeek === 0) {
      return classConfig.sunday.timeSlots;
    } else if (classConfig.weekend && (dayOfWeek === 0 || dayOfWeek === 6)) {
      return classConfig.weekend.timeSlots;
    }
    
    return [];
  };
  
  // Función para obtener la capacidad correcta según el día
  const getCapacityForDay = (dayName) => {
    const date = dayNameToDate[dayName];
    if (!date) return claseCupoMax || 6;
    
    const dayOfWeek = date.getDay();
    
    if (classConfig.weekdays && dayOfWeek >= 1 && dayOfWeek <= 5) {
      return claseCupoMax || classConfig.weekdays.capacity;
    } else if (classConfig.saturday && dayOfWeek === 6) {
      return claseCupoMax || classConfig.saturday.capacity;
    } else if (classConfig.sunday && dayOfWeek === 0) {
      return claseCupoMax || classConfig.sunday.capacity;
    } else if (classConfig.weekend && (dayOfWeek === 0 || dayOfWeek === 6)) {
      return claseCupoMax || classConfig.weekend.capacity;
    }
    
    return claseCupoMax || 6;
  };
  
  // bookings: solo las del usuario, para marcar los slots reservados
  const generateTimeSlots = (day, realDate) => {
    const slots = [];
    const timeSlots = getTimeSlotsForDay(day);
    const capacity = getCapacityForDay(day);
    
    timeSlots.forEach((time) => {
      const slotId = `${day}-${time}`;
      
      // Comparar con fecha exacta (YYYY-MM-DD)
      const slotDateStr = realDate ? format(realDate, 'yyyy-MM-dd') : null;
      
      // Marcar como reservado si hay una reserva dummy o real que coincide
      const slotBookings = userBookings.filter((b) => {
        // Dummy (frontend)
        if (b.timeSlotId && typeof b.timeSlotId === 'string') {
          return b.timeSlotId === slotId;
        }
        // Real (backend): compara fecha exacta, hora y clase
        if (b.fecha && b.hora_inicio && b.clase_nombre && slotDateStr) {
          // Extraer solo la parte de fecha (YYYY-MM-DD) sin conversión de zona horaria
          const reservaDateStr = b.fecha.split('T')[0];
          return (
            reservaDateStr === slotDateStr &&
            b.hora_inicio.slice(0,5) === time &&
            b.clase_nombre === className
          );
        }
        return false;
      });
      
      // Calcular cuántas reservas TOTALES hay para esta clase en esta fecha/hora exacta
      const totalBookingsForSlot = allWeekBookings.filter((b) => {
        if (b.fecha && b.hora_inicio && b.clase_nombre && slotDateStr) {
          // Extraer solo la parte de fecha (YYYY-MM-DD) sin conversión de zona horaria
          const reservaDateStr = b.fecha.split('T')[0];
          return (
            reservaDateStr === slotDateStr &&
            b.hora_inicio.slice(0,5) === time &&
            b.clase_nombre === className
          );
        }
        return false;
      }).length;
      
      const hour = parseInt(time.split(":")[0], 10);
      const isBlocked = userLevel === "Iniciación" && hour >= 17;
      slots.push({
        id: slotId,
        day,
        date: realDate, // AGREGADO: incluir la fecha real del slot
        time,
        capacity,
        bookings: slotBookings,
        totalBooked: totalBookingsForSlot, // Total de reservas (para calcular si está lleno)
        isBlocked,
      });
    });
    return slots;
  };

  // Obtener todos los días únicos de todas las configuraciones de la clase
  const getAllDaysForClass = () => {
    const allDays = new Set();
    if (classConfig.weekdays) classConfig.weekdays.days.forEach(d => allDays.add(d));
    if (classConfig.weekend) classConfig.weekend.days.forEach(d => allDays.add(d));
    if (classConfig.saturday) classConfig.saturday.days.forEach(d => allDays.add(d));
    if (classConfig.sunday) classConfig.sunday.days.forEach(d => allDays.add(d));
    return Array.from(allDays);
  };

  const slotsByDay = getAllDaysForClass().map((day) => {
    const date = dayNameToDate[day];
    const todayStart = startOfDay(new Date());
    const isPast = date ? isBefore(date, todayStart) : false;
    
    return {
      day,
      date,
      slots: generateTimeSlots(day, date).map((slot) => ({
        ...slot,
        isBlocked: Boolean(slot.isBlocked) || isPast,
      })),
    };
  });

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
                const isBookedByUser = slot.bookings.some((b) => b.userId === userId || b.cliente_id === userId);
                return (
                  <TimeSlotCard
                    key={slot.id}
                    time={slot.time}
                    capacity={slot.capacity}
                    bookedCount={slot.totalBooked || slot.bookings.length}
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