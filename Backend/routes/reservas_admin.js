import express from 'express';
import db from '../server/db.js';

const router = express.Router();

// Obtener todas las reservas con información completa
router.get('/', async (req, res) => {
  try {
    const { fecha, fecha_inicio, fecha_fin, estatus, tipo } = req.query;
    
    let query = `
      SELECT 
        r.id,
        r.fecha,
        r.hora_inicio,
        r.hora_fin,
        r.estatus,
        r.tipo,
        r.observaciones,
        r.created_at,
        c.id as cliente_id,
        c.nombre as cliente_nombre,
        c.apellido as cliente_apellido,
        cab.id as caballo_id,
        cab.nombre as caballo_nombre,
        i.id as instructora_id,
        i.nombre as instructora_nombre,
        i.apellido as instructora_apellido,
        cl.id as clase_id,
        cl.nombre as clase_nombre
      FROM reservas r
      LEFT JOIN usuarios c ON r.cliente_id = c.id
      LEFT JOIN caballos cab ON r.caballo_id = cab.id
      LEFT JOIN instructoras i ON r.instructora_id = i.id
      LEFT JOIN clases cl ON r.clase_id = cl.id
    `;
    
    const conditions = [];
    const params = [];
    
    // Filtro por fecha específica
    if (fecha) {
      conditions.push('r.fecha = ?');
      params.push(fecha);
    }
    
    // Filtro por rango de fechas
    if (fecha_inicio && fecha_fin) {
      conditions.push('r.fecha BETWEEN ? AND ?');
      params.push(fecha_inicio, fecha_fin);
    }
    
    // Filtro por estatus
    if (estatus) {
      conditions.push('r.estatus = ?');
      params.push(estatus);
    }
    
    // Filtro por tipo
    if (tipo) {
      conditions.push('r.tipo = ?');
      params.push(tipo);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY r.fecha DESC, r.hora_inicio DESC';
    
    const [rows] = await db.query(query, params);
    
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener reservas:', err);
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
});

// Obtener una reserva específica por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const [rows] = await db.query(`
      SELECT 
        r.id,
        r.fecha,
        r.hora_inicio,
        r.hora_fin,
        r.estatus,
        r.tipo,
        r.observaciones,
        r.created_at,
        c.id as cliente_id,
        c.nombre as cliente_nombre,
        c.apellido as cliente_apellido,
        c.correo as cliente_correo,
        cab.id as caballo_id,
        cab.nombre as caballo_nombre,
        i.id as instructora_id,
        i.nombre as instructora_nombre,
        i.apellido as instructora_apellido,
        cl.id as clase_id,
        cl.nombre as clase_nombre
      FROM reservas r
      LEFT JOIN usuarios c ON r.cliente_id = c.id
      LEFT JOIN caballos cab ON r.caballo_id = cab.id
      LEFT JOIN instructoras i ON r.instructora_id = i.id
      LEFT JOIN clases cl ON r.clase_id = cl.id
      WHERE r.id = ?
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error('Error al obtener reserva:', err);
    res.status(500).json({ error: 'Error al obtener reserva' });
  }
});

