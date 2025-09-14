import express from 'express';
const router = express.Router();
import db from '../server/db.js';

// GET /api/horarios - Obtener horarios dinámicamente desde la base de datos
router.get('/', async (req, res) => {
  const { dia_semana } = req.query;
  
  try {
    let query = "SELECT id, hora, turno, dia_semana, disponible FROM horarios";
    let params = [];
    
    // Filtrar por día de la semana si se proporciona
    if (dia_semana) {
      query += " WHERE dia_semana = ? AND disponible = 1";
      params.push(dia_semana);
    } else {
      query += " WHERE disponible = 1";
    }
    
    query += " ORDER BY hora ASC";
    
    const [rows] = await db.execute(query, params);
    
    // Si no hay horarios en la BD, usar fallback con límite de 6 horarios
    if (rows.length === 0) {
      const horariosDefault = [
        { id: 1, hora: '08:00:00', turno: 'mañana', dia_semana: dia_semana || 'todos', disponible: 1 },
        { id: 2, hora: '09:00:00', turno: 'mañana', dia_semana: dia_semana || 'todos', disponible: 1 },
        { id: 3, hora: '10:00:00', turno: 'mañana', dia_semana: dia_semana || 'todos', disponible: 1 },
        { id: 4, hora: '16:00:00', turno: 'tarde', dia_semana: dia_semana || 'todos', disponible: 1 },
        { id: 5, hora: '17:00:00', turno: 'tarde', dia_semana: dia_semana || 'todos', disponible: 1 },
        { id: 6, hora: '18:00:00', turno: 'tarde', dia_semana: dia_semana || 'todos', disponible: 1 }
      ];
      return res.json(horariosDefault);
    }
    
    res.json(rows);
  } catch (err) {
    console.error('Error obteniendo horarios:', err);
    
    // En caso de error, devolver horarios por defecto con límite de 6
    const horariosDefault = [
      { id: 1, hora: '08:00:00', turno: 'mañana', dia_semana: dia_semana || 'todos', disponible: 1 },
      { id: 2, hora: '09:00:00', turno: 'mañana', dia_semana: dia_semana || 'todos', disponible: 1 },
      { id: 3, hora: '10:00:00', turno: 'mañana', dia_semana: dia_semana || 'todos', disponible: 1 },
      { id: 4, hora: '16:00:00', turno: 'tarde', dia_semana: dia_semana || 'todos', disponible: 1 },
      { id: 5, hora: '17:00:00', turno: 'tarde', dia_semana: dia_semana || 'todos', disponible: 1 },
      { id: 6, hora: '18:00:00', turno: 'tarde', dia_semana: dia_semana || 'todos', disponible: 1 }
    ];
    
    res.status(500).json({ 
      error: "Error obteniendo horarios del servidor", 
      horarios_default: horariosDefault 
    });
  }
});

// POST /api/horarios - Crear nuevo horario
router.post('/', async (req, res) => {
  const { hora, turno, dia_semana } = req.body;
  
  if (!hora || !turno || !dia_semana) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }
  
  try {
    // Validar que no exista el mismo horario para el mismo día
    const [existing] = await db.execute(
      "SELECT id FROM horarios WHERE hora = ? AND dia_semana = ?",
      [hora, dia_semana]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'El horario ya existe para este día' });
    }
    
    const [result] = await db.execute(
      "INSERT INTO horarios (hora, turno, dia_semana, disponible, created_at) VALUES (?, ?, ?, 1, NOW())",
      [hora, turno, dia_semana]
    );
    
    res.status(201).json({
      id: result.insertId,
      hora,
      turno,
      dia_semana,
      disponible: 1,
      message: 'Horario creado exitosamente'
    });
  } catch (err) {
    console.error('Error creando horario:', err);
    res.status(500).json({ error: "Error en el servidor creando horario" });
  }
});

// PUT /api/horarios/:id - Actualizar horario
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { hora, turno, dia_semana, disponible } = req.body;
  
  try {
    // Verificar que el horario existe
    const [existing] = await db.execute("SELECT * FROM horarios WHERE id = ?", [id]);
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Horario no encontrado' });
    }
    
    const updates = [];
    const params = [];
    
    if (hora) {
      updates.push("hora = ?");
      params.push(hora);
    }
    if (turno) {
      updates.push("turno = ?");
      params.push(turno);
    }
    if (dia_semana) {
      updates.push("dia_semana = ?");
      params.push(dia_semana);
    }
    if (disponible !== undefined) {
      updates.push("disponible = ?");
      params.push(disponible);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }
    
    updates.push("updated_at = NOW()");
    params.push(id);
    
    await db.execute(
      `UPDATE horarios SET ${updates.join(", ")} WHERE id = ?`,
      params
    );
    
    // Obtener el horario actualizado
    const [updated] = await db.execute("SELECT * FROM horarios WHERE id = ?", [id]);
    
    res.json({
      ...updated[0],
      message: 'Horario actualizado exitosamente'
    });
  } catch (err) {
    console.error('Error actualizando horario:', err);
    res.status(500).json({ error: "Error en el servidor actualizando horario" });
  }
});

