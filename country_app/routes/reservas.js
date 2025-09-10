import express from 'express';
import db from '../db.js';

const router = express.Router();

// --- Disponibilidad ---
router.get('/availability', async (req, res) => {
  const { fecha } = req.query;
  if (!fecha) return res.status(400).json({ error: 'La fecha es requerida' });

  try {
    const [clases] = await db.execute("SELECT * FROM clases WHERE fecha = ?", [fecha]);
    const [horarios] = await db.execute("SELECT * FROM horarios");

    const disponibilidad = {
      iniciacion: {},
      paseo: {},
      salto: {},
    };

    horarios.forEach(h => {
      disponibilidad.iniciacion[h.hora] = 7;
      disponibilidad.paseo[h.hora] = 5;
      disponibilidad.salto[h.hora] = null; // cupo total
    });

    const [reservas] = await db.execute(
      "SELECT clase_id, horario, COUNT(*) as total FROM reservas WHERE fecha = ? GROUP BY clase_id, horario",
      [fecha]
    );

    for (let r of reservas) {
      const clase = clases.find(c => c.id === r.clase_id);
      if (!clase) continue;

      if (clase.tipo === "salto") {
        const totalSalto = reservas
          .filter(x => clases.find(c => c.id === x.clase_id)?.tipo === "salto")
          .reduce((sum, x) => sum + x.total, 0);

        horarios.forEach(h => {
          disponibilidad.salto[h.hora] = Math.max(5 - totalSalto, 0);
        });
      } else if (clase.tipo === "iniciacion") {
        disponibilidad.iniciacion[r.horario] = Math.max(7 - r.total, 0);
      } else if (clase.tipo === "paseo") {
        disponibilidad.paseo[r.horario] = Math.max(5 - r.total, 0);
      }
    }

    res.json({ fecha, disponibilidad });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// --- Crear reserva ---
router.post('/', async (req, res) => {
  const { usuario_id, caballo_id, clase_id, fecha, horario } = req.body;
  if (!usuario_id || !clase_id || !fecha || !horario) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Validar que el usuario no tenga otra reserva ese día
    const [existe] = await conn.execute(
      "SELECT id FROM reservas WHERE usuario_id = ? AND fecha = ?",
      [usuario_id, fecha]
    );
    if (existe.length > 0) {
      await conn.rollback();
      return res.status(400).json({ error: "El usuario ya tiene reserva ese día" });
    }

    // Verificar clase
    const [claseRows] = await conn.execute("SELECT * FROM clases WHERE id = ?", [clase_id]);
    if (claseRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: "Clase no encontrada" });
    }

    const tipo = claseRows[0].tipo;
    let cupoMax = tipo === "iniciacion" ? 7 : tipo === "paseo" ? 5 : 5;

    let query, params;
    if (tipo === "salto") {
      query = "SELECT COUNT(*) as total FROM reservas r JOIN clases c ON r.clase_id = c.id WHERE c.tipo = 'salto' AND r.fecha = ?";
      params = [fecha];
    } else {
      query = "SELECT COUNT(*) as total FROM reservas r JOIN clases c ON r.clase_id = c.id WHERE c.tipo = ? AND r.fecha = ? AND r.horario = ?";
      params = [tipo, fecha, horario];
    }

    const [count] = await conn.execute(query, params);
    if (count[0].total >= cupoMax) {
      await conn.rollback();
      return res.status(400).json({ error: "No hay cupo disponible" });
    }

    const [result] = await conn.execute(
      "INSERT INTO reservas (usuario_id, caballo_id, clase_id, fecha, horario, estado) VALUES (?, ?, ?, ?, ?, 'pendiente')",
      [usuario_id, caballo_id || null, clase_id, fecha, horario]
    );

    await conn.commit();
    res.status(201).json({ id: result.insertId, estado: "pendiente" });
  } catch (err) {
    console.error(err);
    await conn.rollback();
    res.status(500).json({ error: "Error en el servidor" });
  } finally {
    conn.release();
  }
});

export default router;
