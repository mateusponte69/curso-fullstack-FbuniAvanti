# TaskFlow - To-Do List Full Stack

Aplicação moderna de gerenciamento de tarefas (To-Do List) com arquitetura full stack. Backend em Node.js + Express + Prisma, frontend em React + Vite + Tailwind CSS.

> **Projeto Final Avanti - FBuni 2026**  
> Sistema completo de tarefas com autenticação JWT, projetos customizados e sincronização em tempo real.

---

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 20+
- npm ou yarn

### Instalação Completa

```bash
# Clone o repositório
git clone <repo-url>
cd projeto-final-fbuni-avanti

# Instale dependências (raiz, client e server)
npm install

# Configure banco de dados (SQLite para desenvolvimento)
cd prisma
npx prisma generate
npx prisma db push
npx prisma db seed

# Inicie backend e frontend simultaneamente
npm run dev
```

**Acesse:** Frontend em `http://localhost:5173` | Backend em `http://localhost:3000`

---

## 📦 Estrutura do Projeto

```
projeto-final-fbuni-avanti/
├── client/                   # Frontend (React + Vite)
│   ├── src/
│   │   ├── app/              # Componente raiz
│   │   ├── features/         # Features por módulo (auth, tasks, navigation)
│   │   └── shared/           # Componentes e serviços compartilhados
│   ├── vite.config.js        # Configuração Vite (proxy /api)
│   └── README.md             # Documentação específica do frontend
│
├── server/                   # Backend (Node.js + Express)
│   ├── routes/               # Rotas da API (auth, tasks, projects)
│   ├── repository/           # Camada de acesso a dados (Prisma)
│   ├── middleware/           # Middlewares (authMiddleware.js)
│   ├── server.js             # Entry point
│   └── README.md             # Documentação específica do backend
│
├── prisma/                   # ORM Prisma
│   ├── schema.prisma         # Modelo de dados (User, Task, Project)
│   └── seed.js               # Dados iniciais
│
├── .github/
│   └── copilot-instructions.md  # Diretrizes do projeto
│
└── package.json              # Scripts raiz (dev, build)
```

---

## 🏗️ Arquitetura

### Monolítico com Separação de Responsabilidades

- **Frontend:** SPA React que consome API REST
- **Backend:** API RESTful stateless com JWT
- **Banco:** SQLite (dev) → PostgreSQL/MongoDB (prod)

### Fluxo de Dados

```
Usuário → Frontend (React) → API REST → Backend (Express) → Prisma → SQLite
                    ↓                           ↓
            localStorage (JWT)          Validações + Auth
```

### Comunicação Frontend ↔ Backend

- Proxy Vite: `/api/*` → `http://localhost:3000/api/*`
- Autenticação: JWT Bearer Token no header `Authorization`
- Formato: JSON (Content-Type: application/json)

---

## 🎯 Funcionalidades

### Autenticação
- ✅ Login com email e senha
- ✅ JWT com expiração de 7 dias
- ✅ Middleware de autenticação em rotas protegidas

### Gerenciamento de Tarefas
- ✅ Criar tarefa (título, descrição, projeto)
- ✅ Listar tarefas (com limite de 100 por requisição)
- ✅ Editar tarefa
- ✅ Deletar tarefa
- ✅ Marcar como concluída/pendente
- ✅ Filtrar por projeto

### Gerenciamento de Projetos
- ✅ Criar projeto customizado
- ✅ Listar projetos do usuário
- ✅ Deletar projeto
- ✅ Visualizar tarefas por projeto

---

## 🛠️ Scripts Disponíveis

### Raiz do Projeto

```bash
# Desenvolvimento (frontend + backend)
npm run dev              # Inicia ambos simultaneamente

# Build
npm run build            # Build apenas do frontend

# Banco de Dados
npm run db:push          # Aplica schema ao banco
npm run db:seed          # Popula com dados de teste
npm run db:studio        # Abre Prisma Studio (GUI)
```

