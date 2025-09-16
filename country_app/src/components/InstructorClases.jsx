import React, { useState } from 'react';
import Header from './instructor/Header';
import Filters from './instructor/Filters';
import Loading from './instructor/Loading';
import ErrorMessage from './instructor/ErrorMessage';
import NoReservations from './instructor/NoReservations';
import ReservaList from './instructor/ReservaList';
import LogoutButton from './LogoutBoton';
import useInstructor from '../hooks/useInstructor';

const InstructorReservas = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('day');

  const { reservas, loading, error, updateAsistencia } = useInstructor(selectedDate, endDate);
  
  const API_URL = 'https://country-page.onrender.com/api/instructor'; 

  // Filtrar por búsqueda
  const filteredReservas = reservas.filter(r =>
    r.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    console.log('Cerrando sesión...');
    window.location.href = '/login';
    window.location.reload();
  };

  if (loading) return <Loading />;

  return (
    <div style={{ margin: '0 auto', width: '100%', padding: '2rem', minHeight: '100vh', background: 'var(--secondary-brown)' }}>
      {/* Logout */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <LogoutButton onLogout={handleLogout} size="normal" showUserName={true} />
      </div>

      {/* Header */}
      <Header />

      {/* Filtros */}
      <Filters
        viewMode={viewMode} setViewMode={setViewMode}
        selectedDate={selectedDate} setSelectedDate={setSelectedDate}
        endDate={endDate} setEndDate={setEndDate}
        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
      />

      {/* Mensajes */}
      {error && <ErrorMessage message={error} />}
      {filteredReservas.length === 0
        ? <NoReservations />
        : <ReservaList reservas={filteredReservas} updateAsistencia={updateAsistencia} />
      }
    </div>
  );
};

export default InstructorReservas;

