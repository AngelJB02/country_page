// utils/week.js
import { startOfWeek, addDays, format } from 'date-fns'
import { es } from 'date-fns/locale'

export function getCurrentWeek(date = new Date(), weekStartsOn = 1) {
  // weekStartsOn: 0 domingo, 1 lunes (usa 1 para semanas que empiecen lunes)
  // Crear fechas usando componentes locales para evitar problemas de zona horaria
  const baseDate = new Date(date);
  
  // Extraer componentes locales (año, mes, día) para crear una nueva fecha sin problemas de zona horaria
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const day = baseDate.getDate();
  
  // Crear nueva fecha usando componentes locales a mediodía
  const localDate = new Date(year, month, day, 12, 0, 0, 0);
  
  const start = startOfWeek(localDate, { weekStartsOn });
  // Asegurar que el inicio también esté a mediodía usando componentes locales
  const startYear = start.getFullYear();
  const startMonth = start.getMonth();
  const startDay = start.getDate();
  const startLocal = new Date(startYear, startMonth, startDay, 12, 0, 0, 0);
  
  const days = Array.from({ length: 7 }).map((_, i) => {
    const dayDate = addDays(startLocal, i);
    // Recrear usando componentes locales para asegurar consistencia
    const dayYear = dayDate.getFullYear();
    const dayMonth = dayDate.getMonth();
    const dayDay = dayDate.getDate();
    return new Date(dayYear, dayMonth, dayDay, 12, 0, 0, 0);
  });
  return days
}

export function formatDayLabel(dateObj) {
  // 'EEEE' = nombre completo del día, 'dd' día numérico
    return format(dateObj, "EEEE d 'de' MMMM", { locale: es })
}