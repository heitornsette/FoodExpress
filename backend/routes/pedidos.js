const express = require('express');
const router = express.Router();
const pool = require('../src/db');

// ORDEM dos status
const STATUS_SEQ = ['Em preparo', 'A caminho', 'Entregue'];

// ===============================
// CRIAR PEDIDO (SEM MUDANÇAS)
// ===============================
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

    const insertItemSql =
      'INSERT INTO ItemPedido (id_pedido, descricao, quantidade, preco) VALUES (?, ?, ?, ?)';

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
    const [itemsRows] = await conn.execute('SELECT * FROM ItemPedido WHERE id_pedido = ?', [
      id_pedido,
    ]);

    res.status(201).json({
      success: true,
      pedido: pedidoRows[0],
      itens: itemsRows,
    });
  } catch (err) {
    console.error('Erro POST /api/pedidos:', err);
    try {
      await conn.rollback();
    } catch (e) {}
    res.status(500).json({ message: 'Erro interno ao criar pedido.' });
  } finally {
    conn.release();
  }
});

// ====================================
// 🔥 GET PEDIDOS COM SUPORTE AO RESTAURANTE
// ====================================
router.get('/', async (req, res) => {
  try {
    const id_cliente = req.query.cliente;
    const id_restaurante = req.query.restaurante;

    let pedidosRows;

    if (id_cliente) {
      const [r] = await pool.execute(
        'SELECT * FROM Pedido WHERE id_cliente = ? ORDER BY horario DESC',
        [id_cliente]
      );
      pedidosRows = r;
    } else if (id_restaurante) {
      const [r] = await pool.execute(
        'SELECT * FROM Pedido WHERE id_restaurante = ? ORDER BY horario DESC',
        [id_restaurante]
      );
      pedidosRows = r;
    } else {
      const [r] = await pool.execute('SELECT * FROM Pedido ORDER BY horario DESC');
      pedidosRows = r;
    }

    // ANEXAR ITENS DE CADA PEDIDO
    const pedidosComItens = [];
    for (const p of pedidosRows) {
      const [items] = await pool.execute('SELECT * FROM ItemPedido WHERE id_pedido = ?', [
        p.id_pedido,
      ]);

      pedidosComItens.push({
        ...p,
        itens: items,
      });
    }

    res.json({ pedidos: pedidosComItens });
  } catch (err) {
    console.error('Erro GET /api/pedidos', err);
    res.status(500).json({ message: 'Erro ao listar pedidos.' });
  }
});

// ====================================
// 🔥 ATUALIZAR STATUS DO PEDIDO
// ====================================
router.put('/:id/status', async (req, res) => {
  try {
    const id = req.params.id;
    const { action } = req.body || {};

    const [rows] = await pool.execute('SELECT status FROM Pedido WHERE id_pedido = ?', [id]);
    if (!rows.length) return res.status(404).json({ message: 'Pedido não encontrado.' });

    const atual = rows[0].status;
    const idx = STATUS_SEQ.indexOf(atual);

    let novoStatus = STATUS_SEQ[0];
    if (idx >= 0 && idx < STATUS_SEQ.length - 1) novoStatus = STATUS_SEQ[idx + 1];
    else if (idx === STATUS_SEQ.length - 1) novoStatus = STATUS_SEQ[idx];

    await pool.execute('UPDATE Pedido SET status = ? WHERE id_pedido = ?', [novoStatus, id]);

    const [updated] = await pool.execute('SELECT * FROM Pedido WHERE id_pedido = ?', [id]);

    res.json({ success: true, pedido: updated[0] });
  } catch (err) {
    console.error('Erro PUT /api/pedidos/:id/status', err);
    res.status(500).json({ message: 'Erro ao atualizar status do pedido.' });
  }
});

module.exports = router;
