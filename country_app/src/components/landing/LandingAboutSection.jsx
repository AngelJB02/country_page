import React from 'react';
import { Leaf, Home, Users } from 'lucide-react';
import ElRefugio from '../../img/ElrefugioCountryclub.webp';

const LandingAboutSection = () => {
  const features = [
    {
      icon: Leaf,
      title: 'Entorno Natural',
      description:
        'Rodeado de vegetacion y paisajes que brindan un ambiente de paz y tranquilidad, perfecto para desconectar.',
    },
    {
      icon: Home,
      title: 'Instalaciones Completas',
      description:
        'Espacios versatiles y bien equipados para todo tipo de eventos, con comodidades modernas.',
    },
    {
      icon: Users,
      title: 'Servicio Personalizado',
      description:
        'Atencion dedicada para hacer realidad la celebracion de tus suenos, cuidando cada detalle.',
    },
  ];

  return (
    <section id="nosotros" className="py-20 md:py-28 bg-cream-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-stone-900 font-semibold mb-4">
            Sobre El Refugio
          </h2>
          <p className="text-stone-600 text-lg max-w-2xl mx-auto text-balance">
            Un espacio unico donde la naturaleza y la elegancia se encuentran
            para crear momentos inolvidables.
          </p>
        </div>

        {/* Main Content - Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-16">
          {/* Image */}
          <div className="relative rounded-3xl overflow-hidden shadow-xl group">
            <img
              src={ElRefugio}
              alt="El Refugio Country Club - Vista panoramica"
              className="w-full h-80 md:h-[450px] object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>

          {/* Text Content */}
          <div className="flex flex-col justify-center">
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-lg border border-stone-100">
              <p className="text-stone-700 text-lg leading-relaxed mb-6">
                En El Refugio, cada evento se convierte en una experiencia
                unica. Nuestro espacio combina la tranquilidad del entorno
                natural con instalaciones modernas y elegantes.
              </p>
              <p className="text-stone-600 leading-relaxed">
                Creamos el ambiente perfecto para cualquier celebracion
                especial, desde bodas intimas hasta grandes eventos
                corporativos. Nuestro compromiso es hacer de tu evento un
                momento memorable.
              </p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition-all duration-300 border border-stone-100 group hover:-translate-y-1"
            >
              <div className="mb-5 inline-flex p-3 bg-amber-800/10 rounded-xl group-hover:bg-amber-800/20 transition-colors">
                <feature.icon
                  className="w-7 h-7 text-amber-800"
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="font-serif text-xl text-stone-900 font-semibold mb-3">
                {feature.title}
              </h3>
              <p className="text-stone-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingAboutSection;
