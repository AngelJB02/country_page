import React, { useState, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

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
  const containerRef = useRef(null);

  const scrollToSection = (sectionId) => {
    gsap.to(window, {
      scrollTo: { y: `#${sectionId}`, offsetY: 80 },
      duration: 0.8,
      ease: 'power2.inOut',
    });
  };

  // Hero text entrance animation
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline({ defaults: { ease: 'back.out(1.2)' } });
      tl.fromTo('.hero-title',
        { autoAlpha: 0, y: 40, scale: 0.97 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.8 }
      )
      .fromTo('.hero-subtitle',
        { autoAlpha: 0, y: 25 },
        { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power2.out' },
        '<0.2'
      )
      .fromTo('.hero-cta',
        { autoAlpha: 0, y: 20, scale: 0.9 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.6 },
        '<0.15'
      );
    });
    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set(['.hero-title', '.hero-subtitle', '.hero-cta'], { autoAlpha: 1, y: 0, scale: 1 });
    });
  }, { scope: containerRef, dependencies: [activeIndex], revertOnUpdate: true });

  // Scroll indicator bounce
  useGSAP(() => {
    gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
      gsap.to('.scroll-indicator', {
        y: -10,
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
      });
    });
  }, { scope: containerRef });

  return (
    <section
      ref={containerRef}
      id="hero"
      style={{
        position: 'relative',
        width: '100%',
        height: 'calc(100vh + 80px)',
        marginTop: '-80px',
        paddingTop: '0',
        overflow: 'hidden'
      }}
    >
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
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index} style={{ width: '100%', height: '100%' }}>
            <div style={{ position: 'relative', width: '100%', height: 'calc(100vh + 80px)' }}>
              <img
                src={slide.image}
                alt={`El Refugio - ${slide.title}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center center',
                  display: 'block'
                }}
                loading={index === 0 ? 'eager' : 'lazy'}
              />
              {/* Cinematic gradient overlay */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.4) 70%, rgba(55,31,17,0.7) 100%)',
              }} />
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
        padding: '80px 16px 0 16px',
      }}>
        <div style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
          <h1
            key={`title-${activeIndex}`}
            className="hero-title"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              color: '#fff',
              fontWeight: 600,
              marginBottom: '24px',
              textWrap: 'balance',
              textShadow: '2px 4px 12px rgba(0,0,0,0.4)',
              visibility: 'hidden',
            }}
          >
            {slides[activeIndex].title}
          </h1>

          <p
            key={`subtitle-${activeIndex}`}
            className="hero-subtitle"
            style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: 300,
              marginBottom: '40px',
              maxWidth: '600px',
              margin: '0 auto 40px',
              textWrap: 'balance',
              textShadow: '1px 2px 6px rgba(0,0,0,0.4)',
              visibility: 'hidden',
            }}
          >
            {slides[activeIndex].subtitle}
          </p>

          <button
            onClick={() => scrollToSection('contacto')}
            className="hero-cta"
            style={{
              backgroundColor: '#845624',
              color: '#fff',
              padding: '16px 32px',
              borderRadius: '9999px',
              fontSize: '18px',
              fontWeight: 500,
              border: '1px solid rgba(255,255,255,0.15)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
              visibility: 'hidden',
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#6b4423';
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 15px 40px -5px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.15)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#845624';
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 10px 30px -5px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)';
            }}
          >
            Reservar mi Evento
          </button>
        </div>

        {/* Scroll Indicator */}
        <button
          onClick={() => scrollToSection('stats')}
          className="scroll-indicator"
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
        #hero {
          height: calc(100vh + 80px) !important;
        }
        #hero .swiper,
        #hero .swiper-wrapper,
        #hero .swiper-slide,
        #hero .swiper-slide > div {
          height: calc(100vh + 80px) !important;
        }
        #hero .swiper-slide img {
          height: calc(100vh + 80px) !important;
          object-fit: cover;
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
