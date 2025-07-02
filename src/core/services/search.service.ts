import { AIService } from '@/backend/external/ai/ai.service';
import { CacheService } from '@/backend/external/storage/cache.service';
import { SearchRepository } from '@/backend/repositories/search.repository';
import { InstructionsRepository } from '@/backend/repositories/instructions.repository';
import { SearchRequest, SearchResponse, AISearchRequest } from '@/shared/types/search';

export class SearchService {
  private aiService: AIService;
  private cacheService: CacheService;
  private searchRepo: SearchRepository;
  private instructionsRepo: InstructionsRepository;

  constructor() {
    this.aiService = new AIService();
    this.cacheService = new CacheService();
    this.searchRepo = new SearchRepository();
    this.instructionsRepo = new InstructionsRepository();
  }

  async performSearch(request: SearchRequest): Promise<SearchResponse> {
    try {
      const startTime = Date.now();
      
      // Verificar cache primeiro
      const cacheKey = this.generateCacheKey(request);
      const cachedResult = await this.cacheService.get(cacheKey);
      
      if (cachedResult) {
        await this.recordSearchEvent(request, cachedResult, true);
        return cachedResult;
      }

      // Realizar busca
      const results = await this.instructionsRepo.search({
        termo: request.query,
        categoria: request.filters?.categoria,
        tags: request.filters?.tags,
        limit: request.options?.maxResults || 10,
        offset: request.options?.offset || 0,
      });

      // Gerar sugestões
      const suggestions = await this.generateSuggestions(request.query);

      const searchResponse: SearchResponse = {
        query: request.query,
        results,
        suggestions,
        total: results.length,
        processingTime: Date.now() - startTime,
        cacheHit: false,
      };

      // Salvar no cache
      if (request.options?.useCache !== false) {
        await this.cacheService.set(cacheKey, searchResponse, 300); // 5 min
      }

      // Registrar evento
      await this.recordSearchEvent(request, searchResponse, false);

      return searchResponse;
    } catch (error) {
      console.error('Error in performSearch:', error);
      throw new Error('Erro ao realizar busca');
    }
  }

  async performAISearch(request: AISearchRequest): Promise<SearchResponse> {
    try {
      const startTime = Date.now();

      // Usar AI para entender a intenção da busca
      const aiAnalysis = await this.aiService.analyzeSearchIntent(request.prompt);

      // Realizar busca baseada na análise da AI
      const searchRequest: SearchRequest = {
        query: aiAnalysis.extractedQuery || request.searchTerm,
        filters: {
          ...request.filters,
          categoria: aiAnalysis.suggestedCategory || request.filters?.categoria,
        },
        options: request.options,
      };

      const searchResult = await this.performSearch(searchRequest);

      // Adicionar contexto da AI
      return {
        ...searchResult,
        aiAnalysis: aiAnalysis.explanation,
        confidence: aiAnalysis.confidence,
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      console.error('Error in performAISearch:', error);
      // Fallback para busca normal
      return this.performSearch({
        query: request.searchTerm,
        filters: request.filters,
        options: request.options,
      });
    }
  }

  async getSuggestions(query: string): Promise<string[]> {
    try {
      if (query.length < 2) {
        return [];
      }

      // Buscar sugestões em cache
      const cacheKey = `suggestions:${query}`;
      const cached = await this.cacheService.get(cacheKey);
      
      if (cached) {
        return cached;
      }

      // Gerar sugestões
      const suggestions = await this.generateSuggestions(query);
      
      // Cache por 1 hora
      await this.cacheService.set(cacheKey, suggestions, 3600);
      
      return suggestions;
    } catch (error) {
      console.error('Error getting suggestions:', error);
      return [];
    }
  }

  private async generateSuggestions(query: string): Promise<string[]> {
    try {
      // Buscar sugestões baseadas em termos populares
      const popularTerms = await this.searchRepo.getPopularTerms();
      
      // Filtrar termos que contenham a query
      const filtered = popularTerms
        .filter(term => 
          term.toLowerCase().includes(query.toLowerCase()) ||
          query.toLowerCase().includes(term.toLowerCase())
        )
        .slice(0, 5);

      // Se não tiver sugestões suficientes, usar AI
      if (filtered.length < 3) {
        const aiSuggestions = await this.aiService.generateSuggestions(query);
        return [...filtered, ...aiSuggestions].slice(0, 5);
      }

      return filtered;
    } catch (error) {
      console.error('Error generating suggestions:', error);
      return [];
    }
  }

  private generateCacheKey(request: SearchRequest): string {
    return `search:${JSON.stringify({
      query: request.query,
      filters: request.filters,
      limit: request.options?.maxResults,
      offset: request.options?.offset,
    })}`;
  }

  private async recordSearchEvent(
    request: SearchRequest, 
    response: SearchResponse, 
    cacheHit: boolean
  ) {
    try {
      await this.searchRepo.recordSearch({
        query: request.query,
        filters: request.filters || {},
        resultsCount: response.total,
        processingTime: response.processingTime,
        cacheHit,
      });
    } catch (error) {
      console.error('Error recording search event:', error);
      // Não falhar a busca por erro de analytics
    }
  }
}