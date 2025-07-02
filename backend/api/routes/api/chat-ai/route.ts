import { NextRequest, NextResponse } from 'next/server';
import { callOpenRouterAPI } from '@/lib/openrouter-config';
import { todasInstrucoes } from '@/lib/data';
import { instrucoesTecnicas } from '@/lib/instrucoes-scraped';

// ==============================================================================
// TIPOS E INTERFACES
// ==============================================================================

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatRequest {
  message: string;
  context?: ChatMessage[];
}

interface ChatSource {
  id: string;
  titulo: string;
  numero?: string;
  categoria: string;
  relevancia: number;
  url?: string;
}

interface ChatResponse {
  success: boolean;
  data?: {
    response: string;
    sources: ChatSource[];
    confidence: number;
    metadata: {
      processingTime: number;
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

// ==============================================================================
// SISTEMA DE BUSCA E ANÁLISE
// ==============================================================================

// Função para buscar ITs relevantes baseado na pergunta do usuário
function findRelevantInstructions(query: string, maxResults: number = 5): ChatSource[] {
  const normalizedQuery = query.toLowerCase();
  const results: Array<ChatSource & { score: number }> = [];

  // Buscar em instruções populares (dados estruturados)
  todasInstrucoes.forEach(instrucao => {
    let score = 0;
    
    // Pontuação por título
    if (instrucao.titulo.toLowerCase().includes(normalizedQuery)) score += 10;
    
    // Pontuação por descrição
    if (instrucao.descricao?.toLowerCase().includes(normalizedQuery)) score += 8;
    
    // Pontuação por palavras-chave
    instrucao.palavrasChave?.forEach(palavra => {
      if (normalizedQuery.includes(palavra.toLowerCase())) score += 5;
    });
    
    // Pontuação por tags
    instrucao.tags?.forEach(tag => {
      if (normalizedQuery.includes(tag.toLowerCase())) score += 3;
    });

    // Pontuação por categoria
    if (normalizedQuery.includes(instrucao.categoria.toLowerCase())) score += 2;

    if (score > 0) {
      results.push({
        id: instrucao.id,
        titulo: instrucao.titulo,
        numero: instrucao.numero,
        categoria: instrucao.categoria,
        relevancia: Math.min(Math.round((score / 15) * 100), 100),
        url: instrucao.arquivo || undefined,
        score
      });
    }
  });

  // Buscar em instruções scraped (dados reais do CB-PI)
  instrucoesTecnicas.forEach(instrucao => {
    let score = 0;
    
    // Pontuação por título
    if (instrucao.titulo.toLowerCase().includes(normalizedQuery)) score += 10;
    
    // Pontuação por categoria
    if (normalizedQuery.includes(instrucao.categoria.toLowerCase())) score += 5;

    // Busca por padrões específicos
    const patterns = {
      'hidrantes': ['hidrante', 'mangotinho', 'combate'],
      'saidas emergencia': ['saída', 'emergência', 'escape', 'evacuação'],
      'detecção': ['detecção', 'alarme', 'detector', 'fumaça'],
      'extintores': ['extintor', 'portátil', 'pó químico'],
      'iluminação': ['iluminação', 'emergência', 'sinalização'],
      'procedimentos': ['procedimento', 'administrativo', 'análise'],
      'estrutural': ['estrutural', 'resistência', 'fogo', 'laje'],
      'carga incendio': ['carga', 'incêndio', 'material', 'combustível']
    };

    Object.entries(patterns).forEach(([key, keywords]) => {
      if (keywords.some(keyword => normalizedQuery.includes(keyword))) {
        if (instrucao.titulo.toLowerCase().includes(key) || 
            keywords.some(k => instrucao.titulo.toLowerCase().includes(k))) {
          score += 8;
        }
      }
    });

    if (score > 0) {
      results.push({
        id: instrucao.id.toString(),
        titulo: instrucao.titulo,
        categoria: instrucao.categoria,
        relevancia: Math.min(Math.round((score / 15) * 100), 100),
        url: instrucao.url,
        score
      });
    }
  });

  // Remover duplicatas e ordenar por score
  const uniqueResults = results
    .filter((item, index, arr) => arr.findIndex(t => t.titulo === item.titulo) === index)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(({ score, ...item }) => item);

  return uniqueResults;
}

// Sistema de prompt especializado para chat
const CHAT_SYSTEM_PROMPT = `
Você é um assistente especializado do Corpo de Bombeiros do Piauí (CB-PI), expert em Instruções Técnicas de segurança contra incêndio.

SUAS CAPACIDADES:
- Responder perguntas sobre normas de segurança contra incêndio
- Explicar dimensionamentos e cálculos técnicos
- Orientar sobre procedimentos administrativos
- Interpretar requisitos de ITs específicas
- Sugerir soluções para projetos de prevenção

INSTRUÇÕES PARA RESPOSTA:
1. Seja técnico mas acessível
2. Use exemplos práticos quando possível
3. Cite sempre as ITs relevantes
4. Organize a resposta de forma clara
5. Inclua dicas importantes de segurança

FORMATO DE RESPOSTA:
- Resposta direta e objetiva
- Use emojis ocasionalmente para clareza
- Estruture com tópicos quando apropriado
- Sempre mencione as fontes consultadas

CONTEXTO DAS ITs DISPONÍVEIS:
- 105+ Instruções Técnicas do CB-PI
- Normas atualizadas sobre segurança contra incêndio
- Procedimentos administrativos
- Requisitos técnicos para diferentes tipos de edificação

Responda sempre em português brasileiro, de forma profissional mas amigável.
`;

// ==============================================================================
// HANDLERS DA API
// ==============================================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body: ChatRequest = await request.json();
    
    if (!body.message || typeof body.message !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Mensagem é obrigatória'
      }, { status: 400 });
    }

