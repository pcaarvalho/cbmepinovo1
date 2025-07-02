/**
 * Sistema de Analytics e Histórico Inteligente de Busca
 * 
 * Funcionalidades:
 * - Rastreamento de histórico de buscas por usuário
 * - Agrupamento inteligente de buscas por contexto
 * - Analytics de termos mais buscados
 * - Sugestões contextuais baseadas em histórico
 * - Cache local para performance
 */

// Função para gerar UUIDs simples
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Tipos para o sistema de analytics
export interface SearchContext {
  userId?: string;
  sessionId: string;
  organizationId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface SearchMetrics {
  query: string;
  resultsCount: number;
  duration: number;
  timestamp: Date;
  clicked: boolean;
  clickedResult?: string;
  filters?: Record<string, any>;
}

export interface SearchGroup {
  id: string;
  topic: string;
  keywords: string[];
  description?: string;
  frequency: number;
  lastUsed: Date;
  searches: SearchHistoryEntry[];
}

export interface SearchHistoryEntry {
  id: string;
  query: string;
  timestamp: Date;
  resultsCount: number;
  duration: number;
  clicked: boolean;
  clickedResult?: string;
  filters?: Record<string, any>;
}

export interface SearchSuggestion {
  query: string;
  suggestion: string;
  type: 'autocomplete' | 'related' | 'popular' | 'contextual' | 'typo';
  score: number;
  metadata?: Record<string, any>;
}

export interface SearchTerm {
  term: string;
  frequency: number;
  clickRate: number;
  avgResults: number;
  avgDuration: number;
  successRate: number;
  category?: string;
  relatedTerms: string[];
}

/**
 * Classe principal para gerenciamento de analytics de busca
 */
export class SearchAnalytics {
  private cache = new Map<string, any>();
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  /**
   * Registra uma nova busca no sistema
   */
  async recordSearch(
    context: SearchContext,
    metrics: SearchMetrics
  ): Promise<void> {
    try {
      // Salvar no histórico local primeiro (para resposta imediata)
      this.saveToLocalHistory(context, metrics);

      // Enviar para o servidor de forma assíncrona
      await this.sendToServer('/api/analytics/search', {
        ...context,
        ...metrics,
        type: 'search_executed'
      });

      // Atualizar estatísticas de termos
      await this.updateSearchTermStats(metrics.query, metrics);

      // Identificar e agrupar buscas relacionadas
      await this.processSearchGrouping(context, metrics);

    } catch (error) {
      console.error('Erro ao registrar busca:', error);
    }
  }

  /**
   * Registra clique em resultado de busca
   */
  async recordClick(
    context: SearchContext,
    query: string,
    resultId: string,
    resultType: string
  ): Promise<void> {
    try {
      await this.sendToServer('/api/analytics/search-click', {
        ...context,
        query,
        resultId,
        resultType,
        type: 'search_click'
      });

      // Atualizar taxa de clique do termo
      await this.updateClickRate(query);

    } catch (error) {
      console.error('Erro ao registrar clique:', error);
    }
  }

  /**
   * Obtém histórico de buscas do usuário com agrupamento inteligente
   */
  async getUserSearchHistory(
    userId: string,
    limit: number = 50
  ): Promise<SearchGroup[]> {
    const cacheKey = `history_${userId}_${limit}`;
    
    // Verificar cache
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`/api/analytics/search-history?userId=${userId}&limit=${limit}`);
      const data = await response.json();

      if (data.success) {
        this.setCache(cacheKey, data.groups);
        return data.groups;
      }

