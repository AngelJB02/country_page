import db from '../../server/db.js';

/**
 * GENERADOR DE CREDENCIALES AUTOMÁTICAS
 * 
 * Este archivo contiene funciones para generar automáticamente:
 * - Usernames únicos basados en nombre y apellido
 * - Contraseñas seguras aleatorias
 * 
 * Se usa cuando se crean nuevos usuarios para evitar que el admin
 * tenga que inventar usernames y contraseñas manualmente.
 */

/**
 * Genera una contraseña segura aleatoria
 * @returns {string} Contraseña de 8 caracteres (letras mayúsculas, minúsculas y números)
 */
export const generateSecurePassword = () => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const allChars = uppercase + lowercase + numbers;
  
  let password = '';
  
  // Asegurar al menos 1 mayúscula, 1 minúscula y 1 número
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  
  // Completar con caracteres aleatorios hasta llegar a 8
  for (let i = 3; i < 8; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Mezclar los caracteres para que no siempre empiecen igual
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

/**
 * Normaliza un texto para usar en username (quita acentos, espacios, etc.)
 * @param {string} text - Texto a normalizar
 * @param {number} maxLength - Longitud máxima del texto
 * @returns {string} Texto normalizado
 */
const normalizeText = (text, maxLength = 10) => {
  return text
    .toLowerCase()
    .normalize('NFD') // Separar caracteres y acentos
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^a-z0-9]/g, '') // Solo letras y números
    .substring(0, maxLength);
};

/**
 * Obtiene la primera palabra de un texto (útil para nombres compuestos)
 * @param {string} text - Texto del cual extraer la primera palabra
 * @returns {string} Primera palabra normalizada
 */
const getFirstWord = (text) => {
  const firstWord = text.trim().split(/\s+/)[0]; // Tomar solo la primera palabra
  return normalizeText(firstWord, 8); // Máximo 8 caracteres para la primera palabra
};

/**
 * Verifica si un username ya existe en la base de datos
 * @param {string} username - Username a verificar
 * @returns {boolean} true si existe, false si no existe
 */
const usernameExists = async (username) => {
  try {
    const [rows] = await db.query('SELECT id FROM usuarios WHERE username = ?', [username]);
    return rows.length > 0;
  } catch (error) {
    console.error('Error verificando username:', error);
    return true; // En caso de error, asumir que existe para generar otro
  }
};

/**
 * Genera un username único basado en nombre y apellido
 * @param {string} nombre - Nombre del usuario
 * @param {string} apellido - Apellido del usuario
 * @returns {string} Username único (ej: "angel.jimenez" o "angel.jimenez1")
 */
export const generateUniqueUsername = async (nombre, apellido) => {
  // Usar solo la primera palabra del nombre y apellido
  const primerNombre = getFirstWord(nombre);
  const primerApellido = getFirstWord(apellido);
  
  // Crear username base con formato: primer_nombre.primer_apellido
  let baseUsername = `${primerNombre}.${primerApellido}`;
  
  // Si es muy corto (menos de 4 caracteres), usar formato sin punto
  if (baseUsername.length < 4) {
    baseUsername = primerNombre + primerApellido;
  }
  
  // Limitar a máximo 15 caracteres
  if (baseUsername.length > 15) {
    // Si es muy largo, truncar apellido
    const apellidoTruncado = primerApellido.substring(0, 15 - primerNombre.length - 1);
    baseUsername = `${primerNombre}.${apellidoTruncado}`;
  }
  
  // Verificar si el username base está disponible
  if (!(await usernameExists(baseUsername))) {
    return baseUsername;
  }
  
  // Si ya existe, agregar números hasta encontrar uno disponible
  let counter = 1;
  let newUsername = `${baseUsername}${counter}`;
  
  while (await usernameExists(newUsername)) {
    counter++;
    newUsername = `${baseUsername}${counter}`;
    
    // Evitar bucle infinito (máximo 100 intentos)
    if (counter > 100) {
      // Si no encontramos uno libre, agregar timestamp
      newUsername = `${baseUsername}${Date.now().toString().slice(-4)}`;
      break;
    }
  }
  
  return newUsername;
};

/**
 * Genera credenciales completas (username + password)
 * @param {string} nombre - Nombre del usuario
 * @param {string} apellido - Apellido del usuario
 * @param {string} customPassword - Contraseña personalizada (opcional)
 * @returns {object} { username: string, password: string }
 */
export const generateCredentials = async (nombre, apellido, customPassword = null) => {
  const username = await generateUniqueUsername(nombre, apellido);
  const password = customPassword || generateSecurePassword();
  
  return {
    username,
    password
  };
};