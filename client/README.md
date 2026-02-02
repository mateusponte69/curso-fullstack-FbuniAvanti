# TaskFlow - Frontend

Aplicação web moderna de gerenciamento de tarefas (To-Do List) com React, Vite e Tailwind CSS. Interface intuitiva e responsiva para organizar projetos e tarefas com facilidade.

---

## 🚀 Setup Rápido

### Pré-requisitos
- Node.js 20+ instalado
- Backend rodando em `http://localhost:3000`

### Instalação

```bash
# Navegue para a pasta do frontend
cd client

# Instale as dependências
npm install

# Configure variáveis de ambiente (opcional)
# Crie arquivo .env na raiz do client
VITE_API_URL=http://localhost:3000/api

# Inicie o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

---

## 📦 Tech Stack

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **React** | ^18.2.0 | UI library (componentes e hooks) |
| **Vite** | ^5.0.0 | Build tool (dev server rápido) |
| **Tailwind CSS** | ^3.4.1 | Estilos utilitários (mobile-first) |
| **Lucide React** | ^0.344.0 | Ícones modernos |

**Decisões Técnicas:**
- **Vite** em vez de CRA: Build 10x mais rápido, dev server instantâneo
- **Tailwind** em vez de CSS Modules: Produtividade e consistência visual
- **JavaScript** em vez de TypeScript: Simplicidade para MVP

---

## 🏗️ Arquitetura

```
client/
├── src/
│   ├── app/                    # Raiz da aplicação
│   │   ├── App.jsx             # Componente principal (orquestra tudo)
│   │   └── main.jsx            # Entry point (monta App no DOM)
│   ├── features/               # Features organizadas por módulo
│   │   ├── auth/               # Autenticação
│   │   │   └── LoginScreen.jsx
│   │   ├── navigation/         # Navegação
│   │   │   └── Sidebar.jsx
│   │   └── tasks/              # Tarefas
│   │       ├── TaskItem.jsx
│   │       ├── TaskList.jsx
│   │       ├── TaskFormModal.jsx
│   │       └── TaskEditModal.jsx
│   └── shared/                 # Código compartilhado
│       ├── AuthContext.jsx     # Context API (estado global de auth)
│       ├── services/
│       │   └── api.js          # Serviço centralizado de API
│       └── components/         # Componentes reutilizáveis
│           ├── Badge.jsx
│           └── NavItem.jsx
├── public/                     # Assets estáticos
├── vite.config.js              # Configuração Vite (proxy /api)
└── tailwind.config.js          # Configuração Tailwind
```

**Padrão Feature-Based:**
- Cada feature é auto-contida (como módulos Angular)
- Facilita lazy loading e manutenção
- Componentes compartilhados em `shared/`

---

## 🔌 Integração com Backend

### Fluxo de Autenticação

```javascript
// 1. Usuário faz login
POST /api/login
Body: { email: "teste@taskflow.com", password: "123456" }

// 2. Backend retorna token JWT
Response: { 
  success: true,
  data: { 
    token: "eyJhbGciOiJIUzI1...", 
    user: { id: 1, name: "Teste", email: "teste@taskflow.com" } 
  }
}

// 3. Frontend salva no localStorage
localStorage.setItem('taskflow_user', JSON.stringify({ ...user, token }))

// 4. Requisições seguintes incluem header
Authorization: Bearer eyJhbGciOiJIUzI1...
```

### Exemplos de Requisições

**Listar Tarefas:**
```javascript
GET /api/tasks?limit=100
Response: {
  success: true,
  data: [
    { id: 1, title: "Estudar React", description: "...", status: "pending", projectId: 5 },
    { id: 2, title: "Deploy app", description: "...", status: "completed", projectId: null }
  ]
}
```

**Criar Tarefa:**
```javascript
POST /api/tasks
Body: { title: "Nova tarefa", description: "Detalhes...", projectId: 3 }
Response: { success: true, data: { id: 10, title: "Nova tarefa", ... } }
```

**Atualizar Status:**
```javascript
PUT /api/tasks/5
Body: { status: "completed" }
Response: { success: true, data: { id: 5, status: "completed", ... } }
```

### Conversão de Formato

O frontend e backend usam nomenclaturas diferentes:

| Backend | Frontend | Explicação |
|---------|----------|------------|
| `title` | `text` | Nome da tarefa |
| `status` | `completed` | Backend usa string ('pending'/'completed'), frontend usa boolean |
| `projectId` | `category` | Backend usa ID numérico, frontend usa ID ou 'pessoal' |

A conversão ocorre em:
- `loadTasks()` - Backend → Frontend (ao carregar)
- `addTask()` - Frontend → Backend → Frontend (ao criar)
- `updateTask()` - Frontend → Backend → Frontend (ao editar)

---

## 🎯 Funcionalidades Principais

### Gerenciamento de Tarefas
- ✅ Criar tarefa com título, descrição e projeto
- ✅ Marcar como concluída (checkbox toggle)
- ✅ Editar tarefa existente
- ✅ Deletar tarefa (com confirmação)
- ✅ Filtrar por projeto ('Hoje' mostra todas)

### Gerenciamento de Projetos
- ✅ Criar projeto customizado
- ✅ Deletar projeto customizado (não permite deletar fixos)
- ✅ Mudar filtro entre projetos

### Responsividade
- ✅ Mobile-first (Tailwind)
- ✅ Sidebar colapsável em mobile
- ✅ Modais adaptados para mobile (slide-up)

---

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento (hot reload)
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Lint (ESLint)
npm run lint
```

