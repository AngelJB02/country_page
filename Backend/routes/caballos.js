import express from 'express';
import db from '../server/db.js';

const router = express.Router();

// GET - Obtener todos los caballos
router.get('/', async (req, res) => {
  try {
    const [caballos] = await db.query(`
      SELECT 
        c.id,
        c.nombre,
        c.propietario_id,
        c.disponibilidad,
        c.estatus,
        c.especialidad,
        c.descripcion,
        CONCAT(u.nombre, ' ', u.apellido) as propietario_nombre
      FROM caballos c
      LEFT JOIN usuarios u ON c.propietario_id = u.id
      ORDER BY c.nombre ASC
    `);
    
    res.json(caballos);
  } catch (error) {
    console.error('Error al obtener caballos:', error);
    res.status(500).json({ error: 'Error al obtener la lista de caballos' });
  }
});

// GET - Obtener un caballo por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [caballos] = await db.query(`
      SELECT 
        c.id,
        c.nombre,
        c.propietario_id,
        c.disponibilidad,
        c.estatus,
        c.especialidad,
        c.descripcion,
        CONCAT(u.nombre, ' ', u.apellido) as propietario_nombre
      FROM caballos c
      LEFT JOIN usuarios u ON c.propietario_id = u.id
      WHERE c.id = ?
    `, [id]);
    
    if (caballos.length === 0) {
      return res.status(404).json({ error: 'Caballo no encontrado' });
    }
    
    res.json(caballos[0]);
  } catch (error) {
    console.error('Error al obtener caballo:', error);
    res.status(500).json({ error: 'Error al obtener el caballo' });
  }
});

// POST - Crear un nuevo caballo
router.post('/', async (req, res) => {
  try {
    console.log('🐎 Datos recibidos en el backend:', req.body);
    
    const {
      nombre,
      propietario_id,
      disponibilidad = 'disponible',
      estatus = 'publico',
      especialidad = 'mixto',
      descripcion = ''
    } = req.body;
    
    console.log('📋 Especialidad extraída:', especialidad, 'Tipo:', typeof especialidad);

    // Validaciones
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ error: 'El nombre del caballo es requerido' });
    }

    // Validar que el propietario existe si se proporciona
    if (propietario_id) {
      const [propietario] = await db.query(
        'SELECT id FROM usuarios WHERE id = ?',
        [propietario_id]
      );
      
      if (propietario.length === 0) {
        return res.status(400).json({ error: 'El propietario especificado no existe' });
      }
    }

    // Validar valores de enum
    const disponibilidadesValidas = ['disponible', 'no_disponible'];
    if (!disponibilidadesValidas.includes(disponibilidad)) {
      return res.status(400).json({ error: 'Disponibilidad inválida' });
    }

    const estatusValidos = ['publico', 'privado', 'renta', 'media_renta'];
    if (!estatusValidos.includes(estatus)) {
      return res.status(400).json({ error: 'Estatus inválido' });
    }

    const especialidadesValidas = ['iniciacion', 'paseo', 'salto'];
    
    // Validar especialidades (puede ser string o array)
    let especialidadFinal = especialidad;
    if (Array.isArray(especialidad)) {
      // Si es array, validar cada especialidad
      for (const esp of especialidad) {
        if (!especialidadesValidas.includes(esp)) {
          return res.status(400).json({ error: `Especialidad inválida: ${esp}` });
        }
      }
      // Convertir array a string separado por comas
      especialidadFinal = especialidad.join(',');
    } else {
      // Si es string, validar directamente
      if (!especialidadesValidas.includes(especialidad)) {
        return res.status(400).json({ error: 'Especialidad inválida' });
      }
    }

    console.log('🔍 Especialidad procesada:', { original: especialidad, final: especialidadFinal });

    // Insertar el nuevo caballo
    const [result] = await db.query(`
      INSERT INTO caballos (
        nombre, 
        propietario_id, 
        disponibilidad, 
        estatus, 
        especialidad, 
        descripcion
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      nombre.trim(),
      propietario_id || null,
      disponibilidad,
      estatus,
      especialidadFinal,
      descripcion.trim()
    ]);

    // Obtener el caballo recién creado
    const [nuevoCaballo] = await db.query(`
      SELECT 
        c.id,
        c.nombre,
        c.propietario_id,
        c.disponibilidad,
        c.estatus,
        c.especialidad,
        c.descripcion,
        CONCAT(u.nombre, ' ', u.apellido) as propietario_nombre
      FROM caballos c
      LEFT JOIN usuarios u ON c.propietario_id = u.id
      WHERE c.id = ?
    `, [result.insertId]);

    res.status(201).json({
      message: 'Caballo creado exitosamente',
      caballo: nuevoCaballo[0]
    });
  } catch (error) {
    console.error('Error al crear caballo:', error);
    res.status(500).json({ error: 'Error al crear el caballo' });
  }
});

