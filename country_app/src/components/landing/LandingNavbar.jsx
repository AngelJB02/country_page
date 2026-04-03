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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img
              src="/El_refugio_logo.png"
              alt="El Refugio Logo"
              className="w-10 h-12 object-contain"
            />
            <span
              className={`font-serif text-lg font-semibold tracking-wide transition-colors duration-300 ${
                isScrolled ? 'text-brown' : 'text-white'
              }`}
            >
              EL REFUGIO
            </span>
          </div>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.section}>
                <button
                  onClick={() => scrollToSection(link.section)}
                  className={`text-sm font-medium tracking-wide transition-colors duration-300 hover:opacity-80 ${
                    isScrolled ? 'text-stone-700' : 'text-white'
                  }`}
                >
                  {link.label}
                </button>
              </li>
            ))}
            <li>
              <a
                href="/equitacion"
                className={`text-sm font-medium tracking-wide transition-colors duration-300 hover:opacity-80 ${
                  isScrolled ? 'text-stone-700' : 'text-white'
                }`}
              >
                Equitacion
              </a>
            </li>
            <li>
              <button
                onClick={() => scrollToSection('contacto')}
                className="bg-amber-800 text-white px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:bg-amber-900 hover:scale-105"
              >
                Reservar
              </button>
            </li>
          </ul>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              isScrolled ? 'text-stone-800' : 'text-white'
            }`}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed inset-0 top-20 bg-white/98 backdrop-blur-lg transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <ul className="flex flex-col items-center gap-6 pt-12">
          {navLinks.map((link) => (
            <li key={link.section}>
              <button
                onClick={() => scrollToSection(link.section)}
                className="text-lg font-medium text-stone-700 hover:text-amber-800 transition-colors"
              >
                {link.label}
              </button>
            </li>
          ))}
          <li>
            <a
              href="/equitacion"
              className="text-lg font-medium text-stone-700 hover:text-amber-800 transition-colors"
            >
              Equitacion
            </a>
          </li>
          <li className="mt-4">
            <button
              onClick={() => scrollToSection('contacto')}
              className="bg-amber-800 text-white px-8 py-3 rounded-full text-base font-medium transition-all duration-300 hover:bg-amber-900"
            >
              Reservar Ahora
            </button>
          </li>
        </ul>
      </div>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 top-20 bg-black/20 -z-10"
          onClick={() => {
            setIsMobileMenuOpen(false);
            document.body.style.overflow = 'auto';
          }}
        />
      )}
    </nav>
  );
};

export default LandingNavbar;
