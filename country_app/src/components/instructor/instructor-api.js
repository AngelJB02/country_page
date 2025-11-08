// API service para el panel de instructoras
const API_BASE_URL = 'http://localhost:3001/api';

/**
 * Obtiene las clases/reservas de una instructora usando el usuario_id
 * @param {number} usuarioId - ID del usuario de la tabla usuarios
 * @returns {Promise<{instructora: Object, clases: Array}>}
 */
export const obtenerClasesInstructora = async (usuarioId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/instructoras/clases/${usuarioId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener clases de instructora:', error);
    throw error;
  }
};

/**
 * Actualiza la asistencia de una reserva
 * @param {number} reservaId - ID de la reserva
 * @param {string} asistencia - 'presente', 'ausente', 'justificado', 'pendiente'
 * @returns {Promise<Object>}
 */
export const actualizarAsistencia = async (reservaId, asistencia) => {
  try {
    console.log('🔍 DEBUG - Actualizando asistencia:', { reservaId, asistencia });
    
    // Obtener el usuario actual para obtener la instructora_id
    const usuario = obtenerUsuarioActual();
    if (!usuario || !usuario.id) {
      throw new Error('No se encontró información de usuario');
    }

    console.log('👤 Usuario del localStorage:', usuario);

    // Primero obtener el instructora_id real basado en usuario_id
    const instructoraResponse = await fetch(`${API_BASE_URL}/instructoras/clases/${usuario.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!instructoraResponse.ok) {
      throw new Error(`Error obteniendo instructora: ${instructoraResponse.status}`);
    }

    const { instructora } = await instructoraResponse.json();
    const instructoraId = instructora.id; // Usar 'id' no 'instructora_id'
    
    console.log('🏫 Instructora ID obtenido:', instructoraId);

    const response = await fetch(`${API_BASE_URL}/reservas/instructor/${reservaId}/attendance`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        asistio: asistencia === 'presente',
        instructora_id: instructoraId, // Usar el ID correcto de la tabla instructoras
        observaciones: asistencia === 'ausente' ? 'Marcado por instructora' : ''
      }),
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al actualizar asistencia:', error);
    throw error;
  }
};

/**
 * Actualiza el caballo asignado a una reserva
 * @param {number} reservaId - ID de la reserva
 * @param {number} caballoId - ID del caballo
 * @returns {Promise<Object>}
 */
export const actualizarCaballoReserva = async (reservaId, caballoId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reservas/${reservaId}/caballo`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ caballo_id: caballoId }),
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al actualizar caballo:', error);
    throw error;
  }
};

/**
 * Obtiene la lista de caballos disponibles
 * @returns {Promise<Array>}
 */
