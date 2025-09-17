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

export default router;
