import React, { useState, useEffect } from 'react';
import '../CSS/MenuCalendario.css';
import '../CSS/DisponibilidadCaballos.css';
import TituloReserva from './TituloReserva';
import DisponibilidadCaballos from './DisponibilidadCaballos';
import LogoutButton from './LogoutBoton';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReservasInfo from "./ReservaInfo";
import useRoleGuard from '../hooks/useRoleGuard';

const MenuCalendario = () => {
  useRoleGuard(['cliente', 'administrador']);

  // Función helper para crear fechas en zona horaria de México
  const createMexicoDate = (year, month, day) => {
    // Crear fecha en hora local de México usando Date.UTC y ajustando offset
    const date = new Date(year, month, day);
    // Asegurarse de que la hora sea mediodía para evitar cambios de día
    date.setHours(12, 0, 0, 0);
    return date;
  };

  // Función para obtener la fecha de hoy en México
  const getTodayMexico = () => {
    const now = new Date();
    // Crear fecha a las 12:00 PM para evitar problemas
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0);
    return today;
  };

  // Función para formatear fecha como YYYY-MM-DD
  const formatDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Función para comparar si dos fechas son el mismo día
  const isSameDay = (date1, date2) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const [currentDate, setCurrentDate] = useState(getTodayMexico());
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

  // Estado para cambio de contraseña
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  // Estados para mostrar/ocultar contraseñas
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estado para reservas y disponibilidad
  const [reservations, setReservations] = useState({});
  const [availability, setAvailability] = useState({});
  const [loading, setLoading] = useState(false);

  // Estado para usuario logueado
  const [currentUser, setCurrentUser] = useState(null);
  const [userEmail, setUserEmail] = useState('');

  // Estado para horarios del día cargados dinámicamente
  const [horariosDia, setHorariosDia] = useState([]);

  // Mapeo de actividades del frontend al backend
  const activityClassMap = {
    'iniciacion': 1,
    'caminata': 2,
    'salto': 3
  };

  // Nombres de meses y días
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const dayNamesFull = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  const actividades = ['iniciacion', 'caminata', 'salto'];

  // Obtener usuario real del localStorage al montar el componente
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }
  }, []);

  // Cargar reservas existentes al montar el componente y cambiar mes
  useEffect(() => {
    fetchReservationsForMonth();
  }, [currentDate]);

  // Cargar disponibilidad cuando se selecciona una fecha
  useEffect(() => {
    if (selectedDate && bookingData.actividad) {
      const diasSemana = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'];
      
      let diasValidos;
      if (currentUser && currentUser.nombre && currentUser.nombre.toLowerCase() === 'demo') {
        diasValidos = ['viernes','domingo'];
      } else {
        diasValidos = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'];
      }
      
      const diaSemana = diasSemana[selectedDate.getDay()];
      if (diasValidos.includes(diaSemana)) {
        fetchHorariosDia(diaSemana);
        fetchAvailability(formatDateString(selectedDate));
      } else {
        setHorariosDia([]);
      }
    } else if (selectedDate && !bookingData.actividad) {
      setHorariosDia([]);
    }
  }, [selectedDate, bookingData.actividad, currentUser]);

  // Cerrar modal con tecla ESC
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        if (showDateModal) closeDateModal();
        if (showSuccessModal) closeSuccessModal();
        if (showReservationsModal) closeReservationsModal();
        if (showPasswordModal) closePasswordModal();
      }
    };
    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [showDateModal, showSuccessModal, showReservationsModal, showPasswordModal]);

  // Función para obtener reservas del mes actual
  const fetchReservationsForMonth = async () => {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0);
      const endDate = formatDateString(lastDay);

      const response = await axios.get('https://country-page.onrender.com/api/reservas', {
        params: { 
          fecha_inicio: startDate, 
          fecha_fin: endDate 
        },
        timeout: 10000
      });

      const reservasPorFecha = {};
      response.data.forEach(reserva => {
        let fechaKey = reserva.fecha;
        if (typeof fechaKey === 'string' && fechaKey.includes('T')) {
          fechaKey = fechaKey.split('T')[0];
        } else if (typeof fechaKey === 'string' && fechaKey.length >= 10) {
          fechaKey = fechaKey.substring(0, 10);
        }
        
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
      
      if (error.code === 'ECONNABORTED') {
        toast.error('La conexión tardó demasiado. Intenta de nuevo.');
      } else if (error.response?.status === 503) {
        toast.error('Problema temporal con el servidor. Reintentando en unos segundos...');
        setTimeout(() => {
          fetchReservationsForMonth();
        }, 3000);
      } else if (error.response) {
        toast.error(error.response.data.error || 'Error al cargar las reservas del servidor');
      } else if (error.request) {
        toast.error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
      } else {
        toast.error('Error inesperado al cargar las reservas');
      }
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener disponibilidad de una fecha específica
  const fetchAvailability = async (dateString) => {
    try {
      const response = await axios.get('https://country-page.onrender.com/api/reservas/availability', {
        params: { fecha: dateString },
        timeout: 8000
      });
      
      setAvailability(prev => ({
        ...prev,
        [dateString]: response.data
      }));

    } catch (error) {
      console.error('Error cargando disponibilidad:', error);
      
      if (error.response?.status === 503) {
        const dayReservations = reservations[dateString] || [];
        const fallbackAvailability = calculateFallbackAvailability(dayReservations);
        
        setAvailability(prev => ({
          ...prev,
          [dateString]: fallbackAvailability
        }));
        
        setTimeout(() => {
          fetchAvailability(dateString);
        }, 2000);
      } else {
        const dayReservations = reservations[dateString] || [];
        const fallbackAvailability = calculateFallbackAvailability(dayReservations);
        
        setAvailability(prev => ({
          ...prev,
          [dateString]: fallbackAvailability
        }));
      }
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

  // Verificar si el usuario actual ya tiene una reserva en una fecha específica
  const userHasReservationOnDate = (userId, dateString) => {
    if (!userId) return false;
    const dayReservations = reservations[dateString] || [];
    return dayReservations.some(reservation => 
      reservation.usuario_id === userId &&
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
      const timeReservations = dayReservations.filter(res => 
        res.time === timeSlot && res.estado === 'confirmada' && res.actividad !== 'salto'
      );
      return {
        total: spotData.total,
        available: spotData.available,
        reservations: timeReservations
      };
    }

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

  // Verificar si es día laboral
  const isWorkingDay = (date) => {
    const dayOfWeek = date.getDay();
    
    if (currentUser && currentUser.nombre && currentUser.nombre.toLowerCase() === 'demo') {
      return dayOfWeek === 5 || dayOfWeek === 0;
    }
    
    return true;
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
      totalCapacity = 36;
    }
    
    if (totalCapacity === 0) return 'empty';
    
    const occupancyRate = totalOccupied / totalCapacity;
    
    if (occupancyRate >= 0.9) return 'full';
    if (occupancyRate >= 0.6) return 'busy';
    if (occupancyRate > 0) return 'available';
    return 'empty';
  };

  // Generar días del calendario - VERSIÓN CORREGIDA FINAL
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Primer día del mes a las 12:00
    const firstDayDate = new Date(year, month, 1, 12, 0, 0, 0);
    const firstDayOfWeek = firstDayDate.getDay(); // 0=Domingo, 1=Lunes, etc.
    
    // Último día del mes
    const lastDay = new Date(year, month + 1, 0).getDate();
    
    // Fecha de hoy
    const nowDate = new Date();
    const today = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate(), 12, 0, 0, 0);
    
    console.log('=== DEBUG CALENDARIO ===');
    console.log('Mes actual:', monthNames[month], year);
    console.log('Primer día:', firstDayDate.getDate(), dayNamesFull[firstDayOfWeek]);
    console.log('Último día del mes:', lastDay);
    console.log('Hoy:', today.getDate(), monthNames[today.getMonth()]);
    console.log('========================');
    
    const days = [];
    
    // Días del mes anterior (para completar la primera semana)
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevMonthYear = month === 0 ? year - 1 : year;
    const prevMonthLastDay = new Date(prevMonthYear, prevMonth + 1, 0).getDate();
    
    // Agregar días del mes anterior
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const cellDate = new Date(prevMonthYear, prevMonth, day, 12, 0, 0, 0);
      
      const isPast = cellDate < today;
      
      days.push({
        date: cellDate,
        day: day,
        isOtherMonth: true,
        isToday: false,
        isUnavailable: true,
        isSelected: false,
        appointmentCount: 0,
        dateString: formatDateString(cellDate),
        dayStatus: 'empty'
      });
    }
    
    // Agregar días del mes actual
    for (let day = 1; day <= lastDay; day++) {
      const cellDate = new Date(year, month, day, 12, 0, 0, 0);
      
      const isToday = cellDate.getFullYear() === today.getFullYear() &&
                      cellDate.getMonth() === today.getMonth() &&
                      cellDate.getDate() === today.getDate();
      
      const isWorkingDayForUser = isWorkingDay(cellDate);
      const isPast = cellDate < today && !isToday;
      const isUnavailable = isPast || !isWorkingDayForUser;
      
      const isSelected = selectedDate && 
                        cellDate.getFullYear() === selectedDate.getFullYear() &&
                        cellDate.getMonth() === selectedDate.getMonth() &&
                        cellDate.getDate() === selectedDate.getDate();
      
      const dateString = formatDateString(cellDate);
      const dayReservations = reservations[dateString] || [];
      const appointmentCount = dayReservations.filter(res => res.estado !== 'cancelada').length;
      const dayStatus = getDayStatus(dateString);

      days.push({
        date: cellDate,
        day: day,
        isOtherMonth: false,
        isToday,
        isUnavailable,
        isSelected,
        appointmentCount,
        dateString,
        dayStatus
      });
    }
    
    // Agregar días del mes siguiente (para completar las 6 semanas = 42 días)
    const remainingDays = 42 - days.length;
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextMonthYear = month === 11 ? year + 1 : year;
    
    for (let day = 1; day <= remainingDays; day++) {
      const cellDate = new Date(nextMonthYear, nextMonth, day, 12, 0, 0, 0);
      
      days.push({
        date: cellDate,
        day: day,
        isOtherMonth: true,
        isToday: false,
        isUnavailable: true,
        isSelected: false,
        appointmentCount: 0,
        dateString: formatDateString(cellDate),
        dayStatus: 'empty'
      });
    }

    return days;
  };

  // Seleccionar fecha (muestra modal)
  const selectDate = (day) => {
    if (day.isUnavailable || day.isOtherMonth) return;
    
    const normalizedDate = createMexicoDate(day.date.getFullYear(), day.date.getMonth(), day.date.getDate());
    setSelectedDate(normalizedDate);
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

    if (name === 'actividad') {
      setSelectedTime(null);
    }
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
        await fetchAvailability(formatDateString(selectedDate));
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

    const normalizedDate = createMexicoDate(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    const dateString = formatDateString(normalizedDate);
    const spotAvailability = getSpotAvailability(selectedTime, dateString);
    
    if (spotAvailability.available <= 0) {
      toast.error('No hay lugares disponibles para este horario');
      return;
    }

    if (currentUser.nombre && currentUser.nombre.toLowerCase() === 'demo') {
      const dayOfWeek = normalizedDate.getDay();
      if (dayOfWeek !== 5 && dayOfWeek !== 0) {
        toast.error('Como usuario Demo, solo puedes reservar los viernes y domingos.');
        return;
      }
    }

    if (userHasReservationOnDate(currentUser.id, dateString)) {
      toast.error('Ya tienes una reserva para este día. Solo se permite una reserva por día por usuario.');
      return;
    }

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

      await Promise.all([
        fetchReservationsForMonth(),
        fetchAvailability(dateString)
      ]);

      const monthNamesLower = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
      const dayNamesLower = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
      
      const formattedDate = `${normalizedDate.getDate()} de ${monthNamesLower[normalizedDate.getMonth()]} de ${normalizedDate.getFullYear()}`;
      const dayName = dayNamesLower[normalizedDate.getDay()];

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
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
    resetSelection();
  };

  const nextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
    resetSelection();
  };

  const resetSelection = () => {
    setSelectedDate(null);
    setSelectedTime(null);
    setBookingData({ nombre: '', edad: '', actividad: '' });
  };

  const calendarDays = generateCalendarDays();
  const selectedDateString = selectedDate ? formatDateString(selectedDate) : '';
  const dayReservations = selectedDate ? (reservations[selectedDateString] || []) : [];
  const isWorkingToday = selectedDate ? isWorkingDay(selectedDate) : false;

  const currentSpotAvailability = selectedTime && selectedDate ? 
    getSpotAvailability(selectedTime, selectedDateString) : 
    { total: 0, available: 0 };

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

  const showReservations = () => {
    setShowReservationsModal(true);
  };

  const closeReservationsModal = () => {
    setShowReservationsModal(false);
  };

  // Funciones para cambio de contraseña
  const openPasswordModal = async () => {
    setShowPasswordModal(true);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordErrors({});
    
    if (currentUser && currentUser.id) {
      try {
        const response = await axios.get(`https://country-page.onrender.com/api/users/${currentUser.id}`);
        setUserEmail(response.data.email || '');
      } catch (error) {
        console.error('Error obteniendo email del usuario:', error);
        setUserEmail('');
      }
    }
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordErrors({});
    setPasswordLoading(false);
    setUserEmail('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'La contraseña actual es requerida';
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'La nueva contraseña es requerida';
    } else if (passwordData.newPassword.length < 5) {
      errors.newPassword = 'La nueva contraseña debe tener al menos 5 caracteres';
    }
    
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Debe confirmar la nueva contraseña';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    return errors;
  };

  const handlePasswordSubmit = async () => {
    const errors = validatePasswordForm();
    setPasswordErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return;
    }
    
    setPasswordLoading(true);
    
    try {
      const response = await axios.post('https://country-page.onrender.com/api/users/change-password', {
        userId: currentUser.id,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.data.emailSent) {
        toast.success('Contraseña actualizada exitosamente y credenciales enviadas por email');
      } else if (response.data.emailInfo) {
        toast.success(`Contraseña actualizada exitosamente. ${response.data.emailInfo}`);
      } else if (response.data.emailError) {
        toast.warning(`Contraseña actualizada exitosamente pero ${response.data.emailError.toLowerCase()}`);
      } else {
        toast.success('Contraseña actualizada exitosamente');
      }
      
      closePasswordModal();
      
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      const errorMessage = error.response?.data?.error || 'Error al cambiar la contraseña';
      toast.error(errorMessage);
      
      if (error.response?.status === 401) {
        setPasswordErrors({ currentPassword: 'La contraseña actual es incorrecta' });
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  // Función para obtener horarios disponibles según el día de la semana dinámicamente
  const fetchHorariosDia = async (diaSemana) => {
    try {
      if (currentUser && currentUser.nombre && currentUser.nombre.toLowerCase() === 'demo') {
        let horariosDemo = [];
        
        if (diaSemana === 'viernes') {
          horariosDemo = [
            { id: 'demo_v1', hora: '15:30:00', turno: 'tarde', dia_semana: 'viernes' },
            { id: 'demo_v2', hora: '16:00:00', turno: 'tarde', dia_semana: 'viernes' },
            { id: 'demo_v3', hora: '16:30:00', turno: 'tarde', dia_semana: 'viernes' }
          ];
        } else if (diaSemana === 'domingo') {
          horariosDemo = [
            { id: 'demo_d1', hora: '08:00:00', turno: 'mañana', dia_semana: 'domingo' },
            { id: 'demo_d2', hora: '08:30:00', turno: 'mañana', dia_semana: 'domingo' },
            { id: 'demo_d3', hora: '09:00:00', turno: 'mañana', dia_semana: 'domingo' },
            { id: 'demo_d4', hora: '09:30:00', turno: 'mañana', dia_semana: 'domingo' },
            { id: 'demo_d5', hora: '10:00:00', turno: 'mañana', dia_semana: 'domingo' },
            { id: 'demo_d6', hora: '10:30:00', turno: 'mañana', dia_semana: 'domingo' }
          ];
        }
        
        setHorariosDia(horariosDemo);
        return;
      }
      
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
      case 'confirmada': return '#28a745';
      case 'pendiente': return '#ffc107';
      case 'cancelada': return '#dc3545';
      default: return '#6c757d';
    }
  };
  return (
    
    <div className="calendar-container">

       {/* Título de la sección */}
      <TituloReserva />

      {/* Botones de usuario */}
      <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10, display: 'flex', gap: '10px', alignItems: 'center' }}>
        {currentUser && (
          <>
            <button 
              onClick={openPasswordModal}
              style={{
                background: 'var(--cream-overlay)',
                border: '2px solid rgba(255,255,255,0.3)',
                color: 'var(--primary-brown)',
                padding: '0.6rem 1.2rem',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--medium-shadow)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                fontFamily: 'var(--font-primary)'
              }}
              title="Cambiar contraseña"
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.6)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'var(--cream-overlay)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
        
              <span>Cambiar contraseña</span>
            </button>
            <LogoutButton 
              userName={currentUser.nombre || 'Usuario'} 
              showUserName={true}
            />
          </>
        )}
      </div>

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
        <div className="loading-overlay" role="status" aria-busy="true">
          <span className="sr-only">Cargando…</span>
          <div className="spinner spinner-dual-ring md"></div>
        </div>
      )}

      {/* Modal de reservas del día */}
      {showReservationsModal && selectedDate && (
        <div className="modal-overlay" onClick={closeReservationsModal}>
          <div className="reservations-modal" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={closeReservationsModal} aria-label="Cerrar modal">×</button>
            <div className="modal-header">
              <h2>Reservas del {`${dayNamesFull[selectedDate.getDay()]}, ${selectedDate.getDate()} de ${monthNames[selectedDate.getMonth()]} de ${selectedDate.getFullYear()}`}</h2>
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
              <h2>Reserva para {`${dayNamesFull[selectedDate.getDay()]}, ${selectedDate.getDate()} de ${monthNames[selectedDate.getMonth()]} de ${selectedDate.getFullYear()}`}</h2>
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
                      {!bookingData.actividad ? (
                        <div className="activity-hint" role="status" aria-live="polite">
                          <span className="activity-hint__icon" aria-hidden="true">⚠️</span>
                          Selecciona primero la actividad para cargar los horarios.
                        </div>
                      ) : horariosDia.length === 0 ? (
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

                  <DisponibilidadCaballos
                    totalSpots={11}
                    reservations={currentSpotAvailability.reservations ? currentSpotAvailability.reservations.filter(res => res.estado === 'confirmada') : []}
                    selectedTime={selectedTime}
                    selectedDate={selectedDate}
                  />

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
                          !selectedTime ||
                          !bookingData.nombre || 
                          !bookingData.edad || 
                          !bookingData.actividad || 
                          currentSpotAvailability.available <= 0 ||
                          userHasReservationOnDate(currentUser.id, selectedDateString) ||
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
                  {currentUser && currentUser.nombre && currentUser.nombre.toLowerCase() === 'demo' ? (
                    <>
                      <p>Como usuario Demo, solo puedes reservar viernes y domingos.</p>
                      <p>Horario Demo: <strong>Viernes y Domingo</strong></p>
                    </>
                  ) : (
                    <>
                      <p>Este día no tiene disponibilidad.</p>
                      <p>Horario laboral: <strong>Todos los días</strong></p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Sección del Calendario */}
      <div className="calendar-section">
        <div className="calendar-header">
          <div className="month-navigation">
            <button className="nav-btn prev" onClick={previousMonth} aria-label="Mes anterior">‹</button>
            <h2 className="month-year">
              {`${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
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
              </div>
              <div className="success-message">
                <p>Tu cita ha sido reservada exitosamente. Te esperamos el <strong>{confirmedBooking.fecha}</strong> a las <strong>{confirmedBooking.hora}</strong>.</p>
                <p>¡Nos vemos pronto!</p>
              </div>
              <div className="modal-actions">
                <button className="modal-btn primary" onClick={closeSuccessModal}>
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de cambio de contraseña */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={closePasswordModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closePasswordModal} aria-label="Cerrar modal">×</button>
            <h2>Cambiar contraseña</h2>
            
            {currentUser && (
              <div style={{ 
                backgroundColor: '#e3f2fd', 
                border: '1px solid #2196f3', 
                borderRadius: '6px', 
                padding: '12px 16px', 
                margin: '0 20px 20px 20px',
                fontSize: '14px',
                color: '#1565c0'
              }}>
                <strong>Información:</strong> Las credenciales actualizadas se enviarán automáticamente al siguiente correo:
                <div style={{ marginTop: '8px', fontWeight: '500', fontSize: '15px' }}>
                  {userEmail ? userEmail : 'Cargando correo...'}
                </div>
              </div>
            )}
            
            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Contraseña actual:
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Ingresa tu contraseña actual"
                    style={{
                      width: '100%',
                      padding: window.innerWidth <= 768 ? '12px 52px 12px 12px' : '10px 48px 10px 10px',
                      border: passwordErrors.currentPassword ? '2px solid #ff4444' : '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: window.innerWidth <= 768 ? '16px' : '16px',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: showCurrentPassword ? '#e9ecef' : '#f8f9fa',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: window.innerWidth <= 768 ? '10px' : '12px',
                      color: '#495057',
                      fontWeight: '500',
                      padding: window.innerWidth <= 768 ? '6px 8px' : '4px 6px',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      minHeight: window.innerWidth <= 768 ? '36px' : '30px',
                      minWidth: window.innerWidth <= 768 ? '40px' : '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    tabIndex={-1}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#dee2e6';
                      e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = showCurrentPassword ? '#e9ecef' : '#f8f9fa';
                      e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
                    }}
                  >
                    {showCurrentPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <div style={{ color: '#ff4444', fontSize: '14px', marginTop: '5px' }}>
                    {passwordErrors.currentPassword}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Nueva contraseña:
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Mínimo 5 caracteres"
                    style={{
                      width: '100%',
                      padding: window.innerWidth <= 768 ? '12px 52px 12px 12px' : '10px 48px 10px 10px',
                      border: passwordErrors.newPassword ? '2px solid #ff4444' : '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: window.innerWidth <= 768 ? '16px' : '16px',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: showNewPassword ? '#e9ecef' : '#f8f9fa',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: window.innerWidth <= 768 ? '10px' : '12px',
                      color: '#495057',
                      fontWeight: '500',
                      padding: window.innerWidth <= 768 ? '6px 8px' : '4px 6px',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      minHeight: window.innerWidth <= 768 ? '36px' : '30px',
                      minWidth: window.innerWidth <= 768 ? '40px' : '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    tabIndex={-1}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#dee2e6';
                      e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = showNewPassword ? '#e9ecef' : '#f8f9fa';
                      e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
                    }}
                  >
                    {showNewPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <div style={{ color: '#ff4444', fontSize: '14px', marginTop: '5px' }}>
                    {passwordErrors.newPassword}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Confirmar nueva contraseña:
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Repite la nueva contraseña"
                    style={{
                      width: '100%',
                      padding: window.innerWidth <= 768 ? '12px 52px 12px 12px' : '10px 48px 10px 10px',
                      border: passwordErrors.confirmPassword ? '2px solid #ff4444' : '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: window.innerWidth <= 768 ? '16px' : '16px',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: showConfirmPassword ? '#e9ecef' : '#f8f9fa',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: window.innerWidth <= 768 ? '10px' : '12px',
                      color: '#495057',
                      fontWeight: '500',
                      padding: window.innerWidth <= 768 ? '6px 8px' : '4px 6px',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      minHeight: window.innerWidth <= 768 ? '36px' : '30px',
                      minWidth: window.innerWidth <= 768 ? '40px' : '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    tabIndex={-1}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#dee2e6';
                      e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = showConfirmPassword ? '#e9ecef' : '#f8f9fa';
                      e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
                    }}
                  >
                    {showConfirmPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <div style={{ color: '#ff4444', fontSize: '14px', marginTop: '5px' }}>
                    {passwordErrors.confirmPassword}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={closePasswordModal}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                  disabled={passwordLoading}
                >
                  Cancelar
                </button>
                <button
                  onClick={handlePasswordSubmit}
                  disabled={passwordLoading}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: passwordLoading ? '#cccccc' : '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: passwordLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {passwordLoading ? 'Cambiando...' : 'Cambiar contraseña'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ReservasInfo reservations={reservations} currentUser={currentUser} />
    </div>
  );
};

export default MenuCalendario;
