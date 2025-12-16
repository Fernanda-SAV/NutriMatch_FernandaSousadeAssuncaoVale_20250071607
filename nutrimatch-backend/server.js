// server.js
const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const db = require('./db');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
// Importa OpenAI SDK para chamadas de IA (deve ser instalado via npm install openai)
let OpenAI;
try {
  OpenAI = require('openai');
} catch (e) {
  OpenAI = null;
}

const app = express();
const PORT = 3000;

// ---------- CONFIGURAÇÃO DO NODEMAILER (E-MAIL) ----------
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'seuemail@gmail.com',          // TODO: troque para seu e-mail
    pass: 'sua-senha-ou-app-password'    // TODO: use uma app password
  }
});

// função auxiliar para enviar o e-mail de verificação
function enviarEmailVerificacao(email, token) {
  const link = `http://localhost:3000/verificar-email?token=${token}`;

  const mailOptions = {
    from: 'NutriMatch <seuemail@gmail.com>',
    to: email,
    subject: 'Confirme seu e-mail no NutriMatch',
    text: `Olá! Para ativar sua conta no NutriMatch, clique no link: ${link}`
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error('Erro ao enviar e-mail de verificação:', err);
    } else {
      console.log('E-mail de verificação enviado:', info.response);
    }
  });
}

// ---------- MIDDLEWARES BÁSICOS ----------
app.use(express.urlencoded({ extended: true })); // para ler <form>
app.use(express.json());                         // para JSON

// sessão (para saber quem está logado)
app.use(session({
  secret: 'nutrimatch-segredo-simples',
  resave: false,
  saveUninitialized: false
}));

// =====================================================================
// Middlewares e utilidades
// =====================================================================

// Middleware de proteção: exige que o usuário seja nutricionista
function requireNutri(req, res, next) {
  if (!req.session.usuarioId || req.session.tipo !== 'nutricionista') {
    // Se não estiver logado como nutricionista, redireciona para o login de nutri
    return res.redirect('/login_nutri.html');
  }
  next();
}

// Middleware de proteção: exige que o usuário seja paciente
function requirePaciente(req, res, next) {
  if (!req.session.usuarioId || req.session.tipo !== 'paciente') {
    // Se não estiver logado como paciente, redireciona para o login de paciente
    return res.redirect('/login_paciente.html');
  }
  next();
}

// =====================================================================

// ---------- ROTAS BÁSICAS ----------
app.get('/ping', (req, res) => {
  res.send('NutriMatch backend OK');
});

