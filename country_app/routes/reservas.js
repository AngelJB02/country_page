import express from 'express';
import db from '../db.js';

const router = express.Router();

  /* =========================
    GET /reservas/availability
    Devuelve la disponibilidad de todos los horarios para una fecha.
    ========================= */
  router.get('/availability', async (req, res) => {
    const { fecha } = req.query;
    if (!fecha) return res.status(400).json({ error: 'La fecha es requerida' });

  try {
    // 1️⃣ Definimos los horarios fijos
    const horarios = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];

    // 2️⃣ Inicializamos la disponibilidad de cada horario
    const disponibilidad = {};
    horarios.forEach(h => {
      if (["09:00", "10:00", "11:00"].includes(h)) disponibilidad[h] = { total: 7, available: 7 }; // Iniciación
      else disponibilidad[h] = { total: 5, available: 5 }; // Paseo
    });

    // 3️⃣ Consultamos reservas del día
    const [reservas] = await db.execute(
      "SELECT clase_id, horario, COUNT(*) as total FROM reservas WHERE fecha = ? GROUP BY clase_id, horario",
      [fecha]
    );

    // 4️⃣ Obtenemos tipos de clase
    const [clases] = await db.execute("SELECT id, tipo FROM clases");

    // 5️⃣ Ajustamos la disponibilidad según las reservas hechas
    reservas.forEach(r => {
      const clase = clases.find(c => c.id === r.clase_id);
      if (!clase) return;

      if (clase.tipo === "iniciacion" || clase.tipo === "paseo") {
        disponibilidad[r.horario].available -= r.total;
        if (disponibilidad[r.horario].available < 0) disponibilidad[r.horario].available = 0;
      }
    });

    // 6️⃣ Para Salto: solo 5 espacios por día
    const [saltoReservas] = await db.execute(
      "SELECT COUNT(*) as total FROM reservas r JOIN clases c ON r.clase_id = c.id WHERE c.tipo = 'salto' AND r.fecha = ?",
      [fecha]
    );
    const totalSalto = saltoReservas[0].total;
    disponibilidad["salto"] = { total: 5, available: Math.max(5 - totalSalto, 0) };

    res.json(disponibilidad);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});


/* =========================
   POST /reservas
   Crear una nueva reserva respetando las reglas de tu sistema.
   ========================= */
router.post('/', async (req, res) => {
  const { usuario_id, clase_id, fecha, horario, nombre, edad, actividad } = req.body;

  // 1️⃣ Validación básica
  if (!usuario_id || !clase_id || !fecha || !horario || !nombre || !edad || !actividad) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

    // 2️⃣ Verificar que el usuario no tenga otra reserva ese día
    const [existe] = await conn.execute(
      "SELECT id FROM reservas WHERE usuario_id = ? AND fecha = ?",
      [usuario_id, fecha]
    );
    if (existe.length > 0) {
      await conn.rollback();
      return res.status(400).json({ error: "El usuario ya tiene reserva ese día" });
    }

    // 3️⃣ Obtener tipo de clase y establecer cupo máximo
    const [claseRows] = await conn.execute("SELECT id, tipo FROM clases WHERE id = ?", [clase_id]);
    if (claseRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: "Clase no encontrada" });
    }

    const tipo = claseRows[0].tipo;
    let cupoMax = tipo === "iniciacion" ? 7 : tipo === "paseo" ? 5 : 5;

    // 4️⃣ Contar reservas existentes según tipo de clase
    let [count];
    if (tipo === "salto") {
      // Salto: solo 5 por día
      [count] = await conn.execute(
        "SELECT COUNT(*) as total FROM reservas r JOIN clases c ON r.clase_id = c.id WHERE c.tipo = 'salto' AND r.fecha = ?",
        [fecha]
      );
    } else {
      // Iniciación o Paseo: cupo por horario
      [count] = await conn.execute(
        "SELECT COUNT(*) as total FROM reservas WHERE clase_id = ? AND fecha = ? AND horario = ?",
        [clase_id, fecha, horario]
      );
    }

    if (count[0].total >= cupoMax) {
      await conn.rollback();
      return res.status(400).json({ error: "No hay cupo disponible" });
    }

    // 5️⃣ Insertar la reserva
    const [result] = await conn.execute(
      "INSERT INTO reservas (usuario_id, clase_id, fecha, horario, nombre, edad, actividad, estado) VALUES (?, ?, ?, ?, ?, ?, ?, 'pendiente')",
      [usuario_id, clase_id, fecha, horario, nombre, edad, actividad]
    );

      await conn.commit();

    res.status(201).json({
      id: result.insertId,
      usuario_id,
      clase_id,
      fecha,
      horario,
      nombre,
      edad,
      actividad,
      estado: "pendiente"
    });

  } catch (err) {
    console.error(err);
    await conn.rollback();
    res.status(500).json({ error: "Error en el servidor" });
  } finally {
    conn.release();
  }
});

  export default router;
