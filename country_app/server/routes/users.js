// server/routes/users.js
import express from 'express';
import db from '../db.js';
import bcrypt from 'bcrypt';

const router = express.Router();

// Registrar usuario
router.post('/register', async (req, res) => {
  const { nombre, email, password } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  try {
    // Verificar si el usuario ya existe
    const [rows] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (rows.length > 0) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario
    await db.query('INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)', [
      nombre,
      email,
      hashedPassword,
    ]);

    res.status(201).json({ message: 'Usuario registrado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

export default router;
