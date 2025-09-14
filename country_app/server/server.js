// backend/server.js
import express from 'express';
import cors from 'cors';
import db from 'db.js'; // tu conexión MySQL
import usersRoutes from './routes/users.js'; // tus rutas de usuarios

const app = express();
const PORT = 5000;

// ⚡ CORS global para permitir requests desde tu frontend
app.use(cors({
  origin: 'http://localhost:5173', // URL de tu frontend
  methods: ['GET','POST','PATCH','PUT','DELETE'],
  credentials: true
}));

// Middleware para parsear JSON
app.use(express.json());

// Respuesta OPTIONS para preflight
app.options('*', cors());

// Montar rutas de usuarios bajo /api/users
app.use('/api/users', usersRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Servidor backend corriendo 🚀');
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error global:', err);
  res.status(500).json({ error: 'Error en el servidor' });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
