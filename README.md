# nucleo-juridico-frontend

Frontend (Next.js) do **Sistema de Gestão de Atendimento Jurídico (NPJ-ITES)**.

---

## Descrição

Interface web para o Núcleo de Práticas Jurídicas: cadastro de assistidos, abertura e acompanhamento de atendimentos, triagem, documentos, orientação de professores, agenda de retornos, dashboard e relatórios. Consome a API REST em [nucleo-juridico-backend](../nucleo-juridico-backend).

## Objetivo

Entregar uma experiência clara para os 3 perfis do núcleo (aluno, professor, coordenação), com proteção de rotas, validações cliente-side e mensagens de erro amigáveis.

## Stack

- **Next.js 15** (App Router)
- **React 19** + **TypeScript**
- **Tailwind CSS 3**
- **React Hook Form** + **Zod**
- **@supabase/supabase-js** (peer — usado pelo backend; frontend só consome a API REST)

## Funcionalidades

- Autenticação (login, cadastro, recuperação de senha — UI)
- Dashboard customizado por perfil
- Clientes / Assistidos (CRUD com validação real de CPF e RG)
- Atendimentos (10 status, encaminhamento ao professor, tabs internas)
- Ficha de triagem (rascunho / salvar / encaminhar com validações distintas)
- Documentos (upload no Supabase Storage via backend, signed URLs)
- Casos para análise (fila do professor + tela única de análise)
- Agenda (toggle Lista / Calendário mensal)
- Relatórios (cards de KPI + gráficos de barras sem dependência externa)
- Administração (usuários, áreas jurídicas, tipos de demanda)
- Histórico e auditoria em formato Timeline reutilizável

## Perfis de acesso

A Sidebar e cada rota refletem as permissões:

| Perfil | Vê |
|---|---|
| `aluno_estagiario` | Dashboard, Clientes, Atendimentos, Agenda, Documentos, Relatórios, Perfil |
| `professor_orientador` | Igual ao aluno + **Casos para Análise** |
| `admin_coordenacao` | Tudo + **Administração** |

Usuários sem perfil veem `AccessDenied` ao tentar acessar rotas restritas.

## Estrutura

```
src/
├── app/
│   ├── layout.tsx               # RootLayout com AuthProvider
│   ├── page.tsx                 # redireciona dashboard/login
│   ├── (auth)/                  # login, forgot-password, layout sem sidebar
│   └── (app)/                   # layout autenticado: sidebar + header
│       ├── dashboard/
│       ├── clientes/
│       ├── atendimentos/
│       ├── agenda/
│       ├── documentos/
│       ├── casos-analise/
│       ├── relatorios/
│       ├── administracao/
│       ├── admin/               # subpáginas de admin
│       └── profile/
├── components/
│   ├── ui/                      # Button, Input, Select, Textarea, Card, Modal, Combobox
│   ├── layout/                  # Sidebar, Header
│   ├── feedback/                # LoadingState, EmptyState, AccessDenied, StatusBadge, Timeline
│   └── branding/                # BrandHeader (logo NPJ-ITES)
├── features/                    # módulos por domínio (auth, clients, attendances, triage, documents, orientations, appointments, admin, reports)
├── services/                    # clientes HTTP (api, auth, clients, attendances, ...)
├── lib/                         # format (máscaras, datas), validators (CPF/RG/UF), utils (cn)
├── types/                       # tipos compartilhados
└── styles/                      # globals.css (Tailwind)
```

## Como rodar localmente

```bash
# 1) instalar dependências
npm install

# 2) copiar e preencher variáveis
cp .env.example .env.local

# 3) rodar dev server
npm run dev
```

App em `http://localhost:3000`. **O backend precisa estar rodando** em `http://localhost:8000` ou na URL configurada via `NEXT_PUBLIC_API_BASE_URL`.

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | **sim** | URL pública da API. Em dev: `http://localhost:8000`. Em produção: URL do Render. |
| `NEXT_PUBLIC_SUPABASE_URL` | não* | URL do projeto Supabase. Reservada para chamadas diretas futuras — hoje o frontend só usa a API. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | não* | Chave anônima do Supabase. Reservada — hoje opcional. |
| `NEXT_PUBLIC_APP_ENV` | não | `development`, `staging` ou `production`. |

> Variáveis com prefixo `NEXT_PUBLIC_` são embutidas no bundle e visíveis no navegador. Nunca coloque aqui chaves secretas como a service-role.

## Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Dev server em `http://localhost:3000` |
| `npm run build` | Build de produção |
| `npm start` | Serve o build de produção |
| `npm run lint` | ESLint |
| `npm run type-check` | `tsc --noEmit` |

## Build de produção

```bash
npm run build
npm start
```

O `npm run build` gera build estático otimizado. A Vercel detecta automaticamente o Next.js — não precisa de configuração extra.

## Deploy

Veja [`../nucleo-juridico-backend/DEPLOY.md`](../nucleo-juridico-backend/DEPLOY.md) para o passo a passo completo (Vercel + Render + Supabase).
