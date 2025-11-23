const express = require('express');
const router = express.Router();
const pool = require('../src/db');

router.post('/', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { id_restaurante, id_cliente = null, horario, itens } = req.body || {};

    if (!id_cliente) {
    return res.status(401).json({ message: 'Login obrigatório para efetuar pedido.' });
    }

    if (!id_restaurante) return res.status(400).json({ message: 'id_restaurante é obrigatório.' });
    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({ message: 'Itens do pedido são obrigatórios.' });
    }

    await conn.beginTransaction();

    const [pedidoResult] = await conn.execute(
      'INSERT INTO Pedido (horario, id_cliente, id_restaurante, status) VALUES (?, ?, ?, ?)',
      [horario || new Date(), id_cliente, id_restaurante, 'Em preparo']
    );

    const id_pedido = pedidoResult.insertId;

    const insertItemSql = 'INSERT INTO ItemPedido (id_pedido, descricao, quantidade, preco) VALUES (?, ?, ?, ?)';
    for (const it of itens) {
      const descricao = it.descricao || it.nome || 'Item';
      const quantidade = parseInt(it.quantidade || it.qty || 1, 10);
      const preco = parseFloat(it.preco || it.price || 0.0);

      if (!descricao || quantidade <= 0 || isNaN(preco)) {
        await conn.rollback();
        return res.status(400).json({ message: 'Item inválido no pedido.' });
      }

      await conn.execute(insertItemSql, [id_pedido, descricao, quantidade, preco]);
    }

    await conn.commit();

    const [pedidoRows] = await conn.execute('SELECT * FROM Pedido WHERE id_pedido = ?', [id_pedido]);
    const [itemsRows] = await conn.execute('SELECT * FROM ItemPedido WHERE id_pedido = ?', [id_pedido]);

    res.status(201).json({
      success: true,
      pedido: pedidoRows[0],
      itens: itemsRows
    });
  } catch (err) {
    console.error('Erro POST /api/pedidos:', err);
    try { await conn.rollback(); } catch(e){}
    res.status(500).json({ message: 'Erro interno ao criar pedido.' });
  } finally {
    conn.release();
  }
});

router.get('/', async (req, res) => {
  try {
    const id_cliente = req.query.cliente;
    let rows;
    if (id_cliente) {
      const [r] = await pool.execute('SELECT * FROM Pedido WHERE id_cliente = ? ORDER BY horario DESC', [id_cliente]);
      rows = r;
    } else {
      const [r] = await pool.execute('SELECT * FROM Pedido ORDER BY horario DESC');
      rows = r;
    }
    res.json({ pedidos: rows });
  } catch (err) {
    console.error('Erro GET /api/pedidos', err);
    res.status(500).json({ message: 'Erro ao listar pedidos.' });
  }
});

module.exports = router;
