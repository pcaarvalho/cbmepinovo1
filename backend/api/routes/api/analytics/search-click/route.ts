import { NextRequest, NextResponse } from 'next/server';

/**
 * API para registrar cliques em resultados de busca
 */

// Storage temporário para cliques
const clickData = new Map<string, any[]>();

interface ClickRecord {
  userId?: string;
  sessionId: string;
  query: string;
  resultId: string;
  resultType: string;
  timestamp?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export async function POST(request: NextRequest) {
  try {
    const body: ClickRecord = await request.json();

    // Validação básica
    if (!body.query || !body.resultId) {
      return NextResponse.json({
        success: false,
        error: 'Query e resultId são obrigatórios'
      }, { status: 400 });
    }

    // Processar dados do clique
    const clickRecord = {
      id: generateId(),
      userId: body.userId,
      sessionId: body.sessionId,
      query: body.query.trim(),
      resultId: body.resultId,
      resultType: body.resultType || 'instruction',
      timestamp: new Date().toISOString(),
      ipAddress: getClientIP(request),
      userAgent: request.headers.get('user-agent'),
      metadata: body.metadata || {}
    };

    // Salvar clique
    const key = body.userId || body.sessionId;
    if (!clickData.has(key)) {
      clickData.set(key, []);
    }
    
    const userClicks = clickData.get(key)!;
    userClicks.unshift(clickRecord);
    
    // Manter apenas os últimos 1000 cliques por usuário
    if (userClicks.length > 1000) {
      userClicks.splice(1000);
    }

    // Atualizar estatísticas de clique para o termo
    await updateClickStatistics(body.query, clickRecord);

    return NextResponse.json({
      success: true,
      data: {
        id: clickRecord.id,
        recorded: true,
        timestamp: clickRecord.timestamp
      }
    });

  } catch (error) {
    console.error('Erro ao registrar clique:', error);
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
    const query = searchParams.get('query');
    const limit = parseInt(searchParams.get('limit') || '100');

    const key = userId || sessionId;
    if (!key) {
      return NextResponse.json({
        success: false,
        error: 'userId ou sessionId é obrigatório'
      }, { status: 400 });
    }

    let userClicks = clickData.get(key) || [];

    // Filtrar por query se especificada
    if (query) {
      userClicks = userClicks.filter(click => 
        click.query.toLowerCase().includes(query.toLowerCase())
      );
    }

    const limitedClicks = userClicks.slice(0, limit);

    // Calcular estatísticas
    const stats = calculateClickStats(userClicks);

    return NextResponse.json({
      success: true,
      data: {
        totalClicks: userClicks.length,
        clicks: limitedClicks,
        stats
      }
    });

  } catch (error) {
    console.error('Erro ao buscar cliques:', error);
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

// Storage para estatísticas de clique por termo
const clickStats = new Map<string, {
  totalSearches: number;
  totalClicks: number;
  clickRate: number;
  lastUpdated: Date;
}>();

async function updateClickStatistics(query: string, clickRecord: any): Promise<void> {
  const normalizedQuery = query.toLowerCase().trim();
  
  if (!clickStats.has(normalizedQuery)) {
    clickStats.set(normalizedQuery, {
      totalSearches: 0,
      totalClicks: 0,
      clickRate: 0,
      lastUpdated: new Date()
    });
  }

  const stats = clickStats.get(normalizedQuery)!;
  stats.totalClicks += 1;
  stats.clickRate = stats.totalSearches > 0 ? stats.totalClicks / stats.totalSearches : 0;
  stats.lastUpdated = new Date();
}

function calculateClickStats(clicks: any[]): any {
  if (clicks.length === 0) {
    return {
      totalClicks: 0,
      uniqueQueries: 0,
      uniqueResults: 0,
      topQueries: [],
      topResults: [],
      clicksByHour: {},
      clicksByDay: {}
    };
  }

  // Contar queries únicas
  const uniqueQueries = new Set(clicks.map(c => c.query.toLowerCase())).size;
  
  // Contar resultados únicos
  const uniqueResults = new Set(clicks.map(c => c.resultId)).size;

  // Top queries por frequência
  const queryCount = new Map<string, number>();
  clicks.forEach(click => {
    const query = click.query.toLowerCase();
    queryCount.set(query, (queryCount.get(query) || 0) + 1);
  });

  const topQueries = Array.from(queryCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([query, count]) => ({ query, count }));

  // Top resultados por frequência
  const resultCount = new Map<string, number>();
  clicks.forEach(click => {
    resultCount.set(click.resultId, (resultCount.get(click.resultId) || 0) + 1);
  });

  const topResults = Array.from(resultCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([resultId, count]) => ({ resultId, count }));

  // Cliques por hora do dia
  const clicksByHour = clicks.reduce((acc, click) => {
    const hour = new Date(click.timestamp).getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  // Cliques por dia da semana
  const clicksByDay = clicks.reduce((acc, click) => {
    const day = new Date(click.timestamp).getDay();
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  return {
    totalClicks: clicks.length,
    uniqueQueries,
    uniqueResults,
    topQueries,
    topResults,
    clicksByHour,
    clicksByDay
  };
}