function requireLogin(req, res, next) {
  if (!req.session || !req.session.usuario_id) {
    return res.status(401).json({ mensagem: 'Não autenticado.' });
  }
  next();
}

function requireNutri(req, res, next) {
  if (req.session.tipo !== 'nutricionista') {
    return res.status(403).json({ mensagem: 'Acesso permitido apenas para nutricionista.' });
  }
  next();
}

function requirePaciente(req, res, next) {
  if (req.session.tipo !== 'paciente') {
    return res.status(403).json({ mensagem: 'Acesso permitido apenas para paciente.' });
  }
  next();
}

module.exports = { requireLogin, requireNutri, requirePaciente };
