# Sistema de Histórico Inteligente e Analytics de Busca

## Visão Geral

O sistema implementado adiciona capacidades avançadas de analytics e histórico inteligente ao sistema de busca do CB-PI, incluindo:

- **Histórico de buscas agrupado por contexto**
- **Analytics de termos mais buscados**  
- **Sugestões contextuais inteligentes**
- **Rastreamento de eficácia das sugestões**
- **Dashboard de analytics em tempo real**

## Arquitetura

### Modelos de Banco de Dados Adicionados

1. **SearchHistory** - Registra cada busca individual
2. **SearchGroup** - Agrupa buscas relacionadas por tópico
3. **SearchTerm** - Estatísticas globais de termos
4. **SearchSuggestion** - Sugestões disponíveis e suas métricas

### Componentes Principais

#### 1. SearchAnalytics Class (`src/lib/search-analytics.ts`)
Classe principal que gerencia todo o sistema de analytics:

```typescript
const searchAnalytics = new SearchAnalytics();

// Registrar busca
await searchAnalytics.recordSearch(context, metrics);

// Registrar clique
await searchAnalytics.recordClick(context, query, resultId, resultType);

// Obter histórico agrupado
const groups = await searchAnalytics.getUserSearchHistory(userId);

// Obter sugestões inteligentes
const suggestions = await searchAnalytics.getSmartSuggestions(query, context);
```

#### 2. APIs de Analytics

- `POST /api/analytics/search` - Registra buscas
- `POST /api/analytics/search-click` - Registra cliques
- `GET /api/analytics/top-terms` - Termos mais buscados
- `GET /api/analytics/contextual-suggestions` - Sugestões contextuais

#### 3. Componentes de Interface

- **SearchHistory** - Modal com histórico agrupado por tópicos
- **SmartSuggestions** - Sugestões contextuais em tempo real
- **SearchAnalyticsDashboard** - Dashboard de métricas
- **EnhancedSearchInterface** - Interface de busca com analytics integrado

## Funcionalidades Implementadas

### 1. Agrupamento Inteligente de Buscas

O sistema identifica automaticamente tópicos relacionados e agrupa buscas similares:

```typescript
const topics = {
  'saidas_emergencia': ['saída', 'emergência', 'escape', 'largura'],
  'iluminacao': ['iluminação', 'luz', 'autonomia', 'bateria'],
  'extintores': ['extintor', 'fogo', 'classe', 'distância'],
  // ...
};
```

### 2. Sugestões Contextuais

Gera sugestões baseadas em:
- Histórico do usuário
- Padrões de busca sequenciais  
- Termos populares relacionados
- Correção de digitação
- Autocompletar inteligente

### 3. Analytics de Performance

Rastreia métricas importantes:
- Frequência de termos
- Taxa de clique
- Taxa de sucesso
- Tempo médio de busca
- Número médio de resultados

### 4. Cache Local

Sistema de cache para melhor performance:
- Cache de sugestões (5 minutos)
- Histórico local como fallback
- Sincronização automática com servidor

## Uso dos Componentes

### Interface de Busca Melhorada

```tsx
import { EnhancedSearchInterface } from '@/components/search/EnhancedSearchInterface';

<EnhancedSearchInterface
  onSearch={handleSearch}
  userId={currentUser?.id}
  className="mb-6"
/>
```

### Dashboard de Analytics

```tsx
import { SearchAnalyticsDashboard } from '@/components/analytics/SearchAnalyticsDashboard';

<SearchAnalyticsDashboard className="mt-8" />
```

### Hook de Analytics

```tsx
import { useSearchAnalytics } from '@/components/search/EnhancedSearchInterface';

const { recordSearch, recordClick, getSearchHistory } = useSearchAnalytics(userId);

// Registrar busca
await recordSearch(query, resultsCount, duration);

// Registrar clique
await recordClick(query, resultId, 'instruction');
```

## Estrutura de Dados

### SearchHistory
```typescript
{
  id: string;
  query: string;
  filters: Json;
  resultsCount: number;
  duration: number;
  clicked: boolean;
  clickedResult?: string;
  userId?: string;
  sessionId?: string;
  searchGroupId?: string;
  timestamp: DateTime;
}
```

### SearchGroup
```typescript
{
  id: string;
  topic: string;
  keywords: string[];
  description?: string;
  frequency: number;
  lastUsed: DateTime;
  userId?: string;
  searches: SearchHistory[];
}
```

### SearchTerm
```typescript
{
  id: string;
  term: string;
  frequency: number;
  clickRate: float;
  avgResults: float;
  avgDuration: float;
  successRate: float;
  category?: string;
  relatedTerms: string[];
  lastUsed: DateTime;
}
```

## Fluxo de Dados

1. **Usuário executa busca** → `recordSearch()` → Analytics API
2. **Sistema identifica tópico** → Agrupamento automático
3. **Usuário clica em resultado** → `recordClick()` → Atualiza métricas
4. **Sistema gera sugestões** → Baseado em histórico e padrões
5. **Dashboard atualiza** → Métricas em tempo real

## Benefícios Implementados

### Para Usuários
- ✅ Histórico organizado por tópicos
- ✅ Sugestões personalizadas 
- ✅ Busca mais eficiente
- ✅ Autocorreção de digitação

### Para Administradores  
- ✅ Analytics de uso detalhados
- ✅ Termos mais buscados
- ✅ Taxa de sucesso das buscas
- ✅ Identificação de padrões

### Para o Sistema
- ✅ Melhoria contínua das sugestões
- ✅ Otimização baseada em dados
- ✅ Cache inteligente
- ✅ Performance monitorada

## Configuração

### Variáveis de Ambiente

```env
# Analytics habilitado
ENABLE_SEARCH_ANALYTICS=true

# Cache timeout (ms)
SEARCH_CACHE_TIMEOUT=300000

# Batch size para processamento
ANALYTICS_BATCH_SIZE=100
```

### Inicialização

O sistema é inicializado automaticamente quando importado. Para configurar:

```typescript
import { searchAnalytics } from '@/lib/search-analytics';

// Configurar timeout de cache (opcional)
searchAnalytics.setCacheTimeout(300000); // 5 minutos
```

## Migração do Banco

Para ativar o sistema em produção:

```bash
# Gerar migração com novos modelos
npx prisma db push

# Ou aplicar migração
npx prisma migrate deploy
```

## Monitoramento

O sistema inclui logs detalhados para monitoramento:

- Erros de registro de buscas
- Performance de sugestões
- Cache hits/misses
- Estatísticas de uso

## Próximas Melhorias

- [ ] Machine Learning para sugestões mais precisas
- [ ] Análise de sentimento das buscas
- [ ] Clustering automático de usuários
- [ ] Exportação de relatórios em PDF
- [ ] Alertas para padrões anômalos
- [ ] A/B testing de sugestões

## Desenvolvimento e Debug

Em modo de desenvolvimento, a interface mostra informações de debug:

```tsx
{process.env.NODE_ENV === 'development' && (
  <div className="debug-info">
    <p>Session ID: {sessionId}</p>
    <p>User ID: {userId}</p>
    <p>Analytics: Enabled</p>
  </div>
)}
```

---

**Status**: ✅ Implementado e funcional  
**Versão**: 1.0.0  
**Data**: Julho 2025