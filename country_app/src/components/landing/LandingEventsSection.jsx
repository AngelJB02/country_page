import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

import boda1 from '../../img/boda.jpeg';
import image6 from '../../img/image-6.jpg';
import cumple from '../../img/refugio_cumple.jpeg';
import cena from '../../img/cena.jpeg';
import image10 from '../../img/image_10.jpg';

const LandingEventsSection = () => {
  const navigate = useNavigate();
  const sectionRef = useRef(null);

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

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // Section header
      const tl = gsap.timeline({
        scrollTrigger: { trigger: '.events-header', start: 'top 80%' },
      });
      tl.fromTo('.events-header h2',
        { autoAlpha: 0, y: 25 },
        { autoAlpha: 1, y: 0, duration: 0.6, ease: 'back.out(1.2)' }
      ).fromTo('.events-header p',
        { autoAlpha: 0, y: 15 },
        { autoAlpha: 1, y: 0, duration: 0.5 },
        '<0.15'
      );

      // Event cards batch reveal with scale
      ScrollTrigger.batch('.event-card', {
        start: 'top 85%',
        onEnter: (batch) => {
          gsap.fromTo(batch,
            { autoAlpha: 0, y: 50, scale: 0.95 },
            { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.12, ease: 'back.out(1.3)', overwrite: true }
          );
        },
      });
    });

    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set(['.events-header h2', '.events-header p', '.event-card'], { autoAlpha: 1, y: 0, scale: 1 });
    });
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} id="eventos" style={{
      padding: '100px 0',
      background: 'linear-gradient(180deg, #f3edce 0%, #efe7be 50%, #ebe1b0 100%)',
      position: 'relative',
    }}>
      {/* Top wave separator */}
      <svg style={{ position: 'absolute', top: '-1px', left: 0, width: '100%', height: '50px' }} viewBox="0 0 1440 50" preserveAspectRatio="none">
        <path d="M0,50 C480,5 960,40 1440,10 L1440,0 L0,0 Z" fill="#f3edce" />
      </svg>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        {/* Section Header */}
        <div className="events-header" style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            color: '#1c1917',
            marginBottom: '16px',
            fontWeight: 600,
            visibility: 'hidden',
          }}>
            Nuestros Eventos
          </h2>
          <p style={{
            color: '#57534e',
            fontSize: '18px',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: 1.7,
            visibility: 'hidden',
          }}>
            Descubre los diferentes tipos de celebraciones que puedes realizar
            en El Refugio
          </p>
        </div>

        {/* Events Grid */}
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
              className="event-card"
              onClick={() => handleEventClick(evento)}
              style={{
                backgroundColor: '#fff',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 4px 24px rgba(107, 68, 35, 0.1)',
                border: '1px solid rgba(107, 68, 35, 0.06)',
                transition: 'all 0.3s ease',
                cursor: evento.clickable ? 'pointer' : 'default',
                visibility: 'hidden',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 20px 50px rgba(107, 68, 35, 0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 24px rgba(107, 68, 35, 0.1)';
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
                  background: 'linear-gradient(180deg, transparent 40%, rgba(107,68,35,0.25) 100%)',
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
