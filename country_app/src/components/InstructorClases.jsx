import React, { useState, useEffect } from 'react';
import Header from './instructor/Header';
import Filters from './instructor/Filters';
import Loading from './instructor/Loading';
import ErrorMessage from './instructor/ErrorMessage';
import NoReservations from './instructor/NoReservations';
import ReservaList from './instructor/ReservaList';
import LogoutButton from './LogoutBoton';

const InstructorReservas = () => {
  const [reservas, setReservas] = useState([]);
  const [filteredReservas, setFilteredReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('day');

  const mockReservas = [/* ...tus datos mock aquí... */];

  useEffect(() => { fetchReservas(); }, [selectedDate, endDate, viewMode]);
  useEffect(() => { filterReservas(); }, [reservas, searchTerm]);

  const fetchReservas = async () => {
    setLoading(true); setError('');
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const filtered = mockReservas.filter(reserva => {
        const reservaDate = new Date(reserva.fecha);
        const startDate = new Date(selectedDate);
        if (viewMode === 'day') return reservaDate.toDateString() === startDate.toDateString();
        const endDateObj = endDate ? new Date(endDate) : new Date(startDate.getTime() + 7*24*60*60*1000);
        return reservaDate >= startDate && reservaDate <= endDateObj;
      });
      setReservas(filtered);
    } catch (err) { 
      setError('Error al cargar las reservas.'); 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  };

  const filterReservas = () => {
    if (!searchTerm.trim()) { 
      setFilteredReservas(reservas); 
      return; 
    }
    setFilteredReservas(reservas.filter(r => r.nombre.toLowerCase().includes(searchTerm.toLowerCase())));
  };

  const updateAsistencia = (reservaId, asistencia) => {
    setReservas(prev => prev.map(reserva =>
      reserva.id === reservaId ? { ...reserva, asistencia } : reserva
    ));
  };

  // 👈 Función para manejar el logout
  const handleLogout = () => {
    console.log('Cerrando sesión...');
    window.location.href = '/login';
    window.location.reload();
  };

  if (loading) return <Loading />;
  
  return (
    <div style={{ 
      margin: '0 auto', 
      width: '100%', 
      padding: '2rem', 
      minHeight: '100vh', 
      background: 'var(--secondary-brown)' 
    }}>
      {/* 🔥 Botón de logout arriba del header */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <LogoutButton 
          onLogout={handleLogout}
          size="normal"
          showUserName={true}
        />
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

      {/* Mensajes y reservas */}
      {error && <ErrorMessage message={error} />}
      {filteredReservas.length === 0 
        ? <NoReservations /> 
        : <ReservaList reservas={filteredReservas} updateAsistencia={updateAsistencia} />
      }
    </div>
  );
};

export default InstructorReservas;
