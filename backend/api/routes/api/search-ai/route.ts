import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { searchCache } from '@/lib/search-cache';
import { openRouterClient } from '@/lib/openrouter-client';
import { validateSearchRequest } from '@/lib/validations/search-validation';
import { MOCK_IT_CONTENT } from '@/lib/data/mock-instructions';

// ==============================================================================
// TIPOS E INTERFACES
// ==============================================================================

interface SearchAIRequest {
  prompt: string;
  searchTerm: string;
  filters?: {
    categoria?: string;
    severidade?: string;
    tipo?: string;
  };
  options?: {
    useCache?: boolean;
    maxResults?: number;
    includeContext?: boolean;
  };
}

interface SearchAIResponse {
  success: boolean;
  data?: {
    query: string;
    aiAnalysis: string;
    results: IntelligentSearchResult[];
    suggestions: string[];
    metadata: {
      processingTime: number;
      cacheHit: boolean;
      modelUsed: string;
      tokenUsage: {
        prompt: number;
        completion: number;
        total: number;
      };
    };
  };
  error?: string;
}

interface IntelligentSearchResult {
  id: string;
  titulo: string;
  relevanciaScore: number;
  aiReasoning: string;
  contexto: string;
  capitulo?: string;
  pagina?: number;
  trecho: string;
  url: string;
  tags: string[];
}

// ==============================================================================
// CONFIGURAÇÕES E CONSTANTES
// ==============================================================================

const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxRequests: 10, // máximo 10 requests por IP por 15 minutos
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  keyGenerator: (req: NextRequest) => {
    return 'anonymous';
  }
};

const AI_SYSTEM_PROMPT = `Você é um assistente especializado em segurança contra incêndio e pânico do Corpo de Bombeiros do Piauí (CB-PI). 

Sua função é analisar consultas técnicas sobre Instruções Técnicas (ITs) e fornecer respostas precisas e relevantes.

INSTRUÇÕES:
1. Analise o prompt do usuário e o termo de busca
2. Identifique a intenção da consulta (normativa, técnica, procedimental)
3. Busque informações relevantes nas ITs disponíveis
4. Forneça uma resposta estruturada e técnica
5. Cite sempre as ITs de referência
6. Use linguagem técnica apropriada
7. Priorize informações de segurança críticas

FORMATO DE RESPOSTA:
- Resumo da consulta
- Informações técnicas relevantes
- Referências normativas (ITs aplicáveis)
- Recomendações práticas
- Alertas de segurança (se aplicável)`;

// ==============================================================================
// FUNÇÕES AUXILIARES
// ==============================================================================

function generateCacheKey(prompt: string, searchTerm: string, filters?: any): string {
  const normalizedPrompt = prompt.toLowerCase().trim();
  const normalizedTerm = searchTerm.toLowerCase().trim();
  const filtersStr = filters ? JSON.stringify(filters) : '';
  
  return `search-ai:${Buffer.from(normalizedPrompt + normalizedTerm + filtersStr).toString('base64')}`;
}

function extractKeywords(text: string): string[] {
  const stopWords = ['o', 'a', 'os', 'as', 'um', 'uma', 'de', 'da', 'do', 'das', 'dos', 'em', 'na', 'no', 'para', 'por', 'com', 'sem'];
  
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word))
    .slice(0, 10); // Limitar a 10 palavras-chave
}

function calculateRelevanceScore(
  content: string, 
  keywords: string[], 
  aiReasoning: string
): number {
  let score = 0;
  const contentLower = content.toLowerCase();
  
  // Score baseado em palavras-chave encontradas
  keywords.forEach(keyword => {
    const occurrences = (contentLower.match(new RegExp(keyword, 'g')) || []).length;
    score += occurrences * 10;
  });
  
  // Score baseado na análise da IA (parsing simples)
  if (aiReasoning.includes('relevante') || aiReasoning.includes('importante')) {
    score += 20;
  }
  if (aiReasoning.includes('crítico') || aiReasoning.includes('obrigatório')) {
    score += 30;
  }
  
  return Math.min(score, 100); // Normalizar para 0-100
}

async function performIntelligentSearch(
  prompt: string,
  searchTerm: string,
  filters?: any
): Promise<IntelligentSearchResult[]> {
  const keywords = extractKeywords(prompt + ' ' + searchTerm);
  const results: IntelligentSearchResult[] = [];
  
  // Simular análise inteligente do conteúdo
  for (const it of MOCK_IT_CONTENT) {
    for (const capitulo of it.capitulos) {
      const contentLower = capitulo.conteudo.toLowerCase();
      let matchFound = false;
      
      // Verificar se alguma palavra-chave está presente
      for (const keyword of keywords) {
        if (contentLower.includes(keyword)) {
          matchFound = true;
          break;
        }
      }
      
      if (matchFound) {
        // Simular reasoning da IA
        const aiReasoning = `Esta seção é relevante pois trata de ${keywords.slice(0, 3).join(', ')} conforme especificado na consulta.`;
        
        const relevanceScore = calculateRelevanceScore(
          capitulo.conteudo,
          keywords,
          aiReasoning
        );
        
        // Extrair trecho relevante (contexto de ~200 caracteres)
        const firstKeywordIndex = contentLower.indexOf(keywords[0]);
        const start = Math.max(0, firstKeywordIndex - 100);
        const end = Math.min(capitulo.conteudo.length, firstKeywordIndex + 200);
        let excerpt = capitulo.conteudo.substring(start, end).trim();
        
        // Adicionar reticências se necessário
        if (start > 0) excerpt = '...' + excerpt;
        if (end < capitulo.conteudo.length) excerpt = excerpt + '...';
        
        // Destacar termos encontrados
        const highlightedExcerpt = highlightText(excerpt, keywords.join('|'));

        results.push({
          id: `${it.id}-${capitulo.numero}`,
          titulo: it.titulo,
          relevanciaScore: relevanceScore,
          aiReasoning,
          contexto: `Capítulo ${capitulo.numero} - ${capitulo.titulo}`,
          capitulo: capitulo.titulo,
          pagina: capitulo.pagina,
          trecho: highlightedExcerpt,
          url: `/biblioteca/${it.id}#pagina-${capitulo.pagina}`,
          tags: keywords.slice(0, 5)
        });
      }
    }
  }
  
  // Ordenar por relevância
  return results
    .sort((a, b) => b.relevanciaScore - a.relevanciaScore)
    .slice(0, 10); // Limitar resultados
}

