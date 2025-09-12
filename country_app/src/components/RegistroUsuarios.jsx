import React, { useState, useEffect } from 'react';
import '../CSS/RegistroUsuarios.css';
import { User, UserPlus, Eye, EyeOff, AlertCircle, CheckCircle, XCircle, Loader } from 'lucide-react';
import LogoutButton from './LogoutBoton';

// Hook personalizado para gestión de usuarios
const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Datos simulados para demostración (reemplazar por llamadas reales a la API)
  const mockUsuarios = [
    {
      id: 1,
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan.perez@email.com',
      rol: 'admin',
      estado: 'activo',
      fecha_registro: '2024-01-15 10:30:00'
    },
    {
      id: 2,
      nombre: 'María',
      apellido: 'González',
      email: 'maria.gonzalez@email.com',
      rol: 'cliente',
      estado: 'pendiente',
      fecha_registro: '2024-02-20 14:15:00'
    },
    {
      id: 3,
      nombre: 'Carlos',
      apellido: 'Rodríguez',
      email: 'carlos.rodriguez@email.com',
      rol: 'instructor',
      estado: 'activo',
      fecha_registro: '2024-03-10 09:45:00'
    }
  ];

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  const obtenerUsuarios = async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUsuarios(mockUsuarios);
    } catch (err) {
      setError('Error al obtener usuarios de la base de datos');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const crearUsuario = async (nuevoUsuario) => {
    setLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const usuarioConId = {
        ...nuevoUsuario,
        id: Math.max(...usuarios.map(u => u.id), 0) + 1,
        estado: 'pendiente',
        fecha_registro: new Date().toLocaleString('sv-SE').replace('T', ' ')
      };
      setUsuarios(prev => [...prev, usuarioConId]);
      return { success: true, message: 'Usuario registrado exitosamente' };
    } catch (err) {
      setError('Error al crear usuario en la base de datos');
      console.error('Error:', err);
      return { success: false, message: 'Error al registrar usuario' };
    } finally {
      setLoading(false);
    }
  };

  const darDeBaja = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setUsuarios(prev =>
        prev.map(usuario =>
          usuario.id === id
            ? { ...usuario, estado: 'inactivo' }
            : usuario
        )
      );
      return { success: true, message: 'Usuario dado de baja exitosamente' };
    } catch (err) {
      setError('Error al dar de baja usuario en la base de datos');
      console.error('Error:', err);
      return { success: false, message: 'Error al dar de baja usuario' };
    } finally {
      setLoading(false);
    }
  };

  return { usuarios, loading, error, crearUsuario, darDeBaja };
};