### Scripts Individuais

```bash
# Apenas Frontend
cd client
npm run dev              # http://localhost:5173

# Apenas Backend
cd server
npm run dev              # http://localhost:3000
```

---

## 🔐 Credenciais de Teste

Após rodar `npm run db:seed`:

- **Email:** `teste@taskflow.com`
- **Senha:** `123456`

_(Usuário criado automaticamente pelo seed.js)_

---

## 📡 Endpoints da API

### Autenticação

```
POST   /api/login          # Login (retorna JWT)
POST   /api/register       # Registrar novo usuário
```

### Tarefas (Requer JWT)

```
GET    /api/tasks          # Listar tarefas (query: ?limit=100)
GET    /api/tasks/:id      # Buscar tarefa específica
POST   /api/tasks          # Criar tarefa
PUT    /api/tasks/:id      # Atualizar tarefa
DELETE /api/tasks/:id      # Deletar tarefa
```

### Projetos (Requer JWT)

```
GET    /api/projects       # Listar projetos
GET    /api/projects/:id   # Buscar projeto específico
POST   /api/projects       # Criar projeto
PUT    /api/projects/:id   # Atualizar projeto
DELETE /api/projects/:id   # Deletar projeto
```

**Formato de Resposta:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operação realizada com sucesso"
}
```

---

## 🗃️ Modelo de Dados (Prisma)

```prisma
model User {
  id       Int       @id @default(autoincrement())
  email    String    @unique
  password String
  name     String
  tasks    Task[]
  projects Project[]
}

model Task {
  id          Int      @id @default(autoincrement())
  title       String
  description String?
  status      String   @default("pending")  // "pending" | "completed"
  userId      Int
  projectId   Int?
  user        User     @relation(fields: [userId], references: [id])
  project     Project? @relation(fields: [projectId], references: [id])
}

model Project {
  id          Int     @id @default(autoincrement())
  name        String
  description String?
  userId      Int
  user        User    @relation(fields: [userId], references: [id])
  tasks       Task[]
}
```

---

## 🌐 Deploy

### Frontend (Vercel)

1. Importe repo na Vercel
2. Configure:
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Environment Variable:** `VITE_API_URL` → URL do backend

### Backend (Render)

1. Crie Web Service no Render
2. Configure:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Environment Variables:**
     - `DATABASE_URL`: Connection string do banco
     - `JWT_SECRET`: Chave secreta para JWT
     - `PORT`: 3000

### Banco de Dados (Produção)

Migre de SQLite para PostgreSQL:

```prisma
// schema.prisma
datasource db {
  provider = "postgresql"  // Era "sqlite"
  url      = env("DATABASE_URL")
}
```

Rode migrations:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

## 🌐 Deploy no Render

> 📖 **Guia Completo:** Veja [DEPLOY.md](DEPLOY.md) para checklist detalhado, troubleshooting e comandos úteis.

### Passo 1: Criar PostgreSQL Database

1. Acesse [render.com](https://render.com) e faça login
2. Clique em **New +** → **PostgreSQL**
3. Configure:
   - **Name:** `taskflow-db` (ou nome desejado)
   - **Region:** Escolha a mais próxima (ex: Oregon, Ohio)
   - **Plan:** Free (512MB RAM, auto-sleep)
4. Clique em **Create Database**
5. **Copie a "External Database URL"** (formato: `postgresql://user:pass@host/db`)

### Passo 2: Criar Web Service

1. No Render, clique em **New +** → **Web Service**
2. Conecte seu repositório GitHub
3. Configure:
   - **Name:** `taskflow-app`
   - **Region:** Mesma do banco (baixa latência)
   - **Branch:** `main`
   - **Root Directory:** Deixe vazio (usa raiz do repo)
   - **Build Command:**
     ```bash
     npm install && npx prisma migrate deploy && npx prisma generate && npm run build
     ```
     *Ordem importante: install deps → migrations → gerar client → build frontend*
   - **Start Command:**
     ```bash
     npm start
     ```
   - **Plan:** Free