export const obtenerCaballos = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/caballos`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener caballos:', error);
    throw error;
  }
};

/**
 * Asigna un caballo a una reserva
 * @param {number} reservaId - ID de la reserva
 * @param {number} caballoId - ID del caballo
 * @returns {Promise<Object>}
 */
export const asignarCaballo = async (reservaId, caballoId) => {
  try {
    console.log('🐴 Asignando caballo:', { reservaId, caballoId });
    
    const usuario = obtenerUsuarioActual();
    if (!usuario || !usuario.id) {
      throw new Error('No se encontró información de usuario');
    }

    console.log('👤 Usuario actual:', usuario);

    // Primero obtener el instructor_id correspondiente al usuario
    const instructoraResponse = await fetch(`${API_BASE_URL}/instructoras/by-user/${usuario.id}`);
    
    if (!instructoraResponse.ok) {
      throw new Error('No se pudo obtener información del instructor');
    }
    
    const instructoraData = await instructoraResponse.json();
    console.log('👩‍🏫 Instructor encontrado:', instructoraData);

    // Ahora hacer la asignación con el instructor_id correcto usando el endpoint existente
    const response = await fetch(`${API_BASE_URL}/reservas/instructor/${reservaId}/assign-horse`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        caballo_id: caballoId,
        instructora_id: instructoraData.instructora_id
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al asignar caballo');
    }

    const data = await response.json();
    console.log('✅ Caballo asignado exitosamente:', data);
    return data;
    
  } catch (error) {
    console.error('❌ Error al asignar caballo:', error);
    throw error;
  }
};

/**
 * Obtiene caballos para múltiples clases de una vez (optimizado)
 * @param {Array} clases - Array de clases con información de nivel, fecha, hora, id
 * @returns {Promise<Object>} Objeto con caballos disponibles por clase
 */
export const obtenerCaballosParaTodasLasClases = async (clases) => {
  try {
    console.log('🚀 Optimización: Cargando caballos para todas las clases de una vez');
    
    if (!clases || clases.length === 0) {
      return {};
    }
    
    // Obtener niveles únicos
    const nivelesUnicos = [...new Set(clases.map(c => c.studentLevel).filter(Boolean))];
    console.log('📚 Niveles únicos encontrados:', nivelesUnicos);
    
    // Obtener fechas únicas
    const fechasUnicas = [...new Set(clases.map(c => c.date).filter(Boolean))];
    console.log('📅 Fechas únicas encontradas:', fechasUnicas);
    
    // Obtener todos los caballos por nivel (una llamada por nivel único)
    const caballosPorNivel = {};
    for (const nivel of nivelesUnicos) {
      const fechaHoy = new Date().toISOString().split('T')[0];
      caballosPorNivel[nivel] = await obtenerCaballosPorNivel(nivel, fechaHoy);
    }
    
    // Obtener reservas para todas las fechas únicas
    const reservasPorFecha = {};
    for (const fecha of fechasUnicas) {
      try {
        const response = await fetch(`${API_BASE_URL}/reservas/admin/all?fecha=${fecha}`);
        if (response.ok) {
          reservasPorFecha[fecha] = await response.json();
        } else {
          reservasPorFecha[fecha] = [];
        }
      } catch (error) {
        console.warn(`Error al obtener reservas para ${fecha}:`, error);
        reservasPorFecha[fecha] = [];
      }
    }
    
    // Procesar cada clase para filtrar caballos
    const resultado = {};
    for (const clase of clases) {
      if (!clase.studentLevel) continue;
      
      const todosCaballos = caballosPorNivel[clase.studentLevel] || [];
      
      if (!clase.date || !clase.time) {
        // Sin filtrado por horario
        resultado[clase.id] = todosCaballos;
        continue;
      }
      
      // Filtrar por horario para esta clase específica
      const reservas = reservasPorFecha[clase.date] || [];
      const caballosOcupados = new Set();
      
      for (const reserva of reservas) {
        // Excluir la clase actual del filtrado
        if (reserva.id == clase.id) continue;
        
        if (reserva.caballo_nombre && 
            reserva.estatus !== 'cancelada' &&
            hayConflictoHorario(clase.time, reserva.hora_inicio, reserva.hora_fin)) {
          
          const caballoEncontrado = todosCaballos.find(c => c.nombre === reserva.caballo_nombre);
          if (caballoEncontrado) {
            caballosOcupados.add(caballoEncontrado.id);
          }
        }
      }
      
      resultado[clase.id] = todosCaballos.filter(caballo => !caballosOcupados.has(caballo.id));
    }
    
    console.log('✅ Caballos cargados para todas las clases:', Object.keys(resultado));
    return resultado;
    
  } catch (error) {
    console.error('Error al cargar caballos para todas las clases:', error);
    return {};
  }
};
export const obtenerCaballosDisponiblesParaHorario = async (nivelCliente, fecha, hora, claseActualId = null) => {
  try {
    console.log('🔍 Filtrando caballos para:', { nivelCliente, fecha, hora, claseActualId });
    
    // Primero obtener todos los caballos por nivel
    const todosCaballos = await obtenerCaballosPorNivel(nivelCliente, fecha);
    console.log('🐎 Todos los caballos por nivel:', todosCaballos);
    
    // Si no hay fecha/hora, devolver todos
    if (!fecha || !hora) {
      return todosCaballos;
    }
    
    // Obtener todas las reservas del día
    const reservasResponse = await fetch(`${API_BASE_URL}/reservas/admin/all?fecha=${fecha}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!reservasResponse.ok) {
      console.warn('No se pudieron obtener reservas, devolviendo todos los caballos');
      return todosCaballos;
    }
    
    const reservas = await reservasResponse.json();
    console.log('� Reservas del día:', reservas);
    
    // Encontrar caballos ocupados en ese horario (EXCLUYENDO la clase actual)
    const caballosOcupados = new Set();
    
    for (const reserva of reservas) {
      // IMPORTANTE: Excluir la clase actual del filtrado
      if (claseActualId && reserva.id == claseActualId) {
        console.log(`⏭️ Excluyendo clase actual del filtrado: ${reserva.id}`);
        continue;
      }
      
      if (reserva.caballo_nombre && 
          reserva.estatus !== 'cancelada' &&
          hayConflictoHorario(hora, reserva.hora_inicio, reserva.hora_fin)) {
        
        // Buscar el caballo por nombre en la lista de todos los caballos
        const caballoEncontrado = todosCaballos.find(c => c.nombre === reserva.caballo_nombre);
        if (caballoEncontrado) {
          caballosOcupados.add(caballoEncontrado.id);
          console.log(`❌ Caballo ocupado: ${reserva.caballo_nombre} (${reserva.hora_inicio}-${reserva.hora_fin}) en clase ${reserva.id}`);
        }
      }
    }
    
    // Filtrar caballos disponibles
    const caballosDisponibles = todosCaballos.filter(caballo => !caballosOcupados.has(caballo.id));
    
    console.log(`✅ Caballos disponibles: ${caballosDisponibles.length}/${todosCaballos.length} (excluida clase ${claseActualId})`);
    return caballosDisponibles;
    
  } catch (error) {
    console.error('Error al filtrar caballos por horario:', error);
    // En caso de error, devolver todos los caballos por nivel
    return await obtenerCaballosPorNivel(nivelCliente, fecha || new Date().toISOString().split('T')[0]);
  }
};

