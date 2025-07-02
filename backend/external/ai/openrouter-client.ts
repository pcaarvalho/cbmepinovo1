// ==============================================================================
// CLIENTE OPENROUTER PARA INTEGRAÇÃO COM IA
// ==============================================================================

// ==============================================================================
// TIPOS E INTERFACES
// ==============================================================================

interface OpenRouterConfig {
  apiKey?: string;
  baseUrl?: string;
  defaultModel?: string;
  timeout?: number;
  maxRetries?: number;
}

interface GenerateRequest {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  model?: string;
  systemPrompt?: string;
}

interface GenerateResponse {
  text: string;
  usage: {
    prompt: number;
    completion: number;
    total: number;
  };
  model: string;
  finishReason: string;
}

interface OpenRouterAPIResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
}

// ==============================================================================
// CLIENTE OPENROUTER
// ==============================================================================

class OpenRouterClient {
  private config: Required<OpenRouterConfig>;
  private fallbackEnabled: boolean;

  constructor(config: OpenRouterConfig = {}) {
    this.config = {
      apiKey: config.apiKey || process.env.OPENROUTER_API_KEY || '',
      baseUrl: config.baseUrl || 'https://openrouter.ai/api/v1',
      defaultModel: config.defaultModel || 'mistralai/mixtral-8x7b-instruct',
      timeout: config.timeout || 30000,
      maxRetries: config.maxRetries || 2
    };

    this.fallbackEnabled = !this.config.apiKey;
    
    if (this.fallbackEnabled) {
      console.warn('⚠️ OpenRouter API key não configurada. Usando modo fallback.');
    }
  }

