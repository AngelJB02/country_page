import React, { useState, useEffect } from 'react';
import '../CSS/MenuCalendario.css';
import ReservaInfo from "./ReservaInfo";
import TituloReserva from './TituloReserva';
import axios from 'axios';

const MenuCalendario = ({ usuario: propUsuario }) => {
  // Declarar usuario primero
  const usuario = propUsuario || JSON.parse(localStorage.getItem("usuario"));

  // VERIFICAR ROL PERMITIDO
  const rolesPermitidos = ['admin', 'cliente'];
  if (usuario && !rolesPermitidos.includes(usuario.rol)) {
    return (
      <div className="calendar-container">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>Acceso restringido</h2>
          <p>Tu rol "{usuario.rol}" no tiene permisos para acceder a este calendario.</p>
        </div>
      </div>
    );
  }

  const [currentDate, setCurrentDate] = useState(new Date(2025, 8, 1));
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [bookingData, setBookingData] = useState({
    nombre: usuario?.nombre || "",
    edad: "",
    actividad: ""
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [showDateModal, setShowDateModal] = useState(false);
  const [occupiedSlots, setOccupiedSlots] = useState({});

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

  // Actualizar bookingData cuando cambie el usuario
  useEffect(() => {
    if (usuario) {
      setBookingData(prev => ({ ...prev, nombre: usuario.nombre }));
    }
  }, [usuario]);

  /* ---------------------- FUNCIONES CALENDARIO ---------------------- */
  const isWorkingDay = (date) => {
    const dayOfWeek = date.getDay();
    return dayOfWeek >= 2 || dayOfWeek === 0; // Martes a Domingo
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - 1 - (startDate.getDay() === 0 ? 0 : startDate.getDay()));
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const days = [];
    let cellCount = 0;

    for (let i = 0; i < 42 && cellCount < 36; i++) {
      const cellDate = new Date(startDate);
      cellDate.setDate(startDate.getDate() + i);
      if (cellDate.getDay() === 1) continue; // Omitir lunes
      const isOtherMonth = cellDate.getMonth() !== month;
      const isToday = cellDate.toDateString() === today.toDateString();
      const isUnavailable = isOtherMonth || cellDate < today || !isWorkingDay(cellDate);
      const isSelected = selectedDate && cellDate.toDateString() === selectedDate.toDateString();
      const dateString = cellDate.toISOString().split('T')[0];
      const appointmentCount = occupiedSlots[dateString]?.length || 0;
      days.push({ date: cellDate, day: cellDate.getDate(), isOtherMonth, isToday, isUnavailable, isSelected, appointmentCount, dateString });
      cellCount++;
    }
    return days;
  };

  const selectDate = (day) => {
    if (day.isUnavailable || day.isOtherMonth) return;
    setSelectedDate(day.date);
    setSelectedTime(null);
    setShowDateModal(true);
  };

  const selectTime = (time) => setSelectedTime(time);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, [name]: value }));
  };

  /* ---------------------- CONFIRMAR RESERVA ---------------------- */
  const confirmAppointment = async () => {
    if (!selectedDate || !selectedTime || !bookingData.nombre || !bookingData.edad || !bookingData.actividad) {
      alert('Por favor completa todos los campos');
      return;
    }

    if (!usuario) {
      alert('Debes iniciar sesión primero');
      return;
    }

    const dateString = selectedDate.toISOString().split('T')[0];
    const dayName = dayNamesFull[selectedDate.getDay()];
    const formattedDate = selectedDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    const timeFormatted = selectedTime.includes('16') ? '4:00 PM' :
                          selectedTime.includes('17') ? '5:00 PM' :
                          selectedTime.includes('18') ? '6:00 PM' :
                          selectedTime.includes('08') ? '8:00 AM' :
                          selectedTime.includes('09') ? '9:00 AM' : '10:00 AM';

    try {
      const res = await axios.post('http://localhost:3001/reservas', {
        usuario_id: usuario.id,
        clase_id: actividades.indexOf(bookingData.actividad) + 1,
        fecha: dateString,
        horario: selectedTime
      });

      setOccupiedSlots(prev => ({
        ...prev,
        [dateString]: [...(prev[dateString] || []), selectedTime]
      }));

      setConfirmedBooking({ ...bookingData, fecha: formattedDate, hora: timeFormatted, dayName });
      setShowSuccessModal(true);

      setShowDateModal(false);
      setSelectedDate(null);
      setSelectedTime(null);
      setBookingData({ nombre: usuario.nombre, edad: '', actividad: '' });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error creando reserva');
    }
  };

  /* ---------------------- NAVEGACIÓN CALENDARIO ---------------------- */
  const previousMonth = () => { setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)); resetSelection(); };
  const nextMonth = () => { setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)); resetSelection(); };
  const resetSelection = () => { setSelectedDate(null); setSelectedTime(null); setBookingData({ nombre: usuario?.nombre || '', edad: '', actividad: '' }); };

  const calendarDays = generateCalendarDays();
  const selectedDateString = selectedDate ? selectedDate.toISOString().split('T')[0] : '';
  const occupiedToday = selectedDate ? (occupiedSlots[selectedDateString] || []) : [];
  const isWorkingToday = selectedDate ? isWorkingDay(selectedDate) : false;

  const closeSuccessModal = () => { setShowSuccessModal(false); setConfirmedBooking(null); };
  const closeDateModal = () => { setShowDateModal(false); setSelectedTime(null); setBookingData({ nombre: usuario?.nombre || '', edad: '', actividad: '' }); };

  // Si no hay usuario
  if (!usuario) {
    return (
      <div className="calendar-container">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>Acceso restringido</h2>
          <p>Debes iniciar sesión para acceder al calendario de reservas.</p>
        </div>
      </div>
    );
  }

  /* ---------------------- RENDER ---------------------- */
  return (
    <div className="calendar-container">
      {/* Modal al seleccionar fecha */}
      {showDateModal && selectedDate && (
        <div className="modal-overlay" onClick={closeDateModal}>
          <div className="date-modal" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={closeDateModal}>×</button>
            <div className="modal-header">
              <h2>Reserva para {dayNamesFull[selectedDate.getDay()]}, {selectedDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</h2>
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
                        return (
                          <div key={slot.time} className={`time-slot ${isOccupied ? 'occupied' : ''} ${isSelected ? 'selected' : ''}`} onClick={!isOccupied ? () => selectTime(slot.time) : undefined}>
                            {slot.label} {isOccupied && <span className="occupied-label">Ocupado</span>}
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
                        return (
                          <div key={slot.time} className={`time-slot ${isOccupied ? 'occupied' : ''} ${isSelected ? 'selected' : ''}`} onClick={!isOccupied ? () => selectTime(slot.time) : undefined}>
                            {slot.label} {isOccupied && <span className="occupied-label">Ocupado</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {selectedTime && (
                    <div className="booking-form">
                      <h4>Información de la Reserva</h4>
                      <div className="form-group">
                        <label>Nombre:</label>
                        <input type="text" name="nombre" value={bookingData.nombre} onChange={handleInputChange} placeholder="Ingresa tu nombre completo" />
                      </div>
                      <div className="form-group">
                        <label>Edad:</label>
                        <input type="number" name="edad" value={bookingData.edad} onChange={handleInputChange} placeholder="Ingresa tu edad" min="1" max="120" />
                      </div>
                      <div className="form-group">
                        <label>Actividad:</label>
                        <select name="actividad" value={bookingData.actividad} onChange={handleInputChange}>
                          <option value="">Selecciona una actividad</option>
                          {actividades.map(act => <option key={act} value={act}>{act.charAt(0).toUpperCase() + act.slice(1)}</option>)}
                        </select>
                      </div>
                      <button className="modal-btn primary" onClick={confirmAppointment} disabled={!bookingData.nombre || !bookingData.edad || !bookingData.actividad}>
                        Confirmar Reserva
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="no-availability">
                  <h4>No hay disponibilidad</h4>
                  <p>Los lunes no hay horarios disponibles.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <TituloReserva />
      {/* Calendario */}
      <div className="calendar-section">
        <div className="calendar-header">
          <div className="month-navigation">
            <button className="nav-btn prev" onClick={previousMonth}>‹</button>
            <h2 className="month-year">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
            <button className="nav-btn next" onClick={nextMonth}>›</button>
          </div>
        </div>
        <div className="calendar-grid">
          <div className="day-headers">{dayNames.map(d => <div key={d} className="day-header">{d}</div>)}</div>
          <div className="days-grid">
            {calendarDays.map((day, i) => (
              <div key={i} className={`day-cell ${day.isOtherMonth ? 'other-month' : ''} ${day.isToday ? 'today' : ''} ${day.isUnavailable ? 'unavailable' : 'available'} ${day.isSelected ? 'selected' : ''}`} onClick={() => selectDate(day)}>
                <span className="day-number">{day.day}</span>
                {day.appointmentCount > 0 && !day.isOtherMonth && (
                  <div className="appointment-indicators">
                    {Array.from({ length: Math.min(day.appointmentCount, 3) }, (_, i) => <div key={i} className="appointment-dot" />)}
                    {day.appointmentCount > 3 && <span className="more-appointments">+{day.appointmentCount - 3}</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      {showSuccessModal && confirmedBooking && (
        <div className="modal-overlay" onClick={closeSuccessModal}>
          <div className="success-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <button className="close-btn2" onClick={closeSuccessModal}>×</button>
              <h2>¡Cita Confirmada!</h2>
            </div>
            <div className="modal-content">
              <div className="booking-details">
                <div className="detail-row"><div className="detail-info"><span className="detail-label">Nombre:</span> <span className="detail-value">{confirmedBooking.nombre}</span></div></div>
                <div className="detail-row"><div className="detail-info"><span className="detail-label">Edad:</span> <span className="detail-value">{confirmedBooking.edad} años</span></div></div>
                <div className="detail-row"><div className="detail-info"><span className="detail-label">Actividad:</span> <span className="detail-value">{confirmedBooking.actividad.charAt(0).toUpperCase() + confirmedBooking.actividad.slice(1)}</span></div></div>
                <div className="detail-row"><div className="detail-info"><span className="detail-label">Fecha:</span> <span className="detail-value">{confirmedBooking.fecha}</span></div></div>
                <div className="detail-row"><div className="detail-info"><span className="detail-label">Hora:</span> <span className="detail-value">{confirmedBooking.hora}</span></div></div>
              </div>
              <div className="success-message">
                <p>Tu cita ha sido reservada exitosamente. Te esperamos el <strong>{confirmedBooking.dayName}</strong> a las <strong>{confirmedBooking.hora}</strong>.</p>
                <p>¡Nos vemos pronto!</p>
              </div>
            </div>
            <div className="modal-actions">
              <button className="modal-btn primary" onClick={closeSuccessModal}>Aceptar</button>
            </div>
          </div>
        </div>
      )}

      <ReservaInfo />
    </div>
  );
};

export default MenuCalendario;