import express from "express";
import db from "../server/db.js";
const router = express.Router();

// Obtener todas las reservas con el nombre de la clase
router.get("/reservas", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        r.id,
        r.usuario_id,
        r.nombre,
        r.edad,
        r.caballo_id,
        r.clase_id,
        c.nombre AS clase_nombre,  -- Trae el nombre de la clase
        r.fecha,
        r.horario,
        r.estado,
        r.asistencia
      FROM reservas r
      LEFT JOIN clases c ON r.clase_id = c.id
    `);

    console.log("Reservas obtenidas con nombre de clase:", rows);
    res.json(rows);
  } catch (err) {
    console.error("Error al obtener reservas:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