// ---------- CADASTRO DE USUÁRIO ----------
app.post('/cadastro', (req, res) => {
  const {
    nome,
    email,
    senha,
    tipo,           // 'paciente' ou 'nutricionista'
    nascimento,
    telefone,
    sexo,
    peso,
    altura,
    crn            // só faz sentido se for nutricionista
  } = req.body;

  // 1) Verificar preenchimento básico
  if (!nome || !email || !senha || !tipo || !nascimento || !telefone || !sexo) {
    return res.status(400).send('Preencha todos os campos obrigatórios.');
  }

  // 2) Verificar formato de e-mail (checagem simples)
  const emailRegex = /.+@.+\..+/;
  if (!emailRegex.test(email)) {
    return res.status(400).send('E-mail em formato inválido.');
  }

  // 3) Validar força da senha
  const senhaForteRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{6,}$/;
  if (!senhaForteRegex.test(senha)) {
    return res.status(400).send(
      'Senha fraca. Ela deve ter ao menos 6 caracteres, incluindo número, letra maiúscula, letra minúscula e caractere especial.'
    );
  }

  // 4) Regras específicas para nutricionista
  if (tipo === 'nutricionista') {
    if (!crn) {
      return res.status(400).send('O CRN é obrigatório para nutricionistas.');
    }

    // validação simples de formato de CRN (exemplo CRN-11 12345 ou 11-12345)
    const crnRegex = /^(CRN-11\s*\d+|11-\d+)$/i;
    if (!crnRegex.test((crn || '').trim())) {
      return res.status(400).send('CRN em formato inválido.');
    }
    // aqui seria o ponto para futura integração com serviço oficial do CRN/CFN
  }

  // 5) Gerar hash da senha
  const senha_hash = bcrypt.hashSync(senha, 10);

  // 6) Como não haverá verificação de e-mail, não precisamos gerar token
  // de verificação. Mantemos a variável para compatibilidade com o SQL,
  // mas ela será sempre null.
  const token = null;

  // 7) Verificar se e-mail já existe
  db.get('SELECT id FROM usuarios WHERE email = ?', [email], (errSelect, row) => {
    if (errSelect) {
      console.error(errSelect);
      return res.status(500).send('Erro ao verificar e-mail existente.');
    }

    if (row) {
      return res.status(400).send('Já existe um usuário cadastrado com esse e-mail.');
    }

    // 8) Inserir usuário com email_verificado = 1 (dispensando verificação)
    // e token_verificacao definido como null. O campo token_verificacao
    // permanece para compatibilidade, mas não será utilizado.
    const insertUser = `
      INSERT INTO usuarios (nome, email, senha_hash, tipo, nascimento, telefone, sexo, email_verificado, token_verificacao, crn)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `;

    db.run(
      insertUser,
      [
        nome,
        email,
        senha_hash,
        tipo,
        nascimento,
        telefone,
        sexo,
        token,
        tipo === 'nutricionista' ? crn.trim() : null
      ],
      function (errInsert) {
        if (errInsert) {
          console.error(errInsert);
          return res.status(500).send('Erro ao cadastrar usuário.');
        }

        const usuarioId = this.lastID;

        // 9) Se for paciente, cria registro na tabela pacientes (sem meta_kcal_diaria).
        if (tipo === 'paciente') {
          db.run(
            'INSERT INTO pacientes (usuario_id, peso, altura, meta_kcal_diaria) VALUES (?, ?, ?, NULL)',
            [usuarioId, peso || null, altura || null],
            (errPac) => {
              if (errPac) {
                console.error(errPac);
                return res.status(500).send('Erro ao cadastrar dados de paciente.');
              }

              // Não enviaremos e-mail de verificação. O usuário já está
              // automaticamente verificado, então redirecionamos para a página de login do paciente.
              return res.redirect('/login_paciente.html');
            }
          );
        } else {
          // Nutricionista: o usuário já está verificado; redirecionar para a página de login do nutricionista.
          return res.redirect('/login_nutri.html');
        }
      }
    );
  });
});

// ---------- LOGIN ----------
app.post('/login', (req, res) => {
  const { email, senha } = req.body;

  db.get('SELECT * FROM usuarios WHERE email = ?', [email], (err, user) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Erro ao buscar usuário.');
    }
    if (!user) {
      return res.status(401).send('Usuário não encontrado.');
    }

    // Não verificamos mais email_verificado. Todos os usuários são considerados verificados no cadastro.

    const senhaConfere = bcrypt.compareSync(senha, user.senha_hash);
    if (!senhaConfere) {
      return res.status(401).send('Senha inválida.');
    }

    // guarda info na sessão
    req.session.usuarioId = user.id;
    req.session.tipo = user.tipo;

    if (user.tipo === 'nutricionista') {
      return res.redirect('/dashboard_nutri.html');
    } else {
      return res.redirect('/dashboard_paciente.html');
    }
  });
});

// ---------- VERIFICAR E-MAIL ----------
app.get('/verificar-email', (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send('Token de verificação não informado.');
  }

  db.get(
    'SELECT id FROM usuarios WHERE token_verificacao = ?',
    [token],
    (err, user) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Erro ao buscar token.');
      }
      if (!user) {
        return res.status(400).send('Token inválido ou já utilizado.');
      }

      db.run(
        'UPDATE usuarios SET email_verificado = 1, token_verificacao = NULL WHERE id = ?',
        [user.id],
        (errUpd) => {
          if (errUpd) {
            console.error(errUpd);
            return res.status(500).send('Erro ao confirmar e-mail.');
          }

          // Você pode depois trocar esse send por um redirect para uma página bonitinha
          return res.send('E-mail confirmado com sucesso! Você já pode fazer login.');
        }
      );
    }
  );
});

