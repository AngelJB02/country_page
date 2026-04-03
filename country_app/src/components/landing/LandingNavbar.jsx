import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const LandingNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
      document.body.style.overflow = 'auto';
    }
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

  const navLinks = [
    { label: 'Inicio', section: 'hero' },
    { label: 'Nosotros', section: 'nosotros' },
    { label: 'Eventos', section: 'eventos' },
    { label: 'Contacto', section: 'contacto' },
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transition: 'all 0.3s ease',
        backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
        backdropFilter: isScrolled ? 'blur(12px)' : 'none',
        boxShadow: isScrolled ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '80px' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                color: isScrolled ? '#6B4423' : '#fff',
                transition: 'color 0.3s ease',
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
              <li key={link.section} style={{ listStyle: 'none' }}>
                <button
                  onClick={() => scrollToSection(link.section)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: 500,
                    letterSpacing: '0.5px',
                    color: isScrolled ? '#44403c' : '#fff',
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
            <li style={{ listStyle: 'none' }}>
              <a
                href="/equitacion"
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  letterSpacing: '0.5px',
                  color: isScrolled ? '#44403c' : '#fff',
                  textDecoration: 'none',
                  transition: 'opacity 0.3s ease',
                }}
                onMouseOver={(e) => e.target.style.opacity = '0.7'}
                onMouseOut={(e) => e.target.style.opacity = '1'}
              >
                Equitacion
              </a>
            </li>
            <li style={{ listStyle: 'none' }}>
              <button
                onClick={() => scrollToSection('contacto')}
                style={{
                  backgroundColor: '#92400e',
                  color: '#fff',
                  padding: '10px 20px',
                  borderRadius: '9999px',
                  fontSize: '14px',
                  fontWeight: 500,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#78350f';
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#92400e';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                Reservar Ahora
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
              color: isScrolled ? '#1c1917' : '#fff',
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
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(12px)',
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
            <li key={link.section} style={{ listStyle: 'none' }}>
              <button
                onClick={() => scrollToSection(link.section)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '18px',
                  fontWeight: 500,
                  color: '#44403c',
                  cursor: 'pointer',
                  transition: 'color 0.3s ease',
                }}
              >
                {link.label}
              </button>
            </li>
          ))}
          <li style={{ listStyle: 'none' }}>
            <a
              href="/equitacion"
              style={{
                fontSize: '18px',
                fontWeight: 500,
                color: '#44403c',
                textDecoration: 'none',
              }}
            >
              Equitacion
            </a>
          </li>
          <li style={{ listStyle: 'none', marginTop: '16px' }}>
            <button
              onClick={() => scrollToSection('contacto')}
              style={{
                backgroundColor: '#92400e',
                color: '#fff',
                padding: '12px 32px',
                borderRadius: '9999px',
                fontSize: '16px',
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Reservar Ahora
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
