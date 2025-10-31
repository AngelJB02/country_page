import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Componentes del calendario
import { WeeklyCalendar } from './calendario/weekly-calendar';
import { CalendarHeader } from './calendario/calendar-header';
import { BookingModal } from './calendario/booking-modal';

// Contexto
import { BookingProvider, useBookings } from './calendario/lib/booking-context';
import '../CSS/MenuCalendario.css'
import ReservacionTabla from './calendario/reservacion_tabla'

function CalendarContent({ userLevel, userId, userName, onLogout }) {
  const { bookings, addBooking, removeBooking, getUserBookingForDay } = useBookings();
  const { hasBookingWithinHours } = useBookings();
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Reservas del usuario actual
  const userBookings = bookings.filter(b => b.userId === userId);

  const handleCancelBooking = (bookingId) => {
    removeBooking(bookingId);
    toast.info('Reserva cancelada', {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const handleSlotClick = (slot) => {
    setSelectedSlot(slot);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSlot(null);
  };

  const handleConfirm = () => {
    if (!selectedSlot) return;
    // Try to add booking; addBooking returns false if blocked by 24h rule
    const result = addBooking({
      userId,
      userName,
      timeSlotId: selectedSlot.id,
    });

    if (result === false) {
      toast.error('No puedes reservar: tienes una reserva en las últimas 24 horas.', {
        position: 'top-right',
        autoClose: 4000,
      });
    } else {
      toast.success(`Reserva confirmada para ${selectedSlot.day} a las ${selectedSlot.time}`, {
        position: "top-right",
        autoClose: 3000,
      });
    }

    closeModal();
  };

  const handleCancel = () => {
    if (!selectedSlot) return;
    
    const booking = selectedSlot.bookings.find((b) => b.userId === userId);
    if (booking) {
      removeBooking(booking.id);
      toast.info('Reserva cancelada', {
        position: "top-right",
        autoClose: 3000,
      });
    }
    
    closeModal();
  };

  const isBookedByUser = selectedSlot 
    ? selectedSlot.bookings.some(b => b.userId === userId) 
    : false;
    
  const hasBookingForDay = selectedSlot 
    ? Boolean(getUserBookingForDay(userId, selectedSlot.day)) 
    : false;

  const hasBookingWithin24h = selectedSlot ? hasBookingWithinHours(userId, 24) : hasBookingWithinHours(userId, 24);

  return (
    <>
      <CalendarHeader 
        clientName={userName}
        level={userLevel}
        onLogout={onLogout}
      />

      <div className="mc-container">
        <div className="mc-header">
          <h2 className="mc-title">Reserva tu clase</h2>
          <p className="mc-subtitle">Selecciona un horario disponible para reservar tu clase.</p>
        </div>
        {/* Panel lateral / sección con las reservas del usuario (componente separado) */}
        <ReservacionTabla userBookings={userBookings} onCancelBooking={handleCancelBooking} />
        <WeeklyCalendar
          userLevel={userLevel}
          userId={userId}
          onSlotClick={handleSlotClick}
        />
      </div>

      <BookingModal
        slot={selectedSlot}
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        isBookedByUser={isBookedByUser}
        hasBookingForDay={hasBookingForDay}
        hasBookingWithin24h={hasBookingWithin24h}
        userName={userName}
      />
    </>
  );
}

function MenuCalendario() {
  // Estado del usuario (esto vendría de tu sistema de autenticación)
  const [userLevel, setUserLevel] = useState("Intermedio");
  const [userId] = useState("user123");
  const [userName] = useState("María García");

  const handleLogout = () => {
    // Aquí iría tu lógica de logout con axios
    console.log("Cerrando sesión...");
    // Ejemplo: axios.post('/api/logout').then(...)
  };

  return (
    <div className="mc-root">
      <BookingProvider>
        <CalendarContent 
          userLevel={userLevel}
          userId={userId}
          userName={userName}
          onLogout={handleLogout}
        />
      </BookingProvider>

      <ToastContainer />
    </div>
  );
}

export default MenuCalendario;