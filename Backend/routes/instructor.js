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

// Actualizar solo el campo de asistencia de una reserva
router.put("/reservas/:id/asistencia", async (req, res) => {
  const { id } = req.params;
  const { asistencia } = req.body;
  console.log("Valor recibido en asistencia:", asistencia);

  if (!["asistio", "falto", "cancelada", "pendiente"].includes(asistencia)) {
    return res.status(400).json({ error: "Valor de asistencia no válido" });
  }

  try {
    const [result] = await db.query(
      "UPDATE reservas SET asistencia = ? WHERE id = ?",
      [asistencia, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }
    res.json({ message: "Asistencia actualizada correctamente", asistencia });
  } catch (err) {
    console.error("Error al actualizar asistencia:", err);
    res.status(500).json({ error: err.message });
  }
});
export default router;
