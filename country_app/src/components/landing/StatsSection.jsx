import React from 'react';
import { Calendar, Award, Users } from 'lucide-react';

const StatsSection = () => {
  const stats = [
    {
      icon: Calendar,
      number: '10+',
      label: 'Eventos realizados',
    },
    {
      icon: Award,
      number: '5',
      label: 'Anos de experiencia',
    },
    {
      icon: Users,
      number: '1500+',
      label: 'Capacidad maxima',
    },
  ];

  return (
    <section id="stats" className="bg-amber-800 py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center group"
            >
              <div className="mb-4 p-4 bg-white/10 rounded-full transition-transform duration-300 group-hover:scale-110">
                <stat.icon className="w-8 h-8 text-white" strokeWidth={1.5} />
              </div>
              <span className="font-serif text-4xl md:text-5xl font-semibold text-white mb-2">
                {stat.number}
              </span>
              <span className="text-white/80 text-sm md:text-base font-medium tracking-wide">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
