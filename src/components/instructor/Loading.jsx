import React from 'react';

const Loading = () => (
  <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'400px', background:'var(--warm-white)' }}>
    <div style={{ padding:'2rem', background:'var(--cream-overlay)', borderRadius:'var(--radius-lg)', boxShadow:'var(--soft-shadow)', textAlign:'center' }}>
      <div style={{ width:'40px', height:'40px', border:'4px solid var(--stone-gray)', borderTop:'4px solid var(--primary-brown)', borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto 1rem' }}></div>
      <p style={{ color:'var(--primary-brown)', fontWeight:'600' }}>Cargando reservas...</p>
    </div>
  </div>
);

export default Loading;
