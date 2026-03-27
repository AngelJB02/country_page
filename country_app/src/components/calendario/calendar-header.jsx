
// Encabezado sticky que muestra el nombre del cliente y su nivel, más un botón para cerrar sesión.
// Gestiona la acción de logout mediante la prop `onLogout` y aplica estilos desde './css/calendar-header.css'.
import './css/calendar-header.css'

export function CalendarHeader({ clientName, level, onLogout, onChangePassword }) {
  return (
    <header className="ch-header">
      <div className="ch-container">
        <div className="ch-top">
          <div className="ch-info">
            <h1 className="ch-title">{clientName}</h1>
            <span className="ch-subtitle">{level}</span>
          </div>
          <div className="ch-actions">
            {onChangePassword && (
              <button
                onClick={onChangePassword}
                className="ch-change-btn"
                aria-label="Cambiar contraseña"
              >
                Cambiar contraseña
              </button>
            )}
            <button
              onClick={onLogout}
              className="ch-logout-btn"
              aria-label="Cerrar sesión"
            >
              Salir
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
