// AIDEV-EXPLANATION: Sistema de auto-aprendizado e feedback para IA superinteligente
// Coleta feedback, identifica padrões e melhora respostas continuamente

import { logIA, logInfo } from '../shared/log/logger';
import { scoreIAResponse } from '../core/analysis/ai-score';
import { setInCache } from './ai-cache';

/**
 * Feedback do usuário sobre uma resposta
 */
interface UserFeedback {
  responseId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  helpful: boolean;
  accurate: boolean;
  complete: boolean;
  issues?: string[];
  suggestions?: string;
  timestamp: Date;
}

/**
 * Métricas de aprendizado
 */
interface LearningMetrics {
  totalInteractions: number;
  averageScore: number;
  averageUserRating: number;
  successRate: number;
  commonIssues: Map<string, number>;
  improvementTrends: TrendData[];
  topPerformingTopics: string[];
  strugglingTopics: string[];
}

/**
 * Dados de tendência
 */
interface TrendData {
  date: Date;
  averageScore: number;
  userSatisfaction: number;
  responseTime: number;
}

/**
 * Padrão de resposta bem-sucedida
 */
interface SuccessPattern {
  pattern: string;
  context: string;
  score: number;
  userRating: number;
  frequency: number;
  examples: string[];
}

/**
 * Base de conhecimento aprendido
 */
class LearnedKnowledgeBase {
  private successPatterns: Map<string, SuccessPattern> = new Map();
  private failurePatterns: Map<string, string[]> = new Map();
  private topicPerformance: Map<string, number> = new Map();
  private userPreferences: Map<string, any> = new Map();
  private feedbackHistory: UserFeedback[] = [];
  
  /**
   * Adiciona feedback de usuário
   * @param feedback - Feedback do usuário
   */
  addFeedback(feedback: UserFeedback): void {
    this.feedbackHistory.push(feedback);
    
    // AIDEV-EXPLANATION: Atualiza métricas baseado no feedback
    if (feedback.rating >= 4) {
      this.recordSuccess(feedback);
    } else {
      this.recordFailure(feedback);
    }
    
    // Limita histórico a 10000 feedbacks mais recentes
    if (this.feedbackHistory.length > 10000) {
      this.feedbackHistory = this.feedbackHistory.slice(-10000);
    }
  }
  
  /**
   * Registra padrão de sucesso
   * @param feedback - Feedback positivo
   */
  private recordSuccess(feedback: UserFeedback): void {
    // AIDEV-SUGGESTION: Implementar análise de padrões de sucesso
    logInfo('Padrão de sucesso registrado', { 
      responseId: feedback.responseId,
      rating: feedback.rating 
    });
  }
  
  /**
   * Registra padrão de falha
   * @param feedback - Feedback negativo
   */
  private recordFailure(feedback: UserFeedback): void {
    if (feedback.issues) {
      feedback.issues.forEach(issue => {
        const failures = this.failurePatterns.get(issue) || [];
        failures.push(feedback.responseId);
        this.failurePatterns.set(issue, failures);
      });
    }
  }
  
  /**
   * Obtém métricas de aprendizado
   * @returns Métricas calculadas
   */
  getMetrics(): LearningMetrics {
    const totalInteractions = this.feedbackHistory.length;
    const averageUserRating = this.calculateAverageRating();
    const successRate = this.calculateSuccessRate();
    const commonIssues = this.getCommonIssues();
    const improvementTrends = this.calculateTrends();
    
    return {
      totalInteractions,
      averageScore: 0, // Será calculado externamente
      averageUserRating,
      successRate,
      commonIssues,
      improvementTrends,
      topPerformingTopics: this.getTopPerformingTopics(),
      strugglingTopics: this.getStrugglingTopics()
    };
  }
  
  /**
   * Calcula média de avaliações
   * @returns Média das avaliações
   */
  private calculateAverageRating(): number {
    if (this.feedbackHistory.length === 0) return 0;
    
    const sum = this.feedbackHistory.reduce((acc, f) => acc + f.rating, 0);
    return sum / this.feedbackHistory.length;
  }
  
  /**
   * Calcula taxa de sucesso
   * @returns Taxa de sucesso (0-1)
   */
  private calculateSuccessRate(): number {
    if (this.feedbackHistory.length === 0) return 0;
    
    const successful = this.feedbackHistory.filter(f => f.rating >= 4).length;
    return successful / this.feedbackHistory.length;
  }
  
  /**
   * Obtém problemas mais comuns
   * @returns Mapa de problemas e frequência
   */
  private getCommonIssues(): Map<string, number> {
    const issues = new Map<string, number>();
    
    this.failurePatterns.forEach((responses, issue) => {
      issues.set(issue, responses.length);
    });
    
    // Ordena por frequência
    return new Map([...issues.entries()].sort((a, b) => b[1] - a[1]));
  }
  