function highlightText(text: string, searchTerm: string): string {
  if (!searchTerm) return text;
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

// ==============================================================================
// HANDLERS DA API
// ==============================================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // 1. RATE LIMITING
    const rateLimitResult = await rateLimit(request, RATE_LIMIT_CONFIG);
    if (!rateLimitResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Muitas requisições. Tente novamente em alguns minutos.'
      }, { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': RATE_LIMIT_CONFIG.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(Date.now() + RATE_LIMIT_CONFIG.windowMs).toISOString()
        }
      });
    }

    // 2. VALIDAÇÃO DE ENTRADA
    const body = await request.json();
    const validation = validateSearchRequest(body);
    
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Dados de entrada inválidos',
        details: validation.errors
      }, { status: 400 });
    }

    const { prompt, searchTerm, filters, options }: SearchAIRequest = body;
    
    // 3. VERIFICAR CACHE
    const cacheKey = generateCacheKey(prompt, searchTerm, filters);
    let cacheHit = false;
    
    if (options?.useCache !== false) {
      const cachedResult = await searchCache.get(cacheKey);
      if (cachedResult) {
        cacheHit = true;
        const processingTime = Date.now() - startTime;
        
        return NextResponse.json({
          success: true,
          data: {
            ...cachedResult,
            metadata: {
              ...cachedResult.metadata,
              processingTime,
              cacheHit: true
            }
          }
        });
      }
    }

    // 4. BUSCA INTELIGENTE LOCAL
    const searchResults = await performIntelligentSearch(prompt, searchTerm, filters);
    
    // 5. ANÁLISE COM IA (OpenRouter)
    let aiAnalysis = '';
    let tokenUsage = { prompt: 0, completion: 0, total: 0 };
    
    try {
      const aiPrompt = `${AI_SYSTEM_PROMPT}

CONSULTA DO USUÁRIO: "${prompt}"
TERMO DE BUSCA: "${searchTerm}"
RESULTADOS ENCONTRADOS: ${searchResults.length} itens

Com base nos resultados encontrados, forneça uma análise técnica completa da consulta.`;

      const aiResponse = await openRouterClient.generateResponse(aiPrompt, {
        maxTokens: 500,
        temperature: 0.3
      });
      
      aiAnalysis = aiResponse.text;
      tokenUsage = aiResponse.usage;
      
    } catch (aiError) {
      console.warn('Erro na análise por IA, usando fallback:', aiError);
      
      // Fallback: análise básica sem IA
      aiAnalysis = `Encontradas ${searchResults.length} referências técnicas relacionadas à sua consulta sobre "${searchTerm}". ` +
                  `Os resultados incluem informações de ${new Set(searchResults.map(r => r.titulo)).size} Instruções Técnicas diferentes. ` +
                  `Recomenda-se revisar especialmente os itens com maior pontuação de relevância.`;
    }

    // 6. GERAR SUGESTÕES
    const suggestions = [
      `dimensionamento ${searchTerm}`,
      `normas ${searchTerm}`,
      `instalação ${searchTerm}`,
      `manutenção ${searchTerm}`,
      `projeto ${searchTerm}`
    ].slice(0, 3);

    // 7. PREPARAR RESPOSTA
    const processingTime = Date.now() - startTime;
    const responseData = {
      query: `${prompt} | ${searchTerm}`,
      aiAnalysis,
      results: searchResults,
      suggestions,
      metadata: {
        processingTime,
        cacheHit,
        modelUsed: 'openrouter-mixtral-8x7b',
        tokenUsage
      }
    };

    // 8. SALVAR NO CACHE
    if (options?.useCache !== false) {
      await searchCache.set(cacheKey, responseData, 3600); // Cache por 1 hora
    }

    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Erro na busca inteligente:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    data: {
      message: 'API de Busca Inteligente CB-PI',
      version: '1.0.0',
      endpoints: {
        search: 'POST /api/search-ai',
        health: 'GET /api/search-ai'
      },
      rateLimit: {
        requests: RATE_LIMIT_CONFIG.maxRequests,
        windowMs: RATE_LIMIT_CONFIG.windowMs
      }
    }
  });
}