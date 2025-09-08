import React from "react";
import { useNavigate } from "react-router-dom";

// CSS
import "../CSS/variables.css";
import "../CSS/index.css";// Nuevo CSS para clases y login
import "../CSS/Login.css";

// Imágenes
import class1Img from "../img/class1.jpg";
import class2Img from "../img/class2.jpg";
import class3Img from "../img/class3.jpg";


// Componentes
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import Login from "../components/Login";

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
  const navigate = useNavigate();

  return (
    <>
      <Navigation />

      {/* Hero Section */}
      <section className="hero-section" style={{ height: "60vh", position: "relative", backgroundImage: `url(${class1Img})`, backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="swiper-slide-content" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", color: "#fff", textAlign: "center" }}>
          <h1 className="swiper-slide-title">Clases de Equitación</h1>
          <p className="swiper-slide-subtitle">Descubre nuestros cursos y mejora tu técnica sobre caballo</p>
          <button onClick={() => window.location.href = "./Login"} className="cta-button rustic-button">Reservar mi clase</button>

        </div>
      </section>

      {/* Sección Información General */}
      <section className="container" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
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

      {/* Login Section */}

      <Footer />
    </>
  );
};

export default Equitacion;
