import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// CSS
import "../CSS/variables.css";
import "../CSS/index.css";
import "../CSS/Login.css";

// Imágenes slides
import image11 from "../img/image11.jpg";
import image12 from "../img/image12.jpg";
import image13 from "../img/image13.jpg";


// Imágenes clases
import class1Img from "../img/class1.jpg";
import class2Img from "../img/class2.jpg";
import class3Img from "../img/class3.jpg";

// Componentes
import NavigationClases from "../components/NavigationClases";
import Footer from "../components/Footer";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const Equitacion = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  const slides = [
    { image: image11, title: "¡Aprende a montar en caballo!", subtitle: "Descubre la emoción de montar a caballo en un entorno seguro y amigable" },
    { image: image12, title: "Clases de equitación para todas las edades", subtitle: "Ofrecemos clases personalizadas para principiantes y avanzados, con entrenadores expertos y caballos entrenados." },
    { image: image13, title: "Reserva tu clase hoy", subtitle: "No esperes más, reserva tu clase de equitación y comienza tu aventura ecuestre con nosotros." },
  ];

  const clases = [
    {
      id: 1,
      titulo: "Clases Básicas",
      descripcion: "Aprende los fundamentos de la equitación, desde la postura hasta el control del caballo.",
      imagen: class1Img,
      caracteristicas: ["Instrucción personalizada", "Caballos entrenados", "Duración 1 hora"],
    },
    {
      id: 2,
      titulo: "Clases Intermedias",
      descripcion: "Mejora tu técnica, aprende a trotar y galopar con seguridad y confianza.",
      imagen: class2Img,
      caracteristicas: ["Ejercicios avanzados", "Clases grupales o individuales", "Duración 1.5 horas"],
    },
    {
      id: 3,
      titulo: "Clases Avanzadas",
      descripcion: "Perfecciona tu habilidad con técnicas de salto y manejo avanzado del caballo.",
      imagen: class3Img,
      caracteristicas: ["Salto de obstáculos", "Competencias simuladas", "Duración 2 horas"],
    },
  ];

  useEffect(() => {
    const hero = document.getElementById("hero");
    if (hero) hero.scrollIntoView({ behavior: "auto" });
    }, []);
    

  return (
    <>
      <NavigationClases />

      {/* Hero Section */}
      <section id="hero" className="hero-section" style={{ margin: 0, padding: 0 }}>
        <div style={{ position: "relative", width: "100%", height: "100vh" }}>
          <Swiper
            spaceBetween={0}
            slidesPerView={1}
            onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
            onSwiper={(swiper) => setActiveIndex(swiper.activeIndex)}
            style={{ width: "100%", height: "100vh" }}
            modules={[Autoplay]}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            speed={1700}
          >
            {slides.map((slide, index) => (
              <SwiperSlide key={index}>
                <img
                  src={slide.image}
                  alt={`Slide ${index + 1}`}
                  style={{ width: "100%", height: "100vh", objectFit: "cover" }}
                />
              </SwiperSlide>
            ))}
          </Swiper>

          <div
            className="swiper-slide-content"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: "#fff",
              textAlign: "center",
              zIndex: 10,
              width: "90%",
              maxWidth: "800px",
            }}
          >
            <h1 className="swiper-slide-title">{slides[activeIndex].title}</h1>
            <p className="swiper-slide-subtitle">{slides[activeIndex].subtitle}</p>
            <button
              onClick={() => navigate("/login")}
              className="cta-button rustic-button"
            >
              Reservar mi clase
            </button>
          </div>

          {/* Scroll indicator */}
          <div
            className="scroll-indicator"
            onClick={() => scrollToSection("banner-evento")}
            style={{
              position: "absolute",
              bottom: "30px",
              left: "50%",
              transform: "translateX(-50%)",
              color: "#fff",
              cursor: "pointer",
              zIndex: 10,
              textAlign: "center",
              animation: "bounce 2s infinite",
            }}
          >
            <p style={{ fontSize: "0.9rem" }}>Descubre más</p>
            <div style={{ fontSize: "1.5rem" }}>↓</div>
          </div>
        </div>
      </section>

      {/* Sección Información General */}
      <section className="container" style={{ marginTop: "2rem", marginBottom: "2rem" }}>
        <div className="section-header">
          <h2>Sobre las Clases</h2>
          <p>
            Un espacio único donde puedes aprender a montar y disfrutar de la equitación en un entorno natural y seguro.
          </p>
        </div>
      </section>

      {/* Sección de Clases */}
      <section className="container">
        <div className="events-grid">
          {clases.map(clase => (
            <div key={clase.id} className="event-card">
              <div className="event-image">
                <img src={clase.imagen} alt={clase.titulo} />
              </div>
              <div className="event-content">
                <h3>{clase.titulo}</h3>
                <p>{clase.descripcion}</p>
                <ul className="event-features">
                  {clase.caracteristicas.map((car, idx) => (
                    <li key={idx}>{car}</li>
                  ))}
                </ul>
                <button className="cta-button rustic-button" onClick={() => navigate('/login')}>Más Información</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Equitacion;
