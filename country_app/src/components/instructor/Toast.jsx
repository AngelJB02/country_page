import { useEffect } from 'react'
import './Toast.css'

const Toast = ({ message, type = 'warning', onClose, duration = 5000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  return (
    <>
      {/* Overlay semitransparente */}
      <div className="toast-overlay" onClick={onClose} />
      
      {/* Modal centrado */}
      <div className={`toast-modal toast-${type}`}>
        <div className="toast-icon">
          {type === 'warning' && '⚠️'}
          {type === 'error' && '❌'}
          {type === 'success' && '✅'}
        </div>
        <div className="toast-content">
          <span className="toast-message">{message}</span>
          <button className="toast-close" onClick={onClose}>×</button>
        </div>
      </div>
    </>
  )
}

export default Toast

