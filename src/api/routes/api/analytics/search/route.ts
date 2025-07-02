import { NextRequest, NextResponse } from 'next/server';

/**
 * API para registrar buscas no sistema de analytics
 */

// Simulação de dados até implementar banco real
const searchHistoryData = new Map<string, any[]>();

interface SearchRecord {
  userId?: string;
  sessionId: string;
  organizationId?: string;
  query: string;
  resultsCount: number;
  duration: number;
  clicked: boolean;
  clickedResult?: string;
  filters?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SearchRecord = await request.json();

    // Validação básica
    if (!body.query || body.query.length < 1) {
      return NextResponse.json({
        success: false,
        error: 'Query é obrigatória'
      }, { status: 400 });
    }

    // Processar dados da busca
    const searchData = {
      id: generateId(),
      userId: body.userId,
      sessionId: body.sessionId,
      organizationId: body.organizationId,
      query: body.query.trim(),
      resultsCount: body.resultsCount || 0,
      duration: body.duration || 0,
      clicked: body.clicked || false,
      clickedResult: body.clickedResult,
      filters: body.filters || {},
      ipAddress: body.ipAddress || getClientIP(request),
      userAgent: body.userAgent || request.headers.get('user-agent'),
      timestamp: new Date().toISOString(),
      // Dados derivados
      keywords: extractKeywords(body.query),
      topic: identifyTopic(body.query),
      queryLength: body.query.length
    };

    // Salvar no storage temporário (em produção seria no banco)
    const key = body.userId || body.sessionId;
    if (!searchHistoryData.has(key)) {
      searchHistoryData.set(key, []);
    }
    
    const userHistory = searchHistoryData.get(key)!;
    userHistory.unshift(searchData);
    
    // Manter apenas os últimos 500 registros por usuário
    if (userHistory.length > 500) {
      userHistory.splice(500);
    }

    // Atualizar estatísticas globais de termos
    await updateTermStatistics(body.query, searchData);

    // Processar agrupamento inteligente
    await processSearchGrouping(key, searchData);

    return NextResponse.json({
      success: true,
      data: {
        id: searchData.id,
        recorded: true,
        timestamp: searchData.timestamp
      }
    });

  } catch (error) {
    console.error('Erro ao registrar busca:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');
    const limit = parseInt(searchParams.get('limit') || '50');

    const key = userId || sessionId;
    if (!key) {
      return NextResponse.json({
        success: false,
        error: 'userId ou sessionId é obrigatório'
      }, { status: 400 });
    }

    const userHistory = searchHistoryData.get(key) || [];
    const limitedHistory = userHistory.slice(0, limit);

    // Agrupar buscas por tópicos
    const groups = groupSearchesByTopic(limitedHistory);

    return NextResponse.json({
      success: true,
      data: {
        totalSearches: userHistory.length,
        recentSearches: limitedHistory,
        groups: groups,
        stats: calculateUserStats(userHistory)
      }
    });

  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}

// Funções auxiliares
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const real = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  return real || 'unknown';
}

function extractKeywords(query: string): string[] {
  const stopwords = new Set([
    'a', 'o', 'e', 'de', 'do', 'da', 'em', 'um', 'uma', 'para', 'com', 'por',
    'como', 'que', 'qual', 'onde', 'quando', 'porque', 'se', 'mas', 'ou'
  ]);

  return query
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopwords.has(word))
    .slice(0, 10);
}

function identifyTopic(query: string): string {
  const queryLower = query.toLowerCase();
  
  const topicPatterns = {
    'saidas_emergencia': /saída|emergência|escape|evacuação|largura|porta|corredor/,
    'iluminacao': /iluminação|luz|luminária|lux|autonomia|bateria|emergência/,
    'extintores': /extintor|fogo|classe|distância|pó|espuma/,
    'hidrantes': /hidrante|pressão|vazão|mangueira|água|reserva/,
    'sinalizacao': /sinalização|placa|fotoluminescente|seta|orientação/,
    'documentacao': /memorial|art|rrt|projeto|documentação|cronograma/,
    'estrutural': /estrutura|compartimentação|resistência|parede|laje/,
    'deteccao': /detecção|detector|fumaça|alarme|central/
  };

  for (const [topic, pattern] of Object.entries(topicPatterns)) {
    if (pattern.test(queryLower)) {
      return topic;
    }
  }

  return 'geral';
}

