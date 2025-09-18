// src/components/GestionUsuarios.jsx
import React, { useState } from 'react';
import '../CSS/RegistroUsuarios.css';
import { User, UserPlus, Eye, EyeOff, AlertCircle, CheckCircle, Loader, Save } from 'lucide-react';
import LogoutButton from './LogoutBoton';
import useUsuarios from '../hooks/useUsuarios';
import useRoleGuard from '../hooks/useRoleGuard';

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
    { value: 'viewer', label: 'Visualizador' },
    { value: 'creadorcuentas', label: 'Creador de Cuentas' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errores[name]) setErrores(prev => ({ ...prev, [name]: '' }));
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
    if (resultado.success) setFormData({ nombre:'', apellido:'', email:'', password:'', rol:'cliente' });
  };

  return (
    <div className="user-form-section">
      <div className="section-header">
        <h3><UserPlus size={24}/> Registrar Nuevo Usuario</h3>
        <p>Complete el formulario para agregar un nuevo usuario al sistema</p>
      </div>

      <form className="user-form-container" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="nombre">Nombre *</label>
            <input type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} className={errores.nombre ? 'form-input error':'form-input'} disabled={loading} placeholder="Ingrese el nombre"/>
            {errores.nombre && <span className="error-message">{errores.nombre}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="apellido">Apellido *</label>
            <input type="text" id="apellido" name="apellido" value={formData.apellido} onChange={handleChange} className={errores.apellido ? 'form-input error':'form-input'} disabled={loading} placeholder="Ingrese el apellido"/>
            {errores.apellido && <span className="error-message">{errores.apellido}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className={errores.email ? 'form-input error':'form-input'} disabled={loading} placeholder="correo@ejemplo.com"/>
          {errores.email && <span className="error-message">{errores.email}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="password">Contraseña *</label>
            <div className="password-input-wrapper">
              <input type={mostrarPassword ? 'text':'password'} id="password" name="password" value={formData.password} onChange={handleChange} className={errores.password ? 'form-input error':'form-input'} disabled={loading} placeholder="Mínimo 6 caracteres"/>
              <button type="button" className="password-toggle-btn" onClick={()=>setMostrarPassword(!mostrarPassword)} disabled={loading}>
                {mostrarPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
              </button>
            </div>
            {errores.password && <span className="error-message">{errores.password}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="rol">Rol del Usuario *</label>
            <select id="rol" name="rol" value={formData.rol} onChange={handleChange} className="form-input" disabled={loading}>
              {roles.map(rol=><option key={rol.value} value={rol.value}>{rol.label}</option>)}
            </select>
          </div>
        </div>

        <button type="submit" className="rustic-button submit-btn" disabled={loading}>
          {loading ? <><Loader className="loading-spinner" size={18}/> Registrando...</> : <><UserPlus size={18}/> Registrar Usuario</>}
        </button>
      </form>
    </div>
  );
};

// ============================
// Tabla de usuarios con edición de correo
// ============================
const TablaUsuarios = ({ usuarios, onActualizarCorreo, loading }) => {
  const [edits, setEdits] = useState({});

  const handleChange = (id, value) => {
    setEdits(prev => ({ ...prev, [id]: value }));
  };

  const handleGuardar = async (id) => {
    if (!edits[id] || edits[id].trim() === '') {
      alert('El correo no puede estar vacío');
      return;
    }
    await onActualizarCorreo(id, edits[id]);
  };

  return (
    <div className="user-table-section">
      <div className="section-header">
        <h3><User size={24}/> Usuarios Registrados ({usuarios.length})</h3>
        <p>Listado completo de usuarios en el sistema</p>
      </div>

      {usuarios.length===0 ? (
        <div className="empty-state"><User size={48}/><p>No hay usuarios registrados</p></div>
      ) : (
        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre Completo</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Fecha Registro</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(usuario => (
                <tr key={usuario.id}>
                  <td>#{usuario.id}</td>
                  <td>{usuario.nombre} {usuario.apellido}</td>
                  <td>
                    <input
                      type="email"
                      value={edits[usuario.id] ?? usuario.email}
                      onChange={(e) => handleChange(usuario.id, e.target.value)}
                      className="form-input"
                      disabled={loading}
                    />
                  </td>
                  <td>{usuario.rol}</td>
                  <td>{new Date(usuario.fecha_registro).toLocaleDateString('es-ES',{ year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}</td>
                  <td>
                    <button className="action-btn btn-success" onClick={() => handleGuardar(usuario.id)} disabled={loading}>
                      <Save size={16} style={{marginRight:'0.3rem'}}/> Guardar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ============================
// Componente principal
// ============================
const GestionUsuarios = () => {
  const { usuarios, loading, error, crearUsuario, actualizarCorreo } = useUsuarios();
  const [mensaje, setMensaje] = useState({ texto:'', tipo:'' });

  useRoleGuard(['creadorcuentas']);

  const mostrarMensaje = (texto,tipo) => { setMensaje({texto,tipo}); setTimeout(()=>setMensaje({texto:'',tipo:''}),5000); };

  const handleCrearUsuario = async (nuevoUsuario) => {
    const resultado = await crearUsuario(nuevoUsuario);
    mostrarMensaje(resultado.message, resultado.success?'success':'error');
    return resultado;
  };

  const handleActualizarCorreo = async (id, email) => {
    const resultado = await actualizarCorreo(id, email);
    mostrarMensaje(resultado.message, resultado.success?'success':'error');
  };

  const handleLogout = () => { localStorage.removeItem('token'); sessionStorage.clear(); window.location.href='/login'; };

  return (
    <div className="user-management-container">
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:'1rem' }}>
        <LogoutButton userName="Admin" onLogout={handleLogout} size="normal" showUserName={true}/>
      </div>

      <div className="user-management-header">
        <h2>Gestión de Usuarios</h2>
        <p>Administre las cuentas de usuario de la plataforma Country Refugio</p>
      </div>

      {mensaje.texto && <div className={`alert alert-${mensaje.tipo}`}>{mensaje.tipo==='success'?<CheckCircle size={20}/>:<AlertCircle size={20}/>}<span>{mensaje.texto}</span></div>}
      {error && <div className="alert alert-error"><AlertCircle size={20}/><span>{error}</span></div>}

      <div className="user-management-content">
        <FormularioUsuario onCrearUsuario={handleCrearUsuario} loading={loading}/>
        <TablaUsuarios usuarios={usuarios} onActualizarCorreo={handleActualizarCorreo} loading={loading}/>
      </div>
    </div>
  );
};

export default GestionUsuarios;
