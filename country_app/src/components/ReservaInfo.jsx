// ReservaInfo.jsx
import React from "react";
import "../CSS/ReservaInfo.css";

const ReservaInfo = ({ booking }) => {
  if (!booking) return (
    <div className="booking-summary">
      <h3>Detalles de tu reserva</h3>
      <p>Aquí aparecerán los datos de tu reserva una vez confirmada.</p>
    </div>
  );

  return (
    <div className="booking-summary">
      <h3>Detalles de tu reserva</h3>
      <p><strong>Nombre:</strong> {booking.nombre}</p>
      <p><strong>Edad:</strong> {booking.edad} años</p>
      <p><strong>Actividad:</strong> {booking.actividad}</p>
      <p><strong>Fecha:</strong> {booking.fecha}</p>
      <p><strong>Hora:</strong> {booking.hora}</p>
    </div>
  );
};

export default ReservaInfo;