// DELETE /api/horarios/:id - Eliminar/desactivar horario
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // Verificar que el horario existe
    const [existing] = await db.execute("SELECT * FROM horarios WHERE id = ?", [id]);
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Horario no encontrado' });
    }
    
    // Verificar si hay reservas activas para este horario
    const [reservasActivas] = await db.execute(`
      SELECT COUNT(*) as total 
      FROM reservas r
      JOIN horarios h ON r.horario = TIME_FORMAT(h.hora, '%H:%i')
      WHERE h.id = ? AND r.estado = 'confirmada' AND r.fecha >= CURDATE()
    `, [id]);
    
    if (reservasActivas[0].total > 0) {
      // Si hay reservas activas, solo marcar como no disponible
      await db.execute(
        "UPDATE horarios SET disponible = 0, updated_at = NOW() WHERE id = ?",
        [id]
      );
      
      res.json({
        message: 'Horario desactivado (hay reservas activas)',
        horario_id: id,
        reservas_existentes: reservasActivas[0].total
      });
    } else {
      // Si no hay reservas, eliminar completamente
      await db.execute("DELETE FROM horarios WHERE id = ?", [id]);
      
      res.json({
        message: 'Horario eliminado exitosamente',
        horario_id: id
      });
    }
  } catch (err) {
    console.error('Error eliminando horario:', err);
    res.status(500).json({ error: "Error en el servidor eliminando horario" });
  }
});

// GET /api/horarios/disponibles/:fecha - Obtener horarios disponibles para una fecha específica
router.get('/disponibles/:fecha', async (req, res) => {
  const { fecha } = req.params;
  
  try {
    const fechaObj = new Date(fecha);
    const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const diaSemana = diasSemana[fechaObj.getDay()];
    
    // Obtener horarios del día con disponibilidad
    const [horariosDisponibles] = await db.execute(`
      SELECT h.*, 
             COALESCE(ocupados.total, 0) as ocupados,
             (6 - COALESCE(ocupados.total, 0)) as lugares_disponibles
      FROM horarios h
      LEFT JOIN (
        SELECT horario, COUNT(*) as total
        FROM reservas r
        JOIN clases c ON r.clase_id = c.id
        WHERE r.fecha = ? AND r.estado = 'confirmada' AND c.tipo != 'salto'
        GROUP BY horario
      ) ocupados ON TIME_FORMAT(h.hora, '%H:%i') = ocupados.horario
      WHERE h.dia_semana = ? AND h.disponible = 1
      HAVING lugares_disponibles > 0
      ORDER BY h.hora
    `, [fecha, diaSemana]);
    
    res.json(horariosDisponibles);
  } catch (err) {
    console.error('Error obteniendo horarios disponibles:', err);
    res.status(500).json({ error: "Error en el servidor obteniendo horarios disponibles" });
  }
});

// GET /api/horarios/estadisticas - Obtener estadísticas de horarios
router.get('/estadisticas', async (req, res) => {
  try {
    // Estadísticas generales
    const [totalHorarios] = await db.execute(
      "SELECT COUNT(*) as total FROM horarios WHERE disponible = 1"
    );
    
    const [horariosPorTurno] = await db.execute(`
      SELECT turno, COUNT(*) as cantidad 
      FROM horarios 
      WHERE disponible = 1 
      GROUP BY turno
    `);
    
    const [horariosPorDia] = await db.execute(`
      SELECT dia_semana, COUNT(*) as cantidad 
      FROM horarios 
      WHERE disponible = 1 
      GROUP BY dia_semana 
      ORDER BY FIELD(dia_semana, 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo')
    `);
    
    res.json({
      total_horarios: totalHorarios[0].total,
      por_turno: horariosPorTurno,
      por_dia: horariosPorDia
    });
  } catch (err) {
    console.error('Error obteniendo estadísticas de horarios:', err);
    res.status(500).json({ error: "Error en el servidor obteniendo estadísticas" });
  }
});

// GET /api/horarios/ocupacion/:fecha - Obtener ocupación de horarios para una fecha
router.get('/ocupacion/:fecha', async (req, res) => {
  const { fecha } = req.params;
  
  try {
    const fechaObj = new Date(fecha);
    const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const diaSemana = diasSemana[fechaObj.getDay()];
    
    const [ocupacion] = await db.execute(`
      SELECT 
        h.id,
        h.hora,
        h.turno,
        h.dia_semana,
        COALESCE(reservas.total, 0) as ocupadas,
        6 as capacidad_maxima,
        (6 - COALESCE(reservas.total, 0)) as disponibles,
        ROUND((COALESCE(reservas.total, 0) / 6) * 100, 2) as porcentaje_ocupacion
      FROM horarios h
      LEFT JOIN (
        SELECT horario, COUNT(*) as total
        FROM reservas r
        JOIN clases c ON r.clase_id = c.id
        WHERE r.fecha = ? AND r.estado = 'confirmada' AND c.tipo != 'salto'
        GROUP BY horario
      ) reservas ON TIME_FORMAT(h.hora, '%H:%i') = reservas.horario
      WHERE h.dia_semana = ? AND h.disponible = 1
      ORDER BY h.hora
    `, [fecha, diaSemana]);
    
    res.json({
      fecha,
      dia_semana: diaSemana,
      horarios: ocupacion
    });
  } catch (err) {
    console.error('Error obteniendo ocupación de horarios:', err);
    res.status(500).json({ error: "Error en el servidor obteniendo ocupación" });
  }
});

export default router;