// Actualizar estatus de una reserva
router.patch('/:id/estatus', async (req, res) => {
  const { id } = req.params;
  const { estatus } = req.body;
  
  if (!estatus) {
    return res.status(400).json({ error: 'El campo estatus es requerido' });
  }
  
  const estatusValidos = ['pendiente', 'confirmada', 'cancelada', 'completada'];
  if (!estatusValidos.includes(estatus.toLowerCase())) {
    return res.status(400).json({ 
      error: `Estatus no válido. Valores permitidos: ${estatusValidos.join(', ')}` 
    });
  }
  
  try {
    const [result] = await db.query(
      'UPDATE reservas SET estatus = ? WHERE id = ?',
      [estatus.toLowerCase(), id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }
    
    res.json({ 
      message: 'Estatus actualizado correctamente',
      estatus: estatus.toLowerCase()
    });
  } catch (err) {
    console.error('Error al actualizar estatus:', err);
    res.status(500).json({ error: 'Error al actualizar estatus' });
  }
});

// Actualizar reserva completa
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { 
    cliente_id, 
    caballo_id, 
    instructora_id, 
    clase_id, 
    fecha, 
    hora_inicio, 
    hora_fin, 
    estatus, 
    tipo, 
    observaciones 
  } = req.body;
  
  try {
    // Verificar que la reserva existe
    const [existing] = await db.query('SELECT id FROM reservas WHERE id = ?', [id]);
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }
    
    // Construir consulta de actualización dinámica
    const updateFields = [];
    const updateValues = [];
    
    if (cliente_id !== undefined) {
      updateFields.push('cliente_id = ?');
      updateValues.push(cliente_id);
    }
    
    if (caballo_id !== undefined) {
      updateFields.push('caballo_id = ?');
      updateValues.push(caballo_id);
    }
    
    if (instructora_id !== undefined) {
      updateFields.push('instructora_id = ?');
      updateValues.push(instructora_id);
    }
    
    if (clase_id !== undefined) {
      updateFields.push('clase_id = ?');
      updateValues.push(clase_id);
    }
    
    if (fecha !== undefined) {
      updateFields.push('fecha = ?');
      updateValues.push(fecha);
    }
    
    if (hora_inicio !== undefined) {
      updateFields.push('hora_inicio = ?');
      updateValues.push(hora_inicio);
    }
    
    if (hora_fin !== undefined) {
      updateFields.push('hora_fin = ?');
      updateValues.push(hora_fin);
    }
    
    if (estatus !== undefined) {
      updateFields.push('estatus = ?');
      updateValues.push(estatus);
    }
    
    if (tipo !== undefined) {
      updateFields.push('tipo = ?');
      updateValues.push(tipo);
    }
    
    if (observaciones !== undefined) {
      updateFields.push('observaciones = ?');
      updateValues.push(observaciones);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }
    
    updateValues.push(id);
    
    const [result] = await db.query(
      `UPDATE reservas SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
    
    res.json({ 
      message: 'Reserva actualizada correctamente',
      id: parseInt(id),
      updatedFields: updateFields.length
    });
    
  } catch (err) {
    console.error('Error al actualizar reserva:', err);
    res.status(500).json({ error: 'Error al actualizar reserva' });
  }
});

// Eliminar reserva
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const [result] = await db.query('DELETE FROM reservas WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }
    
    res.json({ 
      message: 'Reserva eliminada correctamente',
      id: parseInt(id)
    });
  } catch (err) {
    console.error('Error al eliminar reserva:', err);
    res.status(500).json({ error: 'Error al eliminar reserva' });
  }
});

// Obtener estadísticas de reservas
router.get('/stats/summary', async (req, res) => {
  const { fecha_inicio, fecha_fin } = req.query;
  
  try {
    let whereClause = '';
    const params = [];
    
    if (fecha_inicio && fecha_fin) {
      whereClause = 'WHERE fecha BETWEEN ? AND ?';
      params.push(fecha_inicio, fecha_fin);
    }
    
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_reservas,
        SUM(CASE WHEN estatus = 'confirmada' THEN 1 ELSE 0 END) as confirmadas,
        SUM(CASE WHEN estatus = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
        SUM(CASE WHEN estatus = 'cancelada' THEN 1 ELSE 0 END) as canceladas,
        SUM(CASE WHEN estatus = 'completada' THEN 1 ELSE 0 END) as completadas,
        SUM(CASE WHEN tipo = 'normal' THEN 1 ELSE 0 END) as normales,
        SUM(CASE WHEN tipo = 'propietario' THEN 1 ELSE 0 END) as propietarios,
        SUM(CASE WHEN tipo = 'renta' THEN 1 ELSE 0 END) as rentas,
        SUM(CASE WHEN tipo = 'media_renta' THEN 1 ELSE 0 END) as media_rentas
      FROM reservas
      ${whereClause}
    `, params);
    
    res.json(stats[0]);
  } catch (err) {
    console.error('Error al obtener estadísticas:', err);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

export default router;
