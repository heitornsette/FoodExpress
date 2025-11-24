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
  try {
    const { name, email, password, telefone, endereco } = req.body || {};

    if (!name || !NAME_RE.test(name)) {
      return res.status(400).json({ message: 'Nome inválido. Use apenas letras, espaço, - ou \'.' });
    }
    if (!email || !EMAIL_RE.test(email)) {
      return res.status(400).json({ message: 'Email inválido.' });
    }
    if (!password || password.length < MIN_PASS) {
      return res.status(400).json({ message: `Senha deve ter ao menos ${MIN_PASS} caracteres.` });
    }

    // novo: endereco obrigatório
    if (!endereco || String(endereco).trim().length < 5) {
      return res.status(400).json({ message: 'Endereço inválido. Informe rua, número e cidade.' });
    }

    const tel = telefone ? String(telefone).trim() : null;

    const [exists] = await pool.execute(
      'SELECT id_cliente, email, telefone FROM Cliente WHERE email = ? OR (telefone IS NOT NULL AND telefone = ?)',
      [email, tel]
    );
    if (exists.length > 0) {
      const row = exists[0];
      if (row.email === email) return res.status(409).json({ message: 'Email já cadastrado.' });
      if (tel && row.telefone === tel) return res.status(409).json({ message: 'Telefone já cadastrado.' });
      return res.status(409).json({ message: 'Dados já cadastrados.' });
    }

    const plainPassword = password;

    const [result] = await pool.execute(
      // adiciona endereco na inserção
      'INSERT INTO Cliente (nome, email, senha, telefone, endereco, is_admin) VALUES (?, ?, ?, ?, ?, ?)',
      [name.trim(), email, plainPassword, tel, endereco.trim(), false]
    );

    const user = {
      id_cliente: result.insertId,
      nome: name.trim(),
      email,
      endereco: endereco.trim()
    };

    const token = jwt.sign(user, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    return res.status(201).json({ success: true, token, user });
  } catch (err) {
    console.error('signup error:', err);
    if (err && err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email ou telefone já cadastrado.' });
    }
    return res.status(500).json({ message: 'Erro interno no servidor.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !EMAIL_RE.test(email)) {
      return res.status(400).json({ message: 'Email inválido.' });
    }
    if (!password || password.length < 1) {
      return res.status(400).json({ message: 'Senha é obrigatória.' });
    }

    // selecionar também o endereco
    const [rows] = await pool.execute('SELECT id_cliente, nome, email, senha, is_admin, endereco FROM Cliente WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const userRow = rows[0];

    if (password !== userRow.senha) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const user = {
      id_cliente: userRow.id_cliente,
      nome: userRow.nome,
      email: userRow.email,
      is_admin: !!userRow.is_admin,
      endereco: userRow.endereco || ''
    };

    const token = jwt.sign(user, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    return res.status(200).json({ success: true, token, user });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ message: 'Erro interno no servidor.' });
  }
});

module.exports = router;
