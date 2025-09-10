import { useState } from "react";

const API_URL = "http://localhost:3001/reservas"; 
// 🔴 cámbialo a tu dominio o endpoint real

export function useReservas() {
  const [availability, setAvailability] = useState({});
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Obtener disponibilidad para una fecha
  const getAvailability = async (date) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_URL}/availability?date=${date}`);
      if (!res.ok) throw new Error("Error al cargar disponibilidad");

      const data = await res.json();
      setAvailability((prev) => ({ ...prev, [date]: data }));
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Obtener todas las reservas (opcional, para vista de admin/instructor)
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
        throw new Error(errorData.message || "Error al crear reserva");
      }

      const newReserva = await res.json();
      // actualizar estado local si quieres
      setReservas((prev) => [...prev, newReserva]);
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
