import React, { useState, useCallback, memo } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import emailjs from '@emailjs/browser';
import CalendarioReserva from '../CalendarioReserva';
import { emailConfig } from '../../config/emailConfig';

const inputStyle = {
  width: '100%',
  padding: '14px 16px',
  border: '2px solid #d6d3d1',
  borderRadius: '12px',
  fontSize: '15px',
  outline: 'none',
  transition: 'all 0.2s ease',
  backgroundColor: '#fff',
  color: '#1c1917',
};

const labelStyle = {
  display: 'block',
  fontSize: '14px',
  fontWeight: 500,
  color: '#44403c',
  marginBottom: '6px',
};

const LandingContactSection = memo(() => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    tipoEvento: '',
    fecha: '',
    numeroPersonas: '',
    mensaje: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prevData) => {
      if (prevData[name] === value) return prevData;
      return { ...prevData, [name]: value };
    });
  }, []);

  const handleFechaChange = useCallback((fechaSeleccionada) => {
    setFormData((prevData) => {
      if (prevData.fecha === fechaSeleccionada) return prevData;
      return { ...prevData, fecha: fechaSeleccionada };
    });
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setIsLoading(true);

      try {
        const { serviceID, templateID, publicKey } = emailConfig;

        const fechaFormateada = formData.fecha
          ? new Date(formData.fecha).toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : 'No especificada';

        const emailData = {
          to_email: 'admon.elrefugio.hipico@gmail.com',
          from_name: formData.nombre,
          from_email: formData.email,
          telefono: formData.telefono,
          tipoEvento: formData.tipoEvento || 'No especificado',
          fecha: fechaFormateada,
          numeroPersonas: formData.numeroPersonas || 'No especificado',
          mensaje: formData.mensaje || 'Sin mensaje adicional',
          fecha_solicitud: new Date().toLocaleString('es-ES'),
          subject: `Nueva consulta de evento - ${formData.tipoEvento || 'Sin especificar'}`,
          message: `
NUEVA SOLICITUD DE EVENTO - EL REFUGIO

INFORMACION DEL CLIENTE:
- Nombre completo: ${formData.nombre}
- Correo electronico: ${formData.email}
- Numero de telefono: ${formData.telefono}

DETALLES DEL EVENTO:
- Tipo de evento: ${formData.tipoEvento || 'No especificado'}
- Fecha solicitada: ${fechaFormateada}
- Numero de invitados: ${formData.numeroPersonas || 'No especificado'} personas

MENSAJE DEL CLIENTE:
${formData.mensaje || 'El cliente no incluyo mensaje adicional'}

Fecha de la solicitud: ${new Date().toLocaleString('es-ES')}
Enviado desde: Formulario web El Refugio
          `,
        };

        await emailjs.send(serviceID, templateID, emailData, publicKey);

        if (formData.email && formData.email.trim() !== '') {
          try {
            const emailPayload = {
              email: formData.email,
              nombre: formData.nombre,
              fechaReserva:
                formData.fecha || new Date().toISOString().split('T')[0],
              horaInicio: 'Por confirmar',
              horaFin: 'Por confirmar',
              instructor: null,
              tipoReserva: formData.tipoEvento || 'Evento',
            };

            await fetch(
              'https://elrefugiocountryclub.com/api/api/email/send-reservation-confirmation',
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(emailPayload),
              }
            );
          } catch (emailError) {
            console.log('Error al enviar email de confirmacion:', emailError);
          }
        }

        alert(
          'Gracias por tu consulta! Te contactaremos pronto. Tu solicitud ha sido enviada correctamente.'
        );

        setFormData({
          nombre: '',
          email: '',
          telefono: '',
          tipoEvento: '',
          fecha: '',
          numeroPersonas: '',
          mensaje: '',
        });
      } catch (error) {
        console.error('Error al enviar el correo:', error);
        alert(
          'Hubo un error al enviar tu consulta. Por favor, intenta nuevamente o contactanos directamente por telefono.'
        );
      } finally {
        setIsLoading(false);
      }
    },
    [formData]
  );

  const contactInfo = [
    {
      icon: MapPin,
      label: 'Ubicacion',
      value: 'El Refugio Country Club',
      link: 'https://maps.app.goo.gl/AM8TYQFGCo2CVZ4R7',
      linkText: 'Ver en Google Maps',
    },
    {
      icon: Phone,
      label: 'Telefono',
      value: '+52 998 214 4898',
      link: 'tel:+529982144898',
    },
    {
      icon: Mail,
      label: 'Email',
      value: 'elrefugiocclub@gmail.com',
      link: 'mailto:elrefugiocclub@gmail.com',
    },
    {
      icon: Clock,
      label: 'Horarios',
      value: 'Lun-Vie: 8:00 AM - 7:00 PM',
      subValue: 'Sab-Dom: 8:00 AM - 1:00 PM',
    },
  ];

  return (
    <section id="contacto" style={{ padding: '100px 0', backgroundColor: '#F5F1E8' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            color: '#1c1917',
            marginBottom: '16px',
            fontWeight: 600,
          }}>
            Reserva tu Evento
          </h2>
          <p style={{
            color: '#57534e',
            fontSize: '18px',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: 1.7,
          }}>
            Completa el formulario y nos pondremos en contacto contigo para
            planificar tu celebracion perfecta
          </p>
        </div>

        {/* Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '48px',
        }}>
          {/* Contact Info Cards */}
          <div>
            <h3 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '24px',
              color: '#1c1917',
              marginBottom: '24px',
              fontWeight: 600,
            }}>
              Informacion de Contacto
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {contactInfo.map((info, index) => {
                const IconComponent = info.icon;
                return (
                  <div
                    key={index}
                    style={{
                      backgroundColor: '#fff',
                      borderRadius: '16px',
                      padding: '20px',
                      boxShadow: '0 2px 10px rgba(107, 68, 35, 0.06)',
                      border: '1px solid rgba(107, 68, 35, 0.08)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                      <div style={{
                        padding: '10px',
                        backgroundColor: 'rgba(107, 68, 35, 0.1)',
                        borderRadius: '10px',
                      }}>
                        <IconComponent size={20} color="#6B4423" />
                      </div>
                      <div>
                        <span style={{
                          fontSize: '13px',
                          color: '#78716c',
                          fontWeight: 500,
                          display: 'block',
                          marginBottom: '4px',
                        }}>
                          {info.label}
                        </span>
                        {info.link ? (
                          <a
                            href={info.link}
                            target={info.link.startsWith('http') ? '_blank' : '_self'}
                            rel="noopener noreferrer"
                            style={{
                              color: '#1c1917',
                              fontWeight: 500,
                              textDecoration: 'none',
                              display: 'block',
                            }}
                          >
                            {info.value}
                          </a>
                        ) : (
                          <p style={{ color: '#1c1917', fontWeight: 500, margin: 0 }}>{info.value}</p>
                        )}
                        {info.subValue && (
                          <p style={{ color: '#57534e', fontSize: '14px', margin: '4px 0 0' }}>{info.subValue}</p>
                        )}
                        {info.linkText && (
                          <a
                            href={info.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: '13px',
                              color: '#6B4423',
                              fontWeight: 500,
                              textDecoration: 'none',
                              marginTop: '4px',
                              display: 'inline-block',
                            }}
                          >
                            {info.linkText}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact Form */}
          <div style={{ gridColumn: 'span 1' }}>
            <form
              onSubmit={handleSubmit}
              style={{
                backgroundColor: '#fff',
                borderRadius: '24px',
                padding: '32px',
                boxShadow: '0 10px 40px rgba(107, 68, 35, 0.08)',
                border: '1px solid rgba(107, 68, 35, 0.08)',
              }}
            >
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
              }}>
                {/* Nombre */}
                <div>
                  <label htmlFor="nombre" style={labelStyle}>Nombre completo *</label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    style={inputStyle}
                    placeholder="Tu nombre"
                    onFocus={(e) => e.target.style.borderColor = '#6B4423'}
                    onBlur={(e) => e.target.style.borderColor = '#d6d3d1'}
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" style={labelStyle}>Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={inputStyle}
                    placeholder="tu@email.com"
                    onFocus={(e) => e.target.style.borderColor = '#6B4423'}
                    onBlur={(e) => e.target.style.borderColor = '#d6d3d1'}
                  />
                </div>

                {/* Telefono */}
                <div>
                  <label htmlFor="telefono" style={labelStyle}>Telefono *</label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    required
                    style={inputStyle}
                    placeholder="+52 999 123 4567"
                    onFocus={(e) => e.target.style.borderColor = '#6B4423'}
                    onBlur={(e) => e.target.style.borderColor = '#d6d3d1'}
                  />
                </div>

                {/* Tipo de Evento */}
                <div>
                  <label htmlFor="tipoEvento" style={labelStyle}>Tipo de evento *</label>
                  <select
                    id="tipoEvento"
                    name="tipoEvento"
                    value={formData.tipoEvento}
                    onChange={handleChange}
                    required
                    style={{ ...inputStyle, cursor: 'pointer' }}
                    onFocus={(e) => e.target.style.borderColor = '#6B4423'}
                    onBlur={(e) => e.target.style.borderColor = '#d6d3d1'}
                  >
                    <option value="">Selecciona un tipo</option>
                    <option value="Boda">Boda</option>
                    <option value="Evento Corporativo">Evento Corporativo</option>
                    <option value="Cumpleanos">Cumpleanos</option>
                    <option value="Aniversario">Aniversario</option>
                    <option value="Graduacion">Graduacion</option>
                    <option value="Retiro">Retiro</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                {/* Fecha */}
                <div>
                  <label style={labelStyle}>Fecha del evento</label>
                  <CalendarioReserva
                    value={formData.fecha}
                    onChange={handleFechaChange}
                  />
                </div>

                {/* Numero de Personas */}
                <div>
                  <label htmlFor="numeroPersonas" style={labelStyle}>Numero de personas</label>
                  <input
                    type="number"
                    id="numeroPersonas"
                    name="numeroPersonas"
                    value={formData.numeroPersonas}
                    onChange={handleChange}
                    min="1"
                    max="1500"
                    style={inputStyle}
                    placeholder="Ej: 100"
                    onFocus={(e) => e.target.style.borderColor = '#6B4423'}
                    onBlur={(e) => e.target.style.borderColor = '#d6d3d1'}
                  />
                </div>
              </div>

              {/* Mensaje */}
              <div style={{ marginTop: '20px' }}>
                <label htmlFor="mensaje" style={labelStyle}>Mensaje adicional</label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  value={formData.mensaje}
                  onChange={handleChange}
                  rows={4}
                  style={{ ...inputStyle, resize: 'none' }}
                  placeholder="Cuentanos mas detalles sobre tu evento..."
                  onFocus={(e) => e.target.style.borderColor = '#92400e'}
                  onBlur={(e) => e.target.style.borderColor = '#d6d3d1'}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  marginTop: '24px',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: '#6B4423',
                  color: '#fff',
                  padding: '16px 24px',
                  borderRadius: '12px',
                  fontWeight: 500,
                  fontSize: '16px',
                  border: 'none',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1,
                  transition: 'all 0.3s ease',
                }}
                onMouseOver={(e) => {
                  if (!isLoading) {
                    e.target.style.backgroundColor = '#4A2F17';
                    e.target.style.transform = 'scale(1.02)';
                  }
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#6B4423';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                {isLoading ? (
                  <>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }} />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    <span>Enviar Consulta</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
});

LandingContactSection.displayName = 'LandingContactSection';

export default LandingContactSection;
