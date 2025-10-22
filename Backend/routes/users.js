/*

import express from 'express';
import db from '../server/db.js';
import { generateCredentials } from './utils/credentialsGenerator.js';
import axios from 'axios';

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

// Obtener usuarios agrupados con información del último pago (para contabilidad)
router.get('/users-with-payments', async (req, res) => {
  try {
    const query = `
      SELECT 
        u.id,
        u.nombre,
        u.apellido,
        u.email,
        u.password,
        u.rol,
        u.estado,
        u.fecha_registro,
        COALESCE(p.monto, 0) as monto,
        p.fecha_pago,
        p.proxima_fecha,
        p.metodo_pago
      FROM usuarios u
      LEFT JOIN pagos p ON u.id = p.id_usuario 
        AND p.id = (
          SELECT MAX(p2.id) 
          FROM pagos p2 
          WHERE p2.id_usuario = u.id
        )
      ORDER BY u.id ASC
    `;
    
    const [rows] = await db.query(query);
    
    // Formatear las fechas para mostrar
    const formattedRows = rows.map(row => ({
      ...row,
      fecha_pago: row.fecha_pago ? formatDateForDisplay(row.fecha_pago) : null,
      proxima_fecha: row.proxima_fecha ? formatDateForDisplay(row.proxima_fecha) : null
    }));
    
    res.json(formattedRows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener usuarios con pagos' });
  }
});

// Registrar usuario
router.post('/register', async (req, res) => {
  const { nombre, apellido, email, rol, withoutEmail, customPassword } = req.body;
  
  // Validar campos requeridos básicos
  if (!nombre || !apellido || !rol) {
    return res.status(400).json({ error: 'Faltan datos: nombre, apellido y rol son requeridos' });
  }
  
  // Validar email solo si no es usuario sin email
  if (!withoutEmail && !email) {
    return res.status(400).json({ error: 'Email es requerido para usuarios con correo electrónico' });
  }

  try {
    // 1. Generar credenciales automáticamente (usar contraseña personalizada si se proporciona)
    const { username, password } = await generateCredentials(nombre, apellido, customPassword);
    
    // 2. Crear el usuario en la base de datos
    let result;
    if (withoutEmail) {
      // Para usuarios sin email, usar un placeholder único
      const placeholderEmail = `sin-email-${username}@local.placeholder`;
      [result] = await db.query(
        "INSERT INTO usuarios(nombre, apellido, email, password, rol, estado, fecha_registro, username) VALUES(?,?,?,?,?,'activo',NOW(),?)",
        [nombre, apellido, placeholderEmail, password, rol, username]
      );
    } else {
      // Para usuarios con email normal
      [result] = await db.query(
        "INSERT INTO usuarios(nombre, apellido, email, password, rol, estado, fecha_registro, username) VALUES(?,?,?,?,?,'activo',NOW(),?)",
        [nombre, apellido, email, password, rol, username]
      );
    }
    
    // 3. Enviar credenciales por email solo si NO es usuario sin email
    if (!withoutEmail) {
      try {
        await axios.post('https://country-page.onrender.com/api/email/send-credentials', {
          nombre,
          apellido,
          email,
          username,
          password,
          rol
        });
        console.log(`Credenciales enviadas por email a: ${email}`);
      } catch (emailError) {
        console.error('Error enviando email:', emailError.message);
        // No fallar la creación del usuario si falla el email
      }
    }
    
    // 4. Respuesta diferente según si es con o sin email
    if (withoutEmail) {
      res.json({ 
        message: 'Usuario registrado correctamente. Las credenciales están listas para distribución manual.',
        id: result.insertId,
        credentials: {
          username,
          password
        }
      });
    } else {
      res.json({ 
        message: 'Usuario registrado correctamente y credenciales enviadas por email', 
        id: result.insertId,
        username,
        email_sent: true
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Endpoint para obtener previsualización de credenciales (sin crear usuario)
router.post('/preview-credentials', async (req, res) => {
  const { nombre, apellido, customPassword } = req.body;
  
  // Validar campos requeridos
  if (!nombre || !apellido) {
    return res.status(400).json({ error: 'Nombre y apellido son requeridos' });
  }
  
  try {
    // Generar credenciales (esto ya verifica duplicados en la BD)
    const { username, password } = await generateCredentials(nombre, apellido, customPassword);
    
    res.json({ 
      credentials: {
        username,
        password
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al generar credenciales' });
  }
});

// Registrar cliente con información de pagos
router.post('/register-cliente', async (req, res) => {
  const { nombre, apellido, email, monto, fecha_pago, proxima_fecha, metodo_pago, withoutEmail, customPassword } = req.body;
  
  // Validar campos requeridos del usuario
  if (!nombre || !apellido) {
    return res.status(400).json({ error: 'Faltan datos del usuario: nombre y apellido son requeridos' });
  }
  
  // Validar email solo si no es usuario sin email
  if (!withoutEmail && !email) {
    return res.status(400).json({ error: 'Email es requerido para usuarios con correo electrónico' });
  }
  
  // Validar campos requeridos de pago
  if ((monto === null || monto === undefined || monto === "") || !fecha_pago || !proxima_fecha) {
    return res.status(400).json({ error: 'Faltan datos de pago: monto, fecha_pago, proxima_fecha son requeridos' });
  }

  // Iniciar transacción para asegurar consistencia
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // 1. Generar credenciales automáticamente (usar contraseña personalizada si se proporciona)
    const { username, password } = await generateCredentials(nombre, apellido, customPassword);
    
    // 2. Crear el usuario con rol 'cliente'
    let userResult;
    if (withoutEmail) {
      // Para usuarios sin email, usar un placeholder único
      const placeholderEmail = `sin-email-${username}@local.placeholder`;
      [userResult] = await connection.query(
        "INSERT INTO usuarios(nombre, apellido, email, password, rol, estado, fecha_registro, username) VALUES(?,?,?,?,'cliente','activo',NOW(),?)",
        [nombre, apellido, placeholderEmail, password, username]
      );
    } else {
      // Para usuarios con email normal
      [userResult] = await connection.query(
        "INSERT INTO usuarios(nombre, apellido, email, password, rol, estado, fecha_registro, username) VALUES(?,?,?,?,'cliente','activo',NOW(),?)",
        [nombre, apellido, email, password, username]
      );
    }
    
    const userId = userResult.insertId;
    
    // 3. Formatear fechas para MySQL
    const fechaPagoFormatted = formatDateForMySQL(fecha_pago);
    const proximaFechaFormatted = formatDateForMySQL(proxima_fecha);
    const metodoPago = metodo_pago || 'efectivo';
    
    // 4. Crear el registro de pago
    await connection.query(
      'INSERT INTO pagos (id_usuario, monto, fecha_pago, proxima_fecha, metodo_pago) VALUES (?, ?, ?, ?, ?)',
      [userId, monto, fechaPagoFormatted, proximaFechaFormatted, metodoPago]
    );
    
    // 5. Confirmar transacción
    await connection.commit();
    
    // 6. Enviar credenciales por email solo si NO es usuario sin email
    let emailSent = false;
    if (!withoutEmail && email) {
      try {
        await axios.post('https://country-page.onrender.com/api/email/send-credentials', {
          nombre,
          apellido,
          email,
          username,
          password,
          rol: 'cliente'
        });
        console.log(`Credenciales enviadas por email a: ${email}`);
        emailSent = true;
      } catch (emailError) {
        console.error('Error enviando email:', emailError.message);
        // No fallar la creación del usuario si falla el email
      }
    }
    
    res.json({ 
      message: withoutEmail 
        ? 'Cliente registrado correctamente. Credenciales listas para distribución manual.'
        : 'Cliente registrado correctamente con información de pagos y credenciales enviadas por email', 
      id: userId,
      username,
      email_sent: emailSent,
      credentials: withoutEmail ? { username, password } : undefined, // Devolver credenciales para usuarios sin email
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

// Actualizar contraseña del usuario
router.patch('/update-password/:id', async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  
  if (!password) {
    return res.status(400).json({ error: 'La contraseña es requerida' });
  }
  
  if (password.length < 5) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 5 caracteres' });
  }

  try {
    const [result] = await db.query(
      "UPDATE usuarios SET password=? WHERE id=?",
      [password, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar contraseña' });
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

// Obtener historial completo de pagos de un usuario
router.get('/payment-history/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const [rows] = await db.query(`
      SELECT 
        p.id,
        p.monto,
        p.fecha_pago,
        p.proxima_fecha,
        p.metodo_pago
      FROM pagos p
      WHERE p.id_usuario = ?
      ORDER BY p.id DESC
    `, [id]);
    
    const formattedRows = rows.map(row => ({
      ...row,
      fecha_pago: formatDateForDisplay(row.fecha_pago),
      proxima_fecha: formatDateForDisplay(row.proxima_fecha)
    }));
    
    res.json(formattedRows);
  } catch (err) {
    console.error('Error al obtener historial de pagos:', err);
    
    if (err.code === 'ECONNRESET' || err.code === 'PROTOCOL_CONNECTION_LOST') {
      return res.status(503).json({ error: 'Error de conexión con la base de datos. Inténtalo de nuevo.' });
    }
    
    res.status(500).json({ error: 'Error al obtener historial de pagos' });
  }
});

// Agregar nuevo pago al historial
router.post('/add-payment', async (req, res) => {
  const { id_usuario, monto, fecha_pago, proxima_fecha, metodo_pago } = req.body;
  
  try {
    if (!id_usuario || !monto || !fecha_pago || !proxima_fecha) {
      return res.status(400).json({ 
        error: 'Todos los campos son requeridos: id_usuario, monto, fecha_pago, proxima_fecha' 
      });
    }
    
    const fechaPagoFormatted = formatDateForMySQL(fecha_pago);
    const proximaFechaFormatted = formatDateForMySQL(proxima_fecha);
    const metodoPago = metodo_pago || 'efectivo';
    
    const [result] = await db.query(
      'INSERT INTO pagos (id_usuario, monto, fecha_pago, proxima_fecha, metodo_pago) VALUES (?, ?, ?, ?, ?)',
      [id_usuario, monto, fechaPagoFormatted, proximaFechaFormatted, metodoPago]
    );
    
    res.json({ 
      message: 'Pago agregado correctamente al historial', 
      id: result.insertId 
    });
  } catch (err) {
    console.error('Error al agregar pago:', err);
    
    if (err.code === 'ECONNRESET' || err.code === 'PROTOCOL_CONNECTION_LOST') {
      return res.status(503).json({ error: 'Error de conexión con la base de datos. Inténtalo de nuevo.' });
    }
    
    if (err.message.includes('Formato de fecha inválido')) {
      return res.status(400).json({ error: 'Formato de fecha inválido. Use formato YYYY-MM-DD' });
    }
    
    res.status(500).json({ error: 'Error al agregar pago' });
  }
});

// Obtener conteo de pagos por usuario
router.get('/payment-counts', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        id_usuario,
        COUNT(*) as total_pagos
      FROM pagos
      GROUP BY id_usuario
    `);
    
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener conteo de pagos:', err);
    
    if (err.code === 'ECONNRESET' || err.code === 'PROTOCOL_CONNECTION_LOST') {
      return res.status(503).json({ error: 'Error de conexión con la base de datos. Inténtalo de nuevo.' });
    }
    
    res.status(500).json({ error: 'Error al obtener conteo de pagos' });
  }
});

// Endpoint para obtener estado de pagos (vencidos, próximos a vencer)
router.get('/payment-status', async (req, res) => {
  try {
    const query = `
      SELECT 
        u.id,
        u.nombre,
        u.apellido,
        u.email,
        p.proxima_fecha,
        p.monto,
        p.fecha_pago,
        DATEDIFF(p.proxima_fecha, CURDATE()) as dias_restantes,
        CASE 
          WHEN CURDATE() > p.proxima_fecha THEN 'vencido'
          WHEN DATEDIFF(p.proxima_fecha, CURDATE()) <= 7 THEN 'proximo_vencer'
          ELSE 'al_dia'
        END as estado_pago
      FROM usuarios u
      LEFT JOIN pagos p ON u.id = p.id_usuario
      WHERE p.id = (
        SELECT MAX(p2.id) 
        FROM pagos p2 
        WHERE p2.id_usuario = u.id
      )
      OR p.id IS NULL
      ORDER BY 
        CASE 
          WHEN p.proxima_fecha IS NULL THEN 0
          WHEN CURDATE() > p.proxima_fecha THEN 1
          WHEN DATEDIFF(p.proxima_fecha, CURDATE()) <= 7 THEN 2
          ELSE 3
        END,
        p.proxima_fecha ASC
    `;
    
    const [rows] = await db.query(query);
    
    const paymentStatus = rows.map(row => ({
      id: row.id,
      name: row.nombre,
      lastname: row.apellido,
      email: row.email,
      proxima_fecha: row.proxima_fecha ? formatDateForDisplay(row.proxima_fecha) : null,
      monto: row.monto,
      fecha_pago: row.fecha_pago ? formatDateForDisplay(row.fecha_pago) : null,
      dias_restantes: row.dias_restantes,
      estado_pago: row.estado_pago
    }));
    
    res.json(paymentStatus);
  } catch (err) {
    console.error('Error al obtener estado de pagos:', err);
    
    if (err.code === 'ECONNRESET' || err.code === 'PROTOCOL_CONNECTION_LOST') {
      return res.status(503).json({ error: 'Error de conexión con la base de datos. Inténtalo de nuevo.' });
    }
    
    res.status(500).json({ error: 'Error al obtener estado de pagos' });
  }
});

// Endpoint para editar un pago específico
router.put('/payment/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { monto, fecha_pago, proxima_fecha, metodo_pago } = req.body;
    
    // Validar que el ID sea válido
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'ID de pago inválido' });
    }
    
    // Validar que al menos un campo sea proporcionado
    if (!monto && !fecha_pago && !proxima_fecha && !metodo_pago) {
      return res.status(400).json({ 
        error: 'Al menos un campo debe ser proporcionado para actualizar' 
      });
    }
    
    // Verificar que el pago existe
    const [existingPayment] = await db.query(
      'SELECT id FROM pagos WHERE id = ?',
      [id]
    );
    
    if (existingPayment.length === 0) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }
    
    // Construir la consulta de actualización dinámicamente
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
    
    if (metodo_pago !== undefined) {
      updateFields.push('metodo_pago = ?');
      updateValues.push(metodo_pago);
    }
    
    // Agregar el ID al final para el WHERE
    updateValues.push(id);
    
    // Ejecutar la actualización del pago
    const [result] = await db.query(
      `UPDATE pagos SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'No se pudo actualizar el pago' });
    }
    
    res.json({ 
      message: 'Pago actualizado correctamente',
      id: parseInt(id),
      updatedFields: updateFields.length
    });
    
  } catch (err) {
    console.error('Error al actualizar pago:', err);
    
    if (err.code === 'ECONNRESET' || err.code === 'PROTOCOL_CONNECTION_LOST') {
      return res.status(503).json({ error: 'Error de conexión con la base de datos. Inténtalo de nuevo.' });
    }
    
    res.status(500).json({ error: 'Error al actualizar pago' });
  }
});

// Obtener información de un usuario específico
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const [userRows] = await db.query(
      "SELECT id, nombre, apellido, email, username, rol FROM usuarios WHERE id = ?",
      [id]
    );
    
    if (userRows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    
    res.json(userRows[0]);
  } catch (err) {
    console.error("Error al obtener usuario:", err);
    return res.status(500).json({ error: "Error en el servidor" });
  }
});

// Cambiar contraseña de usuario
router.post('/change-password', async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;

  // Validar datos requeridos
  if (!userId || !currentPassword || !newPassword) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }

  // Validar longitud de nueva contraseña
  if (newPassword.length < 5) {
    return res.status(400).json({ error: "La nueva contraseña debe tener al menos 5 caracteres" });
  }

  try {
    // Verificar contraseña actual y obtener información completa del usuario
    const [userRows] = await db.query(
      "SELECT id, nombre, email, username, password FROM usuarios WHERE id = ?",
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const user = userRows[0];
    
    // Verificar que la contraseña actual sea correcta
    if (user.password !== currentPassword) {
      return res.status(401).json({ error: "La contraseña actual es incorrecta" });
    }

    // Actualizar contraseña
    await db.query(
      "UPDATE usuarios SET password = ? WHERE id = ?",
      [newPassword, userId]
    );

    // Enviar email con credenciales actualizadas si el usuario tiene email
    if (user.email) {
      try {
        const emailResponse = await axios.post('https://country-page.onrender.com/api/email/send-updated-credentials', {
          email: user.email,
          nombre: user.nombre,
          username: user.username,
          newPassword: newPassword
        });
        
        console.log("✅ Email de credenciales actualizadas enviado exitosamente");
        
        res.json({ 
          mensaje: "Contraseña actualizada exitosamente",
          emailSent: true,
          emailInfo: "Se han enviado las credenciales actualizadas por correo electrónico"
        });
      } catch (emailError) {
        console.error("⚠️ Error al enviar email:", emailError);
        
        res.json({ 
          mensaje: "Contraseña actualizada exitosamente",
          emailSent: false,
          emailError: "No se pudo enviar el email con las credenciales actualizadas"
        });
      }
    } else {
      res.json({ 
        mensaje: "Contraseña actualizada exitosamente",
        emailSent: false,
        emailInfo: "Usuario sin email registrado"
      });
    }

  } catch (err) {
    console.error("❌ Error al cambiar contraseña:", err);
    return res.status(500).json({ error: "Error en el servidor" });
  }
});

export default router;
*/
