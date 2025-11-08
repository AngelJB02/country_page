import { useState, useEffect } from 'react'
import './HorseSelect.css'

const HorseSelect = ({ 
  classItem, 
  onHorseChange, 
  obtenerCaballosParaClase, 
  disabled = false 
}) => {
  const [caballos, setCaballos] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const cargarCaballos = async () => {
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
        setLoading(true)
        console.log(`🐎 Cargando caballos para nivel: ${classItem.studentLevel}`)
        console.log(`📅 Clase info:`, { id: classItem.id, date: classItem.date, time: classItem.time })
        const caballosDisponibles = await obtenerCaballosParaClase(classItem.studentLevel, classItem)
        console.log(`✅ Caballos obtenidos para clase ${classItem.id}:`, caballosDisponibles.length)
        setCaballos(caballosDisponibles)
      } catch (error) {
        console.error('Error al cargar caballos:', error)
        setCaballos([])
      } finally {
        setLoading(false)
      }
    }

    cargarCaballos()
  }, [classItem.studentLevel, classItem.date, classItem.time, obtenerCaballosParaClase])

  if (loading) {
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

  // Verificar si el caballo actual está en la lista de caballos disponibles
  const caballoActualDisponible = caballos.find(c => c.nombre === classItem.horse)
  
  // Si la clase está cancelada, no permitir selección
  const isClassCancelled = classItem.status === 'cancelada'
  
  if (isClassCancelled) {
    return (
      <select className="horse-select" disabled style={{ backgroundColor: '#f8f9fa', color: '#6c757d' }}>
        <option>Clase cancelada</option>
      </select>
    )
  }
  
  return (
    <select 
      className="horse-select"
      value={caballoActualDisponible ? classItem.horse : ''}
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
      {!caballoActualDisponible && classItem.horse && (
        <option value={classItem.horse} style={{ backgroundColor: '#f8d7da', color: '#721c24' }}>
          ❌ {classItem.horse} (No disponible para este nivel)
        </option>
      )}
      <option value="" style={{ color: '#6c757d' }}>
        Sin asignar caballo
      </option>
      {caballos.length === 0 && !loading && (
        <option value="" style={{ backgroundColor: '#f8d7da', color: '#721c24' }}>
          Sin caballos disponibles
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