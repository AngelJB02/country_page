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
    <section id="stats" style={{ backgroundColor: '#92400e', padding: '80px 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '48px',
        }}>
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
                }}
              >
                <div style={{
                  marginBottom: '16px',
                  padding: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                  transition: 'transform 0.3s ease',
                }}>
                  <IconComponent 
                    size={32} 
                    color="#fff" 
                    strokeWidth={1.5} 
                  />
                </div>
                <span style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: '48px',
                  fontWeight: 600,
                  color: '#fff',
                  marginBottom: '8px',
                  lineHeight: 1,
                }}>
                  {stat.number}
                </span>
                <span style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '14px',
                  fontWeight: 500,
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                }}>
                  {stat.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
