import React from "react";
import "../CSS/ReservaInfo.css";

const ReservasInfo = ({ reservations, currentUser }) => {
  // Unir todas las reservas en un solo array
  const allReservations = Object.values(reservations).flat();

  // Filtrar por usuario logueado
  const userReservations = allReservations.filter(res => res.usuario_id === currentUser.id);

  // Ordenar por fecha descendente (más recientes primero)
  userReservations.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  return (
    <div className="reservas-usuario">
      <h3>Todas tus Reservas</h3>
      {userReservations.length === 0 ? (
        <p>No tienes reservas registradas.</p>
      ) : (
        userReservations.map((reserva, idx) => (
          <div key={reserva.id || idx} className="reserva-item">
            <div className="detail-row">
              <span className="detail-label">Nombre:</span>
              <span className="detail-value">{reserva.nombre}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Edad:</span>
              <span className="detail-value">{reserva.edad} años</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Actividad:</span>
              <span className="detail-value">{reserva.actividad.charAt(0).toUpperCase() + reserva.actividad.slice(1)}</span>
            </div>
            <div className="detail-row">
            <span className="detail-label">Fecha:</span>
            <span className="detail-value">
              {reserva.fecha
                ? new Date(reserva.fecha).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })
                : 'Sin fecha'}
            </span>
          </div>
            <div className="detail-row">
              <span className="detail-label">Hora:</span>
              <span className="detail-value">{reserva.time}</span>
            </div>
            {reserva.id && (
              <div className="detail-row">
                <span className="detail-label">ID de Reserva:</span>
                <span className="detail-value">#{reserva.id}</span>
              </div>
            )}
            <div className="detail-row">
              <span className="detail-label">Estado:</span>
              <span className="detail-value">{reserva.estado}</span>
            </div>
            <hr />
          </div>
        ))
      )}
    </div>
  );
};

export default ReservasInfo;