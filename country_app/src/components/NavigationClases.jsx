import React, { useState, useEffect } from 'react';
import Logo from './Logo';
import { useNavigate } from 'react-router-dom'; // 👈 importa aquí

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate(); // 👈 inicializa navigate

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

  return (
    <nav className={`navigation ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <div className="nav-logo">
          <Logo size="small" />
        </div>
        
        {/* Botón Hamburguesa */}
        <button 
          className={`hamburger-menu ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        
        <ul className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
  
          <li>
            {/* 👇 este cambia de scroll a navigate */}
            <button onClick={() => navigate('/')}>Inicio</button>
          </li>
        </ul>
        
        {isMobileMenuOpen && (
          <div 
            className="mobile-menu-overlay" 
            onClick={() => {
              setIsMobileMenuOpen(false);
              document.body.style.overflow = 'auto';
            }}
          ></div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
