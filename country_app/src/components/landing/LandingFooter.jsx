import React from 'react';
import { Facebook, Instagram, MessageCircle } from 'lucide-react';

const LandingFooter = () => {
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

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

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
    <footer style={{ backgroundColor: '#371f11', color: '#fff' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '64px 24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '48px',
        }}>
          {/* Brand Section */}
          <div>
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
          <div>
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
                { label: 'Inicio', section: 'hero' },
                { label: 'Nosotros', section: 'nosotros' },
                { label: 'Eventos', section: 'eventos' },
                { label: 'Contacto', section: 'contacto' },
              ].map((item) => (
                <li key={item.section} style={{ marginBottom: '12px' }}>
                  <button
                    onClick={() => scrollToSection(item.section)}
                    style={linkStyle}
                    onMouseOver={(e) => e.target.style.color = '#fff'}
                    onMouseOut={(e) => e.target.style.color = '#a8a29e'}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
              <li style={{ marginBottom: '12px' }}>
                <a
                  href="/equitacion"
                  style={linkStyle}
                  onMouseOver={(e) => e.target.style.color = '#fff'}
                  onMouseOut={(e) => e.target.style.color = '#a8a29e'}
                >
                  Equitacion
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
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
