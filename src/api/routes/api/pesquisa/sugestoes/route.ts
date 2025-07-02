import { NextRequest, NextResponse } from 'next/server';
import { todasInstrucoes } from '@/lib/data';
import { buscarInstrucoes } from '@/lib/utils';

interface SuggestionRequest {
  query: string;
  maxResults?: number;
}

interface SearchSuggestion {
  id: string;
  title: string;
  type: 'instruction' | 'category' | 'command';
  description?: string;
  numero?: string;
  category?: string;
}

// Categorias principais do sistema
const CATEGORIAS = [
  'Prevenção de Incêndio',
  'Sistemas de Proteção',
  'Edificações',
  'Segurança Estrutural',
  'Instalações Elétricas',
  'Armazenamento',
  'Procedimentos de Emergência',
  'Equipamentos de Proteção'
];

// Função para gerar sugestões inteligentes
function generateIntelligentSuggestions(query: string, maxResults: number = 8): SearchSuggestion[] {
  const normalizedQuery = query.toLowerCase().trim();
  const suggestions: SearchSuggestion[] = [];

  if (!normalizedQuery) return suggestions;

  // 1. Buscar instruções técnicas relevantes
  const matchingInstructions = buscarInstrucoes(todasInstrucoes, query)
    .slice(0, Math.min(maxResults - 2, 5))
    .map(it => ({
      id: it.id,
      title: it.titulo,
      type: 'instruction' as const,
      description: it.descricao,
      numero: it.numero,
      category: it.categoria
    }));

  suggestions.push(...matchingInstructions);

  // 2. Buscar categorias relevantes
  const matchingCategories = CATEGORIAS
    .filter(categoria => categoria.toLowerCase().includes(normalizedQuery))
    .slice(0, 2)
    .map((categoria, index) => ({
      id: `category-${index}`,
      title: categoria,
      type: 'category' as const,
      description: `Ver todas as instruções de ${categoria}`,
      category: categoria
    }));

  suggestions.push(...matchingCategories);

  // 3. Sugestões baseadas em palavras-chave comuns
  const keywordSuggestions = generateKeywordSuggestions(normalizedQuery, maxResults - suggestions.length);
  suggestions.push(...keywordSuggestions);

  // 4. Limitar ao número máximo solicitado
  return suggestions.slice(0, maxResults);
}

// Função para gerar sugestões baseadas em palavras-chave
function generateKeywordSuggestions(query: string, maxResults: number): SearchSuggestion[] {
  const commonKeywords = [
    { keyword: 'incendio', suggestions: ['prevenção de incêndio', 'combate a incêndio', 'sistemas de incêndio'] },
    { keyword: 'saida', suggestions: ['saídas de emergência', 'rotas de fuga', 'portas corta-fogo'] },
    { keyword: 'agua', suggestions: ['sistema de água', 'hidrantes', 'chuveiros automáticos'] },
    { keyword: 'gas', suggestions: ['gás liquefeito', 'detecção de gás', 'ventilação de gases'] },
    { keyword: 'eletric', suggestions: ['instalações elétricas', 'proteção elétrica', 'para-raios'] },
    { keyword: 'elevador', suggestions: ['elevadores de emergência', 'elevadores de segurança'] },
    { keyword: 'alarme', suggestions: ['sistema de alarme', 'detecção automática', 'central de alarmes'] },
    { keyword: 'extintor', suggestions: ['extintores portáteis', 'tipos de extintores', 'manutenção de extintores'] }
  ];

  const suggestions: SearchSuggestion[] = [];

  for (const { keyword, suggestions: keywordSugs } of commonKeywords) {
    if (query.includes(keyword) && suggestions.length < maxResults) {
      keywordSugs.forEach((suggestion, index) => {
        if (suggestions.length < maxResults && !suggestion.toLowerCase().includes(query)) {
          suggestions.push({
            id: `keyword-${keyword}-${index}`,
            title: suggestion,
            type: 'instruction' as const,
            description: `Buscar instruções sobre ${suggestion}`,
          });
        }
      });
    }
  }

  return suggestions;
}

// Função para sugestões contextuais avançadas
function generateContextualSuggestions(query: string): SearchSuggestion[] {
  const contextPatterns = [
    {
      pattern: /(\d+)\s*(andar|pavimento|piso)/i,
      generator: (match: RegExpMatchArray) => {
        const floors = parseInt(match[1]);
        return [
          {
            id: 'context-floors-1',
            title: `Edificações com ${floors} pavimentos - Saídas de emergência`,
            type: 'instruction' as const,
            description: 'Requisitos específicos para edificações de múltiplos pavimentos'
          },
          {
            id: 'context-floors-2', 
            title: `Sistemas de proteção para ${floors} andares`,
            type: 'instruction' as const,
            description: 'Sistemas adequados para a altura da edificação'
          }
        ];
      }
    },
    {
      pattern: /(shopping|comercial|loja)/i,
      generator: () => [
        {
          id: 'context-commercial-1',
          title: 'Centros comerciais - Requisitos específicos',
          type: 'instruction' as const,
          description: 'Instruções para edificações comerciais e shopping centers'
        }
      ]
    },
    {
      pattern: /(hospital|saude|clinica)/i,
      generator: () => [
        {
          id: 'context-health-1',
          title: 'Edificações de saúde - Proteção especial',
          type: 'instruction' as const,
          description: 'Requisitos específicos para hospitais e clínicas'
        }
      ]
    },
    {
      pattern: /(escola|educacional|ensino)/i,
      generator: () => [
        {
          id: 'context-education-1',
          title: 'Edificações educacionais - Segurança',
          type: 'instruction' as const,
          description: 'Instruções para escolas e instituições de ensino'
        }
      ]
    }
  ];

  const suggestions: SearchSuggestion[] = [];

  for (const { pattern, generator } of contextPatterns) {
    const match = query.match(pattern);
    if (match) {
      suggestions.push(...generator(match));
    }
  }

  return suggestions;
}

export async function POST(request: NextRequest) {
  try {
    const body: SuggestionRequest = await request.json();
    const { query, maxResults = 8 } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_QUERY',
          message: 'Query é obrigatória e deve ser uma string'
        }
      }, { status: 400 });
    }

    if (query.trim().length < 1) {
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    // Gerar sugestões inteligentes
    const suggestions = generateIntelligentSuggestions(query, maxResults);

    // Adicionar sugestões contextuais se ainda temos espaço
    if (suggestions.length < maxResults) {
      const contextualSuggestions = generateContextualSuggestions(query);
      suggestions.push(...contextualSuggestions.slice(0, maxResults - suggestions.length));
    }

    // Remover duplicatas baseado no título
    const uniqueSuggestions = suggestions.filter((suggestion, index, self) => 
      index === self.findIndex(s => s.title.toLowerCase() === suggestion.title.toLowerCase())
    );

    return NextResponse.json({
      success: true,
      data: uniqueSuggestions.slice(0, maxResults),
      meta: {
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}`,
        version: '1.0.0'
      }
    });

  } catch (error) {
    console.error('Erro ao gerar sugestões:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor ao gerar sugestões'
      }
    }, { status: 500 });
  }
}

// Método GET para compatibilidade
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || searchParams.get('query') || '';
  const maxResults = parseInt(searchParams.get('limit') || '8');

  if (!query) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'MISSING_QUERY',
        message: 'Parâmetro de busca (q ou query) é obrigatório'
      }
    }, { status: 400 });
  }

  // Redirecionar para o método POST
  return POST(new NextRequest(request.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query, maxResults })
  }));
}