---

## 🔐 Credenciais de Teste

Para testar a aplicação, use:

- **Email:** `teste@taskflow.com`
- **Senha:** `123456`

_(Certifique-se que o backend foi inicializado com `npm run seed` para criar este usuário)_

---

## 🌐 Deploy

### Vercel (Recomendado)

1. Importe repositório na Vercel
2. Configure **Root Directory:** `client`
3. Defina variável de ambiente:
   - `VITE_API_URL`: URL do backend em produção (ex: `https://meu-backend.render.com/api`)
4. Deploy automático a cada push na `main`

### Build Manual

```bash
npm run build
# Arquivos estáticos gerados em dist/
# Hospede em qualquer servidor de arquivos estáticos (Netlify, GitHub Pages, etc.)
```

---

## 🐛 Troubleshooting

### Erro de CORS
- **Problema:** `Access to fetch at 'http://localhost:3000/api/tasks' has been blocked by CORS policy`
- **Solução:** Verifique se o backend tem CORS habilitado para `http://localhost:5173`

### Token Inválido
- **Problema:** Requisições retornam 401 Unauthorized
- **Solução:** Faça logout e login novamente. O token JWT expira após 7 dias.

### Proxy não funciona
- **Problema:** Requisições para `/api` retornam 404
- **Solução:** Certifique-se que o backend está rodando em `http://localhost:3000`. Confira `vite.config.js`.

### Tarefas não aparecem
- **Problema:** Lista vazia mesmo após criar tarefas
- **Solução:** Abra DevTools → Network e veja se `GET /api/tasks` retorna dados. Verifique se está logado com o usuário correto.

---

## 📚 Estrutura de Código

### App.jsx - Orquestrador Principal

Responsabilidades:
- Gerencia estado global de `tasks` e `projects`
- Sincroniza dados com backend via `api.js`
- Controla filtros e modais
- Fornece handlers CRUD para componentes filhos

**Principais funções:**
- `loadTasks()` - Carrega tarefas do backend
- `addTask()` - Cria nova tarefa
- `updateTask()` - Edita tarefa existente
- `toggleTask()` - Marca/desmarca como concluída
- `deleteTask()` - Remove tarefa

### api.js - Cliente HTTP

Centraliza todas as requisições:
- Injeta automaticamente header `Authorization` com JWT
- Trata erros de forma consistente
- Suporta variável de ambiente `VITE_API_URL`

Funções principais:
- `login(email, password)` - Autenticação
- `getTasks(limit)` - Lista tarefas
- `createTask(data)` - Cria tarefa
- `updateTask(id, data)` - Atualiza tarefa
- `deleteTask(id)` - Deleta tarefa
- `getProjects()` - Lista projetos
- `createProject(data)` - Cria projeto
- `deleteProject(id)` - Deleta projeto

---

## 🎨 Customização

### Cores (Tailwind)

Edite `tailwind.config.js` para mudar paleta:

```js
theme: {
  extend: {
    colors: {
      primary: '#3b82f6',    // Azul padrão
      secondary: '#10b981',  // Verde
      danger: '#ef4444',     // Vermelho
    }
  }
}
```

### Componentes

Todos os componentes usam Tailwind CSS inline. Exemplo:

```jsx
<button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
  Salvar
</button>
```

Para criar componente reutilizável, adicione em `shared/components/`.

---

## 📖 Recursos Adicionais

- [React Docs](https://react.dev) - Documentação oficial do React
- [Vite Guide](https://vitejs.dev/guide/) - Guia do Vite
- [Tailwind CSS](https://tailwindcss.com/docs) - Documentação do Tailwind
- [Lucide Icons](https://lucide.dev/icons/) - Biblioteca de ícones

---

## 📄 Licença

Este projeto é parte do Projeto Final Avanti - FBuni (2026).
