import React from "react";

// CSS
import "../CSS/variables.css";
import "../CSS/index.css";// Nuevo CSS para clases y login

// Imágenes
import class1Img from "../img/class1.jpg";
import class2Img from "../img/class2.jpg";
import class3Img from "../img/class3.jpg";

// Componentes
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";

const clases = [
  {
    id: 1,
    titulo: "Clases Básicas",
    descripcion: "Aprende los fundamentos de la equitación, desde la postura hasta el control del caballo.",
    imagen: class1Img,
    caracteristicas: ["Instrucción personalizada", "Caballos entrenados", "Duración 1 hora"]
  },
  {
    id: 2,
    titulo: "Clases Intermedias",
    descripcion: "Mejora tu técnica, aprende a trotar y galopar con seguridad y confianza.",
    imagen: class2Img,
    caracteristicas: ["Ejercicios avanzados", "Clases grupales o individuales", "Duración 1.5 horas"]
  },
  {
    id: 3,
    titulo: "Clases Avanzadas",
    descripcion: "Perfecciona tu habilidad con técnicas de salto y manejo avanzado del caballo.",
    imagen: class3Img,
    caracteristicas: ["Salto de obstáculos", "Competencias simuladas", "Duración 2 horas"]
  }
];

const Equitacion = () => {

  return (
    <>
      <Navigation />

      {/* Hero Section */}
      <section className="hero-section" style={{ height: "60vh", position: "relative", backgroundImage: `url(${class1Img})`, backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="swiper-slide-content" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", color: "#fff", textAlign: "center" }}>
          <h1 className="swiper-slide-title">Clases de Equitación</h1>
          <p className="swiper-slide-subtitle">Descubre nuestros cursos y mejora tu técnica sobre caballo</p>
        </div>
      </section>

      {/* Sección Información General */}
      <section className="container" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
        <h2>Aprende y Disfruta</h2>
        <p>Ofrecemos tres niveles de clases adaptadas a todos los niveles. Cada clase incluye caballos entrenados y seguridad garantizada.</p>
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
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Login Section */}
      <section className="container" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
        <h2>Ingresar a tu cuenta</h2>
        <form className="login-form">
          <input type="email" placeholder="Correo electrónico" required className="input" />
          <input type="password" placeholder="Contraseña" required className="input" />
          <button type="submit" className="cta-button rustic-button">Ingresar</button>
        </form>
      </section>

      <Footer />
    </>
  );
};

export default Equitacion;
