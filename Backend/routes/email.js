import express from "express";
import { Resend } from "resend";

const router = express.Router();
const resend = new Resend("re_h3MUFR11_AMEvhDEbDmza1P89t3fHWkJ5");

router.post("/send-credentials", async (req, res) => {
  try {
    const usuarioData = req.body;
    console.log("Enviando credenciales por email a:", usuarioData.email);

    if (!usuarioData.email) {
      return res
        .status(400)
        .json({ error: "El correo electrónico es requerido" });
    }

    const response = await resend.emails.send({
      from: "EL REFUGIO <noreply@elrefugiocountryclub.com>",
      to: usuarioData.email,
      subject: "Tus credenciales de acceso - EL REFUGIO",
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Bienvenido a EL REFUGIO</title>
</head>
<body style="margin:0; padding:0; background-color:#f5f5f5; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellspacing="0" cellpadding="0" style="background-color:#f5f5f5; padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="700" cellspacing="0" cellpadding="0" style="background-color:#ffffff; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.08); overflow:hidden; max-width:100%;">
          
<!-- Header -->
<tr>
  <td style="background: linear-gradient(135deg, #8b6f4e 0%, #a68968 100%); padding: 40px; text-align: center;">
    <!-- Logo -->
    <img src="https://elrefugiocountryclub.com/El_refugio_logo.png" 
         alt="Logo EL REFUGIO" 
         width="110" 
         style="display:block; margin:0 auto 16px;">
    
    <!-- Texto marca -->
    <h1 style="margin:0; color:#4b2e1e; font-size:28px; font-weight:800; letter-spacing:1px; text-transform:uppercase; font-family:Verdana, Geneva, sans-serif;">
      EL REFUGIO
    </h1>
  </td>
</tr>
          <!-- Contenido -->
          <tr>
            <td style="padding:36px 40px;">
              <h2 style="margin:0 0 8px 0; color:#1a1a1a; font-size:26px; font-weight:700; text-align:center;">
                ¡Bienvenido(a), ${usuarioData.nombre}!
              </h2>
              <div style="width:50px; height:3px; background:#8b6f4e; margin:0 auto 20px; border-radius:2px;"></div>
              
              <p style="margin:0 0 28px 0; color:#555555; font-size:15px; line-height:1.5; text-align:center;">
                Tu cuenta ha sido creada exitosamente con el rol de <strong style="color:#8b6f4e;">${
                  usuarioData.rol
                }</strong>.<br>
                A continuación encontrarás tus <strong style="color:#8b6f4e;">credenciales</strong> de acceso.
              </p>

              <!-- Credenciales -->
<table width="100%" cellspacing="0" cellpadding="0" style="background:#fafafa; border:2px solid #e8e8e8; border-radius:10px; margin-bottom:28px;">
  <tr>
    <td style="padding:28px 32px;">
      <div style="text-align:center; margin-bottom:20px;">
        <span style="color:#8b6f4e; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:1px;">
          Credenciales de Acceso
        </span>
      </div>

      <!-- Usuario -->
      <div style="margin-bottom:16px;">
        <span style="color:#888888; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:6px;">
          Usuario
        </span>
        <div style="background:#ffffff; border:2px solid #e0e0e0; border-radius:8px; padding:12px 14px; text-align:center;">
          <span style="color:#1a1a1a; font-size:15px; font-weight:600; font-family:'Courier New', monospace; word-break:break-word;">
            ${usuarioData.username}
          </span>
        </div>
      </div>

      <!-- Contraseña -->
      <div>
        <span style="color:#888888; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:6px;">
          Contraseña Temporal
        </span>
        <div style="background:#ffffff; border:2px solid #e0e0e0; border-radius:8px; padding:12px 14px; text-align:center;">
          <span style="color:#1a1a1a; font-size:15px; font-weight:600; font-family:'Courier New', monospace; word-break:break-word;">
            ${usuarioData.password}
          </span>
        </div>
      </div>
    </td>
  </tr>
</table>

              <!-- Botón -->
              <div style="text-align:center; margin-bottom:28px;">
                <a href="https://elrefugiocountryclub.com/login" style="display:inline-block; background:linear-gradient(135deg,#8b6f4e 0%,#a68968 100%); color:#ffffff; text-decoration:none; padding:14px 40px; border-radius:8px; font-size:15px; font-weight:600; box-shadow:0 4px 12px rgba(139,111,78,0.3);">
                  Acceder a la Plataforma
                </a>
              </div>

              <!-- Alerta -->
              <div style="background:#fff8e1; border-left:4px solid #ffc107; border-radius:6px; padding:16px 20px; margin-bottom:20px;">
                <p style="margin:0 0 4px 0; color:#8b6f4e; font-size:13px; font-weight:700;">
                  ⚠️ Importante
                </p>
                <p style="margin:0; color:#666666; font-size:13px; line-height:1.5;">
                  Por tu seguridad, debes cambiar tu contraseña en tu primer inicio de sesión.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#2d2d2d; padding:28px 40px; text-align:center;">
              <p style="margin:0 0 6px 0; color:#ffffff; font-size:14px; font-weight:600;">
                EL REFUGIO
              </p>
              <p style="margin:0 0 12px 0; color:rgba(255,255,255,0.7); font-size:12px;">
                © ${new Date().getFullYear()} Todos los derechos reservados
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    });

    console.log("Email enviado exitosamente:", response);
    res.json({ success: true, data: response });
  } catch (error) {
    console.error("Error al enviar email:", error);
    res.status(500).json({ error: error.message });
  }
});

