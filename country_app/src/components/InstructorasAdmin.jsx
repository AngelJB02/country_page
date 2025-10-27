import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { Loader, UserPlus } from "lucide-react";

const InstructorasAdmin = () => {
  const [instructoras, setInstructoras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addInstructorModalOpen, setAddInstructorModalOpen] = useState(false);
  const [newInstructor, setNewInstructor] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    especialidad: "iniciacion",
    estado: "activo",
    salario: "",
    fecha_contratacion: ""
  });
  const [creatingInstructor, setCreatingInstructor] = useState(false);

  // Cargar lista de instructoras (dummy por ahora)
  useEffect(() => {
    // Aquí deberías hacer fetch al endpoint real
    setTimeout(() => {
      setInstructoras([
        {
          id: 1,
          nombre: "María",
          apellido: "González",
          email: "maria.gonzalez@example.com",
          telefono: "555-1234",
          especialidad: "salto",
          estado: "activo",
          salario: 15000,
          fecha_contratacion: "2024-01-15"
        },
        {
          id: 2,
          nombre: "Ana",
          apellido: "Martínez",
          email: "ana.martinez@example.com",
          telefono: "555-5678",
          especialidad: "iniciacion",
          estado: "activo",
          salario: 12000,
          fecha_contratacion: "2024-03-20"
        },
        {
          id: 3,
          nombre: "Laura",
          apellido: "Rodríguez",
          email: "laura.rodriguez@example.com",
          telefono: "555-9012",
          especialidad: "intermedio",
          estado: "descanso",
          salario: 13500,
          fecha_contratacion: "2023-11-10"
        }
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const openAddInstructorModal = () => {
    setNewInstructor({
      nombre: "",
      apellido: "",
      email: "",
      telefono: "",
      especialidad: "iniciacion",
      estado: "activo",
      salario: "",
      fecha_contratacion: ""
    });
    setAddInstructorModalOpen(true);
  };

  const closeAddInstructorModal = () => {
    setAddInstructorModalOpen(false);
    setNewInstructor({
      nombre: "",
      apellido: "",
      email: "",
      telefono: "",
      especialidad: "iniciacion",
      estado: "activo",
      salario: "",
      fecha_contratacion: ""
    });
  };

  const createNewInstructor = async () => {
    setCreatingInstructor(true);
    // Aquí deberías hacer fetch al endpoint real
    setTimeout(() => {
      setInstructoras(prev => [
        {
          id: prev.length + 1,
          ...newInstructor
        },
        ...prev
      ]);
      setCreatingInstructor(false);
      closeAddInstructorModal();
    }, 700);
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return ""
    const num = parseFloat(amount)
    if (isNaN(num)) return ""
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })
  };

  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0]
  };

  const renderPortal = (node) => ReactDOM.createPortal(node, document.body);

  return (
    <div className="instructoras-admin-container">
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
                <th>Estado</th>
                <th>Salario</th>
                <th>Fecha Contratación</th>
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
                    <td style={{ color: "var(--stone-gray)" }}>{instructor.email}</td>
                    <td style={{ color: "var(--charcoal)" }}>{instructor.telefono}</td>
                    <td style={{ fontWeight: "600", color: "var(--primary-brown)" }}>
                      {instructor.especialidad.charAt(0).toUpperCase() + instructor.especialidad.slice(1)}
                    </td>
                    <td>
                      <select
                        className="status-badge"
                        value={instructor.estado}
                        onChange={(e) => {
                          // Aquí iría la lógica para actualizar estado
                          setInstructoras(prev => prev.map(i => 
                            i.id === instructor.id ? {...i, estado: e.target.value} : i
                          ));
                        }}
                        style={{
                          borderColor: instructor.estado === "activo" ? "#9caf88" : instructor.estado === "descanso" ? "#d4a574" : "#8b5a2b",
                          color: instructor.estado === "activo" ? "#9caf88" : instructor.estado === "descanso" ? "#d4a574" : "#8b5a2b",
                        }}
                      >
                        <option value="activo">Activo</option>
                        <option value="descanso">Descanso</option>
                        <option value="inactivo">Inactivo</option>
                      </select>
                    </td>
                    <td style={{ fontWeight: "600", color: "var(--primary-brown)" }}>
                      ${formatCurrency(instructor.salario)}
                    </td>
                    <td>{formatDate(instructor.fecha_contratacion)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
                  <label>Email *:</label>
                  <input
                    type="email"
                    value={newInstructor.email}
                    onChange={e => setNewInstructor({ ...newInstructor, email: e.target.value })}
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
                <div className="modal-field">
                  <label>Estado *:</label>
                  <select
                    value={newInstructor.estado}
                    onChange={e => setNewInstructor({ ...newInstructor, estado: e.target.value })}
                    name="newinstructor-estado"
                  >
                    <option value="activo">Activo</option>
                    <option value="descanso">Descanso</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              </div>
              <div className="modal-section">
                <h3>Información Laboral</h3>
                <div className="modal-field">
                  <label>Salario Mensual *:</label>
                  <input
                    type="number"
                    value={newInstructor.salario === "" ? "" : newInstructor.salario}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewInstructor({
                        ...newInstructor,
                        salario: val === "" ? "" : Number.parseFloat(val)
                      });
                    }}
                    placeholder="Ej: 15000.00"
                    step="0.01"
                    min="0"
                    autoComplete="off"
                    inputMode="decimal"
                    data-lpignore="true"
                    data-form-type="other"
                  />
                </div>
                <div className="modal-field">
                  <label>Fecha de Contratación *:</label>
                  <input
                    type="date"
                    value={newInstructor.fecha_contratacion}
                    onChange={e => setNewInstructor({ ...newInstructor, fecha_contratacion: e.target.value })}
                    autoComplete="off"
                    data-lpignore="true"
                    data-form-type="other"
                  />
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
    </div>
  );
};

export default InstructorasAdmin;
