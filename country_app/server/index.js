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


// Obtener caballos disponibles por tipo y fecha
app.get('/caballos', async (req, res) => {
  const { tipo, fecha } = req.query;
  try {
    const [caballos] = await db.execute(
      `SELECT * FROM caballos c 
       WHERE c.tipo = ? AND c.disponible = 1 AND c.id NOT IN (
         SELECT caballo_id FROM reservas WHERE fecha = ?
       ) LIMIT 1`,
      [tipo, fecha]
    );
    res.json(caballos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error obteniendo caballos' });
  }
});

// Crear reserva automática
app.post('/reservas', async (req, res) => {
  const { usuario_id, clase_id, fecha, horario } = req.body;
  try {
    // Buscar tipo de clase
    const [claseRows] = await db.execute(`SELECT tipo FROM clases WHERE id = ?`, [clase_id]);
    if (claseRows.length === 0) return res.status(400).json({ message: 'Clase no encontrada' });
    const tipoClase = claseRows[0].tipo;

    // Buscar caballo disponible
    const [caballos] = await db.execute(
      `SELECT * FROM caballos c 
       WHERE c.tipo = ? AND c.disponible = 1 AND c.id NOT IN (
         SELECT caballo_id FROM reservas WHERE fecha = ?
       ) LIMIT 1`,
      [tipoClase, fecha]
    );
    if (caballos.length === 0) return res.status(400).json({ message: 'No hay caballos disponibles' });
    const caballo_id = caballos[0].id;

    // Insertar reserva
    await db.execute(
      `INSERT INTO reservas (usuario_id, caballo_id, clase_id, fecha, horario) VALUES (?, ?, ?, ?, ?)`,
      [usuario_id, caballo_id, clase_id, fecha, horario]
    );

    // Actualizar control_caballos
    const [controlRows] = await db.execute(
      `SELECT * FROM control_caballos WHERE caballo_id = ? AND fecha = ? AND tipo_clase = ?`,
      [caballo_id, fecha, tipoClase]
    );

    if (controlRows.length === 0) {
      await db.execute(
        `INSERT INTO control_caballos (caballo_id, fecha, tipo_clase, veces_usado) VALUES (?, ?, ?, 1)`,
        [caballo_id, fecha, tipoClase]
      );
    } else {
      await db.execute(
        `UPDATE control_caballos SET veces_usado = veces_usado + 1 WHERE id = ?`,
        [controlRows[0].id]
      );
    }

    res.json({ message: 'Reserva creada exitosamente', caballo_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creando reserva' });
  }
});
