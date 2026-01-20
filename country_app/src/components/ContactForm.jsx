import React, { useState, useCallback, memo } from 'react';
import emailjs from '@emailjs/browser';
import CalendarioReserva from './CalendarioReserva';
import OptimizedInput from './OptimizedInput';
import SubmitButton from './SubmitButton';
import { emailConfig } from '../config/emailConfig';


const ContactForm = memo(() => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    tipoEvento: '',
    fecha: '',
    numeroPersonas: '',
    mensaje: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prevData => {
      // Solo actualizar si el valor realmente cambió
      if (prevData[name] === value) return prevData;
      return {
        ...prevData,
        [name]: value
      };
    });
  }, []);

  // Actualiza la fecha desde el calendario
  const handleFechaChange = useCallback((fechaSeleccionada) => {
    setFormData(prevData => {
      // Solo actualizar si la fecha realmente cambió
      if (prevData.fecha === fechaSeleccionada) return prevData;
      return {
        ...prevData,
        fecha: fechaSeleccionada
      };
    });
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Configuración de EmailJS
      const { serviceID, templateID, publicKey } = emailConfig;
      
      // Formatear la fecha si existe
      const fechaFormateada = formData.fecha ? 
        new Date(formData.fecha).toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) : 'No especificada';

      // Datos estructurados para el correo
      const emailData = {
        to_email: 'admon.elrefugio.hipico@gmail.com', // Email de destino
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
🏡 NUEVA SOLICITUD DE EVENTO - EL REFUGIO

═════════════════════════════════════════

� INFORMACIÓN DEL CLIENTE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Nombre completo: ${formData.nombre}
• Correo electrónico: ${formData.email}
• Número de teléfono: ${formData.telefono}

🎉 DETALLES DEL EVENTO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Tipo de evento: ${formData.tipoEvento || 'No especificado'}
• Fecha solicitada: ${fechaFormateada}
• Número de invitados: ${formData.numeroPersonas || 'No especificado'} personas

💬 MENSAJE DEL CLIENTE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${formData.mensaje || 'El cliente no incluyó mensaje adicional'}

═════════════════════════════════════════

📅 Fecha de la solicitud: ${new Date().toLocaleString('es-ES')}
🌐 Enviado desde: Formulario web El Refugio

¡Responde lo antes posible para confirmar la disponibilidad!
        `
      };

      console.log('Enviando correo con datos:', emailData);
      
      // Enviar el correo usando EmailJS
      const result = await emailjs.send(
        serviceID,
        templateID,
        emailData,
        publicKey
      );
      
      console.log('Correo enviado exitosamente:', result);
      
      // ========== ENVÍO DE EMAIL DE CONFIRMACIÓN AL CLIENTE ==========
      // Enviar email de confirmación al cliente si tiene email
      if (formData.email && formData.email.trim() !== '') {
        try {
          // Como no tenemos hora de inicio/fin en este formulario de eventos,
          // enviamos horario genérico o lo dejamos sin especificar
          const emailPayload = {
            email: formData.email,
            nombre: formData.nombre,
            fechaReserva: formData.fecha || new Date().toISOString().split('T')[0],
            horaInicio: 'Por confirmar',
            horaFin: 'Por confirmar',
            instructor: null, // No aplica para eventos
            tipoReserva: formData.tipoEvento || 'Evento'
          };
          
          const emailRes = await fetch('https://elrefugiocountryclub.com/api/pi/email/send-reservation-confirmation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emailPayload)
          });
          
          if (emailRes.ok) {
            console.log('✅ Email de confirmación enviado al cliente');
          } else {
            console.log('⚠️ No se pudo enviar email de confirmación al cliente');
          }
        } catch (emailError) {
          console.log('Error al enviar email de confirmación:', emailError);
        }
      }
      // ================================================================
      
      alert('¡Gracias por tu consulta! Te contactaremos pronto. Tu solicitud ha sido enviada correctamente.');
      
      // Limpiar el formulario después del envío exitoso
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        tipoEvento: '',
        fecha: '',
        numeroPersonas: '',
        mensaje: ''
      });
      
    } catch (error) {
      console.error('Error al enviar el correo:', error);
      alert('Hubo un error al enviar tu consulta. Por favor, intenta nuevamente o contáctanos directamente por teléfono.');
    } finally {
      setIsLoading(false);
    }
  }, [formData]);

  return (
    <section id="contacto" className="contact-section">
      <div className="container">
        <div className="section-header">
          <h2>Reserva tu Evento</h2>
          <p>Completa el formulario y nos pondremos en contacto contigo para planificar tu celebración perfecta</p>
        </div>
        
        <div className="contact-content">
          <div className="contact-info">
            <h3>Información de Contacto</h3>
            <div className="contact-item">
              <strong>📍 Ubicación:</strong>
              <p>El Refugio </p>
                <a 
                  href="https://maps.app.goo.gl/AM8TYQFGCo2CVZ4R7" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-link"
                  style={{ backgroundColor: "transparent", color: "#6B4423", fontWeight: "800" }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7zm0 9.5A2.5 2.5 0 1112 6a2.5 2.5 0 010 5.5z"/>
                  </svg>
                  Google Maps
                </a>
            </div>

            <div className="contact-item">
              <strong>📞 Teléfono:</strong>
              <p>+52 998 214 4898</p>
            </div>
            <div className="contact-item">
              <strong>✉️ Email:</strong>
              <p>elrefugiocclub@gmail.com</p>
            </div>
            <div className="contact-item">
              <strong>🕐 Horarios:</strong>
              <p><b>Lunes a Viernes: </b>8:00 AM - 7:00 PM</p>
              <p><b>Sabados - Domingos: </b>8:00 AM - 1:00 PM</p>
            </div>
          </div>
          
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <OptimizedInput
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required={true}
                label="Nombre completo *"
              />
              <OptimizedInput
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required={true}
                label="Email *"
              />
            </div>
            
            <div className="form-row">
              <OptimizedInput
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                required={true}
                label="Teléfono *"
              />
              <OptimizedInput
                type="select"
                id="tipoEvento"
                name="tipoEvento"
                value={formData.tipoEvento}
                onChange={handleChange}
                required={true}
                label="Tipo de evento *"
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                {/* CalendarioReserva reemplaza el input de fecha */}
                <CalendarioReserva value={formData.fecha} onChange={handleFechaChange} />
              </div>
              <OptimizedInput
                type="number"
                id="numeroPersonas"
                name="numeroPersonas"
                value={formData.numeroPersonas}
                onChange={handleChange}
                min="1"
                max="200"
                label="Número de personas"
              />
            </div>
            
            <OptimizedInput
              type="textarea"
              id="mensaje"
              name="mensaje"
              value={formData.mensaje}
              onChange={handleChange}
              rows={3}
              placeholder="Cuéntanos más detalles sobre tu evento..."
              label="Mensaje adicional"
            />
            
            <SubmitButton isLoading={isLoading}>
              {isLoading ? 'Enviando...' : 'Enviar Consulta'}
            </SubmitButton>
          </form>
        </div>
      </div>
    </section>
  );
});

ContactForm.displayName = 'ContactForm';

export default ContactForm;
