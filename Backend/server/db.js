// server/db.js
import mysql from 'mysql2/promise';

// Credenciales para desarrollo
// host: 212.227.238.213
// user: dev_user
// password: elrefugio2025desarrollo
//
// Credenciales para producción
// host: localhost
// user: root
// password: ElRefugio2025

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'country_refugiodb',
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: 'Z',
  ssl: false,
  supportBigNumbers: true,
  bigNumberStrings: true,
  // Configuraciones válidas para el pool de conexiones
  maxIdle: 2, // Máximo 2 conexiones inactivas
  idleTimeout: 300000, // 5 minutos antes de cerrar conexión inactiva
  enableKeepAlive: true,
  keepAliveInitialDelay: 300000
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