// ---------- RECEITAS ----------
app.post('/receitas', (req, res) => {
  const { nome, descricao, kcal_total, modo_preparo } = req.body;

  if (!nome || !kcal_total) {
    return res.status(400).send('Nome e kcal são obrigatórios.');
  }

  const sql = `
    INSERT INTO receitas (nome, descricao, kcal_total, modo_preparo)
    VALUES (?, ?, ?, ?)
  `;

  db.run(sql, [nome, descricao || '', kcal_total, modo_preparo || ''], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Erro ao cadastrar receita.');
    }
    // Redireciona para a página de listagem de receitas (deve existir em public/)
    return res.redirect('/lista_receitas.html');
  });
});

app.get('/api/receitas', (req, res) => {
  db.all('SELECT * FROM receitas', [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ erro: 'Erro ao buscar receitas.' });
    }
    return res.json(rows);
  });
});

// ---------- VINCULAR PACIENTE A NUTRICIONISTA ----------
// Esta rota permite que um nutricionista vincule um paciente existente à sua lista.
// Recebe o e-mail do paciente no corpo (JSON ou x-www-form-urlencoded).
// É necessário que o usuário da sessão seja um nutricionista.
app.post('/vincular-paciente', (req, res) => {
  // garantir que há sessão e o usuário é nutricionista
  if (!req.session.usuarioId || req.session.tipo !== 'nutricionista') {
    return res.status(401).json({ mensagem: 'Usuário não autorizado.' });
  }

  // aceita tanto JSON quanto form-data
  const email = req.body.email_paciente || req.body.email;
  if (!email) {
    return res.status(400).json({ mensagem: 'Informe o e-mail do paciente.' });
  }

  // buscar usuário paciente pelo e-mail
  db.get(
    'SELECT id FROM usuarios WHERE email = ? AND tipo = ?',
    [email, 'paciente'],
    (errUser, usuarioPaciente) => {
      if (errUser) {
        console.error(errUser);
        return res.status(500).json({ mensagem: 'Erro ao buscar usuário.' });
      }
      if (!usuarioPaciente) {
        return res.status(404).json({ mensagem: 'Paciente não encontrado.' });
      }

      // verificar se já existe registro na tabela pacientes
      db.get(
        'SELECT id, nutricionista_id FROM pacientes WHERE usuario_id = ?',
        [usuarioPaciente.id],
        (errPac, pacienteRow) => {
          if (errPac) {
            console.error(errPac);
            return res.status(500).json({ mensagem: 'Erro ao buscar paciente.' });
          }

          // função auxiliar para enviar resposta de sucesso
          const sucesso = () =>
            res.json({ mensagem: 'Paciente vinculado com sucesso.' });

          // se ainda não existe registro de paciente, cria e vincula
          if (!pacienteRow) {
            db.run(
              'INSERT INTO pacientes (usuario_id, nutricionista_id, peso, altura, meta_kcal_diaria) VALUES (?, ?, NULL, NULL, NULL)',
              [usuarioPaciente.id, req.session.usuarioId],
              (errInsert) => {
                if (errInsert) {
                  console.error(errInsert);
                  return res
                    .status(500)
                    .json({ mensagem: 'Erro ao vincular paciente.' });
                }
                return sucesso();
              }
            );
          } else {
            // caso já exista, apenas atualiza o nutricionista_id
            db.run(
              'UPDATE pacientes SET nutricionista_id = ? WHERE id = ?',
              [req.session.usuarioId, pacienteRow.id],
              (errUpdate) => {
                if (errUpdate) {
                  console.error(errUpdate);
                  return res
                    .status(500)
                    .json({ mensagem: 'Erro ao atualizar vínculo.' });
                }
                return sucesso();
              }
            );
          }
        }
      );
    }
  );
});


// ---------- LISTAR PACIENTES PARA O NUTRICIONISTA ----------
// Retorna todos os pacientes vinculados ao nutricionista logado.
app.get('/api/pacientes', (req, res) => {
  if (!req.session.usuarioId || req.session.tipo !== 'nutricionista') {
    return res.status(401).json({ mensagem: 'Usuário não autorizado.' });
  }

  const sql = `
    SELECT pacientes.id AS paciente_id,
           usuarios.nome,
           usuarios.email,
           pacientes.peso,
           pacientes.altura,
           pacientes.meta_kcal_diaria
    FROM pacientes
    JOIN usuarios ON usuarios.id = pacientes.usuario_id
    WHERE pacientes.nutricionista_id = ?
  `;

  db.all(sql, [req.session.usuarioId], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ mensagem: 'Erro ao buscar pacientes.' });
    }
    return res.json(rows);
  });
});

