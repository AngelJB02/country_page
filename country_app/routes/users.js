import express from 'express';
import db from '../server/db.js';

const router = express.Router();

// Función helper para formatear fechas para MySQL
const formatDateForMySQL = (dateString) => {
  if (!dateString) return null;
  
  // Si ya está en formato YYYY-MM-DD, devolverlo tal como está
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  
  // Convertir ISO string o Date object a formato YYYY-MM-DD
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error('Formato de fecha inválido');
  }
  
  return date.toISOString().split('T')[0];
};

// Función helper para formatear fechas para mostrar
const formatDateForDisplay = (dateString) => {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;
  
  return date.toISOString().split('T')[0];
};

// Obtener todos los usuarios
router.get('/all', async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM usuarios");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Registrar usuario
router.post('/register', async (req, res) => {
  const { nombre, apellido, email, password, rol } = req.body;
  if (!nombre || !apellido || !email || !password)
    return res.status(400).json({ error: 'Faltan datos' });

  try {
    const [result] = await db.query(
      "INSERT INTO usuarios(nombre, apellido, email, password, rol, estado, fecha_registro) VALUES(?,?,?,?,?,'activo',NOW())",
      [nombre, apellido, email, password, rol]
    );
    res.json({ message: 'Usuario registrado correctamente', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Registrar cliente con información de pagos
router.post('/register-cliente', async (req, res) => {
  const { nombre, apellido, email, password, monto, fecha_pago, proxima_fecha } = req.body;
  
  // Validar campos requeridos del usuario
  if (!nombre || !apellido || !email || !password) {
    return res.status(400).json({ error: 'Faltan datos del usuario: nombre, apellido, email, password son requeridos' });
  }
  
  // Validar campos requeridos de pago
  if (!monto || !fecha_pago || !proxima_fecha) {
    return res.status(400).json({ error: 'Faltan datos de pago: monto, fecha_pago, proxima_fecha son requeridos' });
  }

  // Iniciar transacción para asegurar consistencia
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // 1. Crear el usuario con rol 'cliente'
    const [userResult] = await connection.query(
      "INSERT INTO usuarios(nombre, apellido, email, password, rol, estado, fecha_registro) VALUES(?,?,?,?,'cliente','activo',NOW())",
      [nombre, apellido, email, password]
    );
    
    const userId = userResult.insertId;
    
    // 2. Formatear fechas para MySQL
    const fechaPagoFormatted = formatDateForMySQL(fecha_pago);
    const proximaFechaFormatted = formatDateForMySQL(proxima_fecha);
    
    // 3. Crear el registro de pago
    await connection.query(
      'INSERT INTO pagos (id_usuario, monto, fecha_pago, proxima_fecha) VALUES (?, ?, ?, ?)',
      [userId, monto, fechaPagoFormatted, proximaFechaFormatted]
    );
    
    // 4. Confirmar transacción
    await connection.commit();
    
    res.json({ 
      message: 'Cliente registrado correctamente con información de pagos', 
      id: userId,
      usuario: {
        id: userId,
        nombre,
        apellido,
        email,
        rol: 'cliente',
        estado: 'activo'
      },
      pago: {
        monto,
        fecha_pago: fechaPagoFormatted,
        proxima_fecha: proximaFechaFormatted
      }
    });
    
  } catch (err) {
    // Rollback en caso de error
    await connection.rollback();
    console.error('Error al registrar cliente:', err);
    
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }
    
    if (err.code === 'ECONNRESET' || err.code === 'PROTOCOL_CONNECTION_LOST') {
      return res.status(503).json({ error: 'Error de conexión con la base de datos. Inténtalo de nuevo.' });
    }
    
    if (err.message.includes('Formato de fecha inválido')) {
      return res.status(400).json({ error: 'Formato de fecha inválido. Use formato YYYY-MM-DD' });
    }
    
    res.status(500).json({ error: 'Error al registrar cliente' });
  } finally {
    connection.release();
  }
});

// Editar correo del usuario
router.patch('/update-email/:id', async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'El email es requerido' });

  try {
    const [result] = await db.query(
      "UPDATE usuarios SET email=? WHERE id=?",
      [email, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ message: 'Correo actualizado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar correo' });
  }
});

// Actualizar estado del usuario
router.patch('/update-status/:id', async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  
  if (!estado) {
    return res.status(400).json({ error: 'El estado es requerido' });
  }

  // Validar que el estado sea uno de los valores permitidos
  const estadosValidos = ['activo', 'inactivo', 'bloqueado', 'pendiente'];
  if (!estadosValidos.includes(estado.toLowerCase())) {
    return res.status(400).json({ error: 'Estado no válido' });
  }

  try {
    const [result] = await db.query("UPDATE usuarios SET estado=? WHERE id=?", [estado.toLowerCase(), id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json({ message: 'Estado actualizado correctamente', estado: estado.toLowerCase() });
  } catch (err) {
    console.error('Error detallado:', err);
    
    // Manejar específicamente errores de conexión
    if (err.code === 'ECONNRESET' || err.code === 'PROTOCOL_CONNECTION_LOST') {
      return res.status(503).json({ error: 'Error de conexión con la base de datos. Inténtalo de nuevo.' });
    }
    
    res.status(500).json({ error: 'Error al actualizar estado del usuario' });
  }
});

// Obtener usuarios con información de pagos
router.get('/with-payments', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        u.id,
        u.nombre,
        u.apellido,
        u.email,
        u.rol,
        u.estado,
        u.fecha_registro,
        p.monto,
        p.fecha_pago AS ultimo_pago,
        p.proxima_fecha AS proximo_pago
      FROM usuarios u
      LEFT JOIN pagos p ON u.id = p.id_usuario
      ORDER BY u.id
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener usuarios con pagos:', err);
    
    if (err.code === 'ECONNRESET' || err.code === 'PROTOCOL_CONNECTION_LOST') {
      return res.status(503).json({ error: 'Error de conexión con la base de datos. Inténtalo de nuevo.' });
    }
    
    res.status(500).json({ error: 'Error al obtener usuarios con información de pagos' });
  }
});

