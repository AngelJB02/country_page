import React, { useState, useEffect } from 'react';
import {
  BarChart2, Users, Clock, AlertTriangle,
  Filter, Award, TrendingUp, CheckCircle,
  Star, Activity, BookOpen, XCircle
} from 'lucide-react';

const C = {
  green:      '#4a7a2d',
  greenLight: '#f0f4ef',
  greenMid:   '#2d5016',
  brown:      '#8b5a2b',
  brownLight: '#fdf5ec',
  gold:       '#d4a574',
  red:        '#d32f2f',
  redLight:   '#fff2f2',
  bg:         '#f5f5f0',
  white:      '#ffffff',
  border:     '#e8e8e0',
  textMain:   '#1a1a1a',
  textSub:    '#6b6b6b',
  textHint:   '#aaaaaa',
};

const RANGOS = [
  { id: 'este_mes',        label: 'Este mes' },
  { id: 'ultimo_mes',      label: 'Mes anterior' },
  { id: 'ultimos_3_meses', label: 'Ultimos 3 meses' },
  { id: 'todo_historial',  label: 'Historial completo' },
];

const NIVEL_COLORS = ['#4a7a2d', '#8b5a2b', '#d4a574', '#1a5276', '#6c3483'];
const INST_COLORS  = ['#2e7d32', '#c0392b', '#1565c0', '#7b3f00', '#4a148c'];

const KpiCard = ({ icon: Icon, label, value, sub, accent, light }) => (
  <div className="metricas-kpi-card" style={{
    background: C.white, borderRadius: 16, padding: '1.4rem 1.6rem',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex',
    flexDirection: 'column', gap: 8, borderLeft: `5px solid ${accent || C.green}`,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ background: light || C.greenLight, borderRadius: 10, padding: 7, display: 'flex' }}>
        <Icon size={18} color={accent || C.green} />
      </div>
      <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: C.textSub }}>{label}</span>
    </div>
    <div style={{ fontSize: '2rem', fontWeight: 900, color: C.textMain, lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: '0.75rem', color: C.textHint }}>{sub}</div>}
  </div>
);

