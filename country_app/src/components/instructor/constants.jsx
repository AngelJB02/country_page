import { useState } from "react"

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

  const [classes, setClasses] = useState([
    {
      id: 1,
      type: "Iniciación",
      date: "2025-10-27",
      time: "09:00",
      horse: "Luna",
      student: "María García",
      studentAge: 8,
      status: "confirmada",
      attendance: "pendiente",
      level: "Principiante",
    },
    {
      id: 2,
      type: "Salto",
      date: "2025-10-27",
      time: "11:00",
      horse: "Trueno",
      student: "Carlos Rodríguez",
      studentAge: 15,
      status: "confirmada",
      attendance: "pendiente",
      level: "Intermedio",
    },
    {
      id: 3,
      type: "Paseo",
      date: "2025-10-27",
      time: "14:00",
      horse: "Canela",
      student: "Ana Martínez",
      studentAge: 12,
      status: "pendiente",
      attendance: "pendiente",
      level: "Avanzado",
    },
    {
      id: 4,
      type: "Intermedio",
      date: "2025-10-27",
      time: "16:00",
      horse: "Estrella",
      student: "Pedro López",
      studentAge: 14,
      status: "confirmada",
      attendance: "pendiente",
      level: "Intermedio",
    },
    {
      id: 5,
      type: "Iniciación",
      date: "2025-10-28",
      time: "10:00",
      horse: "Paloma",
      student: "Laura Sánchez",
      studentAge: 9,
      status: "confirmada",
      attendance: "pendiente",
      level: "Principiante",
    },
    {
      id: 6,
      type: "Salto",
      date: "2025-10-28",
      time: "15:00",
      horse: "Rayo",
      student: "Miguel Torres",
      studentAge: 16,
      status: "pendiente",
      attendance: "pendiente",
      level: "Avanzado",
    },
    {
      id: 7,
      type: "Avanzado",
      date: "2025-10-29",
      time: "12:00",
      horse: "Luna",
      student: "Sofia Ramírez",
      studentAge: 17,
      status: "confirmada",
      attendance: "pendiente",
      level: "Avanzado",
    },
    {
      id: 8,
      type: "Iniciación",
      date: "2025-10-30",
      time: "14:00",
      horse: "Canela",
      student: "Diego Fernández",
      studentAge: 10,
      status: "confirmada",
      attendance: "pendiente",
      level: "Principiante",
    },
    {
      id: 9,
      type: "Intermedio",
      date: "2025-10-31",
      time: "16:00",
      horse: "Trueno",
      student: "Valentina Cruz",
      studentAge: 13,
      status: "confirmada",
      attendance: "pendiente",
      level: "Intermedio",
    },
    {
      id: 10,
      type: "Paseo",
      date: "2025-11-01",
      time: "11:00",
      horse: "Paloma",
      student: "Sebastián Morales",
      studentAge: 11,
      status: "pendiente",
      attendance: "pendiente",
      level: "Principiante",
    },
    // Clases pasadas para el historial
    {
      id: 11,
      type: "Salto",
      date: "2025-10-20",
      time: "10:00",
      horse: "Trueno",
      student: "Carlos Rodríguez",
      studentAge: 15,
      status: "completada",
      attendance: "asistió",
      level: "Intermedio",
    },
    {
      id: 12,
      type: "Paseo",
      date: "2025-10-21",
      time: "11:00",
      horse: "Paloma",
      student: "Ana Martínez",
      studentAge: 12,
      status: "completada",
      attendance: "asistió",
      level: "Avanzado",
    },
    {
      id: 13,
      type: "Iniciación",
      date: "2025-10-22",
      time: "09:00",
      horse: "Luna",
      student: "María García",
      studentAge: 8,
      status: "completada",
      attendance: "faltó",
      level: "Principiante",
    },
    {
      id: 14,
      type: "Intermedio",
      date: "2025-10-23",
      time: "15:00",
      horse: "Estrella",
      student: "Pedro López",
      studentAge: 14,
      status: "completada",
      attendance: "asistió",
      level: "Intermedio",
    },
    {
      id: 15,
      type: "Avanzado",
      date: "2025-10-24",
      time: "13:00",
      horse: "Rayo",
      student: "Sofia Ramírez",
      studentAge: 17,
      status: "completada",
      attendance: "asistió",
      level: "Avanzado",
    },
  ])

  const todayClasses = classes.filter(c => c.date === "2025-10-27")
  
  const weekClasses = classes.filter(c => {
    const classDate = new Date(c.date)
    const today = new Date("2025-10-27")
    const weekFromNow = new Date(today)
    weekFromNow.setDate(today.getDate() + 7)
    return classDate >= today && classDate <= weekFromNow
  })

  const pastClasses = classes.filter(c => {
    const classDate = new Date(c.date)
    const today = new Date("2025-10-27")
    return classDate < today
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

  const handleAttendanceChange = (id, attendance) => {
    setClasses(prev => 
      prev.map(c => 
        c.id === id 
          ? { ...c, attendance, status: 'completada' } 
          : c
      )
    )
    setShowAttendanceModal(false)
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
  }
}
