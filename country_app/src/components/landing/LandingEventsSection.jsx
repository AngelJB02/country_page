import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';

import boda1 from '../../img/boda.jpeg';
import image6 from '../../img/image-6.jpg';
import cumple from '../../img/refugio_cumple.jpeg';
import cena from '../../img/cena.jpeg';
import image10 from '../../img/image_10.jpg';

const LandingEventsSection = () => {
  const navigate = useNavigate();

  const eventos = [
    {
      id: 1,
      titulo: 'Bodas al Aire Libre',
      descripcion:
        'Celebra el dia mas importante de tu vida en un entorno natural unico.',
      imagen: boda1,
      caracteristicas: [
        'Capacidad para 600 personas',
        'Ceremonia al aire libre',
        'Catering incluido',
      ],
      featured: true,
    },
    {
      id: 2,
      titulo: 'Eventos Corporativos',
      descripcion:
        'Organiza reuniones de trabajo y retiros empresariales en un ambiente relajado.',
      imagen: image6,
      caracteristicas: [
        'Espacios adaptables',
        'Equipos audiovisuales',
        'Team building',
      ],
      featured: false,
    },
    {
      id: 3,
      titulo: 'Celebraciones Familiares',
      descripcion:
        'Cumpleanos, aniversarios y cualquier celebracion especial que quieras hacer memorable.',
      imagen: cumple,
      caracteristicas: [
        'Ambiente familiar',
        'Juegos para ninos',
        'Flexibilidad de horarios',
      ],
      featured: false,
    },
    {
      id: 4,
      titulo: 'Retiros y Talleres',
      descripcion:
        'Espacio perfecto para retiros espirituales y actividades de crecimiento personal.',
      imagen: cena,
      caracteristicas: [
        'Conexion con la naturaleza',
        'Ambientes tranquilos',
        'Espacios meditativos',
      ],
      featured: false,
    },
    {
      id: 5,
      titulo: 'Clases de Equitacion',
      descripcion:
        'Aprende a montar en caballo con paseos guiados y clases para todas las edades.',
      imagen: image10,
      caracteristicas: [
        'Paseos guiados',
        'Clases de equitacion',
        'Instructores certificados',
      ],
      featured: false,
      clickable: true,
    },
  ];

  const handleEventClick = (evento) => {
    if (evento.clickable) {
      navigate('/equitacion');
    }
  };

  return (
    <section id="eventos" className="py-20 md:py-28 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-stone-900 font-semibold mb-4">
            Nuestros Eventos
          </h2>
          <p className="text-stone-600 text-lg max-w-2xl mx-auto text-balance">
            Descubre los diferentes tipos de celebraciones que puedes realizar
            en El Refugio
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {eventos.map((evento, index) => (
            <div
              key={evento.id}
              onClick={() => handleEventClick(evento)}
              className={`group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                evento.featured ? 'md:col-span-2 lg:col-span-1 lg:row-span-2' : ''
              } ${evento.clickable ? 'cursor-pointer' : ''}`}
            >
              {/* Image */}
              <div
                className={`relative overflow-hidden ${
                  evento.featured ? 'h-64 lg:h-72' : 'h-48 md:h-52'
                }`}
              >
                <img
                  src={evento.imagen}
                  alt={evento.titulo}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-serif text-xl md:text-2xl text-stone-900 font-semibold mb-3">
                  {evento.titulo}
                </h3>
                <p className="text-stone-600 text-sm md:text-base mb-4 leading-relaxed">
                  {evento.descripcion}
                </p>

                {/* Features List */}
                <ul className="space-y-2">
                  {evento.caracteristicas.map((caracteristica, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2 text-sm text-stone-600"
                    >
                      <Check
                        className="w-4 h-4 text-amber-700 flex-shrink-0"
                        strokeWidth={2}
                      />
                      <span>{caracteristica}</span>
                    </li>
                  ))}
                </ul>

                {/* Arrow for clickable items */}
                {evento.clickable && (
                  <div className="mt-4 flex items-center gap-2 text-amber-800 font-medium text-sm group-hover:gap-3 transition-all">
                    <span>Ver mas</span>
                    <ArrowRight size={16} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingEventsSection;