// Nuevo endpoint para enviar credenciales actualizadas
router.post("/send-updated-credentials", async (req, res) => {
  try {
    const { email, nombre, username, newPassword } = req.body;
    console.log("Enviando credenciales actualizadas por email a:", email);

    if (!email || !nombre || !username || !newPassword) {
      return res
        .status(400)
        .json({ error: "Todos los campos son requeridos (email, nombre, username, newPassword)" });
    }

    const response = await resend.emails.send({
      from: "EL REFUGIO <noreply@elrefugiocountryclub.com>",
      to: email,
      subject: "Contraseña actualizada - EL REFUGIO",
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Contraseña Actualizada - EL REFUGIO</title>
</head>
<body style="margin:0; padding:0; background-color:#f5f5f5; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellspacing="0" cellpadding="0" style="background-color:#f5f5f5; padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="700" cellspacing="0" cellpadding="0" style="background-color:#ffffff; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.08); overflow:hidden; max-width:100%;">
          
<!-- Header -->
<tr>
  <td style="background: linear-gradient(135deg, #8b6f4e 0%, #a68968 100%); padding: 40px; text-align: center;">
    <!-- Logo -->
    <img src="https://elrefugiocountryclub.com/El_refugio_logo.png" 
         alt="Logo EL REFUGIO" 
         width="110" 
         style="display:block; margin:0 auto 16px;">
    
    <!-- Texto marca -->
    <h1 style="margin:0; color:#4b2e1e; font-size:28px; font-weight:800; letter-spacing:1px; text-transform:uppercase; font-family:Verdana, Geneva, sans-serif;">
      EL REFUGIO
    </h1>
  </td>
</tr>

          <!-- Contenido -->
          <tr>
            <td style="padding:36px 40px;">
              <h2 style="margin:0 0 8px 0; color:#1a1a1a; font-size:26px; font-weight:700; text-align:center;">
                ¡Hola, ${nombre}!
              </h2>
              <div style="width:50px; height:3px; background:#8b6f4e; margin:0 auto 20px; border-radius:2px;"></div>
              
              <p style="margin:0 0 28px 0; color:#555555; font-size:15px; line-height:1.5; text-align:center;">
                Tu contraseña ha sido <strong style="color:#8b6f4e;">actualizada exitosamente</strong>.<br>
                A continuación encontrarás tus <strong style="color:#8b6f4e;">credenciales actualizadas</strong> de acceso.
              </p>

              <!-- Credenciales -->
<table width="100%" cellspacing="0" cellpadding="0" style="background:#fafafa; border:2px solid #e8e8e8; border-radius:10px; margin-bottom:28px;">
  <tr>
    <td style="padding:28px 32px;">
      <div style="text-align:center; margin-bottom:20px;">
        <span style="color:#8b6f4e; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:1px;">
          Credenciales Actualizadas
        </span>
      </div>

      <!-- Usuario -->
      <div style="margin-bottom:16px;">
        <span style="color:#888888; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:6px;">
          Usuario
        </span>
        <div style="background:#ffffff; border:2px solid #e0e0e0; border-radius:8px; padding:12px 14px; text-align:center;">
          <span style="color:#1a1a1a; font-size:15px; font-weight:600; font-family:'Courier New', monospace; word-break:break-word;">
            ${username}
          </span>
        </div>
      </div>

      <!-- Contraseña -->
      <div>
        <span style="color:#888888; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:6px;">
          Nueva Contraseña
        </span>
        <div style="background:#ffffff; border:2px solid #e0e0e0; border-radius:8px; padding:12px 14px; text-align:center;">
          <span style="color:#1a1a1a; font-size:15px; font-weight:600; font-family:'Courier New', monospace; word-break:break-word;">
            ${newPassword}
          </span>
        </div>
      </div>
    </td>
  </tr>
</table>

              <!-- Botón -->
              <div style="text-align:center; margin-bottom:28px;">
                <a href="https://elrefugiocountryclub.com/login" style="display:inline-block; background:linear-gradient(135deg,#8b6f4e 0%,#a68968 100%); color:#ffffff; text-decoration:none; padding:14px 40px; border-radius:8px; font-size:15px; font-weight:600; box-shadow:0 4px 12px rgba(139,111,78,0.3);">
                  Acceder a la Plataforma
                </a>
              </div>

              <!-- Mensaje de seguridad -->
              <div style="background:#e8f5e8; border-left:4px solid #28a745; border-radius:6px; padding:16px 20px; margin-bottom:20px;">
                <p style="margin:0 0 4px 0; color:#28a745; font-size:13px; font-weight:700;">
                  ✅ Actualización Exitosa
                </p>
                <p style="margin:0; color:#666666; font-size:13px; line-height:1.5;">
                  Tu contraseña ha sido cambiada correctamente. Mantén tus credenciales seguras.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#2d2d2d; padding:28px 40px; text-align:center;">
              <p style="margin:0 0 6px 0; color:#ffffff; font-size:14px; font-weight:600;">
                EL REFUGIO
              </p>
              <p style="margin:0 0 12px 0; color:rgba(255,255,255,0.7); font-size:12px;">
                © ${new Date().getFullYear()} Todos los derechos reservados
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    });

    console.log("Email de credenciales actualizadas enviado exitosamente:", response);
    res.json({ success: true, data: response });
  } catch (error) {
    console.error("Error al enviar email de credenciales actualizadas:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
