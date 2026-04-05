import React, { useRef } from 'react';
import { Facebook, Instagram, MessageCircle } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

const LandingFooter = () => {
  const footerRef = useRef(null);

  useGSAP(() => {
    gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo('.footer-content > div',
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.1,
          scrollTrigger: { trigger: '.footer-content', start: 'top 90%' } }
      );
    });
    gsap.matchMedia().add('(prefers-reduced-motion: reduce)', () => {
      gsap.set('.footer-content > div', { autoAlpha: 1, y: 0 });
    });
  }, { scope: footerRef });
  const socialLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      href: 'https://www.facebook.com/people/Elrefugio_country_club/100083084179417/',
    },
    {
      name: 'Instagram',
      icon: Instagram,
      href: 'https://www.instagram.com/elrefugio_country_club/',
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      href: 'https://wa.me/529982144898',
    },
  ];

  const linkStyle = {
    color: '#a8a29e',
    textDecoration: 'none',
    transition: 'color 0.2s ease',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    fontSize: '15px',
  };

  return (
    <footer ref={footerRef} style={{
      background: 'linear-gradient(180deg, #3d2415 0%, #371f11 40%, #2c1a0e 100%)',
      color: '#fff',
      position: 'relative',
    }}>
      {/* Top wave separator */}
      <svg style={{ position: 'absolute', top: '-1px', left: 0, width: '100%', height: '40px' }} viewBox="0 0 1440 40" preserveAspectRatio="none">
        <path d="M0,40 C360,8 720,35 1080,15 C1260,5 1380,20 1440,10 L1440,0 L0,0 Z" fill="#dfd09a" />
      </svg>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '64px 24px' }}>
        <div className="footer-content" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '48px',
        }}>
          {/* Brand Section */}
          <div style={{ visibility: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <img
                src="/El_refugio_logo.png"
                alt="El Refugio Logo"
                style={{
                  width: '40px',
                  height: '48px',
                  objectFit: 'contain',
                  filter: 'brightness(0) invert(1)',
                }}
              />
              <span style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '20px',
                fontWeight: 600,
                letterSpacing: '1px',
              }}>
                EL REFUGIO
              </span>
            </div>
            <p style={{
              color: '#a8a29e',
              lineHeight: 1.7,
              fontSize: '15px',
            }}>
              Tu espacio ideal para celebraciones inolvidables, rodeado de
              naturaleza y elegancia.
            </p>
          </div>

          {/* Quick Links */}
          <div style={{ visibility: 'hidden' }}>
            <h4 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '18px',
              fontWeight: 600,
              marginBottom: '16px',
            }}>
              Enlaces Rapidos
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { label: 'Inicio', href: '/#hero' },
                { label: 'Nosotros', href: '/#nosotros' },
                { label: 'Eventos', href: '/#eventos' },
                { label: 'Contacto', href: '/#contacto' },
                { label: 'Equitacion', href: '/equitacion' },
              ].map((item) => (
                <li key={item.label} style={{ marginBottom: '12px' }}>
                  <a
                    href={item.href}
                    style={linkStyle}
                    onMouseOver={(e) => e.target.style.color = '#fff'}
                    onMouseOut={(e) => e.target.style.color = '#a8a29e'}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Social */}
          <div style={{ visibility: 'hidden' }}>
            <h4 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '18px',
              fontWeight: 600,
              marginBottom: '16px',
            }}>
              Contacto
            </h4>
            <div style={{ marginBottom: '24px' }}>
              <p style={{ marginBottom: '8px' }}>
                <a
                  href="tel:+529982144898"
                  style={linkStyle}
                  onMouseOver={(e) => e.target.style.color = '#fff'}
                  onMouseOut={(e) => e.target.style.color = '#a8a29e'}
                >
                  +52 998 214 4898
                </a>
              </p>
              <p>
                <a
                  href="mailto:elrefugiocclub@gmail.com"
                  style={linkStyle}
                  onMouseOver={(e) => e.target.style.color = '#fff'}
                  onMouseOut={(e) => e.target.style.color = '#a8a29e'}
                >
                  elrefugiocclub@gmail.com
                </a>
              </p>
            </div>

            <h4 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '18px',
              fontWeight: 600,
              marginBottom: '16px',
            }}>
              Siguenos
            </h4>
            <div style={{ display: 'flex', gap: '12px' }}>
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    style={{
                      padding: '10px',
                      backgroundColor: '#5f3c24',
                      borderRadius: '10px',
                      transition: 'background-color 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#a57429'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#5f3c24'}
                  >
                    <IconComponent size={20} color="#a8a29e" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          marginTop: '48px',
          paddingTop: '32px',
          borderTop: '1px solid #5f3c24',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
        }}>
          <p style={{ color: '#78716c', fontSize: '14px', margin: 0 }}>
            &copy; {new Date().getFullYear()} El Refugio. Todos los derechos reservados.
          </p>
          <a
            href="/login"
            style={{ ...linkStyle, fontSize: '14px' }}
            onMouseOver={(e) => e.target.style.color = '#fff'}
            onMouseOut={(e) => e.target.style.color = '#a8a29e'}
          >
            Acceso Admin
          </a>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
