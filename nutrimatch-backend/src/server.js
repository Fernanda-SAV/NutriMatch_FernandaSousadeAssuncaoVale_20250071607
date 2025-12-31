const app = require('./app');

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));

server.on('error', (err) => {
  console.error('Erro no servidor:', err);
});
