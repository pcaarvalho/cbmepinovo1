// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
import { NextRequest } from 'next/server';

// ==============================================================================
// TIPOS E INTERFACES
// ==============================================================================

// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: NextRequest) => string;
  message?: string;
}

// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
  message?: string;
}

// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// ==============================================================================
// IMPLEMENTAÇÃO DE RATE LIMITING EM MEMÓRIA
// ==============================================================================

// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
class InMemoryRateLimit {
  private store: RateLimitStore = {};
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Limpar entradas expiradas a cada 5 minutos
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  // AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
  private cleanup(): void {
    const now = Date.now();
    
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    });
  }

  // AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
  async check(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
    const now = Date.now();
    const resetTime = now + config.windowMs;
    
    // Inicializar entrada se não existir ou se expirou
    if (!this.store[key] || this.store[key].resetTime < now) {
      this.store[key] = {
        count: 0,
        resetTime
      };
    }

    const entry = this.store[key];
    
    // Verificar se excedeu o limite
    if (entry.count >= config.maxRequests) {
      return {
        success: false,
        remaining: 0,
        resetTime: entry.resetTime,
        message: config.message || 'Rate limit exceeded'
      };
    }

    // Incrementar contador
    entry.count++;

    return {
      success: true,
      remaining: config.maxRequests - entry.count,
      resetTime: entry.resetTime
    };
  }

  // AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// ==============================================================================
// IMPLEMENTAÇÃO COM REDIS (OPCIONAL)
// ==============================================================================

// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
class RedisRateLimit {
  private client: any;

  constructor(redisClient: any) {
    this.client = redisClient;
  }

  // AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
  async check(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
    const now = Date.now();
    const window = Math.floor(now / config.windowMs);
    const redisKey = `rate_limit:${key}:${window}`;

    try {
      const pipeline = this.client.pipeline();
      pipeline.incr(redisKey);
      pipeline.expire(redisKey, Math.ceil(config.windowMs / 1000));
      
      const results = await pipeline.exec();
      const count = results[0][1];

      if (count > config.maxRequests) {
        return {
          success: false,
          remaining: 0,
          resetTime: (window + 1) * config.windowMs,
          message: config.message || 'Rate limit exceeded'
        };
      }

      return {
        success: true,
        remaining: config.maxRequests - count,
        resetTime: (window + 1) * config.windowMs
      };

    } catch (error) {
      console.error('Redis rate limit error:', error);
      
      // Fallback para permitir requisição em caso de erro do Redis
      return {
        success: true,
        remaining: config.maxRequests - 1,
        resetTime: now + config.windowMs
      };
    }
  }
}

// ==============================================================================
// FACTORY E INSTÂNCIA GLOBAL
// ==============================================================================

// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
let rateLimitInstance: InMemoryRateLimit | RedisRateLimit;

// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
function createRateLimitInstance(): InMemoryRateLimit | RedisRateLimit {
  // Tentar usar Redis se disponível
  const redisUrl = process.env.REDIS_URL;
  
  if (redisUrl) {
    try {
      // Tentar importar ioredis dinamicamente
      const Redis = eval('require')('ioredis');
      const redis = new Redis(redisUrl);
      
      console.log('✅ Rate limiting configurado com Redis');
      return new RedisRateLimit(redis);
      
    } catch (error) {
      console.warn('⚠️ Redis não disponível, usando rate limiting em memória:', error);
    }
  }
  
  console.log('📝 Rate limiting configurado em memória');
  return new InMemoryRateLimit();
}

// ==============================================================================
// FUNÇÃO PRINCIPAL DE RATE LIMITING
// ==============================================================================

// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  // Inicializar instância se necessário
  if (!rateLimitInstance) {
    rateLimitInstance = createRateLimitInstance();
  }

  // Gerar chave identificadora
  const key = config.keyGenerator 
    ? config.keyGenerator(request)
    : getDefaultKey(request);

  // Verificar rate limit
  return await rateLimitInstance.check(key, config);
}

// ==============================================================================
// FUNÇÕES AUXILIARES
// ==============================================================================

// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
function getDefaultKey(request: NextRequest): string {
  // Tentar obter IP real considerando proxies
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  const ip = forwarded?.split(',')[0]?.trim() || 
            realIp || 
            'unknown';
  
  return ip;
}

// ==============================================================================
// CONFIGURAÇÕES PRÉ-DEFINIDAS
// ==============================================================================

// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
export const rateLimitConfigs = {
  // API de busca (mais restritiva)
  search: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 10,
    message: 'Muitas buscas realizadas. Tente novamente em 15 minutos.'
  },

  // API de análise (muito restritiva)
  analysis: {
    windowMs: 30 * 60 * 1000, // 30 minutos
    maxRequests: 5,
    message: 'Muitas análises realizadas. Tente novamente em 30 minutos.'
  },

  // APIs gerais (menos restritiva)
  general: {
    windowMs: 5 * 60 * 1000, // 5 minutos
    maxRequests: 50,
    message: 'Muitas requisições. Tente novamente em alguns minutos.'
  },

  // Upload de arquivos (restritiva)
  upload: {
    windowMs: 10 * 60 * 1000, // 10 minutos
    maxRequests: 3,
    message: 'Muitos uploads realizados. Tente novamente em 10 minutos.'
  }
};

// ==============================================================================
// MIDDLEWARE HELPER
// ==============================================================================

// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
export function createRateLimitMiddleware(config: RateLimitConfig) {
  return async (request: NextRequest) => {
    const result = await rateLimit(request, config);
    
    if (!result.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: result.message,
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
            'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString()
          }
        }
      );
    }

    return null; // Permitir requisição
  };
}

// ==============================================================================
// CLEANUP NA FINALIZAÇÃO DA APLICAÇÃO
// ==============================================================================

// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
if (typeof process !== 'undefined') {
  process.on('SIGTERM', () => {
    if (rateLimitInstance && 'destroy' in rateLimitInstance) {
      (rateLimitInstance as InMemoryRateLimit).destroy();
    }
  });
}

// ✔️ Protegido com AIDEV-PROTECTED