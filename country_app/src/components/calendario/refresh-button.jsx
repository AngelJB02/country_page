"use client"

import Button from "./ui/button"
import { Settings } from "lucide-react"

export function RefreshButton({ onClick }) {
    return (
        <Button
            onClick={onClick}
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-[#6B4423] hover:bg-[#4A2F18] text-white"
            title="Panel de administración"
        >
            <Settings className="h-6 w-6" />
        </Button>
    )
}
