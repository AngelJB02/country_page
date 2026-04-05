import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Check } from "lucide-react";
import { LandingNavbar, LandingFooter } from "../components/landing";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

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
  const heroRef = useRef(null);
  const infoRef = useRef(null);
  const clasesRef = useRef(null);

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
    gsap.to(window, {
      scrollTo: { y: `#${sectionId}`, offsetY: 80 },
      duration: 0.8,
      ease: "power2.inOut",
    });
  };

  // Hero text entrance animation
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({ defaults: { ease: "back.out(1.2)" } });
      tl.fromTo(".eq-hero-title",
        { autoAlpha: 0, y: 40, scale: 0.97 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.8 }
      )
      .fromTo(".eq-hero-subtitle",
        { autoAlpha: 0, y: 25 },
        { autoAlpha: 1, y: 0, duration: 0.7, ease: "power2.out" },
        "<0.2"
      )
      .fromTo(".eq-hero-cta",
        { autoAlpha: 0, y: 20, scale: 0.9 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.6 },
        "<0.15"
      );
    });
    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set([".eq-hero-title", ".eq-hero-subtitle", ".eq-hero-cta"], { autoAlpha: 1, y: 0, scale: 1 });
    });
  }, { scope: heroRef, dependencies: [activeIndex], revertOnUpdate: true });

  // Scroll indicator bounce
  useGSAP(() => {
    gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
      gsap.to(".eq-scroll-indicator", {
        y: -10,
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      });
    });
  }, { scope: heroRef });

  // Info section animations
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: ".eq-info-content", start: "top 80%" },
      });
      tl.fromTo(".eq-info-eyebrow",
        { autoAlpha: 0, y: 15 },
        { autoAlpha: 1, y: 0, duration: 0.5 }
      ).fromTo(".eq-info-title",
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, duration: 0.6, ease: "back.out(1.2)" },
        "<0.1"
      ).fromTo(".eq-info-text",
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, duration: 0.5 },
        "<0.15"
      );
    });
    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set([".eq-info-eyebrow", ".eq-info-title", ".eq-info-text"], { autoAlpha: 1, y: 0 });
    });
  }, { scope: infoRef });

  // Clases section animations
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Header
      const tl = gsap.timeline({
        scrollTrigger: { trigger: ".eq-clases-header", start: "top 80%" },
      });
      tl.fromTo(".eq-clases-eyebrow",
        { autoAlpha: 0, y: 15 },
        { autoAlpha: 1, y: 0, duration: 0.5 }
      ).fromTo(".eq-clases-title",
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, duration: 0.6, ease: "back.out(1.2)" },
        "<0.1"
      );

      // Cards batch with scale
      ScrollTrigger.batch(".eq-clase-card", {
        start: "top 85%",
        onEnter: (batch) => {
          gsap.fromTo(batch,
            { autoAlpha: 0, y: 50, scale: 0.95 },
            { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.15, ease: "back.out(1.3)", overwrite: true }
          );
        },
      });

      // CTA button
      gsap.fromTo(".eq-clases-cta",
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, duration: 0.5,
          scrollTrigger: { trigger: ".eq-clases-cta", start: "top 90%" } }
      );
    });
    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set([".eq-clases-eyebrow", ".eq-clases-title", ".eq-clase-card", ".eq-clases-cta"], { autoAlpha: 1, y: 0, scale: 1 });
    });
  }, { scope: clasesRef });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F5F1E8" }}>
      <LandingNavbar variant="equitacion" />

      {/* Hero Section */}
      <section
        ref={heroRef}
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
                {/* Cinematic gradient overlay */}
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.4) 70%, rgba(55,31,17,0.7) 100%)",
                }} />
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
              className="eq-hero-title"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
                color: "#fff",
                fontWeight: 600,
                marginBottom: "24px",
                textWrap: "balance",
                textShadow: "2px 4px 12px rgba(0,0,0,0.4)",
                visibility: "hidden",
              }}
            >
              {slides[activeIndex].title}
            </h1>

            <p
              key={`subtitle-${activeIndex}`}
              className="eq-hero-subtitle"
              style={{
                fontSize: "clamp(1rem, 2.5vw, 1.5rem)",
                color: "rgba(255, 255, 255, 0.9)",
                fontWeight: 300,
                marginBottom: "40px",
                maxWidth: "600px",
                margin: "0 auto 40px",
                textWrap: "balance",
                textShadow: "1px 2px 6px rgba(0,0,0,0.4)",
                visibility: "hidden",
              }}
            >
              {slides[activeIndex].subtitle}
            </p>

            <button
              onClick={() => navigate("/login")}
              className="eq-hero-cta"
              style={{
                backgroundColor: "#6b4423",
                color: "#fff",
                padding: "16px 32px",
                borderRadius: "9999px",
                fontSize: "18px",
                fontWeight: 500,
                border: "1px solid rgba(255,255,255,0.15)",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
                visibility: "hidden",
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = "#5f3c24";
                e.target.style.transform = "scale(1.05)";
                e.target.style.boxShadow = "0 15px 40px -5px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.15)";
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = "#6b4423";
                e.target.style.transform = "scale(1)";
                e.target.style.boxShadow = "0 10px 30px -5px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)";
              }}
            >
              Reservar mi Clase
            </button>
          </div>

          {/* Scroll Indicator */}
          <button
            onClick={() => scrollToSection("info")}
            className="eq-scroll-indicator"
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
          @media (max-width: 768px) {
            .eq-slide-indicators { display: none !important; }
          }
        `}</style>
      </section>

      {/* Info Section */}
      <section ref={infoRef} id="info" style={{
        padding: "80px 0",
        background: "linear-gradient(180deg, #FAF8F5 0%, #f7f2e8 100%)",
        position: "relative",
      }}>
        {/* Top wave */}
        <svg style={{ position: "absolute", top: "-1px", left: 0, width: "100%", height: "50px" }} viewBox="0 0 1440 50" preserveAspectRatio="none">
          <path d="M0,50 C360,10 720,40 1080,15 C1260,5 1380,25 1440,10 L1440,0 L0,0 Z" fill="#3d2415" />
        </svg>

        <div className="eq-info-content" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
          <p
            className="eq-info-eyebrow"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "13px",
              fontWeight: 600,
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "#6b4423",
              marginBottom: "16px",
              visibility: "hidden",
            }}
          >
            Equitacion en El Refugio
          </p>
          <h2
            className="eq-info-title"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              color: "#1c1917",
              fontWeight: 500,
              marginBottom: "24px",
              visibility: "hidden",
            }}
          >
            Sobre las Clases
          </h2>
          <p
            className="eq-info-text"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "18px",
              color: "#57534e",
              maxWidth: "700px",
              margin: "0 auto",
              lineHeight: 1.8,
              visibility: "hidden",
            }}
          >
            Un espacio unico donde puedes aprender a montar y disfrutar de la equitacion en un entorno natural y seguro.
            Nuestros instructores certificados te guiaran en cada paso de tu aventura ecuestre.
          </p>
        </div>
      </section>

      {/* Clases Section */}
      <section ref={clasesRef} id="clases" style={{
        padding: "80px 0",
        background: "linear-gradient(180deg, #f7f2e8 0%, #F5F1E8 40%, #f0ead8 100%)",
        position: "relative",
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
          <div className="eq-clases-header" style={{ textAlign: "center", marginBottom: "64px" }}>
            <p
              className="eq-clases-eyebrow"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "13px",
                fontWeight: 600,
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "#6b4423",
                marginBottom: "16px",
                visibility: "hidden",
              }}
            >
              Nuestras Clases
            </p>
            <h2
              className="eq-clases-title"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                color: "#1c1917",
                fontWeight: 500,
                visibility: "hidden",
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
                className="eq-clase-card"
                style={{
                  backgroundColor: "#fff",
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxShadow: "0 4px 24px rgba(107, 68, 35, 0.1)",
                  transition: "all 0.3s ease",
                  visibility: "hidden",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow = "0 20px 50px rgba(107, 68, 35, 0.15)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 24px rgba(107, 68, 35, 0.1)";
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
                      background: "linear-gradient(to top, rgba(107,68,35,0.35), transparent 60%)",
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
          <div className="eq-clases-cta" style={{ textAlign: "center", marginTop: "64px", visibility: "hidden" }}>
            <button
              onClick={() => navigate("/login")}
              style={{
                backgroundColor: "#6b4423",
                color: "#fff",
                padding: "16px 40px",
                borderRadius: "9999px",
                fontSize: "16px",
                fontWeight: 600,
                border: "1px solid rgba(255,255,255,0.1)",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 20px rgba(107, 68, 35, 0.3)",
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = "#5f3c24";
                e.target.style.transform = "scale(1.05)";
                e.target.style.boxShadow = "0 8px 30px rgba(107, 68, 35, 0.4)";
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = "#6b4423";
                e.target.style.transform = "scale(1)";
                e.target.style.boxShadow = "0 4px 20px rgba(107, 68, 35, 0.3)";
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
