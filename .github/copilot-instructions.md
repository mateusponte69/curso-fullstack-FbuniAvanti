# Diretrizes do Projeto Final Avanti: To-Do List Full Stack

## 1. Introdução e Visão Geral
**Propósito do Projeto:** Desenvolver um aplicativo To-Do List simples e funcional para gerenciamento de tarefas, focado em aprendizado full stack. O app permite login, criação, listagem, edição e deleção de tarefas, com filtros básicos. É monolítico, com frontend e backend no mesmo repositório, facilitando deploy e manutenção inicial.

**Escopo:**
- Incluído: Login simulado, CRUD de tarefas, filtros no frontend, integração com backend e com banco de dados Mock DB.
- Excluído: Integração com bancos reais, autenticação externa, notificações ou multi-usuário avançado.

**Objetivos:**
- Técnicos: Código claro, escalável e testável.
- De Negócio: MVP funcional para demonstração ou portfólio.
- Público-Alvo: Desenvolvedores em aprendizado (júnior/mid-level), professor de programação e recrutadores.

**Métricas de Sucesso:**
- Tempo de carga: <2s para frontend.
- Resposta API: <500ms em ambiente local.
- Cobertura de testes: >70% para funções críticas.

**Mantra:** "Isso ajuda alguém em aprendizado a aprender os conceitos básicos de full stack? Priorize clareza e simplicidade."

## 2. Requisitos Funcionais e Não-Funcionais
### Funcionais (Must-Have)
Usando uma tabela para priorização:

| Feature | Descrição | Prioridade | Responsável (Frontend/Backend) |
|-|-|-|-|
| Login | Validar email/senha simulados; Retornar token falso. | Alta | Backend (validação), Frontend (formulário). |
| Listar Tarefas | Exibir todas as tarefas do usuário logado. | Alta | Backend (fetch), Frontend (renderização com filtros). |
| Criar Projeto | Adicionar nome de novo projeto os quais tarefas menores farão parte. | Média | Backend (armazenamento), Frontend (UI/UX). |
| Criar Tarefa | Modal para adicionar título, descrição e status. | Alta | Backend (armazenamento), Frontend (UI/UX). |
| Editar/Deletar Tarefa | Atualizar ou remover tarefa existente. | Média | Backend (update/delete), Frontend (botões). |
| Marcar Concluída | Toggle de status (pendente/concluída). | Alta | Backend (update), Frontend (checkbox). |
| Filtros | Todas / Pendentes / Concluídas (via JS filter no frontend). | Média | Frontend. |
| Limitador de visualização | Seletor de visualização (10, 20, 50 tarefas). | Baixa | Frontend. |
| Limitador de requisições | Backend limita a 100 tarefas por requisição. | Média | Backend. |

### Não-Funcionais
- **Performance:** Renderizar até 100 tarefas sem lag; Usar lazy loading se necessário.
- **Acessibilidade:** Aria-labels em elementos interativos; Contraste Tailwind padrão.
- **Segurança:** Validar inputs para evitar injeções; CORS configurado.
- **Usabilidade:** Design responsivo (mobile-first com Tailwind).
- **Escalabilidade:** Estrutura permite migração para DB real sem reescrever rotas.

## 3. Arquitetura e Tech Stack
**Arquitetura Geral:** Monolítica, com frontend e backend no mesmo repo. Frontend serve via Vite; Backend via Express. Comunicação via API REST (ex: /api/tasks). Para escalabilidade, isole dados em repositório com Prisma.
**Diagrama Simples de Fluxo (Texto-Based):**
```
Usuário -> Frontend (React/Vite) -> API Requests -> Backend (Express) -> Prisma Client -> Banco de Dados de Teste (SQLite) -> Response
```

