import React, { useState, useEffect } from 'react';

const InstructorReservas = () => {
  const [reservas, setReservas] = useState([]);
  const [filteredReservas, setFilteredReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('day'); // 'day' or 'week'

  // Simulación de datos para demostración
  const mockReservas = [
    {
      id: 1,
      nombre: 'María González',
      edad: 28,
      actividad: 'Clases de Equitación',
      fecha: '2025-01-15',
      hora: '09:00',
      caballo: 'Thunder',
      estado: 'confirmada',
      asistencia: null
    },
    {
      id: 2,
      nombre: 'Carlos López',
      edad: 35,
      actividad: 'Paseo en Caballo',
      fecha: '2025-01-15',
      hora: '09:00',
      caballo: 'Star',
      estado: 'confirmada',
      asistencia: null
    },
    {
      id: 3,
      nombre: 'Ana Martín',
      edad: 22,
      actividad: 'Terapia con Caballos',
      fecha: '2025-01-15',
      hora: '10:30',
      caballo: 'Luna',
      estado: 'pendiente',
      asistencia: null
    },
    {
      id: 4,
      nombre: 'Pedro Ruiz',
      edad: 42,
      actividad: 'Clases de Equitación',
      fecha: '2025-01-15',
      hora: '11:00',
      caballo: 'Shadow',
      estado: 'confirmada',
      asistencia: 'asistió'
    },
    {
      id: 5,
      nombre: 'Laura Sánchez',
      edad: 19,
      actividad: 'Paseo en Caballo',
      fecha: '2025-01-15',
      hora: '14:00',
      caballo: 'Spirit',
      estado: 'confirmada',
      asistencia: 'no_asistió'
    }
  ];

  useEffect(() => {
    fetchReservas();
  }, [selectedDate, endDate, viewMode]);

  useEffect(() => {
    filterReservas();
  }, [reservas, searchTerm]);

  const fetchReservas = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Simulación de API call
      // const response = await fetch(`http://localhost:3001/instructor/reservas?fecha=${selectedDate}&fechaFin=${endDate}&modo=${viewMode}`);
      // const data = await response.json();
      
      // Simulamos delay de red
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filtrar datos mock por fecha
      const filtered = mockReservas.filter(reserva => {
        const reservaDate = new Date(reserva.fecha);
        const startDate = new Date(selectedDate);
        
        if (viewMode === 'day') {
          return reservaDate.toDateString() === startDate.toDateString();
        } else {
          const endDateObj = endDate ? new Date(endDate) : new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
          return reservaDate >= startDate && reservaDate <= endDateObj;
        }
      });
      
      setReservas(filtered);
    } catch (err) {
      setError('Error al cargar las reservas. Por favor, inténtalo de nuevo.');
      console.error('Error fetching reservas:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterReservas = () => {
    if (!searchTerm.trim()) {
      setFilteredReservas(reservas);
      return;
    }

    const filtered = reservas.filter(reserva =>
      reserva.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredReservas(filtered);
  };

  const updateAsistencia = async (reservaId, asistencia) => {
    try {
      // API call para actualizar asistencia
      // const response = await fetch(`http://localhost:3001/instructor/reservas/${reservaId}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ asistencia })
      // });

      // Actualizar estado local
      setReservas(prev => prev.map(reserva =>
        reserva.id === reservaId ? { ...reserva, asistencia } : reserva
      ));
      
      console.log(`Asistencia actualizada para reserva ${reservaId}: ${asistencia}`);
    } catch (err) {
      console.error('Error updating asistencia:', err);
      setError('Error al actualizar la asistencia.');
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'confirmada': return 'var(--sage-green)';
      case 'pendiente': return 'var(--terracotta)';
      case 'cancelada': return 'var(--charcoal)';
      default: return 'var(--stone-gray)';
    }
  };

  const getAsistenciaColor = (asistencia) => {
    switch (asistencia) {
      case 'asistió': return 'var(--sage-green)';
      case 'no_asistió': return 'var(--terracotta)';
      default: return 'transparent';
    }
  };

  const groupReservasByHour = (reservas) => {
    return reservas.reduce((groups, reserva) => {
      const hour = reserva.hora;
      if (!groups[hour]) {
        groups[hour] = [];
      }
      groups[hour].push(reserva);
      return groups;
    }, {});
  };

  const sortedHours = Object.keys(groupReservasByHour(filteredReservas)).sort();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        background: 'var(--warm-white)'
      }}>
        <div style={{
          padding: '2rem',
          background: 'var(--cream-overlay)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--soft-shadow)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid var(--stone-gray)',
            borderTop: '4px solid var(--primary-brown)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: 'var(--primary-brown)', fontWeight: '600' }}>
            Cargando reservas...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem',
      background: 'var(--warm-white)',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{
        background: 'var(--cream-overlay)',
        backdropFilter: 'blur(10px)',
        padding: '2rem',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--medium-shadow)',
        marginBottom: '2rem',
        border: '2px solid rgba(255, 255, 255, 0.3)'
      }}>
        <h1 style={{
          color: 'var(--primary-brown)',
          fontSize: '2.5rem',
          fontWeight: '700',
          textAlign: 'center',
          marginBottom: '1rem',
          fontFamily: 'var(--font-primary)'
        }}>
          📋 Gestión de Reservas
        </h1>
        <p style={{
          textAlign: 'center',
          color: 'var(--charcoal)',
          fontSize: '1.1rem',
          opacity: '0.8'
        }}>
          Revisa y gestiona la asistencia de tus clientes
        </p>
      </div>

      {/* Filtros */}
      <div style={{
        background: 'var(--cream-overlay)',
        backdropFilter: 'blur(10px)',
        padding: '1.5rem',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--soft-shadow)',
        marginBottom: '2rem',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          alignItems: 'end'
        }}>
          {/* Modo de vista */}
          <div>
            <label style={{
              display: 'block',
              color: 'var(--primary-brown)',
              fontWeight: '600',
              marginBottom: '0.5rem'
            }}>
              Vista:
            </label>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid var(--stone-gray)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--warm-white)',
                color: 'var(--primary-brown)',
                fontSize: '1rem'
              }}
            >
              <option value="day">Vista Diaria</option>
              <option value="week">Vista Semanal</option>
            </select>
          </div>

          {/* Fecha inicio */}
          <div>
            <label style={{
              display: 'block',
              color: 'var(--primary-brown)',
              fontWeight: '600',
              marginBottom: '0.5rem'
            }}>
              {viewMode === 'day' ? 'Fecha:' : 'Fecha Inicio:'}
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid var(--stone-gray)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--warm-white)',
                color: 'var(--primary-brown)',
                fontSize: '1rem'
              }}
            />
          </div>

          {/* Fecha fin (solo para vista semanal) */}
          {viewMode === 'week' && (
            <div>
              <label style={{
                display: 'block',
                color: 'var(--primary-brown)',
                fontWeight: '600',
                marginBottom: '0.5rem'
              }}>
                Fecha Fin (opcional):
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={selectedDate}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid var(--stone-gray)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--warm-white)',
                  color: 'var(--primary-brown)',
                  fontSize: '1rem'
                }}
              />
            </div>
          )}

          {/* Búsqueda */}
          <div>
            <label style={{
              display: 'block',
              color: 'var(--primary-brown)',
              fontWeight: '600',
              marginBottom: '0.5rem'
            }}>
              Buscar por nombre:
            </label>
            <input
              type="text"
              placeholder="Nombre del cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid var(--stone-gray)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--warm-white)',
                color: 'var(--primary-brown)',
                fontSize: '1rem'
              }}
            />
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
          color: 'white',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1rem',
          textAlign: 'center',
          fontWeight: '600'
        }}>
          {error}
        </div>
      )}

      {/* Lista de reservas */}
      {filteredReservas.length === 0 ? (
        <div style={{
          background: 'var(--cream-overlay)',
          backdropFilter: 'blur(10px)',
          padding: '3rem',
          borderRadius: 'var(--radius-xl)',
          textAlign: 'center',
          boxShadow: 'var(--soft-shadow)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🐴</div>
          <h3 style={{ 
            color: 'var(--primary-brown)', 
            marginBottom: '1rem',
            fontSize: '1.5rem'
          }}>
            No hay reservas
          </h3>
          <p style={{ color: 'var(--charcoal)', opacity: '0.7' }}>
            No se encontraron reservas para los filtros seleccionados.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {sortedHours.map(hour => {
            const reservasHora = groupReservasByHour(filteredReservas)[hour];
            return (
              <div key={hour} style={{
                background: 'var(--cream-overlay)',
                backdropFilter: 'blur(10px)',
                borderRadius: 'var(--radius-lg)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                boxShadow: 'var(--medium-shadow)',
                overflow: 'hidden'
              }}>
                {/* Header del horario */}
                <div style={{
                  background: 'linear-gradient(135deg, var(--primary-brown), var(--secondary-brown))',
                  color: 'var(--warm-white)',
                  padding: '1rem 1.5rem',
                  fontSize: '1.3rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  🕐 {hour}
                  <span style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}>
                    {reservasHora.length} reserva{reservasHora.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Lista de reservas */}
                <div style={{ padding: '1rem' }}>
                  {reservasHora.map(reserva => (
                    <div key={reserva.id} style={{
                      background: 'rgba(255, 255, 255, 0.8)',
                      border: '2px solid rgba(255, 255, 255, 0.5)',
                      borderLeft: `5px solid ${getAsistenciaColor(reserva.asistencia)}`,
                      borderRadius: 'var(--radius-md)',
                      padding: '1.5rem',
                      marginBottom: '1rem',
                      boxShadow: 'var(--soft-shadow)',
                      transition: 'all 0.3s ease'
                    }}>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem',
                        marginBottom: '1.5rem'
                      }}>
                        {/* Información del cliente */}
                        <div>
                          <h4 style={{
                            color: 'var(--primary-brown)',
                            fontSize: '1.3rem',
                            fontWeight: '700',
                            marginBottom: '0.5rem'
                          }}>
                            👤 {reserva.nombre}
                          </h4>
                          <p style={{ color: 'var(--charcoal)', margin: '0.25rem 0' }}>
                            <strong>Edad:</strong> {reserva.edad} años
                          </p>
                          <p style={{ color: 'var(--charcoal)', margin: '0.25rem 0' }}>
                            <strong>Actividad:</strong> {reserva.actividad}
                          </p>
                        </div>

                        {/* Detalles de la reserva */}
                        <div>
                          <p style={{ color: 'var(--charcoal)', margin: '0.25rem 0' }}>
                            <strong>📅 Fecha:</strong> {new Date(reserva.fecha).toLocaleDateString('es-ES')}
                          </p>
                          <p style={{ color: 'var(--charcoal)', margin: '0.25rem 0' }}>
                            <strong>🐎 Caballo:</strong> {reserva.caballo || 'Sin asignar'}
                          </p>
                          <div style={{
                            display: 'inline-block',
                            background: getEstadoColor(reserva.estado),
                            color: 'white',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            marginTop: '0.5rem'
                          }}>
                            {reserva.estado}
                          </div>
                        </div>

                        {/* Estado de asistencia */}
                        <div>
                          <p style={{
                            color: 'var(--primary-brown)',
                            fontWeight: '600',
                            marginBottom: '0.5rem'
                          }}>
                            Estado de Asistencia:
                          </p>
                          {reserva.asistencia ? (
                            <div style={{
                              display: 'inline-block',
                              background: getAsistenciaColor(reserva.asistencia),
                              color: 'white',
                              padding: '0.5rem 1rem',
                              borderRadius: 'var(--radius-md)',
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              textTransform: 'uppercase'
                            }}>
                              {reserva.asistencia === 'asistió' ? '✅ Asistió' : '❌ No Asistió'}
                            </div>
                          ) : (
                            <span style={{
                              color: 'var(--stone-gray)',
                              fontStyle: 'italic'
                            }}>
                              Pendiente de registro
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Botones de acción */}
                      <div style={{
                        display: 'flex',
                        gap: '1rem',
                        justifyContent: 'center',
                        borderTop: '1px solid rgba(107, 68, 35, 0.2)',
                        paddingTop: '1rem'
                      }}>
                        <button
                          onClick={() => updateAsistencia(reserva.id, 'asistió')}
                          disabled={reserva.asistencia === 'asistió'}
                          className="rustic-button"
                          style={{
                            background: reserva.asistencia === 'asistió' 
                              ? 'var(--sage-green)' 
                              : 'linear-gradient(135deg, var(--sage-green), #4a7c59)',
                            opacity: reserva.asistencia === 'asistió' ? '0.7' : '1',
                            cursor: reserva.asistencia === 'asistió' ? 'not-allowed' : 'pointer',
                            border: 'none',
                            padding: '0.75rem 1.5rem',
                            borderRadius: 'var(--radius-md)',
                            color: 'white',
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            textTransform: 'uppercase',
                            transition: 'all 0.3s ease',
                            minWidth: '120px'
                          }}
                        >
                          ✅ Asistió
                        </button>
                        
                        <button
                          onClick={() => updateAsistencia(reserva.id, 'no_asistió')}
                          disabled={reserva.asistencia === 'no_asistió'}
                          className="rustic-button"
                          style={{
                            background: reserva.asistencia === 'no_asistió' 
                              ? 'var(--terracotta)' 
                              : 'linear-gradient(135deg, var(--terracotta), #d4751f)',
                            opacity: reserva.asistencia === 'no_asistió' ? '0.7' : '1',
                            cursor: reserva.asistencia === 'no_asistió' ? 'not-allowed' : 'pointer',
                            border: 'none',
                            padding: '0.75rem 1.5rem',
                            borderRadius: 'var(--radius-md)',
                            color: 'white',
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            textTransform: 'uppercase',
                            transition: 'all 0.3s ease',
                            minWidth: '120px'
                          }}
                        >
                          ❌ No Asistió
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Estilos adicionales */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        :root {
          --primary-brown: #6b4423;
          --secondary-brown: #8b5a2b;
          --dark-brown: #5a3a1c;
          --light-brown: #a67c52;
          --terracotta: #c17b4a;
          --cream: #f5f1e8;
          --warm-white: #fefdfb;
          --stone-gray: #a8a5a0;
          --charcoal: #3e3e3e;
          --sage-green: #9caf88;
          --cream-overlay: rgba(245, 241, 232, 0.95);
          --brown-overlay: rgba(107, 68, 35, 0.8);
          --lightbrown-overlay: rgba(139, 90, 43, 0.9);
          --soft-gray: #f7f5f2;
          --font-primary: 'Roboto Flex', Arial, sans-serif;
          --font-secondary: 'Roboto Flex', Arial, sans-serif;
          --spacing-xs: 0.25rem;
          --spacing-sm: 0.5rem;
          --spacing-md: 1rem;
          --spacing-lg: 2rem;
          --spacing-xl: 3rem;
          --spacing-xxl: 4rem;
          --radius-sm: 4px;
          --radius-md: 8px;
          --radius-lg: 16px;
          --radius-xl: 24px;
          --soft-shadow: 0 2px 8px rgba(107, 68, 35, 0.1);
          --medium-shadow: 0 4px 16px rgba(107, 68, 35, 0.15);
          --strong-shadow: 0 8px 32px rgba(107, 68, 35, 0.2);
        }
        
        .rustic-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: var(--medium-shadow);
        }
      `}</style>
    </div>
  );
};

export default InstructorReservas;