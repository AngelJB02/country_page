import React from 'react';
import './css/session-update-modal.css';

export function SessionUpdateModal({ isOpen, type, onClose }) {
  if (!isOpen) return null;

  const messages = {
    levelUpdate: {
      title: 'Nivel actualizado',
      description: 'Tu nivel ha sido modificado por el administrador. La página se recargará para mostrar los horarios correspondientes a tu nuevo nivel.',
      action: 'Recargando'
    },
    sessionExpired: {
      title: 'Sesión desactualizada',
      description: 'Tus datos de usuario han cambiado. Por seguridad, necesitas iniciar sesión nuevamente para actualizar tu información.',
      action: 'Redirigiendo al inicio de sesión'
    },
    sessionError: {
      title: 'Error de sesión',
      description: 'Tu información de usuario está desactualizada. Al iniciar sesión nuevamente, tus datos se actualizarán automáticamente y este mensaje no volverá a aparecer.',
      action: 'Redirigiendo al inicio de sesión'
    }
  };

  const currentMessage = messages[type] || messages.sessionError;

  return (
    <div className="sum-overlay">
      <div className="sum-modal">
        <div className={`sum-icon sum-icon-${type}`}>
          {type === 'levelUpdate' && (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M17 7l-5-5-5 5M7 17l5 5 5-5"/>
            </svg>
          )}
          {(type === 'sessionExpired' || type === 'sessionError') && (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          )}
        </div>

        <h2 className="sum-title">{currentMessage.title}</h2>
        <p className="sum-description">{currentMessage.description}</p>

        <button className="sum-button" onClick={onClose}>
          Entendido
        </button>
      </div>
    </div>
  );
}
