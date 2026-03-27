
const ReservasAdmin = ({ reservations }) => {
  const allReservations = Object.values(reservations).flat();
  const sortedReservations = allReservations.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

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
    <div className="reservas-admin-container">
      {/* <div className="dashboard-header enhanced-header">
        <div className="header-bg">
          <div className="header-texts">
          </div>
        </div>
      </div> */}
      <div style={{ marginBottom: '2rem' }}>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-topline" style={{ backgroundColor: "#c17b4a" }}></div>
            <div className="stat-title">Reservas Totales</div>
            <div className="stat-value">{sortedReservations.length}</div>
          </div>
        </div>
      </div>
      <div style={{ overflow: "hidden", borderRadius: "16px" }}>
        <table className="members-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Actividad</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {sortedReservations.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "3rem", color: "var(--terracotta)", fontSize: "1.1rem", fontWeight: "600" }}>
                  No hay reservas registradas.
                </td>
              </tr>
            ) : (
              sortedReservations.map((reserva) => (
                <tr key={reserva.id}>
                  <td style={{ fontWeight: "600" }}>{reserva.nombre}</td>
                  <td>
                    <span className={`reserva-value actividad ${actividadClass(reserva.actividad)}`}>
                      {reserva.actividad?.charAt(0).toUpperCase() + reserva.actividad?.slice(1)}
                    </span>
                  </td>
                  <td>{fmtFecha(reserva.fecha)}</td>
                  <td>{reserva.time}</td>
                  <td>
                    <span className={`estado-chip ${reserva.estado?.toLowerCase()}`}>{reserva.estado}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReservasAdmin;