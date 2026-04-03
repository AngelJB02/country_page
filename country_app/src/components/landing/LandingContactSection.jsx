import React, { useState, useCallback, memo } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import emailjs from '@emailjs/browser';
import CalendarioReserva from '../CalendarioReserva';
import { emailConfig } from '../../config/emailConfig';

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
    <section id="contacto" className="py-20 md:py-28 bg-cream-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-stone-900 font-semibold mb-4">
            Reserva tu Evento
          </h2>
          <p className="text-stone-600 text-lg max-w-2xl mx-auto text-balance">
            Completa el formulario y nos pondremos en contacto contigo para
            planificar tu celebracion perfecta
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Contact Info Cards */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-serif text-2xl text-stone-900 font-semibold mb-6">
              Informacion de Contacto
            </h3>
            {contactInfo.map((info, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-5 shadow-sm border border-stone-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-amber-800/10 rounded-lg">
                    <info.icon className="w-5 h-5 text-amber-800" />
                  </div>
                  <div>
                    <span className="text-sm text-stone-500 font-medium">
                      {info.label}
                    </span>
                    {info.link ? (
                      <a
                        href={info.link}
                        target={info.link.startsWith('http') ? '_blank' : '_self'}
                        rel="noopener noreferrer"
                        className="block text-stone-800 font-medium hover:text-amber-800 transition-colors"
                      >
                        {info.value}
                      </a>
                    ) : (
                      <p className="text-stone-800 font-medium">{info.value}</p>
                    )}
                    {info.subValue && (
                      <p className="text-stone-600 text-sm">{info.subValue}</p>
                    )}
                    {info.linkText && (
                      <a
                        href={info.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-amber-800 font-medium hover:underline mt-1 inline-block"
                      >
                        {info.linkText}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-stone-100"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Nombre */}
                <div>
                  <label
                    htmlFor="nombre"
                    className="block text-sm font-medium text-stone-700 mb-1.5"
                  >
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-700 focus:border-transparent transition-all outline-none"
                    placeholder="Tu nombre"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-stone-700 mb-1.5"
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-700 focus:border-transparent transition-all outline-none"
                    placeholder="tu@email.com"
                  />
                </div>

                {/* Telefono */}
                <div>
                  <label
                    htmlFor="telefono"
                    className="block text-sm font-medium text-stone-700 mb-1.5"
                  >
                    Telefono *
                  </label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-700 focus:border-transparent transition-all outline-none"
                    placeholder="+52 999 123 4567"
                  />
                </div>

                {/* Tipo de Evento */}
                <div>
                  <label
                    htmlFor="tipoEvento"
                    className="block text-sm font-medium text-stone-700 mb-1.5"
                  >
                    Tipo de evento *
                  </label>
                  <select
                    id="tipoEvento"
                    name="tipoEvento"
                    value={formData.tipoEvento}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-700 focus:border-transparent transition-all outline-none bg-white"
                  >
                    <option value="">Selecciona un tipo</option>
                    <option value="Boda">Boda</option>
                    <option value="Evento Corporativo">
                      Evento Corporativo
                    </option>
                    <option value="Cumpleanos">Cumpleanos</option>
                    <option value="Aniversario">Aniversario</option>
                    <option value="Graduacion">Graduacion</option>
                    <option value="Retiro">Retiro</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                {/* Fecha */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    Fecha del evento
                  </label>
                  <CalendarioReserva
                    value={formData.fecha}
                    onChange={handleFechaChange}
                  />
                </div>

                {/* Numero de Personas */}
                <div>
                  <label
                    htmlFor="numeroPersonas"
                    className="block text-sm font-medium text-stone-700 mb-1.5"
                  >
                    Numero de personas
                  </label>
                  <input
                    type="number"
                    id="numeroPersonas"
                    name="numeroPersonas"
                    value={formData.numeroPersonas}
                    onChange={handleChange}
                    min="1"
                    max="1500"
                    className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-700 focus:border-transparent transition-all outline-none"
                    placeholder="Ej: 100"
                  />
                </div>
              </div>

              {/* Mensaje */}
              <div className="mt-5">
                <label
                  htmlFor="mensaje"
                  className="block text-sm font-medium text-stone-700 mb-1.5"
                >
                  Mensaje adicional
                </label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  value={formData.mensaje}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-700 focus:border-transparent transition-all outline-none resize-none"
                  placeholder="Cuentanos mas detalles sobre tu evento..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-6 w-full flex items-center justify-center gap-2 bg-amber-800 text-white py-4 px-6 rounded-xl font-medium text-base transition-all duration-300 hover:bg-amber-900 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Enviar Consulta</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
});

LandingContactSection.displayName = 'LandingContactSection';

export default LandingContactSection;
