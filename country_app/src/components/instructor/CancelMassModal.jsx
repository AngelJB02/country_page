import { useState } from "react"
import { X, AlertTriangle } from "lucide-react"

function CancelMassModal({ date, classes, instructoraId, onClose, onCancelSuccess }) {
  const [tipoCancelacion, setTipoCancelacion] = useState('dia') // 'dia' o 'desde-hora'
  const [horaInicio, setHoraInicio] = useState('')
  const [motivo, setMotivo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Filtrar clases activas (pendientes o confirmadas) para mostrar
  const clasesActivas = classes.filter(c => 
    c.status === 'pendiente' || c.status === 'confirmada'
  )

  // Obtener horas únicas de las clases activas para el selector
  const horasUnicas = [...new Set(clasesActivas.map(c => c.time).sort())]

  // Calcular cuántas clases se cancelarían
  const clasesACancelar = tipoCancelacion === 'dia' 
    ? clasesActivas.length
    : clasesActivas.filter(c => c.time >= horaInicio).length

  // Convertir fecha a formato YYYY-MM-DD
  const fechaFormato = date instanceof Date 
    ? date.toISOString().split('T')[0]
    : (() => {
        // Si es string, asegurarse de que esté en formato YYYY-MM-DD
        if (typeof date === 'string') {
          const parts = date.split('T')[0].split('-')
          if (parts.length === 3) {
            return date.split('T')[0]
          }
          // Si no está en formato correcto, intentar parsearlo
          const parsed = new Date(date)
          if (!isNaN(parsed.getTime())) {
            return parsed.toISOString().split('T')[0]
          }
        }
        return date
      })()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { cancelarReservasDia, cancelarReservasDesdeHora } = await import('./instructor-api')
      
      let result
      if (tipoCancelacion === 'dia') {
        result = await cancelarReservasDia(instructoraId, fechaFormato, motivo || null)
      } else {
        if (!horaInicio) {
          setError('Por favor selecciona una hora de inicio')
          setLoading(false)
          return
        }
        result = await cancelarReservasDesdeHora(instructoraId, fechaFormato, horaInicio, motivo || null)
      }

      // Llamar al callback de éxito
      if (onCancelSuccess) {
        onCancelSuccess(result)
      }
      
      // Cerrar el modal
      onClose()
    } catch (err) {
      console.error('Error al cancelar reservas:', err)
      setError(err.message || 'Error al cancelar las reservas')
    } finally {
      setLoading(false)
    }
  }

  // Formatear fecha para mostrar
  const fechaFormateada = (() => {
    if (date instanceof Date) {
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
    }
    if (typeof date === 'string') {
      const [year, month, day] = date.split('T')[0].split('-')
      if (year && month && day) {
        const fecha = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
        return fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
      }
    }
    return date.toString()
  })()

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
      zIndex: 2000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        position: 'relative'
      }}>
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <X size={20} color="#666" />
        </button>

        <div style={{ marginBottom: '24px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            marginBottom: '8px' 
          }}>
            <AlertTriangle size={24} color="#A63924" />
            <h3 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: 'var(--primary-brown)', 
              margin: 0,
              fontFamily: 'var(--font-serif)'
            }}>
              Cancelar Reservas
            </h3>
          </div>
          <p style={{ color: 'var(--secondary-brown)', margin: 0 }}>
            {fechaFormateada}
          </p>
        </div>

        {clasesActivas.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: 'var(--secondary-brown)',
            marginBottom: '24px'
          }}>
            <p>No hay reservas activas para cancelar en esta fecha</p>
            <button
              onClick={onClose}
              style={{
                marginTop: '16px',
                padding: '12px 24px',
                backgroundColor: 'var(--primary-brown)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Tipo de cancelación */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '12px', 
                fontWeight: '600',
                color: 'var(--charcoal)'
              }}>
                Tipo de cancelación:
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  cursor: 'pointer',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid',
                  borderColor: tipoCancelacion === 'dia' ? 'var(--primary-brown)' : '#e0e0e0',
                  backgroundColor: tipoCancelacion === 'dia' ? '#f5f1e8' : 'white',
                  transition: 'all 0.2s'
                }}>
                  <input
                    type="radio"
                    name="tipoCancelacion"
                    value="dia"
                    checked={tipoCancelacion === 'dia'}
                    onChange={(e) => setTipoCancelacion(e.target.value)}
                    style={{ cursor: 'pointer' }}
                  />
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--charcoal)' }}>
                      Cancelar todo el día
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--secondary-brown)' }}>
                      Se cancelarán todas las reservas del día ({clasesActivas.length} reserva{clasesActivas.length !== 1 ? 's' : ''})
                    </div>
                  </div>
                </label>

                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  cursor: 'pointer',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid',
                  borderColor: tipoCancelacion === 'desde-hora' ? 'var(--primary-brown)' : '#e0e0e0',
                  backgroundColor: tipoCancelacion === 'desde-hora' ? '#f5f1e8' : 'white',
                  transition: 'all 0.2s'
                }}>
                  <input
                    type="radio"
                    name="tipoCancelacion"
                    value="desde-hora"
                    checked={tipoCancelacion === 'desde-hora'}
                    onChange={(e) => setTipoCancelacion(e.target.value)}
                    style={{ cursor: 'pointer' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: 'var(--charcoal)', marginBottom: '8px' }}>
                      Cancelar desde cierta hora
                    </div>
                    {tipoCancelacion === 'desde-hora' && (
                      <select
                        value={horaInicio}
                        onChange={(e) => setHoraInicio(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          borderRadius: '6px',
                          border: '1px solid #ccc',
                          fontSize: '14px',
                          cursor: 'pointer'
                        }}
                        required={tipoCancelacion === 'desde-hora'}
                      >
                        <option value="">Selecciona una hora</option>
                        {horasUnicas.map(hora => (
                          <option key={hora} value={hora}>
                            {hora} ({clasesActivas.filter(c => c.time >= hora).length} reserva{clasesActivas.filter(c => c.time >= hora).length !== 1 ? 's' : ''})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Motivo */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600',
                color: 'var(--charcoal)'
              }}>
                Motivo (opcional):
              </label>
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Ej: Mal tiempo, condiciones climáticas adversas..."
                style={{
                  width: '100%',
                  minHeight: '80px',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Resumen */}
            {clasesACancelar > 0 && (
              <div style={{
                padding: '16px',
                backgroundColor: '#fff3cd',
                borderRadius: '8px',
                marginBottom: '24px',
                border: '1px solid #ffc107'
              }}>
                <div style={{ fontWeight: '600', color: '#856404', marginBottom: '4px' }}>
                  ⚠️ Advertencia
                </div>
                <div style={{ fontSize: '14px', color: '#856404' }}>
                  Se cancelarán {clasesACancelar} reserva{clasesACancelar !== 1 ? 's' : ''} y se liberarán los caballos asignados.
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{
                padding: '12px',
                backgroundColor: '#f8d7da',
                borderRadius: '8px',
                marginBottom: '24px',
                border: '1px solid #f5c6cb',
                color: '#721c24'
              }}>
                {error}
              </div>
            )}

            {/* Botones */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: 'white',
                  color: 'var(--primary-brown)',
                  border: '2px solid var(--primary-brown)',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                  opacity: loading ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = '#f5f1e8'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = 'white'
                  }
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || clasesACancelar === 0 || (tipoCancelacion === 'desde-hora' && !horaInicio)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: loading || clasesACancelar === 0 ? '#ccc' : '#A63924',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading || clasesACancelar === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!loading && clasesACancelar > 0) {
                    e.currentTarget.style.backgroundColor = '#8b2e1f'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading && clasesACancelar > 0) {
                    e.currentTarget.style.backgroundColor = '#A63924'
                  }
                }}
              >
                {loading ? 'Cancelando...' : 'Confirmar Cancelación'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export { CancelMassModal }

