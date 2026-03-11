import React, { useState, useEffect } from "react";
import { Loader, Calendar, Filter, ChevronLeft, ChevronRight } from "lucide-react";

const ReservasAdmin = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [filtroTiempo, setFiltroTiempo] = useState("dia"); // "dia" o "semana"
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split("T")[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Mostrar notificación
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 4000);
  };

  // Cargar reservas desde el backend
  const loadReservas = async () => {
    setLoading(true);
    try {
      let url = "https://elrefugiocountryclub.com/api/api/reservas-admin";
      const params = new URLSearchParams();
      
      if (filtroTiempo === "dia") {
        // Filtrar por fecha específica
        params.append("fecha", fechaSeleccionada);
      } else if (filtroTiempo === "semana") {
        // Calcular inicio y fin de semana
        const fechaBase = new Date(fechaSeleccionada);
        const inicioSemana = new Date(fechaBase);
        inicioSemana.setDate(fechaBase.getDate() - fechaBase.getDay());
        const finSemana = new Date(inicioSemana);
        finSemana.setDate(inicioSemana.getDate() + 6);
        
        params.append("fecha_inicio", inicioSemana.toISOString().split("T")[0]);
        params.append("fecha_fin", finSemana.toISOString().split("T")[0]);
      }
      
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Error al cargar reservas");
      }
      
      const data = await response.json();
      setReservas(data);
    } catch (error) {
      console.error("Error al cargar reservas:", error);
      showNotification("Error al cargar reservas", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservas();
    setCurrentPage(1); // Resetear a la primera página cuando cambian los filtros
  }, [filtroTiempo, fechaSeleccionada]);

  // Implementar sticky header para la tabla de reservas (clon + sincronización de anchos)
  useEffect(() => {
    let stickyHeader = null
    const containerSelector = '.reservas-admin-container .table-container'
    const container = document.querySelector(containerSelector)
    if (!container) return

    const table = container.querySelector('.members-table')
    if (!table) return
    const thead = table.querySelector('thead')

    const calculateHeaderPosition = () => {
      const tableRect = table.getBoundingClientRect()
      const theadRect = thead.getBoundingClientRect()
      return { tableRect, theadRect }
    }

    const handleScroll = () => {
      const { tableRect, theadRect } = calculateHeaderPosition()

      if (theadRect.top <= 0 && tableRect.bottom > 100) {
        if (!stickyHeader) {
          stickyHeader = thead.cloneNode(true)
          stickyHeader.style.position = 'fixed'
          stickyHeader.style.top = '0'
          stickyHeader.style.zIndex = '999'
          stickyHeader.classList.add('sticky-clone')
          stickyHeader.style.display = 'table'

          // copiar anchos iniciales
          const originalThs = thead.querySelectorAll('th')
          const clonedThs = stickyHeader.querySelectorAll('th')
          originalThs.forEach((th, index) => {
            if (clonedThs[index]) {
              const w = th.getBoundingClientRect().width
              clonedThs[index].style.width = `${Math.round(w)}px`
            }
          })

          document.body.appendChild(stickyHeader)
        }

        if (stickyHeader) {
          const rect = table.getBoundingClientRect()
          stickyHeader.style.left = `${Math.round(rect.left)}px`
          stickyHeader.style.width = `${Math.round(rect.width)}px`
          stickyHeader.style.display = 'table-header-group'

          // actualizar anchos
          const originalThs2 = thead.querySelectorAll('th')
          const clonedThs2 = stickyHeader.querySelectorAll('th')
          originalThs2.forEach((th, index) => {
            if (clonedThs2[index]) {
              const w = th.getBoundingClientRect().width
              clonedThs2[index].style.width = `${Math.round(w)}px`
            }
          })
          // sincronizar horizontal
          handleTableScroll()
        }
      } else {
        if (stickyHeader) {
          stickyHeader.remove()
          stickyHeader = null
        }
      }
    }

    const handleTableScroll = () => {
      if (!stickyHeader) return
      const rect = table.getBoundingClientRect()
      // actualizar anchos
      const originalThs = thead.querySelectorAll('th')
      const clonedThs = stickyHeader.querySelectorAll('th')
      originalThs.forEach((th, index) => {
        if (clonedThs[index]) {
          const w = th.getBoundingClientRect().width
          clonedThs[index].style.width = `${Math.round(w)}px`
        }
      })
      // ajustar posicion
      stickyHeader.style.left = `${Math.round(rect.left)}px`
      stickyHeader.style.width = `${Math.round(rect.width)}px`
    }

    const initTimeout = setTimeout(() => {
      handleScroll()
      window.addEventListener('scroll', handleScroll)
      window.addEventListener('resize', handleScroll)
      container.addEventListener('scroll', handleTableScroll)
    }, 100)

    return () => {
      clearTimeout(initTimeout)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
      container.removeEventListener('scroll', handleTableScroll)
      if (stickyHeader) stickyHeader.remove()
    }
  }, [loading, reservas])

  // Calcular paginación
  const totalPages = Math.ceil(reservas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReservas = reservas.slice(startIndex, endIndex);

  // Calcular métricas
  const totalReservas = reservas.length;
  const confirmadas = reservas.filter(r => r.estatus === "confirmada").length;
  const pendientes = reservas.filter(r => r.estatus === "pendiente").length;
  const completadas = reservas.filter(r => r.estatus === "completada").length;
  const canceladas = reservas.filter(r => r.estatus === "cancelada").length;

  const formatDate = (dateString) => {
    if (!dateString) return "";
    
    // Extraer solo la parte de la fecha si viene en formato ISO (YYYY-MM-DDTHH:MM:SS.SSSZ)
    const fechaSolo = dateString.split('T')[0];
    
    // Parsear la fecha en zona horaria local para evitar problemas de conversión UTC
    const [year, month, day] = fechaSolo.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    if (isNaN(date.getTime())) return "Invalid Date";
    
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    // timeString viene en formato HH:MM:SS, extraemos HH:MM
    return timeString.substring(0, 5);
  };

  const getEstadoBadgeColor = (estado) => {
    switch(estado) {
      case "confirmada":
        return { border: "#9caf88", color: "#9caf88" };
      case "pendiente":
        return { border: "#d4a574", color: "#d4a574" };
      case "cancelada":
        return { border: "#8b5a2b", color: "#8b5a2b" };
      case "completada":
        return { border: "#9caf88", color: "#9caf88" };
      default:
        return { border: "#c17b4a", color: "#c17b4a" };
    }
  };

  const getAsistenciaBadgeColor = (asistencia) => {
    switch(asistencia) {
      case "presente":
        return { border: "#9caf88", color: "#9caf88", text: "Asistió" };
      case "ausente":
        return { border: "#c17b4a", color: "#c17b4a", text: "Faltó" };
      case "justificado":
        return { border: "#d4a574", color: "#d4a574", text: "Justificado" };
      default:
        return { border: "#e0e0e0", color: "#999", text: "Pendiente" };
    }
  };

  const formatNivel = (nivel) => {
    if (!nivel) return "-";
    const niveles = {
      'paseo': 'Paseo',
      'iniciacion': 'Iniciación',
      'ponyclub': 'Ponyclub',
      'intermedio': 'Intermedio',
      'avanzado': 'Avanzado'
    };
    return niveles[nivel] || nivel;
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
      {/* Notificación */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      
      {/* Header con controles */}
      <div className="controls-container enhanced-controls" style={{ marginBottom: "1.5rem" }}>
        <div className="controls-inner">
          <h2 style={{ margin: 0, color: "var(--primary-brown)" }}>Gestión de Reservas</h2>
        </div>
      </div>

      {/* Métricas - Movidas arriba */}
      {!loading && reservas.length > 0 && (
        <div style={{ 
          marginBottom: "1.5rem", 
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
              {totalReservas}
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
              {confirmadas}
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
              {pendientes}
            </div>
          </div>
          <div style={{ 
            padding: "1rem 1.5rem", 
            background: "rgba(156, 175, 136, 0.1)", 
            borderRadius: "8px",
            border: "2px solid #9caf88"
          }}>
            <div style={{ fontSize: "0.85rem", color: "var(--stone-gray)", marginBottom: "0.3rem" }}>
              Completadas
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#9caf88" }}>
              {completadas}
            </div>
          </div>
          <div style={{ 
            padding: "1rem 1.5rem", 
            background: "rgba(139, 90, 43, 0.1)", 
            borderRadius: "8px",
            border: "2px solid #8b5a2b"
          }}>
            <div style={{ fontSize: "0.85rem", color: "var(--stone-gray)", marginBottom: "0.3rem" }}>
              Canceladas
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#8b5a2b" }}>
              {canceladas}
            </div>
          </div>
        </div>
      )}

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
        <div className="table-container">
          <table className="members-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Hora Inicio</th>
                <th>Hora Fin</th>
                <th>Cliente</th>
                <th>Instructora</th>
                <th>Caballo</th>
                <th>Clase</th>
                <th>Tipo</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {reservas.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
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
                currentReservas.map(reserva => {
                  const estadoColor = getEstadoBadgeColor(reserva.estatus);
                  
                  return (
                    <tr key={reserva.id}>
                      <td style={{ fontWeight: "600" }}>{formatDate(reserva.fecha)}</td>
                      <td style={{ fontWeight: "600", color: "var(--primary-brown)" }}>
                        {formatTime(reserva.hora_inicio)}
                      </td>
                      <td style={{ fontWeight: "600", color: "var(--primary-brown)" }}>
                        {formatTime(reserva.hora_fin)}
                      </td>
                      <td style={{ color: "var(--charcoal)" }}>
                        {reserva.cliente_nombre && reserva.cliente_apellido 
                          ? `${reserva.cliente_nombre} ${reserva.cliente_apellido}`
                          : "Sin cliente"}
                      </td>
                      <td style={{ color: "var(--stone-gray)" }}>
                        {reserva.instructora_nombre && reserva.instructora_apellido
                          ? `${reserva.instructora_nombre} ${reserva.instructora_apellido}`
                          : "Sin instructora"}
                      </td>
                      <td style={{ fontWeight: "600", color: "var(--primary-brown)" }}>
                        {reserva.caballo_nombre || "Sin caballo"}
                      </td>
                      <td style={{ color: "var(--charcoal)" }}>
                        {reserva.clase_nombre || "Sin clase"}
                      </td>
                      <td style={{ color: "var(--charcoal)" }}>
                        <span style={{
                          padding: "0.25rem 0.5rem",
                          borderRadius: "4px",
                          fontSize: "0.85rem",
                          background: reserva.tipo === "propietario" ? "rgba(156, 175, 136, 0.1)" :
                                     reserva.tipo === "renta" ? "rgba(193, 123, 74, 0.1)" :
                                     reserva.tipo === "media_renta" ? "rgba(212, 165, 116, 0.1)" :
                                     "rgba(107, 68, 35, 0.05)",
                          color: reserva.tipo === "propietario" ? "#9caf88" :
                                reserva.tipo === "renta" ? "#c17b4a" :
                                reserva.tipo === "media_renta" ? "#d4a574" :
                                "var(--charcoal)"
                        }}>
                          {reserva.tipo === "propietario" ? "Propietario" :
                           reserva.tipo === "renta" ? "Renta" :
                           reserva.tipo === "media_renta" ? "Media Renta" :
                           "Normal"}
                        </span>
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
                          {reserva.estatus.charAt(0).toUpperCase() + reserva.estatus.slice(1)}
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

      {/* Paginación */}
      {!loading && reservas.length > itemsPerPage && (
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "1rem",
          marginTop: "2rem",
          padding: "1rem"
        }}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            style={{
              padding: "0.5rem 1rem",
              border: "2px solid var(--terracotta)",
              borderRadius: "8px",
              background: currentPage === 1 ? "#f5f5f5" : "white",
              color: currentPage === 1 ? "#999" : "var(--terracotta)",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontWeight: "600",
              transition: "all 0.2s ease"
            }}
          >
            <ChevronLeft size={18} />
            Anterior
          </button>
          
          <div style={{
            display: "flex",
            gap: "0.5rem",
            alignItems: "center"
          }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                style={{
                  padding: "0.5rem 0.75rem",
                  border: currentPage === page ? "2px solid var(--terracotta)" : "2px solid #ddd",
                  borderRadius: "6px",
                  background: currentPage === page ? "var(--terracotta)" : "white",
                  color: currentPage === page ? "white" : "var(--primary-brown)",
                  cursor: "pointer",
                  fontWeight: currentPage === page ? "700" : "500",
                  minWidth: "40px",
                  transition: "all 0.2s ease"
                }}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: "0.5rem 1rem",
              border: "2px solid var(--terracotta)",
              borderRadius: "8px",
              background: currentPage === totalPages ? "#f5f5f5" : "white",
              color: currentPage === totalPages ? "#999" : "var(--terracotta)",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontWeight: "600",
              transition: "all 0.2s ease"
            }}
          >
            Siguiente
            <ChevronRight size={18} />
          </button>

          <div style={{
            marginLeft: "1rem",
            color: "var(--stone-gray)",
            fontSize: "0.9rem"
          }}>
            Mostrando {startIndex + 1} - {Math.min(endIndex, reservas.length)} de {reservas.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservasAdmin;
