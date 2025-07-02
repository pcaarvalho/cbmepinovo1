# API de Busca Inteligente CB-PI

## Visão Geral

A API `/api/search-ai` implementa um sistema de busca inteligente que combina processamento local de dados com análise por IA para fornecer respostas contextuais sobre Instruções Técnicas do Corpo de Bombeiros do Piauí.

## Arquitetura Implementada

### 🧠 Componentes Principais

1. **Rate Limiting** (`/src/lib/rate-limit.ts`)
   - Sistema em memória com fallback para Redis
   - Configuração flexível por endpoint
   - Limpeza automática de entradas expiradas
   - Limite: 10 requisições por 15 minutos por IP

2. **Cache Inteligente** (`/src/lib/search-cache.ts`)
   - Cache em memória com fallback para Redis  
   - Sistema LRU com invalidação por tags
   - Compressão automática e estatísticas detalhadas
   - TTL configurável (padrão: 1 hora)

3. **Cliente OpenRouter** (`/src/lib/openrouter-client.ts`)
   - Integração com OpenRouter API
   - Sistema de fallback local quando IA não disponível
   - Retry automático com backoff exponencial
   - Análise por palavras-chave quando offline

4. **Validação de Segurança** (`/src/lib/validations/search-validation.ts`)
   - Sanitização de entrada contra XSS e SQL Injection
   - Validação de tipos e limites
   - Sistema de warnings para consultas genéricas
   - Validação de filtros e opções

5. **Dados Mock Detalhados** (`/src/lib/data/mock-instructions.ts`)
   - Conteúdo completo das principais ITs
   - Estrutura hierárquica por capítulos
   - Dados otimizados para busca semântica

### 🚀 Endpoint Principal

**POST** `/api/search-ai`

```json
{
  "prompt": "Preciso saber sobre saídas de emergência para edificações comerciais",
  "searchTerm": "saídas emergência largura mínima",
  "filters": {
    "categoria": "emergencia",
    "severidade": "HIGH",
    "tipo": "tecnico"
  },
  "options": {
    "useCache": true,
    "maxResults": 10,
    "includeContext": true
  }
}
```

### 📊 Resposta da API

```json
{
  "success": true,
  "data": {
    "query": "consulta processada",
    "aiAnalysis": "Análise técnica detalhada da IA...",
    "results": [
      {
        "id": "IT-008-3",
        "titulo": "IT-008 - Saídas de Emergência",
        "relevanciaScore": 85,
        "aiReasoning": "Relevante pois trata de dimensionamento...",
        "contexto": "Capítulo 3 - Dimensionamento das Saídas",
        "pagina": 12,
        "trecho": "As saídas devem ter largura mínima de 1,20m...",
        "url": "/biblioteca/IT-008#pagina-12",
        "tags": ["saídas", "emergência", "largura"]
      }
    ],
    "suggestions": ["dimensionamento saídas", "normas emergência"],
    "metadata": {
      "processingTime": 850,
      "cacheHit": false,
      "modelUsed": "openrouter-mixtral-8x7b",
      "tokenUsage": {
        "prompt": 245,
        "completion": 156,
        "total": 401
      }
    }
  }
}
```

## Configuração do Ambiente

### Variáveis de Ambiente Necessárias

```env
# Obrigatórias
DATABASE_URL="postgresql://user:pass@localhost:5432/db"
NEXTAUTH_SECRET="seu-secret-aqui"
SITE_URL="https://seu-dominio.com"

# Opcionais (para funcionalidades completas)
OPENROUTER_API_KEY="sua-chave-openrouter"  # Para IA
REDIS_URL="redis://localhost:6379"         # Para cache distribuído
```

### Instalação e Configuração

1. **Instalar dependências**:
   ```bash
   cd consulta-cbm-epi
   npm install
   ```

2. **Configurar ambiente**:
   ```bash
   cp .env.example .env.local
   # Editar .env.local com suas configurações
   ```

3. **Testar a API**:
   ```bash
   npm run dev
   node test-search-ai.js
   ```

## Funcionalidades Implementadas

### ✅ Rate Limiting Inteligente
- **Memória**: Sistema básico para desenvolvimento
- **Redis**: Sistema distribuído para produção  
- **Configurável**: Limites por endpoint
- **Cleanup**: Limpeza automática de entradas expiradas

### ✅ Cache Multi-Level
- **L1 (Memória)**: Cache rápido local
- **L2 (Redis)**: Cache distribuído persistente
- **Tags**: Invalidação inteligente por categorias
- **Stats**: Métricas detalhadas de hit/miss ratio

### ✅ IA com Fallback Robusto
- **OpenRouter**: Integração com modelos avançados
- **Fallback**: Análise local por palavras-chave
- **Retry**: Sistema de retry com backoff
- **Tokens**: Controle de uso de tokens

### ✅ Segurança Completa
- **Sanitização**: Limpeza de entradas maliciosas
- **Validação**: Verificação de tipos e limites
- **XSS/SQLi**: Proteção contra ataques comuns
- **Rate Limiting**: Proteção contra abuso

