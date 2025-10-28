import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { Loader, UserPlus, Edit, Trash2, Calendar, Clock } from "lucide-react";

const InstructorasAdmin = () => {
  const [instructoras, setInstructoras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [addInstructorModalOpen, setAddInstructorModalOpen] = useState(false);
  const [editInstructorModalOpen, setEditInstructorModalOpen] = useState(false);
  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
  const [instructorToDelete, setInstructorToDelete] = useState(null);
  const [editingInstructor, setEditingInstructor] = useState(null);
  const [newInstructor, setNewInstructor] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    especialidad: "iniciacion"
  });
  const [creatingInstructor, setCreatingInstructor] = useState(false);
  const [updatingInstructor, setUpdatingInstructor] = useState(false);
  const [deletingInstructor, setDeletingInstructor] = useState(false);
  
  // Estados para gestión de descansos
  const [descansosModalOpen, setDescansosModalOpen] = useState(false);
  const [selectedInstructorDescansos, setSelectedInstructorDescansos] = useState(null);
  const [descansos, setDescansos] = useState([]);
  const [loadingDescansos, setLoadingDescansos] = useState(false);
  const [addDescansoModalOpen, setAddDescansoModalOpen] = useState(false);
  const [editDescansoModalOpen, setEditDescansoModalOpen] = useState(false);
  const [editingDescanso, setEditingDescanso] = useState(null);
  const [newDescanso, setNewDescanso] = useState({
    fecha_inicio: "",
    fecha_fin: "",
    motivo: "",
    tipo: "personal"
  });
  const [descansosActivos, setDescansosActivos] = useState({});

  // Mostrar notificación
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 4000);
  };

  // Cargar instructoras desde el backend
  const loadInstructoras = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3001/api/instructoras");
      if (!response.ok) {
        throw new Error("Error al cargar instructoras");
      }
      const data = await response.json();
      setInstructoras(data);
      
      // Cargar descansos activos para cada instructora
      await loadDescansosActivos(data);
    } catch (error) {
      console.error("Error al cargar instructoras:", error);
      showNotification("Error al cargar instructoras", "error");
    } finally {
      setLoading(false);
    }
  };

  // Cargar descansos activos de todas las instructoras
  const loadDescansosActivos = async (instructorasList) => {
    try {
      const hoy = new Date().toISOString().split('T')[0];
      const descansosMap = {};
      
      // Consultar para cada instructora si tiene descanso hoy
      await Promise.all(
        instructorasList.map(async (instructora) => {
          try {
            const response = await fetch(
              `http://localhost:3001/api/descansos/check/${instructora.id}?fecha=${hoy}`
            );
            if (response.ok) {
              const data = await response.json();
              if (data.en_descanso) {
                descansosMap[instructora.id] = data.descanso;
              }
            }
          } catch (err) {
            console.error(`Error verificando descanso de instructora ${instructora.id}:`, err);
          }
        })
      );
      
      setDescansosActivos(descansosMap);
    } catch (error) {
      console.error("Error al cargar descansos activos:", error);
    }
  };

  useEffect(() => {
    loadInstructoras();
  }, []);

  const openAddInstructorModal = () => {
    setNewInstructor({
      nombre: "",
      apellido: "",
      correo: "",
      telefono: "",
      especialidad: "iniciacion"
    });
    setAddInstructorModalOpen(true);
  };

  const closeAddInstructorModal = () => {
    setAddInstructorModalOpen(false);
    setNewInstructor({
      nombre: "",
      apellido: "",
      correo: "",
      telefono: "",
      especialidad: "iniciacion"
    });
  };

  const openEditInstructorModal = (instructor) => {
    setEditingInstructor({
      id: instructor.id,
      nombre: instructor.nombre,
      apellido: instructor.apellido,
      correo: instructor.correo || "",
      num_contacto: instructor.num_contacto || "",
      especialidad: instructor.especialidad
    });
    setEditInstructorModalOpen(true);
  };

  const closeEditInstructorModal = () => {
    setEditInstructorModalOpen(false);
    setEditingInstructor(null);
  };

  const openDeleteConfirmModal = (instructor) => {
    setInstructorToDelete(instructor);
    setDeleteConfirmModalOpen(true);
  };

  const closeDeleteConfirmModal = () => {
    setDeleteConfirmModalOpen(false);
    setInstructorToDelete(null);
  };

  const createNewInstructor = async () => {
    // Validar campos requeridos
    if (!newInstructor.nombre || !newInstructor.apellido || !newInstructor.especialidad) {
      showNotification("Por favor completa todos los campos obligatorios", "error");
      return;
    }

    setCreatingInstructor(true);
    try {
      const response = await fetch("http://localhost:3001/api/instructoras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newInstructor)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear instructora");
      }

      const data = await response.json();
      showNotification(data.message || "Instructora creada correctamente", "success");
      closeAddInstructorModal();
      loadInstructoras();
    } catch (error) {
      console.error("Error al crear instructora:", error);
      showNotification(error.message || "Error al crear instructora", "error");
    } finally {
      setCreatingInstructor(false);
    }
  };

  const updateInstructor = async () => {
    if (!editingInstructor.nombre || !editingInstructor.apellido || !editingInstructor.especialidad) {
      showNotification("Por favor completa todos los campos obligatorios", "error");
      return;
    }

    setUpdatingInstructor(true);
    try {
      const response = await fetch(`http://localhost:3001/api/instructoras/${editingInstructor.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingInstructor)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar instructora");
      }

      const data = await response.json();
      showNotification(data.message || "Instructora actualizada correctamente", "success");
      closeEditInstructorModal();
      loadInstructoras();
    } catch (error) {
      console.error("Error al actualizar instructora:", error);
      showNotification(error.message || "Error al actualizar instructora", "error");
    } finally {
      setUpdatingInstructor(false);
    }
  };

  const deleteInstructor = async () => {
    if (!instructorToDelete) return;

    setDeletingInstructor(true);
    try {
      const response = await fetch(`http://localhost:3001/api/instructoras/${instructorToDelete.id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al eliminar instructora");
      }

      const data = await response.json();
      showNotification(data.message || "Instructora eliminada correctamente", "success");
      closeDeleteConfirmModal();
      loadInstructoras();
    } catch (error) {
      console.error("Error al eliminar instructora:", error);
      showNotification(error.message || "Error al eliminar instructora", "error");
    } finally {
      setDeletingInstructor(false);
    }
  };

  // Funciones para gestión de descansos
  const openDescansosModal = async (instructor) => {
    setSelectedInstructorDescansos(instructor);
    setDescansosModalOpen(true);
    await loadDescansos(instructor.id);
  };

  const closeDescansosModal = () => {
    setDescansosModalOpen(false);
    setSelectedInstructorDescansos(null);
    setDescansos([]);
  };

  const loadDescansos = async (instructoraId) => {
    setLoadingDescansos(true);
    try {
      const response = await fetch(`http://localhost:3001/api/descansos/instructora/${instructoraId}`);
      if (!response.ok) {
        throw new Error("Error al cargar descansos");
      }
      const data = await response.json();
      setDescansos(data);
    } catch (error) {
      console.error("Error al cargar descansos:", error);
      showNotification("Error al cargar descansos", "error");
      setDescansos([]);
    } finally {
      setLoadingDescansos(false);
    }
  };

  const openAddDescansoModal = () => {
    setNewDescanso({
      fecha_inicio: "",
      fecha_fin: "",
      motivo: "",
      tipo: "personal"
    });
    setAddDescansoModalOpen(true);
  };

  const closeAddDescansoModal = () => {
    setAddDescansoModalOpen(false);
    setNewDescanso({
      fecha_inicio: "",
      fecha_fin: "",
      motivo: "",
      tipo: "personal"
    });
  };

  const openEditDescansoModal = (descanso) => {
    setEditingDescanso({
      id: descanso.id,
      fecha_inicio: formatDate(descanso.fecha_inicio),
      fecha_fin: formatDate(descanso.fecha_fin),
      motivo: descanso.motivo,
      tipo: descanso.tipo
    });
    setEditDescansoModalOpen(true);
  };

  const closeEditDescansoModal = () => {
    setEditDescansoModalOpen(false);
    setEditingDescanso(null);
  };

  const createDescanso = async () => {
    if (!newDescanso.fecha_inicio || !newDescanso.fecha_fin || !newDescanso.motivo) {
      showNotification("Por favor completa todos los campos obligatorios", "error");
      return;
    }

    // Validar que fecha_fin no sea anterior a fecha_inicio
    if (new Date(newDescanso.fecha_fin) < new Date(newDescanso.fecha_inicio)) {
      showNotification("La fecha de fin no puede ser anterior a la fecha de inicio", "error");
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/api/descansos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instructora_id: selectedInstructorDescansos.id,
          ...newDescanso
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear descanso");
      }

      showNotification("Descanso registrado correctamente", "success");
      closeAddDescansoModal();
      await loadDescansos(selectedInstructorDescansos.id);
      // Recargar instructoras para actualizar indicadores
      await loadInstructoras();
    } catch (error) {
      console.error("Error al crear descanso:", error);
      showNotification(error.message || "Error al crear descanso", "error");
    }
  };

  const updateDescanso = async () => {
    if (!editingDescanso.fecha_inicio || !editingDescanso.fecha_fin || !editingDescanso.motivo) {
      showNotification("Por favor completa todos los campos obligatorios", "error");
      return;
    }

    // Validar que fecha_fin no sea anterior a fecha_inicio
    if (new Date(editingDescanso.fecha_fin) < new Date(editingDescanso.fecha_inicio)) {
      showNotification("La fecha de fin no puede ser anterior a la fecha de inicio", "error");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/descansos/${editingDescanso.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fecha_inicio: editingDescanso.fecha_inicio,
          fecha_fin: editingDescanso.fecha_fin,
          motivo: editingDescanso.motivo,
          tipo: editingDescanso.tipo
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar descanso");
      }

      showNotification("Descanso actualizado correctamente", "success");
      closeEditDescansoModal();
      await loadDescansos(selectedInstructorDescansos.id);
      // Recargar instructoras para actualizar indicadores
      await loadInstructoras();
    } catch (error) {
      console.error("Error al actualizar descanso:", error);
      showNotification(error.message || "Error al actualizar descanso", "error");
    }
  };

  const deleteDescanso = async (descansoId) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este descanso?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/descansos/${descansoId}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al eliminar descanso");
      }

      showNotification("Descanso eliminado correctamente", "success");
      await loadDescansos(selectedInstructorDescansos.id);
      // Recargar instructoras para actualizar indicadores
      await loadInstructoras();
    } catch (error) {
      console.error("Error al eliminar descanso:", error);
      showNotification(error.message || "Error al eliminar descanso", "error");
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "";
    const num = parseFloat(amount);
    if (isNaN(num)) return "";
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
  };

  const renderPortal = (node) => ReactDOM.createPortal(node, document.body);

  return (
    <div className="instructoras-admin-container">
      {/* Notificación */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      
      <div className="controls-container enhanced-controls" style={{ marginBottom: "1.5rem" }}>
        <div className="controls-inner">
          <h2 style={{ margin: 0, color: "var(--primary-brown)" }}>Gestión de Instructoras</h2>
          <button className="add-client-btn" onClick={openAddInstructorModal} type="button">
            <UserPlus size={20} /> Nueva Instructora
          </button>
        </div>
      </div>
      
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
            Cargando instructoras...
          </div>
        </div>
      ) : (
        <div style={{ overflow: "hidden", borderRadius: "16px" }}>
          <table className="members-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Especialidad</th>
                <th>Disponibilidad</th>
                <th>Fecha Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {instructoras.length === 0 ? (
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
                    No hay instructoras registradas.
                  </td>
                </tr>
              ) : (
                instructoras.map(instructor => (
                  <tr key={instructor.id}>
                    <td style={{ fontWeight: "600" }}>
                      {instructor.nombre} {instructor.apellido}
                    </td>
                    <td style={{ color: "var(--stone-gray)" }}>{instructor.correo || "Sin correo"}</td>
                    <td style={{ color: "var(--charcoal)" }}>{instructor.num_contacto || "N/A"}</td>
                    <td style={{ fontWeight: "600", color: "var(--primary-brown)" }}>
                      {instructor.especialidad.charAt(0).toUpperCase() + instructor.especialidad.slice(1)}
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
                        {/* Indicador automático basado en descansos */}
                        {descansosActivos[instructor.id] ? (
                          <span 
                            title={`Descanso programado (${descansosActivos[instructor.id].tipo}):\n${descansosActivos[instructor.id].motivo}\nDesde: ${formatDate(descansosActivos[instructor.id].fecha_inicio)}\nHasta: ${formatDate(descansosActivos[instructor.id].fecha_fin)}`}
                            style={{
                              background: "#ff9800",
                              color: "white",
                              padding: "0.4rem 0.8rem",
                              borderRadius: "12px",
                              fontSize: "0.85rem",
                              fontWeight: "600",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.3rem",
                              cursor: "help",
                              whiteSpace: "nowrap",
                              border: "2px solid #f57c00"
                            }}
                          >
                            <Clock size={14} />
                            En Descanso
                          </span>
                        ) : (
                          <span 
                            style={{
                              background: "#9caf88",
                              color: "white",
                              padding: "0.4rem 0.8rem",
                              borderRadius: "12px",
                              fontSize: "0.85rem",
                              fontWeight: "600",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.3rem",
                              whiteSpace: "nowrap",
                              border: "2px solid #7a9768"
                            }}
                          >
                            ✓ Disponible
                          </span>
                        )}
                      </div>
                    </td>
                    <td>{formatDate(instructor.fecha_registro)}</td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                        <button
                          className="btn-icon-action"
                          onClick={() => openDescansosModal(instructor)}
                          title="Gestionar Descansos"
                          style={{
                            background: "linear-gradient(135deg, #9caf88, #6b8e23)",
                            color: "white",
                            border: "none",
                            padding: "0.5rem",
                            borderRadius: "8px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <Calendar size={16} />
                        </button>
                        <button
                          className="btn-icon-action"
                          onClick={() => openEditInstructorModal(instructor)}
                          title="Editar"
                          style={{
                            background: "linear-gradient(135deg, #c17b4a, #8b5a2b)",
                            color: "white",
                            border: "none",
                            padding: "0.5rem",
                            borderRadius: "8px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="btn-icon-action"
                          onClick={() => openDeleteConfirmModal(instructor)}
                          title="Eliminar"
                          style={{
                            background: "#dc3545",
                            color: "white",
                            border: "none",
                            padding: "0.5rem",
                            borderRadius: "8px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <Trash2 size={16} />
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
      
      {/* Modal de confirmación de eliminación (Portal) */}
      {deleteConfirmModalOpen && instructorToDelete &&
        renderPortal(
          <div className="modal-overlay" onClick={closeDeleteConfirmModal}>
            <div className="modal-content delete-confirm-modal" onClick={e => e.stopPropagation()}>
              <h2 style={{ color: "#dc3545", marginBottom: "1rem" }}>Confirmar Eliminación</h2>
              <p style={{ fontSize: "1.1rem", marginBottom: "1.5rem", color: "var(--charcoal)" }}>
                ¿Estás seguro de que deseas eliminar a la instructora{" "}
                <strong>{instructorToDelete.nombre} {instructorToDelete.apellido}</strong>?
              </p>
              <p style={{ fontSize: "0.9rem", color: "var(--stone-gray)", marginBottom: "1.5rem" }}>
                Esta acción marcará a la instructora como inactiva. No se puede deshacer si tiene reservas activas.
              </p>
              <div className="modal-actions">
                <button
                  className="btn btn-danger"
                  onClick={deleteInstructor}
                  disabled={deletingInstructor}
                  style={{
                    background: "#dc3545",
                    color: "white",
                    border: "none",
                    padding: "0.75rem 1.5rem",
                    borderRadius: "8px",
                    cursor: deletingInstructor ? "not-allowed" : "pointer",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem"
                  }}
                >
                  <Trash2 size={16} /> {deletingInstructor ? "Eliminando..." : "Sí, Eliminar"}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={closeDeleteConfirmModal}
                  disabled={deletingInstructor}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      
      {/* Modal de edición de instructora (Portal) */}
      {editInstructorModalOpen && editingInstructor &&
        renderPortal(
          <div className="modal-overlay" onClick={closeEditInstructorModal}>
            <div className="modal-content add-client-modal" onClick={e => e.stopPropagation()}>
              <h2>Editar Instructora</h2>
              <div className="modal-section">
                <h3>Información Personal</h3>
                <div className="modal-field">
                  <label>Nombre *:</label>
                  <input
                    type="text"
                    value={editingInstructor.nombre}
                    onChange={e => setEditingInstructor({ ...editingInstructor, nombre: e.target.value })}
                    placeholder="Nombre de la instructora"
                    autoComplete="off"
                    name="editinstructor-nombre"
                  />
                </div>
                <div className="modal-field">
                  <label>Apellido *:</label>
                  <input
                    type="text"
                    value={editingInstructor.apellido}
                    onChange={e => setEditingInstructor({ ...editingInstructor, apellido: e.target.value })}
                    placeholder="Apellido de la instructora"
                    autoComplete="off"
                    name="editinstructor-apellido"
                  />
                </div>
                <div className="modal-field">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={editingInstructor.correo}
                    onChange={e => setEditingInstructor({ ...editingInstructor, correo: e.target.value })}
                    placeholder="ejemplo@email.com"
                    autoComplete="off"
                    name="editinstructor-email"
                  />
                </div>
                <div className="modal-field">
                  <label>Teléfono:</label>
                  <input
                    type="text"
                    value={editingInstructor.num_contacto}
                    onChange={e => setEditingInstructor({ ...editingInstructor, num_contacto: e.target.value })}
                    placeholder="Teléfono"
                    autoComplete="off"
                    name="editinstructor-telefono"
                  />
                </div>
                <div className="modal-field">
                  <label>Especialidad *:</label>
                  <select
                    value={editingInstructor.especialidad}
                    onChange={e => setEditingInstructor({ ...editingInstructor, especialidad: e.target.value })}
                    name="editinstructor-especialidad"
                  >
                    <option value="iniciacion">Iniciación</option>
                    <option value="intermedio">Intermedio</option>
                    <option value="paseo">Paseo</option>
                    <option value="salto">Salto</option>
                    <option value="mixto">Mixto</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button className="btn btn-primary" onClick={updateInstructor} type="button" disabled={updatingInstructor}>
                  <Edit size={16} /> {updatingInstructor ? "Actualizando..." : "Actualizar Instructora"}
                </button>
                <button className="btn btn-secondary" onClick={closeEditInstructorModal} type="button">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      
      {/* Modal de alta de instructora (Portal) */}
      {addInstructorModalOpen &&
        renderPortal(
          <div className="modal-overlay" onClick={closeAddInstructorModal}>
            <div className="modal-content add-client-modal" onClick={e => e.stopPropagation()}>
              <h2>Agregar Nueva Instructora</h2>
              <div className="modal-section">
                <h3>Información Personal</h3>
                <div className="modal-field">
                  <label>Nombre *:</label>
                  <input
                    type="text"
                    value={newInstructor.nombre}
                    onChange={e => setNewInstructor({ ...newInstructor, nombre: e.target.value })}
                    placeholder="Nombre de la instructora"
                    autoComplete="off"
                    name="newinstructor-nombre"
                  />
                </div>
                <div className="modal-field">
                  <label>Apellido *:</label>
                  <input
                    type="text"
                    value={newInstructor.apellido}
                    onChange={e => setNewInstructor({ ...newInstructor, apellido: e.target.value })}
                    placeholder="Apellido de la instructora"
                    autoComplete="off"
                    name="newinstructor-apellido"
                  />
                </div>
                <div className="modal-field">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={newInstructor.correo}
                    onChange={e => setNewInstructor({ ...newInstructor, correo: e.target.value })}
                    placeholder="ejemplo@email.com"
                    autoComplete="off"
                    name="newinstructor-email"
                  />
                </div>
                <div className="modal-field">
                  <label>Teléfono:</label>
                  <input
                    type="text"
                    value={newInstructor.telefono}
                    onChange={e => setNewInstructor({ ...newInstructor, telefono: e.target.value })}
                    placeholder="Teléfono"
                    autoComplete="off"
                    name="newinstructor-telefono"
                  />
                </div>
                <div className="modal-field">
                  <label>Especialidad *:</label>
                  <select
                    value={newInstructor.especialidad}
                    onChange={e => setNewInstructor({ ...newInstructor, especialidad: e.target.value })}
                    name="newinstructor-especialidad"
                  >
                    <option value="iniciacion">Iniciación</option>
                    <option value="intermedio">Intermedio</option>
                    <option value="paseo">Paseo</option>
                    <option value="salto">Salto</option>
                    <option value="mixto">Mixto</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button className="btn btn-primary" onClick={createNewInstructor} type="button" disabled={creatingInstructor}>
                  <UserPlus size={16} /> {creatingInstructor ? "Agregando..." : "Agregar Instructora"}
                </button>
                <button className="btn btn-secondary" onClick={closeAddInstructorModal} type="button">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      
      {/* Modal de gestión de descansos (Portal) */}
      {descansosModalOpen && selectedInstructorDescansos &&
        renderPortal(
          <div className="modal-overlay" onClick={closeDescansosModal}>
            <div className="modal-content add-client-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: "800px" }}>
              <h2>Descansos - {selectedInstructorDescansos.nombre} {selectedInstructorDescansos.apellido}</h2>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 style={{ margin: 0 }}>Descansos Registrados</h3>
                <button 
                  className="btn btn-primary" 
                  onClick={openAddDescansoModal}
                  style={{
                    background: "linear-gradient(135deg, #9caf88, #6b8e23)",
                    color: "white",
                    border: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem"
                  }}
                >
                  <Calendar size={16} /> Agregar Descanso
                </button>
              </div>

              {loadingDescansos ? (
                <div style={{ textAlign: "center", padding: "2rem" }}>
                  <Loader size={30} className="spin" style={{ color: "var(--terracotta)" }} />
                  <p>Cargando descansos...</p>
                </div>
              ) : descansos.length === 0 ? (
                <div style={{ 
                  textAlign: "center", 
                  padding: "2rem", 
                  background: "#f9f9f9", 
                  borderRadius: "8px",
                  color: "var(--stone-gray)"
                }}>
                  <Calendar size={40} style={{ margin: "0 auto 1rem", opacity: 0.3 }} />
                  <p style={{ margin: 0 }}>No hay descansos registrados para esta instructora</p>
                </div>
              ) : (
                <div style={{ 
                  maxHeight: "400px", 
                  overflowY: "auto",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px"
                }}>
                  <table className="members-table" style={{ margin: 0 }}>
                    <thead>
                      <tr>
                        <th>Fecha Inicio</th>
                        <th>Fecha Fin</th>
                        <th>Tipo</th>
                        <th>Motivo</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {descansos.map((descanso) => {
                        const hoy = new Date();
                        hoy.setHours(0, 0, 0, 0); // Normalizar a medianoche para comparación justa
                        const inicio = new Date(descanso.fecha_inicio);
                        inicio.setHours(0, 0, 0, 0);
                        const fin = new Date(descanso.fecha_fin);
                        fin.setHours(0, 0, 0, 0);
                        const isActivo = hoy >= inicio && hoy <= fin;
                        const isPasado = fin < hoy; // Solo pasado si la fecha fin ya terminó (antes de hoy)
                        
                        return (
                          <tr key={descanso.id} style={{ 
                            background: isActivo ? "#fff8e1" : isPasado ? "#f5f5f5" : "white",
                            opacity: isPasado ? 0.7 : 1
                          }}>
                            <td style={{ fontWeight: isActivo ? "600" : "normal" }}>
                              {formatDate(descanso.fecha_inicio)}
                              {isActivo && <span style={{ marginLeft: "0.5rem", color: "#9caf88" }}>●</span>}
                            </td>
                            <td>{formatDate(descanso.fecha_fin)}</td>
                            <td>
                              <span style={{ 
                                padding: "0.25rem 0.75rem",
                                borderRadius: "12px",
                                fontSize: "0.85rem",
                                fontWeight: "600",
                                background: 
                                  descanso.tipo === "vacaciones" ? "#e3f2fd" :
                                  descanso.tipo === "enfermedad" ? "#ffebee" :
                                  descanso.tipo === "personal" ? "#f3e5f5" : "#e0e0e0",
                                color:
                                  descanso.tipo === "vacaciones" ? "#1976d2" :
                                  descanso.tipo === "enfermedad" ? "#d32f2f" :
                                  descanso.tipo === "personal" ? "#7b1fa2" : "#424242"
                              }}>
                                {descanso.tipo.charAt(0).toUpperCase() + descanso.tipo.slice(1)}
                              </span>
                            </td>
                            <td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {descanso.motivo}
                            </td>
                            <td>
                              <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                                {!isPasado && (
                                  <>
                                    <button
                                      onClick={() => openEditDescansoModal(descanso)}
                                      title="Editar"
                                      style={{
                                        background: "linear-gradient(135deg, #c17b4a, #8b5a2b)",
                                        color: "white",
                                        border: "none",
                                        padding: "0.4rem",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center"
                                      }}
                                    >
                                      <Edit size={14} />
                                    </button>
                                    <button
                                      onClick={() => deleteDescanso(descanso.id)}
                                      title="Eliminar"
                                      style={{
                                        background: "#dc3545",
                                        color: "white",
                                        border: "none",
                                        padding: "0.4rem",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center"
                                      }}
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="modal-actions" style={{ marginTop: "1.5rem" }}>
                <button className="btn btn-secondary" onClick={closeDescansosModal} type="button">
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Modal de agregar descanso (Portal) */}
      {addDescansoModalOpen &&
        renderPortal(
          <div className="modal-overlay" onClick={closeAddDescansoModal}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: "500px" }}>
              <h2>Agregar Descanso</h2>
              <div className="modal-section">
                <div className="modal-field">
                  <label>Fecha Inicio *:</label>
                  <input
                    type="date"
                    value={newDescanso.fecha_inicio}
                    onChange={e => setNewDescanso({ ...newDescanso, fecha_inicio: e.target.value })}
                    autoComplete="off"
                  />
                </div>
                <div className="modal-field">
                  <label>Fecha Fin *:</label>
                  <input
                    type="date"
                    value={newDescanso.fecha_fin}
                    onChange={e => setNewDescanso({ ...newDescanso, fecha_fin: e.target.value })}
                    autoComplete="off"
                  />
                </div>
                <div className="modal-field">
                  <label>Tipo *:</label>
                  <select
                    value={newDescanso.tipo}
                    onChange={e => setNewDescanso({ ...newDescanso, tipo: e.target.value })}
                  >
                    <option value="personal">Personal</option>
                    <option value="enfermedad">Enfermedad</option>
                    <option value="vacaciones">Vacaciones</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div className="modal-field">
                  <label>Motivo *:</label>
                  <textarea
                    value={newDescanso.motivo}
                    onChange={e => setNewDescanso({ ...newDescanso, motivo: e.target.value })}
                    placeholder="Describe el motivo del descanso"
                    rows="3"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "1px solid #e0e0e0",
                      fontSize: "1rem",
                      fontFamily: "inherit",
                      resize: "vertical"
                    }}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button className="btn btn-primary" onClick={createDescanso} type="button">
                  <Calendar size={16} /> Registrar Descanso
                </button>
                <button className="btn btn-secondary" onClick={closeAddDescansoModal} type="button">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Modal de editar descanso (Portal) */}
      {editDescansoModalOpen && editingDescanso &&
        renderPortal(
          <div className="modal-overlay" onClick={closeEditDescansoModal}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: "500px" }}>
              <h2>Editar Descanso</h2>
              <div className="modal-section">
                <div className="modal-field">
                  <label>Fecha Inicio *:</label>
                  <input
                    type="date"
                    value={editingDescanso.fecha_inicio}
                    onChange={e => setEditingDescanso({ ...editingDescanso, fecha_inicio: e.target.value })}
                    autoComplete="off"
                  />
                </div>
                <div className="modal-field">
                  <label>Fecha Fin *:</label>
                  <input
                    type="date"
                    value={editingDescanso.fecha_fin}
                    onChange={e => setEditingDescanso({ ...editingDescanso, fecha_fin: e.target.value })}
                    autoComplete="off"
                  />
                </div>
                <div className="modal-field">
                  <label>Tipo *:</label>
                  <select
                    value={editingDescanso.tipo}
                    onChange={e => setEditingDescanso({ ...editingDescanso, tipo: e.target.value })}
                  >
                    <option value="personal">Personal</option>
                    <option value="enfermedad">Enfermedad</option>
                    <option value="vacaciones">Vacaciones</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div className="modal-field">
                  <label>Motivo *:</label>
                  <textarea
                    value={editingDescanso.motivo}
                    onChange={e => setEditingDescanso({ ...editingDescanso, motivo: e.target.value })}
                    placeholder="Describe el motivo del descanso"
                    rows="3"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "1px solid #e0e0e0",
                      fontSize: "1rem",
                      fontFamily: "inherit",
                      resize: "vertical"
                    }}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button className="btn btn-primary" onClick={updateDescanso} type="button">
                  <Edit size={16} /> Actualizar Descanso
                </button>
                <button className="btn btn-secondary" onClick={closeEditDescansoModal} type="button">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default InstructorasAdmin;