// Obtener información de pagos de un usuario específico
router.get('/payments/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const [rows] = await db.query(`
      SELECT 
        p.id,
        p.monto,
        p.fecha_pago AS ultimo_pago,
        p.proxima_fecha AS proximo_pago,
        u.nombre,
        u.apellido,
        u.email
      FROM pagos p
      JOIN usuarios u ON p.id_usuario = u.id
      WHERE p.id_usuario = ?
      ORDER BY p.fecha_pago DESC
      LIMIT 1
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No se encontraron pagos para este usuario' });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error('Error al obtener pagos del usuario:', err);
    
    if (err.code === 'ECONNRESET' || err.code === 'PROTOCOL_CONNECTION_LOST') {
      return res.status(503).json({ error: 'Error de conexión con la base de datos. Inténtalo de nuevo.' });
    }
    
    res.status(500).json({ error: 'Error al obtener información de pagos del usuario' });
  }
});

// Crear o actualizar pago de usuario
router.post('/payments', async (req, res) => {
  const { id_usuario, monto, fecha_pago, proxima_fecha } = req.body;
  
  if (!id_usuario) {
    return res.status(400).json({ error: 'id_usuario es requerido' });
  }
  
  // Validar que al menos un campo de actualización esté presente
  if (!monto && !fecha_pago && !proxima_fecha) {
    return res.status(400).json({ error: 'Al menos un campo debe ser proporcionado: monto, fecha_pago, proxima_fecha' });
  }
  
  try {
    // Verificar si ya existe un pago para este usuario
    const [existing] = await db.query('SELECT * FROM pagos WHERE id_usuario = ?', [id_usuario]);
    
    if (existing.length > 0) {
      // Actualizar pago existente - solo los campos proporcionados
      const updateFields = [];
      const updateValues = [];
      
      if (monto !== undefined) {
        updateFields.push('monto = ?');
        updateValues.push(monto);
      }
      
      if (fecha_pago !== undefined) {
        const fechaPagoFormatted = formatDateForMySQL(fecha_pago);
        updateFields.push('fecha_pago = ?');
        updateValues.push(fechaPagoFormatted);
      }
      
      if (proxima_fecha !== undefined) {
        const proximaFechaFormatted = formatDateForMySQL(proxima_fecha);
        updateFields.push('proxima_fecha = ?');
        updateValues.push(proximaFechaFormatted);
      }
      
      updateValues.push(id_usuario);
      
      const updateQuery = `UPDATE pagos SET ${updateFields.join(', ')} WHERE id_usuario = ?`;
      await db.query(updateQuery, updateValues);
      
      res.json({ message: 'Información de pago actualizada correctamente', fieldsUpdated: updateFields.length });
    } else {
      // Crear nuevo pago - requiere todos los campos
      if (!monto || !fecha_pago || !proxima_fecha) {
        return res.status(400).json({ error: 'Para crear un nuevo pago se requieren todos los campos: monto, fecha_pago, proxima_fecha' });
      }
      
      const fechaPagoFormatted = formatDateForMySQL(fecha_pago);
      const proximaFechaFormatted = formatDateForMySQL(proxima_fecha);
      
      const [result] = await db.query(
        'INSERT INTO pagos (id_usuario, monto, fecha_pago, proxima_fecha) VALUES (?, ?, ?, ?)',
        [id_usuario, monto, fechaPagoFormatted, proximaFechaFormatted]
      );
      res.json({ message: 'Información de pago creada correctamente', id: result.insertId });
    }
  } catch (err) {
    console.error('Error al gestionar pago:', err);
    
    if (err.code === 'ECONNRESET' || err.code === 'PROTOCOL_CONNECTION_LOST') {
      return res.status(503).json({ error: 'Error de conexión con la base de datos. Inténtalo de nuevo.' });
    }
    
    if (err.message.includes('Formato de fecha inválido')) {
      return res.status(400).json({ error: 'Formato de fecha inválido. Use formato YYYY-MM-DD' });
    }
    
    res.status(500).json({ error: 'Error al gestionar información de pago' });
  }
});

export default router;