// ============================
// Formulario de registro
// ============================
const FormularioUsuario = ({ onCrearUsuario, loading }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    rol: 'cliente'
  });
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [errores, setErrores] = useState({});

  const roles = [
    { value: 'admin', label: 'Administrador' },
    { value: 'cliente', label: 'Cliente' },
    { value: 'instructor', label: 'Instructor' },
    { value: 'contabilidad', label: 'Contabilidad' },
    { value: 'viewer', label: 'Visualizador' },
    { value: 'creadorcuentas', label: 'Creador de Cuentas' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errores[name]) {
      setErrores(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};
    if (!formData.nombre.trim()) nuevosErrores.nombre = 'El nombre es requerido';
    if (!formData.apellido.trim()) nuevosErrores.apellido = 'El apellido es requerido';
    if (!formData.email.trim()) {
      nuevosErrores.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nuevosErrores.email = 'El email no es válido';
    }
    if (!formData.password.trim()) {
      nuevosErrores.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      nuevosErrores.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;
    const resultado = await onCrearUsuario(formData);
    if (resultado.success) {
      setFormData({ nombre: '', apellido: '', email: '', password: '', rol: 'cliente' });
      setErrores({});
    }
  };

  return (
    <div className="user-form-section">
      <div className="section-header">
        <h3>
          <UserPlus size={24} />
          Registrar Nuevo Usuario
        </h3>
        <p>Complete el formulario para agregar un nuevo usuario al sistema</p>
      </div>

      <form className="user-form-container" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="nombre">Nombre *</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className={errores.nombre ? 'form-input error' : 'form-input'}
              disabled={loading}
              placeholder="Ingrese el nombre"
            />
            {errores.nombre && <span className="error-message">{errores.nombre}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="apellido">Apellido *</label>
            <input
              type="text"
              id="apellido"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              className={errores.apellido ? 'form-input error' : 'form-input'}
              disabled={loading}
              placeholder="Ingrese el apellido"
            />
            {errores.apellido && <span className="error-message">{errores.apellido}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={errores.email ? 'form-input error' : 'form-input'}
            disabled={loading}
            placeholder="correo@ejemplo.com"
          />
          {errores.email && <span className="error-message">{errores.email}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="password">Contraseña *</label>
            <div className="password-input-wrapper">
              <input
                type={mostrarPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errores.password ? 'form-input error' : 'form-input'}
                disabled={loading}
                placeholder="Mínimo 6 caracteres"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                disabled={loading}
              >
                {mostrarPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errores.password && <span className="error-message">{errores.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="rol">Rol del Usuario *</label>
            <select
              id="rol"
              name="rol"
              value={formData.rol}
              onChange={handleChange}
              className="form-input"
              disabled={loading}
            >
              {roles.map(rol => (
                <option key={rol.value} value={rol.value}>
                  {rol.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="rustic-button submit-btn"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader className="loading-spinner" size={18} />
              Registrando...
            </>
          ) : (
            <>
              <UserPlus size={18} />
              Registrar Usuario
            </>
          )}
        </button>
      </form>
    </div>
  );
};

// ============================
// Tabla de usuarios
// ============================
const TablaUsuarios = ({ usuarios, onDarDeBaja, loading }) => {
  const getEstadoBadge = (estado) => {
    const badges = {
      activo: { icon: <CheckCircle size={14} />, className: 'status-badge badge-success', text: 'Activo' },
      inactivo: { icon: <XCircle size={14} />, className: 'status-badge badge-danger', text: 'Inactivo' },
      pendiente: { icon: <AlertCircle size={14} />, className: 'status-badge badge-warning', text: 'Pendiente' },
      bloqueado: { icon: <XCircle size={14} />, className: 'status-badge badge-error', text: 'Bloqueado' }
    };
    const badge = badges[estado] || badges.pendiente;
    return <span className={badge.className}>{badge.icon}{badge.text}</span>;
  };

  const getRolLabel = (rol) => {
    const roles = {
      admin: 'Administrador',
      cliente: 'Cliente',
      instructor: 'Instructor',
      contabilidad: 'Contabilidad',
      viewer: 'Visualizador',
      creadorcuentas: 'Creador de Cuentas'
    };
    return roles[rol] || rol;
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const handleDarDeBaja = async (usuario) => {
    if (window.confirm(`¿Está seguro de dar de baja al usuario ${usuario.nombre} ${usuario.apellido}?`)) {
      await onDarDeBaja(usuario.id);
    }
  };

  return (
    <div className="user-table-section">
      <div className="section-header">
        <h3>
          <User size={24} />
          Usuarios Registrados ({usuarios.length})
        </h3>
        <p>Listado completo de usuarios en el sistema</p>
      </div>

      {usuarios.length === 0 ? (
        <div className="empty-state">
          <User size={48} />
          <p>No hay usuarios registrados en el sistema</p>
          <small>Los nuevos usuarios aparecerán aquí una vez registrados</small>
        </div>
      ) : (
        <div className="table-container">
          <div className="table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre Completo</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Fecha Registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map(usuario => (
                  <tr key={usuario.id}>
                    <td className="user-id">#{usuario.id}</td>
                    <td>
                      <div className="user-info">
                        <strong className="user-name">{usuario.nombre} {usuario.apellido}</strong>
                      </div>
                    </td>
                    <td className="user-email">{usuario.email}</td>
                    <td><span className="rol-badge">{getRolLabel(usuario.rol)}</span></td>
                    <td>{getEstadoBadge(usuario.estado)}</td>
                    <td className="fecha-registro">{formatearFecha(usuario.fecha_registro)}</td>
                    <td>
                      <div className="table-actions">
                        {usuario.estado !== 'inactivo' ? (
                          <button
                            onClick={() => handleDarDeBaja(usuario)}
                            className="action-btn btn-danger"
                            disabled={loading}
                            title="Dar de baja usuario"
                          >
                            <XCircle size={14} />
                            Dar de baja
                          </button>
                        ) : (
                          <span className="inactive-label">Usuario inactivo</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================
// Componente principal
// ============================
const GestionUsuarios = () => {
  const { usuarios, loading, error, crearUsuario, darDeBaja } = useUsuarios();
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 5000);
  };

  const handleCrearUsuario = async (nuevoUsuario) => {
    const resultado = await crearUsuario(nuevoUsuario);
    mostrarMensaje(resultado.message, resultado.success ? 'success' : 'error');
    return resultado;
  };

  const handleDarDeBaja = async (id) => {
    const resultado = await darDeBaja(id);
    mostrarMensaje(resultado.message, resultado.success ? 'success' : 'error');
  };

  const handleLogout = () => {
    console.log('Cerrando sesión...');
    localStorage.removeItem('token');
    sessionStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="user-management-container">

      {/* Botón de logout afuera del header */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <LogoutButton
          userName="Admin"
          onLogout={handleLogout}
          size="normal"
          showUserName={true}
        />
      </div>

      <div className="user-management-header">
        <h2>Gestión de Usuarios</h2>
        <p>Administre las cuentas de usuario de la plataforma Country Refugio</p>
      </div>

      {/* Alertas */}
      {mensaje.texto && (
        <div className={`alert alert-${mensaje.tipo}`}>
          {mensaje.tipo === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{mensaje.texto}</span>
        </div>
      )}
      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Contenido principal */}
      <div className="user-management-content">
        <FormularioUsuario onCrearUsuario={handleCrearUsuario} loading={loading} />
        <TablaUsuarios usuarios={usuarios} onDarDeBaja={handleDarDeBaja} loading={loading} />
      </div>
    </div>
  );
};

export default GestionUsuarios;
