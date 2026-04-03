import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';

import image1 from '../../img/image_1.png';
import image2 from '../../img/image_2.webp';
import image3 from '../../img/image_3.jpg';
import image4 from '../../img/image_4.webp';

const HeroSection = () => {
  const slides = [
    {
      image: image1,
      title: 'Bienvenido a El Refugio',
      subtitle: 'El lugar perfecto para tus celebraciones mas especiales',
    },
    {
      image: image2,
      title: 'Eventos Unicos',
      subtitle: 'Donde cada celebracion se convierte en un recuerdo inolvidable',
    },
    {
      image: image3,
      title: 'Naturaleza y Elegancia',
      subtitle: 'Un espacio disenado para hacer realidad tus suenos',
    },
    {
      image: image4,
      title: 'Tu Celebracion Perfecta',
      subtitle: 'Comienza aqui la planificacion de tu evento ideal',
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      {/* Background Swiper */}
      <Swiper
        modules={[Autoplay, EffectFade]}
        effect="fade"
        spaceBetween={0}
        slidesPerView={1}
        onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        speed={1500}
        loop
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
              <img
                src={slide.image}
                alt={`El Refugio - ${slide.title}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                loading={index === 0 ? 'eager' : 'lazy'}
              />
              {/* Dark overlay for text contrast */}
              <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.4)' }} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Content Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 16px',
      }}>
        <div style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
          {/* Animated Title */}
          <h1
            key={`title-${activeIndex}`}
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              color: '#fff',
              fontWeight: 600,
              marginBottom: '24px',
              textWrap: 'balance',
              animation: 'fadeInUp 0.6s ease forwards',
              textShadow: '2px 2px 8px rgba(0,0,0,0.5)',
            }}
          >
            {slides[activeIndex].title}
          </h1>

          {/* Animated Subtitle */}
          <p
            key={`subtitle-${activeIndex}`}
            style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: 300,
              marginBottom: '40px',
              maxWidth: '600px',
              margin: '0 auto 40px',
              textWrap: 'balance',
              animation: 'slideUp 0.6s ease forwards',
              animationDelay: '0.2s',
              opacity: 0,
              textShadow: '1px 1px 4px rgba(0,0,0,0.5)',
            }}
          >
            {slides[activeIndex].subtitle}
          </p>

          {/* CTA Button */}
          <button
            onClick={() => scrollToSection('contacto')}
            style={{
              backgroundColor: '#92400e',
              color: '#fff',
              padding: '16px 32px',
              borderRadius: '9999px',
              fontSize: '18px',
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
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
            Reservar mi Evento
          </button>
        </div>

        {/* Scroll Indicator */}
        <button
          onClick={() => scrollToSection('stats')}
          style={{
            position: 'absolute',
            bottom: '32px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            animation: 'bounce 2s infinite',
            cursor: 'pointer',
            background: 'none',
            border: 'none',
          }}
          aria-label="Scroll down"
        >
          <span style={{ fontSize: '14px', fontWeight: 300, letterSpacing: '1px' }}>Descubre mas</span>
          <ChevronDown size={24} />
        </button>
      </div>

      {/* Slide Indicators */}
      <div style={{
        position: 'absolute',
        bottom: '32px',
        right: '32px',
        zIndex: 10,
        display: 'flex',
        gap: '8px',
      }}
      className="slide-indicators"
      >
        {slides.map((_, index) => (
          <div
            key={index}
            style={{
              width: index === activeIndex ? '24px' : '8px',
              height: '8px',
              borderRadius: '9999px',
              backgroundColor: index === activeIndex ? '#fff' : 'rgba(255, 255, 255, 0.5)',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateX(-50%) translateY(0);
          }
          40% {
            transform: translateX(-50%) translateY(-10px);
          }
          60% {
            transform: translateX(-50%) translateY(-5px);
          }
        }
        @media (max-width: 768px) {
          .slide-indicators {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