  /**
   * Calcula tendências de melhoria
   * @returns Dados de tendência
   */
  private calculateTrends(): TrendData[] {
    // AIDEV-SUGGESTION: Implementar cálculo de tendências por período
    return [];
  }
  
  /**
   * Obtém tópicos com melhor desempenho
   * @returns Lista de tópicos
   */
  private getTopPerformingTopics(): string[] {
    const sorted = [...this.topicPerformance.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    return sorted.map(([topic]) => topic);
  }
  
  /**
   * Obtém tópicos com pior desempenho
   * @returns Lista de tópicos
   */
  private getStrugglingTopics(): string[] {
    const sorted = [...this.topicPerformance.entries()]
      .sort((a, b) => a[1] - b[1])
      .slice(0, 5);
    
    return sorted.map(([topic]) => topic);
  }
}

// Instância global da base de conhecimento aprendido
const knowledgeBase = new LearnedKnowledgeBase();

/**
 * Registra interação para aprendizado
 * @param interaction - Dados da interação
 */
export function recordInteraction(interaction: {
  id: string;
  question: string;
  response: string;
  context: any;
  model: string;
  responseTime: number;
}): void {
  // AIDEV-EXPLANATION: Calcula score automaticamente
  const score = scoreIAResponse(interaction.response);
  
  // Registra no log
  logIA('Interação registrada para aprendizado', {
    response: interaction.response.substring(0, 100),
    tokens: interaction.response.length / 4,
    responseTime: interaction.responseTime,
    model: interaction.model
  });
  
  // Armazena para análise posterior
  // Em produção, isso seria persistido em banco de dados
}

/**
 * Processa feedback do usuário
 * @param feedback - Feedback fornecido
 */
export function processFeedback(feedback: UserFeedback): void {
  // Adiciona à base de conhecimento
  knowledgeBase.addFeedback(feedback);
  
  // AIDEV-EXPLANATION: Analisa feedback para melhorias imediatas
  if (feedback.rating <= 2 && feedback.suggestions) {
    // Feedback negativo com sugestões - alta prioridade
    logInfo('Feedback crítico recebido', {
      responseId: feedback.responseId,
      rating: feedback.rating,
      suggestions: feedback.suggestions
    });
    
    // Invalida cache para respostas similares
    // Implementar lógica de invalidação seletiva
  }
  
  // Atualiza métricas
  updateLearningMetrics();
}

/**
 * Obtém sugestões de melhoria baseadas no aprendizado
 * @param topic - Tópico da consulta
 * @param context - Contexto da consulta
 * @returns Sugestões de melhoria
 */
export function getLearningInsights(
  topic: string,
  context: any
): {
  suggestions: string[];
  warnings: string[];
  successTips: string[];
} {
  const metrics = knowledgeBase.getMetrics();
  const suggestions: string[] = [];
  const warnings: string[] = [];
  const successTips: string[] = [];
  
  // AIDEV-EXPLANATION: Análise baseada em métricas
  
  // Verifica se é um tópico problemático
  if (metrics.strugglingTopics.includes(topic)) {
    warnings.push(`Tópico com histórico de dificuldades. Seja extra cuidadoso.`);
    suggestions.push(`Considere fornecer mais exemplos práticos`);
    suggestions.push(`Verifique se está citando as ITs corretas`);
  }
  
  // Verifica se é um tópico de sucesso
  if (metrics.topPerformingTopics.includes(topic)) {
    successTips.push(`Tópico com alto índice de satisfação`);
    successTips.push(`Mantenha o padrão de resposta estruturada`);
  }
  
  // Analisa problemas comuns
  metrics.commonIssues.forEach((count, issue) => {
    if (count > 10) { // Problema recorrente
      warnings.push(`Problema frequente: ${issue}`);
      
      // Sugestões específicas por tipo de problema
      if (issue.includes('incompleta')) {
        suggestions.push('Certifique-se de abordar todos os aspectos da pergunta');
      }
      if (issue.includes('técnica')) {
        suggestions.push('Use linguagem mais acessível para usuários básicos');
      }
      if (issue.includes('IT')) {
        suggestions.push('Sempre cite as ITs específicas e seus artigos');
      }
    }
  });
  
  return { suggestions, warnings, successTips };
}

/**
 * Atualiza métricas de aprendizado
 */
function updateLearningMetrics(): void {
  const metrics = knowledgeBase.getMetrics();
  
  // AIDEV-SUGGESTION: Em produção, persistir métricas em banco
  logInfo('Métricas de aprendizado atualizadas', {
    totalInteractions: metrics.totalInteractions,
    averageRating: metrics.averageUserRating.toFixed(2),
    successRate: (metrics.successRate * 100).toFixed(1) + '%'
  });
}

/**
 * Aplica aprendizados para melhorar uma resposta
 * @param response - Resposta original
 * @param topic - Tópico da resposta
 * @param context - Contexto
 * @returns Resposta melhorada
 */
export function applyLearnings(
  response: string,
  topic: string,
  context: any
): string {
  const insights = getLearningInsights(topic, context);
  let improvedResponse = response;
  
  // AIDEV-EXPLANATION: Aplica melhorias baseadas em aprendizados
  
  // Se há warnings, adiciona alertas preventivos
  if (insights.warnings.length > 0) {
    improvedResponse = adjustResponseForWarnings(improvedResponse, insights.warnings);
  }
  
  // Aplica sugestões de melhoria
  if (insights.suggestions.length > 0) {
    improvedResponse = enhanceResponseWithSuggestions(improvedResponse, insights.suggestions);
  }
  
  // Registra aplicação de aprendizados
  logIA('Aprendizados aplicados à resposta', {
    response: improvedResponse.substring(0, 100),
    model: 'learning-system'
  });
  
  return improvedResponse;
}

/**
 * Ajusta resposta baseado em warnings
 * @param response - Resposta original
 * @param warnings - Avisos identificados
 * @returns Resposta ajustada
 */
function adjustResponseForWarnings(response: string, warnings: string[]): string {
  let adjusted = response;
  
  // AIDEV-SUGGESTION: Implementar ajustes específicos por tipo de warning
  warnings.forEach(warning => {
    if (warning.includes('dificuldades')) {
      // Adiciona disclaimer sobre complexidade
      if (!adjusted.includes('⚠️')) {
        adjusted += '\n\n⚠️ **Nota**: Este é um tópico complexo. ';
        adjusted += 'Recomenda-se consulta com profissional especializado.';
      }
    }
  });
  
  return adjusted;
}

/**
 * Melhora resposta com sugestões
 * @param response - Resposta original
 * @param suggestions - Sugestões de melhoria
 * @returns Resposta melhorada
 */
function enhanceResponseWithSuggestions(response: string, suggestions: string[]): string {
  let enhanced = response;
  
  // AIDEV-SUGGESTION: Implementar melhorias específicas
  suggestions.forEach(suggestion => {
    if (suggestion.includes('exemplos práticos') && !enhanced.includes('exemplo')) {
      enhanced += '\n\n📝 **Exemplo Prático**: ';
      enhanced += 'Em uma edificação comercial de 500m², seriam necessários...';
    }
    
    if (suggestion.includes('citar as ITs') && !enhanced.includes('IT-')) {
      // Tenta identificar e adicionar ITs relevantes
      enhanced = enhanced.replace(
        /norma|regulamento|instrução/gi,
        match => `${match} (consulte a IT específica)`
      );
    }
  });
  
  return enhanced;
}

/**
 * Gera relatório de aprendizado
 * @returns Relatório detalhado
 */
export function generateLearningReport(): {
  summary: string;
  metrics: LearningMetrics;
  recommendations: string[];
} {
  const metrics = knowledgeBase.getMetrics();
  
  const summary = `
## Relatório de Aprendizado da IA

**Total de Interações**: ${metrics.totalInteractions}
**Avaliação Média**: ${metrics.averageUserRating.toFixed(2)}/5
**Taxa de Sucesso**: ${(metrics.successRate * 100).toFixed(1)}%

### Tópicos de Melhor Desempenho:
${metrics.topPerformingTopics.map(t => `- ${t}`).join('\n')}

### Tópicos que Precisam Melhorar:
${metrics.strugglingTopics.map(t => `- ${t}`).join('\n')}

### Problemas Mais Comuns:
${Array.from(metrics.commonIssues.entries())
  .slice(0, 5)
  .map(([issue, count]) => `- ${issue}: ${count} ocorrências`)
  .join('\n')}
`;

  const recommendations = [
    'Focar em melhorar respostas para tópicos problemáticos',
    'Implementar mais exemplos práticos nas respostas',
    'Revisar padrões de sucesso e replicá-los',
    'Coletar mais feedback específico dos usuários',
    'Atualizar base de conhecimento com novos aprendizados'
  ];
  
  return { summary, metrics, recommendations };
}

// AIDEV-SUGGESTION: Sistema de auto-calibração
export function autoCalibrate(): void {
  const metrics = knowledgeBase.getMetrics();
  
  // Se performance está baixa, ajusta parâmetros
  if (metrics.averageUserRating < 3.5) {
    logInfo('Iniciando auto-calibração devido a baixa performance');
    
    // Ajustes sugeridos:
    // - Aumentar detalhamento das respostas
    // - Adicionar mais validações
    // - Melhorar formatação
    // - Aumentar citações de ITs
  }
}

// Exporta classe para testes
export { LearnedKnowledgeBase, UserFeedback, LearningMetrics };