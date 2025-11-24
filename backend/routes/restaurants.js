const express = require("express");
const router = express.Router();
const pool = require("../src/db");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "troque_isto_para_uma_chave_secreta";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";

function authRestaurant(req, res, next) {
  const auth = req.headers.authorization || "";
  const parts = auth.split(" ");

  if (parts.length !== 2) {
    return res.status(401).json({ message: "Token ausente." });
  }

  const token = parts[1];

  try {
    const data = jwt.verify(token, JWT_SECRET);

    if (!data.sub) {
      return res.status(401).json({ message: "Token inválido." });
    }

    req.rest = data;
    return next();

  } catch (err) {
    return res.status(401).json({ message: "Token inválido." });
  }
}

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id_restaurante, nome, cozinha, telefone FROM Restaurante"
    );

    return res.json({ restaurants: rows });

  } catch (err) {
    console.error("ERRO GET /api/restaurants:", err);
    return res.status(500).json({ message: "Erro ao buscar restaurantes." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id_restaurante, nome, cozinha, telefone FROM Restaurante WHERE id_restaurante = ?",
      [req.params.id]
    );

    if (!rows.length)
      return res.status(404).json({ message: "Restaurante não encontrado." });

    return res.json({ restaurant: rows[0] });

  } catch (err) {
    console.error("ERRO GET /api/restaurants/:id:", err);
    return res.status(500).json({ message: "Erro ao buscar restaurante." });
  }
});

router.post("/", async (req, res) => {
  try {
    const { nome, cozinha, telefone, senha } = req.body;

    if (!nome || !cozinha || !telefone || !senha) {
      return res.status(400).json({ message: "Campos obrigatórios faltando." });
    }

    const [result] = await pool.execute(
      "INSERT INTO Restaurante (nome, cozinha, telefone, senha) VALUES (?, ?, ?, ?)",
      [nome, cozinha, telefone, senha]
    );

    return res.json({
      success: true,
      restaurant: {
        id_restaurante: result.insertId,
        nome,
        cozinha,
        telefone
      }
    });

  } catch (err) {
    console.error("ERRO POST /api/restaurants:", err);
    return res.status(500).json({ message: "Erro ao criar restaurante." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { nome, senha } = req.body;

    if (!nome || !senha)
      return res.status(400).json({ message: "Nome e senha obrigatórios." });

    const [rows] = await pool.execute(
      "SELECT * FROM Restaurante WHERE nome = ?",
      [nome]
    );

    if (!rows.length)
      return res.status(401).json({ message: "Credenciais inválidas." });

    const rest = rows[0];

    if (senha !== rest.senha)
      return res.status(401).json({ message: "Credenciais inválidas." });

    const token = jwt.sign(
      {
        sub: rest.id_restaurante,
        role: "restaurant",
        nome: rest.nome
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    return res.json({
      success: true,
      restaurant: {
        id_restaurante: rest.id_restaurante,
        nome: rest.nome,
        cozinha: rest.cozinha,
        telefone: rest.telefone,
        descricao: rest.descricao
      },
      token
    });

  } catch (err) {
    console.error("ERRO /api/restaurants/login:", err);
    return res.status(500).json({ message: "Erro ao realizar login." });
  }
});

router.put("/:id", authRestaurant, async (req, res) => {
  try {
    const { nome, cozinha, telefone, senha } = req.body;

    const updates = [];
    const values = [];

    if (nome) { updates.push("nome = ?"); values.push(nome); }
    if (cozinha) { updates.push("cozinha = ?"); values.push(cozinha); }
    if (telefone) { updates.push("telefone = ?"); values.push(telefone); }
    if (senha) { updates.push("senha = ?"); values.push(senha); }

    if (!updates.length)
      return res.status(400).json({ message: "Nada para atualizar." });

    values.push(req.params.id);

    await pool.execute(
      `UPDATE Restaurante SET ${updates.join(", ")} WHERE id_restaurante = ?`,
      values
    );

    const [rows] = await pool.execute(
      "SELECT id_restaurante, nome, cozinha, telefone FROM Restaurante WHERE id_restaurante = ?",
      [req.params.id]
    );

    return res.json({ success: true, restaurant: rows[0] });

  } catch (err) {
    console.error("ERRO PUT /api/restaurants/:id:", err);
    return res.status(500).json({ message: "Erro ao atualizar restaurante." });
  }
});

router.delete("/:id", authRestaurant, async (req, res) => {
  try {
    await pool.execute(
      "DELETE FROM Restaurante WHERE id_restaurante = ?",
      [req.params.id]
    );

    return res.json({ success: true, message: "Restaurante removido." });

  } catch (err) {
    console.error("ERRO DELETE /api/restaurants/:id:", err);
    return res.status(500).json({ message: "Erro ao remover restaurante." });
  }
});

module.exports = router;