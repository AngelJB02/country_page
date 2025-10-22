import express from 'express';
import db from '../server/db.js';
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
        u.correo,
        u.rol,
        u.estatus,
        u.fecha_registro,
        COALESCE(c.monto, 0) AS monto,
        c.fecha_pago,
        c.concepto,
        c.estatus_pago
      FROM usuarios u
      LEFT JOIN contabilidad c ON u.id = c.cliente_id 
        AND c.id = (
          SELECT MAX(c2.id) 
          FROM contabilidad c2 
          WHERE c2.cliente_id = u.id
        )
      WHERE u.rol = 'cliente'
      ORDER BY c.fecha_pago DESC
    `;

    const [rows] = await db.query(query);

    // Formatear las fechas para mostrar
    const formattedRows = rows.map(row => ({
      ...row,
      fecha_pago: row.fecha_pago ? formatDateForDisplay(row.fecha_pago) : null
    }));

    res.json(formattedRows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener usuarios con pagos' });
  }
});

// Registrar usuario
// Registrar un nuevo usuario (destinado para la vista de creación de cuentas)
// Este endpoint crea un usuario en la tabla 'usuarios' con:
// - Username generado dinámicamente basado en nombre.apellido
// - Contrase   ña generada automáticamente o personalizada
// - Campos adicionales opcionales: edad, telefono, tipo_cliente, nivel, tipo_nivel
// - Estatus por defecto: 'activo'
// - Fecha de registro: timestamp actual
router.post('/register', async (req, res) => {
  // Extraer campos del body de la petición
  // Campos requeridos: nombre, apellido, rol
  // Campos opcionales: correo, customPassword, edad, telefono, tipo_cliente, nivel, tipo_nivel
  const { nombre, apellido, correo, rol, customPassword, edad, telefono, tipo_cliente, nivel, tipo_nivel } = req.body;

  // Validar campos requeridos básicos
  if (!nombre || !apellido || !rol) {
    return res.status(400).json({ error: 'Faltan datos: nombre, apellido y rol son requeridos' });
  }

  try {
    // 1. GENERACIÓN DE USERNAME DINÁMICO
    // - Formato base: nombre.apellido (en minúsculas, sin espacios)
    // - Limitado a 20 caracteres máximo
    // - Si ya existe, añade contador incremental (angel.jimenez1, angel.jimenez2, etc.)
    let baseUsername = `${nombre.toLowerCase()}.${apellido.toLowerCase()}`.replace(/\s+/g, '');
    baseUsername = baseUsername.slice(0, 20); // Limitar el username a un máximo de 20 caracteres
    let username = baseUsername;
    let counter = 1;

    // Verificar si el username ya existe y generar uno único
    while (true) {
      const [existingUser] = await db.query('SELECT id FROM usuarios WHERE username = ?', [username]);
      if (existingUser.length === 0) break;
      username = `${baseUsername}${counter}`.slice(0, 20); // Asegurar que el username truncado siga siendo único
      counter++;
    }

    // 2. GENERACIÓN DE CONTRASEÑA
    // - Si se proporciona customPassword, se usa esa
    // - Si no, se genera una contraseña aleatoria de 8 caracteres
    const password = customPassword || Math.random().toString(36).slice(-8);

    // 3. INSERCIÓN EN BASE DE DATOS
    // Inserta en tabla 'usuarios' con todos los campos disponibles
    // Campos con valores por defecto: estatus='activo', fecha_registro=NOW()
    const [result] = await db.query(
      "INSERT INTO usuarios (nombre, apellido, correo, username, contrasena, rol, estatus, fecha_registro, edad, telefono, tipo_cliente, nivel, tipo_nivel) VALUES (?, ?, ?, ?, ?, ?, 'activo', NOW(), ?, ?, ?, ?, ?)",
      [nombre, apellido, correo, username, password, rol, edad, telefono, tipo_cliente, nivel, tipo_nivel]
    );

    // 4. RESPUESTA
    // Devuelve información completa del usuario creado
    res.json({
      message: 'Usuario registrado correctamente',
      id: result.insertId,
      username,           // Username generado
      password,           // Contraseña (generada o personalizada)
      rol,                // Rol asignado
      estatus: 'activo',  // Estatus por defecto
      edad,               // Edad (si se proporcionó)
      telefono,           // Teléfono (si se proporcionó)
      tipo_cliente,       // Tipo de cliente (si se proporcionó)
      nivel,              // Nivel (si se proporcionó)
      tipo_nivel          // Tipo de nivel (si se proporcionó)
    });
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
    // Generar username dinámico
    let baseUsername = `${nombre.toLowerCase()}.${apellido.toLowerCase()}`.replace(/\s+/g, '');
    baseUsername = baseUsername.slice(0, 20); // Limitar el username a un máximo de 20 caracteres
    let username = baseUsername;
    let counter = 1;

    // Verificar si el username ya existe y generar uno único
    while (true) {
      const [existingUser] = await db.query('SELECT id FROM usuarios WHERE username = ?', [username]);
      if (existingUser.length === 0) break;
      username = `${baseUsername}${counter}`.slice(0, 20); // Asegurar que el username truncado siga siendo único
      counter++;
    }

    // Generar contraseña (usar personalizada si se proporciona)
    const password = customPassword || Math.random().toString(36).slice(-8);

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

// Registrar cliente con información de contabilidad
// Este endpoint registra un nuevo cliente en la tabla 'usuarios' con rol 'cliente'
// y crea un registro inicial en la tabla 'contabilidad'.
// Campos requeridos: nombre, apellido, monto, fecha_pago
// Campos opcionales: email, concepto, withoutEmail, customPassword, edad, telefono, tipo_cliente, nivel, tipo_nivel, observaciones
// Ejemplo de raw JSON:
// {
//   "nombre": "Carlos",
//   "apellido": "López",
//   "email": "carlos@example.com",
//   "monto": 200.00,
//   "fecha_pago": "2024-10-22",
//   "concepto": "Pago inicial",
//   "withoutEmail": false,
//   "customPassword": "cliente123",
//   "edad": 25,
//   "telefono": "123456789",
//   "tipo_cliente": "particular",
//   "nivel": "principiante",
//   "tipo_nivel": "equitacion",
//   "observaciones": "Pago inicial del cliente"
// }
router.post('/register-cliente', async (req, res) => {
  const { nombre, apellido, email, monto, fecha_pago, concepto, withoutEmail, customPassword, edad, telefono, tipo_cliente, nivel, tipo_nivel, observaciones } = req.body;

  // Validar campos requeridos del usuario
  if (!nombre || !apellido) {
    return res.status(400).json({ error: 'Faltan datos del usuario: nombre y apellido son requeridos' });
  }

  // Validar email solo si no es usuario sin email
  if (!withoutEmail && !email) {
    return res.status(400).json({ error: 'Email es requerido para usuarios con correo electrónico' });
  }

  // Validar campos requeridos de pago
  if ((monto === null || monto === undefined || monto === "") || !fecha_pago) {
    return res.status(400).json({ error: 'Faltan datos de pago: monto y fecha_pago son requeridos' });
  }

  try {
    // Generar credenciales utilizando la lógica de preview-credentials
    const { credentials } = await (async () => {
      let baseUsername = `${nombre.toLowerCase()}.${apellido.toLowerCase()}`.replace(/\s+/g, '').slice(0, 20);
      let username = baseUsername;
      let counter = 1;

      while (true) {
        const [existingUser] = await db.query('SELECT id FROM usuarios WHERE username = ?', [username]);
        if (existingUser.length === 0) break;
        username = `${baseUsername}${counter}`.slice(0, 20);
        counter++;
      }

      const password = customPassword || Math.random().toString(36).slice(-8);
      return { credentials: { username, password } };
    })();

    // Iniciar transacción para asegurar consistencia
    const connection = await db.getConnection();
    await connection.beginTransaction();

    // Crear el usuario con rol 'cliente'
    const placeholderEmail = withoutEmail ? `sin-email-${credentials.username}@local.placeholder` : email;
    const [userResult] = await connection.query(
      "INSERT INTO usuarios(nombre, apellido, correo, contrasena, rol, estatus, fecha_registro, username, edad, telefono, tipo_cliente, nivel, tipo_nivel) VALUES(?,?,?,?,'cliente','activo',NOW(),?,?,?,?,?,?)",
      [nombre, apellido, placeholderEmail, credentials.password, credentials.username, edad, telefono, tipo_cliente, nivel, tipo_nivel]
    );

    // Registrar información de pago
    await connection.query(
      "INSERT INTO contabilidad(cliente_id, monto, fecha_pago, concepto, estatus_pago, observaciones) VALUES(?,?,?,?,?,?)",
      [userResult.insertId, monto, fecha_pago, 'Pago inicial', 'pagado', observaciones]
    );

    await connection.commit();

    res.json({
      message: 'Cliente registrado correctamente',
      usuario: {
        id: userResult.insertId,
        nombre,
        apellido,
        email: placeholderEmail,
        username: credentials.username,
        password: credentials.password,
        edad,
        telefono,
        tipo_cliente,
        nivel,
        tipo_nivel
      },
      pago: {
        monto,
        fecha_pago,
        concepto: 'Pago inicial',
        estatus_pago: 'pagado',
        observaciones
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar cliente' });
  }
});

// Editar correo del usuario
router.patch('/update-email/:id', async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;

  // Validar que el email esté presente y tenga un formato válido
  if (!email) {
    return res.status(400).json({ error: 'El email es requerido' });
  }

  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'El formato del email no es válido' });
  }

  try {
    const [result] = await db.query(
      "UPDATE usuarios SET correo=? WHERE id=?",
      [email, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: 'Correo actualizado correctamente' });
  } catch (err) {
    console.error('Error al actualizar correo:', err);

    // Manejar errores específicos de la base de datos
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'El email ya está en uso' });
    }

    res.status(500).json({ error: 'Error al actualizar correo' });
  }
});

// Actualizar contraseña del usuario
router.patch('/update-password/:id', async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  // Validar que la contraseña esté presente y cumpla con los requisitos mínimos
  if (!password) {
    return res.status(400).json({ error: 'La contraseña es requerida' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
  }

  try {
    const [result] = await db.query(
      "UPDATE usuarios SET contrasena=? WHERE id=?",
      [password, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    console.error('Error al actualizar contraseña:', err);

    // Manejar errores específicos de la base de datos
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Error de duplicación en la base de datos' });
    }

    res.status(500).json({ error: 'Error al actualizar contraseña' });
  }
});

// Actualizar estado del usuario
router.patch('/update-status/:id', async (req, res) => {
  const { id } = req.params;
  const { estatus } = req.body;

  // Validar que el campo estatus esté presente y sea válido
  if (!estatus) {
    return res.status(400).json({ error: 'El campo estatus es requerido' });
  }

  const estadosValidos = ['activo', 'inactivo', 'bloqueado'];
  if (!estadosValidos.includes(estatus.toLowerCase())) {
    return res.status(400).json({ error: `El estado proporcionado no es válido. Valores permitidos: ${estadosValidos.join(', ')}` });
  }

  try {
    const [result] = await db.query(
      "UPDATE usuarios SET estatus=? WHERE id=?",
      [estatus.toLowerCase(), id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: 'Estado actualizado correctamente', estatus: estatus.toLowerCase() });
  } catch (err) {
    console.error('Error al actualizar estado:', err);

    // Manejar errores específicos de la base de datos
    if (err.code === 'ER_BAD_FIELD_ERROR') {
      return res.status(400).json({ error: 'Error en el campo proporcionado' });
    }

    res.status(500).json({ error: 'Error al actualizar estado del usuario' });
  }
});

// Obtener usuarios con información de contabilidad
router.get('/with-payments', async (req, res) => {
  try {
    const query = `
      SELECT 
        u.id,
        u.nombre,
        u.apellido,
        u.correo AS email,
        u.rol,
        u.estatus,
        u.fecha_registro,
        COALESCE(c.monto, 0) AS monto,
        c.fecha_pago AS ultimo_pago,
        c.concepto,
        c.estatus_pago
      FROM usuarios u
      LEFT JOIN contabilidad c ON u.id = c.cliente_id 
        AND c.id = (
          SELECT MAX(c2.id) 
          FROM contabilidad c2 
          WHERE c2.cliente_id = u.id
        )
      WHERE u.rol = 'cliente'
      ORDER BY c.fecha_pago DESC
    `;

    const [rows] = await db.query(query);

    // Formatear las fechas para mostrar
    const formattedRows = rows.map(row => ({
      ...row,
      ultimo_pago: row.ultimo_pago ? formatDateForDisplay(row.ultimo_pago) : null
    }));

    res.json(formattedRows);
  } catch (err) {
    console.error('Error al obtener usuarios con pagos:', err);

    // Manejar errores específicos de conexión
    if (err.code === 'ECONNRESET' || err.code === 'PROTOCOL_CONNECTION_LOST') {
      return res.status(503).json({ error: 'Error de conexión con la base de datos. Inténtalo de nuevo.' });
    }

    res.status(500).json({ error: 'Error al obtener usuarios con información de contabilidad' });
  }
});

// Obtener información de pagos de un usuario específico
router.get('/payments/:id', async (req, res) => {
  const { id } = req.params;

  // Validar que el ID sea un número válido
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'ID de usuario inválido' });
  }

  try {
    const query = `
      SELECT 
        c.id,
        c.monto,
        c.fecha_pago AS ultimo_pago,
        c.concepto,
        c.estatus_pago,
        u.nombre,
        u.apellido,
        u.correo AS email
      FROM contabilidad c
      JOIN usuarios u ON c.cliente_id = u.id
      WHERE c.cliente_id = ?
      ORDER BY c.fecha_pago DESC
      LIMIT 1
    `;

    const [rows] = await db.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No se encontraron pagos para este usuario' });
    }

    const paymentInfo = {
      ...rows[0],
      ultimo_pago: rows[0].ultimo_pago ? formatDateForDisplay(rows[0].ultimo_pago) : null
    };

    res.json(paymentInfo);
  } catch (err) {
    console.error('Error al obtener pagos del usuario:', err);

    // Manejar errores específicos de conexión
    if (err.code === 'ECONNRESET' || err.code === 'PROTOCOL_CONNECTION_LOST') {
      return res.status(503).json({ error: 'Error de conexión con la base de datos. Inténtalo de nuevo.' });
    }

    res.status(500).json({ error: 'Error al obtener información de pagos del usuario' });
  }
});

// Crear o actualizar registro de contabilidad de usuario
router.post('/payments', async (req, res) => {
  const { cliente_id, monto, fecha_pago, concepto, estatus_pago, observaciones } = req.body;

  // Validar campos requeridos
  if (!cliente_id) {
    return res.status(400).json({ error: 'El campo cliente_id es requerido' });
  }

  if (!monto && !fecha_pago && !concepto) {
    return res.status(400).json({ error: 'Al menos un campo debe ser proporcionado: monto, fecha_pago, concepto' });
  }

  try {
    // Crear nuevo registro en contabilidad
    if (!monto || !fecha_pago || !concepto) {
      return res.status(400).json({ error: 'Para crear un nuevo registro se requieren los campos: monto, fecha_pago, concepto' });
    }

    const insertQuery = `INSERT INTO contabilidad (cliente_id, monto, fecha_pago, concepto, estatus_pago, observaciones) VALUES (?, ?, ?, ?, ?, ?)`;
    const [result] = await db.query(insertQuery, [
      cliente_id,
      monto,
      formatDateForMySQL(fecha_pago),
      concepto,
      estatus_pago || 'pendiente',
      observaciones || null
    ]);

    return res.json({ message: 'Registro de contabilidad creado correctamente', id: result.insertId });
  } catch (err) {
    console.error('Error al gestionar el pago:', err);

    if (err.code === 'ECONNRESET' || err.code === 'PROTOCOL_CONNECTION_LOST') {
      return res.status(503).json({ error: 'Error de conexión con la base de datos. Inténtalo de nuevo.' });
    }

    if (err.message.includes('Formato de fecha inválido')) {
      return res.status(400).json({ error: 'Formato de fecha inválido. Use el formato YYYY-MM-DD' });
    }

    res.status(500).json({ error: 'Error al gestionar el registro de contabilidad' });
  }
});

// Obtener historial completo de pagos de un usuario
router.get('/payment-history/:id', async (req, res) => {
  const { id } = req.params;

  // Validar que el ID sea un número válido
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'ID de usuario inválido' });
  }

  try {
    const [rows] = await db.query(`
      SELECT 
        p.id,
        p.monto,
        p.fecha_pago,
        p.concepto,
        p.estatus_pago,
        p.observaciones
      FROM contabilidad p
      WHERE p.cliente_id = ?
      ORDER BY p.fecha_pago DESC
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No se encontraron pagos para este usuario' });
    }

    const formattedRows = rows.map(row => ({
      ...row,
      fecha_pago: formatDateForDisplay(row.fecha_pago)
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
  const { cliente_id, monto, fecha_pago, concepto, estatus_pago, observaciones } = req.body;

  // Validar campos requeridos
  if (!cliente_id || !monto || !fecha_pago || !concepto) {
    return res.status(400).json({
      error: 'Los campos cliente_id, monto, fecha_pago y concepto son requeridos.'
    });
  }

  try {
    const fechaPagoFormatted = formatDateForMySQL(fecha_pago);

    const [result] = await db.query(
      'INSERT INTO contabilidad (cliente_id, monto, fecha_pago, concepto, estatus_pago, observaciones) VALUES (?, ?, ?, ?, ?, ?)',
      [
        cliente_id,
        monto,
        fechaPagoFormatted,
        concepto,
        estatus_pago || 'pendiente',
        observaciones || null
      ]
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
      return res.status(400).json({ error: 'Formato de fecha inválido. Use el formato YYYY-MM-DD.' });
    }

    res.status(500).json({ error: 'Error al agregar pago' });
  }
});

// Obtener conteo de pagos por usuario
router.get('/payment-counts', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        cliente_id,
        COUNT(*) AS total_pagos
      FROM contabilidad
      GROUP BY cliente_id
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
        u.id AS cliente_id,
        u.nombre,
        u.apellido,
        u.correo AS email,
        c.monto,
        c.fecha_pago,
        c.concepto,
        c.estatus_pago
      FROM usuarios u
      LEFT JOIN contabilidad c ON u.id = c.cliente_id
      WHERE c.id = (
        SELECT MAX(c2.id) 
        FROM contabilidad c2 
        WHERE c2.cliente_id = u.id
      )
      OR c.id IS NULL
      ORDER BY c.fecha_pago DESC
    `;

    const [rows] = await db.query(query);

    const paymentStatus = rows.map(row => ({
      cliente_id: row.cliente_id,
      nombre: row.nombre,
      apellido: row.apellido,
      email: row.email,
      monto: row.monto,
      fecha_pago: row.fecha_pago ? formatDateForDisplay(row.fecha_pago) : null,
      concepto: row.concepto,
      estatus_pago: row.estatus_pago
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
    const { monto, fecha_pago, concepto, estatus_pago, observaciones } = req.body;

    // Validar que el ID sea válido
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'ID de pago inválido' });
    }

    // Validar que al menos un campo sea proporcionado
    if (!monto && !fecha_pago && !concepto && !estatus_pago && !observaciones) {
      return res.status(400).json({ 
        error: 'Al menos un campo debe ser proporcionado para actualizar' 
      });
    }

    // Verificar que el pago existe
    const [existingPayment] = await db.query(
      'SELECT id FROM contabilidad WHERE id = ?',
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

    if (concepto !== undefined) {
      updateFields.push('concepto = ?');
      updateValues.push(concepto);
    }

    if (estatus_pago !== undefined) {
      updateFields.push('estatus_pago = ?');
      updateValues.push(estatus_pago);
    }

    if (observaciones !== undefined) {
      updateFields.push('observaciones = ?');
      updateValues.push(observaciones);
    }

    // Agregar el ID al final para el WHERE
    updateValues.push(id);

    // Ejecutar la actualización del pago
    const [result] = await db.query(
      `UPDATE contabilidad SET ${updateFields.join(', ')} WHERE id = ?`,
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

  // Validar que el ID sea un número válido
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'ID de usuario inválido' });
  }

  try {
    // Consultar toda la información del usuario
    const [userRows] = await db.query(
      `SELECT 
        u.id, 
        u.username, 
        u.nombre, 
        u.apellido, 
        u.edad, 
        u.correo, 
        u.telefono, 
        u.rol, 
        u.tipo_cliente, 
        u.nivel, 
        u.tipo_nivel, 
        u.estatus, 
        u.fecha_registro
      FROM usuarios u
      WHERE u.id = ?`,
      [id]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Consultar toda la información de pagos del usuario
    const [paymentRows] = await db.query(
      `SELECT 
        p.id AS pago_id, 
        p.monto, 
        p.fecha_pago, 
        p.concepto, 
        p.estatus_pago, 
        p.observaciones, 
        p.fecha_registro
      FROM contabilidad p
      WHERE p.cliente_id = ?
      ORDER BY p.fecha_pago DESC`,
      [id]
    );

    // Formatear las fechas para mostrar
    const formattedPayments = paymentRows.map(payment => ({
      ...payment,
      fecha_pago: payment.fecha_pago ? formatDateForDisplay(payment.fecha_pago) : null,
      fecha_registro: payment.fecha_registro ? formatDateForDisplay(payment.fecha_registro) : null
    }));

    res.json({
      usuario: userRows[0],
      pagos: formattedPayments
    });
  } catch (err) {
    console.error('Error al obtener información del usuario:', err);

    if (err.code === 'ECONNRESET' || err.code === 'PROTOCOL_CONNECTION_LOST') {
      return res.status(503).json({ error: 'Error de conexión con la base de datos. Inténtalo de nuevo.' });
    }

    res.status(500).json({ error: 'Error al obtener información del usuario' });
  }
});

// Cambiar contraseña de usuario
router.post('/change-password', async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;

  // Validar datos requeridos
  if (!userId || !currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Faltan datos requeridos: userId, currentPassword y newPassword son obligatorios.' });
  }

  // Validar longitud de la nueva contraseña
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 8 caracteres.' });
  }

  try {
    // Verificar contraseña actual y obtener información completa del usuario
    const [userRows] = await db.query(
      `SELECT id, nombre, correo, username, contrasena FROM usuarios WHERE id = ?`,
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const user = userRows[0];

    // Verificar que la contraseña actual sea correcta
    if (user.contrasena !== currentPassword) {
      return res.status(401).json({ error: 'La contraseña actual es incorrecta.' });
    }

    // Actualizar la contraseña
    await db.query(
      `UPDATE usuarios SET contrasena = ? WHERE id = ?`,
      [newPassword, userId]
    );

    // Enviar email con credenciales actualizadas si el usuario tiene correo registrado
    if (user.correo) {
      try {
        await axios.post('https://country-page.onrender.com/api/email/send-updated-credentials', {
          email: user.correo,
          nombre: user.nombre,
          username: user.username,
          newPassword: newPassword
        });

        res.json({
          mensaje: 'Contraseña actualizada exitosamente. Se ha enviado un correo con las credenciales actualizadas.',
          emailSent: true
        });
      } catch (emailError) {
        console.error('Error al enviar el correo:', emailError);
        res.json({
          mensaje: 'Contraseña actualizada exitosamente, pero no se pudo enviar el correo con las credenciales.',
          emailSent: false
        });
      }
    } else {
      res.json({
        mensaje: 'Contraseña actualizada exitosamente. El usuario no tiene un correo registrado.',
        emailSent: false
      });
    }
  } catch (err) {
    console.error('Error al cambiar la contraseña:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

export default router;
