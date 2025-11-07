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
    const response = await fetch(`${API_BASE_URL}/instructoras/reservas/${reservaId}/asistencia`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ asistencia }),
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
 * Obtiene caballos filtrados por especialidad según el nivel del cliente
 * @param {string} nivelCliente - Nivel del cliente ('Iniciación', 'Intermedio', 'Avanzado')
 * @returns {Promise<Array>}
 */
export const obtenerCaballosPorNivel = async (nivelCliente) => {
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
    const caballosFiltrados = caballos.filter(caballo => {
      if (!caballo.especialidad) return false;
      return caballo.especialidad.toLowerCase().includes(especialidadBuscada);
    });

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