// ---------- DESVINCULAR PACIENTE DO NUTRICIONISTA ----------
// Remove o vínculo: deixa nutricionista_id como NULL para aquele paciente.
app.post('/api/pacientes/:id/desvincular', (req, res) => {
  if (!req.session.usuarioId || req.session.tipo !== 'nutricionista') {
    return res.status(401).json({ mensagem: 'Usuário não autorizado.' });
  }

  const pacienteId = req.params.id;

  const sql = `
    UPDATE pacientes
    SET nutricionista_id = NULL
    WHERE id = ? AND nutricionista_id = ?
  `;

  db.run(sql, [pacienteId, req.session.usuarioId], function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ mensagem: 'Erro ao desvincular paciente.' });
    }

    if (this.changes === 0) {
      // ou o id não existe, ou não pertence a esse nutricionista
      return res.status(404).json({ mensagem: 'Paciente não encontrado para este nutricionista.' });
    }

    return res.json({ mensagem: 'Vínculo excluído com sucesso.' });
  });
});



// ---------- LISTAR PACIENTES PARA O NUTRICIONISTA ----------
// Retorna todos os pacientes vinculados ao nutricionista logado.
app.get('/api/pacientes', (req, res) => {
  if (!req.session.usuarioId || req.session.tipo !== 'nutricionista') {
    return res.status(401).json({ mensagem: 'Usuário não autorizado.' });
  }
  db.all(
    `
      SELECT pacientes.id AS paciente_id,
             usuarios.nome,
             usuarios.email,
             pacientes.peso,
             pacientes.altura,
             pacientes.meta_kcal_diaria
      FROM pacientes
      JOIN usuarios ON usuarios.id = pacientes.usuario_id
      WHERE pacientes.nutricionista_id = ?
    `,
    [req.session.usuarioId],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ mensagem: 'Erro ao buscar pacientes.' });
      }
      return res.json(rows);
    }
  );
});

// ---------- OBTER PLANO ALIMENTAR DO PACIENTE ----------
// Retorna o plano alimentar de uma data para o paciente logado.
// Se a data não for fornecida, usa o dia atual.
app.get('/api/plano', (req, res) => {
  if (!req.session.usuarioId) {
    return res.status(401).json({ mensagem: 'Usuário não autenticado.' });
  }
  // data no formato YYYY-MM-DD
  let dataPlano = req.query.data;
  if (!dataPlano) {
    const hoje = new Date().toISOString().slice(0, 10);
    dataPlano = hoje;
  }

  // se usuário é paciente, busca seu próprio plano
  if (req.session.tipo === 'paciente') {
    // obter id do paciente
    db.get(
      'SELECT id FROM pacientes WHERE usuario_id = ?',
      [req.session.usuarioId],
      (errPac, paciente) => {
        if (errPac) {
          console.error(errPac);
          return res.status(500).json({ mensagem: 'Erro ao buscar paciente.' });
        }
        if (!paciente) {
          return res
            .status(404)
            .json({ mensagem: 'Paciente não encontrado.' });
        }
        const pacienteId = paciente.id;
        db.all(
          `
          SELECT pr.refeicao,
                 pr.kcal_meta,
                 pr.data_plano,
                 r.id AS receita_id,
                 r.nome AS receita_nome,
                 r.descricao,
                 r.kcal_total,
                 r.modo_preparo
          FROM planos_refeicoes pr
          JOIN receitas r ON r.id = pr.receita_id
          WHERE pr.paciente_id = ? AND pr.data_plano = ?
          ORDER BY pr.refeicao
        `,
          [pacienteId, dataPlano],
          (errPlan, rows) => {
            if (errPlan) {
              console.error(errPlan);
              return res
                .status(500)
                .json({ mensagem: 'Erro ao buscar plano alimentar.' });
            }
            return res.json(rows);
          }
        );
      }
    );
  } else if (req.session.tipo === 'nutricionista') {
    // nutricionista deve fornecer paciente_id na query
    const pacienteId = req.query.paciente_id;
    if (!pacienteId) {
      return res
        .status(400)
        .json({ mensagem: 'Informe o paciente_id para consultar.' });
    }
    db.all(
      `
      SELECT pr.refeicao,
             pr.kcal_meta,
             pr.data_plano,
             r.id AS receita_id,
             r.nome AS receita_nome,
             r.descricao,
             r.kcal_total,
             r.modo_preparo
      FROM planos_refeicoes pr
      JOIN receitas r ON r.id = pr.receita_id
      WHERE pr.paciente_id = ? AND pr.data_plano = ? AND pr.nutricionista_id = ?
      ORDER BY pr.refeicao
    `,
      [pacienteId, dataPlano, req.session.usuarioId],
      (errPlan, rows) => {
        if (errPlan) {
          console.error(errPlan);
          return res
            .status(500)
            .json({ mensagem: 'Erro ao buscar plano alimentar.' });
        }
        return res.json(rows);
      }
    );
  } else {
    return res.status(403).json({ mensagem: 'Acesso não permitido.' });
  }
});

