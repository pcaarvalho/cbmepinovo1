import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `Você é um assistente do sistema de consulta de normas técnicas do CB-PI. 
Responda perguntas sobre como usar o sistema, buscar documentos, 
e informações sobre EPIs e instruções técnicas. 
Seja direto e útil. Máximo 3 linhas de resposta.`;

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Mensagem é obrigatória'
      }, { status: 400 });
    }

    // Chamar OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.SITE_URL || 'http://localhost:3000',
        'X-Title': 'CB-PI Chat Assistant'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1',
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || 'Não foi possível gerar uma resposta.';

    return NextResponse.json({
      success: true,
      content: content.trim()
    });

  } catch (error) {
    console.error('Erro na API do chat:', error);
    
    // Fallback local
    const fallbackContent = getFallbackResponse(
      (await request.json()).message || ''
    );

    return NextResponse.json({
      success: true,
      content: fallbackContent
    });
  }
}

function getFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('como') && lowerMessage.includes('buscar')) {
    return 'Para buscar documentos, use a barra de pesquisa acima. Digite palavras-chave como "extintor", "hidrante" ou "IT-001". O sistema mostrará as instruções técnicas relacionadas.';
  }
  
  if (lowerMessage.includes('epi')) {
    return 'Este sistema consulta Instruções Técnicas do CB-PI sobre segurança contra incêndio. Para EPIs específicos, consulte as ITs sobre equipamentos de proteção individual.';
  }
  
  if (lowerMessage.includes('extintor')) {
    return 'Para informações sobre extintores, consulte a IT-021. Ela contém requisitos de instalação, tipos adequados para cada classe de fogo e distribuição.';
  }
  
  if (lowerMessage.includes('hidrante')) {
    return 'Sistemas de hidrantes são regulamentados pela IT-022. Consulte esta instrução para dimensionamento, pressão mínima e distribuição adequada.';
  }
  
  return 'Desculpe, não consegui processar sua pergunta no momento. Tente reformular ou use a busca tradicional acima. Você pode perguntar sobre instruções técnicas, sistemas de segurança ou como usar este sistema.';
}