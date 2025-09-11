import React, { useState, useEffect } from 'react';
import '../CSS/MenuCalendario.css';
import '../CSS/DisponibilidadCaballos.css';
import ReservaInfo from "./ReservaInfo";
import TituloReserva from './TituloReserva';
import DisponibilidadCaballos from './DisponibilidadCaballos';
import axios from 'axios';

const MenuCalendario = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 8, 1)); // Septiembre 2025
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

  // Estado para reservas y disponibilidad
  const [reservations, setReservations] = useState({});
  const [availability, setAvailability] = useState({});
  const [loading, setLoading] = useState(false);

  // Mapeo de actividades del frontend al backend
  const activityClassMap = {
    'iniciacion': 1, // ID de la clase de iniciación en la BD
    'caminata': 2,   // ID de la clase de paseo/caminata en la BD
    'salto': 3       // ID de la clase de salto en la BD
  };

  // Cargar reservas existentes al montar el componente y cambiar mes
  useEffect(() => {
    fetchReservationsForMonth();
  }, [currentDate]);

  // Cargar disponibilidad cuando se selecciona una fecha
  useEffect(() => {
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      fetchAvailability(dateString);
    }
  }, [selectedDate]);

  // Función para obtener reservas del mes actual
  const fetchReservationsForMonth = async () => {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];

      const response = await axios.get('http://localhost:3001/api/reservas', {
        params: { 
          fecha_inicio: startDate, 
          fecha_fin: endDate 
        }
      });

      // Organizar reservas por fecha
      const reservasPorFecha = {};
      response.data.forEach(reserva => {
        if (!reservasPorFecha[reserva.fecha]) {
          reservasPorFecha[reserva.fecha] = [];
        }
        reservasPorFecha[reserva.fecha].push({
          id: reserva.id,
          time: reserva.horario,
          nombre: reserva.nombre,
          edad: reserva.edad,
          actividad: reserva.actividad
        });
      });

      setReservations(reservasPorFecha);
    } catch (error) {
      console.error('Error cargando reservas:', error);
      // Mantener estado local si hay error
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener disponibilidad de una fecha específica
  const fetchAvailability = async (dateString) => {
    try {
      const response = await axios.get('http://localhost:3001/api/reservas/availability', {
        params: { fecha: dateString }
      });
      
      setAvailability(prev => ({
        ...prev,
        [dateString]: response.data
      }));
    } catch (error) {
      console.error('Error cargando disponibilidad:', error);
      // Usar configuración por defecto si hay error
      setAvailability(prev => ({
        ...prev,
        [dateString]: {
          '08:00': { total: 6, available: 6 },
          '09:00': { total: 6, available: 6 },
          '10:00': { total: 6, available: 6 },
          '16:00': { total: 8, available: 8 },
          '17:00': { total: 8, available: 8 },
          '18:00': { total: 8, available: 8 },
          'salto': { total: 5, available: 5 }
        }
      }));
    }
  };

  // Configuración de lugares por horario (fallback si no hay conexión con backend)
  const spotsConfig = {
    '08:00': { total: 6 },
    '09:00': { total: 6 },
    '10:00': { total: 6 },
    '16:00': { total: 8 },
    '17:00': { total: 8 },
    '18:00': { total: 8 }
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const dayNamesFull = ['Domingo', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  const timeSlots = {
    morning: [
      { time: '08:00', label: '8:00 AM' },
      { time: '09:00', label: '9:00 AM' },
      { time: '10:00', label: '10:00 AM' }
    ],
    afternoon: [
      { time: '16:00', label: '4:00 PM' },
      { time: '17:00', label: '5:00 PM' },
      { time: '18:00', label: '6:00 PM' }
    ]
  };

  const actividades = ['iniciacion', 'caminata', 'salto'];

  // Función para verificar si un cliente ya tiene una reserva en una fecha específica
  const clientHasReservationOnDate = (nombre, dateString) => {
    const dayReservations = reservations[dateString] || [];
    return dayReservations.some(reservation => 
      reservation.nombre.toLowerCase() === nombre.toLowerCase()
    );
  };

  // Función para contar reservas de salto en una fecha específica
  const getSaltoReservationsCount = (dateString) => {
    const dateAvailability = availability[dateString];
    if (dateAvailability && dateAvailability.salto) {
      return dateAvailability.salto.total - dateAvailability.salto.available;
    }
    // Fallback: contar desde reservas locales
    const dayReservations = reservations[dateString] || [];
    return dayReservations.filter(reservation => reservation.actividad === 'salto').length;
  };

  // Función para obtener disponibilidad de lugares para un horario específico
  const getSpotAvailability = (timeSlot, dateString) => {
    // Usar datos del backend si están disponibles
    const dateAvailability = availability[dateString];
    if (dateAvailability && dateAvailability[timeSlot]) {
      return dateAvailability[timeSlot];
    }

    // Fallback: calcular desde configuración local
    const config = spotsConfig[timeSlot];
    if (!config) return { total: 0, available: 0 };

    const dayReservations = reservations[dateString] || [];
    const timeReservations = dayReservations.filter(res => res.time === timeSlot);
    
    return {
      total: config.total,
      available: Math.max(0, config.total - timeReservations.length),
      reservations: timeReservations
    };
  };

  // Función para verificar si es día laboral (Martes a Domingo)
  const isWorkingDay = (date) => {
    const dayOfWeek = date.getDay();
    return dayOfWeek >= 2 || dayOfWeek === 0;
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
      const appointmentCount = dayReservations.length;

      days.push({
        date: cellDate,
        day: cellDate.getDate(),
        isOtherMonth,
        isToday,
        isUnavailable,
        isSelected,
        appointmentCount,
        dateString
      });
      cellCount++;
    }

    return days;
  };

  // Seleccionar fecha (muestra modal)
  const selectDate = (day) => {
    if (day.isUnavailable || day.isOtherMonth) return;
    setSelectedDate(day.date);
    setSelectedTime(null);
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

  // Confirmar cita desde el modal - INTEGRADO CON BACKEND
  const confirmAppointment = async () => {
    if (!selectedDate || !selectedTime || !bookingData.nombre || !bookingData.edad || !bookingData.actividad) {
      alert('Por favor completa todos los campos');
      return;
    }

    const dateString = selectedDate.toISOString().split('T')[0];
    const spotAvailability = getSpotAvailability(selectedTime, dateString);
    
    if (spotAvailability.available <= 0) {
      alert('No hay lugares disponibles para este horario');
      return;
    }

    // Verificar si el cliente ya tiene una reserva ese día
    if (clientHasReservationOnDate(bookingData.nombre, dateString)) {
      alert('Ya tienes una reserva para este día. Solo se permite una reserva por día por cliente.');
      return;
    }

    // Verificar límite de saltos (5 por día)
    if (bookingData.actividad === 'salto' && getSaltoReservationsCount(dateString) >= 5) {
      alert('Ya se alcanzó el límite máximo de 5 reservas de salto para este día.');
      return;
    }

    setLoading(true);

    try {
      // Crear reserva en el backend
      const clase_id = activityClassMap[bookingData.actividad];
      const reservaData = {
        usuario_id: 1, // Temporal - deberías obtener esto del usuario logueado
        clase_id: clase_id,
        fecha: dateString,
        horario: selectedTime,
        nombre: bookingData.nombre,
        edad: parseInt(bookingData.edad),
        actividad: bookingData.actividad
      };

      const response = await axios.post('http://localhost:3001/api/reservas', reservaData);

      // Si la reserva se guarda exitosamente, actualizar estado local
      const newReservation = {
        id: response.data.id,
        time: selectedTime,
        nombre: bookingData.nombre,
        edad: parseInt(bookingData.edad),
        actividad: bookingData.actividad
      };

      // Agregar la reserva al estado local
      setReservations(prev => ({
        ...prev,
        [dateString]: [...(prev[dateString] || []), newReservation]
      }));

      // Actualizar disponibilidad
      await fetchAvailability(dateString);

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

      // Resetear selección y cerrar modal de fecha
      setShowDateModal(false);
      setSelectedDate(null);
      setSelectedTime(null);
      setBookingData({ nombre: '', edad: '', actividad: '' });

    } catch (error) {
      console.error('Error creando reserva:', error);
      
      if (error.response) {
        // El servidor respondió con un código de error
        alert(error.response.data.error || 'Error al crear la reserva');
      } else if (error.request) {
        // No hubo respuesta del servidor
        alert('No se pudo conectar con el servidor. Inténtalo más tarde.');
      } else {
        // Error en la configuración de la petición
        alert('Error inesperado. Inténtalo más tarde.');
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

  const closeDateModal = () => {
    setShowDateModal(false);
    setSelectedTime(null);
    setBookingData({ nombre: '', edad: '', actividad: '' });
  };

  return (
    <div className="calendar-container">
      {/* Indicador de carga */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">Cargando...</div>
        </div>
      )}

      {/* Modal al seleccionar fecha: muestra horarios y formulario de reserva */}
      {showDateModal && selectedDate && (
        <div className="modal-overlay" onClick={closeDateModal}>
          <div className="date-modal" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={closeDateModal}>×</button>
            <div className="modal-header">
              <h2>Reserva para {dayNamesFull[selectedDate.getDay()]}, {selectedDate.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}</h2>
              <div className="day-info">
                <p>Reservas de salto disponibles: {5 - getSaltoReservationsCount(selectedDateString)}/5</p>
              </div>
            </div>
            <div className="modal-content">
              {isWorkingToday ? (
                <>
                  <h4>Horarios Disponibles</h4>
                  <div className="time-period">
                    <h5>Matutino</h5>
                    <div className="time-slots-grid">
                      {timeSlots.morning.map(slot => {
                        const spotInfo = getSpotAvailability(slot.time, selectedDateString);
                        const hasAvailableSpots = spotInfo.available > 0;
                        const isSelected = selectedTime === slot.time;
                        
                        return (
                          <div
                            key={slot.time}
                            className={`time-slot ${!hasAvailableSpots ? 'occupied' : ''} ${isSelected ? 'selected' : ''}`}
                            onClick={hasAvailableSpots ? () => selectTime(slot.time) : undefined}
                          >
                            <div className="time-label">{slot.label}</div>
                            <div className="spots-info">{spotInfo.available}/{spotInfo.total} lugares</div>
                            {!hasAvailableSpots && <span className="occupied-label">Sin lugares</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="time-period">
                    <h5>Vespertino</h5>
                    <div className="time-slots-grid">
                      {timeSlots.afternoon.map(slot => {
                        const spotInfo = getSpotAvailability(slot.time, selectedDateString);
                        const hasAvailableSpots = spotInfo.available > 0;
                        const isSelected = selectedTime === slot.time;
                        
                        return (
                          <div
                            key={slot.time}
                            className={`time-slot ${!hasAvailableSpots ? 'occupied' : ''} ${isSelected ? 'selected' : ''}`}
                            onClick={hasAvailableSpots ? () => selectTime(slot.time) : undefined}
                          >
                            <div className="time-label">{slot.label}</div>
                            <div className="spots-info">{spotInfo.available}/{spotInfo.total} lugares</div>
                            {!hasAvailableSpots && <span className="occupied-label">Sin lugares</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Componente de disponibilidad de caballos */}
                  <DisponibilidadCaballos
                    totalSpots={currentSpotAvailability.total}
                    availableSpots={currentSpotAvailability.available}
                    selectedTime={selectedTime}
                  />

                  {/* Formulario solo si se selecciona horario */}
                  {selectedTime && (
                    <div className="booking-form">
                      <h4>Información de la Reserva</h4>
                      <div className="form-group">
                        <label htmlFor="nombre">Nombre:</label>
                        <input
                          type="text"
                          id="nombre"
                          name="nombre"
                          value={bookingData.nombre}
                          onChange={handleInputChange}
                          placeholder="Ingresa tu nombre completo"
                          disabled={loading}
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
                          disabled={loading}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="actividad">Actividad:</label>
                        <select
                          id="actividad"
                          name="actividad"
                          value={bookingData.actividad}
                          onChange={handleInputChange}
                          disabled={loading}
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

                      {/* Validación de cliente existente */}
                      {bookingData.nombre && clientHasReservationOnDate(bookingData.nombre, selectedDateString) && (
                        <div className="warning-message">
                          ⚠️ Ya tienes una reserva para este día. Solo se permite una reserva por día.
                        </div>
                      )}

                      {/* Validación de límite de saltos */}
                      {bookingData.actividad === 'salto' && !canMakeSaltoReservation(selectedDateString) && (
                        <div className="warning-message">
                          ⚠️ Se alcanzó el límite máximo de 5 reservas de salto para este día.
                        </div>
                      )}

                      <button
                        className="modal-btn primary"
                        onClick={confirmAppointment}
                        disabled={
                          loading ||
                          !bookingData.nombre || 
                          !bookingData.edad || 
                          !bookingData.actividad || 
                          currentSpotAvailability.available <= 0 ||
                          clientHasReservationOnDate(bookingData.nombre, selectedDateString) ||
                          (bookingData.actividad === 'salto' && !canMakeSaltoReservation(selectedDateString))
                        }
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
            <button className="nav-btn prev" onClick={previousMonth}>‹</button>
            <h2 className="month-year">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button className="nav-btn next" onClick={nextMonth}>›</button>
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
                className={`day-cell ${day.isOtherMonth ? 'other-month' : ''} ${day.isToday ? 'today' : ''} ${day.isUnavailable ? 'unavailable' : 'available'} ${day.isSelected ? 'selected' : ''}`}
                onClick={() => selectDate(day)}
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
              <button className="close-btn2" onClick={closeSuccessModal}>×</button>
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
      <ReservaInfo />
    </div>
  );
};

export default MenuCalendario;