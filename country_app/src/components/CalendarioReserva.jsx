import React, { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import reservasData from "../data/reservas.json";


function formatDate(date) {
  return date.toISOString().split("T")[0];
}


const CalendarioReserva = ({ value, onChange }) => {
  // Leer fechas ocupadas del JSON local
  const fechasOcupadas = reservasData.fechasOcupadas || [];
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef(null);
  

  // Función para bloquear fechas ocupadas
  const isDayDisabled = (date) => {
    const dateStr = formatDate(date);
    return fechasOcupadas.includes(dateStr);
  };

  useEffect(() => {
    if (selectedDate && onChange) {
      onChange(formatDate(selectedDate));
    }
  }, [selectedDate, onChange]);

  // Cerrar el calendario si se hace clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    }
    if (showCalendar) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCalendar]);

  return (
    <div className="calendario-reserva-inline" ref={calendarRef}>
      <input
        type="text"
        className="calendario-input"
        value={selectedDate ? formatDate(selectedDate) : ""}
        placeholder="Selecciona una fecha"
        readOnly
        onClick={() => setShowCalendar((v) => !v)}
      />
      {showCalendar && (
        <div className="calendario-popover">
          <DatePicker
            selected={selectedDate}
            onChange={(date) => {
              setSelectedDate(date);
              setShowCalendar(false);
            }}
            minDate={new Date()}
            filterDate={(date) => !isDayDisabled(date)}
            dateFormat="yyyy-MM-dd"
            inline
          />
        </div>
      )}
      <input type="hidden" name="fechaEvento" id="fechaEvento" value={selectedDate ? formatDate(selectedDate) : ""} />
      <style>{`
        .calendario-reserva-inline {
          position: relative;
        }
        .calendario-input {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid #d6d3d1;
          border-radius: 12px;
          font-size: 15px;
          outline: none;
          transition: all 0.2s ease;
          background-color: #fff;
          color: #1c1917;
          cursor: pointer;
          box-sizing: border-box;
        }
        .calendario-input:focus,
        .calendario-input:hover {
          border-color: #6B4423;
        }
        .calendario-popover {
          position: absolute;
          z-index: 20;
          top: calc(100% + 8px);
          left: 0;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.15);
          padding: 1rem 0.5rem;
          min-width: 300px;
        }
        .react-datepicker {
          border: none;
          box-shadow: none;
          width: 100%;
          background: #fff;
        }
        .react-datepicker__month-container {
          width: 100%;
        }
        .react-datepicker__header {
          background: #fff;
          border-bottom: 1px solid #eee;
          padding-top: 12px;
        }
        .react-datepicker__current-month {
          font-size: 1.1rem;
          font-weight: 500;
          color: #333;
        }
        .react-datepicker__day {
          width: 40px;
          height: 40px;
          line-height: 40px;
          font-size: 1rem;
          border-radius: 10px;
          margin: 2px;
          border: none;
          background: #f7f7f7;
          color: #222;
          transition: background 0.2s, color 0.2s;
        }
        .react-datepicker__day--selected {
          background: #6B4423 !important;
          color: #fff !important;
        }
        .react-datepicker__day--keyboard-selected {
          background: #e0e0e0 !important;
          color: #222 !important;
        }
        .react-datepicker__day--today {
          border: 1.5px solid #8B5A2B !important;
        }
        .react-datepicker__day--disabled {
          color: #fff !important;
          background: #d32f2f !important;
          opacity: 0.5;
          cursor: not-allowed;
        }
        .react-datepicker__navigation {
          top: 18px;
        }
        @media (max-width: 600px) {
          .calendario-popover {
            min-width: unset;
            right: 0;
          }
          .react-datepicker__day {
            width: 32px;
            height: 32px;
            line-height: 32px;
            font-size: 0.95rem;
            border-radius: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default CalendarioReserva;
