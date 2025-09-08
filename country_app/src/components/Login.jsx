// components/Login/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import image10 from "../img/image_10.jpg"; // Ajusta la ruta según tu proyecto


const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const navigate = useNavigate();

  // 🚫 Validación de email (aún no implementada, se usará más adelante)
  // const validateEmail = (email) => {
  //   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //   return emailRegex.test(email);
  // };

  // 🚫 Validación de campos individuales (comentamos email)
  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        // return validateEmail(value) ? '' : 'Por favor ingresa un email válido';
        return ''; // 👉 Por ahora no validamos email
      case 'password':
        return value.length >= 4 ? '' : 'La contraseña debe tener al menos 4 caracteres';
      default:
        return '';
    }
  };

  // Manejo de inputs
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);

    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  // Manejo del submit
  const handleSubmit = async () => {
    // 🚫 Comentamos validación de email para que solo se use admin/admin
    // const emailError = validateField('email', formData.email);
    const passwordError = validateField('password', formData.password);

    const newErrors = {
      // email: emailError,
      password: passwordError
    };

    setErrors(newErrors);

    if (!passwordError) {
      setIsLoading(true);

      try {
        // ✅ Solo credenciales generales "admin"
        if (formData.email === "admin" && formData.password === "admin") {
          setShowSuccess(true);
          setTimeout(() => {
            navigate("/MenuCalendario");
          }, 1000);
        } else {
          throw new Error("Usuario o contraseña incorrectos");
        }
      } catch (error) {
        console.error('Login error:', error);
        setErrors({ general: error.message || 'Error al iniciar sesión. Por favor intenta de nuevo.' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // 🚫 Olvidé contraseña (aún no se usa porque depende del email)
  const handleForgotPassword = () => {
    alert("Función en construcción: recuperación de contraseña");
  };

  // Animación de partículas
  useEffect(() => {
    const createParticle = () => {
      const particle = document.createElement('div');
      particle.className = 'particle';
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

      setTimeout(() => {
        if (particle.parentNode) {
          particle.remove();
        }
      }, 20000);
    };

    const interval = setInterval(createParticle, 3000);

    return () => {
      clearInterval(interval);
      const particles = document.querySelectorAll('.particle');
      particles.forEach(p => p.remove());
    };
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div
      className="login-page"
      style={{
        background: `url(${image10}) no-repeat center center`,
        backgroundSize: "cover",
        position: "relative",
        minHeight: "100vh" // Para que ocupe toda la pantalla
      }}
    >

      <div className="login-container">
        <div className="login-header">
          <h1 className="login-title">Bienvenido</h1>
          <p className="login-subtitle">Inicia sesión en tu cuenta</p>
        </div>

        {showSuccess && <div className="success-message">¡Login exitoso!</div>}
        {errors.general && <div className="general-error">{errors.general}</div>}

        <div className="login-form">
          <div className="form-group">
            <label htmlFor="email">Usuario</label>
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
            {errors.email && <div className="error-message">{errors.email}</div>}
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
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>

          <button
            type="button"
            className={`login-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
            onClick={handleSubmit}
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
          
          {/* Botón para regresar a la página principal */}
          <button
            type="button"
            className="login-button-small"
            onClick={() => navigate('/')}
          >
            Volver a la página principal
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
