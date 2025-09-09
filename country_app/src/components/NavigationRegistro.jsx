import React, { useState } from 'react';
import './RegistroUsuarios.css'; // Asegúrate de tener un archivo CSS para estilos
import RegistroUsuarios from './RegistroUsuarios'; // Importa el componente de registro
import VisualizacionUsuarios from './VisualizacionUsuarios'; // Importa el componente de gestión
import Navigation from './NavigationClases';

const UserSystemMain = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('register');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="user-management-container">
      <div className="user-management-content">
        {/* Header */}
        <div className="user-management-header">
          <button className="back-button" onClick={onBack} title="Volver">
            ←
          </button>
          <h1>Sistema de Usuarios</h1>
          <p>Gestión completa de cuentas de usuario</p>
        </div>

        {/* Navegación de pestañas */}
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => handleTabChange('register')}
          >
            Registrar Usuario
          </button>
          <button
            className={`tab-button ${activeTab === 'manage' ? 'active' : ''}`}
            onClick={() => handleTabChange('manage')}
          >
            Administrar Usuarios
          </button>
        </div>

        {/* Contenido de las pestañas */}
        <div className="tab-content">
          {activeTab === 'register' && <RegistroUsuarios />}
          {activeTab === 'manage' && <VisualizacionUsuarios />}
        </div>
      </div>
    </div>
  );
};

export default Navigation;