import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import image10 from "../img/image_10.jpg"; // Ajusta la ruta según tu proyecto

const Login = ({ onLoginSuccess }) => { // Agregar prop para callback
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const navigate = useNavigate();

  const validateField = (name, value) => {
    if (name === "password") {
      return value.length >= 4
        ? ""
        : "La contraseña debe tener al menos 4 caracteres";
    }
    return "";
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async () => {
    const passwordError = validateField("password", formData.password);
    setErrors({ password: passwordError });
    if (passwordError) return;

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      let data = {};
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        throw new Error("Servidor no respondió correctamente (no JSON)");
      }

      if (response.ok) {
  setShowSuccess(true);

  // Guardar usuario en localStorage
  const usuario = {
    id: data.user.id,
    nombre: data.user.nombre,
    rol: data.user.rol
  };

  // Validar rol permitido
  if (!['admin','cliente'].includes(usuario.rol)) {
    setErrors({ general: "Acceso restringido para tu rol" });
    setIsLoading(false);
    return;
  }

  localStorage.setItem("usuario", JSON.stringify(usuario));

  // Pasar la información del usuario al componente padre
  if (onLoginSuccess) {
    onLoginSuccess(usuario);
  }

  setTimeout(() => navigate("/MenuCalendario"), 1000);
} else {
  throw new Error(data.message || "Usuario o contraseña incorrectos");
}

    } catch (error) {
      console.error("Login error:", error);
      setErrors({
        general:
          error.message.includes("Failed to fetch")
            ? "No se pudo conectar al servidor. Verifica que esté corriendo."
            : error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  // Animación de partículas
  useEffect(() => {
    const createParticle = () => {
      const particle = document.createElement("div");
      particle.className = "particle";
      particle.style.cssText = `
        position: absolute;
        width: ${Math.random() * 4 + 2}px;
        height: ${Math.random() * 4 + 2}px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: 100%;
        pointer-events: none;
        animation: particleFloat ${Math.random() * 10 + 10}s linear infinite;
        z-index: 0;
      `;
      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 20000);
    };

    const interval = setInterval(createParticle, 3000);
    return () => {
      clearInterval(interval);
      document.querySelectorAll(".particle").forEach((p) => p.remove());
    };
  }, []);

  return (
    <div
      className="login-page"
      style={{
        background: `url(${image10}) no-repeat center center`,
        backgroundSize: "cover",
        position: "relative",
        minHeight: "100vh",
      }}
    >
      <div className="login-container">
        <div className="login-header">
          <h1 className="login-title">Bienvenido</h1>
          <p className="login-subtitle">Inicia sesión en tu cuenta</p>
        </div>

        {showSuccess && <div className="success-message">¡Login exitoso!</div>}
        {errors.general && (
          <div className="general-error">{errors.general}</div>
        )}

        <div className="login-form">
          <div className="form-group">
            <label htmlFor="email">Correo</label>
            <input
              type="text"
              id="email"
              name="email"
              placeholder="Usuario"
              value={formData.email}
              onChange={handleInputChange}
              onBlur={handleBlur}
              onKeyPress={handleKeyPress}
              required
            />
            {errors.email && (
              <div className="error-message">{errors.email}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleInputChange}
              onBlur={handleBlur}
              onKeyPress={handleKeyPress}
              required
            />
            {errors.password && (
              <div className="error-message">{errors.password}</div>
            )}
          </div>

          <button
            type="button"
            className={`login-button ${isLoading ? "loading" : ""}`}
            disabled={isLoading}
            onClick={handleSubmit}
          >
            {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>

          <button
            type="button"
            className="login-button-small"
            onClick={() => navigate("/")}
          >
            Volver a la página principal
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;