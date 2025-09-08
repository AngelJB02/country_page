// server/db.js
import mysql from "mysql";

// Configuración de la conexión a MySQL
const db = mysql.createConnection({
  host: "149.56.44.53",
  user: "countrydb",
  password: "&%0NW1ttSxb6sbnh",
  database: "contry_refugiodb",
  port: 3306 // 👈 normalmente MySQL usa 3306, cámbialo si tu server usa otro
});

// Conectar
db.connect((err) => {
  if (err) {
    console.error("❌ Error al conectar a MySQL:", err);
    return;
  }
  console.log("✅ Conectado a la base de datos contry_refugiodb");
});

export default db;
