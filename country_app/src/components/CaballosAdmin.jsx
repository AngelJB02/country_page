import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { Loader, UserPlus, Trash2, Edit, ChevronLeft, ChevronRight } from "lucide-react";

const CaballosAdmin = () => {
  const [caballos, setCaballos] = useState([]);
  const [propietarios, setPropietarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addHorseModalOpen, setAddHorseModalOpen] = useState(false);
  const [editHorseModalOpen, setEditHorseModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [newHorse, setNewHorse] = useState({
    nombre: "",
    propietario_id: "",
    disponibilidad: "disponible",
    estatus: "publico",
    especialidad: [],
    descripcion: ""
  });
  const [editingHorse, setEditingHorse] = useState(null);
  const [creatingHorse, setCreatingHorse] = useState(false);
  const [updatingHorse, setUpdatingHorse] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [deletingHorseId, setDeletingHorseId] = useState(null);
  const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false);
  const [horseToDelete, setHorseToDelete] = useState(null);

  // Función para mostrar notificaciones
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 4000);
  };

  // Funciones para manejar especialidades múltiples
  const especialidadesDisponibles = ['iniciacion', 'paseo', 'intermedio', 'salto'];
  
  const parseEspecialidades = (especialidadString) => {
    if (!especialidadString) return [];
    return especialidadString.split(',').filter(e => e.trim() !== '');
  };

  const formatEspecialidades = (especialidadesArray) => {
    if (!especialidadesArray || especialidadesArray.length === 0) return '';
    return especialidadesArray.join(',');
  };

  const handleEspecialidadToggle = (especialidad, isNewHorse = true) => {
    const currentEspecialidades = isNewHorse ? newHorse.especialidad : editingHorse.especialidad;
    const newEspecialidades = currentEspecialidades.includes(especialidad)
      ? currentEspecialidades.filter(e => e !== especialidad)
      : [...currentEspecialidades, especialidad];
    
    if (isNewHorse) {
      setNewHorse({ ...newHorse, especialidad: newEspecialidades });
    } else {
      setEditingHorse({ ...editingHorse, especialidad: newEspecialidades });
    }
  };

  // Cargar lista de caballos desde el endpoint
  useEffect(() => {
    loadCaballos();
    loadPropietarios();
  }, []);

  const loadPropietarios = async () => {
    try {
      const response = await fetch("https://elrefugiocountryclub.com/api/pi/reservas/propietarios");
      if (response.ok) {
        const data = await response.json();
        setPropietarios(data);
      } else {
        console.error("Error al cargar propietarios");
        setPropietarios([]);
      }
    } catch (error) {
      console.error("Error al cargar propietarios:", error);
      setPropietarios([]);
    }
  };

  const loadCaballos = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://elrefugiocountryclub.com/api/pi/caballos");
      if (response.ok) {
        const data = await response.json();
        setCaballos(data);
      } else {
        showNotification("Error al cargar los caballos", "error");
        setCaballos([]);
      }
    } catch (error) {
      console.error("Error al cargar caballos:", error);
      showNotification("Error de conexión al cargar caballos", "error");
      setCaballos([]);
    } finally {
      setLoading(false);
    }
  };

  const openAddHorseModal = () => {
    setNewHorse({
      nombre: "",
      propietario_id: "",
      disponibilidad: "disponible",
      estatus: "publico",
      especialidad: [],
      descripcion: ""
    });
    setAddHorseModalOpen(true);
  };

  const closeAddHorseModal = () => {
    setAddHorseModalOpen(false);
    setNewHorse({
      nombre: "",
      propietario_id: "",
      disponibilidad: "disponible",
      estatus: "publico",
      especialidad: "mixto",
      descripcion: ""
    });
  };

  const openEditHorseModal = (caballo) => {
    setEditingHorse({
      ...caballo,
      propietario_id: caballo.propietario_id || "",
      especialidad: parseEspecialidades(caballo.especialidad)
    });
    setEditHorseModalOpen(true);
  };

  const closeEditHorseModal = () => {
    setEditHorseModalOpen(false);
    setEditingHorse(null);
  };

  const updateHorse = async () => {
    if (updatingHorse) return;
    setUpdatingHorse(true);
    
    try {
      // Validaciones
      if (!editingHorse.nombre || editingHorse.nombre.trim() === "") {
        showNotification("Por favor completa el nombre del caballo", "error");
        setUpdatingHorse(false);
        return;
      }

      // Preparar datos para enviar
      const horseData = {
        nombre: editingHorse.nombre.trim(),
        propietario_id: editingHorse.propietario_id ? parseInt(editingHorse.propietario_id) : null,
        disponibilidad: editingHorse.disponibilidad,
        estatus: editingHorse.estatus,
        especialidad: editingHorse.especialidad, // Enviar como array
        descripcion: editingHorse.descripcion.trim()
      };

      const response = await fetch(`https://elrefugiocountryclub.com/api/pi/caballos/${editingHorse.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(horseData),
      });

      if (response.ok) {
        showNotification("Caballo actualizado correctamente", "success");
        closeEditHorseModal();
        loadCaballos(); // Recargar la lista
      } else {
        const error = await response.json();
        showNotification("Error al actualizar caballo: " + (error?.error ?? "Error desconocido"), "error");
      }
    } catch (error) {
      console.error("Error al actualizar caballo:", error);
      showNotification("Error de conexión. Inténtalo de nuevo.", "error");
    } finally {
      setUpdatingHorse(false);
    }
  };

  const openConfirmDeleteModal = (caballo) => {
    setHorseToDelete(caballo);
    setConfirmDeleteModalOpen(true);
  };

  const closeConfirmDeleteModal = () => {
    setHorseToDelete(null);
    setConfirmDeleteModalOpen(false);
  };

  const deleteHorse = async () => {
    if (!horseToDelete) return;
    
    setDeletingHorseId(horseToDelete.id);
    try {
      const response = await fetch(`https://elrefugiocountryclub.com/api/pi/caballos/${horseToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        showNotification("Caballo dado de baja correctamente", "success");
        closeConfirmDeleteModal();
        loadCaballos(); // Recargar la lista
        setCurrentPage(1); // Resetear a la primera página
      } else {
        const error = await response.json();
        showNotification("Error al dar de baja: " + (error?.error ?? "Error desconocido"), "error");
      }
    } catch (error) {
      console.error("Error al eliminar caballo:", error);
      showNotification("Error de conexión. Inténtalo de nuevo.", "error");
    } finally {
      setDeletingHorseId(null);
    }
  };

  const createNewHorse = async () => {
    if (creatingHorse) return;
    setCreatingHorse(true);
    
    try {
      // Validaciones
      if (!newHorse.nombre || newHorse.nombre.trim() === "") {
        showNotification("Por favor completa el nombre del caballo", "error");
        setCreatingHorse(false);
        return;
      }

      // Preparar datos para enviar
      const horseData = {
        nombre: newHorse.nombre.trim(),
        propietario_id: newHorse.propietario_id ? parseInt(newHorse.propietario_id) : null,
        disponibilidad: newHorse.disponibilidad,
        estatus: newHorse.estatus,
        especialidad: newHorse.especialidad, // Enviar como array
        descripcion: newHorse.descripcion.trim()
      };

      console.log('🐎 Enviando datos del caballo:', horseData);

      const response = await fetch("https://elrefugiocountryclub.com/api/pi/caballos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(horseData),
      });

      if (response.ok) {
        const result = await response.json();
        showNotification("Caballo agregado correctamente", "success");
        closeAddHorseModal();
        // Recargar la lista y luego ir a la última página
        const updatedCaballos = [...caballos, result];
        setCaballos(updatedCaballos);
        const newTotalPages = Math.ceil(updatedCaballos.length / itemsPerPage);
        setCurrentPage(newTotalPages);
        // También recargar desde el servidor para asegurar consistencia
        loadCaballos();
      } else {
        const error = await response.json();
        console.error('❌ Error del servidor:', error);
        showNotification("Error al agregar caballo: " + (error?.error ?? error?.message ?? "Error desconocido"), "error");
      }
    } catch (error) {
      console.error("Error al crear caballo:", error);
      showNotification("Error de conexión. Inténtalo de nuevo.", "error");
    } finally {
      setCreatingHorse(false);
    }
  };

  const renderPortal = (node) => ReactDOM.createPortal(node, document.body);

  // Calcular paginación
  const totalPages = Math.ceil(caballos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCaballos = caballos.slice(startIndex, endIndex);

  // Calcular métricas
  const totalCaballos = caballos.length;
  const disponibles = caballos.filter(c => c.disponibilidad === "disponible").length;
  const noDisponibles = caballos.filter(c => c.disponibilidad === "no_disponible").length;
  const publicos = caballos.filter(c => c.estatus === "publico").length;
  const privados = caballos.filter(c => c.estatus === "privado").length;
  const renta = caballos.filter(c => c.estatus === "renta").length;
  const mediaRenta = caballos.filter(c => c.estatus === "media_renta").length;

  useEffect(() => {
    if (loading) return;
    const container = document.querySelector('.caballos-admin-container .table-container')
    const table = container?.querySelector('.members-table');
    const thead = table?.querySelector('thead');
    if (!container || !table || !thead) return;

    let stickyHeader = null;

    const calculateHeaderPosition = () => {
      const tableRect = table.getBoundingClientRect();
      const theadRect = thead.getBoundingClientRect();
      return { tableRect, theadRect };
    };

    const handleTableScroll = () => {
      if (!stickyHeader) return;
      const rect = table.getBoundingClientRect();
      // actualizar anchos con getBoundingClientRect
      const originalThs = thead.querySelectorAll('th');
      const clonedThs = stickyHeader.querySelectorAll('th');
      originalThs.forEach((th, index) => {
        if (clonedThs[index]) {
          const w = th.getBoundingClientRect().width;
          clonedThs[index].style.width = `${Math.round(w)}px`;
        }
      });
      // ajustar posicion relativa al viewport
      const left = Math.round(rect.left);
      stickyHeader.style.left = `${left}px`;
      stickyHeader.style.width = `${Math.round(rect.width)}px`;
    };

    const handleScroll = () => {
      const { tableRect, theadRect } = calculateHeaderPosition();
      if (theadRect.top <= 0 && tableRect.bottom > 100) {
        if (!stickyHeader) {
          stickyHeader = thead.cloneNode(true);
          stickyHeader.style.position = 'fixed';
          stickyHeader.style.top = '0';
          stickyHeader.style.zIndex = '999';
          stickyHeader.classList.add('sticky-clone');
          stickyHeader.style.display = 'table';

          // copiar anchos iniciales usando getBoundingClientRect
          const originalThs = thead.querySelectorAll('th');
          const clonedThs = stickyHeader.querySelectorAll('th');
          originalThs.forEach((th, index) => {
            if (clonedThs[index]) {
              const w = th.getBoundingClientRect().width;
              clonedThs[index].style.width = `${Math.round(w)}px`;
            }
          });

          document.body.appendChild(stickyHeader);
        }
        if (stickyHeader) {
          const rect = table.getBoundingClientRect();
          stickyHeader.style.left = `${Math.round(rect.left)}px`;
          stickyHeader.style.width = `${Math.round(rect.width)}px`;
          stickyHeader.style.display = 'table-header-group';

          // actualizar anchos precisos
          const originalThs2 = thead.querySelectorAll('th');
          const clonedThs2 = stickyHeader.querySelectorAll('th');
          originalThs2.forEach((th, index) => {
            if (clonedThs2[index]) {
              const w = th.getBoundingClientRect().width;
              clonedThs2[index].style.width = `${Math.round(w)}px`;
            }
          });

          // sincronizar horizontal
          handleTableScroll();
        }
      } else {
        if (stickyHeader) {
          stickyHeader.remove();
          stickyHeader = null;
        }
      }
    };

    const initTimeout = setTimeout(() => {
      handleScroll();
      window.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', handleScroll);
      container.addEventListener('scroll', handleTableScroll);
    }, 100);

    return () => {
      clearTimeout(initTimeout);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      container.removeEventListener('scroll', handleTableScroll);
      if (stickyHeader) {
        stickyHeader.remove();
      }
    };
  }, [loading, caballos, currentPage]);

  return (
    <div className="caballos-admin-container">
      <div className="controls-container enhanced-controls" style={{ marginBottom: "1.5rem" }}>
        <div className="controls-inner">
          <h2 style={{ margin: 0, color: "var(--primary-brown)" }}>Gestión de Caballos</h2>
          <button className="add-client-btn" onClick={openAddHorseModal} type="button">
            <UserPlus size={20} /> Nuevo Caballo
          </button>
        </div>
      </div>

      {/* Métricas - Arriba de la tabla */}
      {!loading && caballos.length > 0 && (
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
              Total Caballos
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#9caf88" }}>
              {totalCaballos}
            </div>
          </div>
          <div style={{ 
            padding: "1rem 1.5rem", 
            background: "rgba(156, 175, 136, 0.1)", 
            borderRadius: "8px",
            border: "2px solid #9caf88"
          }}>
            <div style={{ fontSize: "0.85rem", color: "var(--stone-gray)", marginBottom: "0.3rem" }}>
              Disponibles
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#9caf88" }}>
              {disponibles}
            </div>
          </div>
          <div style={{ 
            padding: "1rem 1.5rem", 
            background: "rgba(139, 90, 43, 0.1)", 
            borderRadius: "8px",
            border: "2px solid #8b5a2b"
          }}>
            <div style={{ fontSize: "0.85rem", color: "var(--stone-gray)", marginBottom: "0.3rem" }}>
              No Disponibles
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#8b5a2b" }}>
              {noDisponibles}
            </div>
          </div>
          <div style={{ 
            padding: "1rem 1.5rem", 
            background: "rgba(193, 123, 74, 0.1)", 
            borderRadius: "8px",
            border: "2px solid #c17b4a"
          }}>
            <div style={{ fontSize: "0.85rem", color: "var(--stone-gray)", marginBottom: "0.3rem" }}>
              Públicos
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#c17b4a" }}>
              {publicos}
            </div>
          </div>
          <div style={{ 
            padding: "1rem 1.5rem", 
            background: "rgba(212, 165, 116, 0.1)", 
            borderRadius: "8px",
            border: "2px solid #d4a574"
          }}>
            <div style={{ fontSize: "0.85rem", color: "var(--stone-gray)", marginBottom: "0.3rem" }}>
              Privados
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#d4a574" }}>
              {privados}
            </div>
          </div>
          <div style={{ 
            padding: "1rem 1.5rem", 
            background: "rgba(193, 123, 74, 0.1)", 
            borderRadius: "8px",
            border: "2px solid #c17b4a"
          }}>
            <div style={{ fontSize: "0.85rem", color: "var(--stone-gray)", marginBottom: "0.3rem" }}>
              Renta
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#c17b4a" }}>
              {renta}
            </div>
          </div>
          <div style={{ 
            padding: "1rem 1.5rem", 
            background: "rgba(212, 165, 116, 0.1)", 
            borderRadius: "8px",
            border: "2px solid #d4a574"
          }}>
            <div style={{ fontSize: "0.85rem", color: "var(--stone-gray)", marginBottom: "0.3rem" }}>
              Media Renta
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#d4a574" }}>
              {mediaRenta}
            </div>
          </div>
        </div>
      )}
      
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
            Cargando caballos...
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table className="members-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Propietario</th>
                <th>Disponibilidad</th>
                <th>Estatus</th>
                <th>Especialidad</th>
                <th>Descripción</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {caballos.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      textAlign: "center",
                      padding: "3rem",
                      color: "var(--terracotta)",
                      fontSize: "1.1rem",
                      fontWeight: "600",
                    }}
                  >
                    No hay caballos registrados.
                  </td>
                </tr>
              ) : (
                currentCaballos.map(caballo => (
                  <tr key={caballo.id}>
                    <td style={{ fontWeight: "600" }}>{caballo.nombre}</td>
                    <td style={{ color: "var(--stone-gray)" }}>
                      {caballo.propietario_nombre || <span style={{ fontStyle: "italic", color: "#999" }}>Sin propietario</span>}
                    </td>
                    <td>
                      <select
                        className="status-badge"
                        value={caballo.disponibilidad}
                        onChange={async (e) => {
                          const newDisponibilidad = e.target.value;
                          try {
                            const response = await fetch(
                              `https://elrefugiocountryclub.com/api/pi/caballos/${caballo.id}/disponibilidad`,
                              {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ disponibilidad: newDisponibilidad }),
                              }
                            );
                            
                            if (response.ok) {
                              setCaballos(prev => prev.map(c => 
                                c.id === caballo.id ? {...c, disponibilidad: newDisponibilidad} : c
                              ));
                              showNotification("Disponibilidad actualizada correctamente", "success");
                            } else {
                              const error = await response.json();
                              showNotification("Error al actualizar: " + (error?.error ?? "Error desconocido"), "error");
                            }
                          } catch (error) {
                            console.error("Error al actualizar disponibilidad:", error);
                            showNotification("Error de conexión", "error");
                          }
                        }}
                        style={{
                          borderColor: caballo.disponibilidad === "disponible" ? "#9caf88" : "#8b5a2b",
                          color: caballo.disponibilidad === "disponible" ? "#9caf88" : "#8b5a2b",
                        }}
                      >
                        <option value="disponible">Disponible</option>
                        <option value="no_disponible">No disponible</option>
                      </select>
                    </td>
                    <td>
                      <select
                        className="status-badge"
                        value={caballo.estatus}
                        onChange={async (e) => {
                          const newEstatus = e.target.value;
                          try {
                            const response = await fetch(
                              `https://elrefugiocountryclub.com/api/pi/caballos/${caballo.id}/estatus`,
                              {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ estatus: newEstatus }),
                              }
                            );
                            
                            if (response.ok) {
                              setCaballos(prev => prev.map(c => 
                                c.id === caballo.id ? {...c, estatus: newEstatus} : c
                              ));
                              showNotification("Estatus actualizado correctamente", "success");
                            } else {
                              const error = await response.json();
                              showNotification("Error al actualizar: " + (error?.error ?? "Error desconocido"), "error");
                            }
                          } catch (error) {
                            console.error("Error al actualizar estatus:", error);
                            showNotification("Error de conexión", "error");
                          }
                        }}
                        style={{
                          borderColor: "#c17b4a",
                          color: "#c17b4a",
                        }}
                      >
                        <option value="publico">Público</option>
                        <option value="privado">Privado</option>
                        <option value="renta">Renta</option>
                        <option value="media_renta">Media Renta</option>
                      </select>
                    </td>
                    <td style={{ fontWeight: "600", color: "var(--primary-brown)" }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                        {parseEspecialidades(caballo.especialidad).map(esp => (
                          <span 
                            key={esp}
                            style={{
                              backgroundColor: '#e8f5e8',
                              color: '#2d5016',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '500',
                              textTransform: 'capitalize',
                              border: '1px solid #9caf88'
                            }}
                          >
                            {esp}
                          </span>
                        ))}
                        {parseEspecialidades(caballo.especialidad).length === 0 && (
                          <span style={{ fontStyle: 'italic', color: '#999', fontSize: '0.9rem' }}>
                            Sin especialidades
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ color: "var(--charcoal)" }}>{caballo.descripcion || "—"}</td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          className="btn"
                          onClick={() => openEditHorseModal(caballo)}
                          type="button"
                          style={{
                            background: "linear-gradient(135deg, var(--terracotta), var(--primary-brown))",
                            color: "white",
                            border: "none",
                            padding: "0.5rem 1rem",
                            borderRadius: "6px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            fontSize: "0.9rem"
                          }}
                        >
                          <Edit size={16} />
                          Editar
                        </button>
                        <button
                          className="btn"
                          onClick={() => openConfirmDeleteModal(caballo)}
                          type="button"
                          disabled={deletingHorseId === caballo.id}
                          style={{
                            background: "linear-gradient(135deg, #8b5a2b, #6b4423)",
                            color: "white",
                            border: "none",
                            padding: "0.5rem 1rem",
                            borderRadius: "6px",
                            cursor: deletingHorseId === caballo.id ? "not-allowed" : "pointer",
                            opacity: deletingHorseId === caballo.id ? 0.6 : 1,
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            fontSize: "0.9rem"
                          }}
                        >
                          <Trash2 size={16} />
                          {deletingHorseId === caballo.id ? "Eliminando..." : "Eliminar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginación */}
      {!loading && caballos.length > itemsPerPage && (
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
            Mostrando {startIndex + 1} - {Math.min(endIndex, caballos.length)} de {caballos.length}
          </div>
        </div>
      )}
      
      {/* Modal de confirmación de eliminación (Portal) */}
      {confirmDeleteModalOpen && horseToDelete &&
        renderPortal(
          <div className="modal-overlay" onClick={closeConfirmDeleteModal}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: "500px" }}>
              <h2 style={{ color: "#8b5a2b" }}>¿Confirmar Baja de Caballo?</h2>
              <div style={{ padding: "1.5rem 0" }}>
                <p style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>
                  ¿Estás seguro de que deseas dar de baja al caballo <strong>{horseToDelete.nombre}</strong>?
                </p>
                <p style={{ color: "var(--stone-gray)", fontSize: "0.95rem" }}>
                  Esta acción no se puede deshacer. El caballo será eliminado permanentemente del sistema.
                </p>
                {horseToDelete.propietario_nombre && (
                  <p style={{ color: "var(--terracotta)", fontSize: "0.95rem", marginTop: "1rem" }}>
                    <strong>Propietario:</strong> {horseToDelete.propietario_nombre}
                  </p>
                )}
              </div>
              <div className="modal-actions">
                <button 
                  className="btn" 
                  onClick={deleteHorse} 
                  type="button"
                  disabled={deletingHorseId !== null}
                  style={{
                    background: "linear-gradient(135deg, #8b5a2b, #6b4423)",
                    color: "white"
                  }}
                >
                  <Trash2 size={16} /> {deletingHorseId ? "Eliminando..." : "Sí, Dar de Baja"}
                </button>
                <button 
                  className="btn" 
                  onClick={closeConfirmDeleteModal} 
                  type="button"
                  disabled={deletingHorseId !== null}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      
      {/* Modal de edición de caballo (Portal) */}
      {editHorseModalOpen && editingHorse &&
        renderPortal(
          <div className="modal-overlay" onClick={closeEditHorseModal}>
            <div className="modal-content add-horse-modal" onClick={e => e.stopPropagation()}>
              <h2>Editar Caballo</h2>
              <div className="modal-section">
                <h3>Información del Caballo</h3>
                <div className="modal-field">
                  <label>Nombre *:</label>
                  <input
                    type="text"
                    value={editingHorse.nombre}
                    onChange={e => setEditingHorse({ ...editingHorse, nombre: e.target.value })}
                    placeholder="Nombre del caballo"
                    autoComplete="off"
                    name="edithorse-nombre"
                  />
                </div>
                <div className="modal-field">
                  <label>Propietario - Opcional:</label>
                  <select
                    value={editingHorse.propietario_id || ""}
                    onChange={e => setEditingHorse({ ...editingHorse, propietario_id: e.target.value })}
                    name="edithorse-propietario"
                    autoComplete="off"
                  >
                    <option value="">Sin propietario</option>
                    {propietarios.map(prop => (
                      <option key={prop.id} value={prop.id}>
                        {prop.nombre} {prop.apellido} - ID: {prop.id}
                      </option>
                    ))}
                  </select>
                  <small style={{ color: "var(--stone-gray)", fontSize: "0.85rem", marginTop: "0.3rem", display: "block" }}>
                    Solo aplica para caballos con propietarios específicos
                  </small>
                </div>
                <div className="modal-field">
                  <label>Disponibilidad:</label>
                  <select
                    value={editingHorse.disponibilidad}
                    onChange={e => setEditingHorse({ ...editingHorse, disponibilidad: e.target.value })}
                    name="edithorse-disponibilidad"
                    autoComplete="off"
                  >
                    <option value="disponible">Disponible</option>
                    <option value="no_disponible">No disponible</option>
                  </select>
                </div>
                <div className="modal-field">
                  <label>Estatus:</label>
                  <select
                    value={editingHorse.estatus}
                    onChange={e => setEditingHorse({ ...editingHorse, estatus: e.target.value })}
                    name="edithorse-estatus"
                    autoComplete="off"
                  >
                    <option value="publico">Público</option>
                    <option value="privado">Privado</option>
                    <option value="renta">Renta</option>
                    <option value="media_renta">Media Renta</option>
                  </select>
                </div>
                <div className="modal-field">
                  <label>Especialidades:</label>
                  <div className="especialidades-checkbox-container" style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                    gap: '0.5rem',
                    marginTop: '0.5rem'
                  }}>
                    {especialidadesDisponibles.map(esp => (
                      <label key={esp} className="especialidad-checkbox-label" style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        padding: '0.5rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        backgroundColor: editingHorse.especialidad.includes(esp) ? '#e8f5e8' : '#fff'
                      }}>
                        <input
                          type="checkbox"
                          checked={editingHorse.especialidad.includes(esp)}
                          onChange={() => handleEspecialidadToggle(esp, false)}
                        />
                        <span style={{ fontSize: '0.9rem', textTransform: 'capitalize' }}>
                          {esp}
                        </span>
                      </label>
                    ))}
                  </div>
                  <small style={{ color: "var(--stone-gray)", fontSize: "0.85rem", marginTop: "0.3rem", display: "block" }}>
                    Selecciona una o más especialidades para este caballo
                  </small>
                </div>
                <div className="modal-field">
                  <label>Descripción:</label>
                  <textarea
                    value={editingHorse.descripcion}
                    onChange={e => setEditingHorse({ ...editingHorse, descripcion: e.target.value })}
                    placeholder="Descripción del caballo"
                    name="edithorse-descripcion"
                    rows={3}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button className="btn btn-primary" onClick={updateHorse} type="button" disabled={updatingHorse}>
                  <Edit size={16} /> {updatingHorse ? "Actualizando..." : "Actualizar Caballo"}
                </button>
                <button className="btn btn-secondary" onClick={closeEditHorseModal} type="button">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      
      {/* Modal de alta de caballo (Portal) */}
      {addHorseModalOpen &&
        renderPortal(
          <div className="modal-overlay" onClick={closeAddHorseModal}>
            <div className="modal-content add-horse-modal" onClick={e => e.stopPropagation()}>
              <h2>Agregar Nuevo Caballo</h2>
              <div className="modal-section">
                <h3>Información del Caballo</h3>
                <div className="modal-field">
                  <label>Nombre *:</label>
                  <input
                    type="text"
                    value={newHorse.nombre}
                    onChange={e => setNewHorse({ ...newHorse, nombre: e.target.value })}
                    placeholder="Nombre del caballo"
                    autoComplete="off"
                    name="newhorse-nombre"
                  />
                </div>
                <div className="modal-field">
                  <label>Propietario - Opcional:</label>
                  <select
                    value={newHorse.propietario_id || ""}
                    onChange={e => setNewHorse({ ...newHorse, propietario_id: e.target.value })}
                    name="newhorse-propietario"
                    autoComplete="off"
                  >
                    <option value="">Sin propietario</option>
                    {propietarios.map(prop => (
                      <option key={prop.id} value={prop.id}>
                        {prop.nombre} {prop.apellido} - ID: {prop.id}
                      </option>
                    ))}
                  </select>
                  <small style={{ color: "var(--stone-gray)", fontSize: "0.85rem", marginTop: "0.3rem", display: "block" }}>
                    Solo aplica para caballos con propietarios específicos
                  </small>
                </div>
                <div className="modal-field">
                  <label>Disponibilidad:</label>
                  <select
                    value={newHorse.disponibilidad}
                    onChange={e => setNewHorse({ ...newHorse, disponibilidad: e.target.value })}
                    name="newhorse-disponibilidad"
                    autoComplete="off"
                  >
                    <option value="disponible">Disponible</option>
                    <option value="no_disponible">No disponible</option>
                  </select>
                </div>
                <div className="modal-field">
                  <label>Estatus:</label>
                  <select
                    value={newHorse.estatus}
                    onChange={e => setNewHorse({ ...newHorse, estatus: e.target.value })}
                    name="newhorse-estatus"
                    autoComplete="off"
                  >
                    <option value="publico">Público</option>
                    <option value="privado">Privado</option>
                    <option value="renta">Renta</option>
                    <option value="media_renta">Media Renta</option>
                  </select>
                </div>
                <div className="modal-field">
                  <label>Especialidades:</label>
                  <div className="especialidades-checkbox-container" style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                    gap: '0.5rem',
                    marginTop: '0.5rem'
                  }}>
                    {especialidadesDisponibles.map(esp => (
                      <label key={esp} className="especialidad-checkbox-label" style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        padding: '0.5rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        backgroundColor: newHorse.especialidad.includes(esp) ? '#e8f5e8' : '#fff'
                      }}>
                        <input
                          type="checkbox"
                          checked={newHorse.especialidad.includes(esp)}
                          onChange={() => handleEspecialidadToggle(esp, true)}
                        />
                        <span style={{ fontSize: '0.9rem', textTransform: 'capitalize' }}>
                          {esp}
                        </span>
                      </label>
                    ))}
                  </div>
                  <small style={{ color: "var(--stone-gray)", fontSize: "0.85rem", marginTop: "0.3rem", display: "block" }}>
                    Selecciona una o más especialidades para este caballo
                  </small>
                </div>
                <div className="modal-field">
                  <label>Descripción:</label>
                  <textarea
                    value={newHorse.descripcion}
                    onChange={e => setNewHorse({ ...newHorse, descripcion: e.target.value })}
                    placeholder="Descripción del caballo"
                    name="newhorse-descripcion"
                    rows={3}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button className="btn btn-primary" onClick={createNewHorse} type="button" disabled={creatingHorse}>
                  <UserPlus size={16} /> {creatingHorse ? "Agregando..." : "Agregar Caballo"}
                </button>
                <button className="btn btn-secondary" onClick={closeAddHorseModal} type="button">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      
      {/* NOTIFICACIÓN (Portal) */}
      {notification.show &&
        renderPortal(
          <div className={`notification ${notification.type}`}>
            <div className="notification-content">
              <span className="notification-message">{notification.message}</span>
              <button 
                className="notification-close" 
                onClick={() => setNotification({ show: false, message: "", type: "" })}
              >
                ×
              </button>
            </div>
          </div>
        )}
    </div>
  );
};

export default CaballosAdmin;
