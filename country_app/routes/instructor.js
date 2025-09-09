import express from 'express';
import db from '../server/db.js';

const router = express.Router();

// GET /instructor/clases
router.get('/clases', async (req, res) => {
  try {
    // Obtener todas las clases con datos de usuario y caballo
    const [rows] = await db.execute(
      `SELECT cl.id AS clase_id, cl.tipo, cl.fecha, cl.confirmacion_cita,
              u.id AS usuario_id, u.nombre AS usuario_nombre, u.edad AS usuario_edad,
              c.nombre AS caballo_nombre
       FROM clases cl
       LEFT JOIN usuarios u ON cl.usuario_id = u.id
       LEFT JOIN caballos c ON cl.caballo_id = c.id
       ORDER BY cl.fecha ASC`
    );

    // Agrupar reservas por clase
    const clasesMap = {};
    rows.forEach(r => {
      if (!clasesMap[r.clase_id]) {
        clasesMap[r.clase_id] = {
          id: r.clase_id,
          tipo: r.tipo,
          fecha: r.fecha,
          caballo_nombre: r.caballo_nombre,
          reservas: []
        };
      }
      if (r.usuario_id) {
        clasesMap[r.clase_id].reservas.push({
          id: r.usuario_id,
          usuario_nombre: r.usuario_nombre,
          usuario_edad: r.usuario_edad
        });
      }
    });

    res.json(Object.values(clasesMap));

  } catch (error) {
    console.error('ERROR EN /instructor/clases:', error);
    res.status(500).json({ message: 'Error al obtener las clases' });
  }
});

export default router;
