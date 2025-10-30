import { Check, X } from "lucide-react"

function AttendanceModal({ classData, onClose, onAttendanceChange }) {
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
            <strong>Fecha:</strong> {new Date(classData.date).toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
          <p style={{ color: 'var(--charcoal)', marginBottom: '8px' }}>
            <strong>Hora:</strong> {classData.time}
          </p>
          <p style={{ color: 'var(--charcoal)' }}>
            <strong>Caballo:</strong> {classData.horse}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <button
            onClick={() => onAttendanceChange(classData.id, 'asistió')}
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
            onClick={() => onAttendanceChange(classData.id, 'faltó')}
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