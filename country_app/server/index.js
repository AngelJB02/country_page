import express from 'express';
import cors from 'cors';
import db from './db.js'; // conexión MySQL
import instructorRoutes from '../routes/instructor.js'; 
import reservasRoutes from '../routes/reservas.js'; 
import horariosRoutes from '../routes/horarios.js'; 

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
    const match = password === user.password; // luego lo cambias a bcrypt
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

// Routers separados
app.use('/instructor', instructorRoutes);
app.use('/reservas', reservasRoutes);
app.use('/horarios', horariosRoutes);

// Iniciar servidor
app.listen(3001, () => console.log('Servidor escuchando en http://localhost:3001'));
