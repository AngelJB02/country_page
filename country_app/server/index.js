import express from 'express';
import cors from 'cors';
import db from './db.js'; // tu conexión a MySQL

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
    // Buscar usuario activo por email
    const [rows] = await db.execute(
      'SELECT * FROM usuarios WHERE email = ? AND estado = "activo"',
      [email]
    );


    if (rows.length === 0) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }

    const user = rows[0];

    // Comparar contraseña con bcrypt si está hasheada
    // Si no usas bcrypt, puedes usar: const match = password === user.password;
    const match = password === user.password;
    if (!match) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }

    // Login exitoso
    return res.json({
      message: 'Login exitoso',
      user: { id: user.id, nombre: user.nombre, rol: user.rol },
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error del servidor' });
  }
});

// Iniciar servidor
app.listen(3001, () => console.log('Servidor escuchando en http://localhost:3001'));