    // Buscar ITs relevantes baseado na pergunta
    const relevantSources = findRelevantInstructions(body.message, 5);
    
    // Preparar contexto das conversas anteriores
    const conversationContext = body.context
      ? body.context.slice(-4).map(msg => `${msg.role}: ${msg.content}`).join('\n')
      : '';

    // Preparar contexto das ITs encontradas
    const sourcesContext = relevantSources.length > 0
      ? `\n\nINSTRUÇÕES TÉCNICAS RELEVANTES ENCONTRADAS:\n${relevantSources.map(source => 
          `- ${source.titulo} (${source.categoria}) - Relevância: ${source.relevancia}%`
        ).join('\n')}`
      : '';

    // Montar prompt completo
    const fullPrompt = `${CHAT_SYSTEM_PROMPT}

CONTEXTO DA CONVERSA:
${conversationContext}

PERGUNTA DO USUÁRIO: "${body.message}"
${sourcesContext}

Responda de forma helpful, técnica e precisa, sempre citando as ITs relevantes quando aplicável.`;

    // Chamar OpenRouter API
    let aiResponse: string;
    let modelUsed = 'fallback-local';
    let tokenUsage = { prompt: 0, completion: 0, total: 0 };

    try {
      // Tentar usar OpenRouter
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.SITE_URL || 'http://localhost:3001',
          'X-Title': 'CB-PI Chat Assistant'
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-r1:free',
          messages: [
            {
              role: 'system',
              content: fullPrompt
            },
            {
              role: 'user',
              content: body.message
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (response.ok) {
        const data = await response.json();
        aiResponse = data.choices[0]?.message?.content || 'Não foi possível gerar uma resposta.';
        modelUsed = 'deepseek-r1';
        tokenUsage = {
          prompt: data.usage?.prompt_tokens || 0,
          completion: data.usage?.completion_tokens || 0,
          total: data.usage?.total_tokens || 0
        };
      } else {
        throw new Error('OpenRouter API failed');
      }
    } catch (error) {
      console.log('OpenRouter indisponível, usando fallback local');
      
      // Fallback: resposta baseada em padrões conhecidos
      aiResponse = generateFallbackResponse(body.message, relevantSources);
    }

    const processingTime = Date.now() - startTime;

    const response: ChatResponse = {
      success: true,
      data: {
        response: aiResponse,
        sources: relevantSources,
        confidence: relevantSources.length > 0 ? 0.8 : 0.5,
        metadata: {
          processingTime,
          modelUsed,
          tokenUsage
        }
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Erro na API de chat:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}

// Função de fallback para quando a OpenRouter não está disponível
function generateFallbackResponse(question: string, sources: ChatSource[]): string {
  const normalizedQuestion = question.toLowerCase();
  
  // Padrões de resposta baseados em palavras-chave
  const patterns = {
    'hidrantes': `🚒 **Sistemas de Hidrantes e Mangotinhos**

Para dimensionamento de hidrantes, consulte principalmente a **IT-22**. Os principais requisitos são:

• **Vazão mínima**: 150 L/min por hidrante
• **Pressão mínima**: 10 mca na saída do hidrante
• **Distância máxima**: 30m entre hidrantes
• **Altura máxima**: Máximo 5m do piso

**Cálculo básico:**
- Área da edificação ÷ 900m² = número mínimo de hidrantes
- Considerar pavimentos e compartimentação`,

    'saída': `🚪 **Saídas de Emergência**

As saídas de emergência seguem a **IT-11** e devem atender:

• **Largura mínima**: 1,20m para portas
• **Percurso máximo**: 40m até saída (ocupações comuns)
• **Quantidade**: Mínimo 2 saídas independentes
• **Portas**: Abertura no sentido do escape

**Cálculo da largura:**
- População × 0,005m = largura total necessária
- Dividir entre as saídas disponíveis`,

    'detecção': `🔔 **Sistema de Detecção e Alarme**

Baseado na **IT-19**, os sistemas devem ter:

• **Detectores**: Máximo 80m² por detector pontual
• **Central**: Em local monitorado 24h
• **Acionadores**: Máximo 30m entre eles
• **Avisos**: Audíveis em todos os ambientes

**Tipos de detectores:**
- Fumaça: Áreas gerais
- Temperatura: Cozinhas, garagens
- Chama: Áreas de risco específico`,

    'carga': `📊 **Carga de Incêndio**

Para calcular a carga de incêndio específica:

• **Fórmula**: Qs = (M × H) / A
• **M**: Massa dos materiais combustíveis (kg)
• **H**: Poder calorífico (MJ/kg)
• **A**: Área do pavimento (m²)

**Classificação:**
- Baixa: Qs ≤ 300 MJ/m²
- Média: 300 < Qs ≤ 1200 MJ/m²
- Alta: Qs > 1200 MJ/m²`,

    'extintor': `🧯 **Extintores de Incêndio**

Conforme **IT-21**, os extintores devem atender:

• **Distância máxima**: 25m para Classe A
• **Instalação**: 1,60m do piso (centro)
• **Sinalização**: Obrigatória e visível
• **Capacidade mínima**: 6kg/L para uso geral

**Tipos por classe de fogo:**
- Classe A: Água, espuma
- Classe B: Pó químico, CO₂
- Classe C: Pó químico, CO₂`
  };

  // Encontrar padrão correspondente
  for (const [key, response] of Object.entries(patterns)) {
    if (normalizedQuestion.includes(key)) {
      return response + (sources.length > 0 ? '\n\n📚 Consulte as ITs mencionadas acima para informações detalhadas.' : '');
    }
  }

  // Resposta genérica se nenhum padrão foi encontrado
  if (sources.length > 0) {
    return `📋 Encontrei ${sources.length} instruções técnicas relacionadas à sua pergunta:

${sources.map((source, index) => 
  `${index + 1}. **${source.titulo}** (${source.categoria}) - ${source.relevancia}% de relevância`
).join('\n')}

💡 Para informações específicas, consulte diretamente essas ITs ou reformule sua pergunta com mais detalhes sobre o que precisa saber.`;
  }

  return `🤔 Sua pergunta é interessante! Para fornecer uma resposta mais precisa, poderia ser mais específico sobre:

• Que tipo de edificação ou projeto?
• Qual aspecto da segurança contra incêndio?
• Alguma IT específica que gostaria de consultar?

💡 **Exemplos de perguntas que posso ajudar:**
- "Como dimensionar hidrantes para um prédio comercial?"
- "Qual a largura mínima de escadas de emergência?"
- "O que é necessário para sistema de detecção em hospital?"`;
}

export async function GET() {
  return NextResponse.json({
    message: 'Chat AI API está funcionando',
    version: '1.0.0',
    features: [
      'Consulta a 105+ Instruções Técnicas',
      'Respostas contextuais via DeepSeek R1',
      'Busca semântica inteligente',
      'Fallback local robusto'
    ]
  });
}