// ---------- SALVAR/ATUALIZAR PLANO ALIMENTAR ----------
// Recebe um conjunto de refeições para uma data e paciente e cria/atualiza o plano.
// Exemplo de corpo JSON:
// { paciente_id: 3, data_plano: '2025-12-10', refeicoes: [ { refeicao:'almoco', receita_id: 1, kcal_meta: 600 }, ... ] }
app.post('/api/plano', (req, res) => {
  if (!req.session.usuarioId || req.session.tipo !== 'nutricionista') {
    return res.status(401).json({ mensagem: 'Usuário não autorizado.' });
  }
  const { paciente_id, data_plano, refeicoes } = req.body;
  if (!paciente_id || !data_plano || !Array.isArray(refeicoes) || refeicoes.length === 0) {
    return res.status(400).json({ mensagem: 'Dados insuficientes para salvar o plano.' });
  }
  // Remove plano existente para a data
  db.serialize(() => {
    db.run(
      'DELETE FROM planos_refeicoes WHERE nutricionista_id = ? AND paciente_id = ? AND data_plano = ?',
      [req.session.usuarioId, paciente_id, data_plano],
      (errDel) => {
        if (errDel) {
          console.error(errDel);
          return res.status(500).json({ mensagem: 'Erro ao limpar plano antigo.' });
        }
        // Prepara statement para inserir
        const stmt = db.prepare(
          'INSERT INTO planos_refeicoes (nutricionista_id, paciente_id, refeicao, receita_id, kcal_meta, data_plano) VALUES (?, ?, ?, ?, ?, ?)'
        );
        for (const item of refeicoes) {
          stmt.run(
            req.session.usuarioId,
            paciente_id,
            item.refeicao,
            item.receita_id,
            item.kcal_meta,
            data_plano
          );
        }
        stmt.finalize((errFin) => {
          if (errFin) {
            console.error(errFin);
            return res.status(500).json({ mensagem: 'Erro ao salvar plano.' });
          }
          return res.json({ mensagem: 'Plano salvo com sucesso.' });
        });
      }
    );
  });
});

