import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import '../CSS/Contabilidad.css';
import { UserPlus, Eye, XCircle, CheckCircle, Loader, Search } from 'lucide-react';

const MembershipAdminDashboard = () => {
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [addClientModalOpen, setAddClientModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [originalMember, setOriginalMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newClient, setNewClient] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    monto: '',
    fecha_pago: '',
    proxima_fecha: ''
  });

  // Refs para controlar foco y autofill
  const searchRef = useRef(null);
  const editFirstInputRef = useRef(null);
  const addFirstInputRef = useRef(null);

  const capitalizeStatus = (status) => {
    if (!status) return 'Activo';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
  };

  useEffect(() => {
    refreshUsersList();
  }, []);

  // Bloquear scroll cuando un modal está abierto
  useEffect(() => {
    const anyModalOpen = modalOpen || addClientModalOpen;
    if (anyModalOpen) document.body.classList.add('no-scroll');
    else document.body.classList.remove('no-scroll');
    return () => document.body.classList.remove('no-scroll');
  }, [modalOpen, addClientModalOpen]);

  // Cerrar con ESC
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (modalOpen) closeModal();
        if (addClientModalOpen) closeAddClientModal();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modalOpen, addClientModalOpen]);

  const normalize = (str) => (str || '').toLowerCase().replace(/\s+/g, '');
  const filteredMembers = members
    .filter(member => member.rol === 'cliente')
    .filter(member =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (statusFilter === '' || normalize(member.status) === normalize(statusFilter))
    );

  const openModal = (member) => {
    setSelectedMember(member);
    setOriginalMember({ ...member });
    // Quitar foco del buscador (evita que el navegador “recuerde” y escriba algo)
    searchRef.current?.blur();
    setModalOpen(true);
    // Enfocar el primer input del modal
    setTimeout(() => editFirstInputRef.current?.focus(), 0);
  };

  const closeModal = () => {
    setSelectedMember(null);
    setOriginalMember(null);
    setModalOpen(false);
  };

  const openAddClientModal = () => {
    setNewClient({
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      monto: '',
      fecha_pago: '',
      proxima_fecha: ''
    });
    searchRef.current?.blur(); // Quitar foco del buscador
    setAddClientModalOpen(true);
    setTimeout(() => addFirstInputRef.current?.focus(), 0);
  };

  const closeAddClientModal = () => {
    setAddClientModalOpen(false);
    setNewClient({
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      monto: '',
      fecha_pago: '',
      proxima_fecha: ''
    });
  };

  const createNewClient = async () => {
    try {
      if (!newClient.nombre || !newClient.apellido || !newClient.email || !newClient.password) {
        alert('Por favor completa todos los datos del cliente');
        return;
      }
      if (!newClient.monto || !newClient.fecha_pago || !newClient.proxima_fecha) {
        alert('Por favor completa toda la información de pagos');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newClient.email)) {
        alert('Por favor ingresa un email válido');
        return;
      }

      const response = await fetch('https://country-page.onrender.com/api/users/register-cliente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient),
      });

      if (response.ok) {
        await response.json();
        refreshUsersList();
        closeAddClientModal();
        alert('Cliente registrado correctamente');
      } else {
        const error = await response.json();
        alert('Error al crear cliente: ' + (error?.error ?? 'Error desconocido'));
      }
    } catch (error) {
      alert('Error de conexión. Inténtalo de nuevo.');
    }
  };

  const refreshUsersList = () => {
    setLoading(true);
    fetch('https://country-page.onrender.com/api/users/with-payments')
      .then(res => res.json())
      .then(data => {
        const mapped = data.map(u => ({
          id: u.id,
          name: u.nombre + (u.apellido ? ' ' + u.apellido : ''),
          email: u.email,
          status: capitalizeStatus(u.estado),
          monthlyFee: u.monto || 0,
          paymentDate: u.proximo_pago || '',
          lastPaymentDate: u.ultimo_pago || '',
          rol: u.rol || '',
        }));
        setMembers(mapped);
        setLoading(false);
      })
      .catch(() => {
        setMembers([]);
        setLoading(false);
      });
  };

  const saveMemberChanges = async () => {
    try {
      const changes = {};
      let hasChanges = false;

      if (selectedMember.monthlyFee !== originalMember.monthlyFee) {
        changes.monto = selectedMember.monthlyFee || 0;
        hasChanges = true;
      }
      if (selectedMember.lastPaymentDate !== originalMember.lastPaymentDate) {
        if (!selectedMember.lastPaymentDate) {
          alert('Por favor completa la fecha de último pago');
          return;
        }
        changes.fecha_pago = selectedMember.lastPaymentDate;
        hasChanges = true;
      }
      if (selectedMember.paymentDate !== originalMember.paymentDate) {
        if (!selectedMember.paymentDate) {
          alert('Por favor completa la fecha de próximo pago');
          return;
        }
        changes.proxima_fecha = selectedMember.paymentDate;
        hasChanges = true;
      }

      if (!hasChanges) {
        closeModal();
        return;
      }

      changes.id_usuario = selectedMember.id;

      const paymentResponse = await fetch('https://country-page.onrender.com/api/users/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      });

      if (paymentResponse.ok) {
        setMembers(prev => prev.map(m => (m.id === selectedMember.id ? selectedMember : m)));
        closeModal();
      } else {
        const error = await paymentResponse.json();
        alert('Error al guardar información de pago: ' + (error?.error ?? 'Error desconocido'));
      }
    } catch {
      alert('Error de conexión. Inténtalo de nuevo.');
    }
  };

  const isPaymentExpired = (paymentDate) => {
    const today = new Date();
    const payment = new Date(paymentDate);
    if (isNaN(payment.getTime())) return false;
    return today > payment;
  };

  const totalUsers = members.length;
  const activeUsers = members.filter(m => m.status === 'Activo' && !isPaymentExpired(m.paymentDate)).length;
  const blockedUsers = members.filter(m => m.status === 'Bloqueado' || (m.status === 'Activo' && isPaymentExpired(m.paymentDate))).length;
  const pendingUsers = members.filter(m => m.status === 'Pendiente').length;

  const renderPortal = (node) => ReactDOM.createPortal(node, document.body);

  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <div className="dashboard-header enhanced-header">
        <div className="header-bg">
          <div className="header-texts">
            <h1 className="header-title">Panel de Administración</h1>
            <p className="header-subtitle">Gestiona usuarios y membresías de tu plataforma</p>
          </div>
        </div>
      </div>

      {/* ESTADÍSTICAS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-topline" style={{ backgroundColor: '#c17b4a' }}></div>
          <div className="stat-title">Usuarios Totales</div>
          <div className="stat-value">{totalUsers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-topline" style={{ backgroundColor: '#6b4423' }}></div>
          <div className="stat-title">Activos</div>
          <div className="stat-value">{activeUsers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-topline" style={{ backgroundColor: '#8b5a2b' }}></div>
          <div className="stat-title">Bloqueados</div>
          <div className="stat-value">{blockedUsers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-topline" style={{ backgroundColor: '#c17b4a' }}></div>
          <div className="stat-title">Pendientes</div>
          <div className="stat-value">{pendingUsers}</div>
        </div>
      </div>

      {/* CONTROLES */}
      <div className="controls-container enhanced-controls">
        <div className="controls-inner">
          <div className="search-filter-group enhanced-search-filter">
            <Search size={18} className="search-icon external-search-icon" />
            <div className="search-box">
              <input
                type="text"
                className="search-input"
                placeholder="Buscar usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                ref={searchRef}
                autoComplete="off"
                name="dashboard-search"
                autoCorrect="off"
                spellCheck={false}
                inputMode="search"
                data-lpignore="true"
                data-form-type="other"
              />
            </div>
            <div className="filter-box">
              <select
                className="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
                <option value="Bloqueado">Bloqueado</option>
                <option value="Pendiente">Pendiente</option>
              </select>
            </div>
          </div>
          <button
            className="btn btn-add enhanced-add-btn"
            onClick={openAddClientModal}
            type="button"
          >
            <UserPlus size={18} /> Agregar Usuario
          </button>
        </div>
      </div>

      {/* TABLA */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <Loader size={32} className="spin" />
          <div>Cargando usuarios...</div>
        </div>
      ) : (
        <table className="members-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Estado</th>
              <th>Mensualidad</th>
              <th>Último Pago</th>
              <th>Próximo Pago</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#c17b4a' }}>
                  No hay usuarios con rol de cliente.
                </td>
              </tr>
            ) : (
              filteredMembers.map(member => {
                const expired = isPaymentExpired(member.paymentDate);
                const displayStatus = expired && member.status === 'Activo' ? 'Bloqueado' : member.status;

                return (
                  <tr key={member.id}>
                    <td>{member.name}</td>
                    <td>{member.email}</td>
                    <td>
                      <select
                        className="status-badge"
                        value={member.status}
                        onChange={async (e) => {
                          const newStatus = e.target.value;
                          try {
                            const response = await fetch(`https://country-page.onrender.com/api/users/update-status/${member.id}`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ estado: newStatus }),
                            });
                            if (response.ok) {
                              setMembers(prev => prev.map(m =>
                                m.id === member.id ? { ...m, status: newStatus } : m
                              ));
                            } else {
                              const error = await response.json();
                              alert('Error al actualizar el estado: ' + (error?.error ?? 'Error desconocido'));
                            }
                          } catch {
                            alert('Error de conexión. Inténtalo de nuevo.');
                          }
                        }}
                        style={{
                          borderColor:
                            displayStatus === 'Activo' ? '#9caf88' :
                            displayStatus === 'Inactivo' ? '#c17b4a' :
                            '#8b5a2b',
                          color:
                            displayStatus === 'Activo' ? '#9caf88' :
                            displayStatus === 'Inactivo' ? '#c17b4a' :
                            '#8b5a2b',
                          fontWeight: 600,
                          fontSize: '0.95rem',
                          padding: '6px 12px',
                          borderRadius: '6px',
                        }}
                      >
                        <option value="Activo">Activo</option>
                        <option value="Inactivo">Inactivo</option>
                        <option value="Bloqueado">Bloqueado</option>
                        <option value="Pendiente">Pendiente</option>
                      </select>
                    </td>
                    <td>${member.monthlyFee}</td>
                    <td>{formatDate(member.lastPaymentDate)}</td>
                    <td>{formatDate(member.paymentDate)}</td>
                    <td>
                      <button className="btn" onClick={() => openModal(member)} type="button">
                        <Eye size={16} /> Editar
                      </button>
                      <button className="btn" style={{ color: 'red' }} type="button">
                        <XCircle size={16} /> Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      )}

      {/* MODAL EDITAR (Portal) */}
      {modalOpen && selectedMember && renderPortal(
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedMember.name}</h2>
            <div className="modal-field">
              <label>Monto Mensualidad:</label>
              <input
                type="number"
                value={selectedMember.monthlyFee}
                onChange={(e) => setSelectedMember({ ...selectedMember, monthlyFee: parseFloat(e.target.value || 0) })}
                ref={editFirstInputRef}
                autoComplete="off"
                inputMode="decimal"
                data-lpignore="true"
                data-form-type="other"
              />
            </div>
            <div className="modal-field">
              <label>Último Pago:</label>
              <input
                type="date"
                value={formatDate(selectedMember.lastPaymentDate)}
                onChange={(e) => setSelectedMember({ ...selectedMember, lastPaymentDate: e.target.value })}
                autoComplete="off"
                data-lpignore="true"
                data-form-type="other"
              />
            </div>
            <div className="modal-field">
              <label>Próximo Pago:</label>
              <input
                type="date"
                value={formatDate(selectedMember.paymentDate)}
                onChange={(e) => setSelectedMember({ ...selectedMember, paymentDate: e.target.value })}
                autoComplete="off"
                data-lpignore="true"
                data-form-type="other"
              />
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={saveMemberChanges} type="button">
                <CheckCircle size={16} /> Guardar
              </button>
              <button className="btn" onClick={closeModal} type="button">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AGREGAR CLIENTE (Portal) */}
      {addClientModalOpen && renderPortal(
        <div className="modal-overlay" onClick={closeAddClientModal}>
          <div className="modal-content add-client-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Agregar Nuevo Cliente</h2>

            <div className="modal-section">
              <h3>Información Personal</h3>
              <div className="modal-field">
                <label>Nombre *:</label>
                <input
                  type="text"
                  value={newClient.nombre}
                  onChange={(e) => setNewClient({ ...newClient, nombre: e.target.value })}
                  placeholder="Ingresa el nombre"
                  ref={addFirstInputRef}
                  autoComplete="off"
                  name="newclient-name"
                  autoCorrect="off"
                  spellCheck={false}
                  data-lpignore="true"
                  data-form-type="other"
                />
              </div>
              <div className="modal-field">
                <label>Apellido *:</label>
                <input
                  type="text"
                  value={newClient.apellido}
                  onChange={(e) => setNewClient({ ...newClient, apellido: e.target.value })}
                  placeholder="Ingresa el apellido"
                  autoComplete="off"
                  name="newclient-lastname"
                  autoCorrect="off"
                  spellCheck={false}
                  data-lpignore="true"
                  data-form-type="other"
                />
              </div>
              <div className="modal-field">
                <label>Email *:</label>
                <input
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  placeholder="ejemplo@email.com"
                  autoComplete="off"
                  name="newclient-email"
                  inputMode="email"
                  data-lpignore="true"
                  data-form-type="other"
                />
              </div>
              <div className="modal-field">
                <label>Contraseña *:</label>
                <input
                  type="password"
                  value={newClient.password}
                  onChange={(e) => setNewClient({ ...newClient, password: e.target.value })}
                  placeholder="Contraseña segura"
                  autoComplete="new-password"
                  name="newclient-password"
                  data-lpignore="true"
                  data-form-type="other"
                />
              </div>
            </div>

            <div className="modal-section">
              <h3>Información de Pagos</h3>
              <div className="modal-field">
                <label>Monto Mensualidad *:</label>
                <input
                  type="number"
                  value={newClient.monto}
                  onChange={(e) => setNewClient({ ...newClient, monto: parseFloat(e.target.value || 0) })}
                  placeholder="150.00"
                  step="0.01"
                  min="0"
                  autoComplete="off"
                  inputMode="decimal"
                  data-lpignore="true"
                  data-form-type="other"
                />
              </div>
              <div className="modal-field">
                <label>Fecha Último Pago *:</label>
                <input
                  type="date"
                  value={newClient.fecha_pago}
                  onChange={(e) => setNewClient({ ...newClient, fecha_pago: e.target.value })}
                  autoComplete="off"
                  data-lpignore="true"
                  data-form-type="other"
                />
              </div>
              <div className="modal-field">
                <label>Fecha Próximo Pago *:</label>
                <input
                  type="date"
                  value={newClient.proxima_fecha}
                  onChange={(e) => setNewClient({ ...newClient, proxima_fecha: e.target.value })}
                  autoComplete="off"
                  data-lpignore="true"
                  data-form-type="other"
                />
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn-primary" onClick={createNewClient} type="button">
                <UserPlus size={16} /> Crear Cliente
              </button>
              <button className="btn btn-secondary" onClick={closeAddClientModal} type="button">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembershipAdminDashboard;