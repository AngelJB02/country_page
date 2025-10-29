import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Componentes del calendario
import { WeeklyCalendar } from './calendario/weekly-calendar';
import { CalendarHeader } from './calendario/calendar-header';
import { BookingModal } from './calendario/booking-modal';

// Contexto
import { BookingProvider, useBookings } from './calendario/lib/booking-context';

function CalendarContent({ userLevel, userId, userName, onLogout }) {
  const { bookings, addBooking, removeBooking, getUserBookingForDay } = useBookings();
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    
    addBooking({ 
      userId, 
      userName, 
      timeSlotId: selectedSlot.id 
    });
    
    toast.success(`Reserva confirmada para ${selectedSlot.day} a las ${selectedSlot.time}`, {
      position: "top-right",
      autoClose: 3000,
    });
    
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

  return (
    <>
      <CalendarHeader 
        clientName={userName}
        level={userLevel}
        onLogout={onLogout}
      />

      <div style={{ 
        maxWidth: "1280px", 
        margin: "0 auto", 
        padding: "32px 24px" 
      }}>
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
    <div style={{ 
      minHeight: "100vh", 
      backgroundColor: "#F5F1E8" 
    }}>
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