import React from "react";

const ReservaInfo = ({ dayReservations }) => (
  <div className="reservas-dia">
    <h3>Reservas del día</h3>
    {dayReservations.filter(res => res.estado !== 'cancelada').length === 0 ? (
      <p>No hay reservas activas para este día.</p>
    ) : (
      dayReservations
        .filter(res => res.estado !== 'cancelada')
        .map((reserva, idx) => (
          <div key={reserva.id || idx} className="reserva-item">
            <p><strong>Nombre:</strong> {reserva.nombre}</p>
            <p><strong>Edad:</strong> {reserva.edad}</p>
            <p><strong>Actividad:</strong> {reserva.actividad}</p>
            <p><strong>Hora:</strong> {reserva.time}</p>
            <hr />
          </div>
        ))
    )}
  </div>
);

export default ReservaInfo;