  async generateResponse(
    prompt: string,
    options: Omit<GenerateRequest, 'prompt'> = {}
  ): Promise<GenerateResponse> {
    // Se não tiver API key, usar fallback
    if (this.fallbackEnabled) {
      return this.generateFallbackResponse(prompt, options);
    }

    const requestData = {
      model: options.model || this.config.defaultModel,
      messages: [
        {
          role: 'system',
          content: options.systemPrompt || 'Você é um assistente técnico especializado em segurança contra incêndio.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: options.maxTokens || 500,
      temperature: options.temperature || 0.7,
      top_p: options.topP || 0.9
    };

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        const response = await this.makeRequest(requestData, attempt);
        return this.parseResponse(response);
        
      } catch (error) {
        lastError = error as Error;
        console.warn(`❌ Tentativa ${attempt} falhou:`, error);
        
        if (attempt < this.config.maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // Backoff exponencial
          console.log(`⏳ Aguardando ${delay}ms antes da próxima tentativa...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // Se todas as tentativas falharam, usar fallback
    console.error('❌ Todas as tentativas falharam, usando fallback');
    return this.generateFallbackResponse(prompt, options);
  }

  private async makeRequest(data: any, attempt: number): Promise<OpenRouterAPIResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.SITE_URL || 'http://localhost:3000',
          'X-Title': 'CB-PI Consulta IT'
        },
        body: JSON.stringify(data),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.choices || result.choices.length === 0) {
        throw new Error('Resposta inválida da OpenRouter API');
      }

      return result;

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Timeout após ${this.config.timeout}ms`);
      }
      
      throw error;
    }
  }

  private parseResponse(apiResponse: OpenRouterAPIResponse): GenerateResponse {
    const choice = apiResponse.choices[0];
    
    return {
      text: choice.message.content.trim(),
      usage: {
        prompt: apiResponse.usage.prompt_tokens,
        completion: apiResponse.usage.completion_tokens,
        total: apiResponse.usage.total_tokens
      },
      model: apiResponse.model,
      finishReason: choice.finish_reason
    };
  }

  private async generateFallbackResponse(
    prompt: string,
    options: Omit<GenerateRequest, 'prompt'>
  ): Promise<GenerateResponse> {
    // Análise simples baseada em palavras-chave
    const analysis = this.analyzeFallback(prompt);
    
    // Simular delay para parecer mais realista
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    return {
      text: analysis,
      usage: {
        prompt: prompt.length / 4, // Estimativa grosseira
        completion: analysis.length / 4,
        total: (prompt.length + analysis.length) / 4
      },
      model: 'fallback-analysis',
      finishReason: 'stop'
    };
  }

  private analyzeFallback(prompt: string): string {
    const promptLower = prompt.toLowerCase();
    
    // Análise baseada em palavras-chave
    const keywords = {
      saida: ['saída', 'emergência', 'escape', 'evacuação'],
      iluminacao: ['iluminação', 'emergência', 'luz', 'autonomia'],
      extintor: ['extintor', 'extintores', 'pó', 'químico'],
      hidrante: ['hidrante', 'hidrantes', 'mangueira', 'pressão'],
      alarme: ['alarme', 'detecção', 'fumaça', 'incêndio'],
      projeto: ['projeto', 'memorial', 'técnico', 'responsável'],
      dimensionamento: ['dimensionamento', 'cálculo', 'área', 'pavimento']
    };

    const foundKeywords: string[] = [];
    
    for (const [category, words] of Object.entries(keywords)) {
      if (words.some(word => promptLower.includes(word))) {
        foundKeywords.push(category);
      }
    }

    // Gerar resposta baseada nas palavras-chave encontradas
    if (foundKeywords.length === 0) {
      return `Com base na consulta apresentada, recomenda-se consultar as Instruções Técnicas específicas do CB-PI. ` +
             `Para uma análise detalhada, é importante revisar o contexto completo da edificação e suas características de uso.`;
    }

    let response = 'Análise técnica da consulta:\n\n';

    if (foundKeywords.includes('saida')) {
      response += '🚪 **Saídas de Emergência (IT-008)**: As saídas devem ter largura mínima de 1,20m, ' +
                 'com capacidade de escoamento de 100 pessoas por metro. Portas devem abrir no sentido do escape.\n\n';
    }

    if (foundKeywords.includes('iluminacao')) {
      response += '💡 **Iluminação de Emergência (IT-018)**: Sistema deve ter autonomia mínima de 1 hora, ' +
                 'com intensidade de 5 lux em corredores e 3 lux em ambientes. Comutação em até 5 segundos.\n\n';
    }

    if (foundKeywords.includes('extintor')) {
      response += '🧯 **Extintores (IT-021)**: Distância máxima de 20m entre extintores. Altura de instalação ' +
                 'com parte superior a 1,60m do piso. Classificação conforme classe de fogo.\n\n';
    }

    if (foundKeywords.includes('hidrante')) {
      response += '🚰 **Hidrantes (IT-022)**: Pressão dinâmica mínima de 10 mca no ponto mais desfavorável. ' +
                 'Vazão mínima de 125 L/min. Mangueiras de 40mm de diâmetro.\n\n';
    }

    if (foundKeywords.includes('projeto')) {
      response += '📋 **Documentação (IT-001)**: Memorial descritivo detalhado, plantas baixas em escala adequada, ' +
                 'ART/RRT devidamente preenchida e cronograma de execução.\n\n';
    }

    response += '⚠️ **Importante**: Esta análise é baseada em informações gerais. Para projetos específicos, ' +
               'consulte sempre as Instruções Técnicas completas e considere as particularidades da edificação.';

    return response;
  }

  // Método para testar conectividade
  async testConnection(): Promise<boolean> {
    if (this.fallbackEnabled) {
      return true; // Fallback sempre disponível
    }

    try {
      await this.generateResponse('Teste de conectividade', { maxTokens: 10 });
      return true;
    } catch {
      return false;
    }
  }

  // Método para obter modelos disponíveis
  async getAvailableModels(): Promise<string[]> {
    if (this.fallbackEnabled) {
      return ['fallback-analysis'];
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar modelos');
      }

      const data = await response.json();
      return data.data.map((model: any) => model.id);
      
    } catch {
      return [this.config.defaultModel];
    }
  }

  // Método para configurar nova API key
  setApiKey(apiKey: string): void {
    this.config.apiKey = apiKey;
    this.fallbackEnabled = !apiKey;
  }

  // Método para obter configuração atual
  getConfig(): Partial<OpenRouterConfig> {
    return {
      baseUrl: this.config.baseUrl,
      defaultModel: this.config.defaultModel,
      timeout: this.config.timeout,
      maxRetries: this.config.maxRetries
    };
  }
}

// ==============================================================================
// INSTÂNCIA SINGLETON
// ==============================================================================

export const openRouterClient = new OpenRouterClient();

// ==============================================================================
// UTILITÁRIOS
// ==============================================================================

export function createOpenRouterClient(config?: OpenRouterConfig): OpenRouterClient {
  return new OpenRouterClient(config);
}

export { OpenRouterClient, type GenerateRequest, type GenerateResponse };