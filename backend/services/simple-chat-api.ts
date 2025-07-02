// ==============================================================================
// CONFIGURAÇÃO SIMPLES DA API OPENROUTER PARA CHAT
// ==============================================================================

interface ChatResponse {
  success: boolean;
  content: string;
  error?: string;
}

const SYSTEM_PROMPT = `Você é um assistente do sistema de consulta de normas técnicas do CB-PI. 
Responda perguntas sobre como usar o sistema, buscar documentos, 
e informações sobre EPIs e instruções técnicas. 
Seja direto e útil. Máximo 3 linhas de resposta.`;

export async function sendChatMessage(message: string): Promise<ChatResponse> {
  try {
    const response = await fetch('/api/simple-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: data.success,
      content: data.content || 'Não foi possível gerar uma resposta.'
    };

  } catch (error) {
    console.error('Erro na API do chat:', error);
    
    // Fallback simples
    return {
      success: false,
      content: getFallbackResponse(message),
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

// Resposta de fallback quando a API não funcionar
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