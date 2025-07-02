// ==============================================================================
// OPENROUTER API CONFIGURATION
// ==============================================================================

import { SearchResponse } from '@/types';

// OpenRouter API Configuration
export const OPENROUTER_CONFIG = {
  baseUrl: 'https://openrouter.ai/api/v1',
  model: 'deepseek/deepseek-r1:free', // Using DeepSeek R1 model
  headers: {
    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': process.env.SITE_URL || 'http://localhost:3000',
    'X-Title': 'CB-PI Consulta Inteligente',
  }
} as const;

// Sistema de prompt específico para o SaaS CB-PI
export const CB_PI_SYSTEM_PROMPT = `
Você é um assistente especializado do Sistema de Consulta de Instruções Técnicas do Corpo de Bombeiros do Piauí (CB-PI).

CONTEXTO DO SISTEMA:
- Plataforma SaaS para consulta inteligente de Instruções Técnicas (ITs) de segurança contra incêndio
- Usuários são profissionais de engenharia, arquitetura e técnicos do CB-PI
- Sistema possui biblioteca completa de ITs, análise de memoriais descritivos e funcionalidades de pesquisa

PRINCIPAIS RECURSOS DISPONÍVEIS:
1. PESQUISA INTELIGENTE: Busca semântica por ITs com filtros avançados
2. BIBLIOTECA COMPLETA: Acesso a todas as Instruções Técnicas organizadas por categoria
3. ANÁLISE DE MEMORIAL: Upload e análise automática de conformidade de memoriais descritivos
4. AJUDA E SUPORTE: Documentação e tutoriais do sistema

CATEGORIAS DE ITs DISPONÍVEIS:
- Disposições Gerais
- Procedimentos Administrativos  
- Segurança Estrutural Contra Incêndio
- Segurança Contra Incêndio - Sistemas
- Segurança Contra Incêndio - Ocupações Especiais
- Plano de Prevenção e Proteção Contra Incêndio
- Controle de Materiais de Acabamento e Revestimento
- Saídas de Emergência
- Brigada de Incêndio
- Controle de Fumaça

SUA FUNÇÃO:
Analisar consultas dos usuários e retornar uma resposta estruturada que ajude na navegação e uso do sistema.

FORMATO DE RESPOSTA:
- query_understood: Reformule a consulta de forma clara e técnica
- intent: Classifique como 'navigation', 'information', 'action' ou 'support'
- category: Liste categorias de ITs relevantes (máximo 3)
- suggestions: Forneça 3-5 sugestões específicas de busca ou ação
- direct_answer: Resposta direta quando aplicável (opcional)
- relevant_features: Recursos do sistema que podem ajudar (opcional)
- confidence: Nível de confiança na resposta (0-1)

DIRETRIZES:
- Use terminologia técnica adequada de segurança contra incêndio
- Seja específico nas sugestões de ITs quando possível
- Priorize eficiência e precisão nas respostas
- Considere o contexto regulatório do CB-PI
`;

// Função para fazer chamada à API do OpenRouter
export async function callOpenRouterAPI(
  userQuery: string,
  systemPrompt: string = CB_PI_SYSTEM_PROMPT
): Promise<SearchResponse> {
  try {
    const response = await fetch(`${OPENROUTER_CONFIG.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: OPENROUTER_CONFIG.headers,
      body: JSON.stringify({
        model: OPENROUTER_CONFIG.model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Analise esta consulta e retorne uma resposta estruturada em JSON válido: "${userQuery}"`
          }
        ],
        response_format: {
          type: 'json_object'
        },
        temperature: 0.3,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from OpenRouter API');
    }

    // Parse do JSON retornado pela API
    const parsedResponse: SearchResponse = JSON.parse(content);

    // Validação básica da resposta
    if (!parsedResponse.query_understood || !parsedResponse.intent) {
      throw new Error('Invalid response format from OpenRouter API');
    }

    return parsedResponse;

  } catch (error) {
    console.error('Error calling OpenRouter API:', error);
    
    // Fallback response em caso de erro
    return {
      query_understood: userQuery,
      intent: 'information',
      category: ['Disposições Gerais'],
      suggestions: [
        'Utilize a pesquisa por palavras-chave',
        'Navegue pelas categorias de ITs',
        'Consulte a biblioteca completa'
      ],
      confidence: 0.1
    };
  }
}

// Função utilitária para validar configuração
export function validateOpenRouterConfig(): boolean {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    console.warn('OPENROUTER_API_KEY not found in environment variables');
    return false;
  }

  if (apiKey.length < 10) {
    console.warn('OPENROUTER_API_KEY appears to be invalid (too short)');
    return false;
  }

  return true;
}

// Função para processar categorias e mapear para o sistema
export function mapCategoriesToSystem(categories: string[]): string[] {
  const categoryMap: Record<string, string> = {
    'geral': 'Disposições Gerais',
    'administrativo': 'Procedimentos Administrativos',
    'estrutural': 'Segurança Estrutural Contra Incêndio',
    'sistemas': 'Segurança Contra Incêndio - Sistemas',
    'ocupacoes': 'Segurança Contra Incêndio - Ocupações Especiais',
    'plano': 'Plano de Prevenção e Proteção Contra Incêndio',
    'materiais': 'Controle de Materiais de Acabamento e Revestimento',
    'saidas': 'Saídas de Emergência',
    'brigada': 'Brigada de Incêndio',
    'fumaca': 'Controle de Fumaça'
  };

  return categories.map(cat => {
    const key = cat.toLowerCase();
    return categoryMap[key] || cat;
  });
}