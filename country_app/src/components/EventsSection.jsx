import React from 'react';
import image5 from '../img/image_5.jpg';
import image6 from '../img/image-6.jpg';
import image8 from '../img/image_8.jpg';
import image9 from '../img/image-9.jpg';

const EventsSection = () => {
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
    }
  ];

  return (
    <section id="eventos" className="events-section">
      <div className="container">
        <div className="section-header">
          <h2>Nuestros Eventos</h2>
          <p>Descubre los diferentes tipos de celebraciones que puedes realizar en El Refugio</p>
        </div>
        
        <div className="events-grid">
          {eventos.map((evento) => (
            <div key={evento.id} className="event-card">
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
