import React from "react";
import RegistrosTabla from "./RegistrosTabla";

const RegistrosPanel = () => {
  return (
    <div>
      <div className="admin-controls">
        <div className="filter-group">
          <label>Filtrar por estado:</label>
          <select className="filter-select">
            <option>Todos</option>
            <option>Activo</option>
            <option>Inactivo</option>
          </select>
        </div>
        <input
          type="text"
          className="search-input"
          placeholder="Buscar usuario..."
        />
      </div>
      <RegistrosTabla />
    </div>
  );
};

export default RegistrosPanel;
