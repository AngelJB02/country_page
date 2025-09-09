import React, { useState } from 'react';
import '../CSS/RegistroUsuarios.css'; // Asegúrate de tener un archivo CSS para estilos

const UserRegistration = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  // Phone validation regex (formato internacional)
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;

  const validateForm = () => {
    const newErrors = {};

    // Validación nombre
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'El nombre debe tener al menos 2 caracteres';
    }

    // Validación apellido
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'El apellido debe tener al menos 2 caracteres';
    }

    // Validación email
    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'El formato del correo electrónico no es válido';
    }

    // Validación teléfono
    if (!formData.phone.trim()) {
      newErrors.phone = 'El número de teléfono es requerido';
    } else if (!phoneRegex.test(formData.phone) || formData.phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'El formato del teléfono no es válido (mínimo 10 dígitos)';
    }

    // Validación contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'La contraseña debe contener al menos una mayúscula, una minúscula y un número';
    }

    // Validación confirmar contraseña
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setSuccess(false);

    try {
      // Simulación de API call - Aquí conectarías con tu backend
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Preparar datos para envío
      const userData = {
        fullName: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
        status: 'pending', // pending verification
        createdAt: new Date().toISOString(),
        isVerified: false
      };

      console.log('Datos del usuario a registrar:', userData);
      
      // Aquí harías el POST request a tu API:
      /*
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        throw new Error('Error en el registro');
      }

      const result = await response.json();
      */

      setSuccess(true);
      // Limpiar formulario
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
      });

    } catch (error) {
      console.error('Error al registrar usuario:', error);
      setErrors({ submit: 'Error al registrar el usuario. Por favor, intenta de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    });
    setErrors({});
    setSuccess(false);
  };

  if (success) {
    return (
      <div className="user-register-form">
        <div className="form-title">¡Registro Exitoso!</div>
        
        <div className="success-message" style={{
          background: 'rgba(39, 174, 96, 0.08)',
          border: '2px solid rgba(39, 174, 96, 0.2)',
          borderRadius: '16px',
          padding: '32px',
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
          <h3 style={{ 
            color: '#27ae60', 
            marginBottom: '16px',
            fontFamily: 'var(--font-primary)',
            fontSize: '1.3rem'
          }}>
            Usuario registrado correctamente
          </h3>
          <p style={{ 
            color: 'var(--charcoal)', 
            marginBottom: '16px',
            lineHeight: '1.6'
          }}>
            Se ha enviado un correo de verificación a <strong>{formData.email || 'la dirección proporcionada'}</strong>.
          </p>
          <p style={{ 
            color: 'var(--stone-gray)', 
            fontSize: '0.9rem',
            margin: '0'
          }}>
            Por favor revisa tu bandeja de entrada y haz clic en el enlace de verificación para activar tu cuenta.
          </p>
        </div>

        <button 
          onClick={resetForm}
          className="register-button"
        >
          Registrar otro usuario
        </button>
      </div>
    );
  }

  return (
    <div className="user-register-form">
      <div className="form-title">Registro de Usuario</div>
      
      <form onSubmit={handleSubmit}>
        {errors.submit && (
          <div className="error-message" style={{
            background: 'rgba(231, 76, 60, 0.08)',
            border: '1px solid rgba(231, 76, 60, 0.2)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            {errors.submit}
          </div>
        )}

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="firstName">Nombre *</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="Ingresa tu nombre"
              className={errors.firstName ? 'error' : ''}
              disabled={loading}
            />
            {errors.firstName && <div className="error-message">{errors.firstName}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Apellido *</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Ingresa tu apellido"
              className={errors.lastName ? 'error' : ''}
              disabled={loading}
            />
            {errors.lastName && <div className="error-message">{errors.lastName}</div>}
          </div>

          <div className="form-group form-group-full">
            <label htmlFor="email">Correo Electrónico *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="correo@ejemplo.com"
              className={errors.email ? 'error' : ''}
              disabled={loading}
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>

          <div className="form-group form-group-full">
            <label htmlFor="phone">Número de Teléfono *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+52 999 123 4567"
              className={errors.phone ? 'error' : ''}
              disabled={loading}
            />
            {errors.phone && <div className="error-message">{errors.phone}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Mínimo 6 caracteres"
              className={errors.password ? 'error' : ''}
              disabled={loading}
            />
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Repite tu contraseña"
              className={errors.confirmPassword ? 'error' : ''}
              disabled={loading}
            />
            {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
          </div>
        </div>

        <button 
          type="submit" 
          className="register-button"
          disabled={loading}
        >
          {loading ? 'Registrando...' : 'Registrar Usuario'}
        </button>

        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: 'rgba(107, 68, 35, 0.04)',
          borderRadius: '8px',
          fontSize: '0.85rem',
          color: 'var(--stone-gray)',
          textAlign: 'center',
          lineHeight: '1.5'
        }}>
          <strong style={{ color: 'var(--primary-brown)' }}>Nota:</strong> Se enviará un correo de verificación 
          a la dirección proporcionada. El usuario deberá verificar su cuenta antes de poder acceder al sistema.
        </div>
      </form>
    </div>
  );
};

export default UserRegistration;