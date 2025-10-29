import React, { createContext, useContext, useState } from 'react';
import { MOCK_BOOKINGS } from './schedule-config';

// Contexto para gestionar reservas en memoria: mantiene la lista de bookings y
// expone addBooking/removeBooking/getUserBookingForDay para manipular el estado.
// Proporciona el hook `useBookings` que lanza un error si se usa fuera del provider.

const BookingContext = createContext(undefined);

/**
 * BookingProvider
 * Proporciona el estado de reservas (in-memory) y acciones para manipularlo
 * (addBooking, removeBooking, getUserBookingForDay) a través de React Context.
 * @param {{children: React.ReactNode}} props
 */
export function BookingProvider({ children }) {
    const [bookings, setBookings] = useState(MOCK_BOOKINGS);

    /**
     * addBooking(booking)
     * booking: { userId, userName, timeSlotId, capacity? }
     * Crea un nuevo booking con id generado y lo añade al estado.
     */
    const addBooking = (booking) => {
        const newBooking = {
            ...booking,
            id: `b${Date.now()}`,
        };
        setBookings((prev) => [...prev, newBooking]);
    };

    /**
     * removeBooking(bookingId)
     * Elimina una reserva por su id.
     */
    const removeBooking = (bookingId) => {
        setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    };

    /**
     * getUserBookingForDay(userId, day)
     * Busca la primera reserva del usuario en un día concreto.
     * `day` aquí se compara con el prefijo de `timeSlotId` (convención interna).
     */
    const getUserBookingForDay = (userId, day) => {
        return bookings.find((b) => b.userId === userId && b.timeSlotId.startsWith(day));
    };

    return (
        <BookingContext.Provider value={{ bookings, addBooking, removeBooking, getUserBookingForDay }}>
            {children}
        </BookingContext.Provider>
    );
}

/**
 * useBookings()
 * Hook para consumir el contexto de reservas. Lanza error si se usa fuera del provider.
 * @returns {{bookings: Array, addBooking: Function, removeBooking: Function, getUserBookingForDay: Function}}
 */
export function useBookings() {
    const context = useContext(BookingContext);
    if (context === undefined) {
        throw new Error("useBookings must be used within a BookingProvider");
    }
    return context;
}