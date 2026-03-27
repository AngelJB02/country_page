import express from "express";
import { Resend } from "resend";

const router = express.Router();
const resend = new Resend("re_h3MUFR11_AMEvhDEbDmza1P89t3fHWkJ5");

// Funcion helper para formatear fechas correctamente evitando problemas de zona horaria
function formatearFecha(fechaReserva) {
  if (!fechaReserva) return '';

  if (/^\d{4}-\d{2}-\d{2}$/.test(fechaReserva)) {
    const [year, month, day] = fechaReserva.split('-').map(Number);
    const fecha = new Date(year, month - 1, day, 12, 0, 0);
    return fecha.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  if (fechaReserva instanceof Date) {
    return fechaReserva.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  const fechaStr = String(fechaReserva).split('T')[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(fechaStr)) {
    const [year, month, day] = fechaStr.split('-').map(Number);
    const fecha = new Date(year, month - 1, day, 12, 0, 0);
    return fecha.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  const fecha = new Date(fechaReserva);
  return fecha.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// -- Helpers de template reutilizables --

function emailWrapper(preheaderText, content) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>EL REFUGIO</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0; padding:0; background-color:#f0ece7; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif; -webkit-font-smoothing:antialiased;">
  <!-- Preheader -->
  <div style="display:none; max-height:0; overflow:hidden; mso-hide:all;">
    ${preheaderText}
    ${'&nbsp;&zwnj;'.repeat(30)}
  </div>

  <table width="100%" cellspacing="0" cellpadding="0" style="background-color:#f0ece7; padding:24px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellspacing="0" cellpadding="0" style="background-color:#ffffff; border-radius:12px; box-shadow:0 2px 12px rgba(139,111,78,0.1); overflow:hidden; max-width:100%;">
          ${content}
        </table>

        <table width="560" cellspacing="0" cellpadding="0" style="max-width:100%;">
          <tr>
            <td style="padding:16px 40px 8px; text-align:center;">
              <p style="margin:0; color:#a09484; font-size:11px; line-height:1.5;">
                Este correo fue enviado automaticamente. No respondas a este mensaje.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function emailHeader() {
  return `
<!-- Header -->
<tr>
  <td style="background: linear-gradient(160deg, #7a5e3e 0%, #8b6f4e 40%, #a68968 100%); padding:24px 32px; text-align:center;">
    <img src="https://elrefugiocountryclub.com/El_refugio_logo.png"
         alt="Logo"
         width="48"
         style="display:inline-block; margin-bottom:8px;">
    <h1 style="margin:0; color:#ffffff; font-size:20px; font-weight:800; letter-spacing:1.5px; text-transform:uppercase; font-family:Georgia,'Times New Roman',serif;">
      EL REFUGIO
    </h1>
    <p style="margin:0; color:rgba(255,255,255,0.65); font-size:10px; font-weight:500; letter-spacing:2px; text-transform:uppercase;">
      Country Club
    </p>
  </td>
</tr>`;
}

function emailFooter() {
  return `
<!-- Footer -->
<tr>
  <td style="padding:0;">
    <div style="height:2px; background:linear-gradient(90deg, #8b6f4e, #bfa47e, #8b6f4e);"></div>
    <table width="100%" cellspacing="0" cellpadding="0" style="background:#1f1f1f;">
      <tr>
        <td style="padding:18px 32px; text-align:center;">
          <p style="margin:0 0 2px 0; color:rgba(255,255,255,0.6); font-size:12px; font-weight:600; letter-spacing:1px;">
            EL REFUGIO
          </p>
          <p style="margin:0; color:rgba(255,255,255,0.3); font-size:10px;">
            &copy; ${new Date().getFullYear()} &middot; elrefugiocountryclub.com
          </p>
        </td>
      </tr>
    </table>
  </td>
</tr>`;
}

// Iconos SVG hospedados en el dominio (igual que el logo)
// Los archivos estan en country_app/public/icons/ y se sirven desde el dominio
const ICON_BASE = 'https://elrefugiocountryclub.com/icons';
const icons = {
  calendar:      `${ICON_BASE}/calendar.svg`,
  clock:         `${ICON_BASE}/clock.svg`,
  user:          `${ICON_BASE}/user.svg`,
  award:         `${ICON_BASE}/award.svg`,
  tag:           `${ICON_BASE}/tag.svg`,
  lock:          `${ICON_BASE}/lock.svg`,
  key:           `${ICON_BASE}/key.svg`,
  checkCircle:   `${ICON_BASE}/check-circle.svg`,
  xCircle:       `${ICON_BASE}/x-circle.svg`,
  alertTriangle: `${ICON_BASE}/alert.svg`,
  shield:        `${ICON_BASE}/shield.svg`,
  message:       `${ICON_BASE}/message.svg`,
};

// Mapa de iconos por label para auto-asignar
const iconForLabel = {
  'Nivel': icons.award,
  'Tipo': icons.tag,
  'Tipo de Reserva': icons.tag,
  'Fecha': icons.calendar,
  'Fecha de la Clase': icons.calendar,
  'Horario': icons.clock,
  'Instructor(a)': icons.user,
  'Usuario': icons.user,
  'Contrasena Temporal': icons.lock,
  'Contrasena': icons.lock,
  'Nueva Contrasena': icons.key,
  'Motivo': icons.message,
};

function detailRow(label, value, opts = {}) {
  const { strike = false, borderBottom = true, icon } = opts;
  const valueStyle = strike
    ? 'color:#1a1a1a; font-size:15px; font-weight:600; text-decoration:line-through; opacity:0.6;'
    : 'color:#1a1a1a; font-size:15px; font-weight:600;';
  const capitalize = label === 'Fecha' ? ' text-transform:capitalize;' : '';
  const iconSrc = icon || iconForLabel[label] || null;
  const iconHtml = iconSrc
    ? `<img src="${iconSrc}" alt="" width="16" height="16" style="display:inline-block; vertical-align:middle; margin-right:6px;">`
    : '';
  return `
  <table width="100%" cellspacing="0" cellpadding="0" style="${borderBottom ? 'border-bottom:1px solid #ebe5dd; margin-bottom:10px; padding-bottom:10px;' : ''}">
    <tr>
      <td>
        <span style="color:#999; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1px; display:block; margin-bottom:3px;">${iconHtml}${label}</span>
        <span style="${valueStyle}${capitalize}">${value}</span>
      </td>
    </tr>
  </table>`;
}

function ctaButton(text, href = 'https://elrefugiocountryclub.com/login') {
  return `
<div style="text-align:center; margin:20px 0 0;">
  <a href="${href}" style="display:inline-block; background:#8b6f4e; color:#ffffff; text-decoration:none; padding:12px 36px; border-radius:8px; font-size:13px; font-weight:700; letter-spacing:0.3px;">
    ${text}
  </a>
</div>`;
}

// -- Endpoints --

router.post("/send-credentials", async (req, res) => {
  try {
    const usuarioData = req.body;
    console.log("Enviando credenciales por email a:", usuarioData.email);

    if (!usuarioData.email) {
      return res
        .status(400)
        .json({ error: "El correo electronico es requerido" });
    }

    const htmlContent = emailWrapper(
      `Bienvenido a EL REFUGIO, ${usuarioData.nombre}. Aqui estan tus credenciales de acceso.`,
      `
      ${emailHeader()}

      <tr>
        <td style="padding:28px 32px 24px;">
          <h2 style="margin:0 0 4px 0; color:#1a1a1a; font-size:20px; font-weight:700; text-align:center;">
            Bienvenido(a), ${usuarioData.nombre}
          </h2>
          <p style="margin:0 0 20px 0; color:#888; font-size:13px; text-align:center;">
            Tu cuenta ha sido creada con el rol de <strong style="color:#8b6f4e;">${usuarioData.rol}</strong>
          </p>

          <!-- Credenciales -->
          <table width="100%" cellspacing="0" cellpadding="0" style="background:#faf8f5; border:1px solid #e8e0d6; border-radius:10px; margin-bottom:20px;">
            <tr>
              <td style="padding:20px 24px;">
                <p style="margin:0 0 14px 0; text-align:center;">
                  <span style="display:inline-block; background:#8b6f4e; color:#fff; font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; padding:4px 14px; border-radius:20px;">
                    Credenciales de Acceso
                  </span>
                </p>

                <!-- Usuario -->
                <table width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:10px;">
                  <tr>
                    <td>
                      <span style="color:#999; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1px; display:block; margin-bottom:4px;"><img src="${icons.user}" alt="" width="14" height="14" style="display:inline-block; vertical-align:middle; margin-right:5px;">Usuario</span>
                      <div style="background:#fff; border:1px solid #e0dbd5; border-radius:8px; padding:10px 14px; text-align:center;">
                        <span style="color:#1a1a1a; font-size:15px; font-weight:700; font-family:'Courier New',monospace; letter-spacing:0.5px;">
                          ${usuarioData.username}
                        </span>
                      </div>
                    </td>
                  </tr>
                </table>

                <!-- Contrasena -->
                <table width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td>
                      <span style="color:#999; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1px; display:block; margin-bottom:4px;"><img src="${icons.lock}" alt="" width="14" height="14" style="display:inline-block; vertical-align:middle; margin-right:5px;">Contrasena Temporal</span>
                      <div style="background:#fff; border:1px solid #e0dbd5; border-radius:8px; padding:10px 14px; text-align:center;">
                        <span style="color:#1a1a1a; font-size:15px; font-weight:700; font-family:'Courier New',monospace; letter-spacing:1px;">
                          ${usuarioData.password}
                        </span>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- Nota de seguridad -->
          <table width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td style="background:#fef9ef; border:1px solid #f5e6c4; border-radius:8px; padding:12px 16px;">
                <p style="margin:0; color:#8b6f4e; font-size:12px; font-weight:600;">
                  <img src="${icons.shield}" alt="" width="14" height="14" style="display:inline-block; vertical-align:middle; margin-right:5px;">Seguridad: Cambia tu contrasena en tu primer inicio de sesion. No compartas estos datos con nadie.
                </p>
              </td>
            </tr>
          </table>

          ${ctaButton('Acceder a la Plataforma')}
        </td>
      </tr>

      ${emailFooter()}
      `
    );

    const response = await resend.emails.send({
      from: "EL REFUGIO <noreply@elrefugiocountryclub.com>",
      to: usuarioData.email,
      subject: "Bienvenido a EL REFUGIO - Tus credenciales de acceso",
      html: htmlContent,
    });

    console.log("Email enviado exitosamente:", response);
    res.json({ success: true, data: response });
  } catch (error) {
    console.error("Error al enviar email:", error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para enviar credenciales actualizadas
router.post("/send-updated-credentials", async (req, res) => {
  try {
    const { email, nombre, username, newPassword } = req.body;
    console.log("Enviando credenciales actualizadas por email a:", email);

    if (!email || !nombre || !username || !newPassword) {
      return res
        .status(400)
        .json({ error: "Todos los campos son requeridos (email, nombre, username, newPassword)" });
    }

    const htmlContent = emailWrapper(
      `Hola ${nombre}, tu contrasena ha sido actualizada exitosamente.`,
      `
      ${emailHeader()}

      <tr>
        <td style="padding:28px 32px 24px;">
          <h2 style="margin:0 0 4px 0; color:#1a1a1a; font-size:20px; font-weight:700; text-align:center;">
            Contrasena Actualizada
          </h2>
          <p style="margin:0 0 20px 0; color:#888; font-size:13px; text-align:center;">
            Hola <strong style="color:#8b6f4e;">${nombre}</strong>, tu contrasena ha sido actualizada exitosamente.
          </p>

          <!-- Credenciales -->
          <table width="100%" cellspacing="0" cellpadding="0" style="background:#faf8f5; border:1px solid #e8e0d6; border-radius:10px; margin-bottom:20px;">
            <tr>
              <td style="padding:20px 24px;">
                <p style="margin:0 0 14px 0; text-align:center;">
                  <span style="display:inline-block; background:#8b6f4e; color:#fff; font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; padding:4px 14px; border-radius:20px;">
                    Credenciales Actualizadas
                  </span>
                </p>

                <!-- Usuario -->
                <table width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:10px;">
                  <tr>
                    <td>
                      <span style="color:#999; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1px; display:block; margin-bottom:4px;"><img src="${icons.user}" alt="" width="14" height="14" style="display:inline-block; vertical-align:middle; margin-right:5px;">Usuario</span>
                      <div style="background:#fff; border:1px solid #e0dbd5; border-radius:8px; padding:10px 14px; text-align:center;">
                        <span style="color:#1a1a1a; font-size:15px; font-weight:700; font-family:'Courier New',monospace; letter-spacing:0.5px;">
                          ${username}
                        </span>
                      </div>
                    </td>
                  </tr>
                </table>

                <!-- Nueva contrasena -->
                <table width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td>
                      <span style="color:#999; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1px; display:block; margin-bottom:4px;"><img src="${icons.key}" alt="" width="14" height="14" style="display:inline-block; vertical-align:middle; margin-right:5px;">Nueva Contrasena</span>
                      <div style="background:#fff; border:1px solid #e0dbd5; border-radius:8px; padding:10px 14px; text-align:center;">
                        <span style="color:#1a1a1a; font-size:15px; font-weight:700; font-family:'Courier New',monospace; letter-spacing:1px;">
                          ${newPassword}
                        </span>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- Nota -->
          <table width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td style="background:#f0f8f0; border:1px solid #c8e6c8; border-radius:8px; padding:12px 16px;">
                <p style="margin:0; color:#2e7d32; font-size:12px; font-weight:600;">
                  <img src="${icons.checkCircle}" alt="" width="14" height="14" style="display:inline-block; vertical-align:middle; margin-right:5px;">Tu contrasena ha sido cambiada correctamente. Manten tus credenciales seguras.
                </p>
              </td>
            </tr>
          </table>

          ${ctaButton('Acceder a la Plataforma')}
        </td>
      </tr>

      ${emailFooter()}
      `
    );

    const response = await resend.emails.send({
      from: "EL REFUGIO <noreply@elrefugiocountryclub.com>",
      to: email,
      subject: "Contrasena actualizada - EL REFUGIO",
      html: htmlContent,
    });

    console.log("Email de credenciales actualizadas enviado exitosamente:", response);
    res.json({ success: true, data: response });
  } catch (error) {
    console.error("Error al enviar email de credenciales actualizadas:", error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para confirmar reserva
router.post("/send-reservation-confirmation", async (req, res) => {
  try {
    const { email, nombre, fechaReserva, horaInicio, horaFin, instructor, tipoReserva, nivel } = req.body;
    console.log("Enviando confirmacion de reserva por email a:", email);

    if (!email || !nombre || !fechaReserva || !horaInicio || !horaFin) {
      return res
        .status(400)
        .json({ error: "Campos requeridos: email, nombre, fechaReserva, horaInicio, horaFin" });
    }

    const fechaFormateada = formatearFecha(fechaReserva);

    // Capitalizar nivel
    const nivelFormateado = nivel ? nivel.charAt(0).toUpperCase() + nivel.slice(1).toLowerCase() : null;

    const tipoReservaAmigable = tipoReserva === 'propietario' ? 'Propietario' :
                                tipoReserva === 'renta' ? 'Renta' :
                                tipoReserva === 'media_renta' ? 'Media Renta' :
                                'Clase Regular';

    const htmlContent = emailWrapper(
      `Hola ${nombre}, tu reserva para el ${fechaFormateada} ha sido confirmada.`,
      `
      ${emailHeader()}

      <tr>
        <td style="padding:28px 32px 24px;">
          <!-- Badge confirmado -->
          <div style="text-align:center; margin-bottom:16px;">
            <span style="display:inline-block; background:#e8f5e9; color:#2e7d32; font-size:12px; font-weight:700; padding:6px 18px; border-radius:20px; border:1px solid #c8e6c8;">
              <img src="${icons.checkCircle}" alt="" width="14" height="14" style="display:inline-block; vertical-align:middle; margin-right:5px;">Reserva Confirmada
            </span>
          </div>

          <p style="margin:0 0 20px 0; color:#666; font-size:14px; text-align:center;">
            Hola <strong style="color:#8b6f4e;">${nombre}</strong>, tu reserva ha sido confirmada.
          </p>

          <!-- Detalles -->
          <table width="100%" cellspacing="0" cellpadding="0" style="background:#faf8f5; border:1px solid #e8e0d6; border-radius:10px; margin-bottom:16px;">
            <tr>
              <td style="padding:18px 22px;">
                ${nivelFormateado ? detailRow('Nivel', nivelFormateado) : ''}
                ${tipoReserva ? detailRow('Tipo', tipoReservaAmigable) : ''}
                ${detailRow('Fecha', fechaFormateada)}
                ${detailRow('Horario', `${horaInicio} - ${horaFin}`, { borderBottom: !!instructor })}
                ${instructor ? detailRow('Instructor(a)', instructor, { borderBottom: false }) : ''}
              </td>
            </tr>
          </table>

          <!-- Nota cancelacion -->
          <table width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td style="background:#fef9ef; border:1px solid #f5e6c4; border-radius:8px; padding:10px 14px;">
                <p style="margin:0; color:#8b6f4e; font-size:11px; line-height:1.5;">
                  <img src="${icons.alertTriangle}" alt="" width="14" height="14" style="display:inline-block; vertical-align:middle; margin-right:5px;"><strong>Cancelacion:</strong> Si necesitas cancelar, hazlo con al menos 2 horas de anticipacion.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      ${emailFooter()}
      `
    );

    const response = await resend.emails.send({
      from: "EL REFUGIO <noreply@elrefugiocountryclub.com>",
      to: email,
      subject: "Reserva Confirmada - EL REFUGIO",
      html: htmlContent,
    });

    console.log("Email de confirmacion de reserva enviado exitosamente:", response);
    res.json({ success: true, data: response });
  } catch (error) {
    console.error("Error al enviar email de confirmacion de reserva:", error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para cancelacion de reserva
router.post("/send-cancellation-notification", async (req, res) => {
  try {
    const { email, nombre, fechaReserva, horaInicio, horaFin, instructor, motivoCancelacion } = req.body;
    console.log("Enviando notificacion de cancelacion por email a:", email);

    if (!email || !nombre || !fechaReserva || !horaInicio || !horaFin) {
      return res
        .status(400)
        .json({ error: "Campos requeridos: email, nombre, fechaReserva, horaInicio, horaFin" });
    }

    const fechaFormateada = formatearFecha(fechaReserva);

    const htmlContent = emailWrapper(
      `Hola ${nombre}, tu reserva del ${fechaFormateada} ha sido cancelada.`,
      `
      ${emailHeader()}

      <tr>
        <td style="padding:28px 32px 24px;">
          <!-- Badge cancelado -->
          <div style="text-align:center; margin-bottom:16px;">
            <span style="display:inline-block; background:#fdecea; color:#c0392b; font-size:12px; font-weight:700; padding:6px 18px; border-radius:20px; border:1px solid #f5c6cb;">
              <img src="${icons.xCircle}" alt="" width="14" height="14" style="display:inline-block; vertical-align:middle; margin-right:5px;">Reserva Cancelada
            </span>
          </div>

          <p style="margin:0 0 20px 0; color:#666; font-size:14px; text-align:center;">
            Hola <strong style="color:#8b6f4e;">${nombre}</strong>, tu reserva ha sido cancelada.
          </p>

          <!-- Detalles -->
          <table width="100%" cellspacing="0" cellpadding="0" style="background:#faf8f5; border:1px solid #e8e0d6; border-radius:10px; margin-bottom:16px;">
            <tr>
              <td style="padding:18px 22px;">
                ${detailRow('Fecha', fechaFormateada, { strike: true })}
                ${detailRow('Horario', `${horaInicio} - ${horaFin}`, { strike: true, borderBottom: !!(instructor || motivoCancelacion) })}
                ${instructor ? detailRow('Instructor(a)', instructor, { borderBottom: !!motivoCancelacion }) : ''}
                ${motivoCancelacion ? detailRow('Motivo', motivoCancelacion, { borderBottom: false }) : ''}
              </td>
            </tr>
          </table>

          <!-- Nota -->
          <table width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td style="background:#fef9ef; border:1px solid #f5e6c4; border-radius:8px; padding:10px 14px;">
                <p style="margin:0; color:#8b6f4e; font-size:11px; line-height:1.5;">
                  Puedes hacer una nueva reserva desde la plataforma o contactarnos para reprogramar.
                </p>
              </td>
            </tr>
          </table>

          ${ctaButton('Hacer Nueva Reserva')}
        </td>
      </tr>

      ${emailFooter()}
      `
    );

    const response = await resend.emails.send({
      from: "EL REFUGIO <noreply@elrefugiocountryclub.com>",
      to: email,
      subject: "Reserva Cancelada - EL REFUGIO",
      html: htmlContent,
    });

    console.log("Email de cancelacion enviado exitosamente:", response);
    res.json({ success: true, data: response });
  } catch (error) {
    console.error("Error al enviar email de cancelacion:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
