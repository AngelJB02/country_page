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
      label: 'Anos de Experiencia',
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
        padding: '80px 0',
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
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(1.75rem, 3vw, 2.25rem)',
              color: '#fff',
              fontWeight: 500,
              marginBottom: '8px',
            }}
          >
            Nuestra Trayectoria
          </h2>
          <div
            style={{
              width: '60px',
              height: '2px',
              backgroundColor: 'rgba(255,255,255,0.4)',
              margin: '0 auto',
            }}
          />
        </div>

        {/* Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '32px',
          }}
        >
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  padding: '32px 24px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.3s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    marginBottom: '20px',
                    padding: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    borderRadius: '50%',
                  }}
                >
                  <IconComponent size={28} color="#FEFBF6" strokeWidth={1.5} />
                </div>

                {/* Number with Animation */}
                <div
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: 'clamp(3rem, 5vw, 4rem)',
                    fontWeight: 600,
                    color: '#FEFBF6',
                    lineHeight: 1,
                    marginBottom: '12px',
                  }}
                >
                  <AnimatedNumber target={stat.number} suffix={stat.suffix} />
                </div>

                {/* Label */}
                <span
                  style={{
                    color: '#FEFBF6',
                    fontSize: '14px',
                    fontWeight: 600,
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                  }}
                >
                  {stat.label}
                </span>

                {/* Description */}
                <p
                  style={{
                    color: 'rgba(254, 251, 246, 0.7)',
                    fontSize: '14px',
                    lineHeight: 1.5,
                    margin: 0,
                    maxWidth: '220px',
                  }}
                >
                  {stat.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
