# 🔐 Autenticação JWT + Bcrypt - TaskFlow

## 📋 Visão Geral

O TaskFlow agora usa autenticação JWT (JSON Web Tokens) com senhas criptografadas usando Bcrypt para garantir segurança.

## 🔑 Tecnologias

- **JWT (jsonwebtoken)** - Tokens de autenticação stateless
- **Bcrypt** - Hash de senhas com salt (10 rounds)

## 🛡️ Fluxo de Autenticação

### 1. Registro (Sign Up)
```
Cliente -> POST /api/register { email, password, name }
         -> bcrypt.hash(password)
         -> Salva no banco com senha hash
         <- Retorna usuário (sem senha)
```

### 2. Login
```
Cliente -> POST /api/login { email, password }
         -> Busca usuário por email
         -> bcrypt.compare(password, hashedPassword)
         -> jwt.sign({ userId, email })
         <- Retorna { token, user }
```

### 3. Requisições Autenticadas
```
Cliente -> GET /api/tasks
         Header: Authorization: Bearer <token>
         -> authMiddleware valida token
         -> jwt.verify(token)
         -> Adiciona userId ao req
         -> Executa rota com req.userId
```

## 📡 Como Usar

### Registro de Novo Usuário

**POST** `/api/register`

```json
// Request
{
  "email": "usuario@example.com",
  "password": "senha123",
  "name": "Nome do Usuário"
}

// Response (201)
{
  "httpStatus": "https://http.dog/201.json",
  "success": true,
  "data": {
    "id": 2,
    "email": "usuario@example.com",
    "name": "Nome do Usuário",
    "createdAt": "2026-02-01T12:00:00.000Z"
  },
  "message": "Usuário criado com sucesso"
}
```

### Login

**POST** `/api/login`

```json
// Request
{
  "email": "teste@taskflow.com",
  "password": "123456"
}

// Response (200)
{
  "httpStatus": "https://http.dog/200.json",
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "teste@taskflow.com",
      "name": "Usuário Teste",
      "createdAt": "2026-02-01T10:00:00.000Z"
    }
  },
  "message": "Login realizado com sucesso"
}
```

### Requisições Protegidas

**Todas as rotas de `/api/tasks` e `/api/projects` agora exigem autenticação.**

```bash
# Header obrigatório
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Exemplo: Listar Tarefas**

```http
GET /api/tasks
Authorization: Bearer <seu-token-aqui>
```

```json
// Response (200)
{
  "httpStatus": "https://http.dog/200.json",
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Estudar React",
      "description": "Revisar hooks",
      "status": "pending",
      "userId": 1,
      "projectId": 1,
      "project": {
        "id": 1,
        "name": "Projeto Pessoal"
      }
    }
  ],
  "message": "5 tarefas encontradas"
}
```

## ⚠️ Erros de Autenticação

### Token não fornecido
```json
{
  "httpStatus": "https://http.dog/401.json",
  "success": false,
  "data": null,
  "message": "Token não fornecido"
}
```

### Token inválido
```json
{
  "httpStatus": "https://http.dog/401.json",
  "success": false,
  "data": null,
  "message": "Token inválido"
}
```

### Token expirado
```json
{
  "httpStatus": "https://http.dog/401.json",
  "success": false,
  "data": null,
  "message": "Token expirado"
}
```

### Formato incorreto
```json
{
  "httpStatus": "https://http.dog/401.json",
  "success": false,
  "data": null,
  "message": "Formato de token inválido. Use: Bearer <token>"
}
```

## 🔧 Configuração

### Variáveis de Ambiente (.env)

```env
JWT_SECRET=taskflow-super-secret-key-change-in-production-2026
```

**⚠️ IMPORTANTE:** Mude o `JWT_SECRET` em produção para uma chave forte!

### Expiração do Token

- **Padrão:** 24 horas
- Configurado em: `server/middleware/authMiddleware.js`

```javascript
jwt.sign(payload, JWT_SECRET, {
  expiresIn: '24h' // Altere aqui se necessário
});
```

## 🧪 Testando com PowerShell

### 1. Login e obter token
```powershell
$loginBody = @{
  email = "teste@taskflow.com"
  password = "123456"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri http://localhost:3000/api/login `
  -Method POST `
  -Body $loginBody `
  -ContentType "application/json"

$token = $response.data.token
Write-Host "Token: $token"
```

### 2. Usar token em requisições
```powershell
$headers = @{
  Authorization = "Bearer $token"
}

# Listar tarefas
Invoke-RestMethod -Uri http://localhost:3000/api/tasks `
  -Method GET `
  -Headers $headers

# Criar tarefa
$taskBody = @{
  title = "Nova tarefa"
  description = "Descrição"
  status = "pending"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:3000/api/tasks `
  -Method POST `
  -Headers $headers `
  -Body $taskBody `
  -ContentType "application/json"
```

## 🔐 Segurança Implementada

### ✅ Hash de Senhas
- Usa Bcrypt com 10 salt rounds
- Senhas nunca são armazenadas em texto plano
- Comparação segura com `bcrypt.compare()`

### ✅ Tokens JWT
- Stateless (não armazenados no servidor)
- Expiração configurável (24h)
- Assinados com secret key
- Payload contém apenas `userId` e `email`

### ✅ Middleware de Proteção
- Valida token em todas as rotas protegidas
- Extrai `userId` do token
- Garante que usuário só acessa seus próprios dados

### ✅ Validações
- Campos obrigatórios (email, password, name)
- Email único (não permite duplicatas)
- Remoção de senha nas respostas

## 📚 Estrutura de Arquivos

```
server/
├── middleware/
│   └── authMiddleware.js    # JWT validation & token generation
├── routes/
│   ├── authRoutes.js        # Login & Register (público)
│   ├── taskRoutes.js        # CRUD tasks (protegido)
│   └── projectRoutes.js     # CRUD projects (protegido)
└── repository/
    └── userRepository.js     # User operations com bcrypt
```

## 🚀 Próximos Passos (Opcionais)

1. **Refresh Tokens** - Renovar tokens sem novo login
2. **Roles/Permissions** - Diferentes níveis de acesso
3. **Rate Limiting** - Prevenir brute force em login
4. **2FA** - Autenticação de dois fatores
5. **OAuth** - Login social (Google, GitHub)
6. **Password Reset** - Recuperação de senha por email
7. **Blacklist de Tokens** - Logout forçado

## 📝 Credenciais de Teste

Após rodar `npm run prisma:seed`:

- **Email:** teste@taskflow.com
- **Senha:** 123456 (agora com hash bcrypt)

## 🔍 Debugging

### Ver payload do token
```javascript
import jwt from 'jsonwebtoken';

const decoded = jwt.decode(token);
console.log(decoded);
// { userId: 1, email: 'teste@taskflow.com', iat: ..., exp: ... }
```

### Verificar hash de senha
```javascript
import bcrypt from 'bcrypt';

const isValid = await bcrypt.compare('123456', hashedPassword);
console.log(isValid); // true ou false
```

---

✅ **Autenticação JWT + Bcrypt configurada com sucesso!**
