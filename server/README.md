# 🚀 TaskFlow - Guia do Servidor Backend

## 📋 Estrutura do Servidor

O backend do TaskFlow segue arquitetura monolítica com separação de responsabilidades:

```
server/
├── server.js              # Entry point com middlewares
├── routes/                # Rotas da API
│   ├── authRoutes.js      # Login e registro
│   ├── taskRoutes.js      # CRUD de tarefas
│   └── projectRoutes.js   # CRUD de projetos
└── repository/            # Camada de dados (Prisma)
    ├── userRepository.js
    ├── taskRepository.js
    └── projectRepository.js
```

## ⚙️ Configuração Inicial

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Prisma
```bash
# Gerar Prisma Client
npm run prisma:generate

# Aplicar schema ao banco SQLite
npm run prisma:push

# Popular banco com dados de teste
npm run prisma:seed
```

### 3. Variáveis de Ambiente (.env)
```env
PORT=3000
VITE_BASE_URL=http://localhost:3000
DATABASE_URL="file:./dev.db"
FRONTEND_URL=http://localhost:5173
```

## 🎯 Executar o Servidor

### Apenas Backend
```bash
npm run dev:server
```

### Frontend + Backend (Simultaneamente)
```bash
npm run dev:all
```

### Prisma Studio (GUI do Banco)
```bash
npm run prisma:studio
```

## 📡 Endpoints da API

### 🔐 Autenticação

#### POST /api/login
**Login do usuário**
```json
// Request
{
  "email": "teste@taskflow.com",
  "password": "123456"
}

// Response
{
  "httpStatus": "https://http.dog/200.json",
  "success": true,
  "data": {
    "token": "abc123...",
    "user": {
      "id": 1,
      "email": "teste@taskflow.com",
      "name": "Usuário Teste"
    }
  },
  "message": "Login realizado com sucesso"
}
```

#### POST /api/register
**Registro de novo usuário**
```json
// Request
{
  "email": "novo@example.com",
  "password": "senha123",
  "name": "Novo Usuário"
}
```

### ✅ Tarefas (Tasks)

#### GET /api/tasks
**Lista todas as tarefas**
- Query params: `?limit=20` (máximo 100)

#### GET /api/tasks/:id
**Busca tarefa específica**

#### POST /api/tasks
**Cria nova tarefa**
```json
{
  "title": "Estudar React",
  "description": "Revisar hooks",
  "status": "pending",
  "projectId": 1
}
```

#### PUT /api/tasks/:id
**Atualiza tarefa**
```json
{
  "title": "Título atualizado",
  "status": "completed"
}
```

#### DELETE /api/tasks/:id
**Deleta tarefa**

### 📁 Projetos (Projects)

#### GET /api/projects
**Lista todos os projetos**

#### GET /api/projects/:id
**Busca projeto com suas tarefas**

#### POST /api/projects
**Cria novo projeto**
```json
{
  "name": "Novo Projeto",
  "description": "Descrição opcional"
}
```

#### PUT /api/projects/:id
**Atualiza projeto**

#### DELETE /api/projects/:id
**Deleta projeto**

## 🛠️ Middleware Pipeline

Requisição passa por:
1. **Helmet** - Headers de segurança
2. **CORS** - Permite requisições do frontend
3. **JSON Parser** - Parse do body
4. **Logger** - Log de requisições
5. **Rota específica** - Handler da rota
6. **Repository** - Acesso ao banco via Prisma
7. **Response** - JSON padronizado

## 📝 Padrão de Resposta

Todas as respostas seguem o formato:
```json
{
  "httpStatus": "https://http.dog/[code].json",
  "success": true|false,
  "data": {...} | null,
  "message": "Mensagem descritiva"
}
```

## 🔍 Debugging

### Ver logs do servidor
O servidor loga automaticamente todas as requisições:
```
[2026-02-01T12:00:00.000Z] GET /api/tasks
```

### Erros
Erros são logados com `console.error` e retornam:
```json
{
  "httpStatus": "https://http.dog/500.json",
  "success": false,
  "data": null,
  "message": "Descrição do erro"
}
```

## 🧪 Testes Manuais

### Usando PowerShell
```powershell
# Health check
Invoke-RestMethod -Uri http://localhost:3000/health

# Login
$body = @{email="teste@taskflow.com"; password="123456"} | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:3000/api/login -Method POST -Body $body -ContentType "application/json"

# Listar tarefas
Invoke-RestMethod -Uri http://localhost:3000/api/tasks
```

## 📦 Banco de Dados

### Modelo de Dados
- **User** - Usuários do sistema
- **Project** - Projetos que agrupam tarefas
- **Task** - Tarefas individuais

### Relacionamentos
- 1 User → N Projects
- 1 User → N Tasks
- 1 Project → N Tasks

### Usuário de Teste (via seed)
- **Email:** teste@taskflow.com
- **Senha:** 123456

## 🚧 Limitações do MVP

- Autenticação simulada (token mock, sem JWT)
- Senha em texto plano (em produção usar bcrypt)
- UserId fixo = 1 nas rotas (extrair de token em produção)
- SQLite para desenvolvimento (migrar para PostgreSQL/MongoDB para produção)
- Sem rate limiting
- Sem paginação avançada

## 🔄 Próximos Passos (Produção)

1. Implementar JWT real
2. Hash de senhas com bcrypt
3. Middleware de autenticação
4. Validação com Zod/Joi
5. Testes automatizados (Jest)
6. Rate limiting
7. Paginação cursor-based
8. Logs estruturados (Winston/Pino)
9. Migrar para banco real
10. Deploy (Render/Railway)
