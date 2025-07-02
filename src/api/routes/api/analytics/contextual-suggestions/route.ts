import { NextRequest, NextResponse } from 'next/server';

/**
 * API para obter sugestões contextuais baseadas no histórico do usuário
 */

// Storage temporário para histórico de usuários (simulação)
const userSearchHistory = new Map<string, any[]>();

// Inicializar com dados de exemplo
initializeExampleHistory();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '5');

    if (!query) {
      return NextResponse.json({
        success: false,
        error: 'Query é obrigatória'
      }, { status: 400 });
    }

    const suggestions = await generateContextualSuggestions(query, userId, limit);

    return NextResponse.json({
      success: true,
      data: {
        query,
        userId,
        suggestions
      }
    });

  } catch (error) {
    console.error('Erro ao gerar sugestões contextuais:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}

interface ContextualSuggestion {
  suggestion: string;
  type: 'contextual' | 'related' | 'popular' | 'completion';
  score: number;
  reason: string;
  metadata?: Record<string, any>;
}

async function generateContextualSuggestions(
  query: string,
  userId?: string | null,
  limit: number = 5
): Promise<ContextualSuggestion[]> {
  const suggestions: ContextualSuggestion[] = [];
  const queryLower = query.toLowerCase().trim();

  // 1. Sugestões baseadas no histórico do usuário
  if (userId && userSearchHistory.has(userId)) {
    const userHistory = userSearchHistory.get(userId)!;
    const historySuggestions = generateHistoryBasedSuggestions(queryLower, userHistory);
    suggestions.push(...historySuggestions);
  }

  // 2. Sugestões de sequência lógica (usuário pesquisou A, sugerir B relacionado)
  const sequenceSuggestions = generateSequenceSuggestions(queryLower, userId);
  suggestions.push(...sequenceSuggestions);

  // 3. Sugestões de refinamento/expansão
  const refinementSuggestions = generateRefinementSuggestions(queryLower);
  suggestions.push(...refinementSuggestions);

  // 4. Sugestões de completamento inteligente
  const completionSuggestions = generateSmartCompletions(queryLower);
  suggestions.push(...completionSuggestions);

  // 5. Sugestões baseadas em tópicos relacionados
  const topicSuggestions = generateTopicBasedSuggestions(queryLower);
  suggestions.push(...topicSuggestions);

  // Remover duplicatas e ordenar por score
  const uniqueSuggestions = Array.from(
    new Map(suggestions.map(s => [s.suggestion, s])).values()
  ).sort((a, b) => b.score - a.score);

  return uniqueSuggestions.slice(0, limit);
}

function generateHistoryBasedSuggestions(
  query: string,
  userHistory: any[]
): ContextualSuggestion[] {
  const suggestions: ContextualSuggestion[] = [];
  
  // Encontrar buscas similares no histórico
  const similarSearches = userHistory.filter(search => {
    const searchQuery = search.query.toLowerCase();
    return searchQuery.includes(query) || query.includes(searchQuery) ||
           hasQuerySimilarity(query, searchQuery);
  });

  // Gerar sugestões baseadas em padrões do usuário
  for (const search of similarSearches.slice(0, 3)) {
    if (search.query.toLowerCase() !== query) {
      suggestions.push({
        suggestion: search.query,
        type: 'contextual',
        score: 0.8 + (search.clicked ? 0.1 : 0),
        reason: `Baseado no seu histórico de buscas`,
        metadata: {
          lastUsed: search.timestamp,
          resultsCount: search.resultsCount,
          wasClicked: search.clicked
        }
      });
    }
  }

  // Identificar padrões sequenciais
  const queryTopics = identifyTopics(query);
  const relatedSearches = userHistory.filter(search => {
    const searchTopics = identifyTopics(search.query);
    return queryTopics.some(topic => searchTopics.includes(topic));
  });

  for (const search of relatedSearches.slice(0, 2)) {
    if (!suggestions.find(s => s.suggestion === search.query)) {
      suggestions.push({
        suggestion: search.query,
        type: 'related',
        score: 0.7,
        reason: `Relacionado aos seus interesses em ${queryTopics.join(', ')}`,
        metadata: {
          topics: identifyTopics(search.query),
          frequency: getQueryFrequency(search.query, userHistory)
        }
      });
    }
  }

  return suggestions;
}

function generateSequenceSuggestions(
  query: string,
  userId?: string | null
): ContextualSuggestion[] {
  const suggestions: ContextualSuggestion[] = [];
  
  // Mapear sequências lógicas comuns no domínio
  const logicalSequences = {
    'saída emergência': [
      'largura mínima saída emergência',
      'sinalização saída emergência',
      'iluminação saída emergência',
      'porta saída emergência'
    ],
    'iluminação': [
      'autonomia iluminação emergência',
      'intensidade luminosa emergência',
      'tempo comutação iluminação',
      'bateria iluminação emergência'
    ],
    'extintor': [
      'distância máxima extintores',
      'classes de fogo extintores',
      'sinalização extintores',
      'manutenção extintores'
    ],
    'hidrante': [
      'pressão mínima hidrantes',
      'vazão hidrantes',
      'mangueiras hidrantes',
      'reserva água incêndio'
    ],
    'memorial': [
      'memorial descritivo',
      'especificações técnicas memorial',
      'cronograma memorial',
      'ART memorial descritivo'
    ]
  };

  // Identificar tópico da query atual
  for (const [topic, sequences] of Object.entries(logicalSequences)) {
    if (query.includes(topic)) {
      for (const sequence of sequences) {
        if (!sequence.toLowerCase().includes(query.toLowerCase())) {
          suggestions.push({
            suggestion: sequence,
            type: 'contextual',
            score: 0.75,
            reason: `Próximo passo lógico após pesquisar sobre ${topic}`,
            metadata: {
              sequenceType: 'logical_next',
              baseTopic: topic
            }
          });
        }
      }
      break;
    }
  }

  return suggestions.slice(0, 3);
}

function generateRefinementSuggestions(query: string): ContextualSuggestion[] {
  const suggestions: ContextualSuggestion[] = [];
  
  // Refinamentos específicos baseados na query
  const refinements = {
    'saída': ['largura saída', 'altura saída', 'quantidade saídas', 'distância saída'],
    'iluminação': ['autonomia iluminação', 'intensidade iluminação', 'tipo iluminação', 'instalação iluminação'],
    'extintor': ['tipo extintor', 'quantidade extintores', 'localização extintores', 'inspeção extintores'],
    'hidrante': ['tipo hidrante', 'pressão hidrante', 'instalação hidrantes', 'teste hidrantes'],
    'memorial': ['estrutura memorial', 'conteúdo memorial', 'modelo memorial', 'revisão memorial']
  };

  for (const [baseWord, refinementList] of Object.entries(refinements)) {
    if (query.includes(baseWord)) {
      for (const refinement of refinementList) {
        if (!query.includes(refinement)) {
          suggestions.push({
            suggestion: refinement,
            type: 'contextual',
            score: 0.65,
            reason: `Refinamento da busca por ${baseWord}`,
            metadata: {
              refinementType: 'specific',
              baseWord
            }
          });
        }
      }
      break;
    }
  }

  return suggestions.slice(0, 2);
}

function generateSmartCompletions(query: string): ContextualSuggestion[] {
  const suggestions: ContextualSuggestion[] = [];
  
  // Completamentos inteligentes baseados em padrões comuns
  const completionPatterns = [
    {
      pattern: /^largura/i,
      completions: ['largura mínima saída emergência', 'largura corredor emergência', 'largura porta emergência']
    },
    {
      pattern: /^autonomia/i,
      completions: ['autonomia iluminação emergência', 'autonomia sistema emergência', 'autonomia bateria emergência']
    },
    {
      pattern: /^distância/i,
      completions: ['distância máxima extintores', 'distância caminhamento', 'distância entre hidrantes']
    },
    {
      pattern: /^pressão/i,
      completions: ['pressão mínima hidrantes', 'pressão sistema hidráulico', 'pressão teste instalações']
    },
    {
      pattern: /^memorial/i,
      completions: ['memorial descritivo', 'memorial cálculo', 'memorial justificativo']
    }
  ];

  for (const { pattern, completions } of completionPatterns) {
    if (pattern.test(query)) {
      for (const completion of completions) {
        if (!completion.toLowerCase().includes(query.toLowerCase()) || completion.length > query.length) {
          suggestions.push({
            suggestion: completion,
            type: 'completion',
            score: 0.7,
            reason: 'Completamento sugerido',
            metadata: {
              completionType: 'smart_pattern'
            }
          });
        }
      }
      break;
    }
  }

  return suggestions.slice(0, 2);
}

function generateTopicBasedSuggestions(query: string): ContextualSuggestion[] {
  const suggestions: ContextualSuggestion[] = [];
  
  // Identificar tópicos da query
  const topics = identifyTopics(query);
  
  // Mapear tópicos para sugestões relacionadas
  const topicSuggestions = {
    'seguranca': ['plano emergência', 'rotas fuga', 'procedimentos evacuação'],
    'estrutural': ['resistência fogo', 'compartimentação', 'isolamento térmico'],
    'instalacoes': ['sistema hidráulico', 'sistema elétrico', 'ventilação'],
    'manutencao': ['inspeção periódica', 'teste equipamentos', 'relatório manutenção'],
    'normalizacao': ['normas técnicas', 'legislação', 'regulamentação']
  };

  for (const topic of topics) {
    if (topicSuggestions[topic as keyof typeof topicSuggestions]) {
      for (const suggestion of topicSuggestions[topic as keyof typeof topicSuggestions]) {
        if (!query.toLowerCase().includes(suggestion.toLowerCase())) {
          suggestions.push({
            suggestion: suggestion,
            type: 'related',
            score: 0.6,
            reason: `Relacionado ao tópico ${topic}`,
            metadata: {
              relatedTopic: topic
            }
          });
        }
      }
    }
  }

  return suggestions.slice(0, 2);
}

// Funções auxiliares
function hasQuerySimilarity(query1: string, query2: string): boolean {
  const words1 = new Set(query1.split(' ').filter(w => w.length > 2));
  const words2 = new Set(query2.split(' ').filter(w => w.length > 2));
  
  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size > 0.3; // 30% de similaridade
}

function identifyTopics(query: string): string[] {
  const topicPatterns = {
    'seguranca': /segurança|emergência|escape|evacuação|proteção/i,
    'estrutural': /estrutura|parede|laje|resistência|compartiment/i,
    'instalacoes': /instalação|sistema|equipamento|dispositivo/i,
    'manutencao': /manutenção|inspeção|teste|verificação/i,
    'normalizacao': /norma|lei|regulamento|legislação/i
  };

  const topics: string[] = [];
  for (const [topic, pattern] of Object.entries(topicPatterns)) {
    if (pattern.test(query)) {
      topics.push(topic);
    }
  }

  return topics;
}

function getQueryFrequency(query: string, history: any[]): number {
  return history.filter(search => 
    search.query.toLowerCase() === query.toLowerCase()
  ).length;
}

function initializeExampleHistory(): void {
  // Dados de exemplo para demonstração
  const exampleUsers = [
    {
      userId: 'user123',
      searches: [
        {
          query: 'largura mínima saída emergência',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
          resultsCount: 8,
          clicked: true,
          duration: 1200
        },
        {
          query: 'sinalização saída emergência',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 horas atrás
          resultsCount: 6,
          clicked: true,
          duration: 950
        },
        {
          query: 'autonomia iluminação emergência',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 dia atrás
          resultsCount: 5,
          clicked: false,
          duration: 800
        },
        {
          query: 'memorial descritivo',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
          resultsCount: 12,
          clicked: true,
          duration: 1800
        }
      ]
    },
    {
      userId: 'user456',
      searches: [
        {
          query: 'distância máxima extintores',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hora atrás
          resultsCount: 4,
          clicked: true,
          duration: 600
        },
        {
          query: 'classes de fogo',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 horas atrás
          resultsCount: 7,
          clicked: false,
          duration: 1100
        }
      ]
    }
  ];

  exampleUsers.forEach(user => {
    userSearchHistory.set(user.userId, user.searches);
  });
}