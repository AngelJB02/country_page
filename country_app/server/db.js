// server/db.js
import mysql from 'mysql2/promise';

const db = mysql.createPool({
  host: '149.56.44.53',
  user: 'countrydb',
  password: '&%0NW1ttSxb6sbnh',
  database: 'contry_refugiodb',
  waitForConnections: true,
  connectionLimit: 5, // Reducido para evitar sobrecarga
  queueLimit: 0,
  acquireTimeout: 30000, // Reducido timeout
  timeout: 30000,
  reconnect: true,
  charset: 'utf8mb4',
  // Configuraciones mejoradas para estabilidad
  keepAliveInitialDelay: 300000, // 5 minutos
  enableKeepAlive: true,
  maxIdle: 2, // Máximo 2 conexiones inactivas
  idleTimeout: 300000, // 5 minutos antes de cerrar conexión inactiva
  // Configuración de timezone
  timezone: 'Z',
  // Nuevas configuraciones para mejor manejo de errores
  ssl: false,
  supportBigNumbers: true,
  bigNumberStrings: true
});

// Manejo de errores de conexión
db.on('connection', () => {
  console.log('✅ Nueva conexión establecida a la base de datos');
});

db.on('error', (err) => {
  console.error('❌ Error en la conexión de base de datos:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET') {
    console.log('🔄 Reintentando conexión...');
  }
});

console.log('✅ Pool de conexiones configurado para contry_refugiodb');

export default db;