### Passo 3: Adicionar Variáveis de Ambiente

No painel do Web Service, vá em **Environment** e adicione:

| Key | Value | Onde Obter |
|-----|-------|------------|
| `DATABASE_URL` | `postgresql://...?sslmode=require` | Copiar do PostgreSQL Database (Passo 1) e **adicionar `?sslmode=require` no final** |
| `JWT_SECRET` | `abc123...` | Gere com: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `FRONTEND_URL` | `https://taskflow-app.onrender.com` | Será a URL do seu Web Service (ajuste após deploy) |
| `NODE_ENV` | `production` | Literal |
| `PORT` | `10000` | Render fornece automaticamente, mas pode definir |

### Passo 4: Deploy Automático

1. Clique em **Create Web Service**
2. Aguarde o build (5-10min na primeira vez)
3. Acesse a URL fornecida (ex: `https://taskflow-app.onrender.com`)

### Passo 5: Popular Banco com Seed (Opcional)

1. No painel do Web Service, vá em **Shell**
2. Execute:
   ```bash
   node prisma/seed.js
   ```
3. Credenciais de teste:
   - Email: `teste@taskflow.com`
   - Senha: `123456`

### Notas Importantes

- **Cold Start:** O plano free hiberna após 15min de inatividade. Primeira requisição pode levar 30-60s.
- **Logs:** Monitore erros em **Logs** no painel do Render.
- **Rebuild:** Pushs na branch `main` triggam rebuild automático.
- **Custom Domain:** Configure em **Settings** → **Custom Domain** (requer atualizar `FRONTEND_URL`).

---

## 🔍 Troubleshooting

### Backend não inicia

- **Erro:** `Cannot find module 'prisma'`
- **Solução:** Execute `npx prisma generate` na raiz do projeto

### CORS bloqueado

- **Erro:** `Access-Control-Allow-Origin`
- **Solução:** Verifique `cors({ origin: 'http://localhost:5173' })` no server.js

### Token inválido

- **Erro:** `401 Unauthorized`
- **Solução:** Faça logout e login novamente. JWT expira em 7 dias.

### Prisma Studio não abre

- **Solução:** Certifique-se que o banco foi criado: `npx prisma db push`

### Erro "Can't reach database" no Render

- **Causa:** Falta SSL ou credenciais incorretas
- **Solução:** 
  1. Verifique se `DATABASE_URL` tem `?sslmode=require` no final
  2. Confirme que copiou a URL correta (Internal ou External)
  3. Verifique se não há espaços ou aspas extras nas variáveis de ambiente
  4. Teste conexão local: `npx prisma db pull`

---

## 📚 Documentação Detalhada

- [Frontend README](client/README.md) - Setup, arquitetura e integração com API
- [Backend README](server/README.md) - Rotas, autenticação e repositórios
- [Copilot Instructions](.github/copilot-instructions.md) - Diretrizes completas do projeto

---

## 🛡️ Segurança

- ✅ Senhas hashadas com bcrypt
- ✅ JWT com expiração configurável
- ✅ Validação de inputs em todas as rotas
- ✅ CORS configurado por origem
- ✅ Helmet.js para headers de segurança (produção)

---

## 🧪 Próximos Passos

- [ ] Testes unitários (Jest)
- [ ] Testes E2E (Playwright)
- [ ] Filtros avançados (data, prioridade)
- [ ] Notificações push
- [ ] Multi-tenancy (compartilhamento de tarefas)

---

## 📄 Licença

Projeto acadêmico - Projeto Final Avanti FBuni 2026.

---

## 👥 Contribuição

Desenvolvido como parte do programa Avanti - Bootcamp Full Stack.


