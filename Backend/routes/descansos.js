import express from 'express';
import db from '../server/db.js';

const router = express.Router();

// Función para formatear fechas para MySQL
const formatDateForMySQL = (dateString) => {
  if (!dateString) return null;
  
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error('Formato de fecha inválido');
  }
  
  return date.toISOString().split('T')[0];
};

// =============================================================================
// OBTENER DESCANSOS
// =============================================================================

// Obtener todos los descansos (admin)
router.get('/', async (req, res) => {
  try {
    const { instructora_id, fecha_inicio, fecha_fin, tipo } = req.query;
    
    let whereClause = '1=1';
    let params = [];
    
    if (instructora_id) {
      whereClause += ' AND d.instructora_id = ?';
      params.push(instructora_id);
    }
    
    if (fecha_inicio) {
      whereClause += ' AND d.fecha_fin >= ?';
      params.push(formatDateForMySQL(fecha_inicio));
    }
    
    if (fecha_fin) {
      whereClause += ' AND d.fecha_inicio <= ?';
      params.push(formatDateForMySQL(fecha_fin));
    }
    
    if (tipo) {
      whereClause += ' AND d.tipo = ?';
      params.push(tipo);
    }

    const [rows] = await db.query(`
      SELECT 
        d.id,
        d.instructora_id,
        d.fecha_inicio,
        d.fecha_fin,
        d.motivo,
        d.tipo,
        d.aprobado_por,
        d.fecha_creacion,
        i.nombre as instructora_nombre,
        i.apellido as instructora_apellido,
        u.nombre as aprobado_por_nombre,
        u.apellido as aprobado_por_apellido
      FROM descansos d
      JOIN instructoras inst ON d.instructora_id = inst.id
      LEFT JOIN usuarios i ON inst.usuario_id = i.id
      LEFT JOIN usuarios u ON d.aprobado_por = u.id
      WHERE ${whereClause}
      ORDER BY d.fecha_inicio DESC
    `, params);
    
    res.json(rows);
  } catch (err) {
    console.error('Error obteniendo descansos:', err);
    res.status(500).json({ error: 'Error al obtener descansos' });
  }
});

// Obtener descansos de una instructora específica
router.get('/instructora/:instructoraId', async (req, res) => {
  const { instructoraId } = req.params;
  
  try {
    const [rows] = await db.query(`
      SELECT 
        d.id,
        d.fecha_inicio,
        d.fecha_fin,
        d.motivo,
        d.tipo,
        d.aprobado_por,
        d.fecha_creacion,
        u.nombre as aprobado_por_nombre,
        u.apellido as aprobado_por_apellido
      FROM descansos d
      LEFT JOIN usuarios u ON d.aprobado_por = u.id
      WHERE d.instructora_id = ?
      ORDER BY d.fecha_inicio DESC
    `, [instructoraId]);
    
    res.json(rows);
  } catch (err) {
    console.error('Error obteniendo descansos de instructora:', err);
    res.status(500).json({ error: 'Error al obtener descansos de la instructora' });
  }
});

// Verificar si una instructora está en descanso en una fecha específica
router.get('/check/:instructoraId', async (req, res) => {
  const { instructoraId } = req.params;
  const { fecha } = req.query;
  
  if (!fecha) {
    return res.status(400).json({ error: 'Parámetro requerido: fecha' });
  }
  
  try {
    const [rows] = await db.query(`
      SELECT 
        d.id,
        d.fecha_inicio,
        d.fecha_fin,
        d.motivo,
        d.tipo
      FROM descansos d
      WHERE d.instructora_id = ?
      AND ? BETWEEN d.fecha_inicio AND d.fecha_fin
    `, [instructoraId, formatDateForMySQL(fecha)]);
    
    if (rows.length > 0) {
      res.json({
        en_descanso: true,
        descanso: rows[0]
      });
    } else {
      res.json({
        en_descanso: false
      });
    }
  } catch (err) {
    console.error('Error verificando descanso:', err);
    res.status(500).json({ error: 'Error al verificar descanso' });
  }
});

// =============================================================================
// CREAR DESCANSO
// =============================================================================

