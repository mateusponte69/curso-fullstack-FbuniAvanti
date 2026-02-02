# 🚀 Guia Rápido de Deploy - Render

## Checklist Pré-Deploy

- [ ] Código commitado e pushado no GitHub
- [ ] `.env` no `.gitignore` (nunca commitar!)
- [ ] PostgreSQL criado no Render
- [ ] `DATABASE_URL` copiada (com `?sslmode=require`)

---

## 1️⃣ PostgreSQL Database (Render)

### Criar
1. [Dashboard Render](https://dashboard.render.com) → **New** → **PostgreSQL**
2. Name: `taskflow-db`
3. Region: Oregon (ou mais próxima)
4. Plan: **Free**
5. **Create Database**

### Copiar Connection String
1. Vá na aba **Info** ou **Connect**
2. Copie **Internal Database URL** (recomendado) ou **External**
3. **IMPORTANTE:** Adicione `?sslmode=require` no final

Exemplo:
```
postgresql://user:pass@dpg-xyz.oregon-postgres.render.com/dbname?sslmode=require
```

---

## 2️⃣ Web Service (App Node + React)

### Criar
1. Dashboard Render → **New** → **Web Service**
2. Conecte seu repo GitHub
3. Configure:

| Campo | Valor |
|-------|-------|
| **Name** | `taskflow-app` |
| **Region** | Oregon (mesma do DB) |
| **Branch** | `main` |
| **Root Directory** | *(vazio)* |
| **Build Command** | `npm install && npx prisma migrate deploy && npx prisma generate && npm run build` |
| **Start Command** | `npm start` |
| **Plan** | Free |

### Variáveis de Ambiente

Vá em **Environment** e adicione:

```bash
# Database (copiar do PostgreSQL criado)
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require

# CRÍTICO: sem isso o frontend não será servido!
NODE_ENV=production

# JWT (gerar novo)
JWT_SECRET=<rode: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">

# Frontend (será a URL do seu app)
FRONTEND_URL=https://taskflow-app.onrender.com

# Node
PORT=10000
```

**DICA:** Gere JWT_SECRET forte:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 3️⃣ Deploy

1. Clique **Create Web Service**
2. Aguarde build (5-10 min primeira vez)
3. Acesse a URL fornecida: `https://seu-app.onrender.com`

---

## 4️⃣ Popular Banco (Seed)

### Opção 1: Shell do Render
1. No painel do Web Service → **Shell** (aba superior)
2. Execute:
```bash
node prisma/seed.js
```

### Opção 2: Localmente (conectar no DB remoto)
1. Cole a `DATABASE_URL` no `.env` local (temporariamente)
2. Execute:
```bash
npx prisma db push
node prisma/seed.js
```

### Credenciais de Teste
- **Email:** `teste@taskflow.com`
- **Senha:** `123456`

---

## 🔧 Comandos Úteis

### Logs ao Vivo
Dashboard → **Logs** (aba superior)

### Rebuild Manual
Dashboard → **Manual Deploy** → **Deploy latest commit**

### Ver BD
```bash
# Localmente (com DATABASE_URL remota no .env)
npx prisma studio
```

### Migrations
```bash
# Criar nova migration localmente
npx prisma migrate dev --name nome_da_migration

# Aplicar no Render (automático no build, mas pode rodar manual via Shell)
npx prisma migrate deploy
```

---

## ⚠️ Troubleshooting

### App não acorda (404/timeout)
- **Causa:** Cold start (free tier dorme após 15min)
- **Solução:** Aguarde 30-60s, recarregue. Normal no plano free.

### "Can't reach database"
1. Verifique `?sslmode=require` na `DATABASE_URL`
2. Confirme que copiou a URL correta (Internal ou External)
3. Sem espaços/aspas extras nas env vars
4. Teste local: `npx prisma db pull`

### Build falha
1. Veja **Logs** detalhados no Render
2. Confira se todos os scripts existem no `package.json`
3. Verifique se `prisma/schema.prisma` está commitado

### Frontend 404 (rotas React)
1. Confirme que `express.static` aponta para `client/dist` (Vite usa `dist`, não `build`)
2. Verifique fallback `app.get('*', ...)` no `server.js`
3. **CRÍTICO:** `NODE_ENV=production` deve estar setado nas env vars do Render
4. Verifique se o build rodou com sucesso nos logs

### Vejo JSON {"httpStatus": ...} em vez do frontend
- **Causa:** `NODE_ENV` não está setado como `production`
- **Solução:** Adicione `NODE_ENV=production` nas Environment Variables do Render
- **Verificar:** Nos logs, deve aparecer "📦 Servindo frontend de: ..." quando o servidor inicia

### JWT inválido
- Faça logout/login novamente
- Confirme que `JWT_SECRET` é o mesmo em dev e prod

---

## 📊 Limites do Plano Free

| Recurso | Limite |
|---------|--------|
| RAM | 512 MB |
| Storage (DB) | 1 GB |
| Bandwidth | 100 GB/mês |
| Sleep | Após 15 min inatividade |
| Cold Start | 30-60s |
| Builds | Ilimitados |

**Upgrade:** Planos pagos a partir de $7/mês (sem sleep, mais RAM/CPU).

---

## 🔗 Links Úteis

- [Render Dashboard](https://dashboard.render.com)
- [Docs Render - Node.js](https://render.com/docs/deploy-node-express-app)
- [Docs Prisma - Deploy](https://www.prisma.io/docs/guides/deployment)
- [Logs do App](https://dashboard.render.com/web/YOUR_SERVICE_ID/logs)

---

## ✅ Checklist Pós-Deploy

- [ ] App acessível na URL do Render
- [ ] Login funciona (teste com `teste@taskflow.com`)
- [ ] CRUD de tarefas funciona
- [ ] Sem erros no console do navegador
- [ ] Logs do Render sem erros críticos
- [ ] (Opcional) Custom domain configurado

---

**Dúvidas?** Revise o [README.md](README.md) ou os [logs do Render](https://dashboard.render.com).
