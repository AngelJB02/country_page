import React, { useState, useEffect } from 'react';
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
    <section id="hero" className="relative w-full h-screen overflow-hidden">
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
        className="absolute inset-0 w-full h-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="relative w-full h-screen">
              <img
                src={slide.image}
                alt={`El Refugio - ${slide.title}`}
                className="w-full h-full object-cover"
                loading={index === 0 ? 'eager' : 'lazy'}
              />
              {/* Dark overlay for text contrast */}
              <div className="absolute inset-0 bg-black/40" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Content Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-4xl mx-auto">
          {/* Animated Title */}
          <h1
            key={`title-${activeIndex}`}
            className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white font-semibold mb-6 text-balance animate-fade-in"
          >
            {slides[activeIndex].title}
          </h1>

          {/* Animated Subtitle */}
          <p
            key={`subtitle-${activeIndex}`}
            className="text-lg sm:text-xl md:text-2xl text-white/90 font-light mb-10 max-w-2xl mx-auto text-balance animate-slide-up"
          >
            {slides[activeIndex].subtitle}
          </p>

          {/* CTA Button */}
          <button
            onClick={() => scrollToSection('contacto')}
            className="group bg-amber-800 text-white px-8 py-4 rounded-full text-base sm:text-lg font-medium transition-all duration-300 hover:bg-amber-900 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Reservar mi Evento
          </button>
        </div>

        {/* Scroll Indicator */}
        <button
          onClick={() => scrollToSection('stats')}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white flex flex-col items-center gap-2 animate-bounce-slow cursor-pointer hover:opacity-80 transition-opacity"
          aria-label="Scroll down"
        >
          <span className="text-sm font-light tracking-wide">Descubre mas</span>
          <ChevronDown size={24} />
        </button>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 right-8 z-10 hidden md:flex gap-2">
        {slides.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === activeIndex ? 'bg-white w-6' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
