
import express from 'express';
import db from '../server/db.js';
import { DateTime } from 'luxon';

const router = express.Router();

// =============================================================================
// FUNCIONES HELPER
// =============================================================================

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

// Función para formatear tiempo para MySQL
const formatTimeForMySQL = (timeString) => {
  if (!timeString) return null;
  
  // Si ya está en formato HH:MM:SS, devolverlo tal como está
  if (/^\d{2}:\d{2}:\d{2}$/.test(timeString)) {
    return timeString;
  }
  
  // Si está en formato HH:MM, agregar :00
  if (/^\d{2}:\d{2}$/.test(timeString)) {
    return timeString + ':00';
  }
  
  throw new Error('Formato de hora inválido');
};



// Verificar disponibilidad de instructora
const verificarDisponibilidadInstructora = async (instructoraId, fecha, horaInicio, horaFin) => {
  try {
    // Verificar si la instructora está en descanso
    const [descansos] = await db.query(`
      SELECT id FROM descansos
      WHERE instructora_id = ?
      AND ? BETWEEN fecha_inicio AND fecha_fin
    `, [instructoraId, fecha]);

    if (descansos.length > 0) {
      return { disponible: false, razon: 'Instructora en descanso' };
    }

    // Verificar conflictos de horarios
    const [conflictos] = await db.query(`
      SELECT r.id FROM reservas r
      JOIN instructoras i ON r.instructora_id = i.id
      WHERE r.instructora_id = ?
      AND r.fecha = ?
      AND r.estatus IN ('pendiente', 'confirmada')
      AND (
        (r.hora_inicio <= ? AND r.hora_fin > ?) OR
        (r.hora_inicio < ? AND r.hora_fin >= ?) OR
        (r.hora_inicio >= ? AND r.hora_fin <= ?)
      )
    `, [instructoraId, fecha, horaInicio, horaInicio, horaFin, horaFin, horaInicio, horaFin]);

    if (conflictos.length > 0) {
      return { disponible: false, razon: 'Instructora ocupada en ese horario' };
    }

    return { disponible: true };
  } catch (err) {
    console.error('Error verificando disponibilidad de instructora:', err);
    return { disponible: false, razon: 'Error del sistema' };
  }
};

// Verificar disponibilidad de caballo
const verificarDisponibilidadCaballo = async (caballoId, fecha, horaInicio, horaFin, tipoClase) => {
  try {
    // Verificar estatus del caballo
    const [caballo] = await db.query(`
      SELECT disponibilidad, estatus FROM caballos WHERE id = ?
    `, [caballoId]);

    if (caballo.length === 0) {
      return { disponible: false, razon: 'Caballo no encontrado' };
    }

    if (caballo[0].disponibilidad === 'no_disponible') {
      return { disponible: false, razon: 'Caballo no disponible' };
    }

    // Verificar conflictos de horarios
    const [conflictos] = await db.query(`
      SELECT r.id, r.hora_fin FROM reservas r
      WHERE r.caballo_id = ?
      AND r.fecha = ?
      AND r.estatus IN ('pendiente', 'confirmada')
      AND (
        (r.hora_inicio <= ? AND r.hora_fin > ?) OR
        (r.hora_inicio < ? AND r.hora_fin >= ?) OR
        (r.hora_inicio >= ? AND r.hora_fin <= ?)
      )
    `, [caballoId, fecha, horaInicio, horaInicio, horaFin, horaFin, horaInicio, horaFin]);

    if (conflictos.length > 0) {
      return { disponible: false, razon: 'Caballo ocupado en ese horario' };
    }

    // NUEVA REGLA: Verificar si ya trabajó 3 veces en actividades que no sean iniciación
    const [actividadesHoy] = await db.query(`
      SELECT COUNT(*) as total FROM reservas r
      JOIN clases c ON r.clase_id = c.id
      WHERE r.caballo_id = ?
      AND r.fecha = ?
      AND r.estatus IN ('confirmada', 'completada')
      AND LOWER(c.nombre) NOT LIKE '%iniciaci%'
    `, [caballoId, fecha]);

    const actividadesNoIniciacion = actividadesHoy[0]?.total || 0;
    
    // Si la clase actual no es iniciación y ya trabajó 3 veces, no puede trabajar más
    if (tipoClase && !tipoClase.toLowerCase().includes('iniciaci') && actividadesNoIniciacion >= 3) {
      return { 
        disponible: false, 
        razon: `Caballo ya trabajó ${actividadesNoIniciacion} veces hoy en actividades no-iniciación. Necesita descansar.` 
      };
    }

    // Verificar descanso obligatorio para salto/avanzado (3 horas)
    if (tipoClase === 'salto') {
      const [ultimaReserva] = await db.query(`
        SELECT r.hora_fin FROM reservas r
        JOIN clases c ON r.clase_id = c.id
        WHERE r.caballo_id = ?
        AND r.fecha = ?
        AND r.estatus = 'completada'
        AND c.nombre = 'salto'
        ORDER BY r.hora_fin DESC
        LIMIT 1
      `, [caballoId, fecha]);

      if (ultimaReserva.length > 0) {
        const horaFinUltima = ultimaReserva[0].hora_fin;
        const tiempoDescanso = new Date(`2000-01-01 ${horaInicio}`) - new Date(`2000-01-01 ${horaFinUltima}`);
        const horasDescanso = tiempoDescanso / (1000 * 60 * 60);

        if (horasDescanso < 3) {
          return { disponible: false, razon: 'Caballo necesita 3 horas de descanso después de salto' };
        }
      }
    }

    return { disponible: true };
  } catch (err) {
    console.error('Error verificando disponibilidad de caballo:', err);
    return { disponible: false, razon: 'Error del sistema' };
  }
};

// Verificar restricciones por tipo de cliente
const verificarRestriccionesCliente = async (clienteId, fecha, tipoCliente) => {
  try {
    // PROPIETARIO y RENTA: Sin límites de reservas
    if (tipoCliente === 'propietario' || tipoCliente === 'renta') {
      return { permitido: true };
    }

    // MEDIA_RENTA: Máximo 3 reservas por semana
    if (tipoCliente === 'media_renta') {
      const inicioSemana = new Date(fecha);
      inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
      const finSemana = new Date(inicioSemana);
      finSemana.setDate(finSemana.getDate() + 6);

      const [reservasSemanales] = await db.query(`
        SELECT COUNT(*) as total FROM reservas
        WHERE cliente_id = ?
        AND fecha BETWEEN ? AND ?
        AND estatus IN ('pendiente', 'confirmada')
      `, [clienteId, formatDateForMySQL(inicioSemana), formatDateForMySQL(finSemana)]);

      if (reservasSemanales[0].total >= 3) {
        return { 
          permitido: false, 
          razon: 'Límite de 3 reservas por semana alcanzado (media renta)' 
        };
      }
      return { permitido: true };
    }

    // DEMO: Solo fines de semana (sábado=6, domingo=0)
    if (tipoCliente === 'demo') {
      const fechaObj = new Date(fecha);
      const diaSemana = fechaObj.getDay();
      
      if (diaSemana !== 0 && diaSemana !== 6) {
        return { 
          permitido: false, 
          razon: 'Las clases demo solo están disponibles en fines de semana' 
        };
      }
      
      // Demo puede tener solo una reserva activa
      const [reservasActivas] = await db.query(`
        SELECT COUNT(*) as total FROM reservas
        WHERE cliente_id = ?
        AND fecha >= CURDATE()
        AND estatus IN ('pendiente', 'confirmada')
      `, [clienteId]);

      if (reservasActivas[0].total > 0) {
        return { 
          permitido: false, 
          razon: 'Ya tienes una reserva activa. Solo se permite una reserva demo a la vez' 
        };
      }
      return { permitido: true };
    }

    // GENERAL: Solo una reserva activa a la vez
    const [reservasActivas] = await db.query(`
      SELECT COUNT(*) as total FROM reservas
      WHERE cliente_id = ?
      AND fecha >= CURDATE()
      AND estatus IN ('pendiente', 'confirmada')
    `, [clienteId]);

    if (reservasActivas[0].total > 0) {
      return { 
        permitido: false, 
        razon: 'Ya tienes una reserva activa. Solo se permite una reserva por cliente' 
      };
    }

    return { permitido: true };
  } catch (err) {
    console.error('Error verificando restricciones de cliente:', err);
    return { permitido: false, razon: 'Error del sistema' };
  }
};

