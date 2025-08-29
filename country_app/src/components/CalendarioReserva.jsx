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
    <div className="calendario-reserva-minimal">
      <label className="form-label" htmlFor="fechaEvento">Fecha del evento</label>
      <div className="calendario-input-row">
        <input
          type="text"
          className="input-datepicker"
          value={selectedDate ? formatDate(selectedDate) : ""}
          placeholder="Selecciona una fecha disponible"
          readOnly
          onClick={() => setShowCalendar(true)}
          style={{ cursor: "pointer", background: "#fafafa" }}
        />
        <button
          type="button"
          className="calendario-btn"
          onClick={() => setShowCalendar((v) => !v)}
        >
          {selectedDate ? "Cambiar fecha" : "Elegir fecha"}
        </button>
      </div>
      {showCalendar && (
        <div className="calendario-popover" ref={calendarRef}>
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
        .calendario-reserva-minimal {
          max-width: 520px;
          margin: 0 auto 1.5rem auto;
          font-family: inherit;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 2px 16px rgba(0,0,0,0.07);
          padding: 1.5rem 1rem;
          position: relative;
        }
        .form-label {
          display: block;
          margin-bottom: 12px;
          font-size: 1.15rem;
          font-weight: 600;
          color: #222;
        }
        .calendario-input-row {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        .input-datepicker {
          flex: 1;
          padding: 10px;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
          font-size: 1rem;
          background: #fafafa;
          height: 44px;
          box-sizing: border-box;
        }
        .calendario-btn {
          padding: 0 28px;
          height: 44px;
          border-radius: 8px;
          border: none;
        background: #8B5A2B; 
        color: #fff;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
          box-shadow: 0 2px 8px rgba(33,150,243,0.08);
          display: flex;
          align-items: center;
        }
        .calendario-btn:hover {
          background: #1769aa;
        }
        .calendario-popover {
          position: absolute;
          z-index: 10;
          top: 70px;
          left: 0;
          right: 0;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.13);
          padding: 1rem 0.5rem;
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
          width: 44px;
          height: 44px;
          line-height: 44px;
          font-size: 1.08rem;
          border-radius: 12px;
          margin: 2px;
          border: none;
          background: #f7f7f7;
          color: #222;
          transition: background 0.2s, color 0.2s;
        }
        .react-datepicker__day--selected {
          background: #4caf50 !important;
          color: #fff !important;
        }
        .react-datepicker__day--keyboard-selected {
          background: #e0e0e0 !important;
          color: #222 !important;
        }
        .react-datepicker__day--today {
          border: 1.5px solid #2196f3 !important;
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
        .react-datepicker__navigation-icon {
          width: 24px;
          height: 24px;
        }
        @media (max-width: 600px) {
          .calendario-reserva-minimal {
            max-width: 100%;
            padding: 1rem 0.5rem;
          }
          .react-datepicker__day {
            width: 32px;
            height: 32px;
            line-height: 32px;
            font-size: 0.98rem;
            border-radius: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default CalendarioReserva;
