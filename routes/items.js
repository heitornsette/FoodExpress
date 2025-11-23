const express = require("express");
const router = express.Router();
const pool = require("../src/db");

router.post("/restaurants/:id/items", async (req, res) => {
  try {
    const id_restaurante = req.params.id;
    const { nome, descricao, preco, categoria } = req.body;

    if (!nome || !descricao || !preco) {
      return res.status(400).json({ message: "Campos obrigatórios faltando." });
    }

    const [result] = await pool.execute(
      "INSERT INTO ItemRestaurante (id_restaurante, nome, descricao, preco, categoria) VALUES (?, ?, ?, ?, ?)",
      [id_restaurante, nome, descricao, preco, categoria]
    );

    res.json({
      success: true,
      item: {
        id_item_restaurante: result.insertId,
        id_restaurante,
        nome,
        descricao,
        preco,
        categoria
      }
    });

  } catch (err) {
    console.error("ERRO AO CRIAR ITEM:", err);
    res.status(500).json({ message: "Erro ao criar item." });
  }
});

router.get("/restaurants/:id/items", async (req, res) => {
  try {
    const id_restaurante = req.params.id;

    const [rows] = await pool.execute(
      "SELECT * FROM ItemRestaurante WHERE id_restaurante = ?",
      [id_restaurante]
    );

    res.json({ items: rows });

  } catch (err) {
    console.error("ERRO AO LISTAR ITENS:", err);
    res.status(500).json({ message: "Erro ao listar itens." });
  }
});

router.put("/items/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { nome, descricao, preco, categoria } = req.body;

    const [result] = await pool.execute(
      "UPDATE ItemRestaurante SET nome=?, descricao=?, preco=?, categoria=? WHERE id_item_restaurante=?",
      [nome, descricao, preco, categoria, id]
    );

    res.json({
      success: true,
      message: "Item atualizado."
    });

  } catch (err) {
    console.error("ERRO AO ATUALIZAR ITEM:", err);
    res.status(500).json({ message: "Erro ao atualizar item." });
  }
});

router.delete("/items/:id", async (req, res) => {
  try {
    const id = req.params.id;

    await pool.execute(
      "DELETE FROM ItemRestaurante WHERE id_item_restaurante = ?",
      [id]
    );

    res.json({ success: true, message: "Item removido." });

  } catch (err) {
    console.error("ERRO AO DELETAR ITEM:", err);
    res.status(500).json({ message: "Erro ao deletar item." });
  }
});

module.exports = router;