**Tech Stack (com Justificativas):**
- **Frontend:** React (^18.2.0) com Vite (build rápido, sem overkill como CRA); Tailwind CSS (^3.4.1) para estilos utilitários (rápido e customizável).
- **Backend:** Node.js (^20.10.0) com Express (^4.18.2) (simples e maduro para APIs).
- **Linguagem:** JavaScript ES6+ (moderno, sem TypeScript para simplicidade).
- **Tipagem:** JSDoc para documentação e intellisense (ex: /** @param {string} title - Título da tarefa */).
- **Dados:** Prisma 6 (^6.0.0) para ORM e conexão com banco de teste (SQLite para simulação local; facilita MVP e migração para DB real).
- **Outros:** Nenhum banco real; Use crypto nativo para IDs; Não trabalhamos com arquivos .css, usamos Tailwind CSS para estilos.
**Plano de Escalabilidade:** Mude apenas o provider no schema.prisma para MongoDB/PostgreSQL no futuro, sem alterar o código de repositório.
**Organização de Arquivos (Inspirada em Angular):**
Adotamos um padrão feature-based como no Angular (pastas por módulo/feature), para organização modular e enxuta. Evita pastas profundas; Foco em "shared" e "features". Estrutura:

```
taskflow/
├── package.json  // Dependências comuns
├── .env          // Vars como PORT=3000
├── prisma/       // Configurações do Prisma (schema.prisma, migrations se aplicável)
│   └── schema.prisma
├── client/       // Frontend (React + Vite)
│   ├── vite.config.js
│   ├── src/
│   │   ├── app/          // Raiz, como app.module em Angular
│   │   │   ├── App.jsx
│   │   │   └── main.jsx
│   │   ├── features/     // Módulos por feature, lazy-loadable
│   │   │   └── tasks/    // Feature "tasks"
│   │   │       ├── components/  // Componentes específicos (ex: TaskItem.jsx, TaskModal.jsx)
│   │   │       ├── services/    // Serviços (ex: taskService.js para fetches)
│   │   │       └── TaskList.jsx // Componente principal da feature
│   │   ├── shared/       // Compartilhados, como utils ou components genéricos
│   │   │   ├── components/  // Ex: Button.jsx, Input.jsx
│   │   │   └── utils/      // Ex: apiUtils.js
│   └── public/           // Assets
└── server/       // Backend (Node + Express)
    ├── server.js         // Entry point
    ├── routes/           // Rotas (ex: taskRoutes.js)
    └── repository/       // Dados isolados (ex: taskRepository.js com Prisma Client)
```

Isso torna enxuto: Features são auto-contidas, como módulos Angular, facilitando import lazy (ex: import('./features/tasks/TaskList')).

## 4. Regras de Codificação e Padrões
**Frontend (React):**
- Estado: Apenas useState e useEffect. Exemplo:
  ```jsx
  const [tasks, setTasks] = useState([]);
  useEffect(() => { fetchTasks(); }, []); // Carrega tarefas na montagem
  ```
- Imutabilidade: Sempre spread operator. Ex:
  ```jsx
  setTasks(prev => [...prev, newTask]); // Copia o estado anterior e adiciona nova tarefa
  ```
- Estilo: Tailwind classes no JSX (ex: className="bg-blue-500 p-4").
- Componentes: Pequenos e por feature. Naming: PascalCase para componentes (TaskItem.jsx).
- Documentação: JSDoc em funções. Ex:
  ```js
  /** @param {Object} task - Tarefa com id, title, done */
  function TaskItem({ task }) { ... }
  ```

**Backend (Express):**
- Rotas: Separe em arquivos (ex: taskRoutes.js). Exemplo:
  ```js
  router.get('/tasks', async (req, res) => res.json(await findAllTasks()));
  ```
- Dados: Use Prisma Client em taskRepository.js; Exporte funções async. Ex:
  ```js
  import { PrismaClient } from '@prisma/client';
  const prisma = new PrismaClient();
  /** @returns {Promise<Array>} Todas as tarefas */
  export async function findAllTasks() { return await prisma.task.findMany(); }
  ```
- Error Handling: Try-catch; Respostas JSON padronizadas: { httpStatus: "https://http.dog/[code].json", success: true, data: [...], message: '' }.
- Naming: camelCase para vars/funções; kebab-case para arquivos.
**Geral:**
- Indentação: 2 espaços.
- Comentários: Curto e explicativo em decisões chave.

