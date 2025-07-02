import { NextRequest, NextResponse } from 'next/server';
import { searchAnalytics } from '@/lib/search-analytics';

// Dados mockados de conteúdo das ITs para demonstração
const MOCK_IT_CONTENT = [
  {
    id: 'IT-001',
    titulo: 'IT-001 - Procedimentos Administrativos',
    capitulos: [
      {
        numero: '1',
        titulo: 'Disposições Gerais',
        pagina: 3,
        conteudo: `
Esta Instrução Técnica estabelece os procedimentos administrativos para análise e aprovação de projetos preventivos contra incêndio e pânico.

1.1 OBJETIVO
Estabelecer critérios para a tramitação de processos de análise de projetos preventivos.

1.2 APLICAÇÃO
Aplica-se a todas as edificações que necessitem de projeto preventivo conforme legislação vigente.

1.3 RESPONSABILIDADES
O responsável técnico deve apresentar a documentação completa conforme esta IT.
        `
      },
      {
        numero: '2',
        titulo: 'Documentação Necessária',
        pagina: 5,
        conteudo: `
2.1 PROJETO ARQUITETÔNICO
Memorial descritivo detalhado da edificação com todas as especificações técnicas.

2.2 PLANTA BAIXA
Plantas baixas de todos os pavimentos em escala adequada (1:100 ou 1:50).

2.3 ART/RRT
Anotação de Responsabilidade Técnica devidamente preenchida e assinada.

2.4 CRONOGRAMA
Cronograma de execução das obras e instalações de segurança.
        `
      }
    ]
  },
  {
    id: 'IT-008',
    titulo: 'IT-008 - Saídas de Emergência',
    capitulos: [
      {
        numero: '3',
        titulo: 'Dimensionamento das Saídas',
        pagina: 12,
        conteudo: `
3.1 LARGURA MÍNIMA
As saídas de emergência devem ter largura mínima de 1,20m (um metro e vinte centímetros).

3.2 CAPACIDADE DE ESCOAMENTO
A capacidade de escoamento é de 100 pessoas por metro de largura da saída.

3.3 PORTAS DE EMERGÊNCIA
As portas devem abrir no sentido do escape e ter barra antipânico quando exigido.

3.4 CORREDORES
Os corredores de emergência devem ter largura mínima de 1,20m e máxima de 2,20m.
        `
      },
      {
        numero: '4',
        titulo: 'Sinalização de Emergência',
        pagina: 18,
        conteudo: `
4.1 PLACAS DE SAÍDA
Todas as saídas de emergência devem ser sinalizadas com placas fotoluminescentes.

4.2 ORIENTAÇÃO DO FLUXO
Setas indicativas devem orientar o fluxo de pessoas até as saídas.

4.3 ILUMINAÇÃO DE EMERGÊNCIA
Sistema de iluminação de emergência com autonomia mínima de 1 hora.
        `
      }
    ]
  },
  {
    id: 'IT-018',
    titulo: 'IT-018 - Iluminação de Emergência',
    capitulos: [
      {
        numero: '5',
        titulo: 'Especificações Técnicas',
        pagina: 8,
        conteudo: `
5.1 AUTONOMIA
O sistema deve ter autonomia mínima de 1 (uma) hora após falta de energia elétrica.

5.2 INTENSIDADE LUMINOSA
Mínimo de 5 lux em corredores e 3 lux em ambientes de permanência.

5.3 TEMPO DE COMUTAÇÃO
A comutação deve ocorrer em no máximo 5 segundos após a falta de energia.

5.4 BATERIAS
Utilizar baterias seladas livres de manutenção com vida útil mínima de 3 anos.
        `
      }
    ]
  },
  {
    id: 'IT-021',
    titulo: 'IT-021 - Sistema de Proteção por Extintores',
    capitulos: [
      {
        numero: '6',
        titulo: 'Classificação e Distribuição',
        pagina: 15,
        conteudo: `
6.1 CLASSES DE FOGO
Classe A: materiais sólidos (madeira, papel, tecido)
Classe B: líquidos inflamáveis (gasolina, álcool)
Classe C: equipamentos elétricos energizados

6.2 DISTÂNCIA MÁXIMA
A distância máxima de caminhamento até o extintor não deve exceder 20 metros.

6.3 ALTURA DE INSTALAÇÃO
Os extintores devem ser instalados com a parte superior a 1,60m do piso.

6.4 SINALIZAÇÃO
Todos os extintores devem ter sinalização adequada conforme normas.
        `
      }
    ]
  },
  {
    id: 'IT-022',
    titulo: 'IT-022 - Sistema de Hidrantes',
    capitulos: [
      {
        numero: '7',
        titulo: 'Dimensionamento do Sistema',
        pagina: 22,
        conteudo: `
7.1 PRESSÃO MÍNIMA
A pressão dinâmica mínima no hidrante mais desfavorável deve ser de 10 mca.

7.2 VAZÃO MÍNIMA
Vazão mínima de 125 L/min (cento e vinte e cinco litros por minuto).

7.3 RESERVA TÉCNICA
Volume mínimo de reserva de incêndio conforme área e risco da edificação.

7.4 MANGUEIRAS
Mangueiras de 40mm de diâmetro com comprimento de 15 ou 30 metros.
        `
      }
    ]
  }
];

// Sugestões de pesquisas populares
const SUGGESTED_SEARCHES = [
  'largura mínima saída emergência',
  'autonomia iluminação emergência',
  'distância máxima extintores',
  'pressão mínima hidrantes',
  'memorial descritivo documentação',
  'ART responsável técnico',
  'sinalização emergência placas',
  'classes de fogo extintores',
  'vazão mínima hidrantes',
  'cronograma execução obras'
];

