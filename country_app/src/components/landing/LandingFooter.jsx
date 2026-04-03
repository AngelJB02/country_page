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

  return (
    <footer className="bg-stone-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/El_refugio_logo.png"
                alt="El Refugio Logo"
                className="w-10 h-12 object-contain brightness-0 invert"
              />
              <span className="font-serif text-xl font-semibold tracking-wide">
                EL REFUGIO
              </span>
            </div>
            <p className="text-stone-400 leading-relaxed">
              Tu espacio ideal para celebraciones inolvidables, rodeado de
              naturaleza y elegancia.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">
              Enlaces Rapidos
            </h4>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => scrollToSection('hero')}
                  className="text-stone-400 hover:text-white transition-colors"
                >
                  Inicio
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('nosotros')}
                  className="text-stone-400 hover:text-white transition-colors"
                >
                  Nosotros
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('eventos')}
                  className="text-stone-400 hover:text-white transition-colors"
                >
                  Eventos
                </button>
              </li>
              <li>
                <a
                  href="/equitacion"
                  className="text-stone-400 hover:text-white transition-colors"
                >
                  Equitacion
                </a>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('contacto')}
                  className="text-stone-400 hover:text-white transition-colors"
                >
                  Contacto
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">Contacto</h4>
            <div className="space-y-3 text-stone-400 mb-6">
              <p>
                <a
                  href="tel:+529982144898"
                  className="hover:text-white transition-colors"
                >
                  +52 998 214 4898
                </a>
              </p>
              <p>
                <a
                  href="mailto:elrefugiocclub@gmail.com"
                  className="hover:text-white transition-colors"
                >
                  elrefugiocclub@gmail.com
                </a>
              </p>
            </div>

            <h4 className="font-serif text-lg font-semibold mb-4">Siguenos</h4>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-stone-800 rounded-lg hover:bg-amber-800 transition-colors group"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5 text-stone-400 group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-stone-800">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-stone-500 text-sm">
              &copy; {new Date().getFullYear()} El Refugio. Todos los derechos
              reservados.
            </p>
            <div className="flex gap-6 text-sm text-stone-500">
              <a href="/login" className="hover:text-white transition-colors">
                Acceso Admin
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
