import React, { useState, useEffect } from 'react';
import '../CSS/Contabilidad.css';
import { UserPlus, Eye, XCircle, CheckCircle, Loader } from 'lucide-react';

// Datos simulados
const sampleMembers = [
  { id: 1, name: 'Juan Pérez', email: 'juan@gmail.com', status: 'Activo', monthlyFee: 500, paymentDate: '2025-09-01' },
  { id: 2, name: 'María López', email: 'maria@gmail.com', status: 'Inactivo', monthlyFee: 500, paymentDate: '2025-08-10' },
  { id: 3, name: 'Carlos Sánchez', email: 'carlos@gmail.com', status: 'Pendiente', monthlyFee: 500, paymentDate: '2025-09-05' },
];

const MembershipAdminDashboard = () => {
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    setMembers(sampleMembers);
  }, []);

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (statusFilter === '' || member.status === statusFilter)
  );

  const openModal = (member) => {
    setSelectedMember(member);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedMember(null);
    setModalOpen(false);
  };

  const saveMemberChanges = () => {
    setMembers(prev =>
      prev.map(m => (m.id === selectedMember.id ? selectedMember : m))
    );
    closeModal();
  };

  const isPaymentExpired = (paymentDate) => {
    const today = new Date();
    const payment = new Date(paymentDate);
    return today > payment;
  };

  // Contadores para tarjetas
  const totalUsers = members.length;
  const activeUsers = members.filter(m => m.status === 'Activo' && !isPaymentExpired(m.paymentDate)).length;
  const blockedUsers = members.filter(m => m.status === 'Bloqueado' || (m.status === 'Activo' && isPaymentExpired(m.paymentDate))).length;
  const pendingUsers = members.filter(m => m.status === 'Pendiente').length;

  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <div className="dashboard-header">
        <h1>Panel de Administración</h1>
        <p>Gestiona usuarios y membresías de tu plataforma</p>
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
      <div className="controls-container">
        <div className="controls-inner">
          <div className="search-filter-group">
            <input
              type="text"
              className="search-input"
              placeholder="Buscar usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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
          <button className="btn btn-add">
            <UserPlus size={18} /> Agregar Usuario
          </button>
        </div>
      </div>

      {/* TABLA */}
      <table className="members-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Estado</th>
            <th>Mensualidad</th>
            <th>Fecha de Pago</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredMembers.map(member => {
            const expired = isPaymentExpired(member.paymentDate);
            const displayStatus = expired && member.status === 'Activo' ? 'Bloqueado' : member.status;

            return (
              <tr key={member.id}>
                <td>{member.name}</td>
                <td>{member.email}</td>
                <td>
                  <span
                    className="status-badge"
                    style={{
                      borderColor:
                        displayStatus === 'Activo' ? '#9caf88' :
                        displayStatus === 'Inactivo' ? '#c17b4a' :
                        '#8b5a2b',
                      color:
                        displayStatus === 'Activo' ? '#9caf88' :
                        displayStatus === 'Inactivo' ? '#c17b4a' :
                        '#8b5a2b'
                    }}
                  >
                    {displayStatus}
                  </span>
                </td>
                <td>${member.monthlyFee}</td>
                <td>{member.paymentDate}</td>
                <td>
                  <button className="btn" onClick={() => openModal(member)}>
                    <Eye size={16} /> Editar
                  </button>
                  <button className="btn" style={{ color: 'red' }}>
                    <XCircle size={16} /> Eliminar
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* MODAL */}
      {modalOpen && selectedMember && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedMember.name}</h2>
            <div className="modal-field">
              <label>Estado:</label>
              <select
                value={selectedMember.status}
                onChange={(e) => setSelectedMember({ ...selectedMember, status: e.target.value })}
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
                <option value="Bloqueado">Bloqueado</option>
                <option value="Pendiente">Pendiente</option>
              </select>
            </div>
            <div className="modal-field">
              <label>Monto Mensualidad:</label>
              <input
                type="number"
                value={selectedMember.monthlyFee}
                onChange={(e) => setSelectedMember({ ...selectedMember, monthlyFee: parseFloat(e.target.value) })}
              />
            </div>
            <div className="modal-field">
              <label>Fecha de Pago:</label>
              <input
                type="date"
                value={selectedMember.paymentDate}
                onChange={(e) => setSelectedMember({ ...selectedMember, paymentDate: e.target.value })}
              />
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={saveMemberChanges}>
                <CheckCircle size={16} /> Guardar
              </button>
              <button className="btn" onClick={closeModal}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembershipAdminDashboard;
