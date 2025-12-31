require('dotenv').config();

const express = require('express');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'ia.env') }); // <- carrega sua IA
require('dotenv').config(); // <- ainda permite usar .env também, se existir


const { sessionMiddleware } = require('./config/session');
const routes = require('./routes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(sessionMiddleware); // <- TEM QUE SER FUNÇÃO

app.use(express.static(path.join(__dirname, '..', 'public')));

app.use(routes); // <- TEM QUE SER ROUTER/FUNÇÃO

module.exports = app;
