// AIDEV-EXPLANATION: Sistema de cache para respostas de IA conforme AIDEV-IMPROVEMENTS.md
// Usa Map em memória para cache simples, com suporte futuro para Redis

import { logInfo, logIA } from '../shared/log/logger';

/**
 * Interface para item do cache
 */
interface CacheItem {
  response: string;
  timestamp: number;
  model?: string;
  tokens?: number;
  hits: number; // Contador de acessos
}

/**
 * Configuração do cache
 */
interface CacheConfig {
  maxSize: number;       // Número máximo de itens
  ttlMinutes: number;    // Tempo de vida em minutos
  cleanupInterval: number; // Intervalo de limpeza em minutos
}

/**
 * Classe para gerenciar cache de respostas de IA
 */
class AICache {
  private cache: Map<string, CacheItem>;
  private config: CacheConfig;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(config?: Partial<CacheConfig>) {
    this.cache = new Map();
    this.config = {
      maxSize: config?.maxSize || 1000,
      ttlMinutes: config?.ttlMinutes || 60, // 1 hora por padrão
      cleanupInterval: config?.cleanupInterval || 15 // Limpa a cada 15 minutos
    };

    // AIDEV-SUGGESTION: Inicia limpeza automática
    this.startAutoCleanup();
  }

  /**
   * Gera chave de cache baseada no prompt
   * @param prompt - Prompt original
   * @param model - Modelo usado (opcional)
   * @returns Chave normalizada
   */
  private generateKey(prompt: string, model?: string): string {
    // AIDEV-EXPLANATION: Normaliza o prompt para melhor hit rate
    const normalizedPrompt = prompt
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .substring(0, 200); // Limita tamanho da chave
    
    return model ? `${model}:${normalizedPrompt}` : normalizedPrompt;
  }

  /**
   * Busca resposta no cache
   * @param prompt - Prompt para buscar
   * @param model - Modelo usado (opcional)
   * @returns Resposta em cache ou null
   */
  getFromCache(prompt: string, model?: string): string | null {
    const key = this.generateKey(prompt, model);
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    // Verifica se expirou
    const now = Date.now();
    const age = (now - item.timestamp) / 1000 / 60; // idade em minutos
    
    if (age > this.config.ttlMinutes) {
      this.cache.delete(key);
      logInfo('Cache expirado removido', { key, ageMinutes: age });
      return null;
    }

    // Incrementa contador de hits
    item.hits++;
    
    logIA('Cache hit', {
      promptLength: prompt.length,
      model: item.model,
      responseLength: item.response.length,
      tokens: item.tokens,
      hits: item.hits
    });

    return item.response;
  }

  /**
   * Armazena resposta no cache
   * @param prompt - Prompt original
   * @param response - Resposta da IA
   * @param model - Modelo usado (opcional)
   * @param tokens - Número de tokens usados (opcional)
   */
  setInCache(prompt: string, response: string, model?: string, tokens?: number): void {
    const key = this.generateKey(prompt, model);

    // AIDEV-EXPLANATION: Se cache está cheio, remove os mais antigos
    if (this.cache.size >= this.config.maxSize) {
      const oldestKey = this.findOldestKey();
      if (oldestKey) {
        this.cache.delete(oldestKey);
        logInfo('Cache cheio, removendo item mais antigo', { key: oldestKey });
      }
    }

    const item: CacheItem = {
      response,
      timestamp: Date.now(),
      model,
      tokens,
      hits: 0
    };

    this.cache.set(key, item);
    
    logIA('Resposta armazenada em cache', {
      promptLength: prompt.length,
      responseLength: response.length,
      model,
      tokens,
      cacheSize: this.cache.size
    });
  }

  /**
   * Remove itens expirados do cache
   * @returns Número de itens removidos
   */
  clearOldCache(): number {
    const now = Date.now();
    const ttlMs = this.config.ttlMinutes * 60 * 1000;
    let removed = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > ttlMs) {
        this.cache.delete(key);
        removed++;
      }
    }

    if (removed > 0) {
      logInfo('Cache limpo', { 
        removedItems: removed, 
        remainingItems: this.cache.size 
      });
    }

    return removed;
  }

  /**
   * Encontra a chave do item mais antigo
   * @returns Chave do item mais antigo ou null
   */
  private findOldestKey(): string | null {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  /**
   * Inicia limpeza automática do cache
   */
  private startAutoCleanup(): void {
    // AIDEV-SUGGESTION: Limpa cache periodicamente
    this.cleanupTimer = setInterval(() => {
      this.clearOldCache();
    }, this.config.cleanupInterval * 60 * 1000);
  }

  /**
   * Para a limpeza automática
   */
  stopAutoCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }

  /**
   * Limpa todo o cache
   */
  clearAll(): void {
    const size = this.cache.size;
    this.cache.clear();
    logInfo('Cache completamente limpo', { itemsRemoved: size });
  }

  /**
   * Obtém estatísticas do cache
   * @returns Estatísticas atuais
   */
  getStats(): {
    size: number;
    maxSize: number;
    ttlMinutes: number;
    hitRate: number;
    mostUsed: Array<{ key: string; hits: number }>;
  } {
    let totalHits = 0;
    let totalAccess = 0;
    const usage: Array<{ key: string; hits: number }> = [];

    for (const [key, item] of this.cache.entries()) {
      totalHits += item.hits;
      totalAccess += item.hits + 1; // +1 para o miss inicial
      usage.push({ key: key.substring(0, 50), hits: item.hits });
    }

    // Ordena por hits e pega os top 5
    usage.sort((a, b) => b.hits - a.hits);
    const mostUsed = usage.slice(0, 5);

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      ttlMinutes: this.config.ttlMinutes,
      hitRate: totalAccess > 0 ? (totalHits / totalAccess) : 0,
      mostUsed
    };
  }
}

// AIDEV-EXPLANATION: Instância singleton do cache
let cacheInstance: AICache | null = null;

/**
 * Obtém instância singleton do cache
 * @param config - Configuração opcional (usada apenas na primeira criação)
 * @returns Instância do cache
 */
export function getAICache(config?: Partial<CacheConfig>): AICache {
  if (!cacheInstance) {
    cacheInstance = new AICache(config);
  }
  return cacheInstance;
}

// AIDEV-EXPLANATION: Exporta funções convenientes para uso direto
export const getFromCache = (prompt: string, model?: string) => 
  getAICache().getFromCache(prompt, model);

export const setInCache = (prompt: string, response: string, model?: string, tokens?: number) => 
  getAICache().setInCache(prompt, response, model, tokens);

export const clearOldCache = () => 
  getAICache().clearOldCache();

// AIDEV-SUGGESTION: Futuramente pode ser expandido para usar Redis
// import Redis from 'ioredis';
// const redis = new Redis(process.env.REDIS_URL);