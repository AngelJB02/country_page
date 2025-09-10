import React from 'react';

const Filters = ({ viewMode, setViewMode, selectedDate, setSelectedDate, endDate, setEndDate, searchTerm, setSearchTerm }) => (
  <div style={{ background: 'var(--cream-overlay)', backdropFilter: 'blur(10px)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--soft-shadow)', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.2)' }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
      {/* Vista */}
      <div>
        <label style={{ display: 'block', color: 'var(--primary-brown)', fontWeight: '600', marginBottom: '0.5rem' }}>Vista:</label>
        <select value={viewMode} onChange={e => setViewMode(e.target.value)} style={{ width:'100%', padding:'0.75rem', border:'2px solid var(--stone-gray)', borderRadius:'var(--radius-md)', background:'var(--warm-white)', color:'var(--primary-brown)', fontSize:'1rem' }}>
          <option value="day">Vista Diaria</option>
          <option value="week">Vista Semanal</option>
        </select>
      </div>

      {/* Fecha inicio */}
      <div>
        <label style={{ display: 'block', color: 'var(--primary-brown)', fontWeight: '600', marginBottom: '0.5rem' }}>{viewMode==='day'?'Fecha:':'Fecha Inicio:'}</label>
        <input type="date" value={selectedDate} onChange={e=>setSelectedDate(e.target.value)} style={{ width:'100%', padding:'0.75rem', border:'2px solid var(--stone-gray)', borderRadius:'var(--radius-md)', background:'var(--warm-white)', color:'var(--primary-brown)', fontSize:'1rem' }} />
      </div>

      {/* Fecha fin */}
      {viewMode==='week' && <div>
        <label style={{ display: 'block', color: 'var(--primary-brown)', fontWeight: '600', marginBottom: '0.5rem' }}>Fecha Fin (opcional):</label>
        <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} min={selectedDate} style={{ width:'100%', padding:'0.75rem', border:'2px solid var(--stone-gray)', borderRadius:'var(--radius-md)', background:'var(--warm-white)', color:'var(--primary-brown)', fontSize:'1rem' }} />
      </div>}

      {/* Búsqueda */}
      <div>
        <label style={{ display: 'block', color: 'var(--primary-brown)', fontWeight: '600', marginBottom: '0.5rem' }}>Buscar por nombre:</label>
        <input type="text" placeholder="Nombre del cliente..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} style={{ width:'100%', padding:'0.75rem', border:'2px solid var(--stone-gray)', borderRadius:'var(--radius-md)', background:'var(--warm-white)', color:'var(--primary-brown)', fontSize:'1rem' }} />
      </div>
    </div>
  </div>
);

export default Filters;
