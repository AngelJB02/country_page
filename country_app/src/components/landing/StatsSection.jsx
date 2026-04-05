import React, { useRef } from 'react';
import { Calendar, Award, Users } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

// Ornamental flourish SVG separator
const OrnamentDivider = ({ className }) => (
  <svg className={className} width="40" height="80" viewBox="0 0 40 80" fill="none" style={{ flexShrink: 0, opacity: 0.35 }}>
    <line x1="20" y1="0" x2="20" y2="28" stroke="url(#gold-grad)" strokeWidth="1" />
    <path d="M12 36 C12 32, 20 28, 20 32 C20 28, 28 32, 28 36 C28 40, 20 44, 20 40 C20 44, 12 40, 12 36Z" fill="url(#gold-grad)" fillOpacity="0.5" />
    <circle cx="20" cy="40" r="3" fill="url(#gold-grad)" fillOpacity="0.7" />
    <line x1="20" y1="52" x2="20" y2="80" stroke="url(#gold-grad)" strokeWidth="1" />
    <defs>
      <linearGradient id="gold-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#c09332" stopOpacity="0.4" />
        <stop offset="50%" stopColor="#d4a94a" stopOpacity="1" />
        <stop offset="100%" stopColor="#c09332" stopOpacity="0.4" />
      </linearGradient>
    </defs>
  </svg>
);

// Decorative title ornament
const TitleOrnament = ({ className }) => (
  <svg className={className} width="200" height="20" viewBox="0 0 200 20" fill="none" style={{ display: 'block', margin: '0 auto' }}>
    <line x1="0" y1="10" x2="70" y2="10" stroke="url(#h-gold)" strokeWidth="1" />
    <path d="M80 10 L90 5 L100 10 L90 15 Z" fill="#c09332" fillOpacity="0.6" />
    <circle cx="100" cy="10" r="2.5" fill="#d4a94a" />
    <path d="M100 10 L110 5 L120 10 L110 15 Z" fill="#c09332" fillOpacity="0.6" />
    <line x1="130" y1="10" x2="200" y2="10" stroke="url(#h-gold-r)" strokeWidth="1" />
    <defs>
      <linearGradient id="h-gold" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#c09332" stopOpacity="0" />
        <stop offset="100%" stopColor="#c09332" stopOpacity="0.8" />
      </linearGradient>
      <linearGradient id="h-gold-r" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#c09332" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#c09332" stopOpacity="0" />
      </linearGradient>
    </defs>
  </svg>
);