// Crear nuevo descanso (admin o instructora)
router.post('/', async (req, res) => {
  const { 
    instructora_id, 
    fecha_inicio, 
    fecha_fin, 
    motivo, 
    tipo,
    aprobado_por 
  } = req.body;
  
  // Validaciones
  if (!instructora_id || !fecha_inicio || !fecha_fin || !motivo) {
    return res.status(400).json({ 
      error: 'Faltan campos requeridos: instructora_id, fecha_inicio, fecha_fin, motivo' 
    });
  }
  
  const tiposValidos = ['personal', 'enfermedad', 'vacaciones', 'otro'];
  if (tipo && !tiposValidos.includes(tipo)) {
    return res.status(400).json({ 
      error: `Tipo inválido. Valores permitidos: ${tiposValidos.join(', ')}` 
    });
  }
  
  try {
    // Validar que fecha_fin no sea anterior a fecha_inicio
    const inicio = new Date(fecha_inicio);
    const fin = new Date(fecha_fin);
    
    if (fin < inicio) {
      return res.status(400).json({ 
        error: 'La fecha de fin no puede ser anterior a la fecha de inicio' 
      });
    }
    
    // Verificar que la instructora existe
    const [instructora] = await db.query(
      'SELECT id FROM instructoras WHERE id = ?',
      [instructora_id]
    );
    
    if (instructora.length === 0) {
      return res.status(404).json({ error: 'Instructora no encontrada' });
    }
    
    // Verificar si hay conflictos con otros descansos
    const [conflictos] = await db.query(`
      SELECT id, fecha_inicio, fecha_fin FROM descansos
      WHERE instructora_id = ?
      AND (
        (fecha_inicio <= ? AND fecha_fin >= ?) OR
        (fecha_inicio <= ? AND fecha_fin >= ?) OR
        (fecha_inicio >= ? AND fecha_fin <= ?)
      )
    `, [
      instructora_id,
      fecha_inicio, fecha_inicio,
      fecha_fin, fecha_fin,
      fecha_inicio, fecha_fin
    ]);
    
    if (conflictos.length > 0) {
      return res.status(400).json({ 
        error: 'Ya existe un descanso registrado en estas fechas',
        conflicto: conflictos[0]
      });
    }
    
    // Crear el descanso
    const [result] = await db.query(`
      INSERT INTO descansos (
        instructora_id, 
        fecha_inicio, 
        fecha_fin, 
        motivo, 
        tipo,
        aprobado_por
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      instructora_id,
      formatDateForMySQL(fecha_inicio),
      formatDateForMySQL(fecha_fin),
      motivo,
      tipo || 'otro',
      aprobado_por || null
    ]);
    
    res.json({
      message: 'Descanso registrado correctamente',
      id: result.insertId
    });
  } catch (err) {
    console.error('Error creando descanso:', err);
    res.status(500).json({ error: 'Error al crear descanso' });
  }
});

// =============================================================================
// ACTUALIZAR DESCANSO
// =============================================================================

// Actualizar descanso existente
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { fecha_inicio, fecha_fin, motivo, tipo, aprobado_por } = req.body;
  
  try {
    // Verificar que el descanso existe
    const [descanso] = await db.query(
      'SELECT instructora_id FROM descansos WHERE id = ?',
      [id]
    );
    
    if (descanso.length === 0) {
      return res.status(404).json({ error: 'Descanso no encontrado' });
    }
    
    const instructora_id = descanso[0].instructora_id;
    
    // Construir la consulta de actualización dinámicamente
    const updateFields = [];
    const updateValues = [];
    
    if (fecha_inicio !== undefined) {
      updateFields.push('fecha_inicio = ?');
      updateValues.push(formatDateForMySQL(fecha_inicio));
    }
    
    if (fecha_fin !== undefined) {
      updateFields.push('fecha_fin = ?');
      updateValues.push(formatDateForMySQL(fecha_fin));
    }
    
    if (motivo !== undefined) {
      updateFields.push('motivo = ?');
      updateValues.push(motivo);
    }
    
    if (tipo !== undefined) {
      const tiposValidos = ['personal', 'enfermedad', 'vacaciones', 'otro'];
      if (!tiposValidos.includes(tipo)) {
        return res.status(400).json({ 
          error: `Tipo inválido. Valores permitidos: ${tiposValidos.join(', ')}` 
        });
      }
      updateFields.push('tipo = ?');
      updateValues.push(tipo);
    }
    
    if (aprobado_por !== undefined) {
      updateFields.push('aprobado_por = ?');
      updateValues.push(aprobado_por);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }
    
    // Validar que fecha_fin no sea anterior a fecha_inicio si se actualizan las fechas
    if (fecha_inicio !== undefined || fecha_fin !== undefined) {
      const [currentDescanso] = await db.query(
        'SELECT fecha_inicio, fecha_fin FROM descansos WHERE id = ?',
        [id]
      );
      
      const newInicio = fecha_inicio ? new Date(fecha_inicio) : new Date(currentDescanso[0].fecha_inicio);
      const newFin = fecha_fin ? new Date(fecha_fin) : new Date(currentDescanso[0].fecha_fin);
      
      if (newFin < newInicio) {
        return res.status(400).json({ 
          error: 'La fecha de fin no puede ser anterior a la fecha de inicio' 
        });
      }
      
      // Verificar conflictos con otros descansos (excluyendo el actual)
      const [conflictos] = await db.query(`
        SELECT id, fecha_inicio, fecha_fin FROM descansos
        WHERE instructora_id = ? 
        AND id != ?
        AND (
          (fecha_inicio <= ? AND fecha_fin >= ?) OR
          (fecha_inicio <= ? AND fecha_fin >= ?) OR
          (fecha_inicio >= ? AND fecha_fin <= ?)
        )
      `, [
        instructora_id,
        id,
        newInicio.toISOString().split('T')[0], newInicio.toISOString().split('T')[0],
        newFin.toISOString().split('T')[0], newFin.toISOString().split('T')[0],
        newInicio.toISOString().split('T')[0], newFin.toISOString().split('T')[0]
      ]);
      
      if (conflictos.length > 0) {
        return res.status(400).json({ 
          error: 'Las nuevas fechas tienen conflicto con otro descanso existente',
          conflicto: conflictos[0]
        });
      }
    }
    
    // Actualizar el descanso
    updateValues.push(id);
    await db.query(
      `UPDATE descansos SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
    
    res.json({ 
      message: 'Descanso actualizado correctamente',
      id: parseInt(id)
    });
  } catch (err) {
    console.error('Error actualizando descanso:', err);
    res.status(500).json({ error: 'Error al actualizar descanso' });
  }
});

// =============================================================================
// ELIMINAR DESCANSO
// =============================================================================

// Eliminar descanso
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const [result] = await db.query(
      'DELETE FROM descansos WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Descanso no encontrado' });
    }
    
    res.json({ 
      message: 'Descanso eliminado correctamente',
      id: parseInt(id)
    });
  } catch (err) {
    console.error('Error eliminando descanso:', err);
    res.status(500).json({ error: 'Error al eliminar descanso' });
  }
});

