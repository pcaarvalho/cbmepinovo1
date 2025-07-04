export class EnhancedAIService {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
  }

  async generateSmartResponse(query: string, searchResults: any[]): Promise<{
    summary: string;
    insights: string;
    recommendations: string[];
    contextualInfo: Record<string, any>;
  }> {
    try {
      const prompt = `
Você é um especialista em normas técnicas do Corpo de Bombeiros do Piauí.
Analise a consulta do usuário e os resultados encontrados, fornecendo:

CONSULTA: "${query}"

RESULTADOS ENCONTRADOS:
${searchResults.map((r, i) => `
${i + 1}. IT ${r.it} - ${r.titulo}
   Capítulo: ${r.capitulo}
   Trecho: ${r.trecho}
`).join('\n')}

Por favor, forneça:
1. Um resumo executivo dos principais pontos encontrados
2. Insights práticos sobre aplicação das normas
3. Recomendações específicas baseadas na consulta
4. Informações contextuais relevantes

Formato sua resposta de forma clara e estruturada.
`;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://consulta-cbm-pi.vercel.app',
          'X-Title': 'Consulta CBM-PI'
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3-haiku',
          messages: [
            {
              role: 'system',
              content: 'Você é um assistente especializado em normas técnicas de segurança contra incêndio do Corpo de Bombeiros. Forneça respostas claras, práticas e bem estruturadas.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      // Processar resposta em seções
      const sections = this.parseAIResponse(aiResponse);

      return {
        summary: sections.summary || 'Resumo não disponível',
        insights: sections.insights || aiResponse,
        recommendations: sections.recommendations || [],
        contextualInfo: {
          totalResults: searchResults.length,
          categories: [...new Set(searchResults.map(r => r.categoria))],
          relevantITs: searchResults.map(r => r.it).slice(0, 5)
        }
      };
    } catch (error) {
      console.error('Error generating smart response:', error);
      return {
        summary: 'Análise temporariamente indisponível',
        insights: this.generateFallbackInsights(query, searchResults),
        recommendations: this.generateFallbackRecommendations(query),
        contextualInfo: {
          totalResults: searchResults.length
        }
      };
    }
  }

  async enhanceSearchResults(results: any[]): Promise<any[]> {
    try {
      // Adiciona contexto e relevância a cada resultado
      return results.map((result, index) => ({
        ...result,
        relevance: Math.max(95 - (index * 5), 70), // Score de relevância
        summary: this.generateResultSummary(result),
        context: this.extractContext(result),
        highlights: this.extractHighlights(result)
      }));
    } catch (error) {
      console.error('Error enhancing results:', error);
      return results;
    }
  }

  private parseAIResponse(response: string): any {
    const sections: any = {};
    
    // Extrai resumo
    const summaryMatch = response.match(/resumo[:\s]*(.*?)(?=insights|recomendações|$)/i);
    if (summaryMatch) {
      sections.summary = summaryMatch[1].trim();
    }

    // Extrai insights
    const insightsMatch = response.match(/insights[:\s]*(.*?)(?=recomendações|$)/i);
    if (insightsMatch) {
      sections.insights = insightsMatch[1].trim();
    }

    // Extrai recomendações
    const recsMatch = response.match(/recomendações[:\s]*(.*?)$/i);
    if (recsMatch) {
      sections.recommendations = recsMatch[1]
        .split(/\n|;/)
        .map(r => r.trim())
        .filter(r => r.length > 0);
    }

    return sections;
  }

  private generateResultSummary(result: any): string {
    const { titulo, capitulo, trecho } = result;
    const cleanTrecho = trecho.replace(/<[^>]*>/g, '').substring(0, 150);
    return `${titulo} - ${capitulo}: ${cleanTrecho}...`;
  }

  private extractContext(result: any): string {
    const contexts = {
      'saída': 'Normas sobre dimensionamento e localização de saídas de emergência',
      'iluminação': 'Requisitos para sistemas de iluminação de emergência',
      'extintor': 'Especificações sobre tipos e distribuição de extintores',
      'hidrante': 'Normas para sistemas de hidrantes e mangotinhos',
      'memorial': 'Diretrizes para elaboração de memorial descritivo'
    };

    for (const [key, value] of Object.entries(contexts)) {
      if (result.titulo.toLowerCase().includes(key) || 
          result.capitulo.toLowerCase().includes(key)) {
        return value;
      }
    }

    return 'Norma técnica de segurança contra incêndio';
  }

  private extractHighlights(result: any): string[] {
    const highlights = [];
    
    // Extrai números e medidas importantes
    const numbers = result.trecho.match(/\d+\s*(m|cm|mm|metros|centímetros)/g);
    if (numbers) {
      highlights.push(...numbers.slice(0, 3));
    }

    // Extrai termos importantes
    const importantTerms = ['obrigatório', 'mínimo', 'máximo', 'deve', 'proibido'];
    importantTerms.forEach(term => {
      if (result.trecho.toLowerCase().includes(term)) {
        highlights.push(term);
      }
    });

    return highlights;
  }

  private generateFallbackInsights(query: string, results: any[]): string {
    if (results.length === 0) {
      return 'Não foram encontrados resultados para sua busca. Tente usar termos mais específicos ou consulte o índice de instruções técnicas.';
    }

    const its = [...new Set(results.map(r => r.it))].join(', ');
    return `Encontramos ${results.length} referências nas Instruções Técnicas ${its}. 
    Estas normas estabelecem os requisitos técnicos para garantir a segurança contra incêndio em edificações.`;
  }

  private generateFallbackRecommendations(query: string): string[] {
    const recommendations = [
      'Consulte sempre a versão mais atualizada das Instruções Técnicas',
      'Em caso de dúvidas, procure orientação técnica do Corpo de Bombeiros',
      'Considere contratar um profissional habilitado para projetos complexos'
    ];

    if (query.includes('memorial')) {
      recommendations.push('Utilize os modelos oficiais de memorial descritivo disponibilizados pelo CB-PI');
    }

    if (query.includes('saída') || query.includes('emergência')) {
      recommendations.push('Verifique as distâncias máximas de caminhamento para as saídas');
    }

    return recommendations;
  }

  async generateContextualSuggestions(query: string, context?: any): Promise<string[]> {
    const baseSuggestions = [
      'largura mínima saída emergência',
      'altura instalação iluminação emergência',
      'capacidade extintores por área',
      'distância máxima entre hidrantes',
      'memorial descritivo modelo'
    ];

    // Adiciona sugestões baseadas no contexto
    if (context?.lastSearch) {
      const relatedTerms = this.extractRelatedTerms(context.lastSearch);
      return [...relatedTerms, ...baseSuggestions].slice(0, 8);
    }

    return baseSuggestions;
  }

  private extractRelatedTerms(lastSearch: string): string[] {
    const termMap: Record<string, string[]> = {
      'saída': ['porta corta-fogo', 'barra antipânico', 'escada emergência'],
      'iluminação': ['autonomia iluminação', 'lux emergência', 'bloco autônomo'],
      'extintor': ['classe fogo', 'PQS', 'CO2', 'água pressurizada'],
      'hidrante': ['mangueira tipo', 'esguicho regulável', 'abrigo'],
      'memorial': ['ART', 'planta baixa', 'detalhamento técnico']
    };

    for (const [key, values] of Object.entries(termMap)) {
      if (lastSearch.toLowerCase().includes(key)) {
        return values;
      }
    }

    return [];
  }
}