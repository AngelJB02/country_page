import React, { useState } from "react";
import ContraseñasRegistros from "./ContraseñasRegistros";

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "usuario",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isFormValid = formData.password.length >= 8;

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Usuario registrado ✅");
  };

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      <div className="form-group">
        <label>Nombre</label>
        <input
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          placeholder="Ingresa tu nombre"
          required
        />
      </div>

      <div className="form-group">
        <label>Correo</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="ejemplo@email.com"
          required
        />
      </div>

      <div className="form-group full-width">
        <label>Contraseña</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          required
        />
        <ContraseñasRegistros password={formData.password} />
      </div>

      <div className="form-group full-width">
        <label>Rol</label>
        <select name="rol" value={formData.rol} onChange={handleChange}>
          <option value="cliente">Cliente</option>
          <option value="creadorcuentas">Registro Usuarios</option>
          <option value="instructor">Instructor</option>
        </select>
      </div>

      <button type="submit" className="submit-btn" disabled={!isFormValid}>
        Registrar
      </button>
    </form>
  );
};

export default RegisterForm;
