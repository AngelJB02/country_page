import { useState, useEffect } from 'react'
import { invalidarCacheDisponibles } from './instructor-api'
import './HorseSelect.css'

const HorseSelect = ({ 
  classItem, 
  onHorseChange, 
  obtenerCaballosParaClase, 
  horsesHash = '',
  disabled = false 
}) => {
  const [caballos, setCaballos] = useState([])
  const [loading, setLoading] = useState(false)
  const [isOpening, setIsOpening] = useState(false)

  const cargarCaballos = async (invalidarCache = false, mostrarLoading = true) => {
    console.log('🔍 HorseSelect - Datos de la clase:', {
      id: classItem.id,
      student: classItem.student,
      studentLevel: classItem.studentLevel,
      level: classItem.level
    })
    
    if (!classItem.studentLevel) {
      console.warn('⚠️ No hay studentLevel para esta clase')
      return
    }
    
    try {
      if (mostrarLoading) {
        setLoading(true)
      }
      
      // Invalidar caché si se solicita (cuando se abre el selector)
      // Invalidar en paralelo, no esperar para no bloquear la recarga
      if (invalidarCache && classItem.studentLevel && classItem.date && classItem.time) {
        console.log('🗑️ Invalidando caché al abrir selector...')
        // Invalidar en paralelo, no esperar
        invalidarCacheDisponibles(classItem.studentLevel, classItem.date, classItem.time).catch(err => {
          console.warn('Error al invalidar caché:', err)
        })
      }
      
      console.log(`🐎 Cargando caballos para nivel: ${classItem.studentLevel}`)
      console.log(`📅 Clase info:`, { id: classItem.id, date: classItem.date, time: classItem.time })
      const caballosDisponibles = await obtenerCaballosParaClase(classItem.studentLevel, classItem)
      console.log(`✅ Caballos obtenidos para clase ${classItem.id}:`, caballosDisponibles.length)
      setCaballos(caballosDisponibles)
    } catch (error) {
      console.error('Error al cargar caballos:', error)
      // No limpiar caballos si hay error durante la recarga en segundo plano
      if (mostrarLoading) {
        setCaballos([])
      }
    } finally {
      if (mostrarLoading) {
        setLoading(false)
      }
    }
  }

  // Cargar caballos inicialmente
  useEffect(() => {
    cargarCaballos(false, true)
  }, [classItem.studentLevel, classItem.date, classItem.time, classItem.horse, horsesHash, classItem._refresh])

  // Función que se ejecuta cuando se abre el selector
  const handleOpenSelector = () => {
    // Invalidar caché y recargar caballos en segundo plano (sin bloquear la apertura)
    if (!isOpening) {
      setIsOpening(true)
      // Recargar en segundo plano sin mostrar loading para no bloquear el selector
      cargarCaballos(true, false).finally(() => {
        setIsOpening(false)
      })
    }
  }

  if (loading && caballos.length === 0) {
    return (
      <select className="horse-select" disabled>
        <option>Cargando...</option>
      </select>
    )
  }

  // Función para determinar el tipo de caballo y su estilo
  const getCaballoStyle = (caballo) => {
    const especialidad = caballo.especialidad?.toLowerCase() || ''
    const nombre = caballo.nombre?.toLowerCase() || ''
    
    // Determinar tipo de caballo
    if (nombre.includes('pony')) {
      return {
        backgroundColor: '#e8f5e8', // Verde claro
        color: '#2d5a2d',
        fontWeight: '500',
        tipo: 'pony',
        orden: 1
      }
    } else if (especialidad.includes('salto')) {
      return {
        backgroundColor: '#fff3cd', // Amarillo claro
        color: '#856404',
        fontWeight: '600',
        tipo: 'salto',
        orden: 3
      }
    } else {
      return {
        backgroundColor: '#e3f2fd', // Azul claro
        color: '#1565c0',
        fontWeight: '500',
        tipo: 'grande',
        orden: 2
      }
    }
  }

  // Función para obtener el prefijo del tipo
  const getCaballoPrefix = (caballo) => {
    const especialidad = caballo.especialidad?.toLowerCase() || ''
    const nombre = caballo.nombre?.toLowerCase() || ''
    
    if (nombre.includes('pony')) {
      return '🐴 '
    } else if (especialidad.includes('salto')) {
      return '🏆 '
    } else {
      return '🐎 '
    }
  }

  // Ordenar caballos por tipo y luego por nombre
  const caballosOrdenados = [...caballos].sort((a, b) => {
    const tipoA = getCaballoStyle(a)
    const tipoB = getCaballoStyle(b)
    
    // Primero ordenar por tipo (pony -> grande -> salto)
    if (tipoA.orden !== tipoB.orden) {
      return tipoA.orden - tipoB.orden
    }
    
    // Luego ordenar alfabéticamente por nombre
    return a.nombre.localeCompare(b.nombre)
  })

  // Normalizar valor seleccionado: tratar 'sin asignar' como vacío
  const normalizarValorCaballo = (valor) => {
    const v = (valor || '').toString().trim().toLowerCase();
    if (v === '' || v === 'sin asignar' || v === 'sin asignar caballo') return '';
    return valor;
  };

  const valorSeleccionado = normalizarValorCaballo(classItem.horse);

  // Si hay un caballo asignado y no viene en la lista, lo agregamos como opción válida para ESTA clase
  const caballoActualDisponible = caballos.find(c => c.nombre === valorSeleccionado)
  const caballosConAsignado = caballoActualDisponible || !valorSeleccionado
    ? caballos
    : [...caballos, { id: null, nombre: valorSeleccionado, especialidad: '' }]
  
  // Si la clase está cancelada, no permitir selección
  const isClassCancelled = classItem.status === 'cancelada'
  
  // Si la asistencia está marcada como "asistió" o el estatus es "completada", no permitir editar el caballo
  const isAttendanceMarked = classItem.attendance === 'asistió'
  const isClassCompleted = classItem.status === 'completada'
  
  if (isClassCancelled) {
    return (
      <select className="horse-select" disabled style={{ backgroundColor: '#f8f9fa', color: '#6c757d' }}>
        <option>Clase cancelada</option>
      </select>
    )
  }
  
  if (isAttendanceMarked || isClassCompleted) {
    return (
      <select className="horse-select" disabled style={{ backgroundColor: '#f8f9fa', color: '#6c757d' }}>
        <option>{classItem.horse || 'Sin asignar caballo'}</option>
      </select>
    )
  }
  
  return (
    <select 
      className="horse-select"
      value={valorSeleccionado}
      onFocus={handleOpenSelector}
      onMouseDown={handleOpenSelector}
      onChange={(e) => {
        const selectedValue = e.target.value;
        if (selectedValue === '') {
          // Si se selecciona vacío, enviar string vacío
          onHorseChange(classItem.id, '');
        } else {
          // Buscar el caballo completo para enviar ID y nombre
          const caballoSeleccionado = caballosOrdenados.find(c => c.nombre === selectedValue);
          if (caballoSeleccionado) {
            onHorseChange(classItem.id, {
              id: caballoSeleccionado.id,
              nombre: caballoSeleccionado.nombre
            });
          } else {
            // Fallback: enviar solo el nombre
            onHorseChange(classItem.id, selectedValue);
          }
        }
      }}
      disabled={disabled || caballos.length === 0}
      style={{ minWidth: '200px' }}
    >
      <option value="" style={{ color: '#6c757d' }}>
        Sin asignar caballo
      </option>
      {caballos.length === 0 && !loading && (
        <option value="" style={{ backgroundColor: '#f8d7da', color: '#721c24' }}>
          Sin caballos disponibles
        </option>
      )}
      {(valorSeleccionado && !caballoActualDisponible) && (
        <option value={valorSeleccionado}>
          {getCaballoPrefix({})}{valorSeleccionado}
        </option>
      )}
      {caballosOrdenados.map(caballo => (
        <option 
          key={caballo.id} 
          value={caballo.nombre}
          style={getCaballoStyle(caballo)}
        >
          {getCaballoPrefix(caballo)}{caballo.nombre}
        </option>
      ))}
    </select>
  )
}

export default HorseSelect