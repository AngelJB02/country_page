import { useState } from "react"
import { X as XIcon } from "lucide-react"

function CancelIndividualModal({ reserva, onClose, onCancelSuccess }) {
  const [motivoSeleccionado, setMotivoSeleccionado] = useState('')
  const [motivoPersonalizado, setMotivoPersonalizado] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const motivosPredefinidos = [
    'Condiciones climáticas adversas',
    'Problemas de salud del caballo',
    'Problemas de salud del instructor',
    'Mantenimiento',
    'Otra'
  ]

  const handleCancel = async () => {
    // Validar que se haya seleccionado un motivo
    if (!motivoSeleccionado) {
      setError('Por favor, selecciona un motivo para la cancelación')
      return
    }

    // Si es "Otra", validar que se haya ingresado texto
    if (motivoSeleccionado === 'Otra' && !motivoPersonalizado.trim()) {
      setError('Por favor, ingresa el motivo de cancelación')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { cancelarReservaIndividual } = await import('./instructor-api')
      // Usar el motivo seleccionado o el personalizado si es "Otra"
      const motivoFinal = motivoSeleccionado === 'Otra' ? motivoPersonalizado.trim() : motivoSeleccionado
      await cancelarReservaIndividual(reserva.id, reserva.cliente_id, motivoFinal)
      
      if (onCancelSuccess) {
        onCancelSuccess()
      }
      onClose()
    } catch (err) {
      console.error('Error al cancelar reserva:', err)
      setError(err.message || 'Error al cancelar la reserva')
    } finally {
      setIsLoading(false)
    }
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
      zIndex: 2000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ 
            fontSize: '20px', 
            fontWeight: 'bold', 
            color: 'var(--primary-brown)',
            fontFamily: 'var(--font-serif)'
          }}>
            Cancelar Reserva
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <XIcon size={20} color="var(--charcoal)" />
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <p style={{ color: 'var(--charcoal)', marginBottom: '8px', fontWeight: '600' }}>
            Cliente: {reserva.student}
          </p>
          <p style={{ color: 'var(--secondary-brown)', marginBottom: '8px' }}>
            Fecha: {reserva.date?.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <p style={{ color: 'var(--secondary-brown)', marginBottom: '16px' }}>
            Hora: {reserva.time}
          </p>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            color: 'var(--charcoal)',
            fontWeight: '600'
          }}>
            Motivo de cancelación <span style={{ color: '#A63924' }}>*</span>
          </label>
          <select
            value={motivoSeleccionado}
            onChange={(e) => {
              setMotivoSeleccionado(e.target.value)
              // Limpiar el motivo personalizado si no es "Otra"
              if (e.target.value !== 'Otra') {
                setMotivoPersonalizado('')
              }
              setError(null)
            }}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid var(--stone-gray)',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
              backgroundColor: 'white',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
            disabled={isLoading}
          >
            <option value="">Selecciona un motivo</option>
            {motivosPredefinidos.map((motivo) => (
              <option key={motivo} value={motivo}>
                {motivo}
              </option>
            ))}
          </select>
          
          {motivoSeleccionado === 'Otra' && (
            <textarea
              value={motivoPersonalizado}
              onChange={(e) => {
                setMotivoPersonalizado(e.target.value)
                setError(null)
              }}
              placeholder="Describe el motivo de cancelación..."
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '12px',
                border: '1px solid var(--stone-gray)',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical',
                boxSizing: 'border-box',
                marginTop: '12px'
              }}
              disabled={isLoading}
            />
          )}
        </div>

        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '8px',
            color: '#A63924',
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onClose}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: 'var(--stone-gray)',
              color: 'var(--charcoal)',
              border: 'none',
              borderRadius: '8px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.2s',
              opacity: isLoading ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!isLoading) e.currentTarget.style.backgroundColor = '#d4c4b0'
            }}
            onMouseLeave={(e) => {
              if (!isLoading) e.currentTarget.style.backgroundColor = 'var(--stone-gray)'
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleCancel}
            disabled={isLoading || !motivoSeleccionado || (motivoSeleccionado === 'Otra' && !motivoPersonalizado.trim())}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#A63924',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: (isLoading || !motivoSeleccionado || (motivoSeleccionado === 'Otra' && !motivoPersonalizado.trim())) ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.2s',
              opacity: (isLoading || !motivoSeleccionado || (motivoSeleccionado === 'Otra' && !motivoPersonalizado.trim())) ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              const disabled = isLoading || !motivoSeleccionado || (motivoSeleccionado === 'Otra' && !motivoPersonalizado.trim())
              if (!disabled) e.currentTarget.style.backgroundColor = '#8b2e1f'
            }}
            onMouseLeave={(e) => {
              const disabled = isLoading || !motivoSeleccionado || (motivoSeleccionado === 'Otra' && !motivoPersonalizado.trim())
              if (!disabled) e.currentTarget.style.backgroundColor = '#A63924'
            }}
          >
            {isLoading ? 'Cancelando...' : 'Confirmar Cancelación'}
          </button>
        </div>

        <p style={{
          marginTop: '16px',
          fontSize: '12px',
          color: 'var(--secondary-brown)',
          fontStyle: 'italic'
        }}>
          * El caballo asignado será liberado automáticamente y se enviará un email al cliente.
        </p>
      </div>
    </div>
  )
}

export { CancelIndividualModal }

