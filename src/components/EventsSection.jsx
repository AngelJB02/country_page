import React from 'react';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate
import image5 from '../img/image_5.jpg';
import image6 from '../img/image-6.jpg';
import image8 from '../img/image_8.jpg';
import image9 from '../img/image-9.jpg';
import image10 from '../img/image_10.jpg';

const EventsSection = () => {
  const navigate = useNavigate(); // Hook para redireccionar

  const eventos = [
    {
      id: 1,
      titulo: "Bodas al Aire Libre",
      descripcion: "Celebra el día más importante de tu vida en un entorno natural único, rodeado de la belleza del campo.",
      imagen: image5,
      caracteristicas: ["Capacidad para 200 personas", "Ceremonia al aire libre", "Catering incluido"]
    },
    {
      id: 2,
      titulo: "Eventos Corporativos",
      descripcion: "Organiza reuniones de trabajo, retiros empresariales y celebraciones corporativas en un ambiente relajado.",
      imagen: image6,
      caracteristicas: ["Espacios adaptables", "Equipos audiovisuales", "Team building"]
    },
    {
      id: 3,
      titulo: "Celebraciones Familiares",
      descripcion: "Cumpleaños, aniversarios, graduaciones y cualquier celebración especial que quieras hacer memorable.",
      imagen: image8,
      caracteristicas: ["Ambiente familiar", "Juegos para niños", "Flexibilidad de horarios"]
    },
    {
      id: 4,
      titulo: "Retiros y Talleres",
      descripcion: "Espacio perfecto para retiros espirituales, talleres creativos y actividades de crecimiento personal.",
      imagen: image9,
      caracteristicas: ["Conexión con la naturaleza", "Ambientes tranquilos", "Espacios meditativos"]
    }, 
    {
      id: 5,
      titulo: "¿Te gustaria aprender a montar en caballo?",
      descripcion: "Contamos con caballos para que puedas disfrutar de paseos guiados y clases de equitación en un entorno seguro y natural.",
      imagen: image10,
      caracteristicas: ["Paseos guiados", "Clases de equitación", "Actividades para todas las edades"]
      
    }
  ];

  const handleEventClick = (evento) => {
    if (evento.id === 5) {
      navigate("/equitacion"); // Redirige a la página de equitación
    }
    // Puedes agregar más redirecciones según el id si quieres
  };

  return (
    <section id="eventos" className="events-section">
      <div className="container">
        <div className="section-header">
          <h2>Nuestros Eventos</h2>
          <p>Descubre los diferentes tipos de celebraciones que puedes realizar en El Refugio</p>
        </div>
        
        <div className="events-grid">
          {eventos.map((evento) => (
            <div
              key={evento.id}
              className="event-card"
              onClick={() => handleEventClick(evento)}
              style={{ cursor: evento.id === 5 ? "pointer" : "default" }} // Solo cambia el cursor para el evento 5
            >
              <div className="event-image">
                <img src={evento.imagen} alt={evento.titulo} />
              </div>
              <div className="event-content">
                <h3>{evento.titulo}</h3>
                <p>{evento.descripcion}</p>
                <ul className="event-features">
                  {evento.caracteristicas.map((caracteristica, index) => (
                    <li key={index}>{caracteristica}</li>
                  ))}
                </ul>
                 {/* Solo mostrar botón si es el evento con id 5 */}
                  {evento.id === 5 && (
                    <button
                      className="cta-button rustic-button"
                      onClick={() => navigate('/equitacion')}
                    >
                      Más Información
                    </button>
                  )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
