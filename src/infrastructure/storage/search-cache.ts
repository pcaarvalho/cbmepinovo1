// ==============================================================================
// SISTEMA DE CACHE INTELIGENTE PARA BUSCAS
// ==============================================================================

import { createHash } from 'crypto';

// ==============================================================================
// TIPOS E INTERFACES
// ==============================================================================

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  expiry: number;
  hits: number;
  lastAccessed: number;
  tags: string[];
  size: number;
}

interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  missRate: number;
  totalHits: number;
  totalMisses: number;
  oldestEntry: number;
  newestEntry: number;
}

interface CacheConfig {
  maxSize: number; // Tamanho máximo em bytes
  maxEntries: number; // Número máximo de entradas
  defaultTtl: number; // TTL padrão em segundos
  cleanupInterval: number; // Intervalo de limpeza em ms
}

// ==============================================================================
// IMPLEMENTAÇÃO DE CACHE EM MEMÓRIA
// ==============================================================================

class InMemorySearchCache {
  private cache = new Map<string, CacheEntry>();
  private stats = {
    hits: 0,
    misses: 0,
    totalSize: 0
  };
  
  private config: CacheConfig;
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 50 * 1024 * 1024, // 50MB
      maxEntries: 1000,
      defaultTtl: 3600, // 1 hora
      cleanupInterval: 5 * 60 * 1000, // 5 minutos
      ...config
    };

    this.startCleanupTimer();
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  private calculateSize(data: any): number {
    try {
      return JSON.stringify(data).length * 2; // Aproximação (UTF-16)
    } catch {
      return 1000; // Fallback
    }
  }

  private generateCacheKey(...parts: string[]): string {
    const combined = parts.join('|');
    return createHash('sha256').update(combined).digest('hex').substring(0, 16);
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() > entry.expiry;
  }

  private cleanup(): void {
    const now = Date.now();
    let cleanedEntries = 0;
    let freedSize = 0;

    // Remover entradas expiradas
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        freedSize += entry.size;
        this.cache.delete(key);
        cleanedEntries++;
      }
    }

    // Se ainda exceder limites, usar LRU
    if (this.cache.size > this.config.maxEntries || this.stats.totalSize > this.config.maxSize) {
      const entries = Array.from(this.cache.entries())
        .sort(([,a], [,b]) => a.lastAccessed - b.lastAccessed);

      for (const [key, entry] of entries) {
        if (this.cache.size <= this.config.maxEntries && this.stats.totalSize <= this.config.maxSize) {
          break;
        }
        
        freedSize += entry.size;
        this.cache.delete(key);
        cleanedEntries++;
      }
    }

    this.stats.totalSize -= freedSize;

    if (cleanedEntries > 0) {
      console.log(`🧹 Cache cleanup: ${cleanedEntries} entradas removidas, ${(freedSize / 1024).toFixed(1)}KB liberados`);
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.stats.totalSize -= entry.size;
      this.stats.misses++;
      return null;
    }

    // Atualizar estatísticas de acesso
    entry.hits++;
    entry.lastAccessed = Date.now();
    this.stats.hits++;

    return entry.data as T;
  }

  async set<T = any>(
    key: string, 
    data: T, 
    ttlSeconds?: number, 
    tags: string[] = []
  ): Promise<boolean> {
    const now = Date.now();
    const ttl = (ttlSeconds || this.config.defaultTtl) * 1000;
    const size = this.calculateSize(data);

    // Verificar se a entrada é muito grande
    if (size > this.config.maxSize * 0.1) { // Máximo 10% do cache
      console.warn(`⚠️ Entrada muito grande para cache: ${(size / 1024).toFixed(1)}KB`);
      return false;
    }

    // Remover entrada existente se houver
    const existingEntry = this.cache.get(key);
    if (existingEntry) {
      this.stats.totalSize -= existingEntry.size;
    }

    // Criar nova entrada
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiry: now + ttl,
      hits: 0,
      lastAccessed: now,
      tags,
      size
    };

    this.cache.set(key, entry);
    this.stats.totalSize += size;

    // Cleanup se necessário
    if (this.cache.size > this.config.maxEntries || this.stats.totalSize > this.config.maxSize) {
      this.cleanup();
    }

    return true;
  }

  async delete(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    if (entry) {
      this.stats.totalSize -= entry.size;
      return this.cache.delete(key);
    }
    return false;
  }

  async clear(): Promise<void> {
    this.cache.clear();
    this.stats.totalSize = 0;
    this.stats.hits = 0;
    this.stats.misses = 0;
  }

  async invalidateByTags(tags: string[]): Promise<number> {
    let invalidated = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.some(tag => tags.includes(tag))) {
        this.stats.totalSize -= entry.size;
        this.cache.delete(key);
        invalidated++;
      }
    }

    return invalidated;
  }

  getStats(): CacheStats {
    const entries = Array.from(this.cache.values());
    const total = this.stats.hits + this.stats.misses;

    return {
      totalEntries: this.cache.size,
      totalSize: this.stats.totalSize,
      hitRate: total > 0 ? (this.stats.hits / total) * 100 : 0,
      missRate: total > 0 ? (this.stats.misses / total) * 100 : 0,
      totalHits: this.stats.hits,
      totalMisses: this.stats.misses,
      oldestEntry: entries.length > 0 ? Math.min(...entries.map(e => e.timestamp)) : 0,
      newestEntry: entries.length > 0 ? Math.max(...entries.map(e => e.timestamp)) : 0
    };
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.cache.clear();
  }
}

