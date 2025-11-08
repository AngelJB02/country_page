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
    // Obtener el usuario actual para obtener la instructora_id
    const usuario = obtenerUsuarioActual();
    if (!usuario || !usuario.id) {
      throw new Error('No se encontró información de usuario');
    }

    const response = await fetch(`${API_BASE_URL}/reservas/instructor/${reservaId}/attendance`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        asistio: asistencia === 'presente',
        instructora_id: usuario.id,
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
 * Obtiene caballos filtrados por especialidad según el nivel del cliente
 * También filtra caballos que necesitan descanso y que están ocupados en la fecha/hora especificada
 * @param {string} nivelCliente - Nivel del cliente ('Iniciación', 'Intermedio', 'Avanzado')
 * @param {string} fecha - Fecha en formato YYYY-MM-DD para verificar descansos y ocupación
 * @param {string} hora - Hora en formato HH:MM para verificar ocupación
 * @returns {Promise<Array>}
 */
export const obtenerCaballosPorNivelYHora = async (nivelCliente, fecha = null, hora = null) => {
  try {
    // Usar fecha actual si no se proporciona
    if (!fecha) {
      const hoy = new Date();
      fecha = hoy.toISOString().split('T')[0];
    }

    // Obtener todos los caballos
    const response = await fetch(`${API_BASE_URL}/caballos`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const todosCaballos = await response.json();
    
    // Mapear niveles de cliente a especialidades de caballos
    const especialidadesMap = {
      'Iniciación': ['iniciacion', 'mixto'],
      'Intermedio': ['iniciacion', 'intermedio', 'mixto'],
      'Avanzado': ['iniciacion', 'intermedio', 'avanzado', 'mixto']
    };
    
    const especialidades = especialidadesMap[nivelCliente] || ['mixto'];
    
    // Filtrar por especialidad y estado
    let caballosFiltrados = todosCaballos.filter(caballo => 
      caballo.estatus === 'activo' &&
      caballo.disponibilidad === 'disponible' &&
      especialidades.includes(caballo.especialidad?.toLowerCase())
    );

    // Si tenemos fecha y hora, obtener reservas ocupadas
    if (fecha && hora) {
      const reservasResponse = await fetch(`${API_BASE_URL}/reservas/admin/all?fecha=${fecha}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (reservasResponse.ok) {
        const reservas = await reservasResponse.json();
        
        // Obtener información adicional de reservas para conseguir caballo_id
        const reservasDetalladas = [];
        for (const reserva of reservas) {
          if (reserva.caballo_nombre && 
              reserva.estatus !== 'cancelada' &&
              reserva.hora_inicio <= hora &&
              reserva.hora_fin > hora) {
            
            // Buscar el ID del caballo por nombre
            const caballoEncontrado = todosCaballos.find(c => c.nombre === reserva.caballo_nombre);
            if (caballoEncontrado) {
              reservasDetalladas.push(caballoEncontrado.id);
            }
          }
        }
        
        // Filtrar caballos ocupados
        caballosFiltrados = caballosFiltrados.filter(caballo => 
          !reservasDetalladas.includes(caballo.id)
        );
      }
    }

    console.log(`🐴 Caballos disponibles para nivel ${nivelCliente} en ${fecha} ${hora || '(sin hora)'}:`, caballosFiltrados);
    return caballosFiltrados;
    
  } catch (error) {
    console.error('Error al obtener caballos por nivel y hora:', error);
    throw error;
  }
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