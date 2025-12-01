// booking-classes-api.js
// API para obtener clases reales

export async function fetchClasses() {
  const res = await fetch('http://212.227.238.213/api/api/reservas/classes');
  if (!res.ok) throw new Error('Error al obtener clases');
  return res.json();
}
