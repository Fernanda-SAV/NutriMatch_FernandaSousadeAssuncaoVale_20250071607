# NutriMatch — Plataforma Web de Apoio Nutricional

**Autora:** Fernanda Vale  
**Matrícula:** 20250071607

---

## 1. Descrição do Sistema
O **NutriMatch** é uma aplicação web desenvolvida para auxiliar nutricionistas e pacientes no acompanhamento e na adesão a planos alimentares personalizados. O sistema permite que o nutricionista defina metas calóricas diárias e planos de refeições, enquanto o paciente pode confirmar refeições ou solicitar substituições com base nos ingredientes disponíveis em casa, mantendo-se dentro da meta calórica estabelecida.

A proposta central do sistema é oferecer **flexibilidade alimentar com controle nutricional**, evitando que o paciente abandone a dieta por falta de ingredientes ou inviabilidade de preparo.

---

## 2. Tecnologias Utilizadas

### Backend
- **Node.js** (v18+)
- **Express.js** (v5)
- **SQLite3** (persistência de dados)
- **express-session** (controle de sessão)
- **bcryptjs** (hash de senhas)
- **OpenAI API** (geração de receitas por IA)

### Frontend
- **HTML5**
- **CSS3**
- **JavaScript (ES6)**
- **Fetch API / AJAX**

---

## 3. Pré-requisitos
- Node.js instalado
- NPM ou Yarn
- Navegador web moderno

---

## 4. Instalação
Clone ou extraia o projeto e, na pasta raiz, execute:

```bash
npm install
```

---

## 5. Execução do Projeto
Para iniciar o servidor:

```bash
node server.js
```

Acesse no navegador:

```
http://localhost:3000
```

---

## 6. Estrutura do Projeto

```
nutrimatch-backend/
├── server.js          # Servidor Express e rotas
├── db.js              # Configuração e schema do banco SQLite
├── nutrimatch.db      # Banco de dados SQLite
├── public/
│   ├── index.html
│   ├── dashboard_nutri.html
│   ├── dashboard_paciente.html
│   ├── listagem_sugestoes.html
│   ├── detalhe_receita.html
│   ├── cadastro.html
│   ├── login_nutri.html
│   ├── login_paciente.html
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js
│   └── images/
│       └── logo.png
├── package.json
└── package-lock.json
```

---

## 7. Funcionalidades Implementadas
- Sistema de autenticação (login e logout)
- Controle de sessão e autorização por tipo de usuário
- Cadastro e listagem de usuários (paciente e nutricionista)
- Vinculação de pacientes ao nutricionista
- Cadastro e listagem de receitas
- Criação e consulta de plano alimentar diário
- Confirmação de refeições
- Diário alimentar do paciente
- Substituição de refeições
- Geração de receitas por Inteligência Artificial

---

## 8. Funcionalidades Fora do Escopo desta Entrega
- Cálculo nutricional detalhado por macronutrientes
- Controle de estoque (despensa) do paciente
- Relatórios estatísticos avançados
- Exportação de dados em PDF/Excel

---

## 9. Decisões Técnicas
O projeto foi desenvolvido como um **MVP acadêmico**, utilizando uma arquitetura **monolítica simples**, onde o backend Express também serve os arquivos estáticos do frontend. Essa decisão reduz a complexidade inicial do projeto e facilita a validação funcional dos requisitos exigidos na disciplina.

A separação completa em camadas (MVC) é considerada uma evolução futura do sistema.

---

## 10. Rotas Principais da API

### Autenticação
- `POST /cadastro`
- `POST /login`
- `GET /logout`

### Receitas
- `POST /receitas`
- `GET /api/receitas`

### Pacientes
- `POST /vincular-paciente`
- `GET /api/pacientes`
- `POST /api/pacientes/:id/desvincular`

### Plano Alimentar
- `POST /api/plano`
- `GET /api/plano`

### Diário Alimentar
- `POST /confirmar-refeicao`
- `GET /api/diario`

### Inteligência Artificial
- `POST /api/gerar-receita-ia`

---

## 11. Capturas de Tela
-

---

## 12. Dificuldades Encontradas
- Integração entre frontend e backend com controle de sessão
- Organização do fluxo de substituição de refeições
- Definição das regras de geração de receitas por IA

Essas dificuldades foram resolvidas com validações adicionais, testes manuais e refinamento progressivo da estrutura do código.

---

**NutriMatch — Flexibilidade real no plano alimentar.**

