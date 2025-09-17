import express from 'express';
import db from '../server/db.js';

const router = express.Router();

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
