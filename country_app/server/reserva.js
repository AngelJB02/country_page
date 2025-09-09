// server/reservas.js
import express from 'express';
import cors from 'cors';
import db from './db.js'; // tu conexión a MySQL

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'Servidor corriendo ✅' });
});

/* ------------------- LOGIN USUARIO (sin hash) ------------------- */
/* ------------------- LOGIN USUARIO (sin hash) ------------------- */
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar por email o nombre
    const [rows] = await db.execute(
      'SELECT * FROM usuarios WHERE (email = ? OR nombre = ?)',
      [email, email] // reutilizamos el valor del input
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    const usuario = rows[0];

    // Validar contraseña directamente (sin hash)
    if (password !== usuario.password) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // Verificar que esté activo
    if (usuario.estado !== 'activo') {
      return res.status(403).json({ message: 'Usuario no está activo' });
    }

    // Respuesta con datos del usuario
    res.json({
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      rol: usuario.rol,
      estado: usuario.estado
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error en login' });
  }
});

/* ------------------- CABALLOS DISPONIBLES ------------------- */
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

/* ------------------- CREAR RESERVA AUTOMÁTICA ------------------- */
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

// Levantar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
