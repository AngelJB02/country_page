import React, { useState, useEffect, useRef, useCallback } from 'react';
import useAutoRefresh from '../../hooks/useAutoRefresh';
import axios from 'axios';
import { Plus, Trash2, Calendar, Clock, User, CheckCircle, XCircle, Edit2, Save, X, Search, MoreVertical } from 'lucide-react';
import { toast } from 'react-toastify';

// Combobox: input con búsqueda + lista desplegable filtrable
const SearchableSelect = ({ value, onChange, options, placeholder, disabled, required }) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Texto que muestra el input: si hay valor seleccionado muestra su label, si está abierto muestra lo que se escribe
  const selectedLabel = options.find(o => String(o.value) === String(value))?.label || '';

  const filtered = query.trim()
    ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  // Cierra el dropdown al hacer click fuera
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (opt) => {
    onChange(opt.value);
    setOpen(false);
    setQuery('');
  };

  const handleInputClick = () => {
    if (!disabled) { setOpen(true); setQuery(''); }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setOpen(true);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setQuery('');
    setOpen(false);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {/* Input visible */}
      <div style={{ position: 'relative' }}>
        <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0', pointerEvents: 'none' }} />
        <input
          type="text"
          required={required && !value}
          readOnly={disabled}
          value={open ? query : selectedLabel}
          onClick={handleInputClick}
          onChange={handleInputChange}
          placeholder={disabled ? 'Primero seleccione clase' : placeholder}
          style={{
            width: '100%',
            padding: '0.8rem 2.2rem 0.8rem 2.2rem',
            borderRadius: '8px',
            border: `2px solid ${open ? '#2d5016' : '#e2e8f0'}`,
            outline: 'none',
            backgroundColor: disabled ? '#f8fafc' : 'white',
            cursor: disabled ? 'not-allowed' : 'text',
            fontSize: '0.95rem',
            boxSizing: 'border-box',
            transition: 'border-color 0.2s'
          }}
        />
        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#a0aec0', padding: '2px', display: 'flex' }}
          >
            <X size={15} />
          </button>
        )}
      </div>
      {/* Dropdown */}
      {open && !disabled && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          backgroundColor: 'white', borderRadius: '8px',
          border: '2px solid #e2e8f0', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          zIndex: 1000, maxHeight: '220px', overflowY: 'auto'
        }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '0.8rem 1rem', color: '#a0aec0', fontSize: '0.85rem' }}>Sin resultados</div>
          ) : (
            filtered.map(opt => (
              <div
                key={opt.value}
                onMouseDown={() => handleSelect(opt)}
                style={{
                  padding: '0.7rem 1rem',
                  cursor: 'pointer',
                  backgroundColor: String(opt.value) === String(value) ? '#f0fdf4' : 'transparent',
                  color: String(opt.value) === String(value) ? '#2d5016' : '#2d3748',
                  fontWeight: String(opt.value) === String(value) ? '600' : '400',
                  fontSize: '0.9rem',
                  borderBottom: '1px solid #f1f5f9',
                  transition: 'background-color 0.1s'
                }}
                onMouseEnter={e => { if (String(opt.value) !== String(value)) e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                onMouseLeave={e => { if (String(opt.value) !== String(value)) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                {opt.label}
              </div>
            ))
          )}
        </div>
      )}
      {/* Hidden input para required nativo del form */}
      {required && <input type="hidden" value={value} required={!value} onChange={() => {}} />}
    </div>
  );
};

