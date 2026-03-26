import React, { useState, useEffect } from "react";
import { Loader, Calendar, ChevronLeft, ChevronRight, Search } from "lucide-react";

const ReservasAdmin = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [filtroTiempo, setFiltroTiempo] = useState("dia"); // "dia" o "semana"
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split("T")[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");
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
      let url = "http://localhost:3001/api/reservas-admin";
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

  // Filtrar reservas
  const filteredReservas = reservas.filter(r => {
    const clienteNombre = r.cliente_nombre && r.cliente_apellido ? `${r.cliente_nombre} ${r.cliente_apellido}` : "";
    const instructoraNombre = r.instructora_nombre && r.instructora_apellido ? `${r.instructora_nombre} ${r.instructora_apellido}` : "";
    const matchesSearch = searchTerm === "" ||
      clienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructoraNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.caballo_nombre && r.caballo_nombre.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesEstado = estadoFilter === "" || r.estatus === estadoFilter;
    return matchesSearch && matchesEstado;
  });

  // Calcular paginación sobre filtrados
  const totalPages = Math.ceil(filteredReservas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReservas = filteredReservas.slice(startIndex, endIndex);

  // Calcular metricas (siempre sobre todas las del periodo)
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

      {/* Metricas */}
      {!loading && reservas.length > 0 && (
        <div className="stats-grid caballos-stats" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
          <div className="stat-card">
            <div className="stat-card-topline topline-terracotta"></div>
            <div className="stat-title">Total</div>
            <div className="stat-value">{totalReservas}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-topline topline-sage"></div>
            <div className="stat-title">Confirmadas</div>
            <div className="stat-value">{confirmadas}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-topline topline-light"></div>
            <div className="stat-title">Pendientes</div>
            <div className="stat-value">{pendientes}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-topline topline-sage"></div>
            <div className="stat-title">Completadas</div>
            <div className="stat-value">{completadas}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-topline topline-brown"></div>
            <div className="stat-title">Canceladas</div>
            <div className="stat-value">{canceladas}</div>
          </div>
        </div>
      )}

      {/* Barra de busqueda y filtros */}
      <div className="controls-bar">
        <div className="controls-search">
          <Search size={18} className="controls-search-icon" />
          <input
            type="text"
            className="controls-search-input"
            placeholder="Buscar por cliente, instructora o caballo..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            autoComplete="off"
          />
        </div>
        <div className="controls-filters">
          <div className="controls-filter-item">
            <label className="controls-filter-label">Periodo</label>
            <select className="controls-filter-select" value={filtroTiempo} onChange={(e) => setFiltroTiempo(e.target.value)}>
              <option value="dia">Por dia</option>
              <option value="semana">Por semana</option>
            </select>
          </div>
          <div className="controls-filter-item">
            <label className="controls-filter-label">Fecha</label>
            <input
              type="date"
              className="controls-filter-select"
              value={fechaSeleccionada}
              onChange={(e) => setFechaSeleccionada(e.target.value)}
              style={{ minWidth: "140px" }}
            />
          </div>
          <div className="controls-filter-item">
            <label className={`controls-filter-label ${estadoFilter ? "label-active" : ""}`}>Estado</label>
            <select className={`controls-filter-select ${estadoFilter ? "filter-active" : ""}`} value={estadoFilter} onChange={(e) => { setEstadoFilter(e.target.value); setCurrentPage(1); }}>
              <option value="">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="confirmada">Confirmada</option>
              <option value="completada">Completada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
        </div>
        {filtroTiempo === "semana" && (
          <div style={{ fontSize: "0.8rem", color: "var(--secondary-brown)", fontWeight: "500" }}>
            Semana: {getRangoSemana()}
          </div>
        )}
      </div>

      {/* Tabla de reservas */}
      {loading ? (
        <div className="loading-container">
          <Loader size={40} className="spin loading-spinner" />
          <div className="loading-text">Cargando reservas...</div>
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
              {currentReservas.length === 0 ? (
                <tr>
                  <td colSpan={9} className="empty-state-cell">
                    {searchTerm || estadoFilter
                      ? "No se encontraron reservas con los filtros aplicados."
                      : filtroTiempo === "dia"
                        ? `No hay reservas para el ${formatDate(fechaSeleccionada)}`
                        : "No hay reservas para la semana seleccionada"
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

      {/* Paginacion */}
      {!loading && filteredReservas.length > itemsPerPage && (
        <div className="pagination-container">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={18} />
            <span>Anterior</span>
          </button>
          <div className="pagination-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={currentPage === page ? "pagination-page pagination-page-active" : "pagination-page"}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            <span>Siguiente</span>
            <ChevronRight size={18} />
          </button>
          <div className="pagination-info">
            Mostrando {startIndex + 1} - {Math.min(endIndex, filteredReservas.length)} de {filteredReservas.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservasAdmin;
