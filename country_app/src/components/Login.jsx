import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import image10 from "../img/image_10.jpg"; // Ajusta la ruta según tu proyecto
import { getRedirectRoute } from "../utils/roleRedirect"; // importa tu helper


const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    remember: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [estadoMsg, setEstadoMsg] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  // Verificar si ya hay una sesión activa
  useEffect(() => {
    console.log('Login: Verificando sesión existente');
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        if (parsedUser && parsedUser.id && parsedUser.nombre) {
          console.log('Login: Sesión activa encontrada, redirigiendo:', parsedUser.nombre);
          // Si ya hay sesión activa, redirigir según el rol o a donde venía
          const redirectPath = location.state?.from || getRedirectRoute(parsedUser.rol);
          navigate(redirectPath, { replace: true });
        }
      } catch (error) {
        console.log('Login: Error al parsear usuario, limpiando localStorage:', error);
        // Si hay error al parsear, limpiar localStorage completamente
        localStorage.clear();
      }
    }
  }, [navigate, location]);

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
      const response = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          contrasena: formData.password,
        }),
      });

      let data = {};
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        throw new Error("Servidor no respondió correctamente (no JSON)");
      }

      // Manejo de estados
      if (response.ok && data.user) {
        const estado = (data.user.estatus || "").toLowerCase();
        if (estado === "activo") {
          setShowSuccess(true);
          localStorage.setItem("user", JSON.stringify(data.user));
          setEstadoMsg("");
          setTimeout(() => {
            const redirectPath = getRedirectRoute(data.user.rol);
            navigate(redirectPath);
          }, 1000);
        } else if (estado === "inactivo") {
          setShowSuccess(true);
          setEstadoMsg("⚠️ Tu cuenta está inactiva. Comunícate con el administrador.");
          localStorage.setItem("user", JSON.stringify(data.user));
          setTimeout(() => {
            const redirectPath = getRedirectRoute(data.user.rol);
            navigate(redirectPath);
          }, 2000);
        } else if (estado === "pendiente") {
          setShowSuccess(false);
          setEstadoMsg("⏳ Tienes pagos pendientes y no puedes iniciar sesión.");
        } else if (estado === "bloqueado") {
          setShowSuccess(false);
          setEstadoMsg("🚫 Tu cuenta está bloqueada y no puedes iniciar sesión.");
        } else {
          setShowSuccess(false);
          setEstadoMsg("❌ Estado de usuario no permitido.");
        }
      } else {
        throw new Error(data.mensaje || data.message || "Usuario o contraseña incorrectos");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors({
        general:
          error.message.includes("Failed to fetch")
            ? "No se pudo conectar al servidor. Verifica que esté corriendo."
            : error.message,
      });
      setEstadoMsg("");
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
        {estadoMsg && <div className="estado-message">{estadoMsg}</div>}
        {errors.general && (
          <div className="general-error">{errors.general}</div>
        )}

        <div className="login-form">
          <div className="form-group">
            <label htmlFor="username">Nombre de usuario</label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Usuario"
              value={formData.username}
              onChange={handleInputChange}
              onBlur={handleBlur}
              onKeyPress={handleKeyPress}
              required
            />
            {errors.username && (
              <div className="error-message">{errors.username}</div>
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
