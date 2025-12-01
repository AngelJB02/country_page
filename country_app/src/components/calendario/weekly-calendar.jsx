import { TimeSlotCard } from './time-slot-card';
// import { useBookings } from './lib/booking-context';
import { getCurrentWeek, formatDayLabel } from './utils/week';
import { format, addDays, isBefore, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { useState, useEffect, useRef } from 'react'
import './css/weekly-calendar.css'
import { DateTime } from 'luxon'

// Función helper para obtener fecha en formato YYYY-MM-DD sin problemas de zona horaria
const getDateString = (date) => {
  if (!date) return null;
  // Si es un objeto Date, extraer año, mes y día directamente sin conversiones de zona horaria
  if (date instanceof Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  // Si ya es un string, devolverlo
  if (typeof date === 'string') {
    return date.split('T')[0];
  }
  return null;
};


export function WeeklyCalendar({ userLevel, userId, userType, onSlotClick, userBookings = [], allWeekBookings = [], className, claseCupoMax, claseId, onWeekChange }) {
  // ⚠️ IMPORTANTE: Todos los hooks deben estar al inicio, antes de cualquier return condicional
  
  // Estados para horarios dinámicos desde la base de datos
  const [dynamicSchedule, setDynamicSchedule] = useState(null);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [scheduleError, setScheduleError] = useState(null);
  
  // fecha base para la semana mostrada (permite navegar semanas)
  const [currentDate, setCurrentDate] = useState(new Date());
  const lastWeekRef = useRef(null);
  
  // Cargar horarios desde la base de datos
  useEffect(() => {
    const fetchSchedule = async () => {
      if (!className) {
        setScheduleError('No se especificó clase');
        setLoadingSchedule(false);
        return;
      }
      
      try {
        setLoadingSchedule(true);
        const response = await fetch(`http://localhost:3001/api/horarios/clase/${className}`);
        if (!response.ok) {
          throw new Error('Error al cargar horarios desde la base de datos');
        }
        const data = await response.json();
        setDynamicSchedule(data);
        setScheduleError(null);
      } catch (error) {
        console.error('Error cargando horarios:', error);
        setScheduleError(error.message);
        setDynamicSchedule(null);
      } finally {
        setLoadingSchedule(false);
      }
    };
    
    fetchSchedule();
  }, [className]);
  
  // Notificar cuando cambie la semana
  useEffect(() => {
    if (onWeekChange) {
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Lunes
      weekStart.setHours(12, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6); // Domingo
      weekEnd.setHours(12, 0, 0, 0);
      
      // Solo llamar si la semana cambió
      const weekKey = `${weekStart.getTime()}-${weekEnd.getTime()}`;
      if (lastWeekRef.current !== weekKey) {
        lastWeekRef.current = weekKey;
        onWeekChange(weekStart, weekEnd);
      }
    }
  }, [currentDate, onWeekChange]);

  // Ya no necesitamos cargar capacidades ajustadas por fecha
  // El endpoint /api/horarios/clase ya devuelve la capacidad ajustada según descansos fijos
  
  // Renders condicionales DESPUÉS de todos los hooks
  if (loadingSchedule) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div>Cargando horarios...</div>
      </div>
    );
  }
  
  if (!dynamicSchedule || !dynamicSchedule.horarios) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#d32f2f' }}>
        <div>No se pudieron cargar los horarios desde la base de datos.</div>
        {scheduleError && <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>{scheduleError}</div>}
      </div>
    );
  }

  // mapear los días configurados a las fechas reales de la semana actualmente seleccionada
  const weekDates = getCurrentWeek(currentDate, 1) // semana empezando el lunes
  const dayNameToDate = {}
  weekDates.forEach(d => {
    // obtener nombre del día con primera letra en mayúscula para coincidir con config.days
    const name = format(d, 'EEEE', { locale: es })
    const cap = name.charAt(0).toUpperCase() + name.slice(1)
    dayNameToDate[cap] = d
  })
  
  // Función para obtener los timeSlots correctos según el día (desde DB)
  const getTimeSlotsForDay = (dayName) => {
    const date = dayNameToDate[dayName];
    if (!date) return [];
    
    // Obtener horarios desde la BD
    const horariosDelDia = dynamicSchedule.horarios[dayName];
    if (horariosDelDia && Array.isArray(horariosDelDia)) {
      return horariosDelDia.map(h => h.hora_inicio);
    }
    
    return [];
  };
  
  // Función para obtener la capacidad correcta según el día y hora específica (desde DB)
  // La capacidad ya viene ajustada desde el backend según descansos fijos
  const getCapacityForSlot = (dayName, time, realDate) => {
    if (!dayNameToDate[dayName]) return claseCupoMax || 6;
    
    // Obtener capacidad desde la BD (ya viene ajustada para iniciación según descansos)
    const horariosDelDia = dynamicSchedule.horarios[dayName];
    if (horariosDelDia && Array.isArray(horariosDelDia)) {
      const horario = horariosDelDia.find(h => h.hora_inicio === time);
      if (horario && horario.capacidad) {
        return horario.capacidad; // Esta capacidad ya está ajustada para iniciación
      }
    }
    
    // Fallback a cupo máximo de la clase o 6
    return claseCupoMax || 6;
  };
  
  // bookings: solo las del usuario, para marcar los slots reservados
  const generateTimeSlots = (day, realDate) => {
    const slots = [];
    const timeSlots = getTimeSlotsForDay(day);
    const now = DateTime.now().setZone('America/Cancun');
    
    timeSlots.forEach((time) => {
      const slotId = `${day}-${time}`;
      // Usar función helper para evitar problemas de zona horaria
      const slotDateStr = getDateString(realDate);
      
      // Obtener capacidad específica para este slot (ajustada para iniciación)
      const capacity = getCapacityForSlot(day, time, realDate);
      
      // Calcular la hora de inicio del slot usando Luxon con zona horaria de Cancún
      const [hours, minutes] = time.split(':').map(Number);
      const slotStartTime = DateTime.fromJSDate(realDate)
        .setZone('America/Cancun')
        .set({ hour: hours, minute: minutes, second: 0, millisecond: 0 });
      
      // Calcular duración de la clase (desde BD)
      const classDuration = dynamicSchedule.duracion || 60;
      const slotEndTime = slotStartTime.plus({ minutes: classDuration });
      
      // 🕐 FILTRO 1: Detectar si el slot ya pasó completamente
      const hasPassed = slotEndTime < now;
      
      // ⏰ FILTRO 2: Calcular si está dentro de las próximas 2 horas o ya está en curso
      const hoursUntilSlot = slotStartTime.diff(now, 'hours').hours;
      // Bloquear si faltan menos de 2 horas O si la hora de inicio ya pasó (incluso si aún no termina)
      const isWithin2Hours = hoursUntilSlot < 2;

      // Filtrar reservas del usuario para este slot (ocupado si no está cancelada o cancelada por instructor)
      const slotBookings = userBookings.filter((b) => {
        // Excluir reservas canceladas (tanto por cliente como por instructor)
        if (b.estatus === 'cancelada' || b.estatus === 'cancelada_instructor') {
          return false;
        }
        if (b.timeSlotId && typeof b.timeSlotId === 'string') {
          return b.timeSlotId === slotId;
        }
        if (b.fecha && b.hora_inicio && b.clase_nombre && slotDateStr) {
          const reservaDateStr = b.fecha.split('T')[0];
          return (
            reservaDateStr === slotDateStr &&
            b.hora_inicio.slice(0,5) === time &&
            b.clase_nombre === className
          );
        }
        return false;
      });

      // Calcular reservas TOTALES ocupadas (solo 'pendiente' y 'confirmada') para el slot, ignorando las demás
      const totalBookingsForSlot = allWeekBookings.filter((b) => {
        if (b.fecha && b.hora_inicio && b.clase_nombre && slotDateStr) {
          const reservaDateStr = b.fecha.split('T')[0];
          const matchesSlot = (
            reservaDateStr === slotDateStr &&
            b.hora_inicio.slice(0,5) === time &&
            b.clase_nombre === className
          );
          const esEstatusValido = (b.estatus === 'pendiente' || b.estatus === 'confirmada');
          
          // Solo contar si el estatus es 'pendiente' o 'confirmada'
          return matchesSlot && esEstatusValido;
        }
        return false;
      }).length;

      // Buscar si el usuario tiene una reserva completada o cancelada en este slot
      let userStatus = null;
      let instructoraNombre = null;
      let motivoCancelacion = null;
      if (slotBookings.length > 0) {
        // Tomar la reserva más reciente (por id más alto)
        const userBooking = slotBookings.reduce((a, b) => (a.id > b.id ? a : b));
        userStatus = userBooking.estatus;
        instructoraNombre = userBooking.instructora_nombre || null;
        motivoCancelacion = userBooking.motivo_cancelacion || null;
      }

      const hour = parseInt(time.split(":")[0], 10);
      const isBlocked = userLevel === "Iniciación" && hour >= 17;
      // NO bloquear si está cancelada por instructor - la reserva se elimina y el slot queda disponible
      slots.push({
        id: slotId,
        day,
        date: realDate,
        time,
        capacity,
        bookings: slotBookings,
        totalBooked: totalBookingsForSlot,
        isBlocked: isBlocked || isWithin2Hours || hasPassed, // Bloquear si: iniciación tarde, <2h, ya pasó (NO si está cancelada por instructor)
        isWithin2Hours, // Flag específico para mensaje "muy pronto"
        hasPassed, // Flag específico para mensaje "clase finalizada"
        userStatus, // nuevo: estatus de la reserva del usuario (si existe)
        instructoraNombre,
        motivoCancelacion, // motivo de cancelación si existe
      });
    });
    return slots;
  };

  // Obtener todos los días únicos desde la BD
  const getAllDaysForClass = () => {
    if (dynamicSchedule && dynamicSchedule.horarios) {
      return Object.keys(dynamicSchedule.horarios);
    }
    return [];
  };

  const slotsByDay = getAllDaysForClass().map((day) => {
    const date = dayNameToDate[day];
    const todayStart = startOfDay(new Date());
    const isPast = date ? isBefore(date, todayStart) : false;
    
    // Bloquear entre semana para usuarios demo
    const dayOfWeek = date ? date.getDay() : -1;
    const isWeekdayForDemo = userType === 'demo' && dayOfWeek !== 0 && dayOfWeek !== 6;
    
    return {
      day,
      date,
      slots: generateTimeSlots(day, date).map((slot) => ({
        ...slot,
        isBlocked: Boolean(slot.isBlocked) || isPast || isWeekdayForDemo,
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
                // Determina si el slot ya está reservado por este usuario (solo confirmada/pendiente)
                // Usar allWeekBookings en lugar de slot.bookings para tener acceso a cliente_id
                // Usar función helper para evitar problemas de zona horaria
                const slotDateStr = getDateString(slot.date);
                const isBookedByUser = allWeekBookings.some((b) => {
                  if (!b.fecha || !b.hora_inicio || !slotDateStr) return false;
                  
                  const reservaDateStr = b.fecha.split('T')[0];
                  const matchesSlot = (
                    reservaDateStr === slotDateStr &&
                    b.hora_inicio.slice(0,5) === slot.time &&
                    b.clase_nombre === className
                  );
                  
                  return matchesSlot && b.cliente_id === userId && (b.estatus === 'confirmada' || b.estatus === 'pendiente');
                });
                
                return (
                  <TimeSlotCard
                    key={slot.id}
                    time={slot.time}
                    capacity={slot.capacity}
                    bookedCount={slot.totalBooked}
                    isBookedByUser={isBookedByUser}
                    isBlocked={slot.isBlocked || false}
                    isWithin2Hours={slot.isWithin2Hours || false}
                    hasPassed={slot.hasPassed || false}
                    userStatus={slot.userStatus}
                    instructoraNombre={slot.instructoraNombre}
                    motivoCancelacion={slot.motivoCancelacion}
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