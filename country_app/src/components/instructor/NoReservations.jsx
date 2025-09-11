import React from 'react';

const NoReservations = () => (
  <div style={{ 
    background:'var(--cream-overlay)',
    backdropFilter:'blur(10px)', 
    padding:'3rem', 
    borderRadius:'var(--radius-xl)', 
    textAlign:'center', 
    boxShadow:'var(--soft-shadow)'
  }}>
  <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>🐴</div>
    <h3 style={{ color:'var(--primary-brown)', marginBottom:'1rem', fontSize:'1.5rem' }}>No hay reservas</h3>
    <p style={{ color:'var(--charcoal)', opacity:'0.7' }}>No se encontraron reservas para los filtros seleccionados.</p>
  </div>
);

export default NoReservations;