// =============================================================================
// ENDPOINTS PARA ADMINISTRADOR
// =============================================================================

// Obtener todas las reservas (vista de administrador)
router.get('/admin/all', async (req, res) => {
  try {
    const { fecha, semana } = req.query;
    let whereClause = '1=1';
    let params = [];
    const ttlMs = 30 * 1000; // 30s

    // Caché en memoria (simple) por URL completa
    const cacheKey = `admin_all:${req.originalUrl}`;
    if (!semana) {
      // Solo cacheamos por fecha (no por rango semanas en esta primera versión)
      if (!router._cacheStore) {
        router._cacheStore = new Map();
      }
      const cached = router._cacheStore.get(cacheKey);
      if (cached && Date.now() < cached.expiresAt) {
        return res.json(cached.data);
      }
    }

    if (fecha) {
      whereClause += ' AND r.fecha = ?';
      params.push(formatDateForMySQL(fecha));
    } else if (semana) {
      // Calcular rango de la semana
      const inicioSemana = new Date(semana);
      inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
      const finSemana = new Date(inicioSemana);
      finSemana.setDate(finSemana.getDate() + 6);
      
      whereClause += ' AND r.fecha BETWEEN ? AND ?';
      params.push(formatDateForMySQL(inicioSemana), formatDateForMySQL(finSemana));
    } else {
      // Por defecto mostrar el día actual
      whereClause += ' AND r.fecha = CURDATE()';
    }

    const query = `
      SELECT 
        r.id,
        r.fecha,
        r.hora_inicio,
        r.hora_fin,
        r.estatus,
        r.tipo,
        r.observaciones,
        u.nombre as cliente_nombre,
        u.apellido as cliente_apellido,
        u.tipo_cliente,
        c.nombre as caballo_nombre,
        i.nombre as instructora_nombre,
        i.apellido as instructora_apellido,
        cl.nombre as clase_nombre,
        cl.duracion_min
      FROM reservas r
      JOIN usuarios u ON r.cliente_id = u.id
      LEFT JOIN caballos c ON r.caballo_id = c.id
      LEFT JOIN instructoras inst ON r.instructora_id = inst.id
      LEFT JOIN usuarios i ON inst.usuario_id = i.id
      LEFT JOIN clases cl ON r.clase_id = cl.id
      WHERE ${whereClause}
      ORDER BY r.fecha, r.hora_inicio
    `;

    const [rows] = await db.query(query, params);

    if (!semana) {
      router._cacheStore.set(cacheKey, { data: rows, expiresAt: Date.now() + ttlMs });
    }

    res.json(rows);
  } catch (err) {
    console.error('Error obteniendo reservas:', err);
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
});

// Dashboard de estadísticas para administrador
router.get('/admin/dashboard', async (req, res) => {
  try {
    // Reservas del día
    const [reservasHoy] = await db.query(`
      SELECT COUNT(*) as total FROM reservas 
      WHERE fecha = CURDATE()
    `);

    // Reservas por estatus
    const [reservasPorEstatus] = await db.query(`
      SELECT estatus, COUNT(*) as total 
      FROM reservas 
      WHERE fecha >= CURDATE()
      GROUP BY estatus
    `);

    // Instructoras disponibles hoy
    const [instructorasDisponibles] = await db.query(`
      SELECT COUNT(*) as total
      FROM instructoras i
      WHERE i.disponibilidad = 'disponible'
      AND i.id NOT IN (
        SELECT DISTINCT d.instructora_id 
        FROM descansos d 
        WHERE CURDATE() BETWEEN d.fecha_inicio AND d.fecha_fin
      )
    `);

    res.json({
      reservas_hoy: reservasHoy[0].total,
      reservas_por_estatus: reservasPorEstatus,
      instructoras_disponibles: instructorasDisponibles[0].total
    });
  } catch (err) {
    console.error('Error obteniendo dashboard:', err);
    res.status(500).json({ error: 'Error al obtener estadísticas del dashboard' });
  }
});

// Crear reserva manual (administrador)
router.post('/admin/create', async (req, res) => {
  const { 
    cliente_id, 
    caballo_id, 
    instructora_id, 
    clase_id, 
    fecha, 
    hora_inicio, 
    hora_fin, 
    observaciones 
  } = req.body;

  // Validaciones básicas
  if (!cliente_id || !clase_id || !fecha || !hora_inicio || !hora_fin) {
    return res.status(400).json({ 
      error: 'Faltan campos requeridos: cliente_id, clase_id, fecha, hora_inicio, hora_fin' 
    });
  }

  try {
    // Obtener información del cliente
    const [cliente] = await db.query(`
      SELECT tipo_cliente FROM usuarios WHERE id = ?
    `, [cliente_id]);

    if (cliente.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const tipoCliente = cliente[0].tipo_cliente;

    // Si se asigna instructora, verificar disponibilidad
    if (instructora_id) {
      const disponibilidadInstructora = await verificarDisponibilidadInstructora(
        instructora_id, fecha, hora_inicio, hora_fin
      );
      if (!disponibilidadInstructora.disponible) {
        return res.status(400).json({ 
          error: 'Instructora no disponible', 
          razon: disponibilidadInstructora.razon 
        });
      }
    }

    // Si se asigna caballo, verificar disponibilidad
    if (caballo_id) {
      const [clase] = await db.query('SELECT nombre FROM clases WHERE id = ?', [clase_id]);
      const tipoClase = clase.length > 0 ? clase[0].nombre : null;
      
      const disponibilidadCaballo = await verificarDisponibilidadCaballo(
        caballo_id, fecha, hora_inicio, hora_fin, tipoClase
      );
      if (!disponibilidadCaballo.disponible) {
        return res.status(400).json({ 
          error: 'Caballo no disponible', 
          razon: disponibilidadCaballo.razon 
        });
      }
    }

    // Crear la reserva
    const [result] = await db.query(`
      INSERT INTO reservas (
        cliente_id, caballo_id, instructora_id, clase_id, 
        fecha, hora_inicio, hora_fin, estatus, tipo, observaciones
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pendiente', ?, ?)
    `, [
      cliente_id, 
      caballo_id, 
      instructora_id, 
      clase_id,
      formatDateForMySQL(fecha),
      formatTimeForMySQL(hora_inicio),
      formatTimeForMySQL(hora_fin),
      tipoCliente === 'propietario' ? 'propietario' : 
      tipoCliente === 'renta' ? 'renta' :
      tipoCliente === 'media_renta' ? 'media_renta' : 'normal',
      observaciones
    ]);

    res.json({
      message: 'Reserva creada correctamente',
      id: result.insertId
    });
  } catch (err) {
    console.error('Error creando reserva:', err);
    res.status(500).json({ error: 'Error al crear reserva' });
  }
});

// Cambiar estatus de reserva (administrador)
router.put('/admin/:id/status', async (req, res) => {
  const { id } = req.params;
  const { estatus, observaciones } = req.body;

  const estatusValidos = ['pendiente', 'confirmada', 'cancelada', 'completada'];
  if (!estatusValidos.includes(estatus)) {
    return res.status(400).json({ 
      error: `Estatus inválido. Valores permitidos: ${estatusValidos.join(', ')}` 
    });
  }

  try {
    // Si se está cancelando la reserva, también quitar el caballo e instructor asignados
    if (estatus === 'cancelada') {
      const [result] = await db.query(`
        UPDATE reservas 
        SET estatus = ?, observaciones = COALESCE(?, observaciones), caballo_id = NULL, instructora_id = NULL
        WHERE id = ?
      `, [estatus, observaciones, id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Reserva no encontrada' });
      }

      res.json({ 
        message: 'Reserva cancelada correctamente y caballo e instructor liberados',
        caballo_liberado: true,
        instructor_liberado: true
      });
    } else {
      const [result] = await db.query(`
        UPDATE reservas 
        SET estatus = ?, observaciones = COALESCE(?, observaciones)
        WHERE id = ?
      `, [estatus, observaciones, id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Reserva no encontrada' });
      }

      res.json({ message: 'Estatus de reserva actualizado correctamente' });
    }
  } catch (err) {
    console.error('Error actualizando estatus de reserva:', err);
    res.status(500).json({ error: 'Error al actualizar estatus de reserva' });
  }
});

// Agregar observaciones a una reserva (administrador)
router.put('/admin/:reservaId/observations', async (req, res) => {
  const { reservaId } = req.params;
  const { observaciones } = req.body;

  if (!observaciones) {
    return res.status(400).json({ 
      error: 'Campo requerido: observaciones' 
    });
  }

  try {
    // Verificar que la reserva existe
    const [reserva] = await db.query(`
      SELECT observaciones as obs_actuales FROM reservas 
      WHERE id = ?
    `, [reservaId]);

    if (reserva.length === 0) {
      return res.status(404).json({ 
        error: 'Reserva no encontrada' 
      });
    }

    // Agregar nuevas observaciones a las existentes
    const obsActuales = reserva[0].obs_actuales || '';
    const nuevasObservaciones = obsActuales 
      ? `${obsActuales}\n[Admin]: ${observaciones}`
      : `[Admin]: ${observaciones}`;

    await db.query(`
      UPDATE reservas 
      SET observaciones = ?
      WHERE id = ?
    `, [nuevasObservaciones, reservaId]);

    res.json({ 
      message: 'Observaciones agregadas correctamente'
    });
  } catch (err) {
    console.error('Error agregando observaciones:', err);
    res.status(500).json({ error: 'Error al agregar observaciones' });
  }
});

// Registrar asistencia (administrador)
router.put('/admin/:reservaId/attendance', async (req, res) => {
  const { reservaId } = req.params;
  const { asistio, observaciones } = req.body;

  if (asistio === undefined) {
    return res.status(400).json({ 
      error: 'Campo requerido: asistio (true/false)' 
    });
  }

  try {
    // Verificar que la reserva existe
    const [reserva] = await db.query(`
      SELECT id FROM reservas WHERE id = ?
    `, [reservaId]);

    if (reserva.length === 0) {
      return res.status(404).json({ 
        error: 'Reserva no encontrada' 
      });
    }

    // Actualizar estatus y observaciones
    const nuevoEstatus = asistio ? 'completada' : 'cancelada';
    const nuevasObservaciones = asistio ? 
      `[Admin] Clase completada. ${observaciones || ''}` : 
      `[Admin] No asistió. ${observaciones || ''}`;

    // Si no asistió (cancelada), también liberar el caballo e instructor
    if (!asistio) {
      await db.query(`
        UPDATE reservas 
        SET estatus = ?, observaciones = ?, caballo_id = NULL, instructora_id = NULL
        WHERE id = ?
      `, [nuevoEstatus, nuevasObservaciones.trim(), reservaId]);
    } else {
      await db.query(`
        UPDATE reservas 
        SET estatus = ?, observaciones = ?
        WHERE id = ?
      `, [nuevoEstatus, nuevasObservaciones.trim(), reservaId]);
    }

    res.json({ 
      message: asistio ? 'Asistencia registrada correctamente' : 'Ausencia registrada correctamente' 
    });
  } catch (err) {
    console.error('Error registrando asistencia:', err);
    res.status(500).json({ error: 'Error al registrar asistencia' });
  }
});

// =============================================================================
// ENDPOINTS PARA CLIENTES
// =============================================================================

// Obtener reservas del cliente autenticado
router.get('/my-reservations/:clienteId', async (req, res) => {
  const { clienteId } = req.params;

  try {
    // Actualizar reservas pasadas a completadas automáticamente
    await db.query(`
      UPDATE reservas 
      SET estatus = 'completada'
      WHERE cliente_id = ?
      AND estatus IN ('pendiente', 'confirmada')
      AND CONCAT(fecha, ' ', hora_fin) < NOW()
    `, [clienteId]);

    const query = `
      SELECT 
        r.id,
        r.caballo_id,
        r.instructora_id,
        r.clase_id,
        r.fecha,
        r.hora_inicio,
        r.hora_fin,
        r.estatus,
        r.tipo,
        r.observaciones,
        c.nombre as caballo_nombre,
        i.nombre as instructora_nombre,
        i.apellido as instructora_apellido,
        cl.nombre as clase_nombre
      FROM reservas r
      LEFT JOIN caballos c ON r.caballo_id = c.id
      LEFT JOIN instructoras inst ON r.instructora_id = inst.id
      LEFT JOIN usuarios i ON inst.usuario_id = i.id
      LEFT JOIN clases cl ON r.clase_id = cl.id
      WHERE r.cliente_id = ?
      AND r.fecha >= CURDATE()
      ORDER BY r.fecha, r.hora_inicio
    `;

    const [rows] = await db.query(query, [clienteId]);
    res.json(rows);
  } catch (err) {
    console.error('Error obteniendo reservas del cliente:', err);
    res.status(500).json({ error: 'Error al obtener tus reservas' });
  }
});

// Obtener horarios disponibles para reservar
router.get('/available-slots/:clienteId', async (req, res) => {
  const { clienteId } = req.params;
  const { fecha, clase_id } = req.query;

  if (!fecha || !clase_id) {
    return res.status(400).json({ 
      error: 'Parámetros requeridos: fecha y clase_id' 
    });
  }

  try {
    // Obtener información del cliente
    const [cliente] = await db.query(`
      SELECT tipo_cliente FROM usuarios WHERE id = ?
    `, [clienteId]);

    if (cliente.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const tipoCliente = cliente[0].tipo_cliente;

    // Verificar restricciones del cliente
    const restricciones = await verificarRestriccionesCliente(clienteId, fecha, tipoCliente);
    if (!restricciones.permitido) {
      return res.status(403).json({ 
        error: 'No puedes hacer más reservas', 
        razon: restricciones.razon 
      });
    }

    // Obtener información de la clase
    const [clase] = await db.query(`
      SELECT nombre, duracion_min, cupo_max, horario_matutino, horario_vespertino 
      FROM clases WHERE id = ?
    `, [clase_id]);

    if (clase.length === 0) {
      return res.status(404).json({ error: 'Clase no encontrada' });
    }

    const infoClase = clase[0];
    const fechaObj = new Date(fecha);
    const diaSemana = fechaObj.getDay(); // 0 = domingo, 6 = sábado

    // Generar horarios según la clase y día de la semana
    let horariosDisponibles = [];

    // Lógica específica por tipo de clase
    switch (infoClase.nombre) {
      case 'iniciacion':
        // Matutino: 7:30-10:30, Vespertino: 3:00-4:30 (no sábados/domingos tarde)
        if (diaSemana >= 1 && diaSemana <= 5) { // Lunes a viernes
          horariosDisponibles = [
            '07:30:00', '08:00:00', '08:30:00', '09:00:00', '09:30:00', '10:00:00',
            '15:00:00', '15:30:00', '16:00:00', '16:30:00'
          ];
        } else if (diaSemana === 6) { // Sábado
          horariosDisponibles = ['07:30:00', '08:00:00', '08:30:00', '09:00:00', '09:30:00'];
        } else { // Domingo
          horariosDisponibles = ['07:30:00', '08:00:00', '08:30:00', '09:00:00', '09:30:00'];
        }
        break;

      case 'intermedio':
        // Horario 5pm + matutinos específicos
        if (diaSemana >= 1 && diaSemana <= 5) { // Lunes a viernes
          horariosDisponibles = ['08:00:00', '09:00:00', '10:00:00', '17:00:00'];
        } else { // Sábados y domingos
          horariosDisponibles = ['08:00:00', '09:00:00', '10:00:00'];
        }
        break;

      case 'paseo':
        // Lun-Vie: 8AM-12PM, Vespertino: 4-5PM
        if (diaSemana >= 1 && diaSemana <= 5) {
          horariosDisponibles = [
            '08:00:00', '09:00:00', '10:00:00', '11:00:00', '12:00:00',
            '16:00:00', '17:00:00'
          ];
        } else {
          horariosDisponibles = ['08:00:00', '09:00:00', '10:00:00', '11:00:00', '12:00:00'];
        }
        break;

      case 'salto':
        // Solo horario 5pm + matutino 8-10AM
        if (diaSemana >= 1 && diaSemana <= 5) {
          horariosDisponibles = ['08:00:00', '09:00:00', '10:00:00', '17:00:00'];
        } else {
          horariosDisponibles = ['08:00:00', '09:00:00', '10:00:00'];
        }
        break;

      default:
        horariosDisponibles = ['08:00:00', '10:00:00', '15:00:00', '17:00:00'];
    }

    // Filtrar horarios ocupados
    const horariosLibres = [];
    for (const hora of horariosDisponibles) {
      const horaFin = new Date(`2000-01-01 ${hora}`);
      horaFin.setMinutes(horaFin.getMinutes() + infoClase.duracion_min);
      const horaFinStr = horaFin.toTimeString().slice(0, 8);

      // Verificar cupo disponible
      const [reservasExistentes] = await db.query(`
        SELECT COUNT(*) as ocupadas FROM reservas
        WHERE fecha = ? AND clase_id = ?
        AND hora_inicio = ? 
        AND estatus IN ('pendiente', 'confirmada')
      `, [formatDateForMySQL(fecha), clase_id, hora]);

      if (reservasExistentes[0].ocupadas < infoClase.cupo_max) {
        horariosLibres.push({
          hora_inicio: hora,
          hora_fin: horaFinStr,
          espacios_disponibles: infoClase.cupo_max - reservasExistentes[0].ocupadas
        });
      }
    }

    res.json({
      clase: infoClase.nombre,
      fecha: fecha,
      horarios_disponibles: horariosLibres
    });
  } catch (err) {
    console.error('Error obteniendo horarios disponibles:', err);
    res.status(500).json({ error: 'Error al obtener horarios disponibles' });
  }
});

// Hacer nueva reserva (cliente)
router.post('/book', async (req, res) => {
  const { cliente_id, clase_id, fecha, hora_inicio } = req.body;

  if (!cliente_id || !clase_id || !fecha || !hora_inicio) {
    return res.status(400).json({ 
      error: 'Faltan campos requeridos: cliente_id, clase_id, fecha, hora_inicio' 
    });
  }

  try {
    // Verificar que la reserva sea al menos 2 horas antes (zona horaria Cancún)
    // Requiere: npm install luxon
    const ahora = DateTime.now().setZone('America/Cancun');
    const [year, month, day] = fecha.split('-').map(Number);
    const [hora, minuto, segundo = '00'] = hora_inicio.split(':');
    const fechaHoraReserva = DateTime.fromObject({
      year,
      month,
      day,
      hour: Number(hora),
      minute: Number(minuto),
      second: Number(segundo)
    }, { zone: 'America/Cancun' });
    const diferenciaHoras = fechaHoraReserva.diff(ahora, 'hours').hours;

    // Log para debugging - SIEMPRE se ejecuta
    console.log('\n=== VALIDACIÓN DE RESERVA ===');
    console.log('Cliente ID:', cliente_id);
    console.log('Clase ID:', clase_id);
    console.log('Fecha recibida:', fecha);
    console.log('Hora inicio recibida:', hora_inicio);
    console.log('---');
    console.log('Hora actual (Cancún):', ahora.toISO());
    console.log('Hora actual (readable):', ahora.toFormat('yyyy-MM-dd HH:mm:ss'));
    console.log('---');
    console.log('Hora de la reserva (Cancún):', fechaHoraReserva.toISO());
    console.log('Hora de la reserva (readable):', fechaHoraReserva.toFormat('yyyy-MM-dd HH:mm:ss'));
    console.log('---');
    console.log('Diferencia en horas:', diferenciaHoras.toFixed(2));
    console.log('¿Pasa validación? (>= 2):', diferenciaHoras >= 2);
    console.log('=============================\n');

    if (diferenciaHoras < 2) {
      return res.status(400).json({ 
        error: 'Las reservas deben hacerse al menos 2 horas antes (horario Cancún)' 
      });
    }

    // Obtener información del cliente
    const [cliente] = await db.query(`
      SELECT tipo_cliente FROM usuarios WHERE id = ?
    `, [cliente_id]);

    if (cliente.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const tipoCliente = cliente[0].tipo_cliente;

    // Verificar restricciones del cliente
    const restricciones = await verificarRestriccionesCliente(cliente_id, fecha, tipoCliente);
    if (!restricciones.permitido) {
      return res.status(403).json({ 
        error: 'No puedes hacer más reservas', 
        razon: restricciones.razon 
      });
    }

    // Obtener información de la clase
    const [clase] = await db.query(`
      SELECT nombre, duracion_min, cupo_max FROM clases WHERE id = ?
    `, [clase_id]);

    if (clase.length === 0) {
      return res.status(404).json({ error: 'Clase no encontrada' });
    }

    const infoClase = clase[0];

    // Calcular hora de fin
    const horaFinObj = new Date(`2000-01-01 ${hora_inicio}`);
    horaFinObj.setMinutes(horaFinObj.getMinutes() + infoClase.duracion_min);
    const hora_fin = horaFinObj.toTimeString().slice(0, 8);

    // Verificar cupo disponible
    const [reservasExistentes] = await db.query(`
      SELECT COUNT(*) as ocupadas FROM reservas
      WHERE fecha = ? AND clase_id = ?
      AND hora_inicio = ? 
      AND estatus IN ('pendiente', 'confirmada')
    `, [formatDateForMySQL(fecha), clase_id, hora_inicio]);

    if (reservasExistentes[0].ocupadas >= infoClase.cupo_max) {
      return res.status(400).json({ 
        error: 'No hay espacios disponibles en este horario' 
      });
    }

    // ===================== ASIGNACIÓN AUTOMÁTICA DE INSTRUCTORA =====================
    // Buscar instructoras aptas para la clase, disponibles y sin conflicto de horario
    // Prioridades de asignación:
    // 1. Instructora que YA tenga reserva en este mismo horario Y MISMA CLASE (para agrupar alumnos)
    // 2. Primera reserva del horario: asignación ALEATORIA entre instructoras disponibles
    // 3. Instructora SIN clases consecutivas (para dar descanso)
    // 4. Menor número de reservas en la semana (balanceo de carga)
    // IMPORTANTE: Una instructora NO puede tener dos clases al mismo tiempo (aunque sean de diferente categoría)

    // Primero: buscar si hay una instructora que ya tiene reserva en ESTE HORARIO Y ESTA CLASE exacta
    const [instructoraActual] = await db.query(`
      SELECT DISTINCT r.instructora_id, COUNT(*) as alumnos_en_slot
      FROM reservas r
      JOIN instructoras i ON r.instructora_id = i.id
      JOIN instructora_clase ic ON i.id = ic.instructora_id AND ic.clase_id = ? AND ic.activo = 1
      WHERE r.fecha = ?
        AND r.hora_inicio = ?
        AND r.clase_id = ?
        AND r.estatus IN ('pendiente','confirmada')
        AND i.disponibilidad = 'disponible'
        AND r.instructora_id NOT IN (
          SELECT d.instructora_id FROM descansos d WHERE ? BETWEEN d.fecha_inicio AND d.fecha_fin
        )
      GROUP BY r.instructora_id
      HAVING alumnos_en_slot < ?
      LIMIT 1
    `, [clase_id, formatDateForMySQL(fecha), formatTimeForMySQL(hora_inicio), clase_id, fecha, infoClase.cupo_max]);

    let instructora_id = null;

    // Si hay una instructora que ya tiene alumnos en este slot y clase específica, asignarle
    if (instructoraActual.length > 0) {
      instructora_id = instructoraActual[0].instructora_id;
      console.log(`✅ Asignando a instructora existente en el slot (tiene ${instructoraActual[0].alumnos_en_slot} alumnos)`);
    } else {
      // Si no hay nadie en el slot, buscar TODAS las instructoras disponibles
      // EXCLUIR instructoras que YA tengan CUALQUIER clase en este horario (sin importar categoría)
      const [candidatas] = await db.query(`
        SELECT i.id as instructora_id, i.nombre, i.apellido,
          (SELECT COUNT(*) FROM reservas r2 
           WHERE r2.instructora_id = i.id 
             AND r2.fecha BETWEEN DATE_SUB(?, INTERVAL WEEKDAY(?) DAY) 
             AND DATE_ADD(DATE_SUB(?, INTERVAL WEEKDAY(?) DAY), INTERVAL 6 DAY) 
             AND r2.estatus IN ('pendiente','confirmada')) as reservas_semana,
          (SELECT COUNT(*) FROM reservas r3
           WHERE r3.instructora_id = i.id
             AND r3.fecha = ?
             AND (r3.hora_fin = ? OR r3.hora_inicio = ?)
             AND r3.estatus IN ('pendiente','confirmada')) as clases_consecutivas
        FROM instructoras i
        JOIN instructora_clase ic ON i.id = ic.instructora_id AND ic.clase_id = ? AND ic.activo = 1
        WHERE i.disponibilidad = 'disponible'
          AND i.id NOT IN (
            SELECT d.instructora_id FROM descansos d WHERE ? BETWEEN d.fecha_inicio AND d.fecha_fin
          )
          AND i.id NOT IN (
            SELECT r.instructora_id FROM reservas r 
            WHERE r.fecha = ?
              AND r.hora_inicio = ?
              AND r.estatus IN ('pendiente','confirmada')
          )
        ORDER BY clases_consecutivas ASC, reservas_semana ASC, i.id ASC
      `, [
        fecha, fecha, fecha, fecha, // para calcular semana de la reserva
        fecha, hora_inicio, hora_fin, // para detectar clases consecutivas
        clase_id,
        fecha,
        fecha,
        hora_inicio
      ]);

      if (candidatas.length > 0) {
        // 🎲 SELECCIÓN ALEATORIA para la primera reserva del horario
        // Filtrar instructoras sin clases consecutivas primero (prioridad)
        const sinConsecutivas = candidatas.filter(c => c.clases_consecutivas === 0);
        const pool = sinConsecutivas.length > 0 ? sinConsecutivas : candidatas;
        
        // Seleccionar aleatoriamente del pool
        const randomIndex = Math.floor(Math.random() * pool.length);
        const instructoraSeleccionada = pool[randomIndex];
        
        instructora_id = instructoraSeleccionada.instructora_id;
        console.log(`🎲 Primera reserva del horario - Asignación ALEATORIA a ${instructoraSeleccionada.nombre} ${instructoraSeleccionada.apellido} (${randomIndex + 1}/${pool.length} disponibles, consecutivas: ${instructoraSeleccionada.clases_consecutivas})`);
      }
    }

    if (!instructora_id) {
      return res.status(400).json({
        error: 'No hay instructoras disponibles para este horario',
        razon: 'Todas las instructoras aptas están ocupadas, en descanso o no pueden impartir esta clase.'
      });
    }

    // Crear la reserva con instructora asignada
    const [result] = await db.query(`
      INSERT INTO reservas (
        cliente_id, instructora_id, clase_id, fecha, hora_inicio, hora_fin, 
        estatus, tipo
      ) VALUES (?, ?, ?, ?, ?, ?, 'pendiente', ?)
    `, [
      cliente_id,
      instructora_id,
      clase_id,
      formatDateForMySQL(fecha),
      formatTimeForMySQL(hora_inicio),
      formatTimeForMySQL(hora_fin),
      tipoCliente === 'propietario' ? 'propietario' : 
      tipoCliente === 'renta' ? 'renta' :
      tipoCliente === 'media_renta' ? 'media_renta' : 'normal'
    ]);

    res.json({
      message: 'Reserva creada correctamente',
      id: result.insertId,
      instructora_id,
      nota: 'Instructora asignada automáticamente'
    });
  } catch (err) {
    console.error('Error creando reserva:', err);
    res.status(500).json({ error: 'Error al crear reserva' });
  }
});

// Obtener todas las reservas de una semana (para calcular disponibilidad)
router.get('/week', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, cliente_id } = req.query;
    
    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({ error: 'Se requieren fecha_inicio y fecha_fin' });
    }

    // Si se proporciona cliente_id, actualizar sus reservas pasadas a completadas
    if (cliente_id) {
      await db.query(`
        UPDATE reservas 
        SET estatus = 'completada'
        WHERE cliente_id = ?
        AND estatus IN ('pendiente', 'confirmada')
        AND CONCAT(fecha, ' ', hora_fin) < NOW()
      `, [cliente_id]);
    }

    const query = `
      SELECT 
        r.id,
        r.cliente_id,
        r.clase_id,
        r.caballo_id,
        r.fecha,
        r.hora_inicio,
        r.hora_fin,
        r.estatus,
        c.nombre as caballo_nombre,
        i.nombre as instructora_nombre,
        i.apellido as instructora_apellido,
        cl.nombre as clase_nombre,
        cl.cupo_max
      FROM reservas r
      LEFT JOIN clases cl ON r.clase_id = cl.id
      LEFT JOIN caballos c ON r.caballo_id = c.id
      LEFT JOIN instructoras inst ON r.instructora_id = inst.id
      LEFT JOIN usuarios i ON inst.usuario_id = i.id
      WHERE r.fecha BETWEEN ? AND ?
      ORDER BY r.fecha, r.hora_inicio
    `;

    const [rows] = await db.query(query, [formatDateForMySQL(fecha_inicio), formatDateForMySQL(fecha_fin)]);
    res.json(rows);
  } catch (err) {
    console.error('Error obteniendo reservas de la semana:', err);
    res.status(500).json({ error: 'Error al obtener reservas de la semana' });
  }
});

// Obtener clientes con tipo_cliente 'propietario'
router.get('/propietarios', async (req, res) => {
  try {
    const query = `
      SELECT 
        id, 
        nombre, 
        apellido, 
        correo, 
        estatus 
      FROM usuarios 
      WHERE rol = 'cliente' 
        AND tipo_cliente = 'propietario' 
      ORDER BY nombre, apellido
    `;
    
    const [rows] = await db.query(query);
    
    // Asegurar que siempre devolvamos un array
    res.json(Array.isArray(rows) ? rows : []);
  } catch (err) {
    console.error('Error al obtener propietarios:', err);
    console.error('Stack trace:', err.stack);
    console.error('Error SQL:', err.sql);
    res.status(500).json({ 
      error: 'Error al obtener propietarios',
      details: err.message 
    });
  }
});

// Cancelar reserva (cliente)
router.put('/:id/cancel/:clienteId', async (req, res) => {
  const { id, clienteId } = req.params;

  try {
    // Verificar que la reserva pertenece al cliente
    const [reserva] = await db.query(`
      SELECT fecha, hora_inicio, estatus FROM reservas 
      WHERE id = ? AND cliente_id = ?
    `, [id, clienteId]);

    if (reserva.length === 0) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    const infoReserva = reserva[0];

    // Verificar que la reserva se puede cancelar (2 horas antes)
    const ahora = new Date();
    const fechaHoraReserva = new Date(`${infoReserva.fecha} ${infoReserva.hora_inicio}`);
    const diferenciaHoras = (fechaHoraReserva - ahora) / (1000 * 60 * 60);

    if (diferenciaHoras < 2) {
      return res.status(400).json({ 
        error: 'Las reservas solo se pueden cancelar al menos 2 horas antes' 
      });
    }

    if (infoReserva.estatus === 'cancelada' || infoReserva.estatus === 'cancelada_instructor') {
      return res.status(400).json({ error: 'La reserva ya está cancelada' });
    }

    if (infoReserva.estatus === 'completada') {
      return res.status(400).json({ error: 'No se puede cancelar una reserva completada' });
    }

    // Determinar estatus de cancelación
    let nuevoEstatus = 'cancelada';
    if (req.body && req.body.estatus && req.body.estatus === 'cancelada_instructor') {
      nuevoEstatus = 'cancelada_instructor';
    }

    // Cancelar la reserva y liberar el caballo e instructor
    await db.query(`
      UPDATE reservas SET estatus = ?, caballo_id = NULL, instructora_id = NULL WHERE id = ?
    `, [nuevoEstatus, id]);

    res.json({ 
      message: `Reserva cancelada correctamente${nuevoEstatus === 'cancelada_instructor' ? ' por instructor' : ''}`,
      caballo_liberado: true,
      instructor_liberado: true
    });
  } catch (err) {
    console.error('Error cancelando reserva:', err);
    res.status(500).json({ error: 'Error al cancelar reserva' });
  }
});

// =============================================================================
// ENDPOINTS PARA INSTRUCTORAS
// =============================================================================

// Crear reserva manual (instructora)
router.post('/instructor/create', async (req, res) => {
  const { 
    cliente_id, 
    caballo_id, 
    instructora_id, 
    clase_id, 
    fecha, 
    hora_inicio, 
    hora_fin, 
    observaciones 
  } = req.body;

  // Validaciones básicas
  if (!cliente_id || !clase_id || !fecha || !hora_inicio || !hora_fin || !instructora_id) {
    return res.status(400).json({ 
      error: 'Faltan campos requeridos: cliente_id, clase_id, fecha, hora_inicio, hora_fin, instructora_id' 
    });
  }

  try {
    // Obtener información del cliente
    const [cliente] = await db.query(`
      SELECT tipo_cliente FROM usuarios WHERE id = ?
    `, [cliente_id]);

    if (cliente.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const tipoCliente = cliente[0].tipo_cliente;

    // Verificar disponibilidad de la instructora
    const disponibilidadInstructora = await verificarDisponibilidadInstructora(
      instructora_id, fecha, hora_inicio, hora_fin
    );
    if (!disponibilidadInstructora.disponible) {
      return res.status(400).json({ 
        error: 'No estás disponible en ese horario', 
        razon: disponibilidadInstructora.razon 
      });
    }

    // Si se asigna caballo, verificar disponibilidad
    if (caballo_id) {
      const [clase] = await db.query('SELECT nombre FROM clases WHERE id = ?', [clase_id]);
      const tipoClase = clase.length > 0 ? clase[0].nombre : null;
      
      const disponibilidadCaballo = await verificarDisponibilidadCaballo(
        caballo_id, fecha, hora_inicio, hora_fin, tipoClase
      );
      if (!disponibilidadCaballo.disponible) {
        return res.status(400).json({ 
          error: 'Caballo no disponible', 
          razon: disponibilidadCaballo.razon 
        });
      }
    }

    // Crear la reserva
    const observacionesCompletas = observaciones 
      ? `[Instructora]: ${observaciones}` 
      : null;

    const [result] = await db.query(`
      INSERT INTO reservas (
        cliente_id, caballo_id, instructora_id, clase_id, 
        fecha, hora_inicio, hora_fin, estatus, tipo, observaciones
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pendiente', ?, ?)
    `, [
      cliente_id, 
      caballo_id, 
      instructora_id, 
      clase_id,
      formatDateForMySQL(fecha),
      formatTimeForMySQL(hora_inicio),
      formatTimeForMySQL(hora_fin),
      tipoCliente === 'propietario' ? 'propietario' : 
      tipoCliente === 'renta' ? 'renta' :
      tipoCliente === 'media_renta' ? 'media_renta' : 'normal',
      observacionesCompletas
    ]);

    res.json({
      message: 'Reserva creada correctamente',
      id: result.insertId
    });
  } catch (err) {
    console.error('Error creando reserva:', err);
    res.status(500).json({ error: 'Error al crear reserva' });
  }
});

// Obtener clases asignadas a la instructora
router.get('/instructor/my-classes/:instructoraId', async (req, res) => {
  const { instructoraId } = req.params;
  const { fecha } = req.query;

  try {
    let whereClause = 'r.instructora_id = ?';
    let params = [instructoraId];

    if (fecha) {
      whereClause += ' AND r.fecha = ?';
      params.push(formatDateForMySQL(fecha));
    } else {
      whereClause += ' AND r.fecha >= CURDATE()';
    }

    const query = `
      SELECT 
        r.id,
        r.fecha,
        r.hora_inicio,
        r.hora_fin,
        r.estatus,
        r.observaciones,
        u.nombre as cliente_nombre,
        u.apellido as cliente_apellido,
        c.nombre as caballo_nombre,
        cl.nombre as clase_nombre
      FROM reservas r
      JOIN usuarios u ON r.cliente_id = u.id
      LEFT JOIN caballos c ON r.caballo_id = c.id
      LEFT JOIN clases cl ON r.clase_id = cl.id
      WHERE ${whereClause}
      ORDER BY r.fecha, r.hora_inicio
    `;

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error obteniendo clases de instructora:', err);
    res.status(500).json({ error: 'Error al obtener tus clases' });
  }
});

// Asignar caballo a reserva (SOLO instructora)
router.put('/instructor/:reservaId/assign-horse', async (req, res) => {
  const { reservaId } = req.params;
  const { caballo_id, instructora_id } = req.body;

  if (!instructora_id) {
    return res.status(400).json({ 
      error: 'Falta campo requerido: instructora_id' 
    });
  }

  try {
    // Verificar que la reserva existe y pertenece a la instructora
    const [reserva] = await db.query(`
      SELECT fecha, hora_inicio, hora_fin, clase_id FROM reservas 
      WHERE id = ? AND instructora_id = ?
    `, [reservaId, instructora_id]);

    if (reserva.length === 0) {
      return res.status(404).json({ 
        error: 'Reserva no encontrada o no tienes permisos para modificarla' 
      });
    }

    const infoReserva = reserva[0];

    if (caballo_id) {
      // Obtener tipo de clase para verificar descansos
      const [clase] = await db.query('SELECT nombre FROM clases WHERE id = ?', [infoReserva.clase_id]);
      const tipoClase = clase.length > 0 ? clase[0].nombre : null;

      // Verificar disponibilidad del caballo
      const disponibilidad = await verificarDisponibilidadCaballo(
        caballo_id, 
        infoReserva.fecha, 
        infoReserva.hora_inicio, 
        infoReserva.hora_fin, 
        tipoClase
      );

      if (!disponibilidad.disponible) {
        return res.status(400).json({ 
          error: 'Caballo no disponible', 
          razon: disponibilidad.razon 
        });
      }

      // Obtener cooldown de la nueva clase
      const cooldownNuevaClase = tipoClase ? (
        ['iniciacion', 'paseo'].includes(tipoClase.toLowerCase()) ? 0 :
        tipoClase.toLowerCase() === 'intermedio' ? 2 :
        ['salto', 'avanzado'].includes(tipoClase.toLowerCase()) ? 3 : 0
      ) : 0;

      // Verificar conflictos con otras clases donde el caballo ya está asignado
      // (solapamiento directo o cooldown que choca)
      // Normalizar fecha a formato YYYY-MM-DD
      const fechaNormalizada = infoReserva.fecha instanceof Date 
        ? infoReserva.fecha.toISOString().split('T')[0]
        : typeof infoReserva.fecha === 'string' 
          ? infoReserva.fecha.split('T')[0]
          : infoReserva.fecha;

      console.log('🔍 Verificando conflictos para:', {
        caballo_id,
        fecha: infoReserva.fecha,
        fechaNormalizada,
        reservaId,
        hora_inicio: infoReserva.hora_inicio,
        hora_fin: infoReserva.hora_fin,
        tipoClase,
        cooldownNuevaClase
      });

      // Primero verificar qué reservas tiene este caballo asignado
      const [reservasCaballo] = await db.query(`
        SELECT r.id, r.hora_inicio, r.hora_fin, cl.nombre as tipo_clase
        FROM reservas r
        JOIN clases cl ON cl.id = r.clase_id
        WHERE r.caballo_id = ?
          AND DATE(r.fecha) = ?
          AND r.id <> ?
          AND r.estatus IN ('pendiente','confirmada','completada')
      `, [caballo_id, fechaNormalizada, reservaId]);
      console.log('🔍 Reservas encontradas con este caballo:', reservasCaballo);

      // Verificar manualmente si hay conflictos para debugging
      if (reservasCaballo.length > 0) {
        reservasCaballo.forEach(reserva => {
          const horaInicioReserva = reserva.hora_inicio;
          const horaFinReserva = reserva.hora_fin;
          const horaFinNueva = infoReserva.hora_fin;
          const cooldownFin = `DATE_ADD('${horaFinNueva}', INTERVAL ${cooldownNuevaClase} HOUR)`;
          
          console.log('🔍 Verificando conflicto manualmente:', {
            reservaId: reserva.id,
            reservaHoraInicio: horaInicioReserva,
            reservaHoraFin: horaFinReserva,
            nuevaHoraFin: horaFinNueva,
            cooldown: cooldownNuevaClase,
            cooldownFin: cooldownFin,
            verificacion1: `${horaInicioReserva} >= ${horaFinNueva} = ${horaInicioReserva >= horaFinNueva}`,
            verificacion2: `${horaInicioReserva} < DATE_ADD(${horaFinNueva}, INTERVAL ${cooldownNuevaClase} HOUR)`
          });
        });
      }

      const [conflictos] = await db.query(`
        SELECT 
          r.id,
          r.hora_inicio,
          r.hora_fin,
          cl.nombre as tipo_clase,
          u.nombre as alumno_nombre,
          u.apellido as alumno_apellido
        FROM reservas r
        JOIN clases cl ON cl.id = r.clase_id
        LEFT JOIN usuarios u ON u.id = r.cliente_id
        WHERE r.caballo_id = ?
          AND DATE(r.fecha) = ?
          AND r.id <> ?
          AND r.estatus IN ('pendiente','confirmada','completada')
          AND (
            -- Solapamiento directo de horarios
            (r.hora_inicio < ? AND r.hora_fin > ?)
            OR
            -- Cooldown de la otra clase se solapa con esta clase
            (
              ? >= r.hora_fin
              AND ? < DATE_ADD(r.hora_fin, INTERVAL 
                CASE 
                  WHEN LOWER(cl.nombre) IN ('iniciacion', 'paseo') THEN 0
                  WHEN LOWER(cl.nombre) = 'intermedio' THEN 2
                  WHEN LOWER(cl.nombre) IN ('salto', 'avanzado') THEN 3
                  ELSE 0
                END HOUR)
            )
            OR
            -- Cooldown de esta clase se solapa con la otra clase
            -- El cooldown de esta clase va desde hora_fin hasta hora_fin + cooldown
            -- Verificamos si la otra clase empieza o termina dentro del cooldown, o si se solapa completamente
            -- Usamos TIME_TO_SEC para comparar correctamente
            (
              (TIME_TO_SEC(r.hora_inicio) >= TIME_TO_SEC(?) 
               AND TIME_TO_SEC(r.hora_inicio) < TIME_TO_SEC(?) + (? * 3600))
              OR
              (TIME_TO_SEC(r.hora_fin) > TIME_TO_SEC(?) 
               AND TIME_TO_SEC(r.hora_fin) <= TIME_TO_SEC(?) + (? * 3600))
              OR
              (TIME_TO_SEC(r.hora_inicio) < TIME_TO_SEC(?) 
               AND TIME_TO_SEC(r.hora_fin) > TIME_TO_SEC(?) + (? * 3600))
            )
          )
        LIMIT 1
      `, [
        caballo_id,
        fechaNormalizada,
        reservaId,
        infoReserva.hora_fin, // para solapamiento
        infoReserva.hora_inicio, // para solapamiento
        infoReserva.hora_inicio, // para cooldown de otra clase
        infoReserva.hora_fin, // para cooldown de otra clase
        infoReserva.hora_fin, // para cooldown de esta clase - verificación 1: hora_inicio >= hora_fin
        infoReserva.hora_fin, // para cooldown de esta clase - verificación 1: hora_inicio < hora_fin + cooldown
        cooldownNuevaClase, // para cooldown de esta clase - verificación 1: cooldown
        infoReserva.hora_fin, // para cooldown de esta clase - verificación 2: hora_fin > hora_fin
        infoReserva.hora_fin, // para cooldown de esta clase - verificación 2: hora_fin <= hora_fin + cooldown
        cooldownNuevaClase, // para cooldown de esta clase - verificación 2: cooldown
        infoReserva.hora_fin, // para cooldown de esta clase - verificación 3: hora_inicio < hora_fin
        infoReserva.hora_fin, // para cooldown de esta clase - verificación 3: hora_fin > hora_fin + cooldown
        cooldownNuevaClase // para cooldown de esta clase - verificación 3: cooldown
      ]);

      console.log('🔍 Resultado de verificación de conflictos:', {
        conflictosEncontrados: conflictos.length,
        conflictos: conflictos
      });

      if (conflictos.length > 0) {
        const conflicto = conflictos[0];
        const alumno = `${conflicto.alumno_nombre || ''} ${conflicto.alumno_apellido || ''}`.trim() || 'otra clase';
        return res.status(400).json({
          error: 'Conflicto de horario detectado',
          warning: true,
          mensaje: `Este caballo ya está asignado a ${alumno} (${conflicto.tipo_clase}, ${conflicto.hora_inicio.substring(0,5)}-${conflicto.hora_fin.substring(0,5)}). El cooldown podría chocar con esta clase.`,
          conflicto: {
            reserva_id: conflicto.id,
            hora: `${conflicto.hora_inicio.substring(0,5)}-${conflicto.hora_fin.substring(0,5)}`,
            tipo: conflicto.tipo_clase
          }
        });
      } else {
        console.log('✅ No se encontraron conflictos, procediendo con la asignación');
      }
    }

    // Asignar (o remover) el caballo
    await db.query(`
      UPDATE reservas SET caballo_id = ? WHERE id = ?
    `, [caballo_id || null, reservaId]);

    // Devolver la reserva actualizada
    const [rows] = await db.query(`
      SELECT 
        r.id, r.fecha AS date,
        DATE_FORMAT(r.hora_inicio, '%H:%i') AS time,
        r.estatus AS status,
        u.nombre AS student, u.edad AS studentAge, u.tipo_nivel AS studentLevel,
        cl.nombre AS type,
        cab.nombre AS caballo_nombre
      FROM reservas r
      LEFT JOIN usuarios u ON u.id = r.cliente_id
      LEFT JOIN clases cl ON cl.id = r.clase_id
      LEFT JOIN caballos cab ON cab.id = r.caballo_id
      WHERE r.id = ?
    `, [reservaId]);

    res.json(rows[0] || { message: 'Caballo asignado correctamente a la reserva' });
  } catch (err) {
    console.error('Error asignando caballo:', err);
    res.status(500).json({ error: 'Error al asignar caballo' });
  }
});

// Marcar asistencia
router.put('/instructor/:reservaId/attendance', async (req, res) => {
  const { reservaId } = req.params;
  const { asistio, observaciones, instructora_id, nivel_clase, nuevo_nivel } = req.body;

  if (asistio === undefined || !instructora_id) {
    return res.status(400).json({ 
      error: 'Faltan campos requeridos: asistio (true/false), instructora_id' 
    });
  }

  try {
    // Verificar que la reserva pertenece a la instructora y obtener información del cliente
    const [reserva] = await db.query(`
      SELECT id, cliente_id FROM reservas 
      WHERE id = ? AND instructora_id = ?
    `, [reservaId, instructora_id]);

    if (reserva.length === 0) {
      return res.status(404).json({ 
        error: 'Reserva no encontrada o no tienes permisos para modificarla' 
      });
    }

    const clienteId = reserva[0].cliente_id;

    // Actualizar estatus y observaciones
    const nuevoEstatus = asistio ? 'completada' : 'cancelada';
    const nuevasObservaciones = asistio ? 
      `Clase completada. ${observaciones || ''}` : 
      `No asistió. ${observaciones || ''}`;

    // Si no asistió (cancelada), también liberar el caballo e instructor
    if (!asistio) {
      await db.query(`
        UPDATE reservas 
        SET estatus = ?, observaciones = ?, caballo_id = NULL, instructora_id = NULL
        WHERE id = ?
      `, [nuevoEstatus, nuevasObservaciones.trim(), reservaId]);
    } else {
      await db.query(`
        UPDATE reservas 
        SET estatus = ?, observaciones = ?
        WHERE id = ?
      `, [nuevoEstatus, nuevasObservaciones.trim(), reservaId]);
    }

    // Si asistió, guardar/actualizar en la tabla asistencias con el nivel de la clase
    if (asistio) {
      const asistenciaValue = 'presente';
      
      // Verificar si ya existe un registro de asistencia para esta reserva
      const [existingAsistencia] = await db.query(
        "SELECT * FROM asistencias WHERE reserva_id = ?", 
        [reservaId]
      );

      if (existingAsistencia.length > 0) {
        // Actualizar registro existente con el nivel de la clase
        if (nivel_clase) {
          await db.query(
            "UPDATE asistencias SET asistio = ?, nivel_clase = ?, registrado_en = NOW() WHERE reserva_id = ?",
            [asistenciaValue, nivel_clase, reservaId]
          );
        } else {
          await db.query(
            "UPDATE asistencias SET asistio = ?, registrado_en = NOW() WHERE reserva_id = ?",
            [asistenciaValue, reservaId]
          );
        }
        console.log(`✅ Asistencia actualizada para reserva ${reservaId} con nivel: ${nivel_clase || 'sin nivel'}`);
      } else {
        // Crear nuevo registro de asistencia con el nivel de la clase
        if (nivel_clase) {
          await db.query(
            "INSERT INTO asistencias (reserva_id, instructora_id, asistio, nivel_clase, registrado_en) VALUES (?, ?, ?, ?, NOW())",
            [reservaId, instructora_id, asistenciaValue, nivel_clase]
          );
        } else {
          await db.query(
            "INSERT INTO asistencias (reserva_id, instructora_id, asistio, registrado_en) VALUES (?, ?, ?, NOW())",
            [reservaId, instructora_id, asistenciaValue]
          );
        }
        console.log(`✅ Nueva asistencia creada para reserva ${reservaId} con nivel: ${nivel_clase || 'sin nivel'}`);
      }
    }

    // Si se proporcionó un nuevo nivel, actualizar el nivel del cliente
    if (nuevo_nivel && clienteId) {
      // Validar que el nuevo nivel sea válido
      const nivelesValidos = ['paseo', 'iniciacion', 'intermedio', 'avanzado'];
      if (nivelesValidos.includes(nuevo_nivel)) {
        await db.query(
          "UPDATE usuarios SET tipo_nivel = ? WHERE id = ?",
          [nuevo_nivel, clienteId]
        );
        console.log(`✅ Nivel del cliente ${clienteId} actualizado a: ${nuevo_nivel}`);
      } else {
        console.warn(`⚠️ Nivel no válido: ${nuevo_nivel}`);
      }
    }

    // Devolver la reserva actualizada
    const [rows] = await db.query(`
      SELECT 
        r.id, r.fecha AS date,
        DATE_FORMAT(r.hora_inicio, '%H:%i') AS time,
        r.estatus AS status,
        u.nombre AS student, u.edad AS studentAge, u.tipo_nivel AS studentLevel,
        cl.nombre AS type,
        cab.nombre AS caballo_nombre
      FROM reservas r
      LEFT JOIN usuarios u ON u.id = r.cliente_id
      LEFT JOIN clases cl ON cl.id = r.clase_id
      LEFT JOIN caballos cab ON cab.id = r.caballo_id
      WHERE r.id = ?
    `, [reservaId]);

    res.json(rows[0] || { 
      message: asistio ? 'Asistencia registrada correctamente' : 'Ausencia registrada correctamente y caballo liberado',
      caballo_liberado: !asistio,
      nivel_actualizado: nuevo_nivel || false
    });
  } catch (err) {
    console.error('Error registrando asistencia:', err);
    res.status(500).json({ error: 'Error al registrar asistencia' });
  }
});

// Cambiar estatus de reserva con observaciones (instructora)
router.put('/instructor/:reservaId/status', async (req, res) => {
  const { reservaId } = req.params;
  const { estatus, observaciones, instructora_id } = req.body;

  const estatusValidos = ['pendiente', 'confirmada', 'cancelada', 'completada'];
  if (!estatusValidos.includes(estatus)) {
    return res.status(400).json({ 
      error: `Estatus inválido. Valores permitidos: ${estatusValidos.join(', ')}` 
    });
  }

  if (!instructora_id) {
    return res.status(400).json({ 
      error: 'Campo requerido: instructora_id' 
    });
  }

  try {
    // Verificar que la reserva pertenece a la instructora
    const [reserva] = await db.query(`
      SELECT id FROM reservas 
      WHERE id = ? AND instructora_id = ?
    `, [reservaId, instructora_id]);

    if (reserva.length === 0) {
      return res.status(404).json({ 
        error: 'Reserva no encontrada o no tienes permisos para modificarla' 
      });
    }

    // Actualizar estatus y observaciones
    const [result] = await db.query(`
      UPDATE reservas 
      SET estatus = ?, observaciones = COALESCE(?, observaciones)
      WHERE id = ?
    `, [estatus, observaciones, reservaId]);

    res.json({ 
      message: 'Estatus de reserva actualizado correctamente',
      nuevo_estatus: estatus
    });
  } catch (err) {
    console.error('Error actualizando estatus de reserva:', err);
    res.status(500).json({ error: 'Error al actualizar estatus de reserva' });
  }
});

// Agregar observaciones a una reserva (instructora)
router.put('/instructor/:reservaId/observations', async (req, res) => {
  const { reservaId } = req.params;
  const { observaciones, instructora_id } = req.body;

  if (!observaciones || !instructora_id) {
    return res.status(400).json({ 
      error: 'Faltan campos requeridos: observaciones, instructora_id' 
    });
  }

  try {
    // Verificar que la reserva pertenece a la instructora
    const [reserva] = await db.query(`
      SELECT observaciones as obs_actuales FROM reservas 
      WHERE id = ? AND instructora_id = ?
    `, [reservaId, instructora_id]);

    if (reserva.length === 0) {
      return res.status(404).json({ 
        error: 'Reserva no encontrada o no tienes permisos para modificarla' 
      });
    }

    // Agregar nuevas observaciones a las existentes
    const obsActuales = reserva[0].obs_actuales || '';
    const nuevasObservaciones = obsActuales 
      ? `${obsActuales}\n[Instructora]: ${observaciones}`
      : `[Instructora]: ${observaciones}`;

    await db.query(`
      UPDATE reservas 
      SET observaciones = ?
      WHERE id = ?
    `, [nuevasObservaciones, reservaId]);

    res.json({ 
      message: 'Observaciones agregadas correctamente'
    });
  } catch (err) {
    console.error('Error agregando observaciones:', err);
    res.status(500).json({ error: 'Error al agregar observaciones' });
  }
});

// Solicitar descanso (instructora)
router.post('/instructor/request-break', async (req, res) => {
  const { 
    instructora_id, 
    fecha_inicio, 
    fecha_fin, 
    motivo, 
    tipo 
  } = req.body;

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
    const [result] = await db.query(`
      INSERT INTO descansos (
        instructora_id, fecha_inicio, fecha_fin, motivo, tipo
      ) VALUES (?, ?, ?, ?, ?)
    `, [
      instructora_id,
      formatDateForMySQL(fecha_inicio),
      formatDateForMySQL(fecha_fin),
      motivo,
      tipo || 'otro'
    ]);

    res.json({
      message: 'Solicitud de descanso registrada correctamente',
      id: result.insertId,
      nota: 'Pendiente de aprobación por administrador'
    });
  } catch (err) {
    console.error('Error registrando descanso:', err);
    res.status(500).json({ error: 'Error al registrar solicitud de descanso' });
  }
});

// =============================================================================
// ENDPOINTS AUXILIARES
// =============================================================================

// Obtener clases disponibles
router.get('/classes', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, nombre, duracion_min, cupo_max, observaciones
      FROM clases
      ORDER BY prioridad DESC, nombre
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error obteniendo clases:', err);
    res.status(500).json({ error: 'Error al obtener clases' });
  }
});

