# nucleo-juridico-frontend

Frontend do **Sistema de Gestão de Atendimento Jurídico** — aplicação web para organizar atendimento, clientes/assistidos, triagem, documentos, orientação de professores e acompanhamento de casos em um núcleo/escritório jurídico.

---

## Stack

- **Next.js** (App Router)
- **React** + **TypeScript**
- **Tailwind CSS**
- Consumo da API REST em **FastAPI** (repositório [`nucleo-juridico-backend`](../nucleo-juridico-backend))
- Autenticação e Storage via **Supabase**

---

## Estrutura de pastas

```
nucleo-juridico-frontend/
├── public/
├── src/
│   ├── app/          # Rotas (App Router do Next.js), layouts e páginas
│   ├── components/   # Componentes de UI reutilizáveis (Button, Card, Modal, etc.)
│   ├── features/     # Módulos de domínio (atendimento, clientes, casos, triagem...)
│   ├── services/     # Clientes HTTP, integração com a API e Supabase
│   ├── hooks/        # Hooks React reutilizáveis
│   ├── lib/          # Utilitários, helpers, formatadores e configurações
│   ├── types/        # Tipagens TypeScript globais e contratos da API
│   └── styles/       # Estilos globais e configurações de tema
├── .env.example
├── .gitignore
├── PROJECT_SCOPE.md
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

### Convenções por pasta

| Pasta         | Responsabilidade                                                                 |
|---------------|----------------------------------------------------------------------------------|
| `app/`        | Define rotas, layouts e páginas. Mantém-se "fino" — delega regra para `features/`. |
| `components/` | UI genérica, sem regra de negócio. Reusável entre features.                       |
| `features/`   | Domínios do sistema. Cada feature pode ter `components/`, `hooks/` e `services/` próprios. |
| `services/`   | Cliente HTTP central (fetch/axios), integração com Supabase, interceptors.       |
| `hooks/`      | Hooks compartilhados entre features (ex.: `useDebounce`, `useAuth`).             |
| `lib/`        | Funções puras (formatadores de data, máscaras, validadores genéricos).           |
| `types/`      | Tipos globais e DTOs alinhados ao backend.                                       |
| `styles/`     | `globals.css`, variáveis de tema, tokens de design.                              |

---

## Como rodar (após o setup do projeto Next.js)

```bash
# instalar dependências
npm install

# rodar em modo desenvolvimento
npm run dev

# build de produção
npm run build && npm start
```

Antes de subir, copie `.env.example` para `.env.local` e preencha as variáveis.

---

## Documentação relacionada

- [`PROJECT_SCOPE.md`](./PROJECT_SCOPE.md) — escopo, perfis de usuário e funcionalidades planejadas.
- Repositório do backend: `nucleo-juridico-backend`.
