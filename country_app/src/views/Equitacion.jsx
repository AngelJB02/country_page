import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, Check, Phone, Mail, MapPin, Facebook, Instagram } from "lucide-react";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    document.body.style.overflow = !isMobileMenuOpen ? "hidden" : "auto";
  };

  useEffect(() => {
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F5F1E8" }}>
      {/* Navigation */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          backgroundColor: "#835634",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "80px" }}>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <img
                src="/El_refugio_logo.png"
                alt="El Refugio Logo"
                style={{ width: "40px", height: "48px", objectFit: "contain" }}
              />
              <span
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: "18px",
                  fontWeight: 600,
                  letterSpacing: "1px",
                  color: "#FEFBF6",
                }}
              >
                EL REFUGIO
              </span>
            </div>

            {/* Desktop Navigation */}
            <ul
              style={{
                display: "flex",
                alignItems: "center",
                gap: "32px",
                listStyle: "none",
                margin: 0,
                padding: 0,
              }}
              className="desktop-nav"
            >
              <li style={{ listStyle: "none" }}>
                <button
                  onClick={() => navigate("/")}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#FEFBF6",
                    cursor: "pointer",
                    transition: "opacity 0.3s ease",
                  }}
                  onMouseOver={(e) => (e.target.style.opacity = "0.7")}
                  onMouseOut={(e) => (e.target.style.opacity = "1")}
                >
                  Inicio
                </button>
              </li>
              <li style={{ listStyle: "none" }}>
                <button
                  onClick={() => scrollToSection("clases")}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#FEFBF6",
                    cursor: "pointer",
                    transition: "opacity 0.3s ease",
                  }}
                  onMouseOver={(e) => (e.target.style.opacity = "0.7")}
                  onMouseOut={(e) => (e.target.style.opacity = "1")}
                >
                  Clases
                </button>
              </li>
              <li style={{ listStyle: "none" }}>
                <button
                  onClick={() => navigate("/login")}
                  style={{
                    backgroundColor: "#FEFBF6",
                    color: "#835634",
                    padding: "10px 20px",
                    borderRadius: "9999px",
                    fontSize: "14px",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = "#F5F1E8";
                    e.target.style.transform = "scale(1.05)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = "#FEFBF6";
                    e.target.style.transform = "scale(1)";
                  }}
                >
                  Reservar Clase
                </button>
              </li>
            </ul>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              style={{
                display: "none",
                padding: "8px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#FEFBF6",
              }}
              className="mobile-menu-btn"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            top: "80px",
            backgroundColor: "#835634",
            transform: isMobileMenuOpen ? "translateX(0)" : "translateX(100%)",
            transition: "transform 0.3s ease",
            zIndex: 40,
          }}
          className="mobile-menu"
        >
          <ul
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "24px",
              paddingTop: "48px",
              listStyle: "none",
              margin: 0,
            }}
          >
            <li style={{ listStyle: "none" }}>
              <button
                onClick={() => {
                  navigate("/");
                  setIsMobileMenuOpen(false);
                }}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "18px",
                  fontWeight: 500,
                  color: "#FEFBF6",
                  cursor: "pointer",
                }}
              >
                Inicio
              </button>
            </li>
            <li style={{ listStyle: "none" }}>
              <button
                onClick={() => {
                  scrollToSection("clases");
                  setIsMobileMenuOpen(false);
                  document.body.style.overflow = "auto";
                }}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "18px",
                  fontWeight: 500,
                  color: "#FEFBF6",
                  cursor: "pointer",
                }}
              >
                Clases
              </button>
            </li>
            <li style={{ listStyle: "none", marginTop: "16px" }}>
              <button
                onClick={() => navigate("/login")}
                style={{
                  backgroundColor: "#FEFBF6",
                  color: "#835634",
                  padding: "12px 32px",
                  borderRadius: "9999px",
                  fontSize: "16px",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Reservar Clase
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        id="hero"
        style={{
          position: "relative",
          width: "100%",
          height: "100vh",
          overflow: "hidden",
          paddingTop: "80px",
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
          style={{ position: "absolute", inset: 0, width: "100%", height: "calc(100vh - 80px)" }}
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index}>
              <div style={{ position: "relative", width: "100%", height: "calc(100vh - 80px)" }}>
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
            padding: "0 16px",
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
                textShadow: "2px 2px 8px rgba(0,0,0,0.5)",
              }}
            >
              {slides[activeIndex].title}
            </h1>

            <p
              style={{
                fontSize: "clamp(1rem, 2.5vw, 1.5rem)",
                color: "rgba(255, 255, 255, 0.9)",
                fontWeight: 300,
                marginBottom: "40px",
                maxWidth: "600px",
                margin: "0 auto 40px",
                textShadow: "1px 1px 4px rgba(0,0,0,0.5)",
              }}
            >
              {slides[activeIndex].subtitle}
            </p>

            <button
              onClick={() => navigate("/login")}
              style={{
                backgroundColor: "#92400e",
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
                e.target.style.backgroundColor = "#78350f";
                e.target.style.transform = "scale(1.05)";
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = "#92400e";
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
              color: "#92400e",
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
                color: "#92400e",
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
                        <Check size={16} color="#835634" strokeWidth={2.5} />
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
                backgroundColor: "#835634",
                color: "#fff",
                padding: "16px 40px",
                borderRadius: "9999px",
                fontSize: "16px",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 15px rgba(131, 86, 52, 0.3)",
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = "#6B4423";
                e.target.style.transform = "scale(1.05)";
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = "#835634";
                e.target.style.transform = "scale(1)";
              }}
            >
              Reservar una Clase
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: "#1c1917", color: "#fff", padding: "64px 0 32px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "48px",
              marginBottom: "48px",
            }}
          >
            {/* Brand */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                <img
                  src="/El_refugio_logo.png"
                  alt="El Refugio"
                  style={{ width: "40px", height: "48px", objectFit: "contain" }}
                />
                <span
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "#fff",
                  }}
                >
                  El Refugio
                </span>
              </div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#a8a29e", lineHeight: 1.7 }}>
                Tu espacio ideal para aprender equitacion y celebraciones inolvidables.
              </p>
            </div>

            {/* Contact */}
            <div>
              <h4
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: "18px",
                  fontWeight: 500,
                  marginBottom: "20px",
                  color: "#fff",
                }}
              >
                Contacto
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <a
                  href="tel:+529982144898"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "14px",
                    color: "#a8a29e",
                    textDecoration: "none",
                    transition: "color 0.3s ease",
                  }}
                  onMouseOver={(e) => (e.target.style.color = "#fff")}
                  onMouseOut={(e) => (e.target.style.color = "#a8a29e")}
                >
                  <Phone size={16} />
                  +52 998 214 4898
                </a>
                <a
                  href="mailto:elrefugiocclub@gmail.com"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "14px",
                    color: "#a8a29e",
                    textDecoration: "none",
                    transition: "color 0.3s ease",
                  }}
                  onMouseOver={(e) => (e.target.style.color = "#fff")}
                  onMouseOut={(e) => (e.target.style.color = "#a8a29e")}
                >
                  <Mail size={16} />
                  elrefugiocclub@gmail.com
                </a>
              </div>
            </div>

            {/* Social */}
            <div>
              <h4
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: "18px",
                  fontWeight: 500,
                  marginBottom: "20px",
                  color: "#fff",
                }}
              >
                Siguenos
              </h4>
              <div style={{ display: "flex", gap: "16px" }}>
                <a
                  href="https://www.facebook.com/people/Elrefugio_country_club/100083084179417/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "40px",
                    height: "40px",
                    backgroundColor: "rgba(255,255,255,0.1)",
                    borderRadius: "50%",
                    color: "#fff",
                    transition: "all 0.3s ease",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#835634")}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)")}
                >
                  <Facebook size={20} />
                </a>
                <a
                  href="https://www.instagram.com/elrefugio_country_club/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "40px",
                    height: "40px",
                    backgroundColor: "rgba(255,255,255,0.1)",
                    borderRadius: "50%",
                    color: "#fff",
                    transition: "all 0.3s ease",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#835634")}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)")}
                >
                  <Instagram size={20} />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.1)",
              paddingTop: "24px",
              textAlign: "center",
            }}
          >
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#78716c" }}>
              © 2025 El Refugio. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
        }
        @media (min-width: 769px) {
          .mobile-menu {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Equitacion;
