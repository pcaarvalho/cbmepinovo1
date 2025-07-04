// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
import { NextRequest, NextResponse } from 'next/server';

// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
interface RequestBody {
  messages: ChatMessage[];
  stream?: boolean;
}

// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { messages, stream = false } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { success: false, error: 'Messages são obrigatórias' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error('OPENROUTER_API_KEY não configurada');
      return NextResponse.json(
        { success: false, error: 'Serviço de IA temporariamente indisponível' },
        { status: 500 }
      );
    }

    console.log('Enviando requisição para OpenRouter...');
    console.log('Número de mensagens:', messages.length);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://consulta-cbm-pi.vercel.app',
        'X-Title': 'Chat Especialista CBM-PI'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku',
        messages: messages,
        temperature: 0.3,
        max_tokens: 2000,
        stream: false // Por enquanto sem streaming
      })
    });

    if (!response.ok) {
      console.error('Erro na API OpenRouter:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Resposta de erro:', errorText);
      
      return NextResponse.json(
        { success: false, error: 'Erro na comunicação com o serviço de IA' },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log('Resposta recebida da OpenRouter');

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Formato de resposta inválido:', data);
      return NextResponse.json(
        { success: false, error: 'Resposta inválida do serviço de IA' },
        { status: 500 }
      );
    }

    const aiMessage = data.choices[0].message.content;

    console.log('Resposta da IA processada com sucesso');

    return NextResponse.json({
      success: true,
      message: aiMessage,
      usage: data.usage,
      model: data.model
    });

  } catch (error) {
    console.error('Erro no chat-ai:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor. Tente novamente em alguns instantes.' 
      },
      { status: 500 }
    );
  }
}

// AIDEV-PROTECTED: Este bloco é sensível. NÃO modifique sem solicitação explícita do humano.
// Método GET para verificar se o serviço está funcionando
export async function GET() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  return NextResponse.json({
    success: true,
    status: 'Chat AI service is running',
    hasApiKey: !!apiKey,
    timestamp: new Date().toISOString()
  });
}

// ✔️ Protegido com AIDEV-PROTECTED