import React from 'react';
import { Leaf, Home, Users, Star } from 'lucide-react';
import ElRefugio from '../../img/ElrefugioCountryclub.webp';

const LandingAboutSection = () => {
  const features = [
    {
      icon: Leaf,
      title: 'Entorno Natural',
      description: 'Rodeado de vegetacion y paisajes que brindan un ambiente de paz y tranquilidad.',
    },
    {
      icon: Home,
      title: 'Instalaciones Premium',
      description: 'Espacios versatiles y bien equipados para todo tipo de eventos.',
    },
    {
      icon: Users,
      title: 'Servicio Personalizado',
      description: 'Atencion dedicada para hacer realidad la celebracion de tus suenos.',
    },
    {
      icon: Star,
      title: 'Experiencia Unica',
      description: 'Cada evento es una experiencia memorable e irrepetible.',
    },
  ];

  return (
    <section id="nosotros" style={{ backgroundColor: '#FAF8F5', padding: '120px 0' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* Split Layout - Magazine Style */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '48px',
          alignItems: 'center',
          marginBottom: '100px',
        }}
        className="about-grid"
        >
          {/* Image Column - Takes 7 columns */}
          <div style={{ gridColumn: 'span 7' }} className="about-image-col">
            <div style={{
              position: 'relative',
            }}>
              <img
                src={ElRefugio}
                alt="El Refugio Country Club - Vista panoramica"
                style={{
                  width: '100%',
                  height: '600px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  display: 'block',
                }}
                loading="lazy"
              />
              {/* Decorative accent */}
              <div style={{
                position: 'absolute',
                bottom: '-24px',
                right: '-24px',
                width: '200px',
                height: '200px',
                backgroundColor: '#835634',
                borderRadius: '8px',
                zIndex: -1,
              }} className="decorative-accent" />
            </div>
          </div>

          {/* Text Column - Takes 5 columns */}
          <div style={{ gridColumn: 'span 5' }} className="about-text-col">
            {/* Eyebrow */}
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: '#92400e',
              marginBottom: '16px',
            }}>
              Nuestra Historia
            </p>

            {/* Title */}
            <h2 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
              color: '#1c1917',
              fontWeight: 500,
              lineHeight: 1.1,
              marginBottom: '32px',
            }}>
              Sobre El Refugio
            </h2>

            {/* Subtitle */}
            <p style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '20px',
              fontStyle: 'italic',
              color: '#92400e',
              marginBottom: '24px',
              lineHeight: 1.6,
            }}>
              Un espacio donde la naturaleza y la elegancia se encuentran para crear momentos inolvidables.
            </p>

            {/* Body Text */}
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '16px',
              color: '#57534e',
              lineHeight: 1.8,
              marginBottom: '20px',
            }}>
              En El Refugio, cada evento se convierte en una experiencia unica. Nuestro espacio combina la tranquilidad del entorno natural con instalaciones modernas y elegantes, creando el ambiente perfecto para cualquier celebracion especial.
            </p>

            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '16px',
              color: '#57534e',
              lineHeight: 1.8,
              marginBottom: '32px',
            }}>
              Desde bodas intimas hasta grandes eventos corporativos, nuestro compromiso es hacer de tu evento un momento memorable que perdure en el tiempo.
            </p>

            {/* CTA Link */}
            <a
              href="#contacto"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: "'Inter', sans-serif",
                fontSize: '14px',
                fontWeight: 600,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                color: '#835634',
                textDecoration: 'none',
                borderBottom: '2px solid #835634',
                paddingBottom: '4px',
                transition: 'all 0.3s ease',
              }}
              onMouseOver={(e) => {
                e.target.style.color = '#92400e';
                e.target.style.borderBottomColor = '#92400e';
              }}
              onMouseOut={(e) => {
                e.target.style.color = '#835634';
                e.target.style.borderBottomColor = '#835634';
              }}
            >
              Conoce mas sobre nosotros
              <span style={{ fontSize: '18px' }}>→</span>
            </a>
          </div>
        </div>

        {/* Features Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '32px',
        }}
        className="features-grid"
        >
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                style={{
                  textAlign: 'center',
                  padding: '32px 24px',
                  transition: 'transform 0.3s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  marginBottom: '20px',
                  display: 'inline-flex',
                  padding: '16px',
                  backgroundColor: 'rgba(131, 86, 52, 0.1)',
                  borderRadius: '50%',
                }}>
                  <IconComponent size={28} color="#835634" strokeWidth={1.5} />
                </div>
                <h3 style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: '20px',
                  color: '#1c1917',
                  marginBottom: '12px',
                  fontWeight: 500,
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  color: '#57534e',
                  fontSize: '14px',
                  lineHeight: 1.7,
                }}>
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .about-grid {
            display: flex !important;
            flex-direction: column !important;
            gap: 48px !important;
          }
          .about-image-col,
          .about-text-col {
            grid-column: span 12 !important;
          }
          .about-image-col img {
            height: 400px !important;
          }
          .decorative-accent {
            display: none !important;
          }
          .features-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 640px) {
          .features-grid {
            grid-template-columns: 1fr !important;
          }
          .about-image-col img {
            height: 300px !important;
          }
        }
      `}</style>
    </section>
  );
};

export default LandingAboutSection;
