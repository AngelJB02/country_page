import React, { useState, useEffect } from 'react';
import Contabilidad from "./Contabilidad";
import ReservasAdmin from "./administrador/ReservasAdmin";
import axios from 'axios';

const Administrador = () => {
	const [reservations, setReservations] = useState({});

	useEffect(() => {
		axios.get('https://country-page.onrender.com/api/reservas')
			.then(response => {
				const reservasPorFecha = {};
				response.data.forEach(reserva => {
					let fechaKey = reserva.fecha;
					if (typeof fechaKey === 'string' && fechaKey.includes('T')) {
						fechaKey = fechaKey.split('T')[0];
					} else if (typeof fechaKey === 'string' && fechaKey.length >= 10) {
						fechaKey = fechaKey.substring(0, 10);
					}
					if (!reservasPorFecha[fechaKey]) reservasPorFecha[fechaKey] = [];
					reservasPorFecha[fechaKey].push({
						...reserva,
						time: reserva.horario,
						actividad: reserva.clase_tipo || reserva.actividad
					});
				});
				setReservations(reservasPorFecha);
			})
			.catch(() => setReservations({}));
	}, []);

	return (
		<div>
			<Contabilidad />
			<hr />
			<ReservasAdmin reservations={reservations} />
		</div>
	);
};

export default Administrador;
