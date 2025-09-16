import express from "express";
import db from "../server/db.js"; // Asegúrate que la ruta sea correcta
const router = express.Router();

// Obtener todas las reservas de instructores
router.get("/reservas", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM reservas");
    res.json(rows);
  } catch (err) {
    console.error("Error al obtener reservas:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Obtener un instructor por ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query("SELECT * FROM instructores WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Instructor no encontrado" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Error al obtener instructor:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Crear un instructor
router.post("/", async (req, res) => {
  const { nombre, correo } = req.body;
  if (!nombre || !correo) return res.status(400).json({ error: "Faltan datos" });

  try {
    const [result] = await db.query(
      "INSERT INTO instructores (nombre, correo) VALUES (?, ?)",
      [nombre, correo]
    );
    res.status(201).json({ mensaje: "Instructor creado", id: result.insertId });
  } catch (err) {
    console.error("Error al crear instructor:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Actualizar un instructor
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, correo } = req.body;

  try {
    const [result] = await db.query(
      "UPDATE instructores SET nombre = ?, correo = ? WHERE id = ?",
      [nombre, correo, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: "Instructor no encontrado" });
    res.json({ mensaje: "Instructor actualizado" });
  } catch (err) {
    console.error("Error al actualizar instructor:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Eliminar un instructor
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query("DELETE FROM instructores WHERE id = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Instructor no encontrado" });
    res.json({ mensaje: "Instructor eliminado" });
  } catch (err) {
    console.error("Error al eliminar instructor:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

export default router;
