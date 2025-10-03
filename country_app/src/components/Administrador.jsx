import { useState } from "react"
import React from "react";
import MembershipAdminDashboard from "./Contabilidad";
import MenuCalendario from "./MenuCalendario";

const Administrador = () => {
	return (
		<div>
			<h2>Panel de Administración</h2>
			<MembershipAdminDashboard />
			<hr />
			{/* Modo administrador para ver todas las reservas */}
			<MenuCalendario adminMode={true} />
		</div>
	);
};

export default Administrador;
