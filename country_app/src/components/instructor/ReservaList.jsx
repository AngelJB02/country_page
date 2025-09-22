import ReservaItem from "./ReservaItem"

const ReservaList = ({ reservas, updateAsistencia }) => {
  // Agrupar reservas por fecha (YYYY-MM-DD) y ordenar por hora dentro de cada fecha
  // Agrupar reservas por fecha (YYYY-MM-DD) y ordenar por hora dentro de cada fecha
  const groupReservasByDate = (reservas) => {
    return reservas.reduce((groups, reserva) => {
      // Extraer solo la parte YYYY-MM-DD de la fecha usando Date
      let date = ""
      if (reserva.fecha) {
        try {
          const d = new Date(reserva.fecha)
          date = d.toISOString().slice(0, 10)
        } catch {
          date = reserva.fecha.slice(0, 10)
        }
      }
      if (!groups[date]) groups[date] = []
      groups[date].push(reserva)
      return groups
    }, {})
  }

  const groupedByDate = groupReservasByDate(reservas)
  const sortedDates = Object.keys(groupedByDate).sort()

  return (
    <div className="reserva-list">
      {sortedDates.map((date) => {
        // Ordenar reservas por hora dentro de cada fecha
        const reservasDelDia = groupedByDate[date].slice().sort((a, b) => {
          // Comparar horas como strings (formato HH:mm:ss)
          return a.horario.localeCompare(b.horario)
        })
        return (
          <div key={date} className="reserva-dia-container" style={{ background: "var(--cream-overlay)", borderRadius: "25px" }}>
            <div className="reserva-dia-header">
              📅 {date}
              <span className="reserva-dia-indicator">
                {reservasDelDia.length} reserva{reservasDelDia.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="reserva-dia-list">
              {reservasDelDia.map((reserva) => (
                <div key={reserva.id} className="reserva-hora-block">
                
                  <div style={{ marginTop: "2.2rem" }}>
                    <ReservaItem reserva={reserva} updateAsistencia={updateAsistencia} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ReservaList