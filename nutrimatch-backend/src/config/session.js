const session = require('express-session');

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'dev_secret_troque_isto',
  resave: false,
  saveUninitialized: false,
});

module.exports = { sessionMiddleware };
