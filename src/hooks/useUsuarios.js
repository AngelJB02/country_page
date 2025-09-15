import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api/users';

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  const obtenerUsuarios = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`${API_URL}/all`);
      setUsuarios(data);
    } catch (err) {
      console.error(err);
      setError('Error al obtener usuarios de la base de datos');
    } finally {
      setLoading(false);
    }
  };

  const crearUsuario = async (nuevoUsuario) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post(`${API_URL}/register`, nuevoUsuario);
      await obtenerUsuarios();
      return { success: true, message: data.message };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: err.response?.data?.error || 'Error al registrar usuario',
      };
    } finally {
      setLoading(false);
    }
  };

  const darDeBaja = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.patch(`${API_URL}/disable/${id}`);
      await obtenerUsuarios();
      return { success: true, message: data.message };
    } catch (err) {
      console.error(err);
      return { success: false, message: 'Error al dar de baja usuario' };
    } finally {
      setLoading(false);
    }
  };

  return { usuarios, loading, error, crearUsuario, darDeBaja };
};
