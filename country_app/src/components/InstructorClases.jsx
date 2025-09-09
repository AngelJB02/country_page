import React, { useState, useEffect } from "react";
import '../CSS/index.css';
import '../CSS/botones.css';

const API_BASE = "http://localhost:3001"; // Cambia por tu endpoint real

const estados = ["pendiente", "confirmada", "cancelada"];

const InstructorClases = () => {
  const [clases, setClases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");

  // Cargar datos de clases y reservas
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE}/instructor/clases`);
        const data = await res.json();
        setClases(data);
      } catch (err) {
        setError("Error al cargar las clases");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Cambiar estado de asistencia
  const handleEstadoChange = async (reservaId, nuevoEstado) => {
    try {
      await fetch(`${API_BASE}/reservas/${reservaId}/estado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      setClases(clases =>
        clases.map(clase => ({
          ...clase,
          reservas: clase.reservas.map(reserva =>
            reserva.id === reservaId ? { ...reserva, estado: nuevoEstado } : reserva
          )
        }))
      );
    } catch (err) {
      alert("No se pudo actualizar el estado");
    }
  };

  if (loading) return <div className="container"><p>Cargando clases...</p></div>;
  if (error) return <div className="container"><p>{error}</p></div>;

  return (
    <div className="container">
      <h1>Clases del Instructor</h1>
      <div style={{ marginBottom: '2rem' }}>
        <label htmlFor="date-filter"><strong>Filtrar por fecha:</strong></label>
        <input
          type="date"
          id="date-filter"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          style={{ marginLeft: '1rem', padding: '0.3rem', borderRadius: '8px', border: '1px solid #ccc' }}
        />
      </div>
      <div className="calendar-list">
        {clases.length === 0 ? (
          <p>No hay clases registradas.</p>
        ) : (
          clases
            .filter(clase => !selectedDate || new Date(clase.fecha).toISOString().slice(0,10) === selectedDate)
            .map(clase => (
              <div key={clase.id} className="event-card" style={{ marginBottom: '2rem' }}>
                <div className="event-content">
                  <h3>{clase.tipo} - {new Date(clase.fecha).toLocaleDateString()}</h3>
                  <p><strong>Caballo:</strong> {clase.caballo_nombre || 'Sin asignar'}</p>
                  <table className="clase-table" style={{ width: '100%', marginTop: '1rem' }}>
                    <thead>
                      <tr>
                        <th>Usuario</th>
                        <th>Edad</th>
                        <th>Horario</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clase.reservas.map(reserva => (
                        <tr key={reserva.id}>
                          <td>{reserva.usuario_nombre}</td>
                          <td>{reserva.usuario_edad}</td>
                          <td>{reserva.horario}</td>
                          <td>{reserva.estado}</td>
                          <td>
                            {estados.map(e => (
                              <button
                                key={e}
                                className={`cta-button rustic-button${reserva.estado === e ? ' active' : ''}`}
                                style={{ marginRight: '0.5rem' }}
                                onClick={() => handleEstadoChange(reserva.id, e)}
                                disabled={reserva.estado === e}
                              >
                                {e.charAt(0).toUpperCase() + e.slice(1)}
                              </button>
                            ))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default InstructorClases;
