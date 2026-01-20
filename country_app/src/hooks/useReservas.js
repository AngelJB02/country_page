import { useState } from "react";

const API_URL = "https://elrefugiocountryclub.com/api/pi/reservas"; 

export function useReservas() {
  const [availability, setAvailability] = useState({});
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Obtener disponibilidad para una fecha
  const getAvailability = async (fecha) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_URL}/availability?fecha=${fecha}`);
      if (!res.ok) throw new Error("Error al cargar disponibilidad");

      const data = await res.json();
      setAvailability((prev) => ({ ...prev, [fecha]: data }));
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Obtener todas las reservas (opcional)
  const getReservas = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Error al cargar reservas");

      const data = await res.json();
      setReservas(data);
      return data;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // ✅ Crear una nueva reserva
  const createReserva = async (reservaData) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reservaData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al crear reserva");
      }

      const newReserva = await res.json();
      setReservas((prev) => [...prev, newReserva]);
      // Actualizar disponibilidad local
      const date = reservaData.fecha;
      const updatedAvailability = { ...availability[date] };
      if (reservaData.actividad === "salto") {
        updatedAvailability.salto.available -= 1;
      } else {
        updatedAvailability[reservaData.hora].available -= 1;
      }
      setAvailability(prev => ({ ...prev, [date]: updatedAvailability }));
      return newReserva;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    availability,
    reservas,
    loading,
    error,
    getAvailability,
    getReservas,
    createReserva,
  };
}
