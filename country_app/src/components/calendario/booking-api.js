// booking-api.js
// API para reservas: obtiene y crea reservas del usuario

export async function fetchUserBookings(clienteId) {
  const res = await fetch(`http://192.168.201.101:3001/api/reservas/my-reservations/${clienteId}`);
  if (!res.ok) throw new Error('Error al obtener reservas');
  return res.json();
}

export async function createBooking({ cliente_id, clase_id, fecha, hora_inicio }) {
  const res = await fetch('http://192.168.201.101:3001/api/reservas/book', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cliente_id, clase_id, fecha, hora_inicio })
  });
  
  const data = await res.json();
  
  if (!res.ok) {
    // Lanzar un error que incluya los datos del backend
    const error = new Error(data.error || 'Error al crear reserva');
    error.response = { data }; // Adjuntar la respuesta completa
    throw error;
  }
  
  return data;
}

// Obtener todas las reservas de una semana para mostrar disponibilidad
export async function fetchWeekBookings(fechaInicio, fechaFin, clienteId) {
  // No enviar cliente_id para obtener TODAS las reservas de la semana y calcular cupos correctamente
  const res = await fetch(`http://192.168.201.101:3001/api/reservas/week?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`);
  if (!res.ok) throw new Error('Error al obtener reservas de la semana');
  return res.json();
}

// Cancelar reserva (cambia estatus a cancelada, no elimina)
export async function cancelBooking(reservaId, clienteId) {
  const res = await fetch(`http://192.168.201.101:3001/api/reservas/${reservaId}/cancel/${clienteId}`, {
    method: 'PUT',
  });
  const data = await res.json();
  if (!res.ok) {
    const error = new Error(data.error || 'Error al cancelar reserva');
    error.response = { data };
    throw error;
  }
  return data;
}
