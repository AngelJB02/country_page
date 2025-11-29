import { Clock, X as XIcon } from "lucide-react"
import { useState } from "react"
import { CancelIndividualModal } from "./CancelIndividualModal"

function DayClassesModal({ date, classes, onClose, onClassClick, instructoraId, onCancelSuccess }) {
  const [selectedReserva, setSelectedReserva] = useState(null)
  
  // Filtrar clases canceladas como medida de seguridad adicional
  // Mostrar todas las clases excepto las canceladas (incluyendo cancelada_instructor)
  const activeClasses = classes.filter(c => {
    const status = c.status?.toLowerCase();
    return status !== 'cancelada' && status !== 'cancelada_instructor';
  });
  
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
        maxWidth: '600px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        <h3 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: 'var(--primary-brown)', 
          marginBottom: '8px',
          fontFamily: 'var(--font-serif)'
        }}>
          Clases del {date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
        </h3>
        <p style={{ color: 'var(--secondary-brown)', marginBottom: '24px' }}>
          {activeClasses.length} clase{activeClasses.length !== 1 ? 's' : ''} programada{activeClasses.length !== 1 ? 's' : ''}
        </p>
        
        {activeClasses.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: 'var(--secondary-brown)',
            marginBottom: '24px'
          }}>
            <p>No hay clases activas para esta fecha</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            {activeClasses.map((classItem) => (
            <div
              key={classItem.id}
              style={{
                padding: '16px',
                backgroundColor: 'var(--cream)',
                borderRadius: '8px',
                border: '1px solid var(--stone-gray)',
                transition: 'all 0.2s'
              }}
            >
              <div 
                style={{ cursor: 'pointer' }}
                onClick={() => onClassClick(classItem)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.8'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                  <div>
                    <p style={{ fontWeight: 'bold', color: 'var(--primary-brown)', marginBottom: '4px' }}>
                      {classItem.student}
                    </p>
                    <p style={{ fontSize: '14px', color: 'var(--secondary-brown)' }}>
                      {classItem.type} • {classItem.studentAge} años
                    </p>
                  </div>
                  <span style={{
                    backgroundColor: classItem.status === 'confirmada' ? 'var(--sage-green)' : 
                                    classItem.status === 'completada' ? '#5E92F3' : 'var(--soft-gray)',
                    color: classItem.status === 'pendiente' ? 'var(--charcoal)' : 'white',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {classItem.status}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: 'var(--charcoal)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} />
                    {classItem.time}
                  </div>
                  <div>
                    🐴 {classItem.horse || 'Sin asignar'}
                  </div>
                  {classItem.attendance !== 'pendiente' && (
                    <div style={{ 
                      color: classItem.attendance === 'asistió' ? 'var(--sage-green)' : 'var(--terracotta)',
                      fontWeight: '600'
                    }}>
                      {classItem.attendance === 'asistió' ? '✓ Asistió' : '✗ Faltó'}
                    </div>
                  )}
                </div>
              </div>
              {(() => {
                const status = classItem.status?.toLowerCase();
                const puedeCancelar = (status === 'pendiente' || status === 'confirmada') && instructoraId;
                return puedeCancelar ? (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--stone-gray)' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedReserva({
                        ...classItem,
                        date: date,
                        cliente_id: classItem.cliente_id || classItem.clienteId
                      })
                    }}
                    style={{
                      width: '100%',
                      padding: '8px',
                      backgroundColor: '#A63924',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#8b2e1f'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#A63924'}
                  >
                    <XIcon size={16} />
                    Cancelar esta reserva
                  </button>
                </div>
                ) : null;
              })()}
            </div>
          ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: 'var(--primary-brown)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--dark-brown)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-brown)'}
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* Modal de cancelación individual */}
      {selectedReserva && (
        <CancelIndividualModal
          reserva={selectedReserva}
          onClose={() => setSelectedReserva(null)}
          onCancelSuccess={() => {
            setSelectedReserva(null)
            if (onCancelSuccess) {
              onCancelSuccess()
            }
          }}
        />
      )}
    </div>
  )
}
export { DayClassesModal }