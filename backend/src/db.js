const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('Conectado ao MySQL com sucesso! ebaaaaaaa');
    conn.release();
  } catch (err) {
    console.error(' Booooo, erro ao conectar ao MySQL:', err.message);
  }
})();

module.exports = pool;
