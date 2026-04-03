import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';

import boda1 from '../../img/boda.jpeg';
import image6 from '../../img/image-6.jpg';
import cumple from '../../img/refugio_cumple.jpeg';
import cena from '../../img/cena.jpeg';
import image10 from '../../img/image_10.jpg';

const LandingEventsSection = () => {
  const navigate = useNavigate();

  const eventos = [
    {
      id: 1,
      titulo: 'Bodas al Aire Libre',
      descripcion:
        'Celebra el dia mas importante de tu vida en un entorno natural unico.',
      imagen: boda1,
      caracteristicas: [
        'Capacidad para 600 personas',
        'Ceremonia al aire libre',
        'Catering incluido',
      ],
    },
    {
      id: 2,
      titulo: 'Eventos Corporativos',
      descripcion:
        'Organiza reuniones de trabajo y retiros empresariales en un ambiente relajado.',
      imagen: image6,
      caracteristicas: [
        'Espacios adaptables',
        'Equipos audiovisuales',
        'Team building',
      ],
    },
    {
      id: 3,
      titulo: 'Celebraciones Familiares',
      descripcion:
        'Cumpleanos, aniversarios y cualquier celebracion especial que quieras hacer memorable.',
      imagen: cumple,
      caracteristicas: [
        'Ambiente familiar',
        'Juegos para ninos',
        'Flexibilidad de horarios',
      ],
    },
    {
      id: 4,
      titulo: 'Retiros y Talleres',
      descripcion:
        'Espacio perfecto para retiros espirituales y actividades de crecimiento personal.',
      imagen: cena,
      caracteristicas: [
        'Conexion con la naturaleza',
        'Ambientes tranquilos',
        'Espacios meditativos',
      ],
    },
    {
      id: 5,
      titulo: 'Clases de Equitacion',
      descripcion:
        'Aprende a montar en caballo con paseos guiados y clases para todas las edades.',
      imagen: image10,
      caracteristicas: [
        'Paseos guiados',
        'Clases de equitacion',
        'Instructores certificados',
      ],
      clickable: true,
    },
  ];

  const handleEventClick = (evento) => {
    if (evento.clickable) {
      navigate('/equitacion');
    }
  };

  return (
    <section id="eventos" style={{ padding: '100px 0', backgroundColor: '#f3edce' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            color: '#1c1917',
            marginBottom: '16px',
            fontWeight: 600,
          }}>
            Nuestros Eventos
          </h2>
          <p style={{
            color: '#57534e',
            fontSize: '18px',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: 1.7,
          }}>
            Descubre los diferentes tipos de celebraciones que puedes realizar
            en El Refugio
          </p>
        </div>

        {/* Events Grid - 3 columns, top row 3 + bottom row 2 centered */}
        <div
          className="events-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
          }}
        >
          {eventos.map((evento) => (
            <div
              key={evento.id}
              onClick={() => handleEventClick(evento)}
              style={{
                backgroundColor: '#fff',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(107, 68, 35, 0.08)',
                border: '1px solid rgba(107, 68, 35, 0.08)',
                transition: 'all 0.3s ease',
                cursor: evento.clickable ? 'pointer' : 'default',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(107, 68, 35, 0.12)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(107, 68, 35, 0.08)';
              }}
            >
              {/* Image */}
              <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                <img
                  src={evento.imagen}
                  alt={evento.titulo}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.5s ease',
                  }}
                  loading="lazy"
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.3) 100%)',
                }} />
              </div>

              {/* Content */}
              <div style={{ padding: '24px' }}>
                <h3 style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: '22px',
                  color: '#1c1917',
                  marginBottom: '12px',
                  fontWeight: 600,
                }}>
                  {evento.titulo}
                </h3>
                <p style={{
                  color: '#57534e',
                  fontSize: '15px',
                  lineHeight: 1.7,
                  marginBottom: '16px',
                }}>
                  {evento.descripcion}
                </p>

                {/* Features List */}
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {evento.caracteristicas.map((caracteristica, idx) => (
                    <li
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '8px',
                        fontSize: '14px',
                        color: '#57534e',
                      }}
                    >
                      <Check size={16} color="#845624" strokeWidth={2} />
                      <span>{caracteristica}</span>
                    </li>
                  ))}
                </ul>

                {/* Arrow for clickable items */}
                {evento.clickable && (
                  <div style={{
                    marginTop: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#845624',
                    fontWeight: 500,
                    fontSize: '14px',
                  }}>
                    <span>Ver mas</span>
                    <ArrowRight size={16} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .events-grid {
          justify-items: center;
        }
        .events-grid > *:nth-child(4),
        .events-grid > *:nth-child(5) {
          grid-column: auto;
        }
        /* Center the last 2 cards: use a 6-col subgrid trick */
        @supports (grid-template-columns: repeat(6, 1fr)) {
          .events-grid {
            grid-template-columns: repeat(6, 1fr) !important;
          }
          .events-grid > *:nth-child(1) { grid-column: 1 / 3; }
          .events-grid > *:nth-child(2) { grid-column: 3 / 5; }
          .events-grid > *:nth-child(3) { grid-column: 5 / 7; }
          .events-grid > *:nth-child(4) { grid-column: 2 / 4; }
          .events-grid > *:nth-child(5) { grid-column: 4 / 6; }
        }
        @media (max-width: 900px) {
          .events-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .events-grid > * {
            grid-column: auto !important;
          }
        }
        @media (max-width: 600px) {
          .events-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
};

export default LandingEventsSection;