## 5. Gerenciamento de Dependências e Ambiente
**Dependências (package.json):**
- Frontend: "react": "^18.2.0", "vite": "^5.0.0", "tailwindcss": "^3.4.1", "postcss": "^8.4.31", "autoprefixer": "^10.4.16".
- Backend: "express": "^4.18.2", "cors": "^2.8.5" (para CORS), "@prisma/client": "^6.0.0".
- Dev: "jest": "^29.7.0", "eslint": "^8.55.0", "prisma": "^6.0.0".
**Setup Instruções:**
1. npm install
2. Crie .env: PORT=3000, API_BASE_URL=http://localhost:3000, DATABASE_URL="file:./dev.db" (para SQLite de teste).
3. Rode npx prisma init --datasource-provider sqlite (configura schema.prisma).
4. Defina modelos no schema.prisma (ex: model Task { id Int @id @default(autoincrement()) ... }).
5. Rode npx prisma generate (gera Prisma Client).
6. Rode npx prisma db push (aplica schema ao DB de teste).
7. Rodar: npm run dev (concorrentemente para front/back via concurrently se necessário).
**Warnings:** Não adicione libs externas para coisas simples (ex: use fetch nativo, não axios).

## 6. Qualidade e Testes
- **Estratégia:** Devido ao prazo, serão realizados Testes Manuais documentados.
- **Ação:** Não gere arquivos `.test.js` ou `.spec.js`.
- **Foco:** Garanta que o código seja robusto para evitar erros óbvios (ex: verificar se inputs estão vazios antes de enviar).

## 7. Segurança e Best Practices
- **Básico:** Valide inputs (ex: if (!title) return {success: false}); Use helmet.js para headers (adicione como exceção: "helmet": "^7.1.0").
- **CORS:** app.use(cors({origin: 'http://localhost:5173'})); // Frontend Vite port.
- **OWASP Relevantes:** Evite injeções validando strings; Token falso no login (não armazene senhas plain).
- **Best Practices:** Log erros com console.error; Use async/await para promises.

## 8. Deploy e Manutenção

### Frontend (Hospedagem: Vercel - Gratuito)
- **Configuração:** Importar na Vercel, definir o "Root Directory" para a pasta do frontend (ex: `frontend/` ou `client/`).
- **Build:** O comando padrão do Vite (`npm run build`).

- **Variáveis:** Configurar a URL do backend nas variáveis de ambiente da Vercel (`VITE_API_URL`).

### Backend (Hospedagem: Render - Gratuito)
- **Serviço:** Usar o tipo "Web Service" no Render.com.
- **Configuração:** Definir o "Root Directory" para a pasta do backend (ex: `backend/` ou `server/`).
- **Comando de Build:** `npm install`
- **Comando de Start:** `node src/server.js`.

### CI/CD (Simplificado)
- **Não criar pipelines complexos.**
- Usar o recurso nativo de "Auto-Deploy" da Vercel e Render: Ao fazer um `git push` na branch `main`, as plataformas detectam e atualizam sozinhas.

### Manutenção e Logs
- **Logs:** `console.error` para erros críticos e `console.log` para fluxo normal.

## 9. Documentação e Contribuição
**Documentação:** README.md com setup, run commands, arquitetura e exemplos de API (ex: GET /api/tasks), JSDoc em funções.
- Changelog: Mantenha em CHANGELOG.md.
**Contribuição:**
- Branches: feature/nome (ex: feature/login).
- PRs: Descreva mudanças, adicione tests.
- Code Review: Verifique JSDoc e imutabilidade.

## 10. Riscos, Limitações e Próximos Passos
**Riscos:**
- Perda de dados: Mock DB reseta em restart; Mitigação: Adicionar persistência local (JSON file) se crítico.
- Segurança: Token falso vulnerável.

**Limitações:** Sem persistência real; Filtros no frontend podem lagar com muitas tarefas.