import React, { useState, useEffect } from 'react';
import '../CSS/MenuCalendario.css';
import '../CSS/DisponibilidadCaballos.css';
import ReservaInfo from "./ReservaInfo";
import TituloReserva from './TituloReserva';
import DisponibilidadCaballos from './DisponibilidadCaballos';
import { useReservas } from "../hooks/useReservas";

const MenuCalendario = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 8, 1));
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [bookingData, setBookingData] = useState({ nombre: '', edad: '', actividad: '' });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [showDateModal, setShowDateModal] = useState(false);

  const { availability, getAvailability, createReserva, loading, error } = useReservas();

  const timeSlots = {
    morning: [
      { time: '09:00', label: '9:00 AM' },
      { time: '10:00', label: '10:00 AM' },
      { time: '11:00', label: '11:00 AM' }
    ],
    afternoon: [
      { time: '14:00', label: '2:00 PM' },
      { time: '15:00', label: '3:00 PM' },
      { time: '16:00', label: '4:00 PM' }
    ]
  };

  const actividades = ['iniciacion', 'paseo', 'salto'];

  // Traer disponibilidad al seleccionar fecha
  useEffect(() => {
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split("T")[0];
      getAvailability(dateString);
    }
  }, [selectedDate]);

  // Obtener disponibilidad de un horario
  const getSpotAvailability = (timeSlot, dateString, actividad = null) => {
    const dayAvailability = availability[dateString] || {};
    if (actividad === "salto") return dayAvailability.salto || { total: 5, available: 5 };
    return dayAvailability[timeSlot] || { total: 0, available: 0 };
  };

  const isWorkingDay = (date) => {
    const day = date.getDay();
    return day >= 2 || day === 0; // Martes a Domingo
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - (startDate.getDay() === 0 ? 0 : startDate.getDay()));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = [];
    for (let i = 0; i < 42; i++) {
      const cellDate = new Date(startDate);
      cellDate.setDate(startDate.getDate() + i);
      if (cellDate.getDay() === 1) continue; // lunes cerrado

      const isOtherMonth = cellDate.getMonth() !== month;
      const isToday = cellDate.toDateString() === today.toDateString();
      const isUnavailable = isOtherMonth || cellDate < today || !isWorkingDay(cellDate);
      const isSelected = selectedDate && cellDate.toDateString() === selectedDate.toDateString();

      const dateString = cellDate.toISOString().split('T')[0];
      const appointmentCount = availability[dateString]
        ? Object.values(availability[dateString]).reduce((acc, slot) => acc + (slot.total - slot.available), 0)
        : 0;

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
    }
    return days;
  };

  const selectDate = (day) => {
    if (day.isUnavailable || day.isOtherMonth) return;
    setSelectedDate(day.date);
    setSelectedTime(null);
    setBookingData({ nombre: '', edad: '', actividad: '' });
    setShowDateModal(true);
  };

  const confirmAppointment = async () => {
    if (!selectedDate || !selectedTime || !bookingData.nombre || !bookingData.edad || !bookingData.actividad) {
      alert('Por favor completa todos los campos');
      return;
    }

    const dateString = selectedDate.toISOString().split("T")[0];
    const spotAvailability = getSpotAvailability(selectedTime, dateString, bookingData.actividad);

    if (spotAvailability.available <= 0) {
      alert('No hay lugares disponibles para este horario');
      return;
    }

    const newReserva = await createReserva({
      nombre: bookingData.nombre,
      edad: bookingData.edad,
      actividad: bookingData.actividad,
      fecha: dateString,
      horario: selectedTime,
    });

    if (newReserva) {
      const dayName = selectedDate.toLocaleDateString("es-ES", { weekday: "long" });
      const formattedDate = new Date(newReserva.fecha).toLocaleDateString("es-ES");
      setConfirmedBooking({
        ...newReserva,
        fecha: formattedDate,
        hora: newReserva.horario,
        dayName
      });
      setShowSuccessModal(true);
      setShowDateModal(false);
    }
  };

  const previousMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  const calendarDays = generateCalendarDays();
  const selectedDateString = selectedDate ? selectedDate.toISOString().split('T')[0] : '';
  const currentSpotAvailability = selectedTime && selectedDate
    ? getSpotAvailability(selectedTime, selectedDateString, bookingData.actividad)
    : { total: 0, available: 0 };

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
      <TituloReserva />

      <div className="calendar-section">
        <div className="calendar-header">
          <div className="month-navigation">
            <button className="nav-btn prev" onClick={previousMonth}>‹</button>
            <h2 className="month-year">{currentDate.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}</h2>
            <button className="nav-btn next" onClick={nextMonth}>›</button>
          </div>
        </div>

        <div className="calendar-grid">
          <div className="day-headers">
            {["Dom", "Mar", "Mié", "Jue", "Vie", "Sáb"].map(day => (
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
                    {Array.from({ length: Math.min(day.appointmentCount, 3) }, (_, i) => <div key={i} className="appointment-dot" />)}
                    {day.appointmentCount > 3 && <span className="more-appointments">+{day.appointmentCount - 3}</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showDateModal && selectedDate && (
        <div className="modal-overlay" onClick={closeDateModal}>
          <div className="date-modal" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={closeDateModal}>×</button>
            <div className="modal-header">
              <h2>
                Reserva para {selectedDate.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </h2>
            </div>
            <div className="modal-content">
              {isWorkingDay(selectedDate) ? (
                <>
                  <h4>Horarios Disponibles</h4>
                  {["morning", "afternoon"].map(period => (
                    <div key={period} className="time-period">
                      <h5>{period === "morning" ? "Matutino" : "Vespertino"}</h5>
                      <div className="time-slots-grid">
                        {timeSlots[period].map(slot => {
                          const spotInfo = getSpotAvailability(slot.time, selectedDateString, bookingData.actividad);
                          const hasAvailableSpots = spotInfo.available > 0;
                          const isSelected = selectedTime === slot.time;

                          return (
                            <div
                              key={slot.time}
                              className={`time-slot ${!hasAvailableSpots ? 'occupied' : ''} ${isSelected ? 'selected' : ''}`}
                              onClick={hasAvailableSpots ? () => setSelectedTime(slot.time) : undefined}
                            >
                              <div className="time-label">{slot.label}</div>
                              <div className="spots-info">{spotInfo.available}/{spotInfo.total} lugares</div>
                              {!hasAvailableSpots && <span className="occupied-label">Sin lugares</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  <DisponibilidadCaballos
                    totalSpots={currentSpotAvailability.total}
                    availableSpots={currentSpotAvailability.available}
                    selectedTime={selectedTime}
                  />

                  {selectedTime && (
                    <div className="booking-form">
                      <h4>Información de la Reserva</h4>
                      <div className="form-group">
                        <label>Nombre:</label>
                        <input type="text" value={bookingData.nombre} onChange={e => setBookingData({...bookingData, nombre: e.target.value})} placeholder="Nombre completo" />
                      </div>
                      <div className="form-group">
                        <label>Edad:</label>
                        <input type="number" value={bookingData.edad} onChange={e => setBookingData({...bookingData, edad: e.target.value})} min="1" max="120" placeholder="Edad" />
                      </div>
                      <div className="form-group">
                        <label>Actividad:</label>
                        <select value={bookingData.actividad} onChange={e => setBookingData({...bookingData, actividad: e.target.value})}>
                          <option value="">Selecciona</option>
                          {actividades.map(act => <option key={act} value={act}>{act.charAt(0).toUpperCase() + act.slice(1)}</option>)}
                        </select>
                      </div>
                      <button
                        className="modal-btn primary"
                        onClick={confirmAppointment}
                        disabled={!bookingData.nombre || !bookingData.edad || !bookingData.actividad || currentSpotAvailability.available <= 0 || loading}
                      >
                        {loading ? "Guardando..." : "Confirmar Reserva"}
                      </button>
                      {error && <p className="error-text">{error}</p>}
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

      {showSuccessModal && confirmedBooking && (
        <div className="modal-overlay" onClick={closeSuccessModal}>
          <div className="success-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <button className="close-btn2" onClick={closeSuccessModal}>×</button>
              <h2>¡Cita Confirmada!</h2>
            </div>
            <div className="modal-content">
              <div className="booking-details">
                <p><strong>Nombre:</strong> {confirmedBooking.nombre}</p>
                <p><strong>Edad:</strong> {confirmedBooking.edad}</p>
                <p><strong>Actividad:</strong> {confirmedBooking.actividad}</p>
                <p><strong>Fecha:</strong> {confirmedBooking.fecha}</p>
                <p><strong>Hora:</strong> {confirmedBooking.hora}</p>
              </div>
              <p className="success-message">Tu cita ha sido reservada exitosamente. Te esperamos el <strong>{confirmedBooking.dayName}</strong>.</p>
            </div>
            <div className="modal-actions">
              <button className="modal-btn primary" onClick={closeSuccessModal}>Aceptar</button>
            </div>
          </div>
        </div>
      )}

      <ReservaInfo reserva={confirmedBooking} />
    </div>
  );
};

export default MenuCalendario;
