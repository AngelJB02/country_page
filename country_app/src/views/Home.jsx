// src/views/Home.jsx
import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// CSS
import "../CSS/variables.css";
import "../CSS/index.css";
import "../CSS/event-banner.css";
import "../CSS/swiper_styles.css";

// Imágenes
import image1 from "../img/image_1.png";
import image2 from "../img/image_2.webp";
import image3 from "../img/image_3.jpg";
import image4 from "../img/image_4.webp";

// Componentes
import Navigation from "../components/Navigation";
import EventBanner from "../components/EventBanner";
import AboutSection from "../components/AboutSection";
import EventsSection from "../components/EventsSection";
import ContactForm from "../components/ContactForm";
import Footer from "../components/Footer";

const Home = () => {
const slides = [
    { image: image1, title: "Bienvenido a El Refugio", subtitle: "El lugar perfecto para tus celebraciones más especiales" },
    { image: image2, title: "Eventos Únicos", subtitle: "Donde cada celebración se convierte en un recuerdo inolvidable" },
    { image: image3, title: "Naturaleza y Elegancia", subtitle: "Un espacio diseñado para hacer realidad tus sueños" },
    { image: image4, title: "Tu Celebración Perfecta", subtitle: "Comienza aquí la planificación de tu evento ideal" },
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <Navigation />

      {/* Hero Section */}
      <section id="hero" className="hero-section">
        <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
          <Swiper
            spaceBetween={0}
            slidesPerView={1}
            onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
            onSwiper={(swiper) => setActiveIndex(swiper.activeIndex)}
            style={{ width: '100%', height: '100vh' }}
            modules={[Autoplay]}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            speed={1700}
          >
            {slides.map((slide, index) => (
              <SwiperSlide key={index}>
                <img
                  src={slide.image}
                  alt={`Slide ${index + 1}`}
                  style={{ width: '100%', height: '100vh', objectFit: 'cover' }}
                />
              </SwiperSlide>
            ))}
          </Swiper>

          <div
            className="swiper-slide-content"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: '#fff',
              textAlign: 'center',
              zIndex: 10,
              width: '90%',
              maxWidth: '800px',
            }}
          >
            <h1 className="swiper-slide-title">{slides[activeIndex].title}</h1>
            <p className="swiper-slide-subtitle">{slides[activeIndex].subtitle}</p>
            <button onClick={() => scrollToSection('contacto')} className="cta-button rustic-button">
              Reservar mi Evento
            </button>
          </div>

          {/* Scroll indicator */}
          <div
            className="scroll-indicator"
            onClick={() => scrollToSection('banner-evento')}
            style={{
              position: 'absolute',
              bottom: '30px',
              left: '50%',
              transform: 'translateX(-50%)',
              color: '#fff',
              cursor: 'pointer',
              zIndex: 10,
              textAlign: 'center',
              animation: 'bounce 2s infinite',
            }}
          >
            <p style={{ fontSize: '0.9rem' }}>Descubre más</p>
            <div style={{ fontSize: '1.5rem' }}>↓</div>
          </div>
        </div>
      </section>




      {/* Secciones principales */}
      <EventBanner />
      <AboutSection />
      <EventsSection />
      <ContactForm />
      <Footer />
    </>
  );
};

export default Home;
