const express = require('express');
const router = express.Router();
const pool = require('../src/db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || "segredo_trocar";
const JWT_EXPIRES = "7d";

router.post('/login', async (req, res) => {
  try {
    const { nome, senha } = req.body;

    if (!nome || !senha) {
      return res.status(400).json({ message: "Nome e senha obrigatórios." });
    }

    const [rows] = await pool.execute(
      "SELECT * FROM Restaurante WHERE nome = ?",
      [nome]
    );

    if (!rows.length) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    const restaurante = rows[0];

    if (senha !== restaurante.senha) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    const payload = {
      id_restaurante: restaurante.id_restaurante,
      nome: restaurante.nome
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    return res.json({
      success: true,
      token,
      restaurant: {
        id_restaurante: restaurante.id_restaurante,
        nome: restaurante.nome,
        cozinha: restaurante.cozinha,
        telefone: restaurante.telefone
      }
    });

  } catch (err) {
    console.error("ERRO LOGIN RESTAURANTE:", err);
    res.status(500).json({ message: "Erro interno." });
  }
});

module.exports = router;