const StatsSection = () => {
  const sectionRef = useRef(null);

  const stats = [
    {
      icon: Calendar,
      number: 10,
      suffix: '+',
      label: 'Eventos Realizados',
      description: 'Bodas, corporativos y celebraciones',
    },
    {
      icon: Award,
      number: 5,
      suffix: '',
      label: 'Anos de Experiencia',
      description: 'Creando momentos inolvidables',
    },
    {
      icon: Users,
      number: 1500,
      suffix: '+',
      label: 'Capacidad Maxima',
      description: 'En nuestras instalaciones',
    },
  ];

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const trigger = { trigger: sectionRef.current, start: 'top 95%' };

      // Title
      gsap.fromTo('.stats-title',
        { autoAlpha: 0, y: -15 },
        { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out', scrollTrigger: trigger }
      );

      // Title ornament - draw in
      gsap.fromTo('.title-ornament line, .title-ornament path, .title-ornament circle',
        { autoAlpha: 0, scale: 0 },
        { autoAlpha: 1, scale: 1, duration: 0.6, stagger: 0.05, ease: 'back.out(1.5)',
          transformOrigin: 'center center', scrollTrigger: trigger }
      );

      // Each stat item
      gsap.fromTo('.stat-item',
        { autoAlpha: 0, y: 30 },
        { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.15, ease: 'power2.out',
          scrollTrigger: trigger }
      );

      // Icon rings - draw the circle border
      gsap.fromTo('.icon-ring',
        { strokeDashoffset: 176 },
        { strokeDashoffset: 0, duration: 1.2, stagger: 0.2, ease: 'power2.out',
          scrollTrigger: trigger }
      );

      // Icons pop
      gsap.fromTo('.stat-icon-inner',
        { autoAlpha: 0, scale: 0 },
        { autoAlpha: 1, scale: 1, duration: 0.4, stagger: 0.2, delay: 0.3, ease: 'back.out(2.5)',
          scrollTrigger: trigger }
      );

      // Numbers scale up
      gsap.fromTo('.stat-number',
        { autoAlpha: 0, scale: 0.5 },
        { autoAlpha: 1, scale: 1, duration: 0.5, stagger: 0.15, delay: 0.1, ease: 'back.out(1.5)',
          scrollTrigger: trigger }
      );

      // Ornament dividers fade in
      gsap.fromTo('.ornament-divider',
        { autoAlpha: 0, scaleY: 0 },
        { autoAlpha: 1, scaleY: 1, duration: 0.6, stagger: 0.1, delay: 0.2, ease: 'power2.out',
          transformOrigin: 'center center', scrollTrigger: trigger }
      );

      // Counter animations
      stats.forEach((stat, i) => {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: stat.number,
          duration: 2,
          ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 95%', once: true },
          onUpdate: () => {
            const el = sectionRef.current?.querySelector(`.stat-number-${i}`);
            if (el) el.textContent = Math.floor(obj.val).toLocaleString() + stat.suffix;
          },
        });
      });
    });

    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set(['.stats-title', '.stat-item', '.stat-icon-inner', '.stat-number', '.ornament-divider', '.title-ornament line, .title-ornament path, .title-ornament circle'], { autoAlpha: 1, y: 0, scale: 1, scaleY: 1 });
      gsap.set('.icon-ring', { strokeDashoffset: 0 });
      stats.forEach((stat, i) => {
        const el = sectionRef.current?.querySelector(`.stat-number-${i}`);
        if (el) el.textContent = stat.number.toLocaleString() + stat.suffix;
      });
    });
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      id="stats"
      style={{
        background: 'linear-gradient(180deg, #8c5e2a 0%, #7a4e22 50%, #6b4423 100%)',
        padding: '36px 0 40px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Pattern Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
        {/* Title */}
        <div className="stats-title" style={{ textAlign: 'center', marginBottom: '28px', visibility: 'hidden' }}>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: 'rgba(212, 169, 74, 0.9)',
            marginBottom: '6px',
          }}>
            El Refugio en numeros
          </p>
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            color: '#fff',
            fontWeight: 500,
            marginBottom: '14px',
          }}>
            Nuestra Trayectoria
          </h2>
          <TitleOrnament className="title-ornament" />
        </div>

        {/* Stats Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0',
        }} className="stats-row">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <React.Fragment key={index}>
                {/* Stat Item */}
                <div
                  className="stat-item"
                  style={{
                    textAlign: 'center',
                    flex: 1,
                    padding: '0 20px',
                    visibility: 'hidden',
                  }}
                >
                  {/* Icon with animated ring */}
                  <div style={{ position: 'relative', display: 'inline-block', marginBottom: '12px' }}>
                    <svg width="56" height="56" viewBox="0 0 56 56" style={{ display: 'block' }}>
                      <circle
                        className="icon-ring"
                        cx="28" cy="28" r="26"
                        fill="none"
                        stroke="url(#ring-gold)"
                        strokeWidth="1.5"
                        strokeDasharray="176"
                        strokeDashoffset="176"
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="ring-gold" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#d4a94a" />
                          <stop offset="100%" stopColor="#8c6b30" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="stat-icon-inner" style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      visibility: 'hidden',
                    }}>
                      <IconComponent size={22} color="#d4a94a" strokeWidth={1.5} />
                    </div>
                  </div>

                  {/* Number */}
                  <div
                    className={`stat-number stat-number-${index}`}
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontSize: 'clamp(2rem, 4vw, 2.75rem)',
                      fontWeight: 700,
                      color: '#FEFBF6',
                      lineHeight: 1,
                      marginBottom: '4px',
                      visibility: 'hidden',
                    }}
                  >
                    0{stat.suffix}
                  </div>

                  {/* Label */}
                  <span style={{
                    fontFamily: "'Inter', sans-serif",
                    color: '#fff',
                    fontSize: '15px',
                    fontWeight: 600,
                    letterSpacing: '0.3px',
                    display: 'block',
                    marginBottom: '3px',
                  }}>
                    {stat.label}
                  </span>

                  {/* Description */}
                  <span style={{
                    color: 'rgba(254, 251, 246, 0.6)',
                    fontSize: '13px',
                    fontWeight: 400,
                  }}>
                    {stat.description}
                  </span>
                </div>

                {/* Ornament divider between items */}
                {index < stats.length - 1 && (
                  <OrnamentDivider className="ornament-divider" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .stats-row {
            flex-direction: column !important;
            gap: 24px !important;
          }
          .ornament-divider {
            transform: rotate(90deg) !important;
            width: 80px !important;
            height: 20px !important;
          }
        }
      `}</style>
    </section>
  );
};

export default StatsSection;
