import React, { useState, useEffect } from "react";
import axios from 'axios';
import "../CSS/ReservaInfo.css";

const ReservaInfo = ({ booking }) => {
  const [reservasExistentes, setReservasExistentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usuario, setUsuario] = useState(null);

  // Obtener usuario del localStorage
  useEffect(() => {
    const usuarioGuardado = JSON.parse(localStorage.getItem("usuario"));
    setUsuario(usuarioGuardado);
  }, []);

  // Cargar reservas existentes
  useEffect(() => {
    const cargarReservasCompletas = async () => {
      if (!usuario) return;
      
      setLoading(true);
      try {
        console.log('Cargando reservas para usuario:', usuario.id);
        // Obtener reservas completas del usuario actual
        const response = await axios.get(`http://localhost:3001/reservas/usuario/${usuario.id}`);
        console.log('Respuesta del servidor:', response.data);
        setReservasExistentes(response.data);
        setError(null);
      } catch (err) {
        console.error('Error cargando reservas completas:', err);
        console.error('Detalles del error:', err.response?.data);
        
        if (err.response?.status === 404) {
          setError('No se encontraron reservas para este usuario');
        } else if (err.response?.status === 500) {
          setError('Error en el servidor al cargar las reservas');
        } else {
          setError('Error al cargar las reservas. Verifica tu conexión.');
        }
        
        setReservasExistentes([]);
      } finally {
        setLoading(false);
      }
    };

    if (usuario) {
      cargarReservasCompletas();
    } else {
      setLoading(false);
    }
  }, [usuario]);

  // Función para formatear fecha
  const formatearFecha = (fecha) => {
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Función para formatear hora
  const formatearHora = (horario) => {
    const [hora, minutos] = horario.split(':');
    const horaNum = parseInt(hora);
    if (horaNum >= 16) {
      return `${horaNum}:${minutos} PM`;
    } else {
      return `${horaNum}:${minutos} AM`;
    }
  };

  // Función para obtener el color del estado
  const getEstadoColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'confirmada':
        return '#28a745';
      case 'pendiente':
        return '#ffc107';
      case 'cancelada':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  if (!usuario) {
    return (
      <div className="reserva-info-container">
        <div className="reserva-header">
          <h3>Detalles de tu reserva</h3>
        </div>
        <div className="no-reservas">
          <p>Debes iniciar sesión para ver tus reservas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reserva-info-container">
      <div className="reserva-header">
        <h3>Tus Reservas</h3>
      </div>

      {/* Mostrar reserva recién creada si existe */}
      {booking && (
        <div className="reserva-nueva">
          <h4>Reserva Reciente</h4>
          <div className="reserva-card nueva">
            <div className="reserva-detalles">
              <div className="detalle-fila">
                <span className="etiqueta">Nombre:</span>
                <span className="valor">{booking.nombre}</span>
              </div>
              <div className="detalle-fila">
                <span className="etiqueta">Actividad:</span>
                <span className="valor">{booking.actividad}</span>
              </div>
              <div className="detalle-fila">
                <span className="etiqueta">Fecha:</span>
                <span className="valor">{booking.fecha}</span>
              </div>
              <div className="detalle-fila">
                <span className="etiqueta">Hora:</span>
                <span className="valor">{booking.hora}</span>
              </div>
              {booking.caballo && (
                <div className="detalle-fila">
                  <span className="etiqueta">Caballo:</span>
                  <span className="valor">{booking.caballo}</span>
                </div>
              )}
            </div>
            <div className="estado-badge nueva">Nueva</div>
          </div>
        </div>
      )}

      {/* Mostrar reservas existentes */}
      <div className="reservas-existentes">
        <h4>Historial de Reservas</h4>
        
        {loading ? (
          <div className="loading-message">
            <p>Cargando reservas...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
          </div>
        ) : reservasExistentes.length === 0 ? (
          <div className="no-reservas">
            <p>No tienes reservas registradas aún.</p>
            <p>¡Haz tu primera reserva usando el calendario!</p>
          </div>
        ) : (
          <div className="reservas-lista">
            {reservasExistentes.map((reserva, index) => (
              <div key={reserva.reserva_id || index} className="reserva-card">
                <div className="reserva-detalles">
                  <div className="detalle-fila">
                    <span className="etiqueta">ID Reserva:</span>
                    <span className="valor">#{reserva.reserva_id}</span>
                  </div>
                  <div className="detalle-fila">
                    <span className="etiqueta">Actividad:</span>
                    <span className="valor">{reserva.tipo_clase?.charAt(0).toUpperCase() + reserva.tipo_clase?.slice(1)}</span>
                  </div>
                  <div className="detalle-fila">
                    <span className="etiqueta">Fecha:</span>
                    <span className="valor">{formatearFecha(reserva.fecha)}</span>
                  </div>
                  <div className="detalle-fila">
                    <span className="etiqueta">Hora:</span>
                    <span className="valor">{formatearHora(reserva.horario)}</span>
                  </div>
                  {reserva.caballo_nombre && (
                    <div className="detalle-fila">
                      <span className="etiqueta">Caballo:</span>
                      <span className="valor">{reserva.caballo_nombre}</span>
                    </div>
                  )}
                  <div className="detalle-fila">
                    <span className="etiqueta">Creada:</span>
                    <span className="valor">{new Date(reserva.fecha_creacion).toLocaleDateString('es-ES')}</span>
                  </div>
                </div>
                <div 
                  className="estado-badge"
                  style={{ backgroundColor: getEstadoColor(reserva.estado) }}
                >
                  {reserva.estado?.charAt(0).toUpperCase() + reserva.estado?.slice(1)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservaInfo;