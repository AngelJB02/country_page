// src/hooks/useUsuarios.js
import { useState, useEffect } from 'react';
import axios from 'axios';

const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = 'http://localhost:3001/api/users';


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
      // Siempre usar /register para el formulario de RegistroUsuarios
      // (register-cliente es solo para Contabilidad donde se manejan pagos)
      const { data } = await axios.post(`${API_URL}/register`, nuevoUsuario);
      await obtenerUsuarios();
      
      // Retornar toda la información del usuario creado
      return { 
        success: true, 
        message: data.message,
        credentials: data.credentials || null,
        username: data.username,
        password: data.password,
        id: data.id,
        rol: data.rol
      };
    } catch (err) {
      console.error(err);
      return { success: false, message: err.response?.data?.error || 'Error al registrar usuario' };
    } finally {
      setLoading(false);
    }
  };

    const actualizarCorreo = async (id, nuevoEmail) => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.patch(`${API_URL}/update-email/${id}`, { email: nuevoEmail });
        await obtenerUsuarios();
        return { success: true, message: data.message || 'Correo actualizado correctamente' };
      } catch (err) {
        console.error(err);
        return { success: false, message: err.response?.data?.error || 'Error al actualizar correo' };
      } finally {
        setLoading(false);
      }
    };

    const actualizarPassword = async (id, nuevaPassword) => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.patch(`${API_URL}/update-password/${id}`, { password: nuevaPassword });
        await obtenerUsuarios();
        return { success: true, message: data.message || 'Contraseña actualizada correctamente' };
      } catch (err) {
        console.error(err);
        return { success: false, message: err.response?.data?.error || 'Error al actualizar contraseña' };
      } finally {
        setLoading(false);
      }
    };


  return { usuarios, loading, error, crearUsuario, actualizarCorreo, actualizarPassword, cargarUsuarios: obtenerUsuarios };
};

export default useUsuarios;
