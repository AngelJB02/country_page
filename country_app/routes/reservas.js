import express from 'express';
import db from '../server/db.js';

const router = express.Router();

// GET /reservas - Obtener reservas por rango de fechas
router.get('/', async (req, res) => {
  const { fecha_inicio, fecha_fin, usuario_id } = req.query;

  try {
    let query = `
      SELECT r.id, r.usuario_id, r.fecha, r.horario, r.nombre, r.edad, r.estado,
             c.tipo as clase_tipo, c.nombre as clase_nombre, c.descripcion as clase_descripcion,
             cab.id as caballo_id, cab.tipo as caballo_tipo
      FROM reservas r
      JOIN clases c ON r.clase_id = c.id
      LEFT JOIN caballos cab ON r.caballo_id = cab.id
    `;
    let params = [];
    let conditions = [];

    if (fecha_inicio && fecha_fin) {
      conditions.push("r.fecha BETWEEN ? AND ?");
      params.push(fecha_inicio, fecha_fin);
    } else if (fecha_inicio) {
      conditions.push("r.fecha >= ?");
      params.push(fecha_inicio);
    } else if (fecha_fin) {
      conditions.push("r.fecha <= ?");
      params.push(fecha_fin);
    }

    // Solo filtrar por usuario si se proporciona explícitamente
    if (usuario_id) {
      conditions.push("r.usuario_id = ?");
      params.push(usuario_id);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY r.fecha, r.horario";

    const [reservas] = await db.execute(query, params);
    
    res.json(reservas);
  } catch (err) {
    console.error('Error obteniendo reservas:', err);
    res.status(500).json({ error: "Error en el servidor obteniendo reservas" });
  }
});

// GET /reservas/:id - Obtener una reserva específica por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [reservas] = await db.execute(`
      SELECT r.*, c.tipo as clase_tipo, c.nombre as clase_nombre, 
             cab.id as caballo_id, cab.tipo as caballo_tipo
      FROM reservas r
      JOIN clases c ON r.clase_id = c.id
      LEFT JOIN caballos cab ON r.caballo_id = cab.id
      WHERE r.id = ?
    `, [id]);

    if (reservas.length === 0) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    res.json(reservas[0]);
  } catch (err) {
    console.error('Error obteniendo reserva:', err);
    res.status(500).json({ error: "Error en el servidor obteniendo reserva" });
  }
});

// GET /reservas/availability - Devuelve la disponibilidad de todos los horarios para una fecha
router.get('/availability', async (req, res) => {
  const { fecha } = req.query;
  if (!fecha) return res.status(400).json({ error: 'La fecha es requerida' });

  try {
    // Configuración de horarios con límite máximo de 6 por horario
    const horariosConfig = {
      "08:00": { total: 6 },
      "09:00": { total: 6 },
      "10:00": { total: 6 },
      "16:00": { total: 6 },
      "17:00": { total: 6 },
      "18:00": { total: 6 }
    };

    const disponibilidad = {};

    // Inicializar disponibilidad con límite de 6 por horario
    Object.keys(horariosConfig).forEach(horario => {
      disponibilidad[horario] = {
        total: horariosConfig[horario].total,
        available: horariosConfig[horario].total
      };
    });

    // Contar reservas activas por horario (excluyendo salto)
    const [reservasHorario] = await db.execute(`
      SELECT horario, COUNT(*) as total
      FROM reservas r
      JOIN clases c ON r.clase_id = c.id
      WHERE r.fecha = ? AND c.tipo != 'salto' AND r.estado = 'confirmada'
      GROUP BY horario
    `, [fecha]);

    // Actualizar disponibilidad por horario
    reservasHorario.forEach(reserva => {
      if (disponibilidad[reserva.horario]) {
        disponibilidad[reserva.horario].available = Math.max(0,
          disponibilidad[reserva.horario].total - reserva.total
        );
      }
    });

    // Contar reservas de salto
    const [saltoReservas] = await db.execute(`
      SELECT COUNT(*) as total
      FROM reservas r
      JOIN clases c ON r.clase_id = c.id
      WHERE c.tipo = 'salto' AND r.fecha = ? AND r.estado = 'confirmada'
    `, [fecha]);

    const totalSalto = saltoReservas[0].total;
    disponibilidad["salto"] = {
      total: 5,
      available: Math.max(5 - totalSalto, 0)
    };

    res.json(disponibilidad);
  } catch (err) {
    console.error('Error obteniendo disponibilidad:', err);
    res.status(500).json({ error: "Error en el servidor obteniendo disponibilidad" });
  }
});

// POST /reservas - Crear una nueva reserva con validaciones mejoradas
router.post('/', async (req, res) => {
  const { usuario_id, clase_id, fecha, horario, nombre, edad } = req.body;

  if (!usuario_id || !clase_id || !fecha || !horario || !nombre || !edad) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Validación: un cliente solo puede reservar una vez por día
    const [clienteReserva] = await conn.execute(
      "SELECT id FROM reservas WHERE LOWER(nombre) = LOWER(?) AND fecha = ? AND estado = 'confirmada'",
      [nombre, fecha]
    );
    if (clienteReserva.length > 0) {
      await conn.rollback();
      return res.status(400).json({
        error: "Solo se permite una reserva por día por cliente"
      });
    }

    // Obtener información de la clase
    const [claseRows] = await conn.execute(
      "SELECT id, tipo, nombre FROM clases WHERE id = ?",
      [clase_id]
    );
    if (claseRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: "Clase no encontrada" });
    }

    const tipo = claseRows[0].tipo;

    // Validaciones específicas por tipo de clase
    if (tipo === "salto") {
      // Verificar límite de salto (5 por día)
      const [saltoCount] = await conn.execute(`
        SELECT COUNT(*) as total
        FROM reservas r
        JOIN clases c ON r.clase_id = c.id
        WHERE c.tipo = 'salto' AND r.fecha = ? AND r.estado = 'confirmada'
      `, [fecha]);

      if (saltoCount[0].total >= 5) {
        await conn.rollback();
        return res.status(400).json({
          error: "No hay cupo disponible para salto (máximo 5 por día)"
        });
      }
    } else {
      // Validación: máximo 6 reservas por horario
      const [horarioCount] = await conn.execute(`
        SELECT COUNT(*) as total
        FROM reservas r
        JOIN clases c ON r.clase_id = c.id
        WHERE r.fecha = ? AND r.horario = ? AND c.tipo != 'salto' AND r.estado = 'confirmada'
      `, [fecha, horario]);

      if (horarioCount[0].total >= 6) {
        await conn.rollback();
        return res.status(400).json({
          error: "No hay cupo disponible para este horario (máximo 6 por horario)"
        });
      }
    }

    // Obtener un caballo disponible según tipo de clase
    const [caballoRows] = await conn.execute(
      "SELECT id, nombre FROM caballos WHERE tipo = ? AND disponible = 1 LIMIT 1",
      [tipo]
    );
    if (caballoRows.length === 0) {
      await conn.rollback();
      return res.status(400).json({
        error: "No hay caballos disponibles para este tipo de clase"
      });
    }

    const caballo_id = caballoRows[0].id;
    const caballo_nombre = caballoRows[0].nombre;

    // Crear la reserva
    const [result] = await conn.execute(`
      INSERT INTO reservas (usuario_id, clase_id, fecha, horario, nombre, edad, caballo_id, estado, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmada', NOW())
    `, [usuario_id, clase_id, fecha, horario, nombre, edad, caballo_id]);

    await conn.commit();

    // Respuesta con datos completos
    const reservaCompleta = {
      id: result.insertId,
      usuario_id,
      clase_id,
      clase_nombre: claseRows[0].nombre,
      clase_tipo: tipo,
      fecha,
      horario,
      nombre,
      edad,
      caballo_id,
      estado: "confirmada",
      notification_data: {
        tipo_evento: 'reserva_creada',
        cliente_nombre: nombre,
        cliente_edad: edad,
        actividad: tipo,
        fecha_formateada: new Date(fecha).toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        hora_formateada: new Date(`2000-01-01T${horario}`).toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        caballo_asignado: caballo_nombre
      }
    };

    res.status(201).json(reservaCompleta);

  } catch (err) {
    console.error('Error creando reserva:', err);
    await conn.rollback();
    res.status(500).json({ error: "Error en el servidor creando reserva" });
  } finally {
    conn.release();
  }
});

// PUT /reservas/:id - Actualizar una reserva
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { fecha, horario, nombre, edad, actividad } = req.body;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Verificar que la reserva existe y está activa
    const [reservaActual] = await conn.execute(
      "SELECT * FROM reservas WHERE id = ? AND estado = 'confirmada'",
      [id]
    );

    if (reservaActual.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: "Reserva no encontrada o ya cancelada" });
    }

    // Si se cambia la fecha, verificar disponibilidad
    if (fecha && fecha !== reservaActual[0].fecha) {
      // Validar que el cliente no tenga otra reserva ese día
      const [clienteReserva] = await conn.execute(
        "SELECT id FROM reservas WHERE LOWER(nombre) = LOWER(?) AND fecha = ? AND estado = 'confirmada' AND id != ?",
        [nombre || reservaActual[0].nombre, fecha, id]
      );
      if (clienteReserva.length > 0) {
        await conn.rollback();
        return res.status(400).json({
          error: "Ya existe una reserva para este cliente en la nueva fecha"
        });
      }
    }

    // Actualizar los campos proporcionados
    const updates = [];
    const params = [];

    if (fecha) {
      updates.push("fecha = ?");
      params.push(fecha);
    }
    if (horario) {
      updates.push("horario = ?");
      params.push(horario);
    }
    if (nombre) {
      updates.push("nombre = ?");
      params.push(nombre);
    }
    if (edad) {
      updates.push("edad = ?");
      params.push(edad);
    }

    if (updates.length === 0) {
      await conn.rollback();
      return res.status(400).json({ error: "No hay campos para actualizar" });
    }

    updates.push("updated_at = NOW()");
    params.push(id);

    await conn.execute(
      `UPDATE reservas SET ${updates.join(", ")} WHERE id = ?`,
      params
    );

    await conn.commit();

    // Obtener la reserva actualizada
    const [reservaActualizada] = await conn.execute(`
      SELECT r.*, c.tipo as clase_tipo, c.nombre as clase_nombre,
             cab.id as caballo_id
      FROM reservas r
      JOIN clases c ON r.clase_id = c.id
      LEFT JOIN caballos cab ON r.caballo_id = cab.id
      WHERE r.id = ?
    `, [id]);

    res.json({
      ...reservaActualizada[0],
      notification_data: {
        tipo_evento: 'reserva_actualizada',
        reserva_id: id,
        cambios_realizados: Object.keys(req.body)
      }
    });

  } catch (err) {
    console.error('Error actualizando reserva:', err);
    await conn.rollback();
    res.status(500).json({ error: "Error en el servidor actualizando reserva" });
  } finally {
    conn.release();
  }
});

// DELETE /reservas/:id - Cancelar una reserva
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Verificar que la reserva existe y está confirmada
    const [reservaActual] = await conn.execute(`
      SELECT r.*, c.tipo as clase_tipo, c.nombre as clase_nombre,
             cab.id as caballo_id
      FROM reservas r
      JOIN clases c ON r.clase_id = c.id
      LEFT JOIN caballos cab ON r.caballo_id = cab.id
      WHERE r.id = ? AND r.estado = 'confirmada'
    `, [id]);

    if (reservaActual.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: "Reserva no encontrada o ya cancelada" });
    }

    const reserva = reservaActual[0];

    // Cancelar la reserva
    await conn.execute(
      "UPDATE reservas SET estado = 'cancelada', updated_at = NOW() WHERE id = ?",
      [id]
    );

    // Liberar el caballo
    if (reserva.caballo_id) {
      await conn.execute(
        "UPDATE caballos SET disponible = 1 WHERE id = ?",
        [reserva.caballo_id]
      );
    }

    await conn.commit();

    res.json({
      message: "Reserva cancelada exitosamente",
      reserva_cancelada: {
        id: reserva.id,
        nombre: reserva.nombre,
        fecha: reserva.fecha,
        horario: reserva.horario,
        actividad: reserva.clase_tipo
      },
      notification_data: {
        tipo_evento: 'reserva_cancelada',
        reserva_id: id,
        cliente_nombre: reserva.nombre,
        fecha_original: reserva.fecha,
        horario_original: reserva.horario,
        actividad: reserva.clase_tipo,
        caballo_liberado: reserva.caballo_id
      }
    });

  } catch (err) {
    console.error('Error cancelando reserva:', err);
    await conn.rollback();
    res.status(500).json({ error: "Error en el servidor cancelando reserva" });
  } finally {
    conn.release();
  }
});

// GET /reservas/user/:userId/upcoming - Obtener próximas reservas de un usuario específico
router.get('/user/:userId/upcoming', async (req, res) => {
  const { userId } = req.params;
  const today = new Date().toISOString().split('T')[0];

  try {
    const [reservas] = await db.execute(`
      SELECT r.*, c.tipo as clase_tipo, c.nombre as clase_nombre,
             cab.id as caballo_id, cab.tipo as caballo_tipo
      FROM reservas r
      JOIN clases c ON r.clase_id = c.id
      LEFT JOIN caballos cab ON r.caballo_id = cab.id
      WHERE r.usuario_id = ? AND r.fecha >= ? AND r.estado = 'confirmada'
      ORDER BY r.fecha, r.horario
    `, [userId, today]);

    res.json(reservas);
  } catch (err) {
    console.error('Error obteniendo reservas del usuario:', err);
    res.status(500).json({ error: "Error en el servidor obteniendo reservas del usuario" });
  }
});

// GET /reservas/stats/:fecha - Obtener estadísticas de ocupación para una fecha específica
router.get('/stats/:fecha', async (req, res) => {
  const { fecha } = req.params;

  try {
    const [stats] = await db.execute(`
      SELECT 
        c.tipo as actividad,
        COUNT(*) as total_reservas,
        COUNT(CASE WHEN r.estado = 'confirmada' THEN 1 END) as confirmadas,
        COUNT(CASE WHEN r.estado = 'cancelada' THEN 1 END) as canceladas
      FROM reservas r
      JOIN clases c ON r.clase_id = c.id
      WHERE r.fecha = ?
      GROUP BY c.tipo
    `, [fecha]);

    const [horarios] = await db.execute(`
      SELECT 
        r.horario,
        COUNT(*) as total_reservas,
        COUNT(CASE WHEN r.estado = 'confirmada' THEN 1 END) as confirmadas
      FROM reservas r
      JOIN clases c ON r.clase_id = c.id
      WHERE r.fecha = ? AND c.tipo != 'salto'
      GROUP BY r.horario
      ORDER BY r.horario
    `, [fecha]);

    res.json({
      fecha,
      por_actividad: stats,
      por_horario: horarios,
      resumen: {
        total_dia: stats.reduce((sum, stat) => sum + stat.confirmadas, 0),
        cancelaciones: stats.reduce((sum, stat) => sum + stat.canceladas, 0)
      }
    });
  } catch (err) {
    console.error('Error obteniendo estadísticas:', err);
    res.status(500).json({ error: "Error en el servidor obteniendo estadísticas" });
  }
});

export default router;