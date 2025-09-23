// Filters.jsx – versión compacta, accesible y sin estilos inline
import React from "react";
import { FaCalendarDay, FaCalendarWeek, FaSearch, FaListUl, FaFilter } from "react-icons/fa";

/**
 * Props esperadas:
 * viewMode: "day" | "week"
 * setViewMode, selectedDate, setSelectedDate, endDate, setEndDate,
 * searchTerm, setSearchTerm
 */

const Filters = ({
  viewMode,
  setViewMode,
  selectedDate,
  setSelectedDate,
  endDate,
  setEndDate,
  searchTerm,
  setSearchTerm,
}) => {
  const today = new Date().toISOString().split("T")[0];

  const handleViewModeChange = (e) => {
    const mode = e.target.value;
    setViewMode(mode);
    if (mode === "day" || mode === "week") {
      setSelectedDate(today);
      setEndDate("");
    }
  };

  const handleShowAll = () => {
    setSelectedDate("all");
    setEndDate("");
  };

  return (
    <section className="filters">
      {/* Vista: segmented control */}
      <div className="filters__segment">
        <div className="segment" role="tablist" aria-label="Cambiar vista">
          <input
            id="view-day"
            className="segment__input"
            type="radio"
            name="view-mode"
            value="day"
            checked={viewMode === "day"}
            onChange={(e) => handleViewModeChange({ target: { value: e.target.value } })}
          />
          <label className="segment__item" htmlFor="view-day" role="tab" aria-selected={viewMode === "day"}>
            <FaCalendarDay />
            <span>Diaria</span>
          </label>

          <input
            id="view-week"
            className="segment__input"
            type="radio"
            name="view-mode"
            value="week"
            checked={viewMode === "week"}
            onChange={(e) => handleViewModeChange({ target: { value: e.target.value } })}
          />
          <label className="segment__item" htmlFor="view-week" role="tab" aria-selected={viewMode === "week"}>
            <FaCalendarWeek />
            <span>Semanal</span>
          </label>
        </div>
      </div>

      {/* Fecha inicio */}
      {selectedDate !== "all" && (
        <div className="filters__field">
          <label htmlFor="start-date" className="filters__label">
            <FaCalendarDay aria-hidden="true" />
            <span>Inicio</span>
          </label>
          <input
            id="start-date"
            className="input input--date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      )}

      {/* Fecha fin */}
      {viewMode === "week" && selectedDate !== "all" && (
        <div className="filters__field">
          <label htmlFor="end-date" className="filters__label">
            <FaCalendarWeek aria-hidden="true" />
            <span>Fin</span>
          </label>
          <input
            id="end-date"
            className="input input--date"
            type="date"
            value={endDate}
            min={selectedDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      )}

      {/* Búsqueda */}
      <div className="filters__search">
        <FaSearch className="input__icon" aria-hidden="true" />
        <input
          id="search"
          className="input input--search"
          type="text"
          placeholder="Buscar cliente…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => setSearchTerm("")}
            aria-label="Borrar búsqueda"
          >
            ×
          </button>
        )}
      </div>

      {/* Acciones */}
      <div className="filters__actions">
        {selectedDate !== "all" ? (
          <button type="button" className="btn btn--primary" onClick={handleShowAll}>
            <FaListUl />
            <span>Todas</span>
          </button>
        ) : (
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => {
              setSelectedDate(today);
              setEndDate("");
            }}
          >
            <FaFilter />
            <span>Filtros</span>
          </button>
        )}
      </div>
    </section>
  );
};

export default Filters;

