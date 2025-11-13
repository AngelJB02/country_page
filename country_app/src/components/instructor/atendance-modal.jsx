import { Check, X } from "lucide-react"
import { useState } from "react"

function AttendanceModal({ classData, onClose, onAttendanceChange }) {
  const [nuevoNivel, setNuevoNivel] = useState(classData.studentLevel || 'intermedio')
  const [errorMessage, setErrorMessage] = useState('')
  
  const nivelesDisponibles = [
    { value: 'paseo', label: 'Paseo' },
    { value: 'iniciacion', label: 'Iniciación' },
    { value: 'intermedio', label: 'Intermedio' },
    { value: 'avanzado', label: 'Avanzado' }
  ]

  const handleAttendanceClick = (attendance) => {
    // Validar que haya un caballo asignado si se marca como "asistió"
    if (attendance === 'asistió') {
      const tieneCaballo = classData.horse && 
                          classData.horse.trim() !== '' && 
                          classData.horse.toLowerCase() !== 'sin asignar' &&
                          classData.horse.toLowerCase() !== 'sin asignar caballo'
      
      if (!tieneCaballo) {
        setErrorMessage('Debes asignar un caballo antes de marcar la asistencia')
        return
      }
    }
    
    // Limpiar mensaje de error si pasa la validación
    setErrorMessage('')
    
    // Si el nivel cambió, enviar el nuevo nivel junto con la asistencia
    const nivelCambiado = nuevoNivel !== classData.studentLevel
    onAttendanceChange(classData.id, attendance, nivelCambiado ? nuevoNivel : null)
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        <h3 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: 'var(--primary-brown)', 
          marginBottom: '8px',
          fontFamily: 'var(--font-serif)'
        }}>
          Registrar Asistencia
        </h3>
        <p style={{ color: 'var(--secondary-brown)', marginBottom: '24px' }}>
          {classData.student} - {classData.type}
        </p>
        
        <div style={{ marginBottom: '24px' }}>
          <p style={{ color: 'var(--charcoal)', marginBottom: '8px' }}>
            <strong>Fecha:</strong> {(() => {
              // Crear fecha asegurándonos de que use la zona horaria local
              const [year, month, day] = classData.date.split('-');
              const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
              return date.toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              });
            })()}
          </p>
          <p style={{ color: 'var(--charcoal)', marginBottom: '8px' }}>
            <strong>Hora:</strong> {classData.time}
          </p>
          <p style={{ color: 'var(--charcoal)', marginBottom: '8px' }}>
            <strong>Caballo:</strong> {classData.horse || 'Sin asignar'}
          </p>
          <p style={{ color: 'var(--charcoal)', marginBottom: '16px' }}>
            <strong>Nivel actual:</strong> {nivelesDisponibles.find(n => n.value === classData.studentLevel)?.label || classData.studentLevel || 'Intermedio'}
          </p>
        </div>

        {/* Selector para cambiar el nivel */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block', 
            color: 'var(--charcoal)', 
            fontWeight: '600', 
            marginBottom: '8px',
            fontSize: '14px'
          }}>
            Cambiar nivel del cliente:
          </label>
          <select
            value={nuevoNivel}
            onChange={(e) => setNuevoNivel(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: '1.5px solid var(--stone-gray)',
              fontSize: '16px',
              color: 'var(--charcoal)',
              backgroundColor: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--primary-brown)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--stone-gray)'}
          >
            {nivelesDisponibles.map((nivel) => (
              <option key={nivel.value} value={nivel.value}>
                {nivel.label}
              </option>
            ))}
          </select>
          {nuevoNivel !== classData.studentLevel && (
            <p style={{ 
              marginTop: '8px', 
              fontSize: '13px', 
              color: 'var(--sage-green)',
              fontStyle: 'italic'
            }}>
              El nivel se cambiará después de registrar la asistencia
            </p>
          )}
        </div>

        {/* Mensaje de error si no hay caballo asignado */}
        {errorMessage && (
          <div style={{
            padding: '12px',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '8px',
            marginBottom: '16px',
            color: '#c33',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            {errorMessage}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <button
            onClick={() => handleAttendanceClick('asistió')}
            style={{
              flex: 1,
              padding: '14px',
              backgroundColor: 'var(--sage-green)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Check size={20} />
            Asistió
          </button>
          
          <button
            onClick={() => handleAttendanceClick('faltó')}
            style={{
              flex: 1,
              padding: '14px',
              backgroundColor: 'var(--terracotta)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <X size={20} />
            Faltó
          </button>
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: 'transparent',
            color: 'var(--secondary-brown)',
            border: '1.5px solid var(--stone-gray)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--primary-brown)'
            e.currentTarget.style.backgroundColor = 'var(--cream)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--stone-gray)'
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
export { AttendanceModal }