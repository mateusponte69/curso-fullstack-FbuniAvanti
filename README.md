# Taskflow (monorepo)

Estrutura principal do repositório:

- `apps/client` — aplicação frontend (React + Vite). Contém `index.html` e `src/`.
- `apps/server` — aplicação backend / API (placeholder).
- `libs` — bibliotecas internas compartilhadas (UI, utils, types).
- `public` — assets públicos estáticos.

Scripts principais:

- `npm run dev` — inicia o frontend a partir de `apps/client` (Vite).
- `npm run build` — build do frontend em `apps/client`.

Para desenvolver localmente:

```bash
npm install
npm run dev
```