// PUT - Actualizar un caballo
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      propietario_id,
      disponibilidad,
      estatus,
      especialidad,
      descripcion
    } = req.body;

    // Verificar que el caballo existe
    const [caballoExistente] = await db.query(
      'SELECT id FROM caballos WHERE id = ?',
      [id]
    );

    if (caballoExistente.length === 0) {
      return res.status(404).json({ error: 'Caballo no encontrado' });
    }

    // Validaciones
    if (nombre && nombre.trim() === '') {
      return res.status(400).json({ error: 'El nombre no puede estar vacío' });
    }

    // Validar que el propietario existe si se proporciona
    if (propietario_id) {
      const [propietario] = await db.query(
        'SELECT id FROM usuarios WHERE id = ?',
        [propietario_id]
      );
      
      if (propietario.length === 0) {
        return res.status(400).json({ error: 'El propietario especificado no existe' });
      }
    }

    // Validar valores de enum si se proporcionan
    if (disponibilidad) {
      const disponibilidadesValidas = ['disponible', 'no_disponible'];
      if (!disponibilidadesValidas.includes(disponibilidad)) {
        return res.status(400).json({ error: 'Disponibilidad inválida' });
      }
    }

    if (estatus) {
      const estatusValidos = ['publico', 'privado', 'renta', 'media_renta'];
      if (!estatusValidos.includes(estatus)) {
        return res.status(400).json({ error: 'Estatus inválido' });
      }
    }

    if (especialidad) {
      const especialidadesValidas = ['iniciacion', 'paseo', 'salto'];
      
      // Validar especialidades (puede ser string o array)
      let especialidadFinal = especialidad;
      if (Array.isArray(especialidad)) {
        // Si es array, validar cada especialidad
        for (const esp of especialidad) {
          if (!especialidadesValidas.includes(esp)) {
            return res.status(400).json({ error: `Especialidad inválida: ${esp}` });
          }
        }
        // Convertir array a string separado por comas
        especialidadFinal = especialidad.join(',');
      } else {
        // Si es string, validar directamente
        if (!especialidadesValidas.includes(especialidad)) {
          return res.status(400).json({ error: 'Especialidad inválida' });
        }
      }
    }

    // Construir la query de actualización solo con los campos proporcionados
    const updates = [];
    const values = [];

    if (nombre !== undefined) {
      updates.push('nombre = ?');
      values.push(nombre.trim());
    }
    if (propietario_id !== undefined) {
      updates.push('propietario_id = ?');
      values.push(propietario_id || null);
    }
    if (disponibilidad !== undefined) {
      updates.push('disponibilidad = ?');
      values.push(disponibilidad);
    }
    if (estatus !== undefined) {
      updates.push('estatus = ?');
      values.push(estatus);
    }
    if (especialidad !== undefined) {
      updates.push('especialidad = ?');
      
      // Procesar especialidad (array o string)
      let especialidadFinal = especialidad;
      if (Array.isArray(especialidad)) {
        especialidadFinal = especialidad.join(',');
      }
      
      values.push(especialidadFinal);
    }
    if (descripcion !== undefined) {
      updates.push('descripcion = ?');
      values.push(descripcion.trim());
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No hay datos para actualizar' });
    }

    values.push(id);

    await db.query(
      `UPDATE caballos SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Obtener el caballo actualizado
    const [caballoActualizado] = await db.query(`
      SELECT 
        c.id,
        c.nombre,
        c.propietario_id,
        c.disponibilidad,
        c.estatus,
        c.especialidad,
        c.descripcion,
        CONCAT(u.nombre, ' ', u.apellido) as propietario_nombre
      FROM caballos c
      LEFT JOIN usuarios u ON c.propietario_id = u.id
      WHERE c.id = ?
    `, [id]);

    res.json({
      message: 'Caballo actualizado exitosamente',
      caballo: caballoActualizado[0]
    });
  } catch (error) {
    console.error('Error al actualizar caballo:', error);
    res.status(500).json({ error: 'Error al actualizar el caballo' });
  }
});

// PATCH - Actualizar solo la disponibilidad de un caballo
router.patch('/:id/disponibilidad', async (req, res) => {
  try {
    const { id } = req.params;
    const { disponibilidad } = req.body;

    // Validar disponibilidad
    const disponibilidadesValidas = ['disponible', 'no_disponible'];
    if (!disponibilidadesValidas.includes(disponibilidad)) {
      return res.status(400).json({ error: 'Disponibilidad inválida' });
    }

    // Verificar que el caballo existe
    const [caballoExistente] = await db.query(
      'SELECT id FROM caballos WHERE id = ?',
      [id]
    );

    if (caballoExistente.length === 0) {
      return res.status(404).json({ error: 'Caballo no encontrado' });
    }

    // Actualizar disponibilidad
    await db.query(
      'UPDATE caballos SET disponibilidad = ? WHERE id = ?',
      [disponibilidad, id]
    );

    res.json({
      message: 'Disponibilidad actualizada exitosamente',
      id,
      disponibilidad
    });
  } catch (error) {
    console.error('Error al actualizar disponibilidad:', error);
    res.status(500).json({ error: 'Error al actualizar la disponibilidad' });
  }
});

// PATCH - Actualizar solo el estatus de un caballo
router.patch('/:id/estatus', async (req, res) => {
  try {
    const { id } = req.params;
    const { estatus } = req.body;

    // Validar estatus
    const estatusValidos = ['publico', 'privado', 'renta', 'media_renta'];
    if (!estatusValidos.includes(estatus)) {
      return res.status(400).json({ error: 'Estatus inválido' });
    }

    // Verificar que el caballo existe
    const [caballoExistente] = await db.query(
      'SELECT id FROM caballos WHERE id = ?',
      [id]
    );

    if (caballoExistente.length === 0) {
      return res.status(404).json({ error: 'Caballo no encontrado' });
    }

    // Actualizar estatus
    await db.query(
      'UPDATE caballos SET estatus = ? WHERE id = ?',
      [estatus, id]
    );

    res.json({
      message: 'Estatus actualizado exitosamente',
      id,
      estatus
    });
  } catch (error) {
    console.error('Error al actualizar estatus:', error);
    res.status(500).json({ error: 'Error al actualizar el estatus' });
  }
});

// DELETE - Eliminar un caballo
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el caballo existe
    const [caballoExistente] = await db.query(
      'SELECT id FROM caballos WHERE id = ?',
      [id]
    );

    if (caballoExistente.length === 0) {
      return res.status(404).json({ error: 'Caballo no encontrado' });
    }

    // Verificar si el caballo tiene reservas activas
    const [reservasActivas] = await db.query(`
      SELECT COUNT(*) as total 
      FROM reservas 
      WHERE caballo_id = ? 
      AND fecha >= CURDATE()
      AND estatus != 'cancelada'
    `, [id]);

    if (reservasActivas[0].total > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el caballo porque tiene reservas activas' 
      });
    }

    // Eliminar el caballo
    await db.query('DELETE FROM caballos WHERE id = ?', [id]);

    res.json({
      message: 'Caballo eliminado exitosamente',
      id
    });
  } catch (error) {
    console.error('Error al eliminar caballo:', error);
    res.status(500).json({ error: 'Error al eliminar el caballo' });
  }
});

// GET - Obtener caballos disponibles por especialidad
router.get('/disponibles/:especialidad', async (req, res) => {
  try {
    const { especialidad } = req.params;

    const [caballos] = await db.query(`
      SELECT 
        c.id,
        c.nombre,
        c.propietario_id,
        c.disponibilidad,
        c.estatus,
        c.especialidad,
        c.descripcion,
        CONCAT(u.nombre, ' ', u.apellido) as propietario_nombre
      FROM caballos c
      LEFT JOIN usuarios u ON c.propietario_id = u.id
      WHERE c.disponibilidad = 'disponible'
      AND (c.especialidad = ? OR c.especialidad = 'mixto')
      ORDER BY c.nombre ASC
    `, [especialidad]);
    
    res.json(caballos);
  } catch (error) {
    console.error('Error al obtener caballos disponibles:', error);
    res.status(500).json({ error: 'Error al obtener caballos disponibles' });
  }
});

export default router;