// ---------- REGISTRAR REFEIÇÃO NO DIÁRIO ----------
// Paciente confirma que comeu determinada receita numa refeição.
// Exemplo de corpo JSON: { refeicao:'almoco', receita_id: 5, origem:'substituicao', data_refeicao:'2025-12-10' }
app.post('/confirmar-refeicao', (req, res) => {
  if (!req.session.usuarioId || req.session.tipo !== 'paciente') {
    return res.status(401).json({ mensagem: 'Usuário não autorizado.' });
  }
  const { refeicao, receita_id, origem, data_refeicao } = req.body;
  if (!refeicao || !receita_id) {
    return res.status(400).json({ mensagem: 'Dados incompletos para registrar refeição.' });
  }
  // data da refeição: hoje, se não enviada
  const dataRef = data_refeicao || new Date().toISOString().slice(0, 10);
  // obter id do paciente e nutricionista
  db.get('SELECT id, nutricionista_id FROM pacientes WHERE usuario_id = ?', [req.session.usuarioId], (errPac, paciente) => {
    if (errPac) {
      console.error(errPac);
      return res.status(500).json({ mensagem: 'Erro ao buscar paciente.' });
    }
    if (!paciente) {
      return res.status(404).json({ mensagem: 'Paciente não encontrado.' });
    }
    db.run(
      'INSERT INTO diario_refeicoes (paciente_id, nutricionista_id, data_refeicao, refeicao, receita_id, origem) VALUES (?, ?, ?, ?, ?, ?)',
      [paciente.id, paciente.nutricionista_id || null, dataRef, refeicao, receita_id, origem || null],
      (errIns) => {
        if (errIns) {
          console.error(errIns);
          return res.status(500).json({ mensagem: 'Erro ao registrar refeição.' });
        }
        return res.json({ mensagem: 'Refeição registrada com sucesso.' });
      }
    );
  });
});

// ---------- OBTER DIÁRIO ALIMENTAR ----------
// Retorna o diário alimentar de uma data para o paciente logado.
// Se a data não for fornecida, retorna todas as entradas.
app.get('/api/diario', (req, res) => {
  if (!req.session.usuarioId || req.session.tipo !== 'paciente') {
    return res.status(401).json({ mensagem: 'Usuário não autorizado.' });
  }
  const dataRef = req.query.data;
  db.get('SELECT id FROM pacientes WHERE usuario_id = ?', [req.session.usuarioId], (errPac, paciente) => {
    if (errPac) {
      console.error(errPac);
      return res.status(500).json({ mensagem: 'Erro ao buscar paciente.' });
    }
    if (!paciente) {
      return res.status(404).json({ mensagem: 'Paciente não encontrado.' });
    }
    let sql = `
      SELECT dr.id, dr.data_refeicao, dr.refeicao, dr.receita_id, dr.origem,
             r.nome AS receita_nome, r.kcal_total
      FROM diario_refeicoes dr
      JOIN receitas r ON r.id = dr.receita_id
      WHERE dr.paciente_id = ?
    `;
    const params = [paciente.id];
    if (dataRef) {
      sql += ' AND dr.data_refeicao = ?';
      params.push(dataRef);
    }
    sql += ' ORDER BY dr.data_refeicao DESC, dr.refeicao';
    db.all(sql, params, (errDia, rows) => {
      if (errDia) {
        console.error(errDia);
        return res.status(500).json({ mensagem: 'Erro ao buscar diário alimentar.' });
      }
      return res.json(rows);
    });
  });
});

