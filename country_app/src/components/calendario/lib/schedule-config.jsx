// Configuración de horarios por CLASE (no por nivel de usuario)
export const SCHEDULE_CONFIGS_BY_CLASS = {
  iniciacion: {
    weekdays: { // Lunes a Viernes
      days: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
      timeSlots: ["07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "15:00", "15:30", "16:00", "16:30"],
      capacity: 6,
    },
    saturday: { // Sábado
      days: ["Sábado"],
      timeSlots: ["07:30", "08:00", "08:30", "09:00", "09:30"],
      capacity: 6,
    },
    sunday: { // Domingo
      days: ["Domingo"],
      timeSlots: ["07:30", "08:00", "08:30", "09:00", "09:30"],
      capacity: 6,
    }
  },
  intermedio: {
    weekdays: { // Lunes a Viernes
      days: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
      timeSlots: ["08:00", "09:00", "10:00", "17:00"],
      capacity: 2,
    },
    weekend: { // Sábados y Domingos
      days: ["Sábado", "Domingo"],
      timeSlots: ["08:00", "09:00", "10:00"],
      capacity: 2,
    }
  },
  paseo: {
    weekdays: { // Lun-Vie
      days: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
      timeSlots: ["08:00", "09:00", "10:00", "11:00", "12:00", "16:00", "17:00"],
      capacity: 4,
    },
    weekend: { // Sábados y Domingos
      days: ["Sábado", "Domingo"],
      timeSlots: ["08:00", "09:00", "10:00", "11:00", "12:00"],
      capacity: 4,
    }
  },
  salto: {
    weekdays: { // Lunes a Viernes
      days: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
      timeSlots: ["08:00", "09:00", "10:00", "17:00"],
      capacity: 6,
    },
    weekend: { // Sábados y Domingos
      days: ["Sábado", "Domingo"],
      timeSlots: ["08:00", "09:00", "10:00"],
      capacity: 6,
    }
  }
};

// Configuración legacy por nivel de usuario (mantenida para compatibilidad)
export const SCHEDULE_CONFIGS = {
  Intermedio: {
    days: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
    timeSlots: ["16:00", "17:00", "18:00", "19:00"],
    capacity: 2,
  },
  Iniciación: {
    days: ["Sábado", "Domingo"],
    timeSlots: ["10:00", "11:00", "12:00", "13:00", "16:00", "17:00", "18:00", "19:00"],
    capacity: 6,
    specialCapacity: {
      "10:00": 5,
      "13:00": 5,
      "16:00": 5,
      "19:00": 5,
    },
  },
  Avanzado: {
    days: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"],
    timeSlots: ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"],
    capacity: 6,
  },
}

export const MOCK_BOOKINGS = [
  { id: "b1", userId: "1", userName: "María García", timeSlotId: "Lunes-16:00" },
  { id: "b2", userId: "4", userName: "Pedro López", timeSlotId: "Lunes-16:00" },
  { id: "b3", userId: "1", userName: "María García", timeSlotId: "Miércoles-17:00" },
]