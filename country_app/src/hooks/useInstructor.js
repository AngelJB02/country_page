import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = 'https://country-page.onrender.com/api/instructor';


// selectedDate: string (YYYY-MM-DD), endDate: string (YYYY-MM-DD, opcional)
const useInstructor = (selectedDate, endDate) => {
  const [allReservas, setAllReservas] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filtra reservas según selectedDate y endDate
  const filterByDate = (data, selectedDate, endDate) => {
    // Si selectedDate es vacío, null o 'all', mostrar todas
    if (!selectedDate || selectedDate === 'all') return data;
    const start = new Date(selectedDate);
    let end = endDate ? new Date(endDate) : null;
    return data.filter(r => {
      const resDate = new Date(r.fecha);
      if (end) {
        // Rango de fechas
        return resDate >= start && resDate <= end;
      } else {
        // Solo el día seleccionado
        return resDate.toISOString().slice(0,10) === selectedDate;
      }
    });
  };

  const fetchReservas = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`${API_URL}/reservas`);
      setAllReservas(data);
      setReservas(filterByDate(data, selectedDate, endDate));
    } catch (err) {
      console.error(err);
      setError("Error al obtener reservas del servidor");
    } finally {
      setLoading(false);
    }
  };

  // Actualiza reservas cuando cambian las fechas
  useEffect(() => {
    setReservas(filterByDate(allReservas, selectedDate, endDate));
  }, [selectedDate, endDate, allReservas]);

  useEffect(() => {
    fetchReservas();
    // eslint-disable-next-line
  }, []);

  const updateAsistencia = async (reservaId, asistencia) => {
    if (!["asistio", "falto", "pendiente", "cancelada"].includes(asistencia)) return;
    try {
      await axios.put(`${API_URL}/reservas/${reservaId}/asistencia`, { asistencia });
      setAllReservas(prev =>
        prev.map(r => (r.id === reservaId ? { ...r, asistencia } : r))
      );
    } catch (err) {
      console.error(err);
      setError("No se pudo actualizar la asistencia");
    }
  };

  return { reservas, loading, error, updateAsistencia };
};

export default useInstructor;
