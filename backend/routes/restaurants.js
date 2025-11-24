const express = require('express');
const router = express.Router();
const pool = require('../src/db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id_restaurante, nome, cozinha, telefone FROM Restaurante"
    );
    res.json({ restaurants: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao buscar restaurantes" });
  }
});

router.post('/', async (req, res) => {
  try {
    const { nome, cozinha, telefone, senha } = req.body;

    if (!nome || !cozinha || !telefone || !senha) {
      return res.status(400).json({ message: "Campos obrigatórios faltando" });
    }

    const [result] = await pool.execute(
      "INSERT INTO Restaurante (nome, cozinha, telefone, senha) VALUES (?, ?, ?, ?)",
      [nome, cozinha, telefone, senha]
    );

    const insertedId = result.insertId;

    res.json({
      success: true,
      restaurant: {
        id_restaurante: insertedId,
        nome,
        cozinha,
        telefone
      }
    });
  } catch (err) {
    console.error("ERRO POST /api/restaurants:", err);
    res.status(500).json({ message: "Erro ao criar restaurante" });
  }
});

router.post('/login', async (req, res) => {
  const { nome, senha } = req.body;

  const [rows] = await pool.execute(
    "SELECT * FROM Restaurante WHERE nome = ?",
    [nome]
  );

  if (!rows.length) {
    return res.status(401).json({ message: "Credenciais inválidas." });
  }

  if (senha !== rows[0].senha) {
    return res.status(401).json({ message: "Credenciais inválidas." });
  }

  res.json({
    success: true,
    restaurant: rows[0],
    token: "fake"
  });
});

module.exports = router;
