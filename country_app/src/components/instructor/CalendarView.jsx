import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

// Componente Vista de Calendario
function CalendarView({ classes, onDateClick }) {
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 9)) // Octubre 2025

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek }
  }

  const getClassesForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0]
    return classes.filter(c => c.date === dateStr)
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth)
  const days = []

  // Días vacíos al inicio
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} style={{ padding: '8px' }}></div>)
  }

  // Días del mes
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const dateClasses = getClassesForDate(date)
    const hasClasses = dateClasses.length > 0
    const today = new Date(2025, 9, 27)
    const isToday = date.toDateString() === today.toDateString()
    
    days.push(
      <div
        key={day}
        onClick={() => hasClasses && onDateClick(date, dateClasses)}
        style={{
          padding: '16px 12px',
          textAlign: 'center',
          cursor: hasClasses ? 'pointer' : 'default',
          borderRadius: '8px',
          backgroundColor: isToday ? 'var(--primary-brown)' : hasClasses ? 'var(--sage-green)' : 'white',
          border: `1.5px solid ${isToday ? 'var(--primary-brown)' : hasClasses ? 'var(--sage-green)' : 'var(--stone-gray)'}`,
          transition: 'all 0.2s',
          position: 'relative',
          minHeight: '80px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => {
          if (hasClasses) {
            e.currentTarget.style.transform = 'scale(1.05)'
            e.currentTarget.style.boxShadow = 'var(--medium-shadow)'
          }
        }}
        onMouseLeave={(e) => {
          if (hasClasses) {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = 'none'
          }
        }}
      >
        <div style={{ 
          fontWeight: hasClasses || isToday ? 'bold' : 'normal', 
          color: isToday ? 'white' : hasClasses ? 'white' : 'var(--charcoal)',
          fontSize: '18px',
          marginBottom: '4px'
        }}>
          {day}
        </div>
        {hasClasses && (
          <div style={{
            fontSize: '11px',
            color: isToday ? 'white' : 'white',
            fontWeight: '600'
          }}>
            {dateClasses.length} clase{dateClasses.length !== 1 ? 's' : ''}
          </div>
        )}
        {isToday && (
          <div style={{
            fontSize: '9px',
            color: 'white',
            marginTop: '2px',
            fontWeight: '600'
          }}>
            HOY
          </div>
        )}
      </div>
    )
  }

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  return (
    <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '12px', boxShadow: 'var(--soft-shadow)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          className="btn-outline-v2"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            padding: '0'
          }}
        >
          <ChevronLeft size={20} />
        </button>
        
        <h3 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: 'var(--primary-brown)',
          fontFamily: 'var(--font-serif)'
        }}>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          className="btn-outline-v2"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            padding: '0'
          }}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '16px' }}>
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
          <div key={day} style={{ 
            textAlign: 'center', 
            fontWeight: 'bold', 
            color: 'var(--primary-brown)', 
            padding: '12px',
            fontSize: '14px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {day}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
        {days}
      </div>
    </div>
  )
}
export { CalendarView }