### ✅ Busca Inteligente
- **Semântica**: Busca por conceitos e contexto
- **Scoring**: Sistema de relevância ponderada
- **Highlighting**: Destaque de termos encontrados
- **Sugestões**: Recomendações automáticas

## Algoritmos Implementados

### 🔍 Algoritmo de Busca
1. **Extração de Keywords**: Remoção de stopwords e tokenização
2. **Matching Semântico**: Busca por conceitos relacionados
3. **Scoring de Relevância**: Ponderação baseada em:
   - Frequência de termos (40%)
   - Análise da IA (35%)
   - Posição no documento (15%)
   - Categoria da IT (10%)
4. **Ranking**: Ordenação por relevância final

### 🧠 Sistema de Fallback
Quando a IA não está disponível:
1. **Análise por Keywords**: Identificação de termos técnicos
2. **Mapeamento de Categorias**: Associação com ITs relevantes
3. **Template de Resposta**: Geração de texto estruturado
4. **Recomendações**: Sugestões baseadas em padrões

### 💾 Estratégia de Cache
1. **Key Generation**: Hash MD5 de prompt + filtros + opções
2. **Tag Extraction**: Extração automática de tags para invalidação
3. **TTL Dinâmico**: Tempo de vida baseado na complexidade da consulta
4. **Prefetching**: Cache preventivo de consultas populares

## Performance e Monitoramento

### 📈 Métricas Coletadas
- **Response Time**: Tempo de resposta por endpoint
- **Cache Hit Rate**: Taxa de acerto do cache
- **IA Usage**: Consumo de tokens da IA
- **Error Rate**: Taxa de erro por tipo
- **Rate Limit**: Violações de limite por IP

### 🎯 Benchmarks Alvo
- **Response Time**: < 2s (95% das requisições)
- **Cache Hit Rate**: > 60% após warm-up
- **Uptime**: > 99.5%
- **Error Rate**: < 1%

### 🔧 Otimizações Aplicadas
- **Bundle Splitting**: Carregamento sob demanda
- **Memory Management**: Limpeza automática de cache
- **Connection Pooling**: Reuso de conexões HTTP
- **Compression**: Compressão gzip/brotli

## Testes e Validação

### 🧪 Casos de Teste Implementados
1. **Teste Básico**: Consulta simples sobre saídas de emergência
2. **Teste com Filtros**: Busca filtrada por categoria e severidade  
3. **Teste de Performance**: Múltiplas requisições simultâneas
4. **Teste de Fallback**: Comportamento sem IA disponível
5. **Teste de Rate Limit**: Validação de limites por IP

### 📋 Comandos de Teste
```bash
# Teste da API
node test-search-ai.js

# Teste de tipos
npm run type-check

# Teste de build
npm run build

# Teste completo
npm run test
```

## Segurança Implementada

### 🛡️ Proteções Aplicadas
- **Input Sanitization**: Limpeza de dados de entrada
- **SQL Injection**: Proteção contra injeção SQL
- **XSS Prevention**: Sanitização contra scripts maliciosos
- **Rate Limiting**: Proteção contra ataques DDoS
- **CORS**: Configuração de origem permitida
- **Headers**: Headers de segurança CSP

### 🔐 Validações de Segurança
- Comprimento máximo de strings (2000 chars)
- Validação de tipos obrigatórios
- Sanitização de caracteres especiais
- Verificação de padrões maliciosos
- Logs de atividades suspeitas

## Logs e Monitoramento

### 📝 Logs Estruturados
```javascript
// Exemplo de log de busca
{
  "timestamp": "2025-07-02T10:30:00Z",
  "level": "info",
  "event": "search_executed",
  "data": {
    "ip": "192.168.1.100",
    "prompt": "saídas emergência",
    "results": 5,
    "processingTime": 850,
    "cacheHit": false,
    "aiUsed": true,
    "tokens": 401
  }
}
```

### 📊 Métricas de Negócio
- **Consultas por IT**: Popularidade das instruções
- **Termos Mais Buscados**: Tendências de pesquisa
- **Padrões de Uso**: Horários de pico
- **Efetividade**: Taxa de cliques nos resultados

## Próximas Melhorias

### 🔮 Roadmap Técnico
1. **Vector Search**: Implementação de busca vetorial
2. **ML Models**: Modelos de ML customizados
3. **Real-time Updates**: Atualizações em tempo real
4. **Analytics Dashboard**: Dashboard de métricas
5. **API Versioning**: Versionamento da API

### 🚀 Otimizações Futuras
- **Edge Caching**: Cache em CDN
- **Query Optimization**: Otimização de consultas
- **Batch Processing**: Processamento em lote
- **Auto-scaling**: Escalonamento automático

---

## 📞 Suporte e Documentação

Para dúvidas sobre a implementação:
- Consulte os comentários no código-fonte
- Execute os testes automatizados
- Verifique os logs de aplicação
- Utilize o script de teste fornecido

**Status**: ✅ Implementação completa e funcional
**Versão**: 1.0.0
**Última atualização**: Julho 2025