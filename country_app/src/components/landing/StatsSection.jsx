import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Award, Users } from 'lucide-react';

const AnimatedNumber = ({ target, suffix = '', duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const numericTarget = parseInt(target.replace(/[^0-9]/g, ''), 10);
    const increment = numericTarget / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= numericTarget) {
        setCount(numericTarget);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isVisible, target, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
};

const StatsSection = () => {
  const stats = [
    {
      icon: Calendar,
      number: '10',
      suffix: '+',
      label: 'Eventos Realizados',
      description: 'Bodas, corporativos y celebraciones inolvidables',
    },
    {
      icon: Award,
      number: '5',
      suffix: '',
      label: 'Años de Experiencia',
      description: 'Creando momentos unicos para nuestros clientes',
    },
    {
      icon: Users,
      number: '1500',
      suffix: '+',
      label: 'Capacidad Maxima',
      description: 'Personas en nuestras instalaciones principales',
    },
  ];

  return (
    <section
      id="stats"
      style={{
        backgroundColor: '#845624',
        padding: '28px 0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative Pattern Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
        {/* Section Title */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              color: '#fff',
              fontWeight: 500,
              marginBottom: '8px',
            }}
          >
            Nuestra Trayectoria
          </h2>
          <div
            style={{
              width: '50px',
              height: '2px',
              backgroundColor: 'rgba(255,255,255,0.4)',
              margin: '0 auto',
            }}
          />
        </div>

        {/* Stats Row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-evenly',
            flexWrap: 'wrap',
            gap: '24px',
          }}
        >
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                }}
              >
                <div
                  style={{
                    padding: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    borderRadius: '12px',
                    flexShrink: 0,
                  }}
                >
                  <IconComponent size={20} color="#FEFBF6" strokeWidth={1.5} />
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontSize: '1.75rem',
                      fontWeight: 600,
                      color: '#FEFBF6',
                      lineHeight: 1.1,
                    }}
                  >
                    <AnimatedNumber target={stat.number} suffix={stat.suffix} />
                  </div>
                  <span
                    style={{
                      color: 'rgba(254, 251, 246, 0.7)',
                      fontSize: '12px',
                      fontWeight: 500,
                      letterSpacing: '0.3px',
                    }}
                  >
                    {stat.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
