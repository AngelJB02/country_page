"use client"

import React from "react"

// Botón simple reutilizable
export function Button({ children, className = "", variant = "default", ...props }) {
	const base = "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium"
	const variants = {
		default: "bg-[#6B4423] text-white hover:bg-[#4A2F18]",
		ghost: "bg-transparent",
		outline: "bg-transparent border",
	}
	const cls = [base, variants[variant] || variants.default, className].filter(Boolean).join(" ")
	return (
		<button className={cls} {...props}>
			{children}
		</button>
	)
}

export default Button
