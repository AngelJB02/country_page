import React, { useState } from "react";
import RegistrosTitulo from "./RegistrosTitulo";
import Tabs from "./Tabs";
import RegistrosFormularios from "./RegistrosFormularios";
import RegistrosPanel from "./RegistrosPanel";
import "../CSS/RegistroUsuarios.css"; // tu CSS largo

const RegistroUsuarios = () => {
  const [activeTab, setActiveTab] = useState("register");

  return (
    <div className="container">
      <div className="main-content">
        <RegistrosTitulo />
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="tab-content active">
          {activeTab === "register" ? <RegistrosFormularios /> : <RegistrosPanel />}
        </div>
      </div>
    </div>
  );
};

export default RegistroUsuarios;
