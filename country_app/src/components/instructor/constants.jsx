import { useState, useEffect, useMemo } from "react"
import { obtenerClasesInstructora, actualizarAsistencia, obtenerUsuarioActual } from "./instructor-api"

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
  
  const weekClasses = classes.filter(c => {
    const classDate = new Date(c.date)
    const todayDate = new Date(today)
    const weekFromNow = new Date(todayDate)
    weekFromNow.setDate(todayDate.getDate() + 7)
    return classDate >= todayDate && classDate <= weekFromNow
  })

  const pastClasses = classes.filter(c => {
    const classDate = new Date(c.date)
    const todayDate = new Date(today)
    return classDate < todayDate
  }).sort((a, b) => new Date(b.date) - new Date(a.date))

  const filteredClasses = (activeView === 'today' ? todayClasses : 
                          activeView === 'week' ? weekClasses :
                          activeView === 'history' ? pastClasses : classes).filter((cls) => {
    const matchesSearch =
      (cls.student || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cls.type || "").toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || cls.type === filterType
    const matchesStatus = filterStatus === "all" || cls.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

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
      setClasses(prev => 
        prev.map(c => 
          c.id === id 
            ? { ...c, attendance, status: 'completada' } 
            : c
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
            ? { ...c, attendance: 'pendiente', status: 'confirmada' } 
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
    loading, 
    error, 
    instructoraInfo,
  }
}
