import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import gsap from 'gsap';

const LandingNavbar = ({ variant = 'landing' }) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId) => {
    gsap.to(window, {
      scrollTo: { y: `#${sectionId}`, offsetY: 80 },
      duration: 0.8,
      ease: 'power2.inOut',
    });
    setIsMobileMenuOpen(false);
    document.body.style.overflow = 'auto';
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    document.body.style.overflow = !isMobileMenuOpen ? 'hidden' : 'auto';
  };

  useEffect(() => {
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const navLinks = variant === 'equitacion'
    ? [
        { label: 'Inicio', action: () => navigate('/') },
        { label: 'Clases', action: () => scrollToSection('clases') },
      ]
    : [
        { label: 'Inicio', action: () => scrollToSection('hero') },
        { label: 'Nosotros', action: () => scrollToSection('nosotros') },
        { label: 'Eventos', action: () => scrollToSection('eventos') },
        { label: 'Contacto', action: () => scrollToSection('contacto') },
      ];

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: '#6b4423',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '80px' }}>
          {/* Logo */}
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            <img
              src="/El_refugio_logo.png"
              alt="El Refugio Logo"
              style={{ width: '40px', height: '48px', objectFit: 'contain' }}
            />
            <span
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '18px',
                fontWeight: 600,
                letterSpacing: '1px',
                color: '#FEFBF6',
              }}
            >
              EL REFUGIO
            </span>
          </div>

          {/* Desktop Navigation */}
          <ul style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '32px', 
            listStyle: 'none', 
            margin: 0, 
            padding: 0,
          }}
          className="desktop-nav"
          >
            {navLinks.map((link) => (
              <li key={link.label} style={{ listStyle: 'none' }}>
                <button
                  onClick={link.action}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: 500,
                    letterSpacing: '0.5px',
                    color: '#FEFBF6',
                    cursor: 'pointer',
                    transition: 'opacity 0.3s ease',
                    padding: '8px 0',
                  }}
                  onMouseOver={(e) => e.target.style.opacity = '0.7'}
                  onMouseOut={(e) => e.target.style.opacity = '1'}
                >
                  {link.label}
                </button>
              </li>
            ))}
            {variant === 'landing' && (
              <li style={{ listStyle: 'none' }}>
                <a
                  href="/equitacion"
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    letterSpacing: '0.5px',
                    color: '#FEFBF6',
                    textDecoration: 'none',
                    transition: 'opacity 0.3s ease',
                  }}
                  onMouseOver={(e) => e.target.style.opacity = '0.7'}
                  onMouseOut={(e) => e.target.style.opacity = '1'}
                >
                  Equitacion
                </a>
              </li>
            )}
            <li style={{ listStyle: 'none' }}>
              <button
                onClick={() => navigate('/login')}
                style={{
                  backgroundColor: '#faf8ec',
                  color: '#6b4423',
                  padding: '10px 20px',
                  borderRadius: '9999px',
                  fontSize: '14px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#e8daa0';
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#faf8ec';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                Acceder a Plataforma
              </button>
            </li>
          </ul>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            style={{
              display: 'none',
              padding: '8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#FEFBF6',
            }}
            className="mobile-menu-btn"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          top: '80px',
          backgroundColor: '#6b4423',
          transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease',
          zIndex: 40,
        }}
        className="mobile-menu"
      >
        <ul style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '24px', 
          paddingTop: '48px',
          listStyle: 'none',
          margin: 0,
        }}>
          {navLinks.map((link) => (
            <li key={link.label} style={{ listStyle: 'none' }}>
              <button
                onClick={() => {
                  link.action();
                  setIsMobileMenuOpen(false);
                  document.body.style.overflow = 'auto';
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '18px',
                  fontWeight: 500,
                  color: '#FEFBF6',
                  cursor: 'pointer',
                  transition: 'color 0.3s ease',
                }}
              >
                {link.label}
              </button>
            </li>
          ))}
          {variant === 'landing' && (
            <li style={{ listStyle: 'none' }}>
              <a
                href="/equitacion"
                style={{
                  fontSize: '18px',
                  fontWeight: 500,
                  color: '#FEFBF6',
                  textDecoration: 'none',
                }}
              >
                Equitacion
              </a>
            </li>
          )}
          <li style={{ listStyle: 'none', marginTop: '16px' }}>
            <button
              onClick={() => navigate('/login')}
              style={{
                backgroundColor: '#faf8ec',
                color: '#6b4423',
                padding: '12px 32px',
                borderRadius: '9999px',
                fontSize: '16px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Acceder a Plataforma
            </button>
          </li>
        </ul>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
        }
        @media (min-width: 769px) {
          .mobile-menu {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
};

export default LandingNavbar;