/**
 * Verifica si hay conflicto de horario entre dos rangos
 * @param {string} hora - Hora de la nueva clase (HH:MM)
 * @param {string} horaInicio - Hora inicio de reserva existente (HH:MM:SS)
 * @param {string} horaFin - Hora fin de reserva existente (HH:MM:SS)
 * @returns {boolean}
 */
const hayConflictoHorario = (hora, horaInicio, horaFin) => {
  if (!hora || !horaInicio || !horaFin) return false;
  
  // Normalizar formatos (quitar segundos si los hay)
  const horaClase = hora.substring(0, 5); // HH:MM
  const inicioReserva = horaInicio.substring(0, 5); // HH:MM
  const finReserva = horaFin.substring(0, 5); // HH:MM
  
  // Verificar si la hora de la clase está dentro del rango de la reserva
  return horaClase >= inicioReserva && horaClase < finReserva;
};

/**
 * Obtiene caballos filtrados por especialidad según el nivel del cliente
 * También filtra caballos que necesitan descanso (ya trabajaron 3 veces en actividades no-iniciación)
 * @param {string} nivelCliente - Nivel del cliente ('Iniciación', 'Intermedio', 'Avanzado')
 * @param {string} fecha - Fecha en formato YYYY-MM-DD para verificar descansos
 * @returns {Promise<Array>}
 */
export const obtenerCaballosPorNivel = async (nivelCliente, fecha = null) => {
  try {
    // Usar fecha actual si no se proporciona
    if (!fecha) {
      const hoy = new Date();
      fecha = hoy.toISOString().split('T')[0];
    }

    const response = await fetch(`${API_BASE_URL}/caballos`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const caballos = await response.json();
    
    // Normalizar el nivel del cliente a formato estándar
    const nivelNormalizado = nivelCliente.toLowerCase();
    
    // Mapeo de nivel de cliente a especialidad de caballo (todo en minúsculas)
    const mapeoEspecialidad = {
      'iniciación': 'iniciacion',
      'iniciacion': 'iniciacion',
      'intermedio': 'paseo', 
      'avanzado': 'salto'
    };

    const especialidadBuscada = mapeoEspecialidad[nivelNormalizado];
    
    if (!especialidadBuscada) {
      console.warn(`Nivel de cliente no reconocido: ${nivelCliente}`);
      return caballos; // Devolver todos si no se reconoce el nivel
    }

    // Filtrar caballos que tengan la especialidad requerida
    let caballosFiltrados = caballos.filter(caballo => {
      if (!caballo.especialidad) return false;
      return caballo.especialidad.toLowerCase().includes(especialidadBuscada);
    });

    // Si no es iniciación, verificar el descanso (obtener actividades del día para cada caballo)
    if (especialidadBuscada !== 'iniciacion') {
      try {
        const caballosConDescanso = await Promise.all(
          caballosFiltrados.map(async (caballo) => {
            try {
              const actividadesResponse = await fetch(`${API_BASE_URL}/caballos/${caballo.id}/actividades-dia?fecha=${fecha}`);
              if (actividadesResponse.ok) {
                const data = await actividadesResponse.json();
                const actividadesNoIniciacion = data.actividades_no_iniciacion || 0;
                
                return {
                  ...caballo,
                  actividadesHoy: actividadesNoIniciacion,
                  necesitaDescanso: actividadesNoIniciacion >= 3
                };
              }
              return { ...caballo, necesitaDescanso: false };
            } catch (error) {
              console.warn(`Error verificando actividades para caballo ${caballo.nombre}:`, error);
              return { ...caballo, necesitaDescanso: false };
            }
          })
        );

        // Filtrar caballos que no necesitan descanso
        caballosFiltrados = caballosConDescanso.filter(caballo => !caballo.necesitaDescanso);
        
        console.log(`🐎 Caballos después del filtro de descanso:`, caballosFiltrados.length);
        caballosConDescanso.forEach(caballo => {
          if (caballo.necesitaDescanso) {
            console.log(`😴 ${caballo.nombre} necesita descanso (trabajó ${caballo.actividadesHoy} veces)`);
          }
        });
      } catch (error) {
        console.warn('Error verificando descansos, mostrando todos los caballos:', error);
      }
    }

    console.log(`🐎 Caballos filtrados para nivel ${nivelCliente} (busca "${especialidadBuscada}"):`, caballosFiltrados.length);
    console.log('📋 Caballos disponibles:', caballosFiltrados.map(c => `${c.nombre} (${c.especialidad})`));
    return caballosFiltrados;
    
  } catch (error) {
    console.error('Error al obtener caballos por nivel:', error);
    throw error;
  }
};

/**
 * Obtiene el usuario actual del localStorage
 * @returns {Object|null}
 */
export const obtenerUsuarioActual = () => {
  try {
    const usuario = localStorage.getItem('user');
    return usuario ? JSON.parse(usuario) : null;
  } catch (error) {
    console.error('Error al obtener usuario del localStorage:', error);
    return null;
  }
};