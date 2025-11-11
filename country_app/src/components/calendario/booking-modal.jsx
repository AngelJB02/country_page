"use client"

// Modal de confirmación y gestión de reservas: muestra detalles del turno y permite confirmar o cancelar.
// Maneja estados de carga y llama a onConfirm/onCancel/onClose según la acción del usuario.

import { useState } from "react"
import Button from "./ui/button"
import "./css/booking-modal.css"

export function BookingModal({
  slot,
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  isBookedByUser,
  hasBookingForDay,
  hasBookingWithin24h,
  userName,
}) {
  const [isLoading, setIsLoading] = useState(false)

  if (!slot) return null

  // Usar totalBooked para mostrar ocupación real (igual que el calendario)
  const totalBooked = slot.totalBooked !== undefined ? slot.totalBooked : slot.bookings.length;
  const availableSpots = slot.capacity - totalBooked;

  const handleConfirm = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate API call
    onConfirm()
    setIsLoading(false)
    onClose()
  }

  const handleCancel = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate API call
    onCancel()
    setIsLoading(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="bm-overlay">
      <div className="bm-backdrop" onClick={onClose} />
      <div className="bm-modal">
        <div className="bm-header">
          <h3 className="bm-title">{isBookedByUser ? "Tu reserva" : "Confirmar reserva"}</h3>
          <p className="bm-subtitle">{isBookedByUser ? "Puedes cancelar tu reserva si lo deseas." : "Revisa los detalles de tu clase antes de confirmar."}</p>
        </div>

        <div className="bm-body">
          {/* Slot details */}
          <div className="bm-slot">
            <div className="bm-row">
              <span className="bm-label">Día:</span>
              <span className="bm-value">{slot.day}</span>
            </div>
            <div className="bm-row">
              <span className="bm-label">Hora:</span>
              <span className="bm-value">{slot.time}</span>
            </div>
            <div className="bm-row">
              <span className="bm-label">Plazas disponibles:</span>
              <span className="bm-value">
                {availableSpots} de {slot.capacity}
              </span>
            </div>
          </div>

          {/* Horse icons */}
          <div className="bm-horses">
            {Array.from({ length: slot.capacity }).map((_, index) => (
              <span key={index} className={`bm-horse ${index < totalBooked ? "bm-horse--filled" : "bm-horse--empty"}`}>
                🐴
              </span>
            ))}
          </div>

          {/* Warning if user already has a booking for this day */}
          {!isBookedByUser && hasBookingForDay && (
            <div className="bm-warning">
              <p className="bm-warning-text">Ya tienes una reserva para {slot.day}. Solo puedes reservar una clase por día.</p>
            </div>
          )}

          {/* Warning if user has a recent booking within 24 hours */}
          {!isBookedByUser && hasBookingWithin24h && (
            <div className="bm-warning">
              <p className="bm-warning-text">Podrás reservar dentro de 24 horas.</p>
            </div>
          )}
        </div>

        <div className="bm-actions">
          {isBookedByUser ? (
            <>
              <Button
                variant="outline"
                onClick={onClose}
                className="bm-btn bm-btn--outline"
              >
                Cerrar
              </Button>
              <Button
                onClick={handleCancel}
                disabled={isLoading}
                className="bm-btn bm-btn--danger"
              >
                {isLoading ? "Cancelando..." : "Cancelar reserva"}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={onClose}
                className="bm-btn bm-btn--outline"
              >
                Volver
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={isLoading || hasBookingForDay || hasBookingWithin24h}
                className="bm-btn bm-btn--primary"
              >
                {isLoading ? "Confirmando..." : "Confirmar reserva"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
