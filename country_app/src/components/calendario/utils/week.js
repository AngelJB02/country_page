// utils/week.js
import { startOfWeek, addDays, format } from 'date-fns'
import { es } from 'date-fns/locale'

export function getCurrentWeek(date = new Date(), weekStartsOn = 1) {
  // weekStartsOn: 0 domingo, 1 lunes (usa 1 para semanas que empiecen lunes)
    const start = startOfWeek(date, { weekStartsOn })
    const days = Array.from({ length: 7 }).map((_, i) => addDays(start, i))
    return days
}

export function formatDayLabel(dateObj) {
  // 'EEEE' = nombre completo del día, 'dd' día numérico
    return format(dateObj, "EEEE d 'de' MMMM", { locale: es })
}