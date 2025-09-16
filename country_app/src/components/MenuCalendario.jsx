import React, { useState, useEffect } from 'react';
import '../CSS/MenuCalendario.css';
import '../CSS/DisponibilidadCaballos.css';
import TituloReserva from './TituloReserva';
import DisponibilidadCaballos from './DisponibilidadCaballos';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReservasInfo from "./ReservaInfo";

const MenuCalendario = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 8, 1));
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [bookingData, setBookingData] = useState({
    nombre: '',
    edad: '',
    actividad: ''
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showReservationsModal, setShowReservationsModal] = useState(false);

  // Estado para reservas y disponibilidad
  const [reservations, setReservations] = useState({});
  const [availability, setAvailability] = useState({});
  const [loading, setLoading] = useState(false);

  // Estado para usuario logueado (simulado)
  const [currentUser, setCurrentUser] = useState(null);

  // Estado para horarios del día cargados dinámicamente
  const [horariosDia, setHorariosDia] = useState([]);

  // Mapeo de actividades del frontend al backend
  const activityClassMap = {
    'iniciacion': 1,
    'caminata': 2,
    'salto': 3
  };

  // Simulación de verificación de usuario
  useEffect(() => {
    const mockUser = { id: 1, nombre: 'Usuario Test' };
    setCurrentUser(mockUser);
  }, []);

  // Cargar reservas existentes al montar el componente y cambiar mes
  useEffect(() => {
    fetchReservationsForMonth();
  }, [currentDate]);

  // Cargar disponibilidad cuando se selecciona una fecha
  useEffect(() => {
    if (selectedDate) {
      const diasSemana = ['domingo','martes','miercoles','jueves','viernes','sabado'];
      const diaSemana = diasSemana[selectedDate.getDay()];
      fetchHorariosDia(diaSemana);
      fetchAvailability(selectedDate.toISOString().split('T')[0]);
    }
  }, [selectedDate]);

  // Cerrar modal con tecla ESC
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        if (showDateModal) closeDateModal();
        if (showSuccessModal) closeSuccessModal();
        if (showReservationsModal) closeReservationsModal();
      }
    };
    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [showDateModal, showSuccessModal, showReservationsModal]);

  // Función para obtener reservas del mes actual
  const fetchReservationsForMonth = async () => {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];

      const response = await axios.get('https://country-page.onrender.com/api/reservas', {
        params: { 
          fecha_inicio: startDate, 
          fecha_fin: endDate 
        }
      });

      // Organizar reservas por fecha
      const reservasPorFecha = {};
      response.data.forEach(reserva => {
        const fechaKey = reserva.fecha.split('T')[0];
        
        if (!reservasPorFecha[fechaKey]) {
          reservasPorFecha[fechaKey] = [];
        }
        
        reservasPorFecha[fechaKey].push({
          id: reserva.id,
          time: reserva.horario,
          nombre: reserva.nombre,
          edad: reserva.edad,
          fecha: reserva.fecha,
          actividad: reserva.clase_tipo || reserva.actividad,
          estado: reserva.estado,
          usuario_id: reserva.usuario_id,
          clase_nombre: reserva.clase_nombre,
          caballo_id: reserva.caballo_id
        });
      });

      setReservations(reservasPorFecha);

    } catch (error) {
      console.error('Error cargando reservas:', error);
      toast.error('Error al cargar las reservas del servidor');
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener disponibilidad de una fecha específica
  const fetchAvailability = async (dateString) => {
    try {
      const response = await axios.get('https://country-page.onrender.com/api/reservas/availability', {
        params: { fecha: dateString }
      });
      
      setAvailability(prev => ({
        ...prev,
        [dateString]: response.data
      }));

    } catch (error) {
      console.error('Error cargando disponibilidad:', error);
      const dayReservations = reservations[dateString] || [];
      const fallbackAvailability = calculateFallbackAvailability(dayReservations);
      
      setAvailability(prev => ({
        ...prev,
        [dateString]: fallbackAvailability
      }));
    }
  };

  // Calcular disponibilidad de fallback si falla el backend
  const calculateFallbackAvailability = (dayReservations) => {
    const horariosConfig = {
      "08:00": { total: 6 },
      "09:00": { total: 6 },
      "10:00": { total: 6 },
      "16:00": { total: 6 },
      "17:00": { total: 6 },
      "18:00": { total: 6 }
    };

    const availability = {};
    Object.keys(horariosConfig).forEach(horario => {
      const timeReservations = dayReservations.filter(res => 
        res.time === horario && res.estado !== 'cancelada'
      );
      availability[horario] = {
        total: horariosConfig[horario].total,
        available: Math.max(0, horariosConfig[horario].total - timeReservations.length)
      };
    });

    return availability;
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const dayNamesFull = ['Domingo', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  const actividades = ['iniciacion', 'caminata', 'salto'];

  // Verificar si un cliente ya tiene una reserva en una fecha específica
  const clientHasReservationOnDate = (nombre, dateString) => {
    const dayReservations = reservations[dateString] || [];
    return dayReservations.some(reservation => 
      reservation.nombre.toLowerCase() === nombre.toLowerCase() &&
      reservation.estado !== 'cancelada'
    );
  };

  // Contar reservas de salto en una fecha específica
  const getSaltoReservationsCount = (dateString) => {
    const dateAvailability = availability[dateString];
    if (dateAvailability && dateAvailability.salto) {
      return dateAvailability.salto.total - dateAvailability.salto.available;
    }
    
    const dayReservations = reservations[dateString] || [];
    return dayReservations.filter(reservation => 
      reservation.actividad === 'salto' && reservation.estado !== 'cancelada'
    ).length;
  };

  // Obtener disponibilidad de lugares para un horario específico
  const getSpotAvailability = (timeSlot, dateString) => {
    const dateAvailability = availability[dateString];
    if (dateAvailability && dateAvailability[timeSlot]) {
      const spotData = dateAvailability[timeSlot];
      const dayReservations = reservations[dateString] || [];
      // Solo reservas confirmadas y que no sean de salto
      const timeReservations = dayReservations.filter(res => 
        res.time === timeSlot && res.estado === 'confirmada' && res.actividad !== 'salto'
      );
      return {
        total: spotData.total,
        available: spotData.available,
        reservations: timeReservations
      };
    }

    // Fallback: usar configuración por defecto de 6 horarios máximo
    const dayReservations = reservations[dateString] || [];
    const timeReservations = dayReservations.filter(res => 
      res.time === timeSlot && res.estado === 'confirmada'
    );
    return {
      total: 6,
      available: Math.max(0, 6 - timeReservations.length),
      reservations: timeReservations
    };
  };

  // Verificar si es día laboral (Martes a Domingo)
  const isWorkingDay = (date) => {
    const dayOfWeek = date.getDay();
    return dayOfWeek >= 2 || dayOfWeek === 0;
  };

  // Función para obtener el estado visual de un día
  const getDayStatus = (dateString) => {
    const dayReservations = reservations[dateString] || [];
    const activeReservations = dayReservations.filter(res => res.estado !== 'cancelada');
    
    if (activeReservations.length === 0) return 'empty';
    
    let totalCapacity = 0;
    let totalOccupied = 0;

    const dateAvailability = availability[dateString];
    if (dateAvailability) {
      Object.keys(dateAvailability).forEach(key => {
        if (key !== 'salto') {
          totalCapacity += dateAvailability[key].total;
          totalOccupied += (dateAvailability[key].total - dateAvailability[key].available);
        }
      });
      if (dateAvailability.salto) {
        totalCapacity += dateAvailability.salto.total;
        totalOccupied += (dateAvailability.salto.total - dateAvailability.salto.available);
      }
    } else {
      totalOccupied = activeReservations.length;
      totalCapacity = 36; // 6 horarios x 6 cupos cada uno
    }
    
    if (totalCapacity === 0) return 'empty';
    
    const occupancyRate = totalOccupied / totalCapacity;
    
    if (occupancyRate >= 0.9) return 'full';
    if (occupancyRate >= 0.6) return 'busy';
    if (occupancyRate > 0) return 'available';
    return 'empty';
  };

  // Generar días del calendario
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - 1);
    startDate.setDate(startDate.getDate() - (startDate.getDay() === 0 ? 0 : startDate.getDay()));
  
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = [];
    let cellCount = 0;

    for (let i = 0; i < 42 && cellCount < 36; i++) {
      const cellDate = new Date(startDate);
      cellDate.setDate(startDate.getDate() + i);

      if (cellDate.getDay() === 1) {
        continue;
      }

      const isOtherMonth = cellDate.getMonth() !== month;
      const isToday = cellDate.toDateString() === today.toDateString();
      const isUnavailable = isOtherMonth || cellDate < today || !isWorkingDay(cellDate);
      const isSelected = selectedDate && cellDate.toDateString() === selectedDate.toDateString();
      
      const dateString = cellDate.toISOString().split('T')[0];
      const dayReservations = reservations[dateString] || [];
      const appointmentCount = dayReservations.filter(res => res.estado !== 'cancelada').length;
      const dayStatus = getDayStatus(dateString);

      days.push({
        date: cellDate,
        day: cellDate.getDate(),
        isOtherMonth,
        isToday,
        isUnavailable,
        isSelected,
        appointmentCount,
        dateString,
        dayStatus
      });
      cellCount++;
    }

    return days;
  };

  // Seleccionar fecha (muestra modal)
  const selectDate = (day) => {
    if (day.isUnavailable || day.isOtherMonth) return;
    setSelectedDate(day.date);
    setSelectedTime(null); // Resetear horario seleccionado
    setBookingData({ nombre: '', edad: '', actividad: '' });
    setShowDateModal(true);
  };

  // Seleccionar hora
  const selectTime = (time) => {
    setSelectedTime(time);
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Función para cancelar una reserva
  const cancelReservation = async (reservaId) => {
    if (!window.confirm('¿Estás seguro de que quieres cancelar esta reserva?')) {
      return;
    }

    setLoading(true);
    try {
      await axios.delete(`https://country-page.onrender.com/api/reservas/${reservaId}`);
      
      toast.success('Reserva cancelada exitosamente');
      
      await fetchReservationsForMonth();
      if (selectedDate) {
        await fetchAvailability(selectedDate.toISOString().split('T')[0]);
      }
    } catch (error) {
      console.error('Error cancelando reserva:', error);
      toast.error('Error al cancelar la reserva');
    } finally {
      setLoading(false);
    }
  };

  // Confirmar cita desde el modal
  const confirmAppointment = async () => {
    if (!currentUser) {
      toast.error('Debes estar logueado para hacer una reserva');
      return;
    }

    if (!selectedDate || !selectedTime || !bookingData.nombre || !bookingData.edad || !bookingData.actividad) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    const dateString = selectedDate.toISOString().split('T')[0];
    const spotAvailability = getSpotAvailability(selectedTime, dateString);
    
    if (spotAvailability.available <= 0) {
      toast.error('No hay lugares disponibles para este horario');
      return;
    }

    // Verificar si el cliente ya tiene una reserva ese día
    if (clientHasReservationOnDate(bookingData.nombre, dateString)) {
      toast.error('Ya tienes una reserva para este día. Solo se permite una reserva por día por cliente.');
      return;
    }

    // Verificar límite de saltos (5 por día)
    if (bookingData.actividad === 'salto' && getSaltoReservationsCount(dateString) >= 5) {
      toast.error('Ya se alcanzó el límite máximo de 5 reservas de salto para este día.');
      return;
    }

    setLoading(true);

    try {
      const clase_id = activityClassMap[bookingData.actividad];
      const reservaData = {
        usuario_id: currentUser.id,
        clase_id: clase_id,
        fecha: dateString,
        horario: selectedTime,
        nombre: bookingData.nombre,
        edad: parseInt(bookingData.edad),
        actividad: bookingData.actividad
      };

      const response = await axios.post('https://country-page.onrender.com/api/reservas', reservaData);

      // Actualizar inmediatamente después de crear la reserva
      await Promise.all([
        fetchReservationsForMonth(),
        fetchAvailability(dateString)
      ]);

      // Preparar datos para el modal de confirmación
      const dayName = dayNamesFull[selectedDate.getDay()];
      const formattedDate = selectedDate.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      const timeFormatted = selectedTime.includes('16') ? '4:00 PM' :
                          selectedTime.includes('17') ? '5:00 PM' :
                          selectedTime.includes('18') ? '6:00 PM' :
                          selectedTime.includes('08') ? '8:00 AM' :
                          selectedTime.includes('09') ? '9:00 AM' : '10:00 AM';

      setConfirmedBooking({
        id: response.data.id,
        nombre: bookingData.nombre,
        edad: bookingData.edad,
        actividad: bookingData.actividad,
        fecha: formattedDate,
        hora: timeFormatted,
        dayName
      });

      setShowSuccessModal(true);
      toast.success('¡Reserva confirmada exitosamente!');

      // Resetear selección y cerrar modal de fecha
      setShowDateModal(false);
      setSelectedDate(null);
      setSelectedTime(null);
      setBookingData({ nombre: '', edad: '', actividad: '' });

    } catch (error) {
      console.error('Error creando reserva:', error);
      
      if (error.response) {
        toast.error(error.response.data.error || 'Error al crear la reserva');
      } else if (error.request) {
        toast.error('No se pudo conectar con el servidor. Inténtalo más tarde.');
      } else {
        toast.error('Error inesperado. Inténtalo más tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Navegación del calendario
  const previousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    resetSelection();
  };

  const nextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    resetSelection();
  };

  const resetSelection = () => {
    setSelectedDate(null);
    setSelectedTime(null);
    setBookingData({ nombre: '', edad: '', actividad: '' });
  };

  const calendarDays = generateCalendarDays();
  const selectedDateString = selectedDate ? selectedDate.toISOString().split('T')[0] : '';
  const dayReservations = selectedDate ? (reservations[selectedDateString] || []) : [];
  const isWorkingToday = selectedDate ? isWorkingDay(selectedDate) : false;

  // Obtener disponibilidad para el horario seleccionado
  const currentSpotAvailability = selectedTime && selectedDate ? 
    getSpotAvailability(selectedTime, selectedDateString) : 
    { total: 0, available: 0 };

  // Función para verificar si se puede hacer una reserva de salto
  const canMakeSaltoReservation = (dateString) => {
    return getSaltoReservationsCount(dateString) < 5;
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    setConfirmedBooking(null);
  };

  // Cerrar modal de fecha con reseteo completo
  const closeDateModal = () => {
    setShowDateModal(false);
    setSelectedTime(null);
    setBookingData({ nombre: '', edad: '', actividad: '' });
  };

  const showReservations = () => {
    setShowReservationsModal(true);
  };

  const closeReservationsModal = () => {
    setShowReservationsModal(false);
  };

  // Función para obtener horarios disponibles según el día de la semana dinámicamente
  const fetchHorariosDia = async (diaSemana) => {
    try {
      const response = await axios.get('https://country-page.onrender.com/api/horarios', {
        params: { dia_semana: diaSemana }
      });
      setHorariosDia(response.data);
    } catch (error) {
      console.error('Error obteniendo horarios:', error);
      toast.error('Error cargando horarios disponibles');
      setHorariosDia([]);
    }
  };

  // Función para obtener color del estado de reserva
  const getStatusColor = (estado) => {
    switch(estado) {
      case 'confirmada': return '#28a745'; // Verde
      case 'pendiente': return '#ffc107';   // Amarillo
      case 'cancelada': return '#dc3545';   // Rojo
      default: return '#6c757d';           // Gris
    }
  };

  return (
    <div className="calendar-container">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* Indicador de carga */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">Cargando...</div>
        </div>
      )}

      {/* Modal de reservas del día */}
      {showReservationsModal && selectedDate && (
        <div className="modal-overlay" onClick={closeReservationsModal}>
          <div className="reservations-modal" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={closeReservationsModal} aria-label="Cerrar modal">×</button>
            <div className="modal-header">
              <h2>Reservas del {selectedDate.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}</h2>
            </div>
            <div className="modal-content">
              {dayReservations.filter(res => res.estado !== 'cancelada').length === 0 ? (
                <p className="no-reservations">No hay reservas activas para este día.</p>
              ) : (
                <div className="reservations-list">
                  {dayReservations.filter(res => res.estado !== 'cancelada').map((reserva, idx) => (
                    <div key={reserva.id || idx} className="reservation-item">
                      <div className="reservation-info">
                        <h4 style={{ color: getStatusColor(reserva.estado) }}>
                          {reserva.nombre} – {reserva.actividad} – Caballo {reserva.caballo_id}
                        </h4>
                        <p><strong>Edad:</strong> {reserva.edad} años</p>
                        <p><strong>Hora:</strong> {reserva.time}</p>
                        <p><strong>Estado:</strong> 
                          <span className={`status ${reserva.estado}`} style={{ color: getStatusColor(reserva.estado) }}>
                            {reserva.estado}
                          </span>
                        </p>
                      </div>
                      {currentUser && currentUser.id === reserva.usuario_id && (
                        <button 
                          className="cancel-btn"
                          onClick={() => cancelReservation(reserva.id)}
                          disabled={loading}
                          aria-label="Cancelar reserva"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal al seleccionar fecha: muestra horarios y formulario de reserva */}
      {showDateModal && selectedDate && (
        <div className="modal-overlay" onClick={closeDateModal}>
          <div className="date-modal" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={closeDateModal} aria-label="Cerrar modal">×</button>
            <div className="modal-header">
              <button className="close-btn" onClick={closeDateModal} aria-label="Cerrar modal">×</button>
              <h2>Reserva para {dayNamesFull[selectedDate.getDay()]}, {selectedDate.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}</h2>
            </div>
            <div className="modal-content">
              {isWorkingToday ? (
                <>
                <div className="form-group">
                        <label htmlFor="actividad">Actividad:</label>
                        <select
                          id="actividad"
                          name="actividad"
                          value={bookingData.actividad}
                          onChange={handleInputChange}
                          disabled={loading || !currentUser}
                        >
                          <option value="">Selecciona una actividad</option>
                          {actividades.map(actividad => {
                            const isDisabled = actividad === 'salto' && !canMakeSaltoReservation(selectedDateString);
                            return (
                              <option key={actividad} value={actividad} disabled={isDisabled}>
                                {actividad.charAt(0).toUpperCase() + actividad.slice(1)}
                                {isDisabled ? ' (Límite alcanzado)' : ''}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                  <h4>Horarios Disponibles</h4>
                  <div className="time-period">
                    <div className="time-slots-grid">
                      {horariosDia.length === 0 ? (
                        <p>No hay horarios disponibles para este día.</p>
                      ) : (
                        horariosDia.map(slot => {
                          const horaStr = slot.hora.slice(0,5);
                          const dayReservations = reservations[selectedDateString] || [];
                          const timeReservations = dayReservations.filter(res => 
                            res.time === horaStr && res.estado !== 'cancelada'
                          );
                          const totalCupos = 6;
                          const available = Math.max(0, totalCupos - timeReservations.length);
                          const isSelected = selectedTime === horaStr;
                          

                          // NUEVO: Verifica si el usuario ya tiene reserva en ese horario
                          const userHasReservation = dayReservations.some(res =>
                            res.usuario_id === currentUser?.id &&
                            res.time === horaStr &&
                            res.estado !== 'cancelada'
                          );

                          return (
                            <div
                              key={slot.id}
                              className={`time-slot ${available === 0 ? 'occupied' : ''} ${isSelected ? 'selected' : ''} ${userHasReservation ? 'blocked' : ''}`}
                              onClick={
                                available > 0 && !userHasReservation
                                  ? () => selectTime(horaStr)
                                  : undefined
                              }
                              aria-label={`Horario ${horaStr}, ${available} lugares disponibles`}
                              style={userHasReservation ? { pointerEvents: 'none', opacity: 0.5 } : {}}
                            >
                              <div className="time-label">{horaStr}</div>
                              {available === 0 && <span className="occupied-label">Sin lugares</span>}
                              {userHasReservation && <span className="blocked-label">Reservado por ti</span>}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Componente de disponibilidad de caballos */}
                  <DisponibilidadCaballos
                    totalSpots={11}
                    reservations={currentSpotAvailability.reservations ? currentSpotAvailability.reservations.filter(res => res.estado === 'confirmada') : []}
                    selectedTime={selectedTime}
                    selectedDate={selectedDate}
                  />

                  {/* Formulario solo si se selecciona horario */}
                  {selectedTime && (
                    <div className="booking-form">
                      <h4>Información de la Reserva</h4>
                      {!currentUser && (
                        <div className="auth-warning">
                          ⚠️ Debes estar logueado para hacer una reserva
                        </div>
                      )}
                      <div className="form-group">
                        <label htmlFor="nombre">Nombre:</label>
                        <input
                          type="text"
                          id="nombre"
                          name="nombre"
                          value={bookingData.nombre}
                          onChange={handleInputChange}
                          placeholder="Ingresa tu nombre completo"
                          disabled={loading || !currentUser}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="edad">Edad:</label>
                        <input
                          type="number"
                          id="edad"
                          name="edad"
                          value={bookingData.edad}
                          onChange={handleInputChange}
                          placeholder="Ingresa tu edad"
                          min="1"
                          max="120"
                          disabled={loading || !currentUser}
                        />
                      </div>
                      

                      <button
                        className="modal-btn primary"
                        onClick={confirmAppointment}
                        disabled={
                          loading ||
                          !currentUser ||
                          !selectedTime || // Botón deshabilitado hasta seleccionar horario
                          !bookingData.nombre || 
                          !bookingData.edad || 
                          !bookingData.actividad || 
                          currentSpotAvailability.available <= 0 ||
                          clientHasReservationOnDate(bookingData.nombre, selectedDateString) ||
                          (bookingData.actividad === 'salto' && !canMakeSaltoReservation(selectedDateString))
                        }
                        aria-label="Confirmar reserva"
                      >
                        {loading ? 'Guardando...' : 'Confirmar Reserva'}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="no-availability">
                  <h4>No hay disponibilidad</h4>
                  <p>Los lunes no hay horarios disponibles.</p>
                  <p>Horario laboral: <strong>Martes a Domingo</strong></p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Título de la sección */}
      <TituloReserva />

      {/* Sección del Calendario */}
      <div className="calendar-section">
        <div className="calendar-header">
          <div className="month-navigation">
            <button className="nav-btn prev" onClick={previousMonth} aria-label="Mes anterior">‹</button>
            <h2 className="month-year">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button className="nav-btn next" onClick={nextMonth} aria-label="Mes siguiente">›</button>
          </div>
        </div>
        
        <div className="calendar-grid">
          <div className="day-headers">
            {dayNames.map(day => (
              <div key={day} className="day-header">{day}</div>
            ))}
          </div>
          
          <div className="days-grid">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`day-cell ${day.isOtherMonth ? 'other-month' : ''} ${day.isToday ? 'today' : ''} ${day.isUnavailable ? 'unavailable' : 'available'} ${day.isSelected ? 'selected' : ''} ${day.dayStatus}`}
                onClick={() => selectDate(day)}
                title={`${day.appointmentCount} reserva${day.appointmentCount !== 1 ? 's' : ''}`}
                aria-label={`Día ${day.day}, ${day.appointmentCount} reservas`}
              >
                <span className="day-number">{day.day}</span>
                {day.appointmentCount > 0 && !day.isOtherMonth && (
                  <div className="appointment-indicators">
                    {Array.from({ length: Math.min(day.appointmentCount, 3) }, (_, i) => (
                      <div key={i} className="appointment-dot" />
                    ))}
                    {day.appointmentCount > 3 && (
                      <span className="more-appointments">+{day.appointmentCount - 3}</span>
                    )}
                  </div>
                )}
                {day.dayStatus === 'full' && !day.isOtherMonth && !day.isUnavailable && (
                  <div className="day-status-indicator full">LLENO</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Confirmación */}
      {showSuccessModal && confirmedBooking && (
        <div className="modal-overlay" onClick={closeSuccessModal}>
          <div className="success-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <button className="close-btn2" onClick={closeSuccessModal} aria-label="Cerrar modal">×</button>
              <h2>¡Cita Confirmada!</h2>
            </div>
            
            <div className="modal-content">
              <div className="booking-details">
                <div className="detail-row">
                  <div className="detail-info">
                    <span className="detail-label">Nombre:</span>
                    <span className="detail-value">{confirmedBooking.nombre}</span>
                  </div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-info">
                    <span className="detail-label">Edad:</span>
                    <span className="detail-value">{confirmedBooking.edad} años</span>
                  </div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-info">
                    <span className="detail-label">Actividad:</span>
                    <span className="detail-value">{confirmedBooking.actividad.charAt(0).toUpperCase() + confirmedBooking.actividad.slice(1)}</span>
                  </div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-info">
                    <span className="detail-label">Fecha:</span>
                    <span className="detail-value">{confirmedBooking.fecha}</span>
                  </div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-info">
                    <span className="detail-label">Hora:</span>
                    <span className="detail-value">{confirmedBooking.hora}</span>
                  </div>
                </div>

                {confirmedBooking.id && (
                  <div className="detail-row">
                    <div className="detail-info">
                      <span className="detail-label">ID de Reserva:</span>
                      <span className="detail-value">#{confirmedBooking.id}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="success-message">
                <p>Tu cita ha sido reservada exitosamente. Te esperamos el <strong>{confirmedBooking.dayName}</strong> a las <strong>{confirmedBooking.hora}</strong>.</p>
                <p>¡Nos vemos pronto!</p>
              </div>
            </div>
            
            <div className="modal-actions">
              <button className="modal-btn primary" onClick={closeSuccessModal}>
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      <ReservasInfo reservations={reservations} currentUser={currentUser} />
    </div>
  );
};

export default MenuCalendario;
