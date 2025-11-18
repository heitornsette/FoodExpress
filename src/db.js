require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('Conectado ao MySQL com sucesso!');
    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('Erro ao conectar ao MySQL:', err.message);
    process.exit(1);
  }
})();