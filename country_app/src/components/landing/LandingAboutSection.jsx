import React, { useRef } from 'react';
import { Leaf, Home, Users, Star } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import ElRefugio from '../../img/ElrefugioCountryclub.webp';

const LandingAboutSection = () => {
  const sectionRef = useRef(null);

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

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add({
      isDesktop: '(min-width: 1025px)',
      isMobile: '(max-width: 1024px)',
      reduceMotion: '(prefers-reduced-motion: reduce)',
    }, (context) => {
      const { isDesktop, reduceMotion } = context.conditions;
      if (reduceMotion) {
        gsap.set(['.about-image-col', '.about-text-col', '.feature-card', '.decorative-accent'], { autoAlpha: 1, x: 0, y: 0, scale: 1 });
        return;
      }

      // Image column reveal
      gsap.fromTo('.about-image-col',
        { autoAlpha: 0, x: isDesktop ? -60 : 0, y: isDesktop ? 0 : 30 },
        { autoAlpha: 1, x: 0, y: 0, duration: 0.9, ease: 'power2.out',
          scrollTrigger: { trigger: '.about-image-col', start: 'top 80%' } }
      );

      // Decorative accent scale in
      gsap.fromTo('.decorative-accent',
        { scale: 0, autoAlpha: 0 },
        { scale: 1, autoAlpha: 1, duration: 0.7, ease: 'back.out(1.7)',
          scrollTrigger: { trigger: '.about-image-col', start: 'top 70%' } }
      );

      // Text column reveal
      gsap.fromTo('.about-text-col',
        { autoAlpha: 0, x: isDesktop ? 60 : 0, y: isDesktop ? 0 : 30 },
        { autoAlpha: 1, x: 0, y: 0, duration: 0.9, ease: 'power2.out',
          scrollTrigger: { trigger: '.about-text-col', start: 'top 80%' } }
      );

      // Feature cards batch reveal with scale
      ScrollTrigger.batch('.feature-card', {
        start: 'top 85%',
        onEnter: (elements) => {
          gsap.fromTo(elements,
            { autoAlpha: 0, y: 40, scale: 0.95 },
            { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.12, ease: 'back.out(1.4)', overwrite: true }
          );
        },
      });
    });
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} id="nosotros" style={{
      background: 'linear-gradient(180deg, #faf8ec 0%, #f7f2e0 60%, #f3edce 100%)',
      padding: '120px 0',
      position: 'relative',
    }}>
      {/* Top wave separator */}
      <svg style={{ position: 'absolute', top: '-1px', left: 0, width: '100%', height: '60px' }} viewBox="0 0 1440 60" preserveAspectRatio="none">
        <path d="M0,60 C360,10 720,50 1080,20 C1260,5 1380,25 1440,15 L1440,0 L0,0 Z" fill="#6b4423" />
      </svg>

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
          {/* Image Column */}
          <div style={{ gridColumn: 'span 7', visibility: 'hidden' }} className="about-image-col">
            <div style={{ position: 'relative' }}>
              <img
                src={ElRefugio}
                alt="El Refugio Country Club - Vista panoramica"
                style={{
                  width: '100%',
                  height: '600px',
                  objectFit: 'cover',
                  borderRadius: '12px',
                  boxShadow: '0 25px 60px -12px rgba(107, 68, 35, 0.3)',
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
                background: 'linear-gradient(135deg, #c09332, #a57429)',
                borderRadius: '12px',
                zIndex: -1,
                visibility: 'hidden',
              }} className="decorative-accent" />
            </div>
          </div>

          {/* Text Column */}
          <div style={{ gridColumn: 'span 5', visibility: 'hidden' }} className="about-text-col">
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: '#a57429',
              marginBottom: '16px',
            }}>
              Nuestra Historia
            </p>

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

            <p style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '20px',
              fontStyle: 'italic',
              color: '#a57429',
              marginBottom: '24px',
              lineHeight: 1.6,
            }}>
              Un espacio donde la naturaleza y la elegancia se encuentran para crear momentos inolvidables.
            </p>

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
                color: '#6b4423',
                textDecoration: 'none',
                borderBottom: '2px solid #6b4423',
                paddingBottom: '4px',
                transition: 'all 0.3s ease',
              }}
              onMouseOver={(e) => {
                e.target.style.color = '#a57429';
                e.target.style.borderBottomColor = '#a57429';
              }}
              onMouseOut={(e) => {
                e.target.style.color = '#6b4423';
                e.target.style.borderBottomColor = '#6b4423';
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
                className="feature-card"
                style={{
                  textAlign: 'center',
                  padding: '32px 24px',
                  transition: 'transform 0.3s ease',
                  visibility: 'hidden',
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
                  background: 'linear-gradient(135deg, rgba(107, 68, 35, 0.12), rgba(165, 116, 41, 0.08))',
                  borderRadius: '50%',
                  boxShadow: '0 4px 15px rgba(107, 68, 35, 0.08)',
                }}>
                  <IconComponent size={28} color="#6b4423" strokeWidth={1.5} />
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
