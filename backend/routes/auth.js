const express = require('express');
const router = express.Router();
const pool = require('../src/db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'troque_isto_para_uma_chave_secreta';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

const NAME_RE = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]{2,100}$/u;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASS = 6;

router.post('/signup', async (req, res) => {
  console.log('DEBUG signup req.body =', req.body);

  try {
    const { name, email, password, telefone, endereco } = req.body || {};

    // validações existentes
    if (!name || !NAME_RE.test(name))
      return res.status(400).json({ message: 'Nome inválido.' });

    if (!email || !EMAIL_RE.test(email))
      return res.status(400).json({ message: 'Email inválido.' });

    if (!password || password.length < MIN_PASS)
      return res.status(400).json({ message: `Senha deve ter ao menos ${MIN_PASS} caracteres.` });

    if (!endereco || endereco.trim().length < 4)
      return res.status(400).json({ message: 'Endereço inválido.' });

    const tel = telefone ? String(telefone).trim() : null;

    const [exists] = await pool.execute(
      'SELECT id_cliente, email, telefone FROM Cliente WHERE email = ? OR (telefone IS NOT NULL AND telefone = ?)',
      [email, tel]
    );

    if (exists.length > 0)
      return res.status(409).json({ message: 'Email ou telefone já cadastrado.' });

    // AGORA salva endereço também
    const [result] = await pool.execute(
      'INSERT INTO Cliente (nome, email, senha, telefone, endereco, is_admin) VALUES (?, ?, ?, ?, ?, ?)',
      [name.trim(), email, password, tel, endereco.trim(), false]
    );

    const user = {
      id_cliente: result.insertId,
      nome: name.trim(),
      email,
      endereco: endereco.trim()
    };

    const token = jwt.sign(user, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    res.status(201).json({ success: true, token, user });

  } catch (err) {
    console.error('signup error:', err);
    return res.status(500).json({ message: 'Erro interno no servidor.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !EMAIL_RE.test(email))
      return res.status(400).json({ message: 'Email inválido.' });

    if (!password)
      return res.status(400).json({ message: 'Senha obrigatória.' });

    // AGORA seleciona endereço também
    const [rows] = await pool.execute(
      'SELECT id_cliente, nome, email, senha, is_admin, endereco FROM Cliente WHERE email = ?',
      [email]
    );

    if (!rows.length)
      return res.status(401).json({ message: 'Credenciais inválidas.' });

    const userRow = rows[0];

    // senha ainda é plain-text no seu banco
    if (password !== userRow.senha)
      return res.status(401).json({ message: 'Credenciais inválidas.' });

    const user = {
      id_cliente: userRow.id_cliente,
      nome: userRow.nome,
      email: userRow.email,
      endereco: userRow.endereco,
      is_admin: !!userRow.is_admin
    };

    const token = jwt.sign(user, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    res.json({ success: true, token, user });

  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ message: 'Erro interno no servidor.' });
  }
});

module.exports = router;
