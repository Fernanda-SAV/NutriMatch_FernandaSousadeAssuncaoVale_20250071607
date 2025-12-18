require('dotenv').config();

const express = require('express');
const path = require('path');

const { sessionMiddleware } = require('./config/session');
const routes = require('./routes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(sessionMiddleware); // <- TEM QUE SER FUNÇÃO

app.use(express.static(path.join(__dirname, '..', 'public')));

app.use(routes); // <- TEM QUE SER ROUTER/FUNÇÃO

module.exports = app;
