// routes/instructor.js
import express from 'express';
import db from '../server/db.js';

const router = express.Router();

// GET: Obtener reservas según rango de fechas o vista (day/week/month)
router.get('/reservas', async (req, res) => {
  const { start, end } = req.query;

  try {
    let query = `
      SELECT r.id, r.nombre AS alumno, r.edad, r.fecha, r.horario,
             c.nombre AS clase, r.asistencia
      FROM reservas r
      JOIN clases c ON r.clase_id = c.id
      ORDER BY r.fecha ASC, r.horario ASC
    `;
    
    const params = [];
    const conditions = [];

    if (start) conditions.push('r.fecha >= ?');
    if (end) conditions.push('r.fecha <= ?');

    if (conditions.length > 0) {
      query = query.replace('ORDER BY', 'WHERE ' + conditions.join(' AND ') + ' ORDER BY');
      if (start) params.push(start);
      if (end) params.push(end);
    }

    console.log('SQL:', query, 'Params:', params); // Para depuración

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener reservas del instructor:', err);
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
});

// PATCH: Actualizar asistencia de un alumno en una reserva
router.patch('/reservas/:id/asistencia', async (req, res) => {
  const { id } = req.params;
  const { asistencia } = req.body;

  if (!['asistio', 'falto', 'pendiente'].includes(asistencia))
    return res.status(400).json({ error: 'Valor inválido de asistencia' });

  try {
    await db.query('UPDATE reservas SET asistencia = ? WHERE id = ?', [asistencia, id]);
    res.json({ message: 'Asistencia actualizada correctamente' });
  } catch (err) {
    console.error('Error al actualizar asistencia:', err);
    res.status(500).json({ error: 'Error al actualizar asistencia' });
  }
});

export default router;