// =============================================================================
// REPORTES Y ESTADÍSTICAS
// =============================================================================

// Obtener descansos próximos (siguientes 30 días)
router.get('/upcoming', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        d.id,
        d.instructora_id,
        d.fecha_inicio,
        d.fecha_fin,
        d.motivo,
        d.tipo,
        i.nombre as instructora_nombre,
        i.apellido as instructora_apellido
      FROM descansos d
      JOIN instructoras inst ON d.instructora_id = inst.id
      LEFT JOIN usuarios i ON inst.usuario_id = i.id
      WHERE d.fecha_inicio BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
      ORDER BY d.fecha_inicio ASC
    `);
    
    res.json(rows);
  } catch (err) {
    console.error('Error obteniendo descansos próximos:', err);
    res.status(500).json({ error: 'Error al obtener descansos próximos' });
  }
});

// Obtener estadísticas de descansos
router.get('/stats', async (req, res) => {
  try {
    // Total de descansos activos (en curso)
    const [descansosActivos] = await db.query(`
      SELECT COUNT(*) as total FROM descansos
      WHERE CURDATE() BETWEEN fecha_inicio AND fecha_fin
    `);
    
    // Descansos por tipo
    const [descansosPorTipo] = await db.query(`
      SELECT tipo, COUNT(*) as total FROM descansos
      WHERE fecha_fin >= CURDATE()
      GROUP BY tipo
    `);
    
    // Instructoras actualmente en descanso
    const [instructorasEnDescanso] = await db.query(`
      SELECT 
        i.nombre,
        i.apellido,
        d.fecha_inicio,
        d.fecha_fin,
        d.tipo
      FROM descansos d
      JOIN instructoras inst ON d.instructora_id = inst.id
      LEFT JOIN usuarios i ON inst.usuario_id = i.id
      WHERE CURDATE() BETWEEN d.fecha_inicio AND d.fecha_fin
    `);
    
    res.json({
      descansos_activos: descansosActivos[0].total,
      descansos_por_tipo: descansosPorTipo,
      instructoras_en_descanso: instructorasEnDescanso
    });
  } catch (err) {
    console.error('Error obteniendo estadísticas de descansos:', err);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

export default router;