      return [];
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      return this.getLocalHistory(userId);
    }
  }

  /**
   * Obtém sugestões inteligentes baseadas no contexto
   */
  async getSmartSuggestions(
    query: string,
    context: SearchContext
  ): Promise<SearchSuggestion[]> {
    const cacheKey = `suggestions_${query}_${context.userId || 'anonymous'}`;
    
    // Verificar cache
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const suggestions: SearchSuggestion[] = [];

      // 1. Sugestões de autocompletar
      const autoComplete = await this.getAutocompleteSuggestions(query);
      suggestions.push(...autoComplete);

      // 2. Sugestões baseadas no histórico do usuário
      if (context.userId) {
        const contextual = await this.getContextualSuggestions(query, context.userId);
        suggestions.push(...contextual);
      }

      // 3. Sugestões de termos populares relacionados
      const popular = await this.getPopularRelatedTerms(query);
      suggestions.push(...popular);

      // 4. Correção de digitação
      const typoCorrections = await this.getTypoCorrections(query);
      suggestions.push(...typoCorrections);

      // Ordenar por score e limitar
      const sortedSuggestions = suggestions
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      this.setCache(cacheKey, sortedSuggestions);
      return sortedSuggestions;

    } catch (error) {
      console.error('Erro ao obter sugestões:', error);
      return this.getFallbackSuggestions(query);
    }
  }

  /**
   * Obtém analytics de termos mais buscados
   */
  async getTopSearchTerms(period: '24h' | '7d' | '30d' = '7d'): Promise<SearchTerm[]> {
    const cacheKey = `top_terms_${period}`;
    
    // Verificar cache
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`/api/analytics/top-terms?period=${period}`);
      const data = await response.json();

      if (data.success) {
        this.setCache(cacheKey, data.terms);
        return data.terms;
      }

      return [];
    } catch (error) {
      console.error('Erro ao buscar termos populares:', error);
      return [];
    }
  }

  /**
   * Identifica padrões e agrupa buscas relacionadas
   */
  private async processSearchGrouping(
    context: SearchContext,
    metrics: SearchMetrics
  ): Promise<void> {
    if (!context.userId) return;

    try {
      // Analisar palavras-chave da busca
      const keywords = this.extractKeywords(metrics.query);
      
      // Identificar tópico da busca
      const topic = this.identifyTopic(keywords);

      // Buscar grupo existente ou criar novo
      await this.sendToServer('/api/analytics/search-grouping', {
        userId: context.userId,
        query: metrics.query,
        keywords,
        topic,
        timestamp: metrics.timestamp
      });

    } catch (error) {
      console.error('Erro no agrupamento de buscas:', error);
    }
  }

  /**
   * Extrai palavras-chave relevantes da query
   */
  private extractKeywords(query: string): string[] {
    // Remover stopwords em português
    const stopwords = new Set([
      'a', 'o', 'e', 'de', 'do', 'da', 'em', 'um', 'uma', 'para', 'com', 'por',
      'como', 'que', 'qual', 'onde', 'quando', 'porque', 'se', 'mas', 'ou'
    ]);

    return query
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopwords.has(word))
      .slice(0, 10); // Limitar a 10 palavras-chave
  }

  /**
   * Identifica o tópico principal da busca
   */
  private identifyTopic(keywords: string[]): string {
    // Mapear palavras-chave para tópicos
    const topicMap = {
      'saidas_emergencia': ['saida', 'emergencia', 'escape', 'evacuacao', 'largura', 'porta'],
      'iluminacao': ['iluminacao', 'luz', 'luminaria', 'lux', 'autonomia', 'bateria'],
      'extintores': ['extintor', 'extintores', 'fogo', 'classe', 'distancia'],
      'hidrantes': ['hidrante', 'hidrantes', 'pressao', 'vazao', 'mangueira', 'agua'],
      'sinalização': ['sinalizacao', 'placa', 'fotoluminescente', 'seta', 'orientacao'],
      'documentacao': ['memorial', 'art', 'rrt', 'projeto', 'documentacao', 'cronograma'],
      'estrutural': ['estrutura', 'compartimentacao', 'resistencia', 'parede', 'laje'],
      'deteccao': ['deteccao', 'detector', 'fumaca', 'alarme', 'central']
    };

    // Encontrar tópico com mais matches
    let bestTopic = 'geral';
    let bestScore = 0;

    for (const [topic, topicKeywords] of Object.entries(topicMap)) {
      const score = keywords.filter(keyword => 
        topicKeywords.some(tk => keyword.includes(tk) || tk.includes(keyword))
      ).length;

      if (score > bestScore) {
        bestScore = score;
        bestTopic = topic;
      }
    }

    return bestTopic;
  }

  /**
   * Obtém sugestões de autocompletar
   */
  private async getAutocompleteSuggestions(query: string): Promise<SearchSuggestion[]> {
    // Sugestões comuns baseadas em prefixos
    const commonSuggestions = [
      'largura mínima saída emergência',
      'autonomia iluminação emergência',
      'distância máxima extintores',
      'pressão mínima hidrantes',
      'memorial descritivo documentação'
    ];

    return commonSuggestions
      .filter(suggestion => suggestion.toLowerCase().includes(query.toLowerCase()))
      .map(suggestion => ({
        query,
        suggestion,
        type: 'autocomplete' as const,
        score: this.calculateAutocompletScore(query, suggestion)
      }));
  }

  /**
   * Obtém sugestões contextuais baseadas no histórico do usuário
   */
  private async getContextualSuggestions(
    query: string,
    userId: string
  ): Promise<SearchSuggestion[]> {
    try {
      const response = await fetch(`/api/analytics/contextual-suggestions?query=${encodeURIComponent(query)}&userId=${userId}`);
      const data = await response.json();

      return data.success ? data.suggestions : [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Obtém termos populares relacionados
   */
  private async getPopularRelatedTerms(query: string): Promise<SearchSuggestion[]> {
    // Implementação simplificada - em produção viria do banco
    const relatedTerms = {
      'saida': ['emergencia', 'largura', 'porta', 'evacuacao'],
      'iluminacao': ['autonomia', 'bateria', 'lux', 'emergencia'],
      'extintor': ['classe', 'fogo', 'distancia', 'sinalizacao'],
      'hidrante': ['pressao', 'vazao', 'mangueira', 'reservatorio']
    };

    const suggestions: SearchSuggestion[] = [];
    const queryWords = query.toLowerCase().split(' ');

    for (const word of queryWords) {
      if (relatedTerms[word as keyof typeof relatedTerms]) {
        for (const related of relatedTerms[word as keyof typeof relatedTerms]) {
          if (!query.toLowerCase().includes(related)) {
            suggestions.push({
              query,
              suggestion: `${query} ${related}`,
              type: 'related',
              score: 0.7
            });
          }
        }
      }
    }

    return suggestions.slice(0, 3);
  }

  /**
   * Obtém correções de digitação
   */
  private async getTypoCorrections(query: string): Promise<SearchSuggestion[]> {
    // Implementação básica de correção de digitação
    const corrections = {
      'saída': ['saida', 'saide', 'saída'],
      'iluminação': ['iluminacao', 'iluminaçao', 'iluminação'],
      'emergência': ['emergencia', 'emergênci', 'emergência'],
      'extintor': ['estintor', 'extingtor', 'extintor']
    };

    const suggestions: SearchSuggestion[] = [];
    
    for (const [correct, variants] of Object.entries(corrections)) {
      if (variants.some(variant => query.toLowerCase().includes(variant))) {
        suggestions.push({
          query,
          suggestion: query.replace(new RegExp(variants.join('|'), 'gi'), correct),
          type: 'typo',
          score: 0.9
        });
      }
    }

    return suggestions;
  }

  /**
   * Calcula score de sugestão de autocompletar
   */
  private calculateAutocompletScore(query: string, suggestion: string): number {
    const queryLength = query.length;
    const suggestionLength = suggestion.length;
    
    // Score baseado na proporção da query que já foi digitada
    const completion = queryLength / suggestionLength;
    
    // Bonus se a sugestão começar com a query
    const startsWithBonus = suggestion.toLowerCase().startsWith(query.toLowerCase()) ? 0.2 : 0;
    
    return Math.min(0.8 + startsWithBonus, 1.0);
  }

  /**
   * Atualiza estatísticas de termos de busca
   */
  private async updateSearchTermStats(query: string, metrics: SearchMetrics): Promise<void> {
    try {
      await this.sendToServer('/api/analytics/update-term-stats', {
        term: query,
        resultsCount: metrics.resultsCount,
        duration: metrics.duration,
        clicked: metrics.clicked
      });
    } catch (error) {
      console.error('Erro ao atualizar estatísticas:', error);
    }
  }

  /**
   * Atualiza taxa de clique de um termo
   */
  private async updateClickRate(query: string): Promise<void> {
    try {
      await this.sendToServer('/api/analytics/update-click-rate', {
        term: query,
        clicked: true
      });
    } catch (error) {
      console.error('Erro ao atualizar taxa de clique:', error);
    }
  }

  /**
   * Salva busca no histórico local (localStorage)
   */
  private saveToLocalHistory(context: SearchContext, metrics: SearchMetrics): void {
    try {
      const key = `search_history_${context.userId || context.sessionId}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      
      const entry: SearchHistoryEntry = {
        id: generateId(),
        query: metrics.query,
        timestamp: metrics.timestamp,
        resultsCount: metrics.resultsCount,
        duration: metrics.duration,
        clicked: metrics.clicked,
        clickedResult: metrics.clickedResult,
        filters: metrics.filters
      };

      existing.unshift(entry);
      
      // Manter apenas os últimos 100 registros
      if (existing.length > 100) {
        existing.splice(100);
      }

      localStorage.setItem(key, JSON.stringify(existing));
    } catch (error) {
      console.error('Erro ao salvar no histórico local:', error);
    }
  }

  /**
   * Obtém histórico local como fallback
   */
  private getLocalHistory(userId: string): SearchGroup[] {
    try {
      const key = `search_history_${userId}`;
      const history = JSON.parse(localStorage.getItem(key) || '[]');
      
      // Agrupar por tópicos baseado em palavras-chave similares
      const groups = new Map<string, SearchHistoryEntry[]>();
      
      for (const entry of history) {
        const keywords = this.extractKeywords(entry.query);
        const topic = this.identifyTopic(keywords);
        
        if (!groups.has(topic)) {
          groups.set(topic, []);
        }
        groups.get(topic)!.push(entry);
      }

      return Array.from(groups.entries()).map(([topic, searches]) => ({
        id: generateId(),
        topic,
        keywords: [...new Set(searches.flatMap(s => this.extractKeywords(s.query)))],
        frequency: searches.length,
        lastUsed: new Date(Math.max(...searches.map(s => s.timestamp.getTime()))),
        searches
      }));
    } catch (error) {
      console.error('Erro ao obter histórico local:', error);
      return [];
    }
  }

  /**
   * Obtém sugestões de fallback quando há erro
   */
  private getFallbackSuggestions(query: string): SearchSuggestion[] {
    const fallbacks = [
      'largura mínima saída emergência',
      'autonomia iluminação emergência',
      'distância máxima extintores',
      'pressão mínima hidrantes'
    ];

    return fallbacks.map(suggestion => ({
      query,
      suggestion,
      type: 'popular' as const,
      score: 0.5
    }));
  }

  /**
   * Envia dados para o servidor
   */
  private async sendToServer(endpoint: string, data: any): Promise<any> {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Gerenciamento de cache
   */
  private getFromCache(key: string): any {
    const now = Date.now();
    const expiry = this.cacheExpiry.get(key);
    
    if (expiry && now > expiry) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
      return null;
    }

    return this.cache.get(key);
  }

  private setCache(key: string, value: any): void {
    this.cache.set(key, value);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_TTL);
  }
}

// Instância singleton para uso global
export const searchAnalytics = new SearchAnalytics();