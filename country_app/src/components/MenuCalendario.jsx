import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { format } from 'date-fns';

// Componentes del calendario
import { WeeklyCalendar } from './calendario/weekly-calendar';
import { CalendarHeader } from './calendario/calendar-header';
import { BookingModal } from './calendario/booking-modal';

// Contexto
// import { BookingProvider, useBookings } from './calendario/lib/booking-context';
import { fetchUserBookings, createBooking, fetchWeekBookings, cancelBooking } from './calendario/booking-api';
import { fetchClasses } from './calendario/booking-classes-api';
import '../CSS/MenuCalendario.css'
import ReservacionTabla from './calendario/reservacion_tabla'
import ChangePasswordModal from './calendario/change-password-modal'

function CalendarContent({ userLevel, userId, userName, userType, onLogout, onChangePassword }) {
  const [userBookings, setUserBookings] = useState([]);
  const [allWeekBookings, setAllWeekBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    async function loadBookings() {
      setLoading(true);
      try {
        const data = await fetchUserBookings(userId);
        setUserBookings(data);
        
        // Cargar todas las reservas de la semana para calcular disponibilidad
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay() + 1); // Lunes
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6); // Domingo
        
        const fechaInicio = weekStart.toISOString().split('T')[0];
        const fechaFin = weekEnd.toISOString().split('T')[0];
        
        const weekData = await fetchWeekBookings(fechaInicio, fechaFin, userId);
        setAllWeekBookings(weekData);
      } catch (e) {
        toast.error('Error al cargar tus reservas');
      } finally {
        setLoading(false);
      }
    }
    loadBookings();
  }, [userId]);

  useEffect(() => {
    async function loadClasses() {
      try {
        const data = await fetchClasses();
        setClasses(data);
      } catch (e) {
        toast.error('Error al cargar clases');
      }
    }
    loadClasses();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    try {
      await cancelBooking(bookingId, userId);
      toast.info('Reserva cancelada', {
        position: "top-right",
        autoClose: 3000,
      });
      // Refresca reservas
      const data = await fetchUserBookings(userId);
      setUserBookings(data);
      // Refresca reservas de la semana
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay() + 1);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      const fechaInicio = weekStart.toISOString().split('T')[0];
      const fechaFin = weekEnd.toISOString().split('T')[0];
      const weekData = await fetchWeekBookings(fechaInicio, fechaFin, userId);
      setAllWeekBookings(weekData);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Error al cancelar reserva');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSlot(null);
  };

  // Mapeo de nivel a nombre de clase permitida
  const nivelToClase = {
    'iniciacion': ['iniciacion'],
    'intermedio': ['intermedio'],
    'avanzado': ['salto', 'intermedio', 'paseo'],
    'paseo': ['paseo'],
  };

  // Filtra clases según el nivel del usuario (normalizar a minúsculas)
  const userLevelNormalized = userLevel ? userLevel.toLowerCase() : '';
  const allowedClassNames = nivelToClase[userLevelNormalized] || [];
  const allowedClasses = classes.filter(clase => allowedClassNames.includes(clase.nombre));

  // Mantiene la clase seleccionada en el slot
  const [selectedClass, setSelectedClass] = useState(null);

  const handleSlotClick = (slot, clase) => {
    // Restricción para tipo demo: solo fines de semana
    if (userType === 'demo') {
      const dayOfWeek = slot.date ? slot.date.getDay() : -1;
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0 = domingo, 6 = sábado
        toast.warning('Los usuarios demo solo pueden reservar fines de semana', {
          position: "top-right",
          autoClose: 4000,
        });
        return;
      }
    }

    // Restricción para media_renta: máximo 3 reservas activas
    if (userType === 'media_renta') {
      const reservasActivas = userBookings.filter(b => 
        b.estatus === 'pendiente' || b.estatus === 'confirmada'
      ).length;
      if (reservasActivas >= 3) {
        toast.warning('Has alcanzado el límite de 3 reservas activas', {
          position: "top-right",
          autoClose: 4000,
        });
        return;
      }
    }

    setSelectedSlot(slot);
    setSelectedClass(clase);
    setIsModalOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedSlot || !selectedClass) return;
    
    // Extraer la fecha real del slot seleccionado
    const slotDate = selectedSlot.date; // Ya viene del WeeklyCalendar
    const fechaISO = slotDate ? format(slotDate, 'yyyy-MM-dd') : null;
    
    if (!fechaISO) {
      toast.error('Error al obtener la fecha del slot');
      closeModal();
      return;
    }
    
    const [day, time] = selectedSlot.id.split('-');
    try {
      await createBooking({
        cliente_id: userId,
        clase_id: selectedClass.id,
        fecha: fechaISO, // Fecha real calculada del slot
        hora_inicio: time + ':00',
      });
      toast.success(`Reserva confirmada para ${selectedSlot.day} a las ${selectedSlot.time}`, {
        position: "top-right",
        autoClose: 3000,
      });
      // Refresca reservas
      const data = await fetchUserBookings(userId);
      setUserBookings(data);
      
      // Refrescar también las reservas de la semana
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay() + 1);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      const fechaInicio = weekStart.toISOString().split('T')[0];
      const fechaFin = weekEnd.toISOString().split('T')[0];
      const weekData = await fetchWeekBookings(fechaInicio, fechaFin, userId);
      setAllWeekBookings(weekData);
    } catch (error) {
      // DEBUG: Ver qué está llegando
      console.log('=== ERROR CAPTURADO ===');
      console.log('error completo:', error);
      console.log('error.response:', error.response);
      console.log('error.response?.data:', error.response?.data);
      console.log('error.message:', error.message);
      console.log('======================');
      
      // Manejar errores del backend con mensajes descriptivos
      if (error.response && error.response.data) {
        const { error: errorMsg, razon } = error.response.data;
        
        // Si hay una razón específica, mostrarla
        if (razon) {
          toast.warning(`${errorMsg}: ${razon}`, {
            position: "top-right",
            autoClose: 5000,
          });
        } else {
          // Mostrar solo el mensaje de error
          toast.error(errorMsg || 'No se pudo crear la reserva', {
            position: "top-right",
            autoClose: 4000,
          });
        }
      } else {
        // Error genérico si no hay respuesta del servidor
        toast.error('No se pudo crear la reserva. Intenta de nuevo.', {
          position: "top-right",
          autoClose: 3000,
        });
      }
    }
    closeModal();
  };

  const handleCancel = () => {
    if (!selectedSlot) return;
    // Falta endpoint real de cancelación
    const booking = selectedSlot.bookings.find((b) => b.userId === userId);
    if (booking) {
      handleCancelBooking(booking.id);
    }
    closeModal();
  };

  // Determina si el usuario ya reservó ese slot (solo confirmada/pendiente)
  const isBookedByUser = selectedSlot
    ? userBookings.some(b => {
        // Excluir reservas canceladas o completadas
        if (b.estatus === 'cancelada' || b.estatus === 'completada') {
          return false;
        }
        // Para reservas dummy
        if (b.timeSlotId && typeof b.timeSlotId === 'string') {
          return b.timeSlotId === selectedSlot.id;
        }
        // Para reservas reales: comparar día, hora y clase
        if (b.fecha && b.hora_inicio && selectedSlot.day && selectedSlot.time) {
          const fechaObj = new Date(b.fecha);
          const diaSemana = fechaObj.toLocaleDateString('es-MX', { weekday: 'long' });
          const diaSemanaCap = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);
          return diaSemanaCap === selectedSlot.day && b.hora_inicio.slice(0,5) === selectedSlot.time;
        }
        return false;
      })
    : false;

  // Determina si el usuario ya tiene reserva ese día (solo confirmada/pendiente)
  // Excepto para propietario, renta y media_renta que pueden tener múltiples reservas por día
  // Para clientes tipo general: si tiene cualquier reserva pendiente o confirmada, deshabilitar todos los slots
  const hasBookingForDay = userType === 'general'
    ? userBookings.some(b => b.estatus === 'pendiente' || b.estatus === 'confirmada')
    : selectedSlot && userType !== 'propietario' && userType !== 'renta' && userType !== 'media_renta'
      ? userBookings.some(b => {
          if (b.estatus === 'cancelada' || b.estatus === 'completada') {
            return false;
          }
          if (b.timeSlotId && typeof b.timeSlotId === 'string') {
            return b.timeSlotId.split('-')[0] === selectedSlot.id.split('-')[0];
          }
          if (b.fecha && selectedSlot.date) {
            const fechaReserva = new Date(b.fecha).toISOString().split('T')[0];
            const fechaSlot = selectedSlot.date instanceof Date
              ? selectedSlot.date.toISOString().split('T')[0]
              : selectedSlot.date.split('T')[0];
            return fechaReserva === fechaSlot;
          }
          return false;
        })
      : false;

  // Simula la regla de 24h (debería venir del backend)
  const hasBookingWithin24h = false;

  return (
    <>
      <CalendarHeader
        clientName={userName}
        level={userLevel}
        onLogout={onLogout}
        onChangePassword={onChangePassword}
      />

      <div className="mc-container">
        <div className="mc-header">
          <h2 className="mc-title">Reserva tu clase</h2>
          <p className="mc-subtitle">Selecciona un horario disponible para reservar tu clase.</p>
          
          {/* Indicador visual de tipo de cliente */}
          {userType && userType !== 'general' && (
            <div style={{ 
              marginTop: 12, 
              padding: '10px 16px', 
              background: 
                userType === 'propietario' ? '#d4edda' :
                userType === 'renta' ? '#d1ecf1' :
                userType === 'media_renta' ? '#fff3cd' :
                userType === 'demo' ? '#f8d7da' : '#f5f1e8',
              borderRadius: 8, 
              border: `2px solid ${
                userType === 'propietario' ? '#28a745' :
                userType === 'renta' ? '#17a2b8' :
                userType === 'media_renta' ? '#ffc107' :
                userType === 'demo' ? '#dc3545' : '#d4c4b0'
              }`,
              display: 'inline-block'
            }}>
              <p style={{ margin: 0, fontSize: '0.95em', fontWeight: 600, color: '#333' }}>
                Tipo de cuenta: <span style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {userType === 'propietario' ? 'Propietario' :
                   userType === 'renta' ? 'Renta' :
                   userType === 'media_renta' ? 'Media Renta' :
                   userType === 'demo' ? 'Demo' : userType}
                </span>
              </p>
            </div>
          )}
          
          {/* Mostrar contador de reservas para media_renta */}
          {userType === 'media_renta' && (
            <div style={{ marginTop: 8, padding: '8px 16px', background: '#f5f1e8', borderRadius: 8, border: '1px solid #d4c4b0' }}>
              <p style={{ margin: 0, fontSize: '0.95em', color: '#6b4423' }}>
                <strong>Reservas activas:</strong> {userBookings.filter(b => b.estatus === 'pendiente' || b.estatus === 'confirmada').length} / 3
              </p>
            </div>
          )}
          {/* Mensaje informativo para demo */}
          {userType === 'demo' && (
            <div style={{ marginTop: 8, padding: '8px 16px', background: '#fff3cd', borderRadius: 8, border: '1px solid #ffc107' }}>
              <p style={{ margin: 0, fontSize: '0.95em', color: '#856404' }}>
                <strong>Usuario Demo:</strong> Solo puedes reservar clases los fines de semana.
              </p>
            </div>
          )}
        </div>
        {/* Panel lateral / sección con las reservas del usuario (componente separado) */}
        <ReservacionTabla userBookings={userBookings} onCancelBooking={handleCancelBooking} />
        {/* Renderiza una tarjeta de calendario por cada clase permitida */}
        {allowedClasses.map(clase => {
          return (
            <div key={clase.id} style={{ marginBottom: 32, border: '1px solid #ccc', borderRadius: 8, padding: 16 }}>
              <h3 style={{ marginBottom: 8 }}>
                {clase.nombre.charAt(0).toUpperCase() + clase.nombre.slice(1)} ({clase.duracion_min} min)
              </h3>
              <p style={{ marginBottom: 8, color: '#6b4423' }}>{clase.observaciones}</p>
              <WeeklyCalendar
                userLevel={userLevel}
                userId={userId}
                userType={userType}
                onSlotClick={slot => handleSlotClick(slot, clase)}
                userBookings={userBookings}
                allWeekBookings={allWeekBookings}
                className={clase.nombre}
                claseCupoMax={clase.cupo_max}
              />
            </div>
          );
        })}
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
  // Obtiene los datos reales del usuario desde localStorage
  const [userLevel] = useState(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsed = JSON.parse(user);
        // Ajusta la clave según cómo guardes el nivel en el objeto usuario
        return parsed.tipo_nivel || parsed.nivel || parsed.level || 'Intermedio';
      } catch {
        return 'Intermedio';
      }
    }
    return 'Intermedio';
  });
  const [userId] = useState(() => {
    // Ajusta la clave según cómo guardes el usuario en localStorage
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsed = JSON.parse(user);
        return parsed.id || parsed.userId || 1; // fallback a 1 si no existe
      } catch {
        return 1;
      }
    }
    return 1;
  });
  const [userName] = useState(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsed = JSON.parse(user);
        return parsed.nombre || parsed.name || 'Usuario';
      } catch {
        return 'Usuario';
      }
    }
    return 'Usuario';
  });
  const [userType] = useState(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsed = JSON.parse(user);
        return parsed.tipo_cliente || 'general'; // propietario, renta, media_renta, demo, general
      } catch {
        return 'general';
      }
    }
    return 'general';
  });
  const [isChangeOpen, setIsChangeOpen] = useState(false);

  const handleLogout = () => {
    console.log("Cerrando sesión...");
    // Limpiar datos de sesión
    localStorage.clear();
    sessionStorage.clear();
    // Redirigir al login
    window.location.href = "/login";
  };

  return (
    <div className="mc-root">
      <CalendarContent 
        userLevel={userLevel}
        userId={userId}
        userName={userName}
        userType={userType}
        onLogout={handleLogout}
        onChangePassword={() => setIsChangeOpen(true)}
      />
      <ChangePasswordModal isOpen={isChangeOpen} onClose={() => setIsChangeOpen(false)} />
      <ToastContainer />
    </div>
  );
}

export default MenuCalendario;