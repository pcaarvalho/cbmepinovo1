# 🏗️ NOVA ARQUITETURA - CB-PI INSTRUÇÕES TÉCNICAS

## 📋 **Visão Geral**

Esta é a nova arquitetura reorganizada seguindo princípios de **Clean Architecture** e **Domain-Driven Design** para melhor escalabilidade, manutenibilidade e separação de responsabilidades.

## 🎯 **Princípios Aplicados**

- **Clean Architecture** - Layers bem definidas
- **Domain-Driven Design** - Organização por domínios de negócio
- **Feature-Based Organization** - Componentes agrupados por funcionalidade
- **Separation of Concerns** - Backend/Frontend claramente separados

## 📁 **Estrutura de Diretórios**

```
src/
├── 🔌 api/                     # BACKEND API (separado do app)
│   ├── controllers/            # Controladores da API
│   ├── middleware/             # Middlewares da API
│   ├── routes/                 # Rotas originais (migradas)
│   └── validations/            # Validações de request
│
├── 🧠 core/                    # BUSINESS LOGIC (Backend)
│   ├── domains/                # Entidades e regras de domínio
│   │   ├── instructions/       # Domínio das ITs
│   │   ├── analysis/           # Domínio de análise
│   │   ├── search/             # Domínio de busca
│   │   └── users/              # Domínio de usuários
│   ├── services/               # Application services
│   ├── repositories/           # Abstrações de acesso a dados
│   └── use-cases/              # Casos de uso
│
├── 🏗️ infrastructure/          # EXTERNAL DEPENDENCIES (Backend)
│   ├── database/               # Configurações de banco
│   ├── ai/                     # Integrações AI (OpenRouter)
│   ├── storage/                # Armazenamento e cache
│   └── external-apis/          # APIs externas
│
├── 🎨 presentation/            # FRONTEND (UI & Components)
│   ├── components/             # Componentes compartilhados
│   │   ├── ui/                 # Componentes básicos
│   │   ├── forms/              # Componentes de formulário
│   │   └── layout/             # Componentes de layout
│   ├── features/               # Componentes por feature
│   │   ├── instructions/       # Componentes das ITs
│   │   ├── analysis/           # Componentes de análise
│   │   ├── search/             # Componentes de busca
│   │   ├── auth/               # Componentes de auth
│   │   └── dashboard/          # Componentes de dashboard
│   ├── hooks/                  # Custom React hooks
│   └── providers/              # Context providers
│
├── 🔄 shared/                  # SHARED UTILITIES
│   ├── types/                  # TypeScript types organizados
│   │   ├── instructions.ts     # Types do domínio ITs
│   │   ├── search.ts           # Types do domínio busca
│   │   ├── analysis.ts         # Types do domínio análise
│   │   ├── auth.ts             # Types de auth/usuários
│   │   └── common.ts           # Types comuns
│   ├── constants/              # Constantes da aplicação
│   ├── utils/                  # Funções utilitárias
│   └── validations/            # Validações compartilhadas
│
├── 🎯 app/                     # NEXT.JS APP ROUTER (Frontend Only)
│   ├── api/                    # Novos route handlers (delegates)
│   ├── biblioteca/             # Páginas da aplicação
│   ├── memorial/
│   ├── pesquisar/
│   └── layout.tsx
│
└── 📦 assets/                  # STATIC ASSETS
    ├── images/
    ├── icons/
    └── styles/
```

## 🔌 **API Layer (Backend)**

### Controllers
- **InstructionsController** - CRUD e busca de ITs
- **SearchController** - Busca inteligente e sugestões
- **AnalysisController** - Análise de documentos

### Rotas
- APIs organizadas por funcionalidade
- Delegates para controllers
- Middleware para validação e auth

## 🧠 **Core Layer (Business Logic)**

### Services
- **InstructionsService** - Lógica de negócio das ITs
- **SearchService** - Lógica de busca e AI
- **AnalysisService** - Lógica de análise de conformidade

### Domains
- Cada domínio tem suas entidades e regras
- Separação clara de responsabilidades
- Reutilização entre features

## 🏗️ **Infrastructure Layer**

### AI Integration
- Cliente OpenRouter para busca inteligente
- Configurações centralizadas
- Cache e rate limiting

### Storage
- PDF processing
- Cache service
- File management

## 🎨 **Presentation Layer (Frontend)**

### Components
- **UI**: Componentes reutilizáveis básicos
- **Features**: Componentes específicos por domínio
- **Layout**: Estrutura da aplicação

### Features Organization
- `/search/` - Toda funcionalidade de busca
- `/instructions/` - Biblioteca e visualização de ITs
- `/analysis/` - Upload e análise de documentos
- `/dashboard/` - Analytics e métricas

## 🔄 **Shared Layer**

### Types por Domínio
- **instructions.ts** - InstrucaoTecnica, CategoriaIT, etc.
- **search.ts** - SearchRequest, SearchResponse, etc.
- **analysis.ts** - ResultadoAnalise, ItemVerificacao, etc.
- **auth.ts** - User, Organization, permissions, etc.

### Constants
- Configurações centralizadas
- Labels e mensagens
- Rotas e endpoints

## 🚀 **Benefícios da Nova Arquitetura**

1. **Separação Clara**: Backend e Frontend bem separados
2. **Escalabilidade**: Fácil adicionar novos domínios
3. **Manutenibilidade**: Código organizado por responsabilidade
4. **Testabilidade**: Layers isoladas para testes
5. **Reutilização**: Componentes e services reutilizáveis
6. **Type Safety**: Types organizados por domínio

## 📝 **Migration Status**

- ✅ Estrutura de diretórios criada
- ✅ Controllers e Services implementados
- ✅ Types reorganizados por domínio
- ✅ Componentes movidos para features
- ✅ Routes delegates criadas
- ✅ Paths do TypeScript atualizados

## 🔄 **Próximos Passos**

1. Implementar Repositories concretos
2. Criar middleware de auth
3. Implementar testes unitários
4. Migrar gradualmente imports antigos
5. Adicionar documentação de APIs
6. Implementar cache strategies

---

**Resultado**: Arquitetura moderna, escalável e fácil de manter seguindo as melhores práticas de desenvolvimento!