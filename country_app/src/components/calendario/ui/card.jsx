"use client"

import React from "react"

// Componente Card mínimo para UI local
export function Card({ children, className = "", ...props }) {
	return (
		<div className={"rounded-lg bg-white shadow p-4 " + className} {...props}>
			{children}
		</div>
	)
}

export default Card
