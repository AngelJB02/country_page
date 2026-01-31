import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Calendar, Clock, User, CheckCircle, XCircle, Edit2, Save, X } from 'lucide-react';
import { toast } from 'react-toastify';

const HorariosPersonalizadosAdmin = () => {
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Data for selects
  const [clientes, setClientes] = useState([]);
  const [instructoras, setInstructoras] = useState([]);
  const [clases, setClases] = useState([]);
  const [instructoraClases, setInstructoraClases] = useState([]);

  // Form state
  const initialFormState = {
    cliente_id: '',
    instructora_id: '',
    clase_id: '',
    tipo: 'fecha_especifica',
    fecha: '',
    dia_semana: 'L',
    hora_inicio: '10:30',
    hora_fin: '11:30'
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [hRes, cRes, iRes, clRes, icRes] = await Promise.all([
        axios.get('https://elrefugiocountryclub.com/api/api/horarios/personalizados-all'),
        axios.get('https://elrefugiocountryclub.com/api/api/users/all'),
        axios.get('https://elrefugiocountryclub.com/api/api/instructoras'),
        axios.get('https://elrefugiocountryclub.com/api/api/horarios/clases'),
        axios.get('https://elrefugiocountryclub.com/api/api/instructoras/clases-asignadas')
      ]);
      setHorarios(hRes.data);
      // Solo clientes activos (no bloqueados)
      setClientes(cRes.data.filter(u => u.rol === 'cliente' && u.estatus?.toLowerCase() !== 'bloqueado'));
      // Solo instructoras disponibles
      setInstructoras(iRes.data.filter(i => i.disponibilidad === 'disponible'));
      setClases(clRes.data);
      setInstructoraClases(icRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (hp) => {
    setEditingId(hp.id);
    setFormData({
      cliente_id: hp.cliente_id,
      instructora_id: hp.instructora_id,
      clase_id: hp.clase_id,
      tipo: hp.tipo,
      fecha: hp.fecha ? hp.fecha.split('T')[0] : '',
      dia_semana: hp.dia_semana || 'L',
      hora_inicio: hp.hora_inicio,
      hora_fin: hp.hora_fin
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClaseChange = (val) => {
    const claseSeleccionada = clases.find(c => c.id === parseInt(val));
    
    let duracion = 60;
    if (claseSeleccionada) {
      if (claseSeleccionada.nombre.toLowerCase() === 'iniciacion') {
        duracion = 30;
      } else {
        duracion = claseSeleccionada.duracion_min || 60;
      }
    }

    setFormData(prev => {
      const newHoraInicio = prev.hora_inicio || '10:30';
      const [h, m] = newHoraInicio.split(':').map(Number);
      const end = new Date();
      end.setHours(h, m + duracion, 0);
      const horaFinString = `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;
      
      // Validar si la instructora actual puede dar esta nueva clase
      let nuevaInstructoraId = prev.instructora_id;
      if (prev.instructora_id) {
        const puedeDarClase = instructoraClases.some(ic => 
          ic.instructora_id === parseInt(prev.instructora_id) && 
          ic.clase_id === parseInt(val)
        );
        if (!puedeDarClase) {
          nuevaInstructoraId = ''; // Resetear si no es válida
        }
      }

      return {
        ...prev,
        clase_id: val,
        instructora_id: nuevaInstructoraId,
        hora_fin: horaFinString
      };
    });
  };

  const handleHoraInicioChange = (val) => {
    setFormData(prev => {
      const [h, m] = val.split(':').map(Number);
      
      // Determinar duración actual basada en la diferencia
      const [startH, startM] = prev.hora_inicio.split(':').map(Number);
      const [endH, endM] = prev.hora_fin.split(':').map(Number);
      const duracionActual = (endH * 60 + endM) - (startH * 60 + startM);
      const duracionUsar = duracionActual > 0 ? duracionActual : 60;

      const end = new Date();
      end.setHours(h, m + duracionUsar, 0);
      const horaFinString = `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;
      
      return {
        ...prev,
        hora_inicio: val,
        hora_fin: horaFinString
      };
    });
  };

  const handleDuracionManual = (minutos) => {
    setFormData(prev => {
      const [h, m] = prev.hora_inicio.split(':').map(Number);
      const end = new Date();
      end.setHours(h, m + parseInt(minutos), 0);
      const horaFinString = `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;
      
      return {
        ...prev,
        hora_fin: horaFinString
      };
    });
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`https://elrefugiocountryclub.com/api/api/horarios/personalizados/${editingId}`, formData);
        toast.success('Horario actualizado correctamente');
      } else {
        await axios.post('https://elrefugiocountryclub.com/api/api/horarios/personalizados', formData);
        toast.success('Horario personalizado creado');
      }
      resetForm();
      fetchData();
    } catch (err) {
      console.error('Error saving schedule:', err);
      toast.error(editingId ? 'Error al actualizar' : 'Error al crear');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este horario personalizado?')) return;
    try {
      await axios.delete(`https://elrefugiocountryclub.com/api/api/horarios/personalizados/${id}`);
      toast.success('Horario eliminado');
      fetchData();
    } catch (err) {
      toast.error('Error al eliminar');
    }
  };

  const dayMapLong = {
    'L': 'Lunes', 'M': 'Martes', 'X': 'Miércoles', 'J': 'Jueves',
    'V': 'Viernes', 'S': 'Sábado', 'D': 'Domingo'
  };

  return (
    <div className="hp-admin-container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="hp-header" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem',
        backgroundColor: '#fff',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
      }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#2d5016', margin: 0 }}>Gestión de Horarios Especiales</h2>
          <p style={{ color: '#666', marginTop: '4px' }}>Configura excepciones y horarios personalizados para clientes específicos</p>
        </div>
        <button 
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.6rem', 
            backgroundColor: showForm ? '#e03131' : '#2d5016', 
            color: 'white', 
            padding: '0.8rem 1.4rem', 
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.2s',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
          {showForm ? 'Cancelar' : 'Nuevo Horario Extra'}
        </button>
      </div>

      {showForm && (
        <div style={{ 
          backgroundColor: 'white', 
          padding: '2rem', 
          borderRadius: '12px', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
          marginBottom: '2.5rem',
          border: '1px solid #edf2f7',
          animation: 'slideDown 0.3s ease-out'
        }}>
          <h3 style={{ marginBottom: '1.5rem', color: '#2d3748', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {editingId ? <Edit2 size={20} /> : <Plus size={20} />}
            {editingId ? 'Editar Horario Especial' : 'Crear Nuevo Horario Especial'}
          </h3>
          
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: '600', color: '#4a5568', fontSize: '0.9rem' }}>Cliente</label>
                <select 
                  required
                  value={formData.cliente_id} 
                  onChange={(e) => setFormData({...formData, cliente_id: e.target.value})}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '2px solid #e2e8f0', outline: 'none', transition: 'border-color 0.2s' }}
                >
                  <option value="">Seleccione cliente...</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre} {c.apellido} ({c.username})</option>)}
                </select>
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: '600', color: '#4a5568', fontSize: '0.9rem' }}>Clase</label>
                <select 
                  required
                  value={formData.clase_id} 
                  onChange={(e) => handleClaseChange(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '2px solid #e2e8f0', outline: 'none' }}
                >
                  <option value="">Seleccione clase...</option>
                  {clases.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: '600', color: '#4a5568', fontSize: '0.9rem' }}>Instructora</label>
                <select 
                  required
                  disabled={!formData.clase_id}
                  value={formData.instructora_id} 
                  onChange={(e) => setFormData({...formData, instructora_id: e.target.value})}
                  style={{ 
                    width: '100%', 
                    padding: '0.8rem', 
                    borderRadius: '8px', 
                    border: '2px solid #e2e8f0', 
                    outline: 'none',
                    backgroundColor: !formData.clase_id ? '#f8fafc' : 'white',
                    cursor: !formData.clase_id ? 'not-allowed' : 'default'
                  }}
                >
                  <option value="">{formData.clase_id ? 'Seleccione instructora...' : 'Primero seleccione clase'}</option>
                  {instructoras
                    .filter(i => instructoraClases.some(ic => ic.instructora_id === i.id && ic.clase_id === parseInt(formData.clase_id)))
                    .map(i => <option key={i.id} value={i.id}>{i.nombre} {i.apellido}</option>)
                  }
                </select>
                {formData.clase_id && instructoras.filter(i => instructoraClases.some(ic => ic.instructora_id === i.id && ic.clase_id === parseInt(formData.clase_id))).length === 0 && (
                  <p style={{ color: '#e03131', fontSize: '0.75rem', marginTop: '4px' }}>No hay instructoras disponibles para esta clase</p>
                )}
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: '600', color: '#4a5568', fontSize: '0.9rem' }}>Duración Sugerida</label>
                <select 
                  onChange={(e) => handleDuracionManual(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '2px solid #e2e8f0', outline: 'none', backgroundColor: '#f8fafc' }}
                  value={(parseInt(formData.hora_fin.split(':')[0]) * 60 + parseInt(formData.hora_fin.split(':')[1])) - (parseInt(formData.hora_inicio.split(':')[0]) * 60 + parseInt(formData.hora_inicio.split(':')[1]))}
                >
                  <option value="30">Media Hora (30 min)</option>
                  <option value="60">Una Hora (60 min)</option>
                  <option value="90">Hora y Media (90 min)</option>
                  <option value="120">Dos Horas (120 min)</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: '600', color: '#4a5568', fontSize: '0.9rem' }}>Tipo de Horario</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, tipo: 'fecha_especifica'})}
                    style={{ 
                      flex: 1, padding: '0.8rem', borderRadius: '8px', border: '2px solid',
                      borderColor: formData.tipo === 'fecha_especifica' ? '#2d5016' : '#e2e8f0',
                      backgroundColor: formData.tipo === 'fecha_especifica' ? '#f0fdf4' : 'white',
                      color: formData.tipo === 'fecha_especifica' ? '#2d5016' : '#4a5568',
                      cursor: 'pointer', fontWeight: '600'
                    }}
                  >
                    Fecha Única
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, tipo: 'recurrente'})}
                    style={{ 
                      flex: 1, padding: '0.8rem', borderRadius: '8px', border: '2px solid',
                      borderColor: formData.tipo === 'recurrente' ? '#2d5016' : '#e2e8f0',
                      backgroundColor: formData.tipo === 'recurrente' ? '#f0fdf4' : 'white',
                      color: formData.tipo === 'recurrente' ? '#2d5016' : '#4a5568',
                      cursor: 'pointer', fontWeight: '600'
                    }}
                  >
                    Cada Semana
                  </button>
                </div>
              </div>

              {formData.tipo === 'fecha_especifica' ? (
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: '600', color: '#4a5568', fontSize: '0.9rem' }}>Fecha</label>
                  <input 
                    type="date" 
                    required
                    value={formData.fecha} 
                    onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '2px solid #e2e8f0', outline: 'none' }}
                  />
                </div>
              ) : (
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: '600', color: '#4a5568', fontSize: '0.9rem' }}>Día de la Semana</label>
                  <select 
                    required
                    value={formData.dia_semana} 
                    onChange={(e) => setFormData({...formData, dia_semana: e.target.value})}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '2px solid #e2e8f0', outline: 'none' }}
                  >
                    {Object.entries(dayMapLong).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: '600', color: '#4a5568', fontSize: '0.9rem' }}>Hora Inicio</label>
                  <input 
                    type="time" 
                    required
                    value={formData.hora_inicio} 
                    onChange={(e) => handleHoraInicioChange(e.target.value)}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '2px solid #e2e8f0', outline: 'none' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: '600', color: '#4a5568', fontSize: '0.9rem' }}>Hora Fin</label>
                  <input 
                    type="time" 
                    required
                    value={formData.hora_fin} 
                    onChange={(e) => setFormData({...formData, hora_fin: e.target.value})}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '2px solid #e2e8f0', outline: 'none' }}
                  />
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
              <button 
                type="submit"
                style={{ 
                  flex: 3,
                  backgroundColor: '#2d5016', 
                  color: 'white', 
                  padding: '1rem', 
                  borderRadius: '10px', 
                  border: 'none', 
                  fontWeight: '700',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'transform 0.1s alternate',
                  boxShadow: '0 4px 12px rgba(45, 80, 22, 0.2)'
                }}
              >
                {editingId ? <Save size={20} /> : <CheckCircle size={20} />}
                {editingId ? 'Actualizar Horario' : 'Confirmar y Guardar'}
              </button>
              {editingId && (
                <button 
                  type="button"
                  onClick={resetForm}
                  style={{ 
                    flex: 1,
                    backgroundColor: '#f7fafc', 
                    color: '#4a5568', 
                    padding: '1rem', 
                    borderRadius: '10px', 
                    border: '2px solid #e2e8f0', 
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Descartar
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="hp-list" style={{ 
        backgroundColor: 'white', 
        borderRadius: '16px', 
        overflow: 'hidden', 
        boxShadow: '0 4px 25px rgba(0,0,0,0.06)',
        border: '1px solid #edf2f7'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #edf2f7' }}>
                <th style={{ textAlign: 'left', padding: '1.2rem 1.5rem', color: '#718096', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Cliente</th>
                <th style={{ textAlign: 'left', padding: '1.2rem 1.5rem', color: '#718096', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Clase / Nivel</th>
                <th style={{ textAlign: 'left', padding: '1.2rem 1.5rem', color: '#718096', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Instructora Asignada</th>
                <th style={{ textAlign: 'left', padding: '1.2rem 1.5rem', color: '#718096', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Periodicidad</th>
                <th style={{ textAlign: 'left', padding: '1.2rem 1.5rem', color: '#718096', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Rango Horario</th>
                <th style={{ textAlign: 'center', padding: '1.2rem 1.5rem', color: '#718096', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {horarios.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '4rem', color: '#a0aec0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                      <Calendar size={48} opacity={0.2} />
                      <span>No hay horarios personalizados configurados</span>
                    </div>
                  </td>
                </tr>
              ) : (
                horarios.map(hp => (
                  <tr key={hp.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }}>
                    <td style={{ padding: '1.2rem 1.5rem' }}>
                      <div style={{ fontWeight: '700', color: '#2d3748' }}>{hp.cliente_nombre} {hp.cliente_apellido}</div>
                      <div style={{ fontSize: '0.8rem', color: '#718096' }}>ID Alumno: #{hp.cliente_id}</div>
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem' }}>
                      <span style={{ 
                        backgroundColor: '#f0f9ff', 
                        color: '#0369a1',
                        padding: '0.3rem 0.8rem', 
                        borderRadius: '20px', 
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        border: '1px solid #bae6fd'
                      }}>
                        {hp.clase_nombre.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                          <User size={16} />
                        </div>
                        <span style={{ color: '#4a5568', fontWeight: '500' }}>{hp.instructora_nombre} {hp.instructora_apellido}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem' }}>
                      {hp.tipo === 'recurrente' ? (
                        <div style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
                          <Clock size={16} /> Cada {dayMapLong[hp.dia_semana]}
                        </div>
                      ) : (
                        <div style={{ color: '#2563eb', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', fontSize: '0.9rem' }}>
                          <Calendar size={16} /> {new Date(hp.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem' }}>
                      <div style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        padding: '0.4rem 0.8rem', 
                        backgroundColor: '#fffbeb', 
                        borderRadius: '8px',
                        border: '1px solid #fde68a',
                        color: '#92400e',
                        fontWeight: '700',
                        fontSize: '0.9rem'
                      }}>
                        {hp.hora_inicio} - {hp.hora_fin}
                      </div>
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                        <button 
                          onClick={() => handleEdit(hp)}
                          style={{ 
                            color: '#4a5568', 
                            backgroundColor: '#f1f5f9',
                            border: 'none', 
                            cursor: 'pointer', 
                            padding: '0.6rem',
                            borderRadius: '8px',
                            transition: 'all 0.2s'
                          }}
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(hp.id)}
                          style={{ 
                            color: '#e03131', 
                            backgroundColor: '#fee2e2',
                            border: 'none', 
                            cursor: 'pointer', 
                            padding: '0.6rem',
                            borderRadius: '8px',
                            transition: 'all 0.2s'
                          }}
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hp-list tr:hover {
          background-color: #f8fafc;
        }
        button:hover {
          filter: brightness(0.95);
        }
      `}</style>
    </div>
  );
};

export default HorariosPersonalizadosAdmin;
