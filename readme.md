# 🥗 NutriMatch  
## Sistema Inteligente de Apoio à Dieta Personalizada

Aplicação web desenvolvida como projeto acadêmico, com foco em acompanhamento nutricional, adesão à dieta e uso de Inteligência Artificial para substituição inteligente de refeições.

---

## 👩‍💻 Autora

**Fernanda Sousa de Assunção Vale**  
Matrícula: **20250071607**

---

## 📌 Descrição do Projeto

O **NutriMatch** é uma aplicação web que conecta **nutricionistas** e **pacientes**, permitindo a criação, acompanhamento e adaptação dinâmica de planos alimentares personalizados.

O sistema foi desenvolvido para resolver um problema comum na prática nutricional: a dificuldade do paciente em seguir fielmente o plano alimentar prescrito. Para isso, o NutriMatch oferece mecanismos inteligentes de substituição de refeições, mantendo o equilíbrio nutricional definido pelo profissional.

O grande diferencial do sistema é a integração com **Inteligência Artificial**, que permite gerar receitas personalizadas com base:
- na categoria da refeição (café da manhã, almoço, etc.);
- na meta calórica definida pelo nutricionista;
- nos ingredientes disponíveis informados pelo paciente.

---

## 🎯 Objetivos do Sistema

- Facilitar o acompanhamento nutricional contínuo  
- Aumentar a adesão do paciente ao plano alimentar  
- Oferecer flexibilidade sem comprometer metas calóricas  
- Automatizar tarefas repetitivas do nutricionista  
- Demonstrar aplicação prática de IA em um sistema real  

---

## 🚀 Funcionalidades Principais

### 🔐 Autenticação e Autorização
- Cadastro de usuários (paciente ou nutricionista)
- Login e logout
- Sessão persistente
- Controle de acesso por perfil
- Recuperação de senha

### 🧑‍⚕️ Funcionalidades do Nutricionista
- Vincular e desvincular pacientes
- Visualizar e editar dados dos pacientes
- Criar, editar e remover planos alimentares
- Definir metas calóricas por refeição
- Visualizar diário alimentar dos pacientes
- CRUD completo de receitas
- Acompanhar adesão ao plano alimentar

### 🧑‍🍳 Funcionalidades do Paciente
- Visualizar plano alimentar atual
- Confirmar refeições consumidas
- Substituir refeições não realizadas por:
  - receitas do banco (com variação calórica controlada ±10%)
  - receitas geradas por Inteligência Artificial
- Informar ingredientes disponíveis
- Visualizar histórico diário
- Editar perfil

### 🤖 Inteligência Artificial
- Geração de receitas personalizadas
- Respeito à categoria da refeição
- Aproximação da meta calórica definida
- Uso exclusivo de ingredientes informados
- Persistência automática no banco de dados
- Prevenção de duplicações via hash (`dedupe_key`)

---

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js**
- **Express**
- **SQLite** (banco de dados relacional)
- **bcryptjs** (hash de senhas)
- **express-session**
- **Hugging Face Router** (API compatível com OpenAI)

### Frontend
- HTML5  
- CSS3 (design responsivo)  
- JavaScript (Fetch API)  

### Outros
- Git & GitHub  
- SQLite3  
- Scripts de migração e versionamento de banco  

---

## 📂 Estrutura do Projeto

```bash
nutrimatch-backend/
├── public/
│   ├── css/
│   ├── images/
│   ├── js/
│   └── *.html
├── scripts/
│   ├── init-db.js
│   ├── migrate-db.js
│   ├── migrate-lite.js
│   ├── patch-db.js
│   └── patch-receitas*.js
├── src/
│   ├── config/
│   ├── controllers/
│   ├── database/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── services/
├── nutrimatch.db
├── package.json
├── package-lock.json
└── README.md
```

---

## 🧱 Arquitetura do Sistema

**Padrão adotado:** MVC + API REST

Fluxo geral:

```
Navegador (Frontend)
        ↓
HTML / CSS / JavaScript
        ↓
Express (API REST)
        ↓
Controllers
        ↓
Models
        ↓
SQLite (Banco de Dados)
        ↓
Integração IA (Hugging Face Router)
```

A Inteligência Artificial é desacoplada em um **service**, garantindo organização, manutenção e segurança.

---

## 🗃️ Modelo de Dados (Descrição)

### Principais Entidades

- **usuarios**
  - id, nome, email, senha, tipo, dados pessoais

- **pacientes**
  - id, usuario_id, dados corporais, metas

- **receitas**
  - id, nome, descrição, kcal_total, tipo_refeicao  
  - ingredientes, modo_preparo, origem, dedupe_key

- **planos_refeicoes**
  - id, paciente_id, nutricionista_id  
  - data, refeicao, kcal_meta, receita_recomendada

- **diario_alimentar**
  - id, paciente_id, data, refeicao  
  - kcal_consumida, receita_utilizada

- **alimentos**
  - nome, kcal_por_100g

> Scripts de criação, migração e patch do banco estão disponíveis na pasta `/scripts`.

---

## 🔌 Documentação da API

