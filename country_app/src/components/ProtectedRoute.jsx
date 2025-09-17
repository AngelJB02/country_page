import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const user = localStorage.getItem('user');
      console.log('Verificando autenticación:', { user: !!user, path: location.pathname });
      
      if (user) {
        try {
          const parsedUser = JSON.parse(user);
          // Verificar que el usuario tenga los campos necesarios
          if (parsedUser && parsedUser.id && parsedUser.nombre) {
            console.log('Usuario autenticado:', parsedUser.nombre);
            setIsAuthenticated(true);
          } else {
            console.log('Datos de usuario inválidos, limpiando localStorage');
            // Si los datos están corruptos, limpiar localStorage
            localStorage.removeItem('user');
            localStorage.removeItem('authToken');
            localStorage.removeItem('instructorData');
            localStorage.removeItem('userData');
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.log('Error al parsear usuario, limpiando localStorage:', error);
          // Si hay error al parsear, limpiar localStorage
          localStorage.removeItem('user');
          localStorage.removeItem('authToken');
          localStorage.removeItem('instructorData');
          localStorage.removeItem('userData');
          setIsAuthenticated(false);
        }
      } else {
        console.log('No hay usuario en localStorage');
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    // Verificar inmediatamente
    checkAuth();

    // Verificar cada vez que cambia la ruta
    const intervalId = setInterval(checkAuth, 1000); // Verificar cada segundo

    // Escuchar cambios en localStorage (cuando se hace logout desde otra pestaña)
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === null) { // null significa que se limpió todo el localStorage
        console.log('Cambio en localStorage detectado');
        checkAuth();
      }
    };

    // Escuchar cuando la ventana vuelve a tener foco
    const handleFocus = () => {
      console.log('Ventana recuperó el foco, verificando autenticación');
      checkAuth();
    };

    // Escuchar cambios de visibilidad de la página
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Página visible, verificando autenticación');
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div>Verificando sesión...</div>
        <div style={{ fontSize: '0.9rem', color: '#999' }}>
          Ruta: {location.pathname}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('Usuario no autenticado, redirigiendo a login');
    // Forzar limpieza completa antes de redirigir
    localStorage.clear();
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default ProtectedRoute;