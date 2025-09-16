import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "https://elrefugiocountryclub.com/api/instructor";

const useInstructor = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReservas = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`${API_URL}/reservas`);
      setReservas(data);
    } catch (err) {
      console.error(err);
      setError("Error al obtener reservas del servidor");
    } finally {
      setLoading(false);
    }
  };

  const updateAsistencia = async (reservaId, asistencia) => {
    if (!["asistio", "falto", "pendiente"].includes(asistencia)) return;
    try {
      await axios.patch(`${API_URL}/reservas/${reservaId}/asistencia`, { asistencia });
      setReservas(prev =>
        prev.map(r => (r.id === reservaId ? { ...r, asistencia } : r))
      );
    } catch (err) {
      console.error(err);
      setError("No se pudo actualizar la asistencia");
    }
  };

  useEffect(() => {
    fetchReservas();
  }, []);

  return { reservas, loading, error, updateAsistencia };
};

export default useInstructor;