function highlightText(text: string, searchTerm: string): string {
  if (!searchTerm) return text;
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

interface SearchResult {
  it: string;
  titulo: string;
  capitulo: string;
  pagina: number;
  score: number;
  trecho: string;
  matchedTerms: string[];
  url: string;
}

function searchInContent(query: string) {
  const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
  const results: SearchResult[] = [];

  for (const it of MOCK_IT_CONTENT) {
    for (const capitulo of it.capitulos) {
      const contentLower = capitulo.conteudo.toLowerCase();
      let score = 0;
      const matchedTerms: string[] = [];

      // Calcular score baseado em quantos termos foram encontrados
      for (const term of searchTerms) {
        if (contentLower.includes(term)) {
          score += 1;
          matchedTerms.push(term);
        }
      }

      if (score > 0) {
        // Extrair trecho relevante (contexto de ~200 caracteres)
        const firstMatchIndex = contentLower.indexOf(matchedTerms[0]);
        const start = Math.max(0, firstMatchIndex - 100);
        const end = Math.min(capitulo.conteudo.length, firstMatchIndex + 100);
        let excerpt = capitulo.conteudo.substring(start, end).trim();
        
        // Adicionar reticências se necessário
        if (start > 0) excerpt = '...' + excerpt;
        if (end < capitulo.conteudo.length) excerpt = excerpt + '...';

        // Destacar termos encontrados
        const highlightedExcerpt = highlightText(excerpt, matchedTerms.join('|'));

        results.push({
          it: it.id,
          titulo: it.titulo,
          capitulo: `Capítulo ${capitulo.numero} - ${capitulo.titulo}`,
          pagina: capitulo.pagina,
          score,
          trecho: highlightedExcerpt,
          matchedTerms,
          url: `/biblioteca/${it.id}#pagina-${capitulo.pagina}`
        });
      }
    }
  }

  // Ordenar por score (relevância)
  return results.sort((a, b) => b.score - a.score);
}

function getSuggestions(query: string): string[] {
  const queryLower = query.toLowerCase();
  
  // Filtrar sugestões relacionadas à consulta
  const related = SUGGESTED_SEARCHES.filter(suggestion => 
    suggestion.includes(queryLower) || 
    queryLower.split(' ').some(term => suggestion.includes(term))
  );

  // Se não houver relacionadas, retornar sugestões populares
  if (related.length === 0) {
    return SUGGESTED_SEARCHES.slice(0, 5);
  }

  return related.concat(
    SUGGESTED_SEARCHES.filter(s => !related.includes(s))
  ).slice(0, 5);
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId') || generateSessionId();

    if (!query || query.trim().length < 3) {
      return NextResponse.json({
        success: false,
        error: 'Consulta deve ter pelo menos 3 caracteres'
      }, { status: 400 });
    }

    const trimmedQuery = query.trim();
    
    // Realizar busca
    const results = searchInContent(trimmedQuery);
    
    // Obter sugestões inteligentes baseadas no contexto
    const context = {
      userId,
      sessionId,
      ipAddress: getClientIP(request),
      userAgent: request.headers.get('user-agent') || undefined
    };

    const suggestions = await getEnhancedSuggestions(trimmedQuery, context);

    const searchDuration = Date.now() - startTime;

    // Registrar busca no sistema de analytics de forma assíncrona
    recordSearchAsync(context, {
      query: trimmedQuery,
      resultsCount: results.length,
      duration: searchDuration,
      timestamp: new Date(),
      clicked: false,
      filters: {}
    });

    return NextResponse.json({
      success: true,
      data: {
        query: trimmedQuery,
        totalResults: results.length,
        results: results.slice(0, 20), // Limitar a 20 resultados
        suggestions,
        stats: {
          searchTime: `${(searchDuration / 1000).toFixed(2)}s`,
          itsSearched: MOCK_IT_CONTENT.length,
          sessionId
        }
      }
    });

  } catch (error) {
    console.error('Erro na pesquisa:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}

// Funções auxiliares para o sistema de analytics

function generateSessionId(): string {
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

async function getEnhancedSuggestions(query: string, context: any): Promise<string[]> {
  try {
    // Combinar sugestões tradicionais com sugestões inteligentes
    const traditionalSuggestions = getSuggestions(query);
    
    // Obter sugestões contextuais se houver usuário
    let contextualSuggestions: string[] = [];
    if (context.userId) {
      const smartSuggestions = await searchAnalytics.getSmartSuggestions(query, context);
      contextualSuggestions = smartSuggestions.map(s => s.suggestion);
    }

    // Combinar e deduplificar
    const allSuggestions = [...new Set([...contextualSuggestions, ...traditionalSuggestions])];
    return allSuggestions.slice(0, 8);

  } catch (error) {
    console.error('Erro ao obter sugestões inteligentes:', error);
    return getSuggestions(query);
  }
}

async function recordSearchAsync(context: any, metrics: any): Promise<void> {
  try {
    // Não aguardar - executar de forma assíncrona
    setTimeout(async () => {
      await searchAnalytics.recordSearch(context, metrics);
    }, 0);
  } catch (error) {
    console.error('Erro ao registrar busca:', error);
  }
}

// API para registrar cliques em resultados
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, resultId, resultType, userId, sessionId } = body;

    if (!query || !resultId) {
      return NextResponse.json({
        success: false,
        error: 'Query e resultId são obrigatórios'
      }, { status: 400 });
    }

    const context = {
      userId,
      sessionId,
      ipAddress: getClientIP(request),
      userAgent: request.headers.get('user-agent') || undefined
    };

    // Registrar clique
    await searchAnalytics.recordClick(context, query, resultId, resultType || 'instruction');

    return NextResponse.json({
      success: true,
      data: { recorded: true }
    });

  } catch (error) {
    console.error('Erro ao registrar clique:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}