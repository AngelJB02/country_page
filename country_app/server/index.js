// server/index.js
import express from "express";
import cors from "cors";
import db from "./db.js"; // ruta relativa correcta, db.js al mismo nivel que server

import instructorRoutes from '../routes/instructor.js'; 
import reservasRoutes from '../routes/reservas.js'; 
import horariosRoutes from '../routes/horarios.js'; 
import usersRoutes from '../routes/users.js'; 

console.log("✅ Rutas importadas correctamente");
console.log("📋 Reservas routes:", typeof reservasRoutes); 

const app = express();
const PORT = 3001;

// Middlewares
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "https://elrefugiocountryclub.com"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true
}));

app.use(express.json());

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Servidor backend corriendo 🚀");
});

// ========================
// Login
// ========================
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  try {
    const [rows] = await db.query(
      "SELECT * FROM usuarios WHERE nombre = ? AND password = ?",
      [email, password]
    );

    if (rows.length > 0) {
      const user = rows[0];
        // Verificar estado del usuario
        switch ((user.estado || '').toLowerCase()) {
          case 'activo':
            return res.json({
              mensaje: "✅ Login correcto",
              user: { id: user.id, nombre: user.nombre, rol: user.rol || "user", estado: user.estado }
            });
          case 'inactivo':
            return res.json({
              mensaje: "⚠️ Tu cuenta está inactiva. Comunícate con el administrador.",
              user: { id: user.id, nombre: user.nombre, rol: user.rol || "user", estado: user.estado }
            });
          case 'pendiente':
            return res.status(403).json({
              mensaje: "⏳ Tienes pagos pendientes y no puedes iniciar sesión.",
              user: { id: user.id, nombre: user.nombre, rol: user.rol || "user", estado: user.estado }
            });
          case 'bloqueado':
            return res.status(403).json({
              mensaje: "🚫 Tu cuenta está bloqueada y no puedes iniciar sesión.",
              user: { id: user.id, nombre: user.nombre, rol: user.rol || "user", estado: user.estado }
            });
          default:
            return res.status(403).json({
              mensaje: "❌ Estado de usuario no permitido.",
              user: { id: user.id, nombre: user.nombre, rol: user.rol || "user", estado: user.estado }
            });
        }
    } else {
      return res.status(401).json({ message: "❌ Usuario o contraseña incorrectos" });
    }
  } catch (err) {
    console.error("❌ Error en login:", err);
    return res.status(500).json({ error: "Error en el servidor" });
  }
});

// ========================
// Montar rutas
// ========================
console.log("🔧 Montando rutas...");
app.use("/api/instructor", instructorRoutes);
app.use("/api/reservas", (req, res, next) => {
  console.log(`📍 Ruta reservas: ${req.method} ${req.originalUrl}`);
  next();
}, reservasRoutes);
app.use("/api/horarios", horariosRoutes);
app.use("/api/users", usersRoutes);
// ========================
// Levantar servidor
// ========================
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

// Capturar errores de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Capturar errores globales
app.use((err, req, res, next) => {
  console.error("Error global:", err);
  res.status(500).json({ error: "Error en el servidor" });
});
