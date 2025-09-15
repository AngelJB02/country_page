import express from 'express';
import db from '../server/db.js';

const router = express.Router();

// GET: Obtener reservas filtradas por fecha
router.get('/reservas', async (req, res) => {
  const { start, end } = req.query;
  if (!start) return res.status(400).json({ error: 'Se requiere start date' });

  try {
    let query = 'SELECT * FROM reservas WHERE fecha >= ?';
    const params = [start];

    if (end) {
      query += ' AND fecha <= ?';
      params.push(end);
    }

    query += ' ORDER BY fecha ASC, horario ASC';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
});

// PATCH: Actualizar asistencia
router.patch('/reservas/:id/asistencia', async (req, res) => {
  const { id } = req.params;
  const { asistencia } = req.body;

  if (!['asistio', 'falto', 'pendiente'].includes(asistencia))
    return res.status(400).json({ error: 'Valor inválido de asistencia' });

  try {
    await db.query('UPDATE reservas SET asistencia = ? WHERE id = ?', [asistencia, id]);
    res.json({ message: 'Asistencia actualizada correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar asistencia' });
  }
});

export default router;
