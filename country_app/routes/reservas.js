// reservas.js
import express from 'express';
import db from '../server/db.js';

const router = express.Router();

/* =========================
   GET /reservas
   Obtener reservas por rango de fechas (para cargar el mes del calendario)
   ========================= */
router.get('/', async (req, res) => {
  const { fecha_inicio, fecha_fin } = req.query;

  try {
    let query = `
      SELECT r.id, r.fecha, r.horario, r.nombre, r.edad, r.estado,
             c.tipo as clase_tipo, c.nombre as clase_nombre, c.descripcion as clase_descripcion
      FROM reservas r
      JOIN clases c ON r.clase_id = c.id
    `;
    let params = [];

    if (fecha_inicio && fecha_fin) {
      query += " WHERE r.fecha BETWEEN ? AND ?";
      params = [fecha_inicio, fecha_fin];
    } else if (fecha_inicio) {
      query += " WHERE r.fecha >= ?";
      params = [fecha_inicio];
    } else if (fecha_fin) {
      query += " WHERE r.fecha <= ?";
      params = [fecha_fin];
    }

    query += " ORDER BY r.fecha, r.horario";

    const [reservas] = await db.execute(query, params);
    res.json(reservas);
  } catch (err) {
    console.error('Error obteniendo reservas:', err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

/* =========================
   GET /reservas/availability
   Devuelve la disponibilidad de todos los horarios para una fecha.
   ========================= */
router.get('/availability', async (req, res) => {
  const { fecha } = req.query;
  if (!fecha) return res.status(400).json({ error: 'La fecha es requerida' });

  try {
    // Configuración de horarios y cupos
    const horariosConfig = {
      "08:00": { total: 6 },
      "09:00": { total: 6 },
      "10:00": { total: 6 },
      "16:00": { total: 8 },
      "17:00": { total: 8 },
      "18:00": { total: 8 }
    };

    const disponibilidad = {};

    // Inicializar disponibilidad
    Object.keys(horariosConfig).forEach(horario => {
      disponibilidad[horario] = {
        total: horariosConfig[horario].total,
        available: horariosConfig[horario].total
      };
    });

    // Contar reservas existentes por horario (excluyendo salto)
    const [reservasHorario] = await db.execute(`
      SELECT horario, COUNT(*) as total
      FROM reservas r
      JOIN clases c ON r.clase_id = c.id
      WHERE r.fecha = ? AND c.tipo != 'salto' AND r.estado != 'cancelada'
      GROUP BY horario
    `, [fecha]);

    reservasHorario.forEach(reserva => {
      if (disponibilidad[reserva.horario]) {
        disponibilidad[reserva.horario].available = Math.max(0,
          disponibilidad[reserva.horario].total - reserva.total
        );
      }
    });

    // Manejo especial para salto (límite diario de 5)
    const [saltoReservas] = await db.execute(`
      SELECT COUNT(*) as total
      FROM reservas r
      JOIN clases c ON r.clase_id = c.id
      WHERE c.tipo = 'salto' AND r.fecha = ? AND r.estado != 'cancelada'
    `, [fecha]);

    const totalSalto = saltoReservas[0].total;
    disponibilidad["salto"] = {
      total: 5,
      available: Math.max(5 - totalSalto, 0)
    };

    res.json(disponibilidad);
  } catch (err) {
    console.error('Error obteniendo disponibilidad:', err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

/* =========================
   POST /reservas
   Crear una nueva reserva respetando las reglas del sistema.
   ========================= */
router.post('/', async (req, res) => {
  const { usuario_id, clase_id, fecha, horario, nombre, edad } = req.body;

  if (!usuario_id || !clase_id || !fecha || !horario || !nombre || !edad) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Verificar que no existe reserva para el mismo nombre en la misma fecha
    const [existeNombre] = await conn.execute(
      "SELECT id FROM reservas WHERE nombre = ? AND fecha = ? AND estado != 'cancelada'",
      [nombre, fecha]
    );
    if (existeNombre.length > 0) {
      await conn.rollback();
      return res.status(400).json({
        error: "Ya existe una reserva a nombre de esta persona para este día"
      });
    }

    // Obtener información de la clase
    const [claseRows] = await conn.execute(
      "SELECT id, tipo FROM clases WHERE id = ?",
      [clase_id]
    );
    if (claseRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: "Clase no encontrada" });
    }

    const tipo = claseRows[0].tipo;

    // Validaciones específicas por tipo de clase
    if (tipo === "salto") {
      const [saltoCount] = await conn.execute(`
        SELECT COUNT(*) as total
        FROM reservas r
        JOIN clases c ON r.clase_id = c.id
        WHERE c.tipo = 'salto' AND r.fecha = ? AND r.estado != 'cancelada'
      `, [fecha]);

      if (saltoCount[0].total >= 5) {
        await conn.rollback();
        return res.status(400).json({
          error: "No hay cupo disponible para salto (máximo 5 por día)"
        });
      }
    } else {
      const cupoMax = tipo === "iniciacion" ? 6 : 8;
      const [horarioCount] = await conn.execute(`
        SELECT COUNT(*) as total
        FROM reservas r
        JOIN clases c ON r.clase_id = c.id
        WHERE r.fecha = ? AND r.horario = ? AND c.tipo != 'salto' AND r.estado != 'cancelada'
      `, [fecha, horario]);

      if (horarioCount[0].total >= cupoMax) {
        await conn.rollback();
        return res.status(400).json({
          error: "No hay cupo disponible para este horario"
        });
      }
    }

    // Crear la reserva
    const [result] = await conn.execute(`
      INSERT INTO reservas (usuario_id, clase_id, fecha, horario, nombre, edad, estado)
      VALUES (?, ?, ?, ?, ?, ?, 'confirmada')
    `, [usuario_id, clase_id, fecha, horario, nombre, edad]);

    await conn.commit();

    res.status(201).json({
      id: result.insertId,
      usuario_id,
      clase_id,
      fecha,
      horario,
      nombre,
      edad,
      estado: "confirmada"
    });

  } catch (err) {
    console.error('Error creando reserva:', err);
    await conn.rollback();
    res.status(500).json({ error: "Error en el servidor" });
  } finally {
    conn.release();
  }
});

/* =========================
   DELETE /reservas/:id
   Cancelar una reserva
   ========================= */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.execute(
      "UPDATE reservas SET estado = 'cancelada' WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    res.json({ message: "Reserva cancelada exitosamente" });
  } catch (err) {
    console.error('Error cancelando reserva:', err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

export default router;