const SectionCard = ({ title, badge, badgeColor = '#4a7a2d', icon: Icon, children }) => (
  <div className="metricas-section-card" style={{ background: C.white, borderRadius: 20, padding: '1.8rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'visible' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {Icon && <Icon size={20} color={badgeColor} />}
        <h3 style={{ margin: 0, color: C.greenMid, fontSize: '1.15rem', fontWeight: 800 }}>{title}</h3>
      </div>
      {badge && (
        <span style={{
          fontSize: '0.7rem', fontWeight: 700, padding: '4px 12px',
          borderRadius: 20, background: `${badgeColor}22`, color: badgeColor, letterSpacing: 0.5
        }}>{badge}</span>
      )}
    </div>
    {children}
  </div>
);

const Avatar = ({ name, bg = '#f0f4ef', fg = '#4a7a2d', size = 38 }) => (
  <div style={{
    width: size, height: size, borderRadius: 10, background: bg,
    color: fg, display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 800, fontSize: size * 0.42, flexShrink: 0,
  }}>
    {(name || '?')[0].toUpperCase()}
  </div>
);

const inputStyle = {
  padding: '0.45rem 0.8rem', border: '1.5px solid #ddd', borderRadius: 10,
  fontSize: '0.82rem', color: '#333', outline: 'none', fontFamily: 'inherit', background: '#fff',
};

const MetricasResumen = () => {
  const [loading, setLoading] = useState(true);
  const [metricas, setMetricas] = useState(null);
  const [error,    setError]    = useState(null);
  const [rango,    setRango]    = useState('este_mes');
  const [fechas,   setFechas]   = useState({ inicio: '', fin: '' });

  useEffect(() => { calcularRango(rango); }, [rango]);
  useEffect(() => { if (fechas.inicio && fechas.fin) fetchMetricas(); }, [fechas]);

  const calcularRango = (tipo) => {
    const hoy = new Date();
    let inicio, fin;
    switch (tipo) {
      case 'este_mes':
        inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        fin    = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
        break;
      case 'ultimo_mes':
        inicio = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
        fin    = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
        break;
      case 'ultimos_3_meses':
        inicio = new Date(hoy.getFullYear(), hoy.getMonth() - 3, 1);
        fin    = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
        break;
      case 'todo_historial':
        inicio = new Date(2024, 0, 1);
        fin    = hoy;
        break;
      default: return;
    }
    setFechas({ inicio: inicio.toISOString().split('T')[0], fin: fin.toISOString().split('T')[0] });
  };

  const fetchMetricas = async () => {
    try {
      setLoading(true);
      const url = `https://elrefugiocountryclub.com/api/api/reservas-admin/analytics/detailed?fecha_inicio=${fechas.inicio}&fecha_fin=${fechas.fin}`;
      const r = await fetch(url);
      if (!r.ok) throw new Error('Error al obtener metricas');
      setMetricas(await r.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    setFechas(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setRango('personalizado');
  };

  const totalClasesRealizadas = metricas?.metricas_por_clase?.reduce((acc, c) => acc + (Number(c.total) || 0), 0) ?? 0;
  const totalFaltas           = metricas?.metricas_por_clase?.reduce((acc, c) => acc + (Number(c.cancelaciones) || 0), 0) ?? 0;
  const totalTodo             = totalClasesRealizadas + totalFaltas;
  const tasaGlobalRaw         = totalTodo > 0 ? (totalClasesRealizadas / totalTodo) * 100 : 0;
  const tasaGlobal            = tasaGlobalRaw % 1 === 0 ? tasaGlobalRaw.toFixed(0) : tasaGlobalRaw.toFixed(1);

  if (loading && !metricas) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem', gap: 14 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 10, height: 10, borderRadius: '50%',
            background: C.green,
            animation: `bounce 0.8s ease-in-out ${i * 0.15}s infinite alternate`,
          }} />
        ))}
      </div>
      <p style={{ margin: 0, color: C.textSub, fontSize: '0.9rem' }}>Cargando metricas del club...</p>
      <style>{`@keyframes bounce { from { transform: translateY(0); opacity: 0.4; } to { transform: translateY(-10px); opacity: 1; } }`}</style>
    </div>
  );

  if (error) return (
    <div style={{ padding: '3rem', textAlign: 'center', color: C.red }}>
      <XCircle size={40} />
      <p>{error}</p>
    </div>
  );

  return (
    <div className="metricas-container" style={{ background: C.bg, minHeight: '100%', padding: '2rem', fontFamily: 'inherit', position: 'relative' }}>

      {/* Overlay de carga al cambiar filtros */}
      {loading && metricas && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 9999,
          background: 'rgba(245, 245, 240, 0.75)',
          backdropFilter: 'blur(2px)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 14,
          borderRadius: 20,
        }}>
          <div style={{
            background: C.white, borderRadius: 20, padding: '2rem 3rem',
            boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
          }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: C.green,
                  animation: `bounce 0.8s ease-in-out ${i * 0.15}s infinite alternate`,
                }} />
              ))}
            </div>
            <div style={{ fontWeight: 700, color: C.greenMid, fontSize: '0.95rem' }}>Actualizando datos...</div>
            <div style={{ fontSize: '0.78rem', color: C.textHint }}>Calculando metricas del periodo</div>
          </div>
          <style>{`
            @keyframes bounce {
              from { transform: translateY(0); opacity: 0.4; }
              to   { transform: translateY(-10px); opacity: 1; }
            }
          `}</style>
        </div>
      )}

      {/* Filtros */}
      <div style={{
        background: C.white, borderRadius: 20, padding: '1.2rem 2rem',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: '1.8rem',
        display: 'flex', flexWrap: 'wrap', gap: '1.2rem', alignItems: 'center', justifyContent: 'space-between'
      }} className="metricas-filter-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ background: C.greenLight, borderRadius: 12, padding: 10, display: 'flex' }}>
            <Activity size={22} color={C.green} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: C.greenMid }}>Metricas del Club</div>
            <div style={{ fontSize: '0.75rem', color: C.textSub }}>
              {fechas.inicio && fechas.fin ? `${fechas.inicio} al ${fechas.fin}` : 'Selecciona un periodo'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {RANGOS.map(r => (
            <button key={r.id} onClick={() => setRango(r.id)} style={{
              padding: '0.45rem 1rem', borderRadius: 20, fontSize: '0.82rem', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.18s', border: `1.5px solid ${C.green}`,
              background: rango === r.id ? C.green : 'transparent',
              color:      rango === r.id ? '#fff'   : C.green,
            }}>{r.label}</button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={14} color={C.textHint} />
          <input type="date" name="inicio" value={fechas.inicio} onChange={handleDateChange} style={inputStyle} />
          <span style={{ color: C.textHint, fontWeight: 700 }}>a</span>
          <input type="date" name="fin"    value={fechas.fin}   onChange={handleDateChange} style={inputStyle} />
        </div>
      </div>

      {metricas && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem', maxWidth: 1440, margin: '0 auto' }}>

          {/* KPIs */}
          <div className="metricas-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.2rem' }}>
            <KpiCard icon={CheckCircle}   label="Clases Realizadas"    value={totalClasesRealizadas} sub="Completadas en el periodo"      accent={C.green}   light={C.greenLight} />
            <KpiCard icon={AlertTriangle} label="Inasistencias"        value={totalFaltas}           sub="Alumnas que no avisaron"        accent={C.red}     light={C.redLight} />
            <KpiCard icon={TrendingUp}    label="Tasa de Asistencia"   value={`${tasaGlobal}%`}      sub="Del total de clases agendadas"  accent={C.brown}   light={C.brownLight} />
            <KpiCard icon={Clock}         label="Horario mas Demandado" value={metricas.horario_estrella?.hora_inicio?.substring(0,5) ?? '--:--'} sub={`${metricas.horario_estrella?.total ?? 0} reservas acumuladas`} accent="#1565c0" light="#e3f2fd" />
          </div>

          {/* Tabla por nivel */}
          <SectionCard title="Rendimiento por Nivel de Clase" badge={`${metricas.metricas_por_clase?.length} niveles`} icon={BookOpen}>
            <div className="metricas-nivel-wrapper" style={{ overflowX: 'auto' }}>
              <table className="metricas-nivel-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px' }}>
                <thead>
                  <tr style={{ color: C.textHint, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 1 }}>
                    {['Nivel', 'Alumna Estrella', 'Mas Inasistencias', 'Horario mas Demandado', 'Clases Realizadas'].map((h, i) => (
                      <th key={i} style={{ padding: '0 1rem', textAlign: i === 4 ? 'right' : 'left', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {metricas.metricas_por_clase?.map((clase, idx) => {
                    const total  = Number(clase.total)        || 0;
                    const faltas = Number(clase.cancelaciones) || 0;
                    const suma   = total + faltas;
                    const tasa   = suma > 0 ? Math.round((total / suma) * 100) : 0;
                    const barColor = tasa >= 80 ? C.green : tasa >= 50 ? C.gold : C.red;

                    return (
                      <tr key={idx} className="nivel-row" style={{ background: '#fafaf8', transition: 'all 0.2s' }}>
                        <td style={{ padding: '1rem', borderRadius: '12px 0 0 12px', borderLeft: `5px solid ${NIVEL_COLORS[idx % NIVEL_COLORS.length]}` }}>
                          <span style={{ fontWeight: 800, color: C.greenMid, textTransform: 'capitalize' }}>{clase.nombre}</span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {clase.mejor_cliente
                            ? <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <Avatar name={clase.mejor_cliente.nombre} />
                                <div>
                                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: C.textMain }}>{clase.mejor_cliente.nombre}</div>
                                  <div style={{ fontSize: '0.72rem', color: C.green }}>{clase.mejor_cliente.total} clases</div>
                                </div>
                              </div>
                            : <span style={{ color: C.textHint }}>-</span>}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {clase.peor_cliente
                            ? <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <Avatar name={clase.peor_cliente.nombre} bg={C.redLight} fg={C.red} />
                                <div>
                                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: C.red }}>{clase.peor_cliente.nombre}</div>
                                  <div style={{ fontSize: '0.72rem', color: '#e57373' }}>{clase.peor_cliente.total} inasistencias</div>
                                </div>
                              </div>
                            : <span style={{ color: C.textHint }}>Sin registros</span>}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: '4px 10px', fontWeight: 800, fontSize: '0.9rem' }}>
                              {clase.horario_top?.hora_inicio?.substring(0,5) ?? '--:--'}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: C.textHint }}>{clase.horario_top?.total ?? 0} reservas</span>
                          </div>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right', borderRadius: '0 12px 12px 0' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: C.textMain }}>{total}</span>
                            <div style={{ fontSize: '0.7rem', color: C.textSub }}>Asistencia {tasa}%</div>
                            <div style={{ width: 60, height: 4, background: C.border, borderRadius: 2, overflow: 'hidden' }}>
                              <div style={{ width: `${tasa}%`, height: '100%', background: barColor, borderRadius: 2, transition: 'width 0.6s ease' }} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </SectionCard>

          {/* Ranking de jinetes + Desempenyo instructoras */}
          <div className="metricas-ranking-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.8rem' }}>

            {/* Top 5 Jinetes */}
            <SectionCard title="Alumnas más Constantes" badge="Top 5 del periodo" badgeColor={C.green} icon={Star}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {metricas.clientes_fieles?.map((c, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '10px 14px', borderRadius: 12,
                    background: i === 0 ? C.greenLight : '#fafafa',
                    border: `1px solid ${i === 0 ? C.green : 'transparent'}`,
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                      background: i === 0 ? C.green : C.border,
                      color: i === 0 ? '#fff' : C.textSub,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: '0.8rem'
                    }}>{i + 1}</div>
                    <div style={{ flex: 1, fontWeight: 700, fontSize: '0.9rem', color: C.textMain }}>{c.nombre} {c.apellido}</div>
                    <div style={{
                      background: C.white, border: `1px solid ${C.border}`,
                      borderRadius: 20, padding: '3px 10px',
                      fontSize: '0.78rem', fontWeight: 700, color: C.green
                    }}>{c.total} clases</div>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Instructoras */}
            <SectionCard title="Desempeno de Instructoras" badge="Productividad" badgeColor={C.brown} icon={Users}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {metricas.metricas_instructores?.map((inst, idx) => {
                  const maxClases = metricas.metricas_instructores[0]?.total_clases || 1;
                  const pct       = Math.round((inst.total_clases / maxClases) * 100);
                  const color     = INST_COLORS[idx % INST_COLORS.length];
                  const esActivo  = inst.disponibilidad === 'disponible';
                  const esDescanso = inst.disponibilidad === 'descanso';
                  const chipColor  = esActivo ? color : esDescanso ? '#f57f17' : '#9e9e9e';
                  const avatarBg   = esActivo ? `${color}22` : '#eeeeee';
                  const avatarFg   = esActivo ? color : '#9e9e9e';

                  return (
                    <div key={idx} style={{
                      padding: '12px 16px', borderRadius: 14,
                      borderLeft: `5px solid ${chipColor}`,
                      background: esActivo ? '#fafaf8' : esDescanso ? '#fffde7' : '#f0f0f0',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar name={inst.nombre} bg={avatarBg} fg={avatarFg} size={34} />
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: esActivo ? C.textMain : '#9e9e9e', textDecoration: (!esActivo && !esDescanso) ? 'line-through' : 'none' }}>{inst.nombre}</span>
                              {!esActivo && (
                                <span style={{
                                  fontSize: '0.65rem', fontWeight: 800, padding: '3px 10px', borderRadius: 6,
                                  background: esDescanso ? '#fff8e1' : '#eeeeee',
                                  color: esDescanso ? '#e65100' : '#757575',
                                  border: `1px solid ${esDescanso ? '#ffcc02' : '#bdbdbd'}`,
                                  letterSpacing: 0.3,
                                }}>
                                  {esDescanso ? '⏸ En descanso' : '✕ Inactivo'}
                                </span>
                              )}
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                              {inst.niveles?.map((niv, ni) => (
                                <span key={ni} style={{
                                  fontSize: '0.62rem', fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                                  background: `${chipColor}18`, color: chipColor, border: `1px solid ${chipColor}44`,
                                }}>{niv.nombre} <span style={{ opacity: 0.7 }}>({niv.total})</span></span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 900, fontSize: '1.15rem', color: esActivo ? C.textMain : '#9e9e9e' }}>{inst.total_clases}</div>
                          <div style={{ fontSize: '0.65rem', color: C.textHint, textTransform: 'uppercase' }}>clases dadas</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 5, background: C.border, borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: chipColor, borderRadius: 3, transition: 'width 0.6s ease' }} />
                        </div>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: C.textSub, flexShrink: 0 }}>{pct}% vs. líder</span>
                      </div>
                      {inst.mejor_alumna && (
                        <div style={{ marginTop: 6, fontSize: '0.72rem', color: C.textSub }}>
                          Alumna frecuente: <strong style={{ color: esActivo ? C.textMain : '#9e9e9e' }}>{inst.mejor_alumna.nombre} {inst.mejor_alumna.apellido}</strong> ({inst.mejor_alumna.total} clases)
                        </div>
                      )}
                    </div>
                  );
                })}
                {!metricas.metricas_instructores?.length && (
                  <div style={{ textAlign: 'center', padding: '2rem', color: C.textHint }}>Sin datos en este periodo.</div>
                )}
              </div>
            </SectionCard>

          </div>
        </div>
      )}

      <style>{`
        .nivel-row:hover { background: #f0f4ef !important; transform: translateX(4px); }
        input[type="date"] { color-scheme: light; }

        @media (max-width: 480px) {
          .metricas-container {
            padding: 0.6rem !important;
          }

          /* Barra de filtros compacta */
          .metricas-filter-bar {
            padding: 0.75rem !important;
            gap: 0.6rem !important;
            margin-bottom: 0.75rem !important;
            border-radius: 14px !important;
          }
          .metricas-filter-bar > div:first-child { gap: 8px !important; }
          .metricas-filter-bar > div:nth-child(2) { gap: 5px !important; }
          .metricas-filter-bar > div:nth-child(2) button {
            padding: 0.3rem 0.65rem !important;
            font-size: 0.72rem !important;
          }
          .metricas-filter-bar > div:nth-child(3) { gap: 5px !important; width: 100%; }
          .metricas-filter-bar > div:nth-child(3) input {
            font-size: 0.72rem !important;
            padding: 0.3rem 0.5rem !important;
            flex: 1;
          }

          /* KPI 2×2 compacto — sin sub-texto */
          .metricas-kpi-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 0.6rem !important;
          }
          .metricas-kpi-card {
            padding: 0.75rem 0.8rem !important;
            border-radius: 12px !important;
            gap: 4px !important;
          }
          .metricas-kpi-card > div:first-child { gap: 5px !important; }
          .metricas-kpi-card > div:first-child > div { padding: 5px !important; }
          .metricas-kpi-card > div:first-child span { font-size: 0.58rem !important; }
          .metricas-kpi-card > div:nth-child(2) { font-size: 1.5rem !important; }
          /* Ocultar sub-texto en móvil — ocupa demasiado */
          .metricas-kpi-card > div:nth-child(3) { display: none !important; }

          /* Section cards */
          .metricas-section-card {
            padding: 0.9rem !important;
            border-radius: 14px !important;
            overflow: visible !important;
          }
          .metricas-section-card > div:first-child { margin-bottom: 0.75rem !important; }
          .metricas-section-card h3 { font-size: 0.9rem !important; }

          /* Tabla niveles: scroll horizontal con todo visible */
          .metricas-nivel-wrapper {
            overflow-x: scroll !important;
            -webkit-overflow-scrolling: touch !important;
            max-width: 100% !important;
            display: block !important;
          }
          .metricas-nivel-table {
            min-width: 560px !important;
            width: auto !important;
          }
          .metricas-nivel-table th,
          .metricas-nivel-table td {
            white-space: nowrap !important;
            padding: 0.5rem 0.6rem !important;
            font-size: 0.78rem !important;
          }

          /* Ranking en 1 columna */
          .metricas-ranking-grid {
            grid-template-columns: 1fr !important;
            gap: 0.75rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MetricasResumen;
