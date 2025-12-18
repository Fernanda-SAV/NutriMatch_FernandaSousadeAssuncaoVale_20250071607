const express = require('express');
const path = require('path');

const { sessionMiddleware } = require('./config/session');
const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');

require('./config/env');           // carrega .env (se usar dotenv)
require('./database/init');        // cria tabelas se necessário

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);

// Frontend estático
app.use(express.static(path.join(__dirname, '..', 'public')));

// Rotas
app.use(routes);

// Erros
app.use(errorHandler);

module.exports = app;
