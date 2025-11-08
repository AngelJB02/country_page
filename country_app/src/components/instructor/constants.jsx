import { useState, useEffect, useMemo } from "react"
import { obtenerClasesInstructora, actualizarAsistencia, obtenerUsuarioActual, obtenerCaballosPorNivel, asignarCaballo } from "./instructor-api"

export default function InstructorDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [activeView, setActiveView] = useState("today")
  const [selectedClass, setSelectedClass] = useState(null)
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [showDateClasses, setShowDateClasses] = useState(false)
  const [dateClasses, setDateClasses] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [instructoraInfo, setInstructoraInfo] = useState(null)
  const [caballosPorNivel, setCaballosPorNivel] = useState({}) // Nuevo estado para caballos

  // Obtener la fecha de hoy solo una vez
  const today = useMemo(() => {
    const fechaHoy = new Date().toISOString().split('T')[0];
    console.log('📅 Fecha de hoy calculada:', fechaHoy);
    return fechaHoy;
  }, []);

  // useEffect para cargar los datos de la instructora al montar el componente
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Obtener el usuario del localStorage
        const usuario = obtenerUsuarioActual()
        
        console.log('🔍 Usuario del localStorage:', usuario)
        
        if (!usuario || !usuario.id) {
          throw new Error('No se encontró información de usuario')
        }
        
        console.log(`📞 Llamando API con usuario_id: ${usuario.id}`)
        
        // Obtener las clases de la instructora
        const { instructora, clases } = await obtenerClasesInstructora(usuario.id)
        
        console.log('📋 Datos recibidos del servidor:', { instructora, clases })
        console.log('🎯 Cantidad de clases:', clases.length)
        console.log('🔍 Clases detalladas:', clases.map(c => ({ 
          id: c.id, 
          date: c.date, 
          status: c.status, 
          student: c.student 
        })))
        
        setInstructoraInfo(instructora)
        setClasses(clases)
        
      } catch (err) {
        console.error('Error al cargar datos:', err)
        setError(err.message)
        // Si hay error, cargar datos de ejemplo para desarrollo
        setClasses([
          {
            id: 1,
            type: "Iniciación",
            date: "2025-11-07",
            time: "09:00",
            horse: "Luna",
            student: "Estudiante de ejemplo",
            studentAge: 10,
            status: "confirmada",
            attendance: "pendiente",
            level: "Principiante",
          }
        ])
      } finally {
        setLoading(false)
      }
    }
    
    cargarDatos()
  }, [])

  const todayClasses = classes.filter(c => c.date === today)
  console.log(`📅 Clases de hoy (${today}):`, todayClasses.length, todayClasses.map(c => ({ id: c.id, status: c.status, student: c.student })));
  
  const weekClasses = classes.filter(c => {
    // Comparar fechas directamente como strings (YYYY-MM-DD)
    const [cYear, cMonth, cDay] = c.date.split('-').map(Number);
    const classDate = new Date(cYear, cMonth - 1, cDay);
    
    const [tYear, tMonth, tDay] = today.split('-').map(Number);
    const todayDate = new Date(tYear, tMonth - 1, tDay);
    
    const weekFromNow = new Date(todayDate);
    weekFromNow.setDate(todayDate.getDate() + 7);
    
    return classDate >= todayDate && classDate <= weekFromNow;
  })

  const pastClasses = classes.filter(c => {
    // Comparar fechas directamente como strings (YYYY-MM-DD)
    const [cYear, cMonth, cDay] = c.date.split('-').map(Number);
    const classDate = new Date(cYear, cMonth - 1, cDay);
    
    const [tYear, tMonth, tDay] = today.split('-').map(Number);
    const todayDate = new Date(tYear, tMonth - 1, tDay);
    
    return classDate < todayDate;
  }).sort((a, b) => {
    // Ordenar por fecha descendente
    const [aYear, aMonth, aDay] = a.date.split('-').map(Number);
    const [bYear, bMonth, bDay] = b.date.split('-').map(Number);
    const dateA = new Date(aYear, aMonth - 1, aDay);
    const dateB = new Date(bYear, bMonth - 1, bDay);
    return dateB - dateA;
  })

  // Filtrar clases por vista y excluir canceladas de vistas activas
  const getClassesByView = () => {
    let viewClasses;
    if (activeView === 'today') {
      viewClasses = todayClasses.filter(c => c.status !== 'cancelada');
    } else if (activeView === 'week') {
      viewClasses = weekClasses.filter(c => c.status !== 'cancelada');
    } else if (activeView === 'history') {
      viewClasses = pastClasses; // En historial SÍ mostramos las canceladas
    } else {
      viewClasses = classes.filter(c => c.status !== 'cancelada'); // Vista general sin canceladas
    }
    
    console.log(`📊 ${activeView} view - clases antes del filtro:`, viewClasses.length);
    return viewClasses;
  };

  const filteredClasses = getClassesByView().filter((cls) => {
    const matchesSearch =
      (cls.student || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cls.type || "").toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || cls.type === filterType
    const matchesStatus = filterStatus === "all" || cls.status === filterStatus
    const matches = matchesSearch && matchesType && matchesStatus;
    return matches;
  })
  
  console.log(`✅ Clases filtradas finales (${activeView}):`, filteredClasses.length);

  const handleAttendanceChange = async (id, attendance) => {
    try {
      console.log(`🎯 Actualizando asistencia: ${attendance} para reserva ${id}`)
      
      // Mapear los valores del frontend al backend
      const attendanceMap = {
        'asistió': 'presente',
        'faltó': 'ausente', 
        'pendiente': 'pendiente'
      }
      
      const backendAttendance = attendanceMap[attendance] || attendance;
      
      // Primero actualizar el estado local para respuesta inmediata
      const updatedClass = { 
        ...{}, 
        attendance, 
        status: attendance === 'faltó' ? 'cancelada' : 'completada'
      };
      
      // Si faltó, también quitar el caballo
      if (attendance === 'faltó') {
        updatedClass.horse = null;
        updatedClass.caballo_asignado = null;
      }
      
      setClasses(prev => 
        prev.map(c => 
          c.id === id ? { ...c, ...updatedClass } : c
        )
      )
      setShowAttendanceModal(false)
      
      // Luego actualizar en el backend
      await actualizarAsistencia(id, backendAttendance)
      
      console.log(`✅ Asistencia actualizada correctamente`)
      
    } catch (error) {
      console.error('Error al actualizar asistencia:', error)
      // Revertir el cambio local si falla la API
      setClasses(prev => 
        prev.map(c => 
          c.id === id 
            ? { ...c, attendance: 'pendiente', status: 'confirmada' }  // Revertir estado, mantener caballo original
            : c
        )
      )
      // Aquí podrías mostrar una notificación de error
      alert('Error al actualizar la asistencia. Por favor, inténtalo de nuevo.')
    }
  }

  const handleDateClick = (date, classes) => {
    setSelectedDate(date)
    setDateClasses(classes)
    setShowDateClasses(true)
  }

  const handleClassClickFromModal = (classItem) => {
    setShowDateClasses(false)
    setSelectedClass(classItem)
    setShowAttendanceModal(true)
  }

  // Función para obtener caballos disponibles para una clase específica
  const obtenerCaballosParaClase = async (nivelCliente) => {
    try {
      // Si ya tenemos los caballos para este nivel, devolverlos del cache
      if (caballosPorNivel[nivelCliente]) {
        return caballosPorNivel[nivelCliente];
      }

      // Si no, obtener del servidor (con fecha actual para verificar descansos)
      const fechaHoy = new Date().toISOString().split('T')[0];
      const caballos = await obtenerCaballosPorNivel(nivelCliente, fechaHoy);
      
      // Guardar en cache
      setCaballosPorNivel(prev => ({
        ...prev,
        [nivelCliente]: caballos
      }));

      return caballos;
    } catch (error) {
      console.error(`Error al obtener caballos para nivel ${nivelCliente}:`, error);
      return [];
    }
  };

  // Función para manejar el cambio de caballo
  const handleHorseChange = async (classId, caballoData) => {
    try {
      console.log(`🐎 Asignando caballo:`, caballoData, `a clase:`, classId);
      
      // caballoData puede ser un objeto {id, nombre} o solo el nombre
      const caballoId = caballoData.id || caballoData;
      const caballoNombre = caballoData.nombre || caballoData;
      
      // Actualizar estado local inmediatamente para UX
      setClasses(prev => 
        prev.map(c => c.id === classId ? {...c, horse: caballoNombre} : c)
      );
      
      // Solo asignar al backend si se proporcionó un ID válido de caballo
      if (caballoId && caballoId !== '' && caballoId !== caballoNombre) {
        await asignarCaballo(classId, caballoId);
        console.log(`✅ Caballo asignado correctamente en el backend`);
      } else if (caballoNombre === '' || caballoNombre === null) {
        // Si se está quitando el caballo, solo actualizar localmente por ahora
        console.log(`ℹ️ Caballo removido localmente`);
      }
      
    } catch (error) {
      console.error('Error al asignar caballo:', error);
      // Revertir cambio local si falla
      setClasses(prev => 
        prev.map(c => c.id === classId ? {...c, horse: c.horse} : c)
      );
      alert(`Error al asignar caballo: ${error.message}`);
    }
  }
  
  return {
    searchTerm, setSearchTerm,
    filterType, setFilterType,
    filterStatus, setFilterStatus,
    activeView, setActiveView,
    selectedClass, setSelectedClass,
    showAttendanceModal, setShowAttendanceModal,
    selectedDate, setSelectedDate,
    showDateClasses, setShowDateClasses,
    dateClasses, setDateClasses,
    classes, setClasses, filteredClasses,
    handleAttendanceChange,
    handleDateClick,
    handleClassClickFromModal,
    obtenerCaballosParaClase, // Nueva función exportada
    handleHorseChange, // Nueva función exportada
    loading, 
    error, 
    instructoraInfo,
  }
}
