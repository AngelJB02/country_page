import express from 'express';
import cors from 'cors';
import db from './db.js'; // tu conexión a MySQL
import reservasRouter from './reserva.js'; // importa tu router de reservas

const app = express();

app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'Servidor corriendo ✅' });
});

// Ruta de login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Faltan datos' });
  }

  try {
    const [rows] = await db.execute(
      'SELECT * FROM usuarios WHERE email = ? AND estado = "activo"',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }

    const user = rows[0];
    const match = password === user.password;
    if (!match) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }

    return res.json({
      message: 'Login exitoso',
      user: { id: user.id, nombre: user.nombre, rol: user.rol },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error del servidor' });
  }
});

// Montar rutas de reservas
app.use('/reservas', reservasRouter);

// Iniciar servidor
const PORT = 3001;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
