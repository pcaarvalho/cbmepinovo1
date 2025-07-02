import { NextRequest, NextResponse } from 'next/server';

/**
 * API para obter termos mais buscados e suas estatísticas
 */

// Storage temporário para estatísticas de termos
const termStatistics = new Map<string, {
  term: string;
  frequency: number;
  clickRate: number;
  avgResults: number;
  avgDuration: number;
  successRate: number;
  category?: string;
  relatedTerms: string[];
  firstSeen: Date;
  lastUsed: Date;
  trend: 'up' | 'down' | 'stable';
}>();

// Inicializar com dados de exemplo
initializeExampleData();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d';
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'frequency';

    // Calcular data de corte baseada no período
    const cutoffDate = calculateCutoffDate(period);

    // Filtrar termos por período
    let filteredTerms = Array.from(termStatistics.values())
      .filter(term => term.lastUsed >= cutoffDate);

    // Filtrar por categoria se especificada
    if (category && category !== 'all') {
      filteredTerms = filteredTerms.filter(term => term.category === category);
    }

    // Ordenar conforme critério
    filteredTerms.sort((a, b) => {
      switch (sortBy) {
        case 'frequency':
          return b.frequency - a.frequency;
        case 'clickRate':
          return b.clickRate - a.clickRate;
        case 'successRate':
          return b.successRate - a.successRate;
        case 'avgResults':
          return b.avgResults - a.avgResults;
        case 'recent':
          return b.lastUsed.getTime() - a.lastUsed.getTime();
        default:
          return b.frequency - a.frequency;
      }
    });

    // Limitar resultados
    const topTerms = filteredTerms.slice(0, limit);

    // Calcular estatísticas gerais
    const totalSearches = filteredTerms.reduce((sum, term) => sum + term.frequency, 0);
    const avgClickRate = filteredTerms.length > 0 
      ? filteredTerms.reduce((sum, term) => sum + term.clickRate, 0) / filteredTerms.length 
      : 0;

    // Agrupar por categoria
    const categoryCounts = filteredTerms.reduce((acc, term) => {
      const cat = term.category || 'outros';
      acc[cat] = (acc[cat] || 0) + term.frequency;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      success: true,
      data: {
        period,
        totalTerms: filteredTerms.length,
        totalSearches,
        avgClickRate: Math.round(avgClickRate * 100) / 100,
        terms: topTerms.map(term => ({
          term: term.term,
          frequency: term.frequency,
          clickRate: Math.round(term.clickRate * 100) / 100,
          avgResults: Math.round(term.avgResults * 10) / 10,
          avgDuration: Math.round(term.avgDuration),
          successRate: Math.round(term.successRate * 100) / 100,
          category: term.category,
          relatedTerms: term.relatedTerms.slice(0, 5),
          trend: term.trend,
          lastUsed: term.lastUsed.toISOString()
        })),
        categories: Object.entries(categoryCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([category, count]) => ({
            category,
            label: getCategoryLabel(category),
            count,
            percentage: Math.round((count / totalSearches) * 100)
          }))
      }
    });

  } catch (error) {
    console.error('Erro ao buscar termos populares:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, term, data } = body;

    if (action === 'update') {
      await updateTermStatistics(term, data);
    } else if (action === 'increment') {
      await incrementTermFrequency(term, data);
    }

    return NextResponse.json({
      success: true,
      data: { updated: true }
    });

  } catch (error) {
    console.error('Erro ao atualizar estatísticas:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}

// Funções auxiliares
function calculateCutoffDate(period: string): Date {
  const now = new Date();
  
  switch (period) {
    case '24h':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
}

function getCategoryLabel(category: string): string {
  const labels = {
    'saidas_emergencia': 'Saídas de Emergência',
    'iluminacao': 'Iluminação',
    'extintores': 'Extintores',
    'hidrantes': 'Hidrantes',
    'sinalizacao': 'Sinalização',
    'documentacao': 'Documentação',
    'estrutural': 'Estrutural',
    'deteccao': 'Detecção',
    'geral': 'Geral',
    'outros': 'Outros'
  };

  return labels[category as keyof typeof labels] || 'Outros';
}

async function updateTermStatistics(term: string, data: any): Promise<void> {
  const normalizedTerm = term.toLowerCase().trim();
  
  if (!termStatistics.has(normalizedTerm)) {
    termStatistics.set(normalizedTerm, {
      term: normalizedTerm,
      frequency: 0,
      clickRate: 0,
      avgResults: 0,
      avgDuration: 0,
      successRate: 0,
      category: identifyCategory(normalizedTerm),
      relatedTerms: [],
      firstSeen: new Date(),
      lastUsed: new Date(),
      trend: 'stable'
    });
  }

  const stats = termStatistics.get(normalizedTerm)!;
  
  // Atualizar estatísticas
  if (data.resultsCount !== undefined) {
    stats.avgResults = (stats.avgResults * stats.frequency + data.resultsCount) / (stats.frequency + 1);
  }
  
  if (data.duration !== undefined) {
    stats.avgDuration = (stats.avgDuration * stats.frequency + data.duration) / (stats.frequency + 1);
  }
  
  if (data.clicked !== undefined && data.clicked) {
    const newClickRate = ((stats.clickRate * stats.frequency) + 1) / (stats.frequency + 1);
    stats.clickRate = newClickRate;
    stats.successRate = newClickRate; // Simplificado: click = success
  }

  stats.frequency += 1;
  stats.lastUsed = new Date();
  
  // Calcular tendência (simplificado)
  stats.trend = calculateTrend(stats.frequency);

  // Atualizar termos relacionados
  updateRelatedTerms(normalizedTerm, data.context);
}

async function incrementTermFrequency(term: string, data: any): Promise<void> {
  const normalizedTerm = term.toLowerCase().trim();
  
  if (!termStatistics.has(normalizedTerm)) {
    termStatistics.set(normalizedTerm, {
      term: normalizedTerm,
      frequency: 1,
      clickRate: 0,
      avgResults: data.resultsCount || 0,
      avgDuration: data.duration || 0,
      successRate: 0,
      category: identifyCategory(normalizedTerm),
      relatedTerms: [],
      firstSeen: new Date(),
      lastUsed: new Date(),
      trend: 'up'
    });
  } else {
    const stats = termStatistics.get(normalizedTerm)!;
    stats.frequency += 1;
    stats.lastUsed = new Date();
    stats.trend = calculateTrend(stats.frequency);
  }
}

function identifyCategory(term: string): string {
  const categoryPatterns = {
    'saidas_emergencia': /saída|emergência|escape|evacuação|largura|porta|corredor/,
    'iluminacao': /iluminação|luz|luminária|lux|autonomia|bateria/,
    'extintores': /extintor|fogo|classe|distância|pó|espuma/,
    'hidrantes': /hidrante|pressão|vazão|mangueira|água|reserva/,
    'sinalizacao': /sinalização|placa|fotoluminescente|seta|orientação/,
    'documentacao': /memorial|art|rrt|projeto|documentação|cronograma/,
    'estrutural': /estrutura|compartimentação|resistência|parede|laje/,
    'deteccao': /detecção|detector|fumaça|alarme|central/
  };

  for (const [category, pattern] of Object.entries(categoryPatterns)) {
    if (pattern.test(term)) {
      return category;
    }
  }

  return 'geral';
}

function calculateTrend(currentFrequency: number): 'up' | 'down' | 'stable' {
  // Implementação simplificada - em produção seria baseada em dados históricos
  if (currentFrequency > 10) return 'up';
  if (currentFrequency < 3) return 'down';
  return 'stable';
}

function updateRelatedTerms(term: string, context?: string): void {
  // Implementação simplificada de termos relacionados
  if (!context) return;

  const stats = termStatistics.get(term);
  if (!stats) return;

  const contextWords = context.toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3 && word !== term);

  // Adicionar palavras do contexto como termos relacionados
  for (const word of contextWords.slice(0, 3)) {
    if (!stats.relatedTerms.includes(word)) {
      stats.relatedTerms.push(word);
    }
  }

  // Manter apenas os 10 termos relacionados mais recentes
  stats.relatedTerms = stats.relatedTerms.slice(0, 10);
}

function initializeExampleData(): void {
  const exampleTerms = [
    {
      term: 'largura mínima saída emergência',
      frequency: 45,
      clickRate: 0.82,
      avgResults: 8.5,
      avgDuration: 1200,
      successRate: 0.78,
      category: 'saidas_emergencia',
      relatedTerms: ['porta', 'corredor', 'evacuação', 'dimensionamento']
    },
    {
      term: 'autonomia iluminação emergência',
      frequency: 38,
      clickRate: 0.76,
      avgResults: 6.2,
      avgDuration: 950,
      successRate: 0.71,
      category: 'iluminacao',
      relatedTerms: ['bateria', 'lux', 'tempo', 'comutação']
    },
    {
      term: 'distância máxima extintores',
      frequency: 32,
      clickRate: 0.84,
      avgResults: 4.8,
      avgDuration: 800,
      successRate: 0.81,
      category: 'extintores',
      relatedTerms: ['caminhamento', 'classe', 'proteção', 'área']
    },
    {
      term: 'pressão mínima hidrantes',
      frequency: 28,
      clickRate: 0.71,
      avgResults: 5.1,
      avgDuration: 1100,
      successRate: 0.68,
      category: 'hidrantes',
      relatedTerms: ['vazão', 'mangueira', 'reserva', 'bomba']
    },
    {
      term: 'memorial descritivo',
      frequency: 42,
      clickRate: 0.65,
      avgResults: 12.3,
      avgDuration: 1800,
      successRate: 0.61,
      category: 'documentacao',
      relatedTerms: ['projeto', 'especificação', 'técnico', 'detalhamento']
    },
    {
      term: 'sinalização fotoluminescente',
      frequency: 25,
      clickRate: 0.79,
      avgResults: 7.2,
      avgDuration: 950,
      successRate: 0.74,
      category: 'sinalizacao',
      relatedTerms: ['placa', 'emergência', 'orientação', 'escape']
    },
    {
      term: 'detector de fumaça',
      frequency: 22,
      clickRate: 0.73,
      avgResults: 9.1,
      avgDuration: 1050,
      successRate: 0.69,
      category: 'deteccao',
      relatedTerms: ['alarme', 'central', 'sensores', 'óptico']
    },
    {
      term: 'resistência ao fogo',
      frequency: 19,
      clickRate: 0.68,
      avgResults: 6.8,
      avgDuration: 1350,
      successRate: 0.64,
      category: 'estrutural',
      relatedTerms: ['parede', 'compartimentação', 'trrf', 'isolamento']
    }
  ];

  const now = new Date();
  
  exampleTerms.forEach(example => {
    termStatistics.set(example.term, {
      ...example,
      firstSeen: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      lastUsed: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      trend: example.frequency > 30 ? 'up' : example.frequency < 20 ? 'down' : 'stable'
    });
  });
}