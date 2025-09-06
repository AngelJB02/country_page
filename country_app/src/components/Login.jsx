// components/Login/Login.jsx
import React, { useState, useEffect } from 'react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Validación de email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validación de campo individual
  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        return validateEmail(value) ? '' : 'Por favor ingresa un email válido';
      case 'password':
        return value.length >= 6 ? '' : 'La contraseña debe tener al menos 6 caracteres';
      default:
        return '';
    }
  };

  // Manejar cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Limpiar errores mientras el usuario escribe
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validar campo al perder foco
  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  // Manejar envío del formulario
  const handleSubmit = async () => {
    // Validar todos los campos
    const emailError = validateField('email', formData.email);
    const passwordError = validateField('password', formData.password);
    
    const newErrors = {
      email: emailError,
      password: passwordError
    };
    
    setErrors(newErrors);
    
    // Si no hay errores, proceder con el login
    if (!emailError && !passwordError) {
      setIsLoading(true);
      
      try {
        // AQUÍ CONECTAS CON TU API
        // const response = await fetch('/api/login', {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify({
        //     email: formData.email,
        //     password: formData.password,
        //     remember: formData.remember
        //   })
        // });
        
        // const data = await response.json();
        
        // if (response.ok) {
        //   // Login exitoso
        //   localStorage.setItem('token', data.token);
        //   localStorage.setItem('user', JSON.stringify(data.user));
        //   setShowSuccess(true);
        //   // Redirigir al dashboard
        //   setTimeout(() => {
        //     window.location.href = '/dashboard';
        //   }, 1500);
        // } else {
        //   throw new Error(data.message || 'Error al iniciar sesión');
        // }

        // Por ahora simulamos el login
        await new Promise(resolve => setTimeout(resolve, 2000));
        setShowSuccess(true);
        console.log('Login data:', formData);
        
      } catch (error) {
        console.error('Login error:', error);
        setErrors({ general: error.message || 'Error al iniciar sesión. Por favor intenta de nuevo.' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Manejar login con Google
  const handleGoogleLogin = () => {
    // AQUÍ IMPLEMENTAS EL LOGIN CON GOOGLE
    console.log('Login con Google');
    // Ejemplo con Google OAuth:
    // window.location.href = '/auth/google';
  };

  // Manejar login con Facebook
  const handleFacebookLogin = () => {
    // AQUÍ IMPLEMENTAS EL LOGIN CON FACEBOOK
    console.log('Login con Facebook');
    // Ejemplo con Facebook SDK:
    // FB.login(function(response) { ... });
  };

  // Manejar "Olvidé mi contraseña"
  const handleForgotPassword = () => {
    // AQUÍ IMPLEMENTAS LA RECUPERACIÓN DE CONTRASEÑA
    const email = prompt('Ingresa tu email para recuperar la contraseña:');
    if (email && validateEmail(email)) {
      console.log('Enviando email de recuperación a:', email);
      alert('Se ha enviado un enlace de recuperación a tu email');
      // fetch('/api/forgot-password', { method: 'POST', body: JSON.stringify({ email }) })
    }
  };

  // Crear partículas animadas
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
      particles.forEach(particle => particle.remove());
    };
  }, []);

  // Manejar Enter para submit
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1 className="login-title">Bienvenido</h1>
          <p className="login-subtitle">Inicia sesión en tu cuenta</p>
        </div>

        {showSuccess && (
          <div className="success-message">
            ¡Login exitoso! Bienvenido de vuelta.
          </div>
        )}

        {errors.general && (
          <div className="general-error">
            {errors.general}
          </div>
        )}

        <div className="login-form">
          <div className={`form-group ${errors.email ? 'error' : formData.email && !errors.email ? 'success' : ''}`}>
            <label htmlFor="email">Correo Electrónico</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              placeholder="tu@email.com"
              value={formData.email}
              onChange={handleInputChange}
              onBlur={handleBlur}
              onKeyPress={handleKeyPress}
              required
            />
            <span className="input-icon">📧</span>
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>

          <div className={`form-group ${errors.password ? 'error' : formData.password && !errors.password ? 'success' : ''}`}>
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
            <span className="input-icon">🔒</span>
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>

          <div className="form-options">
            <div className="remember-me">
              <input 
                type="checkbox" 
                id="remember" 
                name="remember"
                checked={formData.remember}
                onChange={handleInputChange}
              />
              <label htmlFor="remember">Recordarme</label>
            </div>
            <button 
              type="button" 
              className="forgot-password"
              onClick={handleForgotPassword}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <button 
            type="button" 
            className={`login-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
            onClick={handleSubmit}
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </div>

        <div className="divider">
          <span>O continúa con</span>
        </div>

        <div className="social-login">
          <button 
            type="button"
            className="social-button google-btn"
            onClick={handleGoogleLogin}
          >
            <span>🔍</span>
            Google
          </button>
          <button 
            type="button"
            className="social-button facebook-btn"
            onClick={handleFacebookLogin}
          >
            <span>📘</span>
            Facebook
          </button>
        </div>

        <div className="login-footer">
          <p className="signup-link">
            ¿No tienes una cuenta? 
            <button 
              type="button" 
              className="signup-button"
              onClick={() => {
                // AQUÍ NAVEGAS A LA PÁGINA DE REGISTRO
                console.log('Navegar a registro');
                // history.push('/register') o navigate('/register')
              }}
            >
              Regístrate aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;