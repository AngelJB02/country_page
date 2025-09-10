import React from "react";

const Tabs = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="nav-tabs">
      <button
        className={`nav-tab ${activeTab === "register" ? "active" : ""}`}
        onClick={() => setActiveTab("register")}
      >
        Registro
      </button>
      <button
        className={`nav-tab ${activeTab === "admin" ? "active" : ""}`}
        onClick={() => setActiveTab("admin")}
      >
        Administración
      </button>
    </nav>
  );
};

export default Tabs;