// ==============================================================================
// IMPLEMENTAÇÃO COM REDIS
// ==============================================================================

class RedisSearchCache {
  private client: any;
  private keyPrefix: string;
  private defaultTtl: number;
  private stats = { hits: 0, misses: 0 };

  constructor(redisClient: any, keyPrefix = 'search_cache:', defaultTtl = 3600) {
    this.client = redisClient;
    this.keyPrefix = keyPrefix;
    this.defaultTtl = defaultTtl;
  }

  private getKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  async get<T = any>(key: string): Promise<T | null> {
    try {
      const redisKey = this.getKey(key);
      const data = await this.client.get(redisKey);
      
      if (!data) {
        this.stats.misses++;
        return null;
      }

      this.stats.hits++;
      
      // Atualizar estatísticas de acesso
      await this.client.hincrby(`${this.keyPrefix}stats:${key}`, 'hits', 1);
      await this.client.hset(`${this.keyPrefix}stats:${key}`, 'lastAccessed', Date.now());

      return JSON.parse(data) as T;
      
    } catch (error) {
      console.error('Redis cache get error:', error);
      this.stats.misses++;
      return null;
    }
  }

  async set<T = any>(
    key: string, 
    data: T, 
    ttlSeconds?: number, 
    tags: string[] = []
  ): Promise<boolean> {
    try {
      const redisKey = this.getKey(key);
      const ttl = ttlSeconds || this.defaultTtl;
      const serializedData = JSON.stringify(data);

      // Definir dados e TTL
      await this.client.setex(redisKey, ttl, serializedData);

      // Salvar metadados
      await this.client.hmset(`${this.keyPrefix}meta:${key}`, {
        timestamp: Date.now(),
        size: serializedData.length,
        tags: JSON.stringify(tags)
      });

      await this.client.expire(`${this.keyPrefix}meta:${key}`, ttl);
      await this.client.expire(`${this.keyPrefix}stats:${key}`, ttl);

      return true;
      
    } catch (error) {
      console.error('Redis cache set error:', error);
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      const redisKey = this.getKey(key);
      const result = await this.client.del(
        redisKey,
        `${this.keyPrefix}meta:${key}`,
        `${this.keyPrefix}stats:${key}`
      );
      
      return result > 0;
      
    } catch (error) {
      console.error('Redis cache delete error:', error);
      return false;
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = await this.client.keys(`${this.keyPrefix}*`);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
      
      this.stats.hits = 0;
      this.stats.misses = 0;
      
    } catch (error) {
      console.error('Redis cache clear error:', error);
    }
  }

