import React, { useState } from 'react';
import '../CSS/MenuCalendario.css';
import '../CSS/DisponibilidadCaballos.css';
import ReservaInfo from "./ReservaInfo";
import TituloReserva from './TituloReserva';
import DisponibilidadCaballos from './DisponibilidadCaballos';

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

  // Estado para el modal de selección de fecha
  const [showDateModal, setShowDateModal] = useState(false);

  // Horarios ocupados (formato: 'YYYY-MM-DD': ['HH:MM', 'HH:MM'])
  const [occupiedSlots, setOccupiedSlots] = useState({});

  // Configuración de lugares por horario - AQUÍ PUEDES CONECTAR CON TU BACKEND
  const spotsConfig = {
    // Formato: 'HH:MM': { total: number, reserved: string[] }
    '08:00': { total: 6, reserved: [] }, // 6 lugares totales, ninguno reservado
    '09:00': { total: 6, reserved: [] },
    '10:00': { total: 6, reserved: [] },
    '16:00': { total: 8, reserved: [] }, // Más lugares en la tarde
    '17:00': { total: 8, reserved: [] },
    '18:00': { total: 8, reserved: [] }
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

  // Función para obtener disponibilidad de lugares para un horario específico
  const getSpotAvailability = (timeSlot, dateString) => {
    const config = spotsConfig[timeSlot];
    if (!config) return { total: 0, available: 0 };

    // Contar reservas existentes para este horario y fecha
    const existingReservations = occupiedSlots[dateString]?.filter(slot => slot === timeSlot).length || 0;
    const totalReserved = config.reserved.length + existingReservations;
    
    return {
      total: config.total,
      available: Math.max(0, config.total - totalReserved)
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
      const appointmentCount = occupiedSlots[dateString]?.length || 0;

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

  // Confirmar cita desde el modal
  const confirmAppointment = () => {
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

    setOccupiedSlots(prev => ({
      ...prev,
      [dateString]: [...(prev[dateString] || []), selectedTime]
    }));

    setConfirmedBooking({
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
  const occupiedToday = selectedDate ? (occupiedSlots[selectedDateString] || []) : [];
  const isWorkingToday = selectedDate ? isWorkingDay(selectedDate) : false;

  // Obtener disponibilidad para el horario seleccionado
  const currentSpotAvailability = selectedTime && selectedDate ? 
    getSpotAvailability(selectedTime, selectedDateString) : 
    { total: 0, available: 0 };

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
            </div>
            <div className="modal-content">
              {isWorkingToday ? (
                <>
                  <h4>Horarios Disponibles</h4>
                  <div className="time-period">
                    <h5>Matutino</h5>
                    <div className="time-slots-grid">
                      {timeSlots.morning.map(slot => {
                        const isOccupied = occupiedToday.includes(slot.time);
                        const isSelected = selectedTime === slot.time;
                        const spotInfo = getSpotAvailability(slot.time, selectedDateString);
                        const hasAvailableSpots = spotInfo.available > 0;
                        
                        return (
                          <div
                            key={slot.time}
                            className={`time-slot ${isOccupied || !hasAvailableSpots ? 'occupied' : ''} ${isSelected ? 'selected' : ''}`}
                            onClick={hasAvailableSpots && !isOccupied ? () => selectTime(slot.time) : undefined}
                          >
                            <div className="time-label">{slot.label}</div>
                            <div className="spots-info">{spotInfo.available}/{spotInfo.total} lugares</div>
                            {(!hasAvailableSpots || isOccupied) && <span className="occupied-label">Sin lugares</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="time-period">
                    <h5>Vespertino</h5>
                    <div className="time-slots-grid">
                      {timeSlots.afternoon.map(slot => {
                        const isOccupied = occupiedToday.includes(slot.time);
                        const isSelected = selectedTime === slot.time;
                        const spotInfo = getSpotAvailability(slot.time, selectedDateString);
                        const hasAvailableSpots = spotInfo.available > 0;
                        
                        return (
                          <div
                            key={slot.time}
                            className={`time-slot ${isOccupied || !hasAvailableSpots ? 'occupied' : ''} ${isSelected ? 'selected' : ''}`}
                            onClick={hasAvailableSpots && !isOccupied ? () => selectTime(slot.time) : undefined}
                          >
                            <div className="time-label">{slot.label}</div>
                            <div className="spots-info">{spotInfo.available}/{spotInfo.total} lugares</div>
                            {(!hasAvailableSpots || isOccupied) && <span className="occupied-label">Sin lugares</span>}
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
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="actividad">Actividad:</label>
                        <select
                          id="actividad"
                          name="actividad"
                          value={bookingData.actividad}
                          onChange={handleInputChange}
                        >
                          <option value="">Selecciona una actividad</option>
                          {actividades.map(actividad => (
                            <option key={actividad} value={actividad}>
                              {actividad.charAt(0).toUpperCase() + actividad.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        className="modal-btn primary"
                        onClick={confirmAppointment}
                        disabled={!bookingData.nombre || !bookingData.edad || !bookingData.actividad || currentSpotAvailability.available <= 0}
                      >
                        Confirmar Reserva
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