// server/db.js
import mysql from 'mysql2/promise';

const db = mysql.createPool({
  host: '149.56.44.53',
  user: 'countrydb',
  password: '&%0NW1ttSxb6sbnh',
  database: 'contry_refugiodb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  charset: 'utf8mb4',
  // Configuraciones adicionales para mejorar estabilidad
  keepAliveInitialDelay: 0,
  enableKeepAlive: true,
  maxIdle: 10,
  idleTimeout: 60000,
  // Configuración de timezone
  timezone: 'Z'
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
