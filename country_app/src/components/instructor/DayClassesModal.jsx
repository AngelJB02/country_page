import { Clock } from "lucide-react"
import { useState } from "react"

function DayClassesModal({ date, classes, onClose, onClassClick }) {
  const [cancelingId, setCancelingId] = useState(null);
  // Filtrar clases canceladas como medida de seguridad adicional
  const activeClasses = classes.filter(c => c.status !== 'cancelada' && c.status !== 'cancelado_instructor');

  // Función para cancelar clase
  const handleCancelClass = async (classItem) => {
    if (!window.confirm('¿Seguro que deseas cancelar esta clase? Esto notificará al cliente.')) return;
    setCancelingId(classItem.id);
    try {
      const response = await fetch(`http://localhost:3001/api/reservas/${classItem.id}/estatus`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estatus: 'cancelado_instructor' })
      });
      if (!response.ok) throw new Error('Error al cancelar la clase');
      window.location.reload();
    } catch (err) {
      alert('No se pudo cancelar la clase.');
    } finally {
      setCancelingId(null);
    }
  };

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
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={() => onClassClick(classItem)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--soft-gray)'
                e.currentTarget.style.transform = 'translateX(4px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--cream)'
                e.currentTarget.style.transform = 'translateX(0)'
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
                  🐴 {classItem.horse}
                </div>
                {classItem.attendance !== 'pendiente' && (
                  <div style={{ 
                    color: classItem.attendance === 'asistió' ? 'var(--sage-green)' : 'var(--terracotta)',
                    fontWeight: '600'
                  }}>
                    {classItem.attendance === 'asistió' ? '✓ Asistió' : '✗ Faltó'}
                  </div>
                )}
                <button
                  style={{
                    marginLeft: 'auto',
                    backgroundColor: 'var(--terracotta)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 14px',
                    fontWeight: 'bold',
                    cursor: cancelingId === classItem.id ? 'not-allowed' : 'pointer',
                    opacity: cancelingId === classItem.id ? 0.6 : 1
                  }}
                  disabled={cancelingId === classItem.id}
                  onClick={e => {
                    e.stopPropagation();
                    handleCancelClass(classItem);
                  }}
                >
                  {cancelingId === classItem.id ? 'Cancelando...' : 'Cancelar clase'}
                </button>
              </div>
            </div>
          ))}
          </div>
        )}

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
  )
}
export { DayClassesModal }