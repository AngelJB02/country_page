import React, { useState, useEffect } from "react";
import { Loader, Calendar, Filter } from "lucide-react";

const ReservasAdmin = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroTiempo, setFiltroTiempo] = useState("dia"); // "dia" o "semana"
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split("T")[0]);

  // Cargar lista de reservas (dummy por ahora)
  useEffect(() => {
    loadReservas();
  }, [filtroTiempo, fechaSeleccionada]);

  const loadReservas = () => {
    setLoading(true);
    // Aquí deberías hacer fetch al endpoint real con los filtros
    setTimeout(() => {
      // Datos dummy de reservas
      const hoy = new Date();
      const reservasDummy = [
        {
          id: 1,
          fecha: hoy.toISOString().split("T")[0],
          hora: "09:00",
          cliente_nombre: "Juan Pérez",
          instructora_nombre: "María González",
          caballo_nombre: "Thunder",
          tipo_clase: "salto",
          estado: "confirmada",
          asistencia: "pendiente"
        },
        {
          id: 2,
          fecha: hoy.toISOString().split("T")[0],
          hora: "10:00",
          cliente_nombre: "Ana Martínez",
          instructora_nombre: "Laura Rodríguez",
          caballo_nombre: "Spirit",
          tipo_clase: "iniciacion",
          estado: "confirmada",
          asistencia: "asistio"
        },
        {
          id: 3,
          fecha: hoy.toISOString().split("T")[0],
          hora: "11:00",
          cliente_nombre: "Carlos López",
          instructora_nombre: "María González",
          caballo_nombre: "Luna",
          tipo_clase: "intermedio",
          estado: "confirmada",
          asistencia: "falta"
        },
        {
          id: 4,
          fecha: new Date(hoy.getTime() + 86400000).toISOString().split("T")[0],
          hora: "09:00",
          cliente_nombre: "Sofía Ramírez",
          instructora_nombre: "Ana Martínez",
          caballo_nombre: "Canela",
          tipo_clase: "paseo",
          estado: "confirmada",
          asistencia: "pendiente"
        },
        {
          id: 5,
          fecha: new Date(hoy.getTime() + 86400000).toISOString().split("T")[0],
          hora: "15:00",
          cliente_nombre: "Diego Torres",
          instructora_nombre: "María González",
          caballo_nombre: "Thunder",
          tipo_clase: "salto",
          estado: "pendiente",
          asistencia: "pendiente"
        },
        {
          id: 6,
          fecha: new Date(hoy.getTime() + 172800000).toISOString().split("T")[0],
          hora: "10:00",
          cliente_nombre: "Laura Fernández",
          instructora_nombre: "Laura Rodríguez",
          caballo_nombre: "Spirit",
          tipo_clase: "iniciacion",
          estado: "confirmada",
          asistencia: "pendiente"
        }
      ];

      // Filtrar reservas según el filtro de tiempo
      let reservasFiltradas = reservasDummy;
      
      if (filtroTiempo === "dia") {
        // Mostrar solo reservas del día seleccionado
        reservasFiltradas = reservasDummy.filter(r => r.fecha === fechaSeleccionada);
      } else if (filtroTiempo === "semana") {
        // Mostrar reservas de la semana que contiene la fecha seleccionada
        const fechaBase = new Date(fechaSeleccionada);
        const inicioSemana = new Date(fechaBase);
        inicioSemana.setDate(fechaBase.getDate() - fechaBase.getDay());
        const finSemana = new Date(inicioSemana);
        finSemana.setDate(inicioSemana.getDate() + 6);

        reservasFiltradas = reservasDummy.filter(r => {
          const fechaReserva = new Date(r.fecha);
          return fechaReserva >= inicioSemana && fechaReserva <= finSemana;
        });
      }

      setReservas(reservasFiltradas);
      setLoading(false);
    }, 500);
  };

  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }
    return date.toLocaleDateString('es-ES', options)
  };

  const getEstadoBadgeColor = (estado) => {
    switch(estado) {
      case "confirmada":
        return { border: "#9caf88", color: "#9caf88" };
      case "pendiente":
        return { border: "#d4a574", color: "#d4a574" };
      case "cancelada":
        return { border: "#8b5a2b", color: "#8b5a2b" };
      default:
        return { border: "#c17b4a", color: "#c17b4a" };
    }
  };

  const getAsistenciaBadgeColor = (asistencia) => {
    switch(asistencia) {
      case "asistio":
        return { border: "#9caf88", color: "#9caf88" };
      case "falta":
        return { border: "#8b5a2b", color: "#8b5a2b" };
      case "pendiente":
        return { border: "#d4a574", color: "#d4a574" };
      default:
        return { border: "#c17b4a", color: "#c17b4a" };
    }
  };

  const getRangoSemana = () => {
    const fechaBase = new Date(fechaSeleccionada);
    const inicioSemana = new Date(fechaBase);
    inicioSemana.setDate(fechaBase.getDate() - fechaBase.getDay());
    const finSemana = new Date(inicioSemana);
    finSemana.setDate(inicioSemana.getDate() + 6);
    
    return `${formatDate(inicioSemana.toISOString().split("T")[0])} - ${formatDate(finSemana.toISOString().split("T")[0])}`;
  };

  return (
    <div className="reservas-admin-container">
      {/* Header con controles */}
      <div className="controls-container enhanced-controls" style={{ marginBottom: "1.5rem" }}>
        <div className="controls-inner">
          <h2 style={{ margin: 0, color: "var(--primary-brown)" }}>Gestión de Reservas</h2>
        </div>
      </div>

      {/* Filtros */}
      <div className="controls-container enhanced-controls" style={{ marginBottom: "1.5rem" }}>
        <div className="controls-inner">
          <div className="search-filter-group enhanced-search-filter">
            <Filter size={18} className="search-icon external-search-icon" />
            <div className="filter-box">
              <select 
                className="status-filter" 
                value={filtroTiempo} 
                onChange={(e) => setFiltroTiempo(e.target.value)}
              >
                <option value="dia">Ver por Día</option>
                <option value="semana">Ver por Semana</option>
              </select>
            </div>
            <Calendar size={18} style={{ marginLeft: "1rem", color: "var(--terracotta)" }} />
            <div className="search-box" style={{ flex: "0 0 auto", width: "auto" }}>
              <input
                type="date"
                className="search-input"
                value={fechaSeleccionada}
                onChange={(e) => setFechaSeleccionada(e.target.value)}
                style={{ width: "200px" }}
              />
            </div>
          </div>
          {filtroTiempo === "semana" && (
            <div style={{ 
              fontSize: "0.9rem", 
              color: "var(--stone-gray)", 
              fontWeight: "500",
              marginTop: "0.5rem"
            }}>
              Semana: {getRangoSemana()}
            </div>
          )}
        </div>
      </div>

      {/* Tabla de reservas */}
      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "4rem 2rem",
            background: "rgba(255, 255, 255, 0.9)",
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(107,68,35,0.06)",
          }}
        >
          <Loader size={40} className="spin" style={{ color: "var(--terracotta)", marginBottom: "1rem" }} />
          <div
            style={{
              color: "var(--primary-brown)",
              fontSize: "1.1rem",
              fontWeight: "600",
            }}
          >
            Cargando reservas...
          </div>
        </div>
      ) : (
        <div style={{ overflow: "hidden", borderRadius: "16px" }}>
          <table className="members-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Cliente</th>
                <th>Instructora</th>
                <th>Caballo</th>
                <th>Tipo de Clase</th>
                <th>Estado</th>
                <th>Asistencia</th>
              </tr>
            </thead>
            <tbody>
              {reservas.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      textAlign: "center",
                      padding: "3rem",
                      color: "var(--terracotta)",
                      fontSize: "1.1rem",
                      fontWeight: "600",
                    }}
                  >
                    {filtroTiempo === "dia" 
                      ? `No hay reservas para el ${formatDate(fechaSeleccionada)}`
                      : `No hay reservas para la semana seleccionada`
                    }
                  </td>
                </tr>
              ) : (
                reservas.map(reserva => {
                  const estadoColor = getEstadoBadgeColor(reserva.estado);
                  const asistenciaColor = getAsistenciaBadgeColor(reserva.asistencia);
                  
                  return (
                    <tr key={reserva.id}>
                      <td style={{ fontWeight: "600" }}>{formatDate(reserva.fecha)}</td>
                      <td style={{ fontWeight: "600", color: "var(--primary-brown)" }}>{reserva.hora}</td>
                      <td style={{ color: "var(--charcoal)" }}>{reserva.cliente_nombre}</td>
                      <td style={{ color: "var(--stone-gray)" }}>{reserva.instructora_nombre}</td>
                      <td style={{ fontWeight: "600", color: "var(--primary-brown)" }}>{reserva.caballo_nombre}</td>
                      <td style={{ color: "var(--charcoal)" }}>
                        {reserva.tipo_clase.charAt(0).toUpperCase() + reserva.tipo_clase.slice(1)}
                      </td>
                      <td>
                        <span
                          className="status-badge"
                          style={{
                            borderColor: estadoColor.border,
                            color: estadoColor.color,
                            padding: "0.4rem 0.8rem",
                            display: "inline-block",
                            cursor: "default"
                          }}
                        >
                          {reserva.estado.charAt(0).toUpperCase() + reserva.estado.slice(1)}
                        </span>
                      </td>
                      <td>
                        <span
                          className="status-badge"
                          style={{
                            borderColor: asistenciaColor.border,
                            color: asistenciaColor.color,
                            padding: "0.4rem 0.8rem",
                            display: "inline-block",
                            cursor: "default"
                          }}
                        >
                          {reserva.asistencia === "asistio" ? "Asistió" : 
                           reserva.asistencia === "falta" ? "Falta" : "Pendiente"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Resumen de estadísticas */}
      {!loading && reservas.length > 0 && (
        <div style={{ 
          marginTop: "2rem", 
          display: "flex", 
          gap: "1rem", 
          justifyContent: "center",
          flexWrap: "wrap"
        }}>
          <div style={{ 
            padding: "1rem 1.5rem", 
            background: "rgba(156, 175, 136, 0.1)", 
            borderRadius: "8px",
            border: "2px solid #9caf88"
          }}>
            <div style={{ fontSize: "0.85rem", color: "var(--stone-gray)", marginBottom: "0.3rem" }}>
              Total Reservas
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#9caf88" }}>
              {reservas.length}
            </div>
          </div>
          <div style={{ 
            padding: "1rem 1.5rem", 
            background: "rgba(156, 175, 136, 0.1)", 
            borderRadius: "8px",
            border: "2px solid #9caf88"
          }}>
            <div style={{ fontSize: "0.85rem", color: "var(--stone-gray)", marginBottom: "0.3rem" }}>
              Confirmadas
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#9caf88" }}>
              {reservas.filter(r => r.estado === "confirmada").length}
            </div>
          </div>
          <div style={{ 
            padding: "1rem 1.5rem", 
            background: "rgba(212, 165, 116, 0.1)", 
            borderRadius: "8px",
            border: "2px solid #d4a574"
          }}>
            <div style={{ fontSize: "0.85rem", color: "var(--stone-gray)", marginBottom: "0.3rem" }}>
              Pendientes
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#d4a574" }}>
              {reservas.filter(r => r.estado === "pendiente").length}
            </div>
          </div>
          <div style={{ 
            padding: "1rem 1.5rem", 
            background: "rgba(156, 175, 136, 0.1)", 
            borderRadius: "8px",
            border: "2px solid #9caf88"
          }}>
            <div style={{ fontSize: "0.85rem", color: "var(--stone-gray)", marginBottom: "0.3rem" }}>
              Asistencias
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#9caf88" }}>
              {reservas.filter(r => r.asistencia === "asistio").length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservasAdmin;
