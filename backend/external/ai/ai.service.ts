import { AISearchIntent } from '@/shared/types/search';

export class AIService {

  async analyzeSearchIntent(prompt: string): Promise<AISearchIntent> {
    // Mock implementation - replace with real OpenRouter integration
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock AI response based on prompt analysis
      let extractedQuery = prompt;
      let suggestedCategory: string | undefined;
      let confidence = 0.85;

      // Simple keyword-based analysis (replace with real AI)
      if (prompt.toLowerCase().includes('saída') || prompt.toLowerCase().includes('emergência')) {
        extractedQuery = 'saídas de emergência';
        suggestedCategory = 'Saídas de Emergência';
        confidence = 0.92;
      } else if (prompt.toLowerCase().includes('extintor') || prompt.toLowerCase().includes('fogo')) {
        extractedQuery = 'sistema de extintores';
        suggestedCategory = 'Sistemas de Extintores';
        confidence = 0.88;
      } else if (prompt.toLowerCase().includes('luz') || prompt.toLowerCase().includes('iluminação')) {
        extractedQuery = 'iluminação de emergência';
        suggestedCategory = 'Iluminação e Sinalização';
        confidence = 0.90;
      }

      return {
        extractedQuery,
        suggestedCategory,
        explanation: `Com base na sua pergunta, identifiquei que você está procurando por "${extractedQuery}". Recomendo verificar a categoria "${suggestedCategory || 'Geral'}".`,
        confidence,
        suggestedFilters: suggestedCategory ? { categoria: suggestedCategory } : {},
      };
    } catch (error) {
      console.error('Error in AI search intent analysis:', error);
      
      // Fallback response
      return {
        extractedQuery: prompt,
        explanation: 'Realizando busca com os termos fornecidos.',
        confidence: 0.5,
      };
    }
  }

  async generateSuggestions(query: string): Promise<string[]> {
    // Mock implementation
    const suggestions: string[] = [];

    // Simple suggestion generation based on keywords
    const keywords = query.toLowerCase().split(' ');
    
    if (keywords.some(k => ['saída', 'saidas', 'emergência'].includes(k))) {
      suggestions.push(
        'saídas de emergência dimensionamento',
        'saídas de emergência largura',
        'saídas de emergência quantidade'
      );
    }

    if (keywords.some(k => ['extintor', 'extintores', 'fogo'].includes(k))) {
      suggestions.push(
        'extintores tipo adequado',
        'extintores posicionamento',
        'extintores manutenção'
      );
    }

    if (keywords.some(k => ['luz', 'iluminação', 'iluminacao'].includes(k))) {
      suggestions.push(
        'iluminação de emergência autonomia',
        'iluminação de emergência instalação',
        'iluminação de emergência normas'
      );
    }

    // Add some general suggestions if no specific ones found
    if (suggestions.length === 0) {
      suggestions.push(
        'procedimentos administrativos',
        'análise de projeto',
        'memorial descritivo'
      );
    }

    return suggestions.slice(0, 3); // Return max 3 suggestions
  }

  async processChat(message: string): Promise<string> {
    // Mock implementation for chat functionality
    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      // Simple response generation based on message content
      const lowerMessage = message.toLowerCase();

      if (lowerMessage.includes('ajuda') || lowerMessage.includes('help')) {
        return 'Posso ajudá-lo a encontrar instruções técnicas do CB-PI. Você pode buscar por categoria (saídas de emergência, extintores, iluminação) ou fazer perguntas específicas sobre segurança contra incêndio.';
      }

      if (lowerMessage.includes('saída') || lowerMessage.includes('emergência')) {
        return 'Para saídas de emergência, consulte a IT-008/2019 que trata do dimensionamento e características das saídas. As principais exigências incluem largura mínima, quantidade adequada e sinalização apropriada.';
      }

      if (lowerMessage.includes('extintor')) {
        return 'Os sistemas de extintores são regulamentados pela IT-021/2019. É importante verificar o tipo adequado para cada classe de fogo, posicionamento correto e programa de manutenção.';
      }

      if (lowerMessage.includes('iluminação')) {
        return 'A iluminação de emergência está detalhada na IT-018/2019. Deve garantir autonomia mínima, níveis de iluminamento adequados e sinalização de rotas de fuga.';
      }

      return 'Entendo sua pergunta. Recomendo usar a busca para encontrar instruções técnicas específicas ou consultar nossa biblioteca organizada por categorias.';
    } catch (error) {
      console.error('Error in chat processing:', error);
      return 'Desculpe, ocorreu um erro. Tente reformular sua pergunta ou use a busca manual.';
    }
  }
}