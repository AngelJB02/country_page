import React, { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, Check, X, AlertCircle, Eye, ArrowLeft, Phone, Calendar, User } from 'lucide-react';

const RegistroUsuarios = () => {
  const [activeTab, setActiveTab] = useState('register');
  const [users, setUsers] = useState([
    {
      id: 1,
      nombre: "Juan",
      apellido: "Pérez",
      email: "juan@ejemplo.com",
      telefono: "+52 999 123 4567",
      rol: "cliente",
      estado: "verified",
      fecha_registro: "2024-01-15"
    },
    {
      id: 2,
      nombre: "María",
      apellido: "García",
      email: "maria@ejemplo.com",
      telefono: "+52 999 234 5678",
      rol: "instructor",
      estado: "pending",
      fecha_registro: "2024-02-01"
    },
    {
      id: 3,
      nombre: "Carlos",
      apellido: "López",
      email: "carlos@ejemplo.com",
      telefono: "+52 999 345 6789",
      rol: "admin",
      estado: "verified",
      fecha_registro: "2024-01-20"
    },
    {
      id: 4,
      nombre: "Ana",
      apellido: "Martínez",
      email: "ana@ejemplo.com",
      telefono: "+52 999 456 7890",
      rol: "cliente",
      estado: "inactive",
      fecha_registro: "2024-01-10"
    }
  ]);

  const [registerForm, setRegisterForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: '',
    rol: '',
    estado: 'pending'
  });

  const [userDetailsModal, setUserDetailsModal] = useState({
    isOpen: false,
    user: null
  });

  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'delete'
  });

  const [alerts, setAlerts] = useState({
    register: null,
    admin: null,
    validation: null
  });

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    role: ''
  });

  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  const [isLoading, setIsLoading] = useState(false);

  const roles = ['cliente', 'instructor', 'admin', 'contabilidad', 'viewer', 'creadorcuentas'];
  const estados = ['verified', 'pending', 'inactive'];

  // Password validation
  const validatePassword = (password) => {
    setPasswordRequirements({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  };

  const showAlert = (type, message, alertType = 'success') => {
    setAlerts(prev => ({ ...prev, [type]: { message, type: alertType, timestamp: Date.now() } }));
    setTimeout(() => {
      setAlerts(prev => ({ ...prev, [type]: null }));
    }, 5000);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (registerForm.password !== registerForm.confirmPassword) {
      showAlert('register', 'Las contraseñas no coinciden', 'error');
      return;
    }

    // Check password requirements
    const allRequirementsMet = Object.values(passwordRequirements).every(req => req);
    if (!allRequirementsMet) {
      showAlert('register', 'La contraseña no cumple con todos los requisitos', 'error');
      return;
    }

    // Check if email already exists
    if (users.find(user => user.email === registerForm.email)) {
      showAlert('register', 'Este email ya está registrado', 'error');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const newUser = {
        id: users.length + 1,
        ...registerForm,
        fecha_registro: new Date().toISOString().split('T')[0]
      };

      setUsers([...users, newUser]);
      showAlert('register', `Usuario ${registerForm.nombre} ${registerForm.apellido} registrado exitosamente. Email de validación enviado a ${registerForm.email}`, 'success');
      
      // Reset form
      setRegisterForm({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        password: '',
        confirmPassword: '',
        rol: '',
        estado: 'pending'
      });
      setPasswordRequirements({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
      });
      setIsLoading(false);
    }, 1500);
  };

  const handleViewUser = (user) => {
    setUserDetailsModal({ isOpen: true, user });
  };

  const handleDeleteUser = (user) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Confirmar Eliminación',
      message: `¿Estás seguro de que deseas eliminar al usuario ${user.nombre} ${user.apellido}? Esta acción no se puede deshacer.`,
      onConfirm: () => {
        setUsers(users.filter(u => u.id !== user.id));
        showAlert('admin', `Usuario ${user.nombre} ${user.apellido} eliminado exitosamente`, 'success');
        setConfirmationModal({ ...confirmationModal, isOpen: false });
      },
      type: 'delete'
    });
  };

  const handleVerifyUser = (user) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Verificar Usuario',
      message: `¿Deseas verificar al usuario ${user.nombre} ${user.apellido}?`,
      onConfirm: () => {
        setUsers(users.map(u => u.id === user.id ? { ...u, estado: 'verified' } : u));
        showAlert('admin', `Usuario ${user.nombre} ${user.apellido} verificado exitosamente`, 'success');
        setConfirmationModal({ ...confirmationModal, isOpen: false });
      },
      type: 'verify'
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.nombre.toLowerCase().includes(filters.search.toLowerCase()) ||
                         user.apellido.toLowerCase().includes(filters.search.toLowerCase()) ||
                         user.email.toLowerCase().includes(filters.search.toLowerCase()) ||
                         user.telefono.includes(filters.search);
    const matchesStatus = !filters.status || user.estado === filters.status;
    const matchesRole = !filters.role || user.rol === filters.role;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'bg-emerald-50 text-emerald-700';
      case 'pending': return 'bg-amber-50 text-amber-700';
      case 'inactive': return 'bg-red-50 text-red-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'verified': return 'Verificado';
      case 'pending': return 'Pendiente';
      case 'inactive': return 'Inactivo';
      default: return status;
    }
  };

  const Alert = ({ alert, onClose }) => {
    if (!alert) return null;
    
    const bgColor = alert.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                   alert.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
                   'bg-amber-50 border-amber-200 text-amber-800';
    
    return (
      <div className={`p-4 border rounded-lg mb-6 ${bgColor} flex items-start justify-between`}>
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <p className="font-medium">{alert.message}</p>
        </div>
        <button 
          onClick={onClose}
          className="text-current opacity-70 hover:opacity-100 ml-4"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen" style={{ 
      background: '#F5E6D3',
      fontFamily: 'Helvetica, sans-serif',
      color: '#3D2914',
      padding: '2rem',
      width: '100%',
      margin: 0,
      boxSizing: 'border-box'
    }}>
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-amber-900/8">
        {/* Header */}
        <div 
          className="p-8 text-white text-center relative"
          style={{ background: 'linear-gradient(135deg, #6B4423 0%, #8B5A2B 100%)' }}
        >
          <button className="absolute left-8 top-1/2 transform -translate-y-1/2 bg-white/15 backdrop-blur-sm border-0 text-white w-11 h-11 rounded-xl cursor-pointer text-lg transition-all duration-200 flex items-center justify-center hover:bg-white/25 hover:scale-105">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-4xl font-bold mb-2 tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
            Sistema de Usuarios
          </h1>
          <p className="opacity-90 text-lg">Registro y administración de cuentas de usuario</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-amber-900/4 border-b border-amber-900/8">
          {[
            { id: 'register', label: 'Registro de Usuario' },
            { id: 'admin', label: 'Lista de Usuarios' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 p-5 border-0 bg-transparent text-base font-medium cursor-pointer transition-all duration-200 relative ${
                activeTab === tab.id
                  ? 'bg-white text-amber-900 font-semibold'
                  : 'text-gray-700 hover:bg-amber-900/6 hover:text-amber-900'
              }`}
              style={{ fontFamily: 'Georgia, serif' }}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-900"></div>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-10">
          {/* Register Tab */}
          {activeTab === 'register' && (
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-semibold text-amber-900 text-center mb-8" style={{ fontFamily: 'Georgia, serif' }}>
                Registro de Nuevo Usuario
              </h2>
              
              <Alert 
                alert={alerts.register} 
                onClose={() => setAlerts(prev => ({ ...prev, register: null }))}
              />
              
              <form onSubmit={handleRegisterSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <label className="text-amber-900 font-medium mb-2 text-sm" style={{ fontFamily: 'Georgia, serif' }}>
                      Nombre *
                    </label>
                    <input
                      type="text"
                      required
                      value={registerForm.nombre}
                      onChange={(e) => setRegisterForm({...registerForm, nombre: e.target.value})}
                      className="border-2 border-amber-900/12 rounded-xl p-4 text-base transition-all duration-200 bg-white focus:outline-none focus:border-amber-900 focus:shadow-lg focus:shadow-amber-900/6"
                      placeholder="Ingresa el nombre"
                    />
                  </div>
                  
                  <div className="flex flex-col">
                    <label className="text-amber-900 font-medium mb-2 text-sm" style={{ fontFamily: 'Georgia, serif' }}>
                      Apellido *
                    </label>
                    <input
                      type="text"
                      required
                      value={registerForm.apellido}
                      onChange={(e) => setRegisterForm({...registerForm, apellido: e.target.value})}
                      className="border-2 border-amber-900/12 rounded-xl p-4 text-base transition-all duration-200 bg-white focus:outline-none focus:border-amber-900 focus:shadow-lg focus:shadow-amber-900/6"
                      placeholder="Ingresa el apellido"
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="text-amber-900 font-medium mb-2 text-sm" style={{ fontFamily: 'Georgia, serif' }}>
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                    className="border-2 border-amber-900/12 rounded-xl p-4 text-base transition-all duration-200 bg-white focus:outline-none focus:border-amber-900 focus:shadow-lg focus:shadow-amber-900/6"
                    placeholder="correo@ejemplo.com"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-amber-900 font-medium mb-2 text-sm" style={{ fontFamily: 'Georgia, serif' }}>
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={registerForm.telefono}
                    onChange={(e) => setRegisterForm({...registerForm, telefono: e.target.value})}
                    className="border-2 border-amber-900/12 rounded-xl p-4 text-base transition-all duration-200 bg-white focus:outline-none focus:border-amber-900 focus:shadow-lg focus:shadow-amber-900/6"
                    placeholder="+52 999 123 4567"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-amber-900 font-medium mb-2 text-sm" style={{ fontFamily: 'Georgia, serif' }}>
                    Contraseña *
                  </label>
                  <input
                    type="password"
                    required
                    value={registerForm.password}
                    onChange={(e) => {
                      setRegisterForm({...registerForm, password: e.target.value});
                      validatePassword(e.target.value);
                    }}
                    className="border-2 border-amber-900/12 rounded-xl p-4 text-base transition-all duration-200 bg-white focus:outline-none focus:border-amber-900 focus:shadow-lg focus:shadow-amber-900/6"
                    placeholder="Contraseña segura"
                  />
                  
                  {registerForm.password && (
                    <div className="mt-3 p-4 bg-amber-50 rounded-xl border-l-4 border-amber-900">
                      <h4 className="text-amber-900 font-semibold mb-3 text-sm">Requisitos de contraseña:</h4>
                      <div className="space-y-2">
                        {[
                          { key: 'length', text: 'Al menos 8 caracteres' },
                          { key: 'uppercase', text: 'Al menos una letra mayúscula' },
                          { key: 'lowercase', text: 'Al menos una letra minúscula' },
                          { key: 'number', text: 'Al menos un número' },
                          { key: 'special', text: 'Al menos un carácter especial (!@#$%^&*)' }
                        ].map(req => (
                          <div key={req.key} className={`flex items-center space-x-2 text-sm ${passwordRequirements[req.key] ? 'text-emerald-700' : 'text-gray-600'}`}>
                            {passwordRequirements[req.key] ? 
                              <Check className="w-4 h-4 text-emerald-600" /> : 
                              <X className="w-4 h-4 text-red-500" />
                            }
                            <span>{req.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col">
                  <label className="text-amber-900 font-medium mb-2 text-sm" style={{ fontFamily: 'Georgia, serif' }}>
                    Confirmar Contraseña *
                  </label>
                  <input
                    type="password"
                    required
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm({...registerForm, confirmPassword: e.target.value})}
                    className="border-2 border-amber-900/12 rounded-xl p-4 text-base transition-all duration-200 bg-white focus:outline-none focus:border-amber-900 focus:shadow-lg focus:shadow-amber-900/6"
                    placeholder="Confirma la contraseña"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-amber-900 font-medium mb-2 text-sm" style={{ fontFamily: 'Georgia, serif' }}>
                    Rol *
                  </label>
                  <select
                    required
                    value={registerForm.rol}
                    onChange={(e) => setRegisterForm({...registerForm, rol: e.target.value})}
                    className="border-2 border-amber-900/12 rounded-xl p-4 text-base transition-all duration-200 bg-white focus:outline-none focus:border-amber-900 focus:shadow-lg focus:shadow-amber-900/6 cursor-pointer"
                  >
                    <option value="">Selecciona un rol</option>
                    {roles.map(rol => (
                      <option key={rol} value={rol}>{rol.charAt(0).toUpperCase() + rol.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full p-4 bg-gradient-to-r from-amber-900 to-amber-800 text-white font-bold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 uppercase tracking-wider disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none text-lg mt-4"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Registrando...</span>
                    </div>
                  ) : (
                    'Registrar Usuario'
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Users List Tab */}
          {activeTab === 'admin' && (
            <div>
              {/* Header */}
              <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                <h2 className="text-3xl font-semibold text-amber-900 m-0" style={{ fontFamily: 'Georgia, serif' }}>
                  Lista de Usuarios
                </h2>
                <div className="bg-amber-900/8 text-amber-900 px-4 py-2 rounded-full text-sm font-semibold">
                  {filteredUsers.length} usuario{filteredUsers.length !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Search and Filters */}
              <div className="flex gap-4 mb-6 flex-wrap">
                <div className="flex-1 min-w-64 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    className="w-full pl-10 border-2 border-amber-900/12 rounded-xl p-3 text-base transition-all duration-200 bg-white focus:outline-none focus:border-amber-900 focus:shadow-lg focus:shadow-amber-900/6"
                    placeholder="Buscar por nombre, email o teléfono..."
                  />
                </div>
                
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="border-2 border-amber-900/12 rounded-xl p-3 text-base bg-white text-gray-700 cursor-pointer min-w-40 focus:outline-none focus:border-amber-900 focus:shadow-lg focus:shadow-amber-900/6"
                >
                  <option value="">Todos los estados</option>
                  <option value="verified">Verificado</option>
                  <option value="pending">Pendiente</option>
                  <option value="inactive">Inactivo</option>
                </select>
                
                <select
                  value={filters.role}
                  onChange={(e) => setFilters({...filters, role: e.target.value})}
                  className="border-2 border-amber-900/12 rounded-xl p-3 text-base bg-white text-gray-700 cursor-pointer min-w-40 focus:outline-none focus:border-amber-900 focus:shadow-lg focus:shadow-amber-900/6"
                >
                  <option value="">Todos los roles</option>
                  {roles.map(rol => (
                    <option key={rol} value={rol}>{rol.charAt(0).toUpperCase() + rol.slice(1)}</option>
                  ))}
                </select>
              </div>

              <Alert 
                alert={alerts.admin} 
                onClose={() => setAlerts(prev => ({ ...prev, admin: null }))}
              />

              {/* Users Table */}
              {filteredUsers.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl mb-3 text-amber-900" style={{ fontFamily: 'Georgia, serif' }}>
                    {filters.search || filters.status || filters.role ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
                  </h3>
                  <p className="text-base">
                    {filters.search || filters.status || filters.role 
                      ? 'Intenta ajustar los filtros de búsqueda' 
                      : 'Comienza registrando el primer usuario del sistema'
                    }
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-amber-900/8">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-amber-900/6">
                          <th className="text-amber-900 p-5 text-left font-semibold text-sm border-b border-amber-900/8" style={{ fontFamily: 'Georgia, serif' }}>
                            Usuario
                          </th>
                          <th className="text-amber-900 p-5 text-left font-semibold text-sm border-b border-amber-900/8" style={{ fontFamily: 'Georgia, serif' }}>
                            Contacto
                          </th>
                          <th className="text-amber-900 p-5 text-left font-semibold text-sm border-b border-amber-900/8" style={{ fontFamily: 'Georgia, serif' }}>
                            Estado
                          </th>
                          <th className="text-amber-900 p-5 text-left font-semibold text-sm border-b border-amber-900/8" style={{ fontFamily: 'Georgia, serif' }}>
                            Registro
                          </th>
                          <th className="text-amber-900 p-5 text-right font-semibold text-sm border-b border-amber-900/8" style={{ fontFamily: 'Georgia, serif' }}>
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user, index) => (
                          <tr key={user.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-amber-50/30'} hover:bg-amber-900/2 transition-colors`}>
                            <td className="p-4 border-b border-amber-900/4 align-middle">
                              <div className="flex flex-col gap-1">
                                <div className="font-semibold text-gray-800 text-base">
                                  {user.nombre} {user.apellido}
                                </div>
                                <div className="text-gray-600 text-sm">
                                  {user.rol.charAt(0).toUpperCase() + user.rol.slice(1)}
                                </div>
                              </div>
                            </td>
                            <td className="p-4 border-b border-amber-900/4 align-middle">
                              <div className="flex flex-col gap-1">
                                <div className="text-gray-600 text-sm">
                                  {user.email}
                                </div>
                                <div className="text-gray-800 text-sm">
                                  {user.telefono}
                                </div>
                              </div>
                            </td>
                            <td className="p-4 border-b border-amber-900/4 align-middle">
                              <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide ${getStatusColor(user.estado)}`}>
                                {getStatusText(user.estado)}
                              </span>
                            </td>
                            <td className="p-4 border-b border-amber-900/4 align-middle text-gray-700">
                              {formatDate(user.fecha_registro)}
                            </td>
                            <td className="p-4 border-b border-amber-900/4 align-middle">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleViewUser(user)}
                                  className="p-2 bg-blue-500/10 text-blue-600 border-0 rounded-lg cursor-pointer text-sm font-medium transition-all duration-200 min-w-20 hover:bg-blue-500/20"
                                  title="Ver detalles"
                                >
                                  <Eye className="w-4 h-4 mx-auto" />
                                </button>
                                {user.estado === 'pending' && (
                                  <button
                                    onClick={() => handleVerifyUser(user)}
                                    className="p-2 bg-emerald-500/10 text-emerald-600 border-0 rounded-lg cursor-pointer text-sm font-medium transition-all duration-200 min-w-20 hover:bg-emerald-500/20"
                                    title="Verificar"
                                  >
                                    <Check className="w-4 h-4 mx-auto" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteUser(user)}
                                  className="p-2 bg-red-500/10 text-red-600 border-0 rounded-lg cursor-pointer text-sm font-medium transition-all duration-200 min-w-20 hover:bg-red-500/20"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-4 h-4 mx-auto" />
                                </button>
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
          )}
        </div>

        {/* User Details Modal */}
        {userDetailsModal.isOpen && userDetailsModal.user && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl max-w-2xl min-w-96 max-h-[80vh] mx-auto shadow-2xl overflow-hidden border border-amber-900/8 animate-[modalSlideIn_0.3s_ease]">
              {/* Modal Header */}
              <div 
                className="text-white p-6 flex justify-between items-center"
                style={{ background: 'linear-gradient(135deg, #6B4423 0%, #8B5A2B 100%)' }}
              >
                <h2 className="text-xl font-semibold m-0" style={{ fontFamily: 'Georgia, serif' }}>
                  Detalles del Usuario
                </h2>
                <button
                  onClick={() => setUserDetailsModal({ isOpen: false, user: null })}
                  className="text-white/90 hover:text-white text-2xl bg-transparent border-0 cursor-pointer w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-all"
                >
                  ×
                </button>
              </div>
              
              {/* Modal Content */}
              <div className="p-8">
                <div className="space-y-6">
                  <div className="flex flex-col gap-2">
                    <div className="text-sm text-amber-900 font-semibold uppercase tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
                      Nombre Completo
                    </div>
                    <div className="text-lg text-gray-800 p-3 bg-amber-900/4 rounded-lg border-l-3 border-l-amber-900">
                      {userDetailsModal.user.nombre} {userDetailsModal.user.apellido}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="text-sm text-amber-900 font-semibold uppercase tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
                      Correo Electrónico
                    </div>
                    <div className="text-lg text-gray-800 p-3 bg-amber-900/4 rounded-lg border-l-3 border-l-amber-900">
                      {userDetailsModal.user.email}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="text-sm text-amber-900 font-semibold uppercase tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
                      Teléfono
                    </div>
                    <div className="text-lg text-gray-800 p-3 bg-amber-900/4 rounded-lg border-l-3 border-l-amber-900">
                      {userDetailsModal.user.telefono || 'No proporcionado'}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="text-sm text-amber-900 font-semibold uppercase tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
                      Rol
                    </div>
                    <div className="text-lg text-gray-800 p-3 bg-amber-900/4 rounded-lg border-l-3 border-l-amber-900">
                      {userDetailsModal.user.rol.charAt(0).toUpperCase() + userDetailsModal.user.rol.slice(1)}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="text-sm text-amber-900 font-semibold uppercase tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
                      Estado
                    </div>
                    <div className="text-lg text-gray-800 p-3 bg-amber-900/4 rounded-lg border-l-3 border-l-amber-900">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold uppercase tracking-wide ${getStatusColor(userDetailsModal.user.estado)}`}>
                        {getStatusText(userDetailsModal.user.estado)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="text-sm text-amber-900 font-semibold uppercase tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
                      Fecha de Registro
                    </div>
                    <div className="text-lg text-gray-800 p-3 bg-amber-900/4 rounded-lg border-l-3 border-l-amber-900 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-amber-900" />
                      {formatDate(userDetailsModal.user.fecha_registro)}
                    </div>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="mt-8 flex gap-4 justify-center flex-wrap">
                  {userDetailsModal.user.estado === 'pending' && (
                    <button
                      onClick={() => {
                        handleVerifyUser(userDetailsModal.user);
                        setUserDetailsModal({ isOpen: false, user: null });
                      }}
                      className="px-6 py-3 bg-emerald-500/10 text-emerald-600 border-0 rounded-lg font-semibold cursor-pointer transition-all duration-200 hover:bg-emerald-500/20 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/20"
                    >
                      <Check className="w-4 h-4 inline mr-2" />
                      Verificar Usuario
                    </button>
                  )}
                  <button
                    onClick={() => {
                      handleDeleteUser(userDetailsModal.user);
                      setUserDetailsModal({ isOpen: false, user: null });
                    }}
                    className="px-6 py-3 bg-red-500/10 text-red-600 border-0 rounded-lg font-semibold cursor-pointer transition-all duration-200 hover:bg-red-500/20 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-500/20"
                  >
                    <Trash2 className="w-4 h-4 inline mr-2" />
                    Eliminar Usuario
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {confirmationModal.isOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl max-w-md mx-auto shadow-2xl overflow-hidden border border-amber-900/8 animate-[modalSlideIn_0.3s_ease]">
              {/* Confirmation Header */}
              <div 
                className={`text-white p-6 text-center ${
                  confirmationModal.type === 'delete' 
                    ? 'bg-gradient-to-r from-red-500 to-red-600' 
                    : 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                }`}
              >
                <h2 className="text-xl font-semibold m-0" style={{ fontFamily: 'Georgia, serif' }}>
                  {confirmationModal.title}
                </h2>
              </div>
              
              {/* Confirmation Content */}
              <div className="p-8 text-center">
                <p className="text-gray-800 text-base leading-relaxed mb-6">
                  {confirmationModal.message}
                </p>
                
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={confirmationModal.onConfirm}
                    className={`px-6 py-3 text-white border-0 rounded-lg font-semibold cursor-pointer transition-all duration-200 hover:-translate-y-0.5 ${
                      confirmationModal.type === 'delete'
                        ? 'bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg hover:shadow-red-500/20'
                        : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:shadow-lg hover:shadow-emerald-500/20'
                    }`}
                  >
                    {confirmationModal.type === 'delete' ? 'Eliminar' : 'Verificar'}
                  </button>
                  <button
                    onClick={() => setConfirmationModal({ ...confirmationModal, isOpen: false })}
                    className="px-6 py-3 bg-amber-900/8 text-amber-900 border-0 rounded-lg font-semibold cursor-pointer transition-all duration-200 hover:bg-amber-900/12"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .border-l-3 {
          border-left-width: 3px;
        }
      `}</style>
    </div>
  );
};

export default RegistroUsuarios;