// ---------- GERAR RECEITA COM IA ----------
// Esta rota utiliza o serviço da OpenAI para gerar uma receita simples a partir de
// ingredientes disponíveis e uma meta calórica. É necessário configurar a
// variável de ambiente OPENAI_API_KEY e instalar o pacote openai (npm install openai).
// Apenas pacientes autenticados podem solicitar receitas.
app.post('/api/gerar-receita-ia', async (req, res) => {
  if (!req.session.usuarioId || req.session.tipo !== 'paciente') {
    return res.status(401).json({ mensagem: 'Usuário não autorizado.' });
  }
  const { ingredientes, kcal_meta } = req.body;
  if (!Array.isArray(ingredientes) || ingredientes.length === 0 || !kcal_meta) {
    return res
      .status(400)
      .json({ mensagem: 'Informe os ingredientes e a meta calórica.' });
  }
  // Verifica se o pacote OpenAI está disponível e se a chave foi configurada
  if (!OpenAI) {
    return res
      .status(500)
      .json({ mensagem: 'Pacote openai não instalado no servidor.' });
  }
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res
      .status(500)
      .json({ mensagem: 'OPENAI_API_KEY não configurado.' });
  }
  try {
    const openai = new OpenAI({ apiKey });
    const promptMessages = [
      {
        role: 'system',
        content:
          'Você é um chef de cozinha que cria receitas saudáveis e deliciosas a partir de ingredientes fornecidos. Sempre forneça as respostas no formato JSON com as chaves nome, ingredientes, calorias, modo_preparo.',
      },
      {
        role: 'user',
        content: `Ingredientes disponíveis: ${ingredientes.join(
          ', '
        )}. Meta calórica: ${kcal_meta} kcal. Crie uma receita simples que utilize apenas esses ingredientes e que se aproxime da meta calórica. Responda apenas com JSON.`,
      },
    ];
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: promptMessages,
      max_tokens: 600,
      temperature: 0.7,
    });
    const content = completion.choices && completion.choices[0]?.message?.content;
    // Tenta interpretar o JSON retornado
    let receitaGerada;
    try {
      receitaGerada = JSON.parse(content);
    } catch (jsonErr) {
      console.warn('Resposta da IA não pôde ser convertida em JSON:', jsonErr);
      receitaGerada = null;
    }
    if (!receitaGerada || !receitaGerada.nome) {
      return res.json({
        mensagem: 'Receita gerada (formato livre)',
        receita_texto: content,
      });
    }
    // Garantir que ingredientes e modo_preparo sejam strings ou arrays
    const desc = Array.isArray(receitaGerada.ingredientes)
      ? receitaGerada.ingredientes.join(', ')
      : receitaGerada.ingredientes || '';
    const modo = receitaGerada.modo_preparo || '';
    const kcalTotal = receitaGerada.calorias || null;
    // Salva a receita gerada no banco de dados
    db.run(
      'INSERT INTO receitas (nome, descricao, kcal_total, modo_preparo) VALUES (?, ?, ?, ?)',
      [receitaGerada.nome, desc, kcalTotal, modo],
      function (errInsert) {
        if (errInsert) {
          console.error(errInsert);
          return res
            .status(500)
            .json({ mensagem: 'Erro ao salvar receita gerada.' });
        }
        return res.json({ id: this.lastID, ...receitaGerada });
      }
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json({ mensagem: 'Erro ao gerar receita com IA.' });
  }
});

// ---------- LOGOUT ----------
// Destroi a sessão e redireciona para a página inicial
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// ---------- PÁGINA AGUARDE VERIFICAÇÃO ----------
// Exibe uma página informando ao usuário para verificar seu e-mail. Embora
// `aguarde-verificacao.html` esteja localizado em `public/`, definimos
// explicitamente esta rota para garantir que a página seja servida mesmo
// quando outras rotas protegidas interceptam requisições. Esta página não
// necessita de autenticação, pois é usada imediatamente após o cadastro.
app.get('/aguarde-verificacao.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'aguarde-verificacao.html'));
});

// ---------- PÁGINAS HTML PROTEGIDAS ----------
// Servem os arquivos HTML apenas se o usuário estiver logado e tiver o papel correto
app.get('/dashboard_nutri.html', requireNutri, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard_nutri.html'));
});

app.get('/gestao_paciente.html', requireNutri, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'gestao_paciente.html'));
});

app.get('/editar_pacientes.html', requireNutri, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'editar_pacientes.html'));
});

app.get('/paciente.html', requireNutri, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'paciente.html'));
});

app.get('/dashboard_paciente.html', requirePaciente, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard_paciente.html'));
});

app.get('/listagem_sugestoes.html', requirePaciente, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'listagem_sugestoes.html'));
});

app.get('/detalhe_receita.html', requirePaciente, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'detalhe_receita.html'));
});

app.get('/confirmacao.html', requirePaciente, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'confirmacao.html'));
});

// Página de cadastro de nova receita (apenas para nutricionistas)
app.get('/cadastrar_receita.html', requireNutri, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cadastrar_receita.html'));
});

// Página de listagem de receitas (apenas para nutricionistas)
app.get('/lista_receitas.html', requireNutri, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'lista_receitas.html'));
});

// ---------- SERVIR ARQUIVOS ESTÁTICOS ----------
// Colocado no fim para que as rotas acima possam interceptar antes do static
app.use(express.static(path.join(__dirname, 'public')));

// ---------- INICIAR SERVIDOR ----------
app.listen(PORT, () => {
  console.log(`Servidor NutriMatch rodando em http://localhost:${PORT}`);
});
