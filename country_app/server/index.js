// server/index.js
import express from "express";
import cors from "cors";
import db from "./db.js"; // tu conexión ya con promise

const app = express();
const PORT = 3001;

// Middlewares
app.use(cors({
  origin: "http://localhost:5173", // frontend Vite
  methods: ["GET", "POST", "PUT", "DELETE"],
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
app.post("/login", async (req, res) => {
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
      return res.json({
        mensaje: "✅ Login correcto",
        user: { id: user.id, nombre: user.nombre, rol: user.rol || "user" }
      });
    } else {
      return res.status(401).json({ message: "❌ Usuario o contraseña incorrectos" });
    }
  } catch (err) {
    console.error("❌ Error en login:", err);
    return res.status(500).json({ error: "Error en el servidor" });
  }
});

// ========================
// Levantar servidor
// ========================
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