const HorariosPersonalizadosAdmin = () => {
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingIds, setEditingIds] = useState([]); // IDs del grupo que se edita
  
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
    dias_semana: ['L'],
    hora_inicio: '10:30',
    hora_fin: '11:30'
  };

  const [formData, setFormData] = useState(initialFormState);

  // Filtros de tabla
  const [hpSearchTerm, setHpSearchTerm] = useState('');
  const [hpTipoFilter, setHpTipoFilter] = useState('vigentes');
  const [hpSortBy, setHpSortBy] = useState('cliente');
  const [hpOpenMenuId, setHpOpenMenuId] = useState(null);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    if (hpOpenMenuId === null) return;
    const close = () => setHpOpenMenuId(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [hpOpenMenuId]);

  // Conteo filtrado para el resumen
  const hpFilteredCount = (() => {
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    return horarios.filter(hp => {
      // Filtro tipo
      if (hpTipoFilter === 'vigentes') {
        if (!(hp.tipo === 'recurrente' || (hp.fecha && new Date(hp.fecha) >= hoy))) return false;
      } else if (hpTipoFilter === 'pasados') {
        if (!(hp.tipo === 'fecha_especifica' && hp.fecha && new Date(hp.fecha) < hoy)) return false;
      } else if (hpTipoFilter === 'recurrente') {
        if (hp.tipo !== 'recurrente') return false;
      } else if (hpTipoFilter === 'fecha_especifica') {
        if (hp.tipo !== 'fecha_especifica') return false;
      }
      // Filtro búsqueda
      if (hpSearchTerm) {
        const term = hpSearchTerm.toLowerCase();
        const cliente = `${hp.cliente_nombre || ''} ${hp.cliente_apellido || ''}`.toLowerCase();
        const instructora = `${hp.instructora_nombre || ''} ${hp.instructora_apellido || ''}`.toLowerCase();
        if (!cliente.includes(term) && !instructora.includes(term)) return false;
      }
      return true;
    }).length;
  })();

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [hRes, cRes, iRes, clRes, icRes] = await Promise.all([
        axios.get('http://192.168.1.68:3001/api/horarios/personalizados-all'),
        axios.get('http://192.168.1.68:3001/api/users/all'),
        axios.get('http://192.168.1.68:3001/api/instructoras'),
        axios.get('http://192.168.1.68:3001/api/horarios/clases'),
        axios.get('http://192.168.1.68:3001/api/instructoras/clases-asignadas')
      ]);
      setHorarios(hRes.data);
      setClientes(cRes.data.filter(u => u.rol === 'cliente' && u.estatus?.toLowerCase() !== 'bloqueado'));
      setInstructoras(iRes.data.filter(i => i.disponibilidad === 'disponible'));
      setClases(clRes.data);
      setInstructoraClases(icRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      if (!silent) toast.error('Error al cargar datos');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-refresh silencioso cada 30s
  const refreshHorarios = useCallback(() => fetchData(true), []);
  useAutoRefresh(refreshHorarios, { interval: 30000 });

  const handleEdit = (grupo) => {
    // grupo puede ser un registro individual o un grupo con _ids y _dias
    const ids = grupo._ids || [grupo.id];
    const dias = grupo._dias || (grupo.dia_semana ? [grupo.dia_semana] : ['L']);
    setEditingId(grupo.id);
    setEditingIds(ids);
    setFormData({
      cliente_id: grupo.cliente_id,
      instructora_id: grupo.instructora_id,
      clase_id: grupo.clase_id,
      tipo: grupo.tipo,
      fecha: grupo.fecha ? grupo.fecha.split('T')[0] : '',
      dias_semana: dias,
      hora_inicio: grupo.hora_inicio,
      hora_fin: grupo.hora_fin
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClaseChange = (val) => {
    const claseSeleccionada = clases.find(c => c.id === parseInt(val));
    
    let duracion = 60;
    if (claseSeleccionada) {
      if (['iniciacion', 'ponyclub'].includes(claseSeleccionada.nombre.toLowerCase())) {
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
    setEditingIds([]);
    setShowForm(false);
  };

  const handleClienteChange = (clienteId) => {
    const clienteSeleccionado = clientes.find(c => String(c.id) === String(clienteId));
    const tipoNivel = clienteSeleccionado?.tipo_nivel?.toLowerCase();
    
    // Buscar clase cuyo nombre coincida con el tipo_nivel del cliente
    const claseMatch = tipoNivel
      ? clases.find(c => c.nombre.toLowerCase() === tipoNivel)
      : null;

    setFormData(prev => ({ ...prev, cliente_id: clienteId }));
    
    if (claseMatch) {
      // Reutilizar handleClaseChange para calcular hora_fin y filtrar instructoras
      handleClaseChange(String(claseMatch.id));
    }
  };

  const handleDiaToggle = (dia) => {
    setFormData(prev => {
      const current = prev.dias_semana;
      if (current.includes(dia)) {
        // No permitir deseleccionar el último día
        if (current.length === 1) return prev;
        return { ...prev, dias_semana: current.filter(d => d !== dia) };
      } else {
        return { ...prev, dias_semana: [...current, dia] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        if (editingIds.length > 1 || (formData.tipo === 'recurrente' && formData.dias_semana.length > 1)) {
          // Grupo multi-día: borrar todos los viejos y crear nuevos por cada día seleccionado
          await Promise.all(editingIds.map(id =>
            axios.delete(`http://192.168.1.68:3001/api/horarios/personalizados/${id}`)
          ));
          const dias = formData.tipo === 'recurrente' ? formData.dias_semana : [null];
          await Promise.all(dias.map(dia => {
            const payload = { ...formData, dia_semana: dia };
            return axios.post('http://192.168.1.68:3001/api/horarios/personalizados', payload);
          }));
          toast.success('Horario actualizado correctamente');
        } else {
          // Edición simple vía PUT
          const payload = { ...formData, dia_semana: formData.dias_semana[0] };
          await axios.put(`http://192.168.1.68:3001/api/horarios/personalizados/${editingId}`, payload);
          toast.success('Horario actualizado correctamente');
        }
      } else {
        const dias = formData.tipo === 'recurrente' ? formData.dias_semana : [null];
        await Promise.all(
          dias.map(dia => {
            const payload = { ...formData, dia_semana: dia };
            return axios.post('http://192.168.1.68:3001/api/horarios/personalizados', payload);
          })
        );
        const count = dias.length;
        toast.success(count > 1 ? `${count} horarios creados correctamente` : 'Horario personalizado creado');
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
      await axios.delete(`http://192.168.1.68:3001/api/horarios/personalizados/${id}`);
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
          <h2 className="hp-section-title" style={{ fontWeight: '800', color: '#2d5016', margin: 0 }}>Gestión de Horarios Especiales</h2>
          <p className="hp-section-subtitle" style={{ color: '#666', marginTop: '4px' }}>Configura excepciones y horarios personalizados para clientes específicos</p>
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
        <div className="hp-form-card" style={{
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
                <SearchableSelect
                  required
                  value={formData.cliente_id}
                  onChange={handleClienteChange}
                  placeholder="Buscar cliente..."
                  options={clientes.map(c => ({ value: c.id, label: `${c.nombre} ${c.apellido} (${c.username})` }))}
                />
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
                <SearchableSelect
                  required
                  disabled={!formData.clase_id}
                  value={formData.instructora_id}
                  onChange={(val) => setFormData(prev => ({ ...prev, instructora_id: val }))}
                  placeholder="Buscar instructora..."
                  options={instructoras
                    .filter(i => instructoraClases.some(ic => ic.instructora_id === i.id && ic.clase_id === parseInt(formData.clase_id)))
                    .map(i => ({ value: i.id, label: `${i.nombre} ${i.apellido}` }))
                  }
                />
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
                  <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: '600', color: '#4a5568', fontSize: '0.9rem' }}>
                    Días de la Semana
                    {!editingId && (
                      <span style={{ marginLeft: '0.5rem', fontWeight: '400', color: '#a0aec0', fontSize: '0.8rem' }}>
                        (puedes seleccionar varios)
                      </span>
                    )}
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {Object.entries(dayMapLong).map(([key, label]) => {
                      const isSelected = formData.dias_semana.includes(key);
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleDiaToggle(key)}
                          title={label}
                          style={{
                            padding: '0.55rem 0.9rem',
                            borderRadius: '8px',
                            border: '2px solid',
                            borderColor: isSelected ? '#2d5016' : '#e2e8f0',
                            backgroundColor: isSelected ? '#2d5016' : 'white',
                            color: isSelected ? 'white' : '#4a5568',
                            fontWeight: '700',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            minWidth: '42px',
                            textAlign: 'center'
                          }}
                        >
                          {key}
                        </button>
                      );
                    })}
                  </div>
                  {!editingId && formData.dias_semana.length > 1 && (
                    <p style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: '#059669', fontWeight: '600' }}>
                      ✓ Se crearán {formData.dias_semana.length} horarios: {formData.dias_semana.map(d => dayMapLong[d]).join(', ')}
                    </p>
                  )}
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
        {/* Filtros integrados en la card */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #edf2f7',
          background: '#fafbfc'
        }}>
          <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: '280px' }}>
            <Search size={14} style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }} />
            <input
              type="text"
              placeholder="Buscar cliente o instructora..."
              value={hpSearchTerm}
              onChange={e => setHpSearchTerm(e.target.value)}
              style={{
                width: '100%', padding: '0.45rem 0.7rem 0.45rem 2rem',
                border: '1.5px solid #e2e8f0', borderRadius: '7px', fontSize: '0.82rem',
                background: 'white', color: '#2d3748', boxSizing: 'border-box'
              }}
            />
          </div>
          <select
            value={hpTipoFilter}
            onChange={e => setHpTipoFilter(e.target.value)}
            style={{
              padding: '0.45rem 1.8rem 0.45rem 0.7rem', border: '1.5px solid #e2e8f0',
              borderRadius: '7px', fontSize: '0.82rem', background: 'white', color: '#2d3748',
              cursor: 'pointer', appearance: 'none',
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 12 12'%3E%3Cpath fill='%23718096' d='M6 9L1 4h10z'/%3E%3C/svg%3E\")",
              backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.6rem center'
            }}
          >
            <option value="">Todos</option>
            <option value="vigentes">Vigentes</option>
            <option value="recurrente">Recurrentes</option>
            <option value="fecha_especifica">Fecha única</option>
            <option value="pasados">Pasados</option>
          </select>
          <select
            value={hpSortBy}
            onChange={e => setHpSortBy(e.target.value)}
            style={{
              padding: '0.45rem 1.8rem 0.45rem 0.7rem', border: '1.5px solid #e2e8f0',
              borderRadius: '7px', fontSize: '0.82rem', background: 'white', color: '#2d3748',
              cursor: 'pointer', appearance: 'none',
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 12 12'%3E%3Cpath fill='%23718096' d='M6 9L1 4h10z'/%3E%3C/svg%3E\")",
              backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.6rem center'
            }}
          >
            <option value="cliente">Por cliente</option>
            <option value="instructora">Por instructora</option>
            <option value="clase">Por clase</option>
          </select>
        </div>

        {/* Resumen de filtros */}
        <p style={{ margin: 0, padding: '0.5rem 1.5rem 0.6rem', fontSize: '0.82rem', color: '#4a5568', borderBottom: '1px solid #edf2f7' }}>
          Mostrando <strong>{hpFilteredCount} horario{hpFilteredCount !== 1 ? 's' : ''}</strong>
          {' · '}{hpTipoFilter === 'vigentes' ? 'Vigentes' : hpTipoFilter === 'recurrente' ? 'Recurrentes' : hpTipoFilter === 'fecha_especifica' ? 'Fecha única' : hpTipoFilter === 'pasados' ? 'Pasados' : 'Todos'}
          {' · '}{hpSortBy === 'cliente' ? 'Por cliente' : hpSortBy === 'instructora' ? 'Por instructora' : 'Por clase'}
          {!hpTipoFilter && !hpSearchTerm && (
            <span style={{ fontStyle: 'italic', opacity: 0.6 }}> · Usa los filtros para ajustar la búsqueda</span>
          )}
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(107,68,35,0.08)' }}>
                <th style={{ textAlign: 'left', padding: '0.75rem 1.5rem', color: 'var(--secondary-brown)', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px', fontWeight: 700 }}>Cliente</th>
                <th style={{ textAlign: 'left', padding: '0.75rem 1.5rem', color: 'var(--secondary-brown)', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px', fontWeight: 700 }}>Clase</th>
                <th style={{ textAlign: 'left', padding: '0.75rem 1.5rem', color: 'var(--secondary-brown)', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px', fontWeight: 700 }}>Instructora</th>
                <th style={{ textAlign: 'left', padding: '0.75rem 1.5rem', color: 'var(--secondary-brown)', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px', fontWeight: 700 }}>Periodicidad</th>
                <th style={{ textAlign: 'left', padding: '0.75rem 1.5rem', color: 'var(--secondary-brown)', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px', fontWeight: 700 }}>Horario</th>
                <th style={{ textAlign: 'center', padding: '0.75rem 1.5rem', color: 'var(--secondary-brown)', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px', fontWeight: 700, width: '60px' }}></th>
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
              ) : (() => {
                // Agrupar horarios recurrentes con mismo cliente+instructora+clase+hora en una sola fila
                const hoy = new Date();
                hoy.setHours(0, 0, 0, 0);
                const diasOrden = ['L','M','X','J','V','S','D'];
                const grupos = [];
                const usados = new Set();

                // Filtrar por tipo/vigencia
                const horariosBase = horarios.filter(hp => {
                  if (hpTipoFilter === 'vigentes') {
                    return hp.tipo === 'recurrente' || (hp.fecha && new Date(hp.fecha) >= hoy);
                  }
                  if (hpTipoFilter === 'pasados') {
                    return hp.tipo === 'fecha_especifica' && hp.fecha && new Date(hp.fecha) < hoy;
                  }
                  if (hpTipoFilter === 'recurrente') return hp.tipo === 'recurrente';
                  if (hpTipoFilter === 'fecha_especifica') return hp.tipo === 'fecha_especifica';
                  return true;
                });

                // Filtrar por búsqueda
                const horariosFiltered = horariosBase.filter(hp => {
                  if (!hpSearchTerm) return true;
                  const term = hpSearchTerm.toLowerCase();
                  const cliente = `${hp.cliente_nombre || ''} ${hp.cliente_apellido || ''}`.toLowerCase();
                  const instructora = `${hp.instructora_nombre || ''} ${hp.instructora_apellido || ''}`.toLowerCase();
                  return cliente.includes(term) || instructora.includes(term);
                });

                horariosFiltered.forEach(hp => {
                  if (usados.has(hp.id)) return;
                  if (hp.tipo === 'recurrente') {
                    const hermanos = horariosFiltered.filter(h =>
                      !usados.has(h.id) &&
                      h.tipo === 'recurrente' &&
                      h.cliente_id === hp.cliente_id &&
                      h.instructora_id === hp.instructora_id &&
                      h.clase_id === hp.clase_id &&
                      h.hora_inicio === hp.hora_inicio &&
                      h.hora_fin === hp.hora_fin
                    );
                    hermanos.forEach(h => usados.add(h.id));
                    const diasOrdenados = hermanos
                      .map(h => h.dia_semana)
                      .sort((a, b) => diasOrden.indexOf(a) - diasOrden.indexOf(b));
                    grupos.push({ ...hp, _ids: hermanos.map(h => h.id), _dias: diasOrdenados });
                  } else {
                    usados.add(hp.id);
                    grupos.push({ ...hp, _ids: [hp.id], _dias: [hp.dia_semana] });
                  }
                });

                // Ordenar
                grupos.sort((a, b) => {
                  if (hpSortBy === 'cliente') {
                    return `${a.cliente_nombre} ${a.cliente_apellido}`.localeCompare(`${b.cliente_nombre} ${b.cliente_apellido}`);
                  }
                  if (hpSortBy === 'instructora') {
                    return `${a.instructora_nombre} ${a.instructora_apellido}`.localeCompare(`${b.instructora_nombre} ${b.instructora_apellido}`);
                  }
                  if (hpSortBy === 'clase') {
                    return (a.clase_nombre || '').localeCompare(b.clase_nombre || '');
                  }
                  return 0;
                });

                if (grupos.length === 0) {
                  return (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#a0aec0' }}>
                        No se encontraron horarios con los filtros aplicados.
                      </td>
                    </tr>
                  );
                }

                return grupos.map(grupo => {
                  const esPasado = grupo.tipo === 'fecha_especifica' && grupo.fecha && new Date(grupo.fecha) < hoy;
                  return (
                  <tr key={grupo._ids.join('-')} style={{ borderBottom: '1px solid rgba(107,68,35,0.06)', transition: 'background-color 0.15s', opacity: esPasado ? 0.45 : 1 }}>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ fontWeight: '600', color: 'var(--dark-brown)', fontSize: '0.88rem' }}>{grupo.cliente_nombre} {grupo.cliente_apellido}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--stone-gray)' }}>#{grupo.cliente_id}</div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{
                        backgroundColor: 'rgba(193, 123, 74, 0.08)',
                        color: 'var(--primary-brown)',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        letterSpacing: '0.3px',
                        textTransform: 'uppercase'
                      }}>
                        {grupo.clase_nombre}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '7px', backgroundColor: 'rgba(156,175,136,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7a9768' }}>
                          <User size={14} />
                        </div>
                        <span style={{ color: 'var(--charcoal)', fontWeight: '500', fontSize: '0.88rem' }}>{grupo.instructora_nombre} {grupo.instructora_apellido}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      {grupo.tipo === 'recurrente' ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
                          {grupo._dias.map(d => {
                            const nombres = { L: 'Lunes', M: 'Martes', X: 'Miércoles', J: 'Jueves', V: 'Viernes', S: 'Sábado', D: 'Domingo' };
                            return (
                              <span key={d} style={{
                                backgroundColor: 'rgba(156,175,136,0.15)',
                                color: '#5a7a47',
                                padding: '0.2rem 0.55rem',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: '600'
                              }}>{nombres[d] || d}</span>
                            );
                          })}
                        </div>
                      ) : (
                        <div>
                          <div style={{ color: esPasado ? 'var(--stone-gray)' : 'var(--dark-brown)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '500', fontSize: '0.85rem' }}>
                            <Calendar size={14} style={{ opacity: 0.5 }} /> {new Date(grupo.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                          {esPasado && (
                            <span style={{ fontSize: '0.68rem', color: '#c17b4a', fontWeight: 500 }}>Fecha pasada</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '0.3rem 0.7rem',
                        backgroundColor: 'rgba(107,68,35,0.05)',
                        borderRadius: '6px',
                        color: 'var(--dark-brown)',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        fontFamily: 'var(--font-secondary)',
                        letterSpacing: '0.2px'
                      }}>
                        {grupo.hora_inicio} - {grupo.hora_fin}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const menuKey = grupo._ids.join('-');
                            setHpOpenMenuId(hpOpenMenuId === menuKey ? null : menuKey);
                          }}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: '34px', height: '34px', border: '1.5px solid #e2e8f0',
                            borderRadius: '8px', background: 'white', color: '#718096',
                            cursor: 'pointer', transition: 'all 0.15s'
                          }}
                        >
                          <MoreVertical size={16} />
                        </button>
                        {hpOpenMenuId === grupo._ids.join('-') && (
                          <div onClick={e => e.stopPropagation()} style={{
                            position: 'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 100,
                            background: 'white', border: '1px solid #edf2f7', borderRadius: '10px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: '180px', padding: '4px',
                            animation: 'slideDown 0.12s ease-out'
                          }}>
                            <button
                              onClick={() => { handleEdit(grupo); setHpOpenMenuId(null); }}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                                padding: '8px 12px', border: 'none', borderRadius: '7px',
                                background: 'none', cursor: 'pointer', color: '#2d3748',
                                fontSize: '0.84rem', fontWeight: 500, textAlign: 'left'
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = '#f7fafc'}
                              onMouseLeave={e => e.currentTarget.style.background = 'none'}
                            >
                              <Edit2 size={15} style={{ color: '#4a90e2' }} />
                              Editar horario
                            </button>
                            <div style={{ height: '1px', background: '#f1f5f9', margin: '3px 8px' }} />
                            <button
                              onClick={async () => {
                                setHpOpenMenuId(null);
                                const msg = grupo._ids.length > 1
                                  ? `¿Eliminar los ${grupo._ids.length} horarios de este grupo (${grupo._dias.map(d => dayMapLong[d]).join(', ')})?`
                                  : '¿Eliminar este horario personalizado?';
                                if (!window.confirm(msg)) return;
                                try {
                                  await Promise.all(grupo._ids.map(id =>
                                    axios.delete(`http://192.168.1.68:3001/api/horarios/personalizados/${id}`)
                                  ));
                                  toast.success(grupo._ids.length > 1 ? `${grupo._ids.length} horarios eliminados` : 'Horario eliminado');
                                  fetchData();
                                } catch {
                                  toast.error('Error al eliminar');
                                }
                              }}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                                padding: '8px 12px', border: 'none', borderRadius: '7px',
                                background: 'none', cursor: 'pointer', color: '#e03131',
                                fontSize: '0.84rem', fontWeight: 500, textAlign: 'left'
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'}
                              onMouseLeave={e => e.currentTarget.style.background = 'none'}
                            >
                              <Trash2 size={15} />
                              Eliminar
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
                });
              })()}
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
