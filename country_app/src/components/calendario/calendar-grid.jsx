"use client"

import { WeeklyCalendar } from "./weekly-calendar"

export function CalendarGrid({ level, userId, onSlotClick }) {
    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h2 className="text-3xl font-serif text-[#6B4423] mb-2">Reserva tu clase</h2>
                <p className="text-[#6B4423]/70">Selecciona un horario disponible para reservar tu clase de equitación.</p>
            </div>

            <WeeklyCalendar userLevel={level} userId={userId} onSlotClick={onSlotClick} />
        </div>
    )
}