// Storage temporário para estatísticas de termos
const termStats = new Map<string, {
  frequency: number;
  totalResults: number;
  totalDuration: number;
  totalClicks: number;
  lastUsed: Date;
}>();

async function updateTermStatistics(query: string, searchData: any): Promise<void> {
  const normalizedQuery = query.toLowerCase().trim();
  
  if (!termStats.has(normalizedQuery)) {
    termStats.set(normalizedQuery, {
      frequency: 0,
      totalResults: 0,
      totalDuration: 0,
      totalClicks: 0,
      lastUsed: new Date()
    });
  }

  const stats = termStats.get(normalizedQuery)!;
  stats.frequency += 1;
  stats.totalResults += searchData.resultsCount;
  stats.totalDuration += searchData.duration;
  if (searchData.clicked) {
    stats.totalClicks += 1;
  }
  stats.lastUsed = new Date();
}

async function processSearchGrouping(userId: string, searchData: any): Promise<void> {
  // Em produção, isso faria agrupamento mais sofisticado baseado em ML
  // Por ora, apenas agrupa por tópico identificado
  
  const groupKey = `group_${userId}_${searchData.topic}`;
  // Lógica de agrupamento seria implementada aqui
}

function groupSearchesByTopic(searches: any[]): any[] {
  const groups = new Map<string, any[]>();
  
  for (const search of searches) {
    const topic = search.topic || 'geral';
    
    if (!groups.has(topic)) {
      groups.set(topic, []);
    }
    groups.get(topic)!.push(search);
  }

  return Array.from(groups.entries()).map(([topic, searches]) => ({
    id: generateId(),
    topic,
    topicLabel: getTopicLabel(topic),
    keywords: [...new Set(searches.flatMap(s => s.keywords))].slice(0, 8),
    frequency: searches.length,
    lastUsed: new Date(Math.max(...searches.map(s => new Date(s.timestamp).getTime()))),
    searches: searches.slice(0, 10), // Mostrar apenas as 10 mais recentes
    avgResults: searches.reduce((acc, s) => acc + s.resultsCount, 0) / searches.length,
    clickRate: searches.filter(s => s.clicked).length / searches.length
  })).sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime());
}

function getTopicLabel(topic: string): string {
  const labels = {
    'saidas_emergencia': 'Saídas de Emergência',
    'iluminacao': 'Iluminação',
    'extintores': 'Extintores',
    'hidrantes': 'Hidrantes',
    'sinalizacao': 'Sinalização',
    'documentacao': 'Documentação',
    'estrutural': 'Estrutural',
    'deteccao': 'Detecção',
    'geral': 'Geral'
  };

  return labels[topic as keyof typeof labels] || 'Outros';
}

function calculateUserStats(history: any[]): any {
  if (history.length === 0) {
    return {
      totalSearches: 0,
      avgResultsPerSearch: 0,
      avgSearchDuration: 0,
      clickRate: 0,
      mostSearchedTopic: null,
      recentActivity: []
    };
  }

  const totalClicks = history.filter(h => h.clicked).length;
  const totalResults = history.reduce((acc, h) => acc + h.resultsCount, 0);
  const totalDuration = history.reduce((acc, h) => acc + h.duration, 0);

  // Contar tópicos
  const topicCounts = new Map<string, number>();
  for (const search of history) {
    const topic = search.topic || 'geral';
    topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
  }

  const mostSearchedTopic = Array.from(topicCounts.entries())
    .sort((a, b) => b[1] - a[1])[0];

  // Atividade recente (últimos 7 dias)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentActivity = history
    .filter(h => new Date(h.timestamp) > sevenDaysAgo)
    .reduce((acc, h) => {
      const date = new Date(h.timestamp).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  return {
    totalSearches: history.length,
    avgResultsPerSearch: Math.round(totalResults / history.length * 10) / 10,
    avgSearchDuration: Math.round(totalDuration / history.length),
    clickRate: Math.round(totalClicks / history.length * 100) / 100,
    mostSearchedTopic: mostSearchedTopic ? {
      topic: mostSearchedTopic[0],
      label: getTopicLabel(mostSearchedTopic[0]),
      count: mostSearchedTopic[1]
    } : null,
    recentActivity: Object.entries(recentActivity).map(([date, count]) => ({
      date,
      count
    }))
  };
}