  async invalidateByTags(tags: string[]): Promise<number> {
    try {
      const metaKeys = await this.client.keys(`${this.keyPrefix}meta:*`);
      let invalidated = 0;

      for (const metaKey of metaKeys) {
        const meta = await this.client.hgetall(metaKey);
        if (meta.tags) {
          const entryTags = JSON.parse(meta.tags);
          if (entryTags.some((tag: string) => tags.includes(tag))) {
            const baseKey = metaKey.replace(`${this.keyPrefix}meta:`, '');
            await this.delete(baseKey);
            invalidated++;
          }
        }
      }

      return invalidated;
      
    } catch (error) {
      console.error('Redis cache invalidateByTags error:', error);
      return 0;
    }
  }

  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    
    return {
      totalEntries: 0, // Não implementado para Redis
      totalSize: 0,    // Não implementado para Redis
      hitRate: total > 0 ? (this.stats.hits / total) * 100 : 0,
      missRate: total > 0 ? (this.stats.misses / total) * 100 : 0,
      totalHits: this.stats.hits,
      totalMisses: this.stats.misses,
      oldestEntry: 0,  // Não implementado para Redis
      newestEntry: 0   // Não implementado para Redis
    };
  }

  destroy(): void {
    // Redis client deve ser fechado externamente
  }
}

// ==============================================================================
// FACTORY E INSTÂNCIA GLOBAL
// ==============================================================================

let cacheInstance: InMemorySearchCache | RedisSearchCache;

function createCacheInstance(): InMemorySearchCache | RedisSearchCache {
  const redisUrl = process.env.REDIS_URL;
  
  if (redisUrl) {
    try {
      // Tentar importar ioredis dinamicamente
      const Redis = eval('require')('ioredis');
      const redis = new Redis(redisUrl);
      
      console.log('✅ Cache de busca configurado com Redis');
      return new RedisSearchCache(redis);
      
    } catch (error) {
      console.warn('⚠️ Redis não disponível, usando cache em memória:', error);
    }
  }
  
  console.log('📝 Cache de busca configurado em memória');
  return new InMemorySearchCache({
    maxSize: 25 * 1024 * 1024, // 25MB para cache de busca
    maxEntries: 500,
    defaultTtl: 3600 // 1 hora
  });
}

// ==============================================================================
// INTERFACE PÚBLICA
// ==============================================================================

export class SearchCache {
  private instance: InMemorySearchCache | RedisSearchCache;

  constructor() {
    this.instance = cacheInstance || (cacheInstance = createCacheInstance());
  }

  async get<T = any>(key: string): Promise<T | null> {
    return this.instance.get<T>(key);
  }

  async set<T = any>(
    key: string, 
    data: T, 
    ttlSeconds?: number, 
    tags: string[] = []
  ): Promise<boolean> {
    return this.instance.set(key, data, ttlSeconds, tags);
  }

  async delete(key: string): Promise<boolean> {
    return this.instance.delete(key);
  }

  async clear(): Promise<void> {
    return this.instance.clear();
  }

  async invalidateByTags(tags: string[]): Promise<number> {
    return this.instance.invalidateByTags(tags);
  }

  getStats(): CacheStats {
    return this.instance.getStats();
  }

  // Métodos específicos para cache de busca
  async cacheSearchResult(
    query: string, 
    filters: any, 
    result: any, 
    ttlSeconds = 3600
  ): Promise<boolean> {
    const key = this.generateSearchKey(query, filters);
    const tags = this.extractSearchTags(query, filters);
    
    return this.set(key, result, ttlSeconds, tags);
  }

  async getCachedSearch(query: string, filters: any): Promise<any | null> {
    const key = this.generateSearchKey(query, filters);
    return this.get(key);
  }

  private generateSearchKey(query: string, filters: any): string {
    const queryNormalized = query.toLowerCase().trim();
    const filtersStr = JSON.stringify(filters || {});
    
    return createHash('md5')
      .update(`search:${queryNormalized}:${filtersStr}`)
      .digest('hex');
  }

  private extractSearchTags(query: string, filters: any): string[] {
    const tags = ['search'];
    
    if (filters?.categoria) tags.push(`categoria:${filters.categoria}`);
    if (filters?.severidade) tags.push(`severidade:${filters.severidade}`);
    if (filters?.tipo) tags.push(`tipo:${filters.tipo}`);
    
    // Adicionar palavras-chave da query
    const keywords = query.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .slice(0, 3);
    
    keywords.forEach(keyword => tags.push(`keyword:${keyword}`));
    
    return tags;
  }
}

// Instância singleton exportada
export const searchCache = new SearchCache();

// ==============================================================================
// CLEANUP NA FINALIZAÇÃO DA APLICAÇÃO
// ==============================================================================

if (typeof process !== 'undefined') {
  process.on('SIGTERM', () => {
    if (cacheInstance && 'destroy' in cacheInstance) {
      (cacheInstance as InMemorySearchCache).destroy();
    }
  });
}