// Obtener caballos disponibles
router.get('/horses/available', async (req, res) => {
  try {
    const { tipo_cliente } = req.query;
    
    let whereClause = "disponibilidad = 'disponible'";
    
    // Filtrar según tipo de cliente
    if (tipo_cliente === 'propietario') {
      // Los propietarios solo ven sus caballos en este endpoint específico
      whereClause += " AND estatus = 'privado'";
    } else {
      whereClause += " AND estatus IN ('publico', 'renta', 'media_renta')";
    }

    const [rows] = await db.query(`
      SELECT id, nombre, estatus, especialidad, descripcion
      FROM caballos
      WHERE ${whereClause}
      ORDER BY nombre
    `);
    
    res.json(rows);
  } catch (err) {
    console.error('Error obteniendo caballos:', err);
    res.status(500).json({ error: 'Error al obtener caballos' });
  }
});

// Obtener instructoras disponibles
router.get('/instructors/available', async (req, res) => {
  try {
    const { fecha, especialidad } = req.query;
    
    let whereClause = "i.disponibilidad = 'disponible'";
    let params = [];
    
    if (fecha) {
      whereClause += ` AND i.id NOT IN (
        SELECT d.instructora_id FROM descansos d 
        WHERE ? BETWEEN d.fecha_inicio AND d.fecha_fin
      )`;
      params.push(formatDateForMySQL(fecha));
    }
    
    if (especialidad) {
      whereClause += " AND (i.especialidad = ? OR i.especialidad = 'mixto')";
      params.push(especialidad);
    }

    const [rows] = await db.query(`
      SELECT 
        i.id,
        u.nombre,
        u.apellido,
        i.especialidad,
        i.num_contacto
      FROM instructoras i
      JOIN usuarios u ON i.usuario_id = u.id
      WHERE ${whereClause}
      ORDER BY u.nombre
    `, params);
    
    res.json(rows);
  } catch (err) {
    console.error('Error obteniendo instructoras:', err);
    res.status(500).json({ error: 'Error al obtener instructoras' });
  }
});

export default router;