// src/controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const usuariosModel = require('../models/usuarios.model');

async function login(req, res) {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const senha = (req.body.senha || '').trim();
    const tipo = (req.body.tipo || '').trim();

    // Busca usuário
    const user = await usuariosModel.buscarPorEmail(email);

    // Se não achou usuário → login inválido
    if (!user) {
      return res.status(401).json({ ok: false, mensagem: 'E-mail ou senha inválidos.' });
    }

    // Se quiser validar tipo (recomendado quando há telas separadas)
    if (tipo && user.tipo !== tipo) {
      return res.status(401).json({ ok: false, mensagem: 'E-mail ou senha inválidos.' });
    }

    const senhaBanco = (user.senha || '').trim();

    // Detecta se é hash bcrypt
    const pareceHash =
      senhaBanco.startsWith('$2a$') ||
      senhaBanco.startsWith('$2b$') ||
      senhaBanco.startsWith('$2y$');

    const senhaOk = pareceHash
      ? await bcrypt.compare(senha, senhaBanco)
      : senha === senhaBanco;

    if (!senhaOk) {
      return res.status(401).json({ ok: false, mensagem: 'E-mail ou senha inválidos.' });
    }

    // Cria sessão
    req.session.usuario_id = user.id;
    req.session.tipo = user.tipo;

    // Retorna redirect para o frontend decidir
    const redirect = (user.tipo === 'nutricionista')
      ? '/dashboard_nutri.html'
      : '/dashboard_paciente.html';

    return res.json({ ok: true, redirect });

  } catch (err) {
    // ⚠️ QUALQUER ERRO DE BANCO CAI AQUI
    console.error('Erro no login:', err.message);
    return res.status(401).json({ ok: false, mensagem: 'E-mail ou senha inválidos.' });
  }
}

async function cadastro(req, res) {
  try {
    const tipo = (req.body.tipo || '').trim(); // paciente | nutricionista
    const nome = (req.body.nome || '').trim();
    const email = (req.body.email || '').trim().toLowerCase();
    const senha = (req.body.senha || '').trim();
    const nascimento = (req.body.nascimento || '').trim();
    const telefone = (req.body.telefone || '').trim();
    const sexo = (req.body.sexo || '').trim();

    const peso = req.body.peso ? Number(req.body.peso) : null;
    const altura = req.body.altura ? Number(req.body.altura) : null;
    const crn = (req.body.crn || '').trim() || null;

    if (!tipo || !nome || !email || !senha) {
      return res.status(400).send('Dados obrigatórios ausentes.');
    }

    // evita email duplicado
    const existe = await usuariosModel.buscarPorEmail(email);
    if (existe) {
      return res.status(409).send('Este e-mail já está cadastrado.');
    }

    // ✅ salva senha com hash
    const senhaHash = await bcrypt.hash(senha, 10);

    const novo = await usuariosModel.criarUsuario({
      nome, email, senha: senhaHash, tipo,
      nascimento, telefone, sexo,
      crn, peso, altura
    });

    // Se for paciente, cria registro na tabela pacientes
    if (tipo === 'paciente') {
      await usuariosModel.criarPaciente(novo.id);
    }

    // ✅ redireciona para página de confirmação (HTML)
    return res.redirect('/confirmacao.html');

  } catch (err) {
    console.error('Erro no cadastro:', err.message);
    return res.status(500).send('Erro ao cadastrar. Tente novamente.');
  }
}


function logout(req, res) {
  // também pode ser JSON, mas redirect aqui é ok
  req.session.destroy(() => res.redirect('/index.html'));
}

module.exports = { login, logout, cadastro };
