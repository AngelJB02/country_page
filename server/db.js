// server/db.js
import mysql from 'mysql2/promise';

const db = mysql.createPool({
  host: '149.56.44.53',
  user: 'countrydb',
  password: '&%0NW1ttSxb6sbnh',
  database: 'contry_refugiodb',
  waitForConnections: true,
  connectionLimit: 10,
});

console.log('✅ Conectado a la base de datos contry_refugiodb');

export default db;
