import React from "react";
import "../CSS/ReservaInfo.css";

const ReservasInfo = ({ reservations, currentUser }) => {
  if (!currentUser) return null;

  const allReservations = Object.values(reservations).flat();
  const userReservations = allReservations
    .filter(res => res.usuario_id === currentUser.id)
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  const actividadClass = (a = "") => {
    const k = a.toLowerCase();
    if (k.startsWith("ini")) return "pill-actividad pill-ini";
    if (k.startsWith("pas")) return "pill-actividad pill-cam";
    if (k.startsWith("sal")) return "pill-actividad pill-sal";
    return "pill-actividad";
  };

  const fmtFecha = (iso) => {
    if (!iso) return "Sin fecha";
    const fechaStr = iso.split("T")[0];
    const [, m, d] = fechaStr.split("-");
    const meses = [
      "enero","febrero","marzo","abril","mayo","junio",
      "julio","agosto","septiembre","octubre","noviembre","diciembre"
    ];
    return `${parseInt(d, 10)} ${meses[parseInt(m, 10) - 1]}`;
  };

  return (
    <div className="reservas-usuario">
      <h3>
        Todas tus Reservas
        <span className="count-badge">{userReservations.length}</span>
      </h3>

      {userReservations.length === 0 ? (
        <p>No tienes reservas registradas.</p>
      ) : (
        <div className="reservas-lista-amplia">
          {userReservations.map((reserva) => (
            <div key={reserva.id} className="reserva-item-amplia">
              <div className="reserva-row">
                <span className="reserva-label">Nombre:</span>
                <span className="reserva-value nombre">{reserva.nombre}</span>
              </div>

              <div className="reserva-row">
                <span className="reserva-label">Actividad:</span>
                <span className={`reserva-value actividad ${actividadClass(reserva.actividad)}`}>
                  {reserva.actividad?.charAt(0).toUpperCase() + reserva.actividad?.slice(1)}
                </span>
              </div>

              <div className="reserva-row">
                <span className="reserva-label">Fecha:</span>
                <span className="reserva-value fecha">{fmtFecha(reserva.fecha)}</span>
              </div>

              <div className="reserva-row">
                <span className="reserva-label">Hora:</span>
                <span className="reserva-value hora">{reserva.time}</span>
              </div>

              <div className="reserva-row">
                <span className="reserva-label">Estado:</span>
                {/* Chip compacto */}
                <span className={`estado-chip ${reserva.estado?.toLowerCase()}`}>
                  {reserva.estado}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReservasInfo;