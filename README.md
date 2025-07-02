# CB-PI | Sistema de Consulta de Instruções Técnicas

Sistema web completo para consulta inteligente das Instruções Técnicas do Corpo de Bombeiros do Piauí com análise automatizada de conformidade de memoriais descritivos.

## Funcionalidades Implementadas

### 🔍 **Sistema de Busca Inteligente**
- Busca por linguagem natural e palavras-chave
- Filtros avançados por categoria, data e tags
- Resultados ordenados por relevância
- Interface responsiva com visualização em grid ou lista

### 📚 **Biblioteca de ITs**
- Catálogo completo organizado por categorias
- Visualização detalhada de cada IT
- Filtros por popularidade e período
- Sistema de tags para organização

### 📋 **Análise de Memorial Descritivo**
- Upload de arquivos PDF, DOCX e DOC
- Análise automatizada de conformidade
- Relatórios detalhados com percentual de conformidade
- Identificação de não conformidades com referências às ITs
- Dashboard visual com status de cada item verificado

### 💻 **Interface de Usuário**
- Design moderno e responsivo
- Navegação intuitiva com header fixo
- Componentes reutilizáveis em TypeScript
- Experiência otimizada para mobile e desktop

## Stack Técnica

- **Framework**: Next.js 15 com App Router
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS 4
- **Componentes**: Lucide React para ícones
- **Upload**: React Dropzone
- **PDF**: PDF.js para visualização
- **Utilitários**: clsx, tailwind-merge

## Estrutura do Projeto

```
src/
├── app/                    # App Router do Next.js
│   ├── api/               # API Routes
│   │   ├── analise/       # Endpoint para análise de memoriais
│   │   └── instrucoes/    # Endpoint para busca de ITs
│   ├── ajuda/             # Página de ajuda
│   ├── biblioteca/        # Biblioteca de ITs
│   ├── memorial/          # Análise de memoriais
│   ├── pesquisar/         # Busca avançada
│   └── layout.tsx         # Layout principal
├── components/            # Componentes reutilizáveis
│   ├── layout/           # Componentes de layout
│   └── ui/               # Componentes de interface
├── lib/                  # Utilitários e dados
└── types/                # Definições TypeScript
```

## Páginas Implementadas

### 🏠 **Página Principal (`/`)**
- Hero section com busca principal
- Cards das categorias de ITs
- ITs mais populares
- Seção de recursos disponíveis

### 🔍 **Pesquisa (`/pesquisar`)**
- Busca avançada com filtros
- Resultados paginados
- Sidebar com filtros por categoria, data e tags
- Visualização detalhada dos resultados

### 📚 **Biblioteca (`/biblioteca`)**
- Catálogo completo de ITs
- Filtros por categoria e popularidade
- Visualização em grid ou lista
- Busca integrada

### 📋 **Memorial (`/memorial`)**
- Upload drag-and-drop de arquivos
- Análise automatizada em tempo real
- Dashboard de conformidade
- Relatório detalhado com observações

### 🆘 **Ajuda (`/ajuda`)**
- FAQ completo
- Guia de uso do sistema
- Informações de contato
- Links úteis

## API Routes

### `/api/instrucoes`
- **GET**: Lista e filtra instruções técnicas
- Parâmetros: `q`, `categoria`, `dataInicio`, `dataFim`, `tags`, `popular`, `limit`, `offset`

### `/api/analise`
- **POST**: Processa upload e análise de memoriais
- **GET**: Recupera resultados de análises anteriores

## Componentes Principais

### Interface (`/components/ui/`)
- **Button**: Botões com variantes e tamanhos
- **Card**: Container com header, content e actions
- **SearchInput**: Barra de busca com ícones
- **FileUpload**: Upload drag-and-drop com validação

### Layout (`/components/layout/`)
- **Header**: Navegação principal responsiva

## Dados e Tipos

### Tipos TypeScript (`/types/`)
- `InstrucaoTecnica`: Estrutura das ITs
- `CategoriaIT`: Categorias organizacionais
- `ResultadoAnalise`: Resultado da análise
- `ItemVerificacao`: Itens individuais verificados
- `FiltrosPesquisa`: Filtros de busca

### Mock Data (`/lib/data.ts`)
- 6 categorias de ITs (Edificações, Instalações, Prevenção, etc.)
- 7 ITs de exemplo com dados completos
- Sistema de tags e popularidade

## SEO e Performance

- **Metadata otimizada** para mecanismos de busca
- **Open Graph** configurado
- **Fontes otimizadas** (Inter) com variable fonts
- **Build otimizado** com tree-shaking
- **Componentes lazy** com Suspense
- **Static Generation** para páginas apropriadas

## Como Executar

### Desenvolvimento
```bash
npm install
npm run dev
```

### Produção
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## Próximas Implementações Sugeridas

1. **Visualizador PDF integrado** com PDF.js
2. **Autenticação e autorização** de usuários
3. **Histórico de análises** por usuário
4. **Notificações** de atualizações de ITs
5. **API real** conectada a banco de dados
6. **Busca full-text** com Elasticsearch
7. **Sistema de comentários** nas ITs
8. **Exportação de relatórios** em PDF
9. **Integração com sistemas** do CB-PI
10. **PWA** para uso offline

## Observações Técnicas

- Projeto configurado com **ESLint** e regras do Next.js
- **TypeScript** strict mode habilitado
- **Tailwind CSS** com configuração customizada
- **Componentes** totalmente tipados
- **Error boundaries** implementados
- **Suspense** para carregamento assíncrono
- **Build** otimizado para produção

O sistema está pronto para deployment e pode ser facilmente estendido com funcionalidades adicionais conforme necessário.
