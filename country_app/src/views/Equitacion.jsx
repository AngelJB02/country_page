import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Check } from "lucide-react";
import { LandingNavbar, LandingFooter } from "../components/landing";

// Imagenes slides
import image11 from "../img/image11.jpg";
import image12 from "../img/image12.jpg";
import image13 from "../img/image13.jpg";

// Imagenes clases
import basico from "../img/basico.jpeg";
import class2Img from "../img/class2.jpg";
import avanzado from "../img/avanzado.jpeg";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";

const Equitacion = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  const slides = [
    { image: image11, title: "Aprende a montar a caballo", subtitle: "Descubre la emocion de montar a caballo en un entorno seguro y amigable" },
    { image: image12, title: "Clases para todas las edades", subtitle: "Ofrecemos clases personalizadas para principiantes y avanzados" },
    { image: image13, title: "Reserva tu clase hoy", subtitle: "Comienza tu aventura ecuestre con nosotros" },
  ];

  const clases = [
    {
      id: 1,
      titulo: "Clases Basicas",
      descripcion: "Aprende los fundamentos de la equitacion, desde la postura hasta el control del caballo.",
      imagen: basico,
      caracteristicas: ["Instruccion personalizada", "Caballos entrenados", "Equipo incluido"],
    },
    {
      id: 2,
      titulo: "Clases Intermedias",
      descripcion: "Mejora tu tecnica, aprende a trotar y galopar con seguridad y confianza.",
      imagen: class2Img,
      caracteristicas: ["Ejercicios avanzados", "Clases grupales o individuales", "Feedback continuo"],
    },
    {
      id: 3,
      titulo: "Clases Avanzadas",
      descripcion: "Perfecciona tu habilidad con tecnicas de salto y manejo avanzado del caballo.",
      imagen: avanzado,
      caracteristicas: ["Salto de obstaculos", "Competencias simuladas", "Entrenamiento profesional"],
    },
  ];

  useEffect(() => {
    const hero = document.getElementById("hero");
    if (hero) hero.scrollIntoView({ behavior: "auto" });
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) element.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F5F1E8" }}>
      <LandingNavbar variant="equitacion" />

      {/* Hero Section */}
      <section
        id="hero"
        style={{
          position: "relative",
          width: "100%",
          height: "calc(100vh + 80px)",
          marginTop: "-80px",
          overflow: "hidden",
        }}
      >
        <Swiper
          modules={[Autoplay, EffectFade]}
          effect="fade"
          spaceBetween={0}
          slidesPerView={1}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          speed={1500}
          loop
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index}>
              <div style={{ position: "relative", width: "100%", height: "100%" }}>
                <img
                  src={slide.image}
                  alt={`Equitacion - ${slide.title}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  loading={index === 0 ? "eager" : "lazy"}
                />
                <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0, 0, 0, 0.4)" }} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Content Overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "80px 16px 0 16px",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: "900px", margin: "0 auto" }}>
            <h1
              key={`title-${activeIndex}`}
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
                color: "#fff",
                fontWeight: 600,
                marginBottom: "24px",
                textWrap: "balance",
                animation: "eqFadeInUp 0.6s ease forwards",
                textShadow: "2px 2px 8px rgba(0,0,0,0.5)",
              }}
            >
              {slides[activeIndex].title}
            </h1>

            <p
              key={`subtitle-${activeIndex}`}
              style={{
                fontSize: "clamp(1rem, 2.5vw, 1.5rem)",
                color: "rgba(255, 255, 255, 0.9)",
                fontWeight: 300,
                marginBottom: "40px",
                maxWidth: "600px",
                margin: "0 auto 40px",
                textWrap: "balance",
                animation: "eqSlideUp 0.6s ease forwards",
                animationDelay: "0.2s",
                opacity: 0,
                textShadow: "1px 1px 4px rgba(0,0,0,0.5)",
              }}
            >
              {slides[activeIndex].subtitle}
            </p>

            <button
              onClick={() => navigate("/login")}
              style={{
                backgroundColor: "#6b4423",
                color: "#fff",
                padding: "16px 32px",
                borderRadius: "9999px",
                fontSize: "18px",
                fontWeight: 500,
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = "#5f3c24";
                e.target.style.transform = "scale(1.05)";
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = "#6b4423";
                e.target.style.transform = "scale(1)";
              }}
            >
              Reservar mi Clase
            </button>
          </div>

          {/* Scroll Indicator */}
          <button
            onClick={() => scrollToSection("info")}
            style={{
              position: "absolute",
              bottom: "32px",
              left: "50%",
              transform: "translateX(-50%)",
              color: "#fff",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
              animation: "eqBounce 2s infinite",
              cursor: "pointer",
              background: "none",
              border: "none",
            }}
            aria-label="Scroll down"
          >
            <span style={{ fontSize: "14px", fontWeight: 300, letterSpacing: "1px" }}>Descubre mas</span>
            <ChevronDown size={24} />
          </button>
        </div>

        {/* Slide Indicators */}
        <div style={{
          position: "absolute",
          bottom: "32px",
          right: "32px",
          zIndex: 10,
          display: "flex",
          gap: "8px",
        }}
        className="eq-slide-indicators"
        >
          {slides.map((_, index) => (
            <div
              key={index}
              style={{
                width: index === activeIndex ? "24px" : "8px",
                height: "8px",
                borderRadius: "9999px",
                backgroundColor: index === activeIndex ? "#fff" : "rgba(255, 255, 255, 0.5)",
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>

        <style>{`
          @keyframes eqFadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes eqSlideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes eqBounce {
            0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); }
            40% { transform: translateX(-50%) translateY(-10px); }
            60% { transform: translateX(-50%) translateY(-5px); }
          }
          @media (max-width: 768px) {
            .eq-slide-indicators { display: none !important; }
          }
        `}</style>
      </section>

      {/* Info Section */}
      <section id="info" style={{ padding: "80px 0", backgroundColor: "#FAF8F5" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "13px",
              fontWeight: 600,
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "#6b4423",
              marginBottom: "16px",
            }}
          >
            Equitacion en El Refugio
          </p>
          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              color: "#1c1917",
              fontWeight: 500,
              marginBottom: "24px",
            }}
          >
            Sobre las Clases
          </h2>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "18px",
              color: "#57534e",
              maxWidth: "700px",
              margin: "0 auto",
              lineHeight: 1.8,
            }}
          >
            Un espacio unico donde puedes aprender a montar y disfrutar de la equitacion en un entorno natural y seguro.
            Nuestros instructores certificados te guiaran en cada paso de tu aventura ecuestre.
          </p>
        </div>
      </section>

      {/* Clases Section */}
      <section id="clases" style={{ padding: "80px 0", backgroundColor: "#F5F1E8" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "13px",
                fontWeight: 600,
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "#6b4423",
                marginBottom: "16px",
              }}
            >
              Nuestras Clases
            </p>
            <h2
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                color: "#1c1917",
                fontWeight: 500,
              }}
            >
              Programas de Equitacion
            </h2>
          </div>

          {/* Cards Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
              gap: "32px",
            }}
          >
            {clases.map((clase) => (
              <div
                key={clase.id}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                  transition: "all 0.3s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow = "0 20px 40px rgba(0, 0, 0, 0.12)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.08)";
                }}
              >
                <div style={{ position: "relative", height: "240px", overflow: "hidden" }}>
                  <img
                    src={clase.imagen}
                    alt={clase.titulo}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 0.5s ease",
                    }}
                    loading="lazy"
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(to top, rgba(0,0,0,0.4), transparent)",
                    }}
                  />
                </div>

                <div style={{ padding: "28px" }}>
                  <h3
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontSize: "24px",
                      color: "#1c1917",
                      fontWeight: 500,
                      marginBottom: "12px",
                    }}
                  >
                    {clase.titulo}
                  </h3>
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "15px",
                      color: "#57534e",
                      lineHeight: 1.7,
                      marginBottom: "20px",
                    }}
                  >
                    {clase.descripcion}
                  </p>

                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {clase.caracteristicas.map((car, idx) => (
                      <li
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          fontFamily: "'Inter', sans-serif",
                          fontSize: "14px",
                          color: "#44403c",
                          marginBottom: "8px",
                        }}
                      >
                        <Check size={16} color="#6b4423" strokeWidth={2.5} />
                        {car}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ textAlign: "center", marginTop: "64px" }}>
            <button
              onClick={() => navigate("/login")}
              style={{
                backgroundColor: "#6b4423",
                color: "#fff",
                padding: "16px 40px",
                borderRadius: "9999px",
                fontSize: "16px",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 15px rgba(107, 68, 35, 0.3)",
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = "#5f3c24";
                e.target.style.transform = "scale(1.05)";
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = "#6b4423";
                e.target.style.transform = "scale(1)";
              }}
            >
              Reservar una Clase
            </button>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default Equitacion;
