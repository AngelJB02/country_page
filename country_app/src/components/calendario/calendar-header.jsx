
// Encabezado sticky que muestra el nombre del cliente y su nivel, más un botón para cerrar sesión.
// Gestiona la acción de logout mediante la prop `onLogout` y aplica estilos desde './css/calendar-header.css'.
import './css/calendar-header.css'

export function CalendarHeader({ clientName, level, onLogout }) {
  return (
    <header className="ch-header">
      <div className="ch-container">
        <div className="ch-info">
          {/* Saludo breve antes del nombre */}
          <p className="ch-welcome">Bienvenido/a</p>
          <h1 className="ch-title">{clientName}</h1>
          <p className="ch-subtitle">Nivel: {level}</p>
        </div>
        <button
          onClick={onLogout}
          className="ch-logout-btn"
          aria-label="Cerrar sesión"
        >
          <span className="ch-logout-icon">→</span>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </header>
  );
}
