import { useState } from "react"

const ReservaItem = ({ reserva, updateAsistencia }) => {
  const [asistencia, setAsistencia] = useState(reserva.asistencia)

  const handleUpdateAsistencia = async (id, nuevoEstado) => {
    try {
      if (updateAsistencia) {
        await updateAsistencia(id, nuevoEstado)
        setAsistencia(nuevoEstado)
      }
    } catch (error) {
      console.error(error)
      alert("No se pudo actualizar la asistencia")
    }
  }
  const getEstadoClass = (estado) => {
    switch (estado) {
      case "confirmada":
        return "estado-confirmada"
      case "pendiente":
        return "estado-pendiente"
      case "cancelada":
        return "estado-cancelada"
      default:
        return ""
    }
  }

  const getAsistenciaClass = (asistencia) => {
    switch (asistencia) {
      case "asistio":
        return "asistio"
      case "falto":
        return "no-asistio"
      case "pendiente":
        return "pendiente"
      case "cancelada":
        return "cancelada"
      default:
        return ""
    }
  }

  return (
    <div className={`reserva-item ${getAsistenciaClass(asistencia)}`}>
      <div className="hora-pill" aria-label={`Hora ${reserva.horario ? reserva.horario.slice(0, 5) : "—"}`}>
        <span className="hora-pill__icon">🕒</span>
        <span className="hora-pill__text">{reserva.horario ? reserva.horario.slice(0, 5) : "—"}</span>
      </div>
      <div className="reserva-item-grid" style={{ marginTop: "2.2rem" }}>
        {/* Información del cliente */}
        <div>
          <h4 className="reserva-nombre">👤 {reserva.nombre}</h4>
          <p>
            <strong data-field="edad">Edad:</strong> {reserva.edad} años
          </p>
        </div>

        {/* Detalles de la reserva */}
        <div>
          <p>
            <strong data-field="fecha">Fecha:</strong> {(() => {
              const fechaStr = reserva.fecha.split("T")[0]
              const [year, month, day] = fechaStr.split("-")
              return `${day}/${month}/${year}`
            })()}
          </p>
          <p>
            <strong data-field="caballo">Caballo:</strong> {reserva.caballo || "Sin asignar"}
          </p>
          {/* Mostrando la clase_id */}
          <p>
            <strong data-field="clase">Clase:</strong> {reserva.clase_nombre}
          </p>
          <div className={`estado ${getEstadoClass(reserva.estado)}`}>{reserva.estado}</div>
        </div>

        {/* Estado de asistencia */}
        <div>
          <p>Estado de Asistencia:</p>
          <span className={`asistencia-badge ${getAsistenciaClass(asistencia)}`}>
            {asistencia === "asistio"
              ? "✅ Asistió"
              : asistencia === "falto"
                ? "❌ No Asistió"
                : asistencia === "cancelada"
                  ? "🚫 Cancelada"
                  : "⏳ Pendiente"}
          </span>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="reserva-item-buttons">
        <button
          onClick={() => handleUpdateAsistencia(reserva.id, "asistio")}
          disabled={asistencia === "asistio"}
          className="button-asistio"
        >
          ✅ Asistió
        </button>
        <button
          onClick={() => handleUpdateAsistencia(reserva.id, "falto")}
          disabled={asistencia === "falto"}
          className="button-no-asistio"
        >
          ❌ No Asistió
        </button>
        <button
          onClick={() => handleUpdateAsistencia(reserva.id, "cancelada")}
          disabled={asistencia === "cancelada"}
          className="button-cancelar"
        >
          🚫 Cancelar clase
        </button>
      </div>
    </div>
  )
}

export default ReservaItem
