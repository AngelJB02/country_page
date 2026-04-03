import React from 'react';
import { Leaf, Home, Users } from 'lucide-react';
import ElRefugio from '../../img/ElrefugioCountryclub.webp';

const LandingAboutSection = () => {
  const features = [
    {
      icon: Leaf,
      title: 'Entorno Natural',
      description:
        'Rodeado de vegetacion y paisajes que brindan un ambiente de paz y tranquilidad, perfecto para desconectar.',
    },
    {
      icon: Home,
      title: 'Instalaciones Completas',
      description:
        'Espacios versatiles y bien equipados para todo tipo de eventos, con comodidades modernas.',
    },
    {
      icon: Users,
      title: 'Servicio Personalizado',
      description:
        'Atencion dedicada para hacer realidad la celebracion de tus suenos, cuidando cada detalle.',
    },
  ];

  return (
    <section id="nosotros" style={{ padding: '100px 0', backgroundColor: '#F5F1E8' }}>
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
            Sobre El Refugio
          </h2>
          <p style={{
            color: '#57534e',
            fontSize: '18px',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: 1.7,
          }}>
            Un espacio unico donde la naturaleza y la elegancia se encuentran
            para crear momentos inolvidables.
          </p>
        </div>

        {/* Main Content - Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '48px',
          alignItems: 'center',
          marginBottom: '64px',
        }}>
          {/* Image */}
          <div style={{
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
          }}>
            <img
              src={ElRefugio}
              alt="El Refugio Country Club - Vista panoramica"
              style={{
                width: '100%',
                height: '450px',
                objectFit: 'cover',
                display: 'block',
              }}
              loading="lazy"
            />
          </div>

          {/* Text Content */}
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '24px',
            padding: '40px',
            boxShadow: '0 10px 40px -10px rgba(107, 68, 35, 0.1)',
            border: '1px solid rgba(107, 68, 35, 0.1)',
          }}>
            <p style={{
              color: '#44403c',
              fontSize: '18px',
              lineHeight: 1.8,
              marginBottom: '24px',
            }}>
              En El Refugio, cada evento se convierte en una experiencia
              unica. Nuestro espacio combina la tranquilidad del entorno
              natural con instalaciones modernas y elegantes.
            </p>
            <p style={{
              color: '#57534e',
              fontSize: '16px',
              lineHeight: 1.8,
            }}>
              Creamos el ambiente perfecto para cualquier celebracion
              especial, desde bodas intimas hasta grandes eventos
              corporativos. Nuestro compromiso es hacer de tu evento un
              momento memorable.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
        }}>
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '20px',
                  padding: '32px',
                  boxShadow: '0 4px 20px rgba(107, 68, 35, 0.08)',
                  border: '1px solid rgba(107, 68, 35, 0.08)',
                  transition: 'all 0.3s ease',
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
                <div style={{
                  marginBottom: '20px',
                  display: 'inline-flex',
                  padding: '12px',
                  backgroundColor: 'rgba(146, 64, 14, 0.1)',
                  borderRadius: '12px',
                }}>
                  <IconComponent size={28} color="#92400e" strokeWidth={1.5} />
                </div>
                <h3 style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: '20px',
                  color: '#1c1917',
                  marginBottom: '12px',
                  fontWeight: 600,
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  color: '#57534e',
                  fontSize: '15px',
                  lineHeight: 1.7,
                }}>
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LandingAboutSection;
