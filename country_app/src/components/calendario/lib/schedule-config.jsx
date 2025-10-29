export const SCHEDULE_CONFIGS = {
  Iniciación: {
    days: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
    timeSlots: ["16:00", "17:00", "18:00", "19:00"],
    capacity: 2,
  },
  Intermedio: {
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