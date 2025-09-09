import express from 'express';
import cors from 'cors';
import db from './db.js'; // tu conexión a MySQL

const router = express.Router();

router.use(cors());
router.use(express.json());

// ------------------ OBTENER RESERVAS AGRUPADAS ------------------
router.get('/', async (req, res) => {
  try {
    const [reservas] = await db.query(
      'SELECT horario, fecha FROM reservas WHERE estado != "cancelada"'
    );

    const agrupadas = {};
    reservas.forEach(r => {
      const fechaStr = r.fecha instanceof Date ? r.fecha.toISOString().split('T')[0] : r.fecha;
      if (!agrupadas[fechaStr]) agrupadas[fechaStr] = [];
      agrupadas[fechaStr].push(r.horario);
    });

    res.json(agrupadas);
  } catch (err) {
    console.error('Error cargando reservas:', err);
    res.status(500).json({ message: 'Error cargando reservas', error: err.message });
  }
});

// ------------------ ASIGNAR CABALLO ------------------
async function asignarCaballo(tipo) {
  try {
    const [caballos] = await db.query(
      'SELECT id, tipo FROM caballos WHERE tipo = ? AND disponible = 1 LIMIT 1',
      [tipo]
    );
    if (caballos.length > 0) return caballos[0];

    const [otros] = await db.query(
      'SELECT id, tipo FROM caballos WHERE disponible = 1 LIMIT 1'
    );
    return otros.length > 0 ? otros[0] : null;
  } catch (err) {
    console.error('Error asignando caballo:', err);
    return null;
  }
}

// ------------------ CREAR RESERVA ------------------
router.post('/', async (req, res) => {
  const { usuario_id, fecha, horario, tipoActividad } = req.body;

  if (!usuario_id || !fecha || !horario || !tipoActividad) {
    return res.status(400).json({ message: 'Faltan datos obligatorios' });
  }

  try {
    // Validar usuario
    const [usuarios] = await db.query('SELECT id, nombre FROM usuarios WHERE id = ?', [usuario_id]);
    if (usuarios.length === 0) return res.status(400).json({ message: 'Usuario no encontrado' });

    // Validar si ya existe reserva
    const [exist] = await db.query(
      'SELECT id FROM reservas WHERE fecha = ? AND horario = ? AND estado != "cancelada"',
      [fecha, horario]
    );
    if (exist.length > 0) return res.status(400).json({ message: 'Reserva ya existe' });

    // Asignar caballo
    const caballo = await asignarCaballo(tipoActividad);
    if (!caballo) return res.status(400).json({ message: `No hay caballos disponibles para ${tipoActividad}` });

    // Crear clase
    const [claseResult] = await db.query(
      'INSERT INTO clases (tipo, fecha, confirmacion_cita, usuario_id, caballo_id) VALUES (?, ?, 1, ?, ?)',
      [tipoActividad, fecha, usuario_id, caballo.id]
    );
    const claseId = claseResult.insertId;

    // Crear reserva
    const [reservaResult] = await db.query(
      'INSERT INTO reservas (usuario_id, caballo_id, clase_id, fecha, horario, estado) VALUES (?, ?, ?, ?, ?, "confirmada")',
      [usuario_id, caballo.id, claseId, fecha, horario]
    );

    res.json({
      message: 'Reserva creada con éxito',
      clase_id: claseId,
      reserva_id: reservaResult.insertId,
      caballo_id: caballo.id,
      caballo_nombre: `Caballo #${caballo.id} (${caballo.tipo})`,
      usuario_nombre: usuarios[0].nombre,
      fecha,
      horario,
      tipo: tipoActividad,
      estado: 'confirmada'
    });

  } catch (err) {
    console.error('Error creando reserva:', err);
    res.status(500).json({ message: 'Error interno', error: err.message });
  }
});

// ------------------ CONFIRMAR RESERVA ------------------
router.patch('/:reserva_id/confirmar', async (req, res) => {
  const { reserva_id } = req.params;
  try {
    const [result] = await db.query('UPDATE reservas SET estado = ? WHERE id = ?', ['confirmada', reserva_id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Reserva no encontrada' });
    res.json({ message: 'Reserva confirmada con éxito' });
  } catch (err) {
    console.error('Error confirmando reserva:', err);
    res.status(500).json({ message: 'Error confirmando reserva', error: err.message });
  }
});

export default router;
