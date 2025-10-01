// src/components/GestionUsuarios.jsx
import React, { useState, useEffect } from 'react';
import '../CSS/RegistroUsuarios.css';
import { User, UserPlus, AlertCircle, CheckCircle, Loader, Save } from 'lucide-react';
import LogoutButton from './LogoutBoton';
import useUsuarios from '../hooks/useUsuarios';
import useRoleGuard from '../hooks/useRoleGuard';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ============================
// Formulario de registro
// ============================
const FormularioUsuario = ({ onCrearUsuario, loading }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    rol: 'cliente'
  });
  const [errores, setErrores] = useState({});
  const [withoutEmail, setWithoutEmail] = useState(false);
  const [previewCredentials, setPreviewCredentials] = useState({ username: "", password: "" });
  const [copyMessage, setCopyMessage] = useState("");

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

  // Función para generar contraseña segura
  const generateSecurePassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const allChars = uppercase + lowercase + numbers;
    let password = '';
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    for (let i = 0; i < 5; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

  // Función para generar username de vista previa
  const generatePreviewUsername = (nombre, apellido) => {
    if (!nombre || !apellido) return '';
    const cleanNombre = nombre.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(' ')[0];
    const cleanApellido = apellido.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(' ')[0];
    return `${cleanNombre}.${cleanApellido}`.substring(0, 15);
  };

  // Obtener credenciales reales del servidor
  const getRealCredentials = async (nombre, apellido, customPassword = null) => {
    try {
      const response = await fetch("https://country-page.onrender.com/api/users/preview-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, apellido, customPassword })
      });
      if (response.ok) {
        const result = await response.json();
        return result.credentials;
      }
    } catch (error) {
      console.error('Error al obtener credenciales reales:', error);
    }
    return null;
  };

  const validarFormulario = () => {
    const nuevosErrores = {};
    if (!formData.nombre.trim()) nuevosErrores.nombre = 'El nombre es requerido';
    if (!formData.apellido.trim()) nuevosErrores.apellido = 'El apellido es requerido';
    
    // Email solo es requerido si NO se está creando sin email
    if (!withoutEmail) {
      if (!formData.email.trim()) {
        nuevosErrores.email = 'El email es requerido';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        nuevosErrores.email = 'El email no es válido';
      }
    }
    
    // Validar contraseña si hay credenciales preview (sin email o roles internos)
    const isWithoutEmail = formData.rol !== 'cliente' || withoutEmail;
    if (isWithoutEmail && previewCredentials.password && previewCredentials.password.length < 5) {
      nuevosErrores.password = 'La contraseña debe tener al menos 5 caracteres';
      toast.error('❌ La contraseña debe tener al menos 5 caracteres', {
        position: "top-right",
        autoClose: 3000
      });
    }
    
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;
    
    // Para roles que no son cliente, forzar withoutEmail a true
    const isWithoutEmail = formData.rol !== 'cliente' || withoutEmail;
    
    const dataToSend = {
      ...formData,
      withoutEmail: isWithoutEmail,
      // Si hay credenciales preview con contraseña, enviarla como customPassword
      ...(previewCredentials.password && { customPassword: previewCredentials.password })
    };
    
    const resultado = await onCrearUsuario(dataToSend);
    if (resultado.success) {
      // Si es sin email y hay credenciales, mostrarlas
      if (isWithoutEmail && resultado.credentials) {
        setPreviewCredentials(resultado.credentials);
        toast.success(`✅ Usuario creado: ${resultado.credentials.username}. ¡Copia las credenciales!`, {
          position: "top-right",
          autoClose: 4000
        });
      } else {
        toast.success(`✅ Usuario creado exitosamente. Credenciales enviadas por email.`, {
          position: "top-right",
          autoClose: 3000
        });
      }
      
      // Limpiar formulario
      setFormData({ nombre:'', apellido:'', email:'', rol:'cliente' });
      setWithoutEmail(false);
      
      // Si es con email, limpiar credenciales
      if (!isWithoutEmail) {
        setPreviewCredentials({ username: "", password: "" });
      }
    } else {
      // Mostrar error
      toast.error(`❌ ${resultado.message || 'Error al crear usuario'}`, {
        position: "top-right",
        autoClose: 4000
      });
    }
  };

  // Generar credenciales de vista previa cuando cambian nombre/apellido
  useEffect(() => {
    // Para roles que no sean cliente, automáticamente generar credenciales
    const shouldGenerateCredentials = formData.rol !== 'cliente' || withoutEmail;
    
    if (shouldGenerateCredentials && formData.nombre && formData.apellido) {
      const updateRealCredentials = async () => {
        try {
          const password = previewCredentials.password || generateSecurePassword();
          const realCredentials = await getRealCredentials(formData.nombre, formData.apellido, password);
          if (realCredentials) {
            setPreviewCredentials(realCredentials);
          }
        } catch (error) {
          console.error('Error al obtener credenciales reales:', error);
          const username = generatePreviewUsername(formData.nombre, formData.apellido);
          const password = previewCredentials.password || generateSecurePassword();
          setPreviewCredentials({ username, password });
        }
      };
      updateRealCredentials();
    } else if (!shouldGenerateCredentials) {
      setPreviewCredentials({ username: "", password: "" });
    }
  }, [withoutEmail, formData.nombre, formData.apellido, formData.rol]);

  // Cuando cambia el rol, ajustar automáticamente withoutEmail
  useEffect(() => {
    if (formData.rol !== 'cliente') {
      // Para roles que no son cliente, automáticamente sin email
      setWithoutEmail(true);
    } else {
      // Para clientes, dejar que el usuario decida
      setWithoutEmail(false);
      setPreviewCredentials({ username: "", password: "" });
    }
  }, [formData.rol]);

  return (
    <div className="user-form-section">
      <div className="section-header">
        <h3><UserPlus size={24}/> Registrar Nuevo Usuario</h3>
        <p>Complete el formulario para agregar un nuevo usuario al sistema</p>
        <div className="auto-credentials-info">
          <div style={{background: 'rgba(139, 111, 78, 0.1)', border: '1px solid rgba(139, 111, 78, 0.3)', borderRadius: '8px', padding: '12px', margin: '10px 0', fontSize: '14px', color: '#8b6f4e'}}>
            {formData.rol === 'cliente' ? (
              <>🔑 <strong>Clientes:</strong> Las credenciales se generan automáticamente. Puedes elegir enviarlas por email o copiarlas para entregarlas manualmente.</>
            ) : (
              <>🔑 <strong>Personal interno:</strong> Las credenciales se generan automáticamente para que las copies y las entregues. La contraseña es editable antes de crear la cuenta.</>
            )}
          </div>
        </div>
      </div>

      <form className="user-form-container" onSubmit={handleSubmit}>
        {/* PRIMERO: Seleccionar el rol */}
        <div className="form-group">
          <label htmlFor="rol">Tipo de Usuario *</label>
          <select id="rol" name="rol" value={formData.rol} onChange={handleChange} className="form-input" disabled={loading}>
            {roles.map(rol=><option key={rol.value} value={rol.value}>{rol.label}</option>)}
          </select>
          <p style={{ fontSize: '13px', color: '#6c757d', marginTop: '5px' }}>
            {formData.rol === 'cliente' 
              ? '👤 Cliente: Puede tener email para recibir credenciales' 
              : '👔 Personal interno: Credenciales para copiar y entregar'}
          </p>
        </div>

        {/* SEGUNDO: Datos personales */}
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

        {/* Campo de email: solo mostrar si es cliente */}
        {formData.rol === 'cliente' && (
          <>
            <div className="form-group">
              <label htmlFor="email">Email {!withoutEmail && '*'}</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                className={errores.email ? 'form-input error':'form-input'} 
                disabled={loading || withoutEmail} 
                placeholder={withoutEmail ? "No se requiere email" : "correo@ejemplo.com"}
              />
              {errores.email && <span className="error-message">{errores.email}</span>}
            </div>

            {/* Checkbox para crear sin email - solo para clientes */}
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: '500' }}>
                <input
                  type="checkbox"
                  checked={withoutEmail}
                  onChange={(e) => {
                    setWithoutEmail(e.target.checked);
                    if (!e.target.checked) {
                      setPreviewCredentials({ username: "", password: "" });
                    }
                  }}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span>Crear cliente sin correo electrónico</span>
              </label>
              <p style={{ margin: '8px 0 0 28px', fontSize: '13px', color: '#6c757d' }}>
                Las credenciales se mostrarán para copiar y entregar manualmente
              </p>
            </div>
          </>
        )}

        {/* Vista previa de credenciales cuando es sin email o cuando no es cliente */}
        {(withoutEmail || formData.rol !== 'cliente') && previewCredentials.username && (
          <div style={{ 
            marginBottom: '20px', 
            padding: '20px', 
            backgroundColor: '#fff3cd', 
            border: '2px solid #ffc107', 
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(255, 193, 7, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
              <h4 style={{ margin: 0, color: '#856404', fontSize: '16px', fontWeight: '600' }}>
                ⚠️ Credenciales a crear:
              </h4>
              <button
                type="button"
                onClick={async () => {
                  const realCreds = await getRealCredentials(formData.nombre, formData.apellido, previewCredentials.password);
                  const credentialsText = `Username: ${realCreds?.username || previewCredentials.username}\nContraseña: ${realCreds?.password || previewCredentials.password}`;
                  navigator.clipboard.writeText(credentialsText);
                  setCopyMessage("✅ Credenciales copiadas");
                  setTimeout(() => setCopyMessage(""), 2000);
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#ffc107',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  color: '#856404',
                  fontSize: '14px'
                }}
              >
                📋 Copiar todo
              </button>
            </div>
            
            {copyMessage && (
              <div style={{ marginBottom: '10px', color: '#28a745', fontWeight: 'bold', fontSize: '14px' }}>
                {copyMessage}
              </div>
            )}

            <div style={{ 
              backgroundColor: 'white', 
              padding: '12px', 
              borderRadius: '6px', 
              marginBottom: '10px',
              border: '1px solid #ffc107'
            }}>
              <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ color: '#856404' }}>Username:</strong>
                  <span style={{ 
                    fontSize: '10px', 
                    color: '#6c757d', 
                    fontWeight: '500',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    backgroundColor: '#f8f9fa'
                  }}>
                    🔒 automático
                  </span>
                </div>
                <div style={{ 
                  fontFamily: 'monospace', 
                  fontSize: '16px', 
                  padding: '8px', 
                  backgroundColor: '#f8f9fa', 
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  marginTop: '4px',
                  color: '#6c757d',
                  cursor: 'not-allowed'
                }}>
                  {previewCredentials.username}
                </div>
              </div>
              
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ color: '#856404' }}>Contraseña:</strong>
                  <span style={{ 
                    fontSize: '10px', 
                    color: '#6c757d', 
                    fontWeight: '500',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    backgroundColor: '#f8f9fa'
                  }}>
                    ✏️ editable
                  </span>
                </div>
                <input
                  type="text"
                  value={previewCredentials.password}
                  onChange={(e) => {
                    const newPassword = e.target.value;
                    setPreviewCredentials(prev => ({
                      ...prev,
                      password: newPassword
                    }));
                    // Limpiar error si se cumple el mínimo
                    if (errores.password && newPassword.length >= 5) {
                      setErrores(prev => ({ ...prev, password: '' }));
                    }
                  }}
                  style={{ 
                    fontFamily: 'monospace', 
                    fontSize: '16px', 
                    padding: '8px', 
                    backgroundColor: '#fff', 
                    border: `1px solid ${previewCredentials.password.length > 0 && previewCredentials.password.length < 5 ? '#dc3545' : '#ced4da'}`,
                    borderRadius: '4px',
                    marginTop: '4px',
                    width: '100%',
                    boxSizing: 'border-box',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = previewCredentials.password.length > 0 && previewCredentials.password.length < 5 ? '#dc3545' : '#80bdff';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = previewCredentials.password.length > 0 && previewCredentials.password.length < 5 ? '#dc3545' : '#ced4da';
                  }}
                  placeholder="Mínimo 5 caracteres"
                  minLength={5}
                />
                {previewCredentials.password.length > 0 && previewCredentials.password.length < 5 && (
                  <p style={{ fontSize: '11px', color: '#dc3545', marginTop: '4px', marginBottom: 0 }}>
                    ⚠️ Contraseña muy corta ({previewCredentials.password.length}/5 caracteres)
                  </p>
                )}
                {previewCredentials.password.length >= 5 && (
                  <p style={{ fontSize: '11px', color: '#28a745', marginTop: '4px', marginBottom: 0 }}>
                    ✓ Contraseña válida ({previewCredentials.password.length} caracteres)
                  </p>
                )}
              </div>
            </div>

            <p style={{ 
              margin: '12px 0 0 0', 
              fontSize: '13px', 
              color: '#856404',
              fontWeight: '500',
              backgroundColor: '#fff',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #ffc107'
            }}>
              💡 <strong>RECOMENDACIÓN:</strong> Copia estas credenciales ANTES de crear la cuenta. 
              Una vez registrado el usuario, el formulario se limpiará automáticamente.
            </p>
          </div>
        )}

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
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

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
