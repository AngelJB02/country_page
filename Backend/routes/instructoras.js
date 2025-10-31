import express from 'express';
import db from '../server/db.js';

const router = express.Router();

// Obtener todas las instructoras
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        i.id,
        i.usuario_id,
        i.nombre,
        i.apellido,
        i.num_contacto,
        i.especialidad,
        i.disponibilidad,
        i.fecha_registro,
        u.correo,
        u.estatus
      FROM instructoras i
      LEFT JOIN usuarios u ON i.usuario_id = u.id
      ORDER BY i.nombre, i.apellido
    `);
    
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener instructoras:', err);
    res.status(500).json({ error: 'Error al obtener instructoras' });
  }
});

// Obtener una instructora por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const [rows] = await db.query(`
      SELECT 
        i.id,
        i.usuario_id,
        i.nombre,
        i.apellido,
        i.num_contacto,
        i.especialidad,
        i.disponibilidad,
        i.fecha_registro,
        u.correo,
        u.estatus
      FROM instructoras i
      LEFT JOIN usuarios u ON i.usuario_id = u.id
      WHERE i.id = ?
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Instructora no encontrada' });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error('Error al obtener instructora:', err);
    res.status(500).json({ error: 'Error al obtener instructora' });
  }
});

// Crear nueva instructora
// Este endpoint crea tanto el usuario como el registro en instructoras
router.post('/', async (req, res) => {
  const { 
    nombre, 
    apellido, 
    correo, 
    telefono, 
    especialidad, 
    disponibilidad,
    customPassword 
  } = req.body;
  
  // Validar campos requeridos
  if (!nombre || !apellido || !especialidad) {
    return res.status(400).json({ 
      error: 'Faltan datos requeridos: nombre, apellido y especialidad son obligatorios' 
    });
  }
  
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // 1. Generar username dinámico
    let baseUsername = `${nombre.toLowerCase()}.${apellido.toLowerCase()}`.replace(/\s+/g, '').slice(0, 20);
    let username = baseUsername;
    let counter = 1;
    
    while (true) {
      const [existingUser] = await connection.query(
        'SELECT id FROM usuarios WHERE username = ?', 
        [username]
      );
      if (existingUser.length === 0) break;
      username = `${baseUsername}${counter}`.slice(0, 20);
      counter++;
    }
    
    // 2. Generar contraseña
    const password = customPassword || Math.random().toString(36).slice(-8);
    
    // 3. Crear usuario con rol 'instructora'
    const [userResult] = await connection.query(
      `INSERT INTO usuarios (nombre, apellido, correo, telefono, username, contrasena, rol, estatus, fecha_registro) 
       VALUES (?, ?, ?, ?, ?, ?, 'instructora', 'activo', NOW())`,
      [nombre, apellido, correo, telefono, username, password]
    );
    
    const usuarioId = userResult.insertId;
    
    // 4. Crear registro en tabla instructoras
    const [instructorResult] = await connection.query(
      `INSERT INTO instructoras (usuario_id, nombre, apellido, num_contacto, especialidad, disponibilidad, fecha_registro) 
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [usuarioId, nombre, apellido, telefono, especialidad, disponibilidad || 'disponible']
    );
    
    await connection.commit();
    
    res.json({
      message: 'Instructora creada correctamente',
      instructora: {
        id: instructorResult.insertId,
        usuario_id: usuarioId,
        nombre,
        apellido,
        num_contacto: telefono,
        correo,
        especialidad,
        disponibilidad: disponibilidad || 'disponible',
        username,
        password
      }
    });
    
  } catch (err) {
    await connection.rollback();
    console.error('Error al crear instructora:', err);
    
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }
    
    res.status(500).json({ error: 'Error al crear instructora' });
  } finally {
    connection.release();
  }
});

// Actualizar instructora completa
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, num_contacto, correo, especialidad, disponibilidad } = req.body;
  
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Obtener usuario_id
    const [instructorRows] = await connection.query(
      'SELECT usuario_id FROM instructoras WHERE id = ?',
      [id]
    );
    
    if (instructorRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Instructora no encontrada' });
    }
    
    const usuarioId = instructorRows[0].usuario_id;
    
    // Actualizar tabla instructoras
    const updateFieldsInstructor = [];
    const updateValuesInstructor = [];
    
    if (nombre !== undefined) {
      updateFieldsInstructor.push('nombre = ?');
      updateValuesInstructor.push(nombre);
    }
    
    if (apellido !== undefined) {
      updateFieldsInstructor.push('apellido = ?');
      updateValuesInstructor.push(apellido);
    }
    
    if (num_contacto !== undefined) {
      updateFieldsInstructor.push('num_contacto = ?');
      updateValuesInstructor.push(num_contacto);
    }
    
    if (especialidad !== undefined) {
      updateFieldsInstructor.push('especialidad = ?');
      updateValuesInstructor.push(especialidad);
    }
    
    if (disponibilidad !== undefined) {
      updateFieldsInstructor.push('disponibilidad = ?');
      updateValuesInstructor.push(disponibilidad);
    }
    
    if (updateFieldsInstructor.length > 0) {
      updateValuesInstructor.push(id);
      await connection.query(
        `UPDATE instructoras SET ${updateFieldsInstructor.join(', ')} WHERE id = ?`,
        updateValuesInstructor
      );
    }
    
    // Actualizar tabla usuarios
    const updateFieldsUsuario = [];
    const updateValuesUsuario = [];
    
    if (nombre !== undefined) {
      updateFieldsUsuario.push('nombre = ?');
      updateValuesUsuario.push(nombre);
    }
    
    if (apellido !== undefined) {
      updateFieldsUsuario.push('apellido = ?');
      updateValuesUsuario.push(apellido);
    }
    
    if (correo !== undefined) {
      updateFieldsUsuario.push('correo = ?');
      updateValuesUsuario.push(correo);
    }
    
    if (num_contacto !== undefined) {
      updateFieldsUsuario.push('telefono = ?');
      updateValuesUsuario.push(num_contacto);
    }
    
    if (updateFieldsUsuario.length > 0) {
      updateValuesUsuario.push(usuarioId);
      await connection.query(
        `UPDATE usuarios SET ${updateFieldsUsuario.join(', ')} WHERE id = ?`,
        updateValuesUsuario
      );
    }
    
    await connection.commit();
    
    res.json({ 
      message: 'Instructora actualizada correctamente',
      id: parseInt(id)
    });
    
  } catch (err) {
    await connection.rollback();
    console.error('Error al actualizar instructora:', err);
    
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'El correo ya está en uso' });
    }
    
    res.status(500).json({ error: 'Error al actualizar instructora' });
  } finally {
    connection.release();
  }
});

// Actualizar solo disponibilidad
router.patch('/:id/disponibilidad', async (req, res) => {
  const { id } = req.params;
  const { disponibilidad } = req.body;
  
  if (!disponibilidad) {
    return res.status(400).json({ error: 'El campo disponibilidad es requerido' });
  }
  
  const disponibilidadesValidas = ['disponible', 'no_disponible'];
  if (!disponibilidadesValidas.includes(disponibilidad.toLowerCase())) {
    return res.status(400).json({ 
      error: `Disponibilidad no válida. Valores permitidos: ${disponibilidadesValidas.join(', ')}` 
    });
  }
  
  try {
    const [result] = await db.query(
      'UPDATE instructoras SET disponibilidad = ? WHERE id = ?',
      [disponibilidad.toLowerCase(), id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Instructora no encontrada' });
    }
    
    res.json({ 
      message: 'Disponibilidad actualizada correctamente',
      disponibilidad: disponibilidad.toLowerCase()
    });
  } catch (err) {
    console.error('Error al actualizar disponibilidad:', err);
    res.status(500).json({ error: 'Error al actualizar disponibilidad' });
  }
});

// Eliminar instructora (soft delete - cambiar estatus a inactivo)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Verificar si tiene reservas activas
    const [activeReservations] = await connection.query(
      `SELECT COUNT(*) as count 
       FROM reservas 
       WHERE instructora_id = ? AND estatus IN ('confirmada', 'pendiente')`,
      [id]
    );
    
    if (activeReservations[0].count > 0) {
      await connection.rollback();
      return res.status(400).json({ 
        error: `No se puede eliminar la instructora porque tiene ${activeReservations[0].count} reserva(s) activa(s)` 
      });
    }
    
    // Obtener usuario_id
    const [instructorRows] = await connection.query(
      'SELECT usuario_id FROM instructoras WHERE id = ?',
      [id]
    );
    
    if (instructorRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Instructora no encontrada' });
    }
    
    const usuarioId = instructorRows[0].usuario_id;
    
    // Cambiar disponibilidad a no_disponible
    await connection.query(
      'UPDATE instructoras SET disponibilidad = ? WHERE id = ?',
      ['no_disponible', id]
    );
    
    // Cambiar estatus del usuario a inactivo
    await connection.query(
      'UPDATE usuarios SET estatus = ? WHERE id = ?',
      ['inactivo', usuarioId]
    );
    
    await connection.commit();
    
    res.json({ 
      message: 'Instructora marcada como inactiva correctamente',
      id: parseInt(id)
    });
    
  } catch (err) {
    await connection.rollback();
    console.error('Error al eliminar instructora:', err);
    res.status(500).json({ error: 'Error al eliminar instructora' });
  } finally {
    connection.release();
  }
});

export default router;
