import { NextRequest, NextResponse } from 'next/server';

/**
 * API para registrar uso de sugestões de busca
 */

// Storage temporário para uso de sugestões
const suggestionUsageData = new Map<string, any[]>();

interface SuggestionUsage {
  originalQuery: string;
  selectedSuggestion: string;
  suggestionType: string;
  userId?: string;
  sessionId: string;
  timestamp?: string;
  ipAddress?: string;
  userAgent?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SuggestionUsage = await request.json();

    // Validação básica
    if (!body.originalQuery || !body.selectedSuggestion) {
      return NextResponse.json({
        success: false,
        error: 'originalQuery e selectedSuggestion são obrigatórios'
      }, { status: 400 });
    }

    // Processar dados do uso da sugestão
    const usageRecord = {
      id: generateId(),
      originalQuery: body.originalQuery.trim(),
      selectedSuggestion: body.selectedSuggestion.trim(),
      suggestionType: body.suggestionType || 'unknown',
      userId: body.userId,
      sessionId: body.sessionId,
      timestamp: new Date().toISOString(),
      ipAddress: getClientIP(request),
      userAgent: request.headers.get('user-agent'),
      // Dados derivados
      queryLength: body.originalQuery.length,
      suggestionLength: body.selectedSuggestion.length,
      editDistance: calculateEditDistance(body.originalQuery, body.selectedSuggestion),
      wasExpansion: body.selectedSuggestion.length > body.originalQuery.length,
      wasRefinement: body.selectedSuggestion.includes(body.originalQuery)
    };

    // Salvar no storage temporário
    const key = 'suggestion_usage';
    if (!suggestionUsageData.has(key)) {
      suggestionUsageData.set(key, []);
    }
    
    const usageHistory = suggestionUsageData.get(key)!;
    usageHistory.unshift(usageRecord);
    
    // Manter apenas os últimos 10000 registros
    if (usageHistory.length > 10000) {
      usageHistory.splice(10000);
    }

    // Atualizar estatísticas de sugestão
    await updateSuggestionStatistics(body.selectedSuggestion, usageRecord);

    return NextResponse.json({
      success: true,
      data: {
        id: usageRecord.id,
        recorded: true,
        timestamp: usageRecord.timestamp
      }
    });

  } catch (error) {
    console.error('Erro ao registrar uso de sugestão:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '100');
    const period = searchParams.get('period') || '7d';

    // Obter dados de uso
    let usageData = suggestionUsageData.get('suggestion_usage') || [];

    // Filtrar por período
    const cutoffDate = calculateCutoffDate(period);
    usageData = usageData.filter(usage => 
      new Date(usage.timestamp) >= cutoffDate
    );

    // Filtrar por tipo se especificado
    if (type && type !== 'all') {
      usageData = usageData.filter(usage => usage.suggestionType === type);
    }

    // Filtrar por usuário se especificado
    if (userId) {
      usageData = usageData.filter(usage => usage.userId === userId);
    }

    // Limitar resultados
    const limitedData = usageData.slice(0, limit);

    // Calcular estatísticas
    const stats = calculateUsageStats(usageData);

    return NextResponse.json({
      success: true,
      data: {
        totalUsage: usageData.length,
        usage: limitedData,
        stats,
        period
      }
    });

  } catch (error) {
    console.error('Erro ao buscar uso de sugestões:', error);
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

function calculateEditDistance(str1: string, str2: string): number {
  const matrix = [];
  const n = str1.length;
  const m = str2.length;

  if (n === 0) return m;
  if (m === 0) return n;

  // Criar matriz
  for (let i = 0; i <= n; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= m; j++) {
    matrix[0][j] = j;
  }

  // Preencher matriz
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (str1.charAt(i - 1) === str2.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substituição
          matrix[i][j - 1] + 1,     // inserção
          matrix[i - 1][j] + 1      // remoção
        );
      }
    }
  }

  return matrix[n][m];
}

function calculateCutoffDate(period: string): Date {
  const now = new Date();
  
  switch (period) {
    case '24h':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
}

// Storage para estatísticas de sugestões
const suggestionStats = new Map<string, {
  suggestion: string;
  usageCount: number;
  avgEditDistance: number;
  expansionRate: number;
  refinementRate: number;
  lastUsed: Date;
  types: Record<string, number>;
}>();

async function updateSuggestionStatistics(suggestion: string, usage: any): Promise<void> {
  const normalizedSuggestion = suggestion.toLowerCase().trim();
  
  if (!suggestionStats.has(normalizedSuggestion)) {
    suggestionStats.set(normalizedSuggestion, {
      suggestion: normalizedSuggestion,
      usageCount: 0,
      avgEditDistance: 0,
      expansionRate: 0,
      refinementRate: 0,
      lastUsed: new Date(),
      types: {}
    });
  }

  const stats = suggestionStats.get(normalizedSuggestion)!;
  
  // Atualizar contadores
  stats.usageCount += 1;
  stats.lastUsed = new Date();
  
  // Atualizar distância de edição média
  stats.avgEditDistance = (stats.avgEditDistance * (stats.usageCount - 1) + (usage.editDistance || 0)) / stats.usageCount;
  
  // Atualizar taxas
  stats.expansionRate = (stats.expansionRate * (stats.usageCount - 1) + (usage.wasExpansion ? 1 : 0)) / stats.usageCount;
  stats.refinementRate = (stats.refinementRate * (stats.usageCount - 1) + (usage.wasRefinement ? 1 : 0)) / stats.usageCount;
  
  // Atualizar tipos
  if (!stats.types[usage.suggestionType]) {
    stats.types[usage.suggestionType] = 0;
  }
  stats.types[usage.suggestionType] += 1;
}

function calculateUsageStats(usageData: any[]): any {
  if (usageData.length === 0) {
    return {
      totalUsage: 0,
      typeDistribution: {},
      avgEditDistance: 0,
      expansionRate: 0,
      refinementRate: 0,
      topSuggestions: [],
      usageByHour: {},
      usageByDay: {}
    };
  }

  // Distribuição por tipo
  const typeDistribution = usageData.reduce((acc, usage) => {
    acc[usage.suggestionType] = (acc[usage.suggestionType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Médias
  const avgEditDistance = usageData.reduce((sum, usage) => sum + usage.editDistance, 0) / usageData.length;
  const expansionRate = usageData.filter(usage => usage.wasExpansion).length / usageData.length;
  const refinementRate = usageData.filter(usage => usage.wasRefinement).length / usageData.length;

  // Top sugestões
  const suggestionCounts = usageData.reduce((acc, usage) => {
    acc[usage.selectedSuggestion] = (acc[usage.selectedSuggestion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topSuggestions = Object.entries(suggestionCounts)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 10)
    .map(([suggestion, count]) => ({ suggestion, count: count as number }));

  // Uso por hora
  const usageByHour = usageData.reduce((acc, usage) => {
    const hour = new Date(usage.timestamp).getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  // Uso por dia da semana
  const usageByDay = usageData.reduce((acc, usage) => {
    const day = new Date(usage.timestamp).getDay();
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  return {
    totalUsage: usageData.length,
    typeDistribution,
    avgEditDistance: Math.round(avgEditDistance * 100) / 100,
    expansionRate: Math.round(expansionRate * 100) / 100,
    refinementRate: Math.round(refinementRate * 100) / 100,
    topSuggestions,
    usageByHour,
    usageByDay
  };
}