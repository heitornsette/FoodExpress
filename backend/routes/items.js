const express = require("express");
const router = express.Router();
const pool = require("../src/db");

// Caminho da imagem padrão
const ITEM_DEFAULT_IMAGE = "/imagens/burger.png";

// Criar item
router.post("/restaurants/:id/items", async (req, res) => {
  try {
    const id_restaurante = req.params.id;
    const { nome, preco } = req.body;

    if (!nome || preco == null || isNaN(Number(preco))) {
      return res.status(400).json({ message: "Nome e preço são obrigatórios." });
    }

    const imagem = ITEM_DEFAULT_IMAGE;

    const [result] = await pool.execute(
      "INSERT INTO ItemRestaurante (id_restaurante, nome, preco) VALUES (?, ?, ?, ?)",
      [id_restaurante, nome, preco, imagem]
    );

    res.json({
      success: true,
      item: {
        id_item_restaurante: result.insertId,
        id_restaurante,
        nome,
        preco,
        imagem
      }
    });

  } catch (err) {
    console.error("ERRO AO CRIAR ITEM:", err);
    res.status(500).json({ message: "Erro ao criar item." });
  }
});

// Listar itens
router.get("/restaurants/:id/items", async (req, res) => {
  try {
    const id_restaurante = req.params.id;

    const [rows] = await pool.execute(
      "SELECT id_item_restaurante, id_restaurante, nome, preco FROM ItemRestaurante WHERE id_restaurante = ?",
      [id_restaurante]
    );

    // garantir imagem padrão caso seja null
    const items = rows.map(i => ({
      ...i,
      imagem: i.imagem || ITEM_DEFAULT_IMAGE
    }));

    res.json({ items });

  } catch (err) {
    console.error("ERRO AO LISTAR ITENS:", err);
    res.status(500).json({ message: "Erro ao listar itens." });
  }
});

// Atualizar item
router.put("/items/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { nome, preco } = req.body;

    if (!nome || preco == null || isNaN(Number(preco))) {
      return res.status(400).json({ message: "Nome e preço obrigatórios." });
    }

    await pool.execute(
      "UPDATE ItemRestaurante SET nome=?, preco=? WHERE id_item_restaurante=?",
      [nome, preco, id]
    );

    res.json({ success: true, message: "Item atualizado." });

  } catch (err) {
    console.error("ERRO AO ATUALIZAR ITEM:", err);
    res.status(500).json({ message: "Erro ao atualizar item." });
  }
});

// Deletar item
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
    res.status(500).json({ message: "Erro ao remover item." });
  }
});

module.exports = router;