### Autenticação
| Método | Endpoint | Descrição |
|------|---------|----------|
| POST | /login | Login |
| POST | /cadastro | Cadastro |
| GET | /logout | Logout |
| POST | /forgot-password | Recuperação de senha |

### Pacientes
| Método | Endpoint |
|------|---------|
| GET | /api/pacientes |
| GET | /api/pacientes/:id |
| PUT | /api/pacientes/:id |
| POST | /vincular-paciente |
| POST | /api/pacientes/:id/desvincular |

### Plano Alimentar
| Método | Endpoint |
|------|---------|
| POST | /api/plano |
| GET | /api/plano |
| GET | /api/plano/:paciente_id |
| GET | /api/plano-atual |
| POST | /api/plano-atual/:paciente_id |

### Diário Alimentar
| Método | Endpoint |
|------|---------|
| POST | /confirmar-refeicao |
| GET | /api/diario |
| GET | /api/diario/:paciente_id |
| DELETE | /api/diario/:id |

### Receitas
| Método | Endpoint |
|------|---------|
| GET | /api/receitas |
| GET | /api/receitas/:id |
| POST | /api/receitas |
| PUT | /api/receitas/:id |
| DELETE | /api/receitas/:id |

### Inteligência Artificial
| Método | Endpoint |
|------|---------|
| POST | /api/gerar-receita-ia |

---

## 🔐 Segurança

- Senhas armazenadas com **hash bcrypt**
- Queries SQL parametrizadas
- Controle de acesso por perfil
- Sessões protegidas
- Variáveis sensíveis fora do repositório

---

## ⚙️ Configuração do Ambiente

### Pré-requisitos
- Node.js ≥ 18  
- npm  
- Git  

### Arquivo `.env.example`

```env
PORT=3000
SESSION_SECRET=sua_chave_secreta
HF_TOKEN=seu_token_huggingface
HF_CHAT_MODEL=HuggingFaceTB/SmolLM3-3B:hf-inference
```

---

## ▶️ Instalação e Execução

```bash
git clone https://github.com/seu-usuario/nutrimatch.git
cd nutrimatch-backend
npm install
node scripts/init-db.js
npm start
```

Acesse:  
👉 http://localhost:3000

---

## 🖼️ Capturas de Tela

*(Inserir no mínimo 8 imagens)*

- Tela inicial  
- Cadastro  
- Login  
- Dashboard Nutricionista  
- Gestão de Paciente  
- Plano Alimentar  
- Diário Alimentar  
- Geração de Receita por IA  

---

## 🎥 Vídeo Demonstrativo e 📊 Apresentação

Link da pasta com apresentação + video + codigo  
👉 **[link](https://drive.google.com/drive/folders/1ybPps9y8wFnQ4WeJLpHT_mftgjZFeaMR?usp=sharing)]**

---

## 🧠 Decisões Técnicas

- SQLite escolhido pela simplicidade e adequação ao escopo acadêmico  
- Arquitetura MVC para clareza e manutenção  
- IA desacoplada em service  
- Frontend servido estaticamente pelo backend  

---

# Configuração de Ambiente — NutriMatch

Este guia explica como configurar o projeto localmente usando variáveis de ambiente.

## 1) Criar o arquivo `.env`

Na raiz do **nutrimatch-backend**, copie o arquivo de exemplo:

- **Windows (PowerShell)**  
  `Copy-Item .env.example .env`

- **Windows (CMD)**  
  `copy .env.example .env`

- **Linux/macOS**  
  `cp .env.example .env`

Depois, abra o `.env` e preencha principalmente:

- `SESSION_SECRET`
- `HF_TOKEN` (token do Hugging Face)
- `HF_CHAT_MODEL` (modelo + provider, se quiser alterar)

## 2) Importante sobre `ia.env`

O projeto carrega variáveis tanto de `.env` quanto de `ia.env` (arquivo separado para IA).  
**Você pode escolher uma das opções abaixo:**

### Opção A (recomendada): usar apenas `.env`
- Coloque `HF_TOKEN` e `HF_CHAT_MODEL` no `.env`.
- Mantenha `ia.env` **fora do Git** (no `.gitignore`) ou remova do projeto.

### Opção B: manter `ia.env` (somente local)
- Mantenha o `HF_TOKEN` dentro de `ia.env` localmente.
- Garanta que `ia.env` esteja no `.gitignore`.
- **Nunca** suba `ia.env` com token real para o GitHub.

## 3) Rodar a aplicação

Ainda em `nutrimatch-backend`:

```bash
npm install
node scripts/init-db.js
npm start
```

Acesse:
- http://localhost:3000

## 4) Segurança (obrigatório na entrega)

- **Nunca** commitar `.env` e `ia.env`
- Subir apenas `.env.example` (sem segredos)
- Rotacionar/revogar token caso ele tenha sido exposto em algum momento


## 🔮 Melhorias Futuras

- Paginação real nas listagens  
- Relatórios gráficos de adesão  
- Upload de imagens  
- Notificações inteligentes  
- Migração para PostgreSQL  
- Aplicativo mobile  

---

## ✅ Status do Projeto

✔️ Aplicação funcional  
✔️ Backend completo  
✔️ IA integrada  
✔️ Segurança aplicada  
✔️ Pronto para avaliação acadêmica

