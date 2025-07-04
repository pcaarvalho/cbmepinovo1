// AIDEV-EXPLANATION: Versão superinteligente do ChatInteligente integrando todos os componentes avançados
// Mantém compatibilidade com a interface original mas adiciona capacidades avançadas

import { 
  IntencaoPergunta, 
  ContextoConversa, 
  RespostaInteligente,
  TipoEdificacao,
  DetalheItem,
  ResultadoValidacao
} from '@/types/chat-inteligente';

// Importa componentes superinteligentes
import { formatStructuredResponse, validateFormattedResponse } from './ai-response-formatter';
import { generateSuperPrompt, generateEnhancedContext, optimizeForModel } from './enhanced-prompt-engine';
import { analyzeDeepContext, enrichResponseWithContext, generateContextualRecommendations } from './context-analyzer';
import { recordInteraction, processFeedback, applyLearnings, getLearningInsights } from './ai-learning-system';
import { validateResponseQuality, autoCorrectResponse } from './response-quality-validator';
import { getFromCache, setInCache } from './ai-cache';
import { logIA, logInfo, logError } from '../shared/log/logger';
import { openRouterClient } from '../infrastructure/ai/openrouter-client';

// Importa a classe original para herdar funcionalidades
import { ChatInteligenteService } from './chat-inteligente.service';

/**
 * Serviço de Chat Superinteligente com capacidades avançadas
 */
export class EnhancedChatInteligenteService extends ChatInteligenteService {
  private static historico: Array<{ role: string; content: string }> = [];
  
  /**
   * Processa pergunta com IA superinteligente
   * @param pergunta - Pergunta do usuário
   * @param contextoAtual - Contexto atual da conversa
   * @returns Resposta estruturada e inteligente
   */
  static async processarPerguntaSuperinteligente(
    pergunta: string,
    contextoAtual: ContextoConversa
  ): Promise<RespostaInteligente> {
    const startTime = Date.now();
    
    try {
      // AIDEV-EXPLANATION: 1. Detecta intenção (herda do original)
      const intencao = this.detectarIntencao(pergunta);
      
      // 2. Extrai contexto básico (herda do original)
      const contextoBasico = this.extrairContextoDaPergunta(pergunta, contextoAtual);
      const contextoAtualizado = { ...contextoAtual, ...contextoBasico };
      
      // 3. Analisa contexto profundo
      const contextoDeep = analyzeDeepContext(pergunta, this.historico);
      
      // 4. Verifica cache
      const cacheKey = `${intencao}:${pergunta}:${JSON.stringify(contextoAtualizado)}`;
      const cachedResponse = getFromCache(cacheKey);
      
      if (cachedResponse) {
        logIA('Resposta recuperada do cache', {
          prompt: pergunta,
          response: cachedResponse,
          responseTime: Date.now() - startTime
        });
        
        return JSON.parse(cachedResponse);
      }
      
      // 5. Gera prompt superinteligente
      const enhancedContext = generateEnhancedContext(pergunta, this.historico.map(h => h.content));
      const { systemPrompt, userPrompt } = generateSuperPrompt(pergunta, enhancedContext);
      
      // 6. Otimiza para o modelo
      const optimizedPrompt = optimizeForModel(
        { systemPrompt, userPrompt },
        openRouterClient.getConfig().defaultModel || 'anthropic/claude-3-haiku'
      );
      
      // 7. Aplica insights de aprendizado
      const learningInsights = getLearningInsights(intencao, contextoDeep);
      
      // 8. Gera resposta com IA
      const aiResponse = await openRouterClient.generateResponse(optimizedPrompt.userPrompt, {
        systemPrompt: optimizedPrompt.systemPrompt,
        maxTokens: 1000,
        temperature: 0.7
      });
      
      // 9. Formata resposta estruturada
      const formattedResponse = formatStructuredResponse(aiResponse.text, pergunta);
      
      // 10. Enriquece com contexto
      const enrichedResponse = enrichResponseWithContext(formattedResponse, contextoDeep);
      
      // 11. Aplica aprendizados
      const improvedResponse = applyLearnings(enrichedResponse, intencao, contextoDeep);
      
      // 12. Valida qualidade
      const validation = validateResponseQuality(improvedResponse, pergunta);
      
      // 13. Tenta auto-correção se necessário
      let finalResponse = improvedResponse;
      if (!validation.isValid) {
        const corrected = autoCorrectResponse(improvedResponse, validation);
        if (corrected) {
          finalResponse = corrected;
        } else {
          // Se não conseguiu corrigir, adiciona aviso
          finalResponse += '\n\n⚠️ **Nota**: Esta resposta pode precisar de revisão adicional.';
        }
      }
      
      // 14. Converte para formato RespostaInteligente
      const respostaEstruturada = this.converterParaRespostaInteligente(
        finalResponse,
        intencao,
        contextoAtualizado,
        contextoDeep
      );
      
      // 15. Registra interação
      recordInteraction({
        id: `${Date.now()}-${Math.random()}`,
        question: pergunta,
        response: finalResponse,
        context: contextoDeep,
        model: aiResponse.model,
        responseTime: Date.now() - startTime
      });
      
      // 16. Adiciona ao histórico
      this.historico.push({ role: 'user', content: pergunta });
      this.historico.push({ role: 'assistant', content: finalResponse });
      
      // Limita histórico a 20 mensagens
      if (this.historico.length > 20) {
        this.historico = this.historico.slice(-20);
      }
      
      // 17. Armazena no cache
      setInCache(
        cacheKey,
        JSON.stringify(respostaEstruturada),
        aiResponse.model,
        aiResponse.usage.total
      );
      
      // 18. Log final
      logIA('Pergunta processada com sucesso', {
        prompt: pergunta,
        response: finalResponse,
        tokens: aiResponse.usage.total,
        responseTime: Date.now() - startTime,
        model: aiResponse.model
      });
      
      return respostaEstruturada;
      
    } catch (error) {
      logError('Erro ao processar pergunta superinteligente', error);
      
      // Fallback para resposta padrão
      return this.gerarRespostaFallback(pergunta, intencao, contextoAtualizado);
    }
  }
  
  /**
   * Converte resposta formatada para estrutura RespostaInteligente
   * @param resposta - Resposta formatada
   * @param intencao - Intenção identificada
   * @param contexto - Contexto da conversa
   * @param contextoDeep - Contexto profundo
   * @returns RespostaInteligente estruturada
   */
  private static converterParaRespostaInteligente(
    resposta: string,
    intencao: IntencaoPergunta,
    contexto: ContextoConversa,
    contextoDeep: any
  ): RespostaInteligente {
    // AIDEV-EXPLANATION: Extrai componentes da resposta estruturada
    
    // Extrai resumo (primeira linha ou base legal)
    const resumoMatch = resposta.match(/🧠 \*\*Base Legal\*\*\n([^\n]+)/);
    const resumo = resumoMatch 
      ? `📌 ${resumoMatch[1]}` 
      : resposta.split('\n')[0].substring(0, 200);
    
    // Extrai detalhes das seções
    const detalhes: DetalheItem[] = [];
    
    // Base Legal
    const baseLegalMatch = resposta.match(/🧠 \*\*Base Legal\*\*\n([^📌⚠️📄]+)/s);
    if (baseLegalMatch) {
      detalhes.push({
        item: "Base Legal",
        referencia: this.extrairITsDoTexto(baseLegalMatch[1]).join(', ') || 'ITs do CBMEPI'
      });
    }
    
    // Aplicabilidade Prática
    const aplicabilidadeMatch = resposta.match(/📌 \*\*Aplicabilidade Prática\*\*\n([^🧠⚠️📄]+)/s);
    if (aplicabilidadeMatch) {
      const praticas = aplicabilidadeMatch[1].split('\n').filter(l => l.trim());
      praticas.slice(0, 3).forEach(pratica => {
        detalhes.push({
          item: pratica.replace(/^[-•]\s*/, ''),
          referencia: "Aplicação prática"
        });
      });
    }
    
    // Alerta Técnico como dica
    const alertaMatch = resposta.match(/⚠️ \*\*Alerta Técnico\*\*\n([^🧠📌📄]+)/s);
    const dica = alertaMatch 
      ? `💡 ${alertaMatch[1].trim()}` 
      : "💡 Consulte sempre um profissional habilitado para casos específicos.";
    
    // ITs relacionadas
    const itsRelacionadas = this.extrairITsDoTexto(resposta);
    
    // Sugestões baseadas no contexto
    const sugestoes = this.gerarSugestoesPorContexto(intencao, contexto, contextoDeep);
    
    return {
      resumo,
      detalhes,
      dica,
      relacionadas: itsRelacionadas,
      sugestoes
    };
  }
  
  /**
   * Extrai números de ITs mencionadas no texto
   * @param texto - Texto para análise
   * @returns Array de ITs encontradas
   */
  private static extrairITsDoTexto(texto: string): string[] {
    const itPattern = /\b(?:IT[- ]?(\d{1,3})|Instrução Técnica[- ]?(\d{1,3}))\b/gi;
    const matches = [...texto.matchAll(itPattern)];
    
    return [...new Set(matches.map(m => {
      const num = (m[1] || m[2]).padStart(3, '0');
      return `IT-${num}`;
    }))];
  }
  
  /**
   * Gera sugestões contextualizadas
   * @param intencao - Intenção da pergunta
   * @param contexto - Contexto básico
   * @param contextoDeep - Contexto profundo
   * @returns Lista de sugestões
   */
  private static gerarSugestoesPorContexto(
    intencao: IntencaoPergunta,
    contexto: ContextoConversa,
    contextoDeep: any
  ): string[] {
    const sugestoes: string[] = [];
    
    // AIDEV-EXPLANATION: Sugestões baseadas na intenção
    switch (intencao) {
      case 'CALCULO':
        sugestoes.push("Como posicionar os equipamentos calculados?");
        sugestoes.push("Quais os requisitos de manutenção?");
        break;
        
      case 'DEFINICAO':
        sugestoes.push("Onde isso se aplica na prática?");
        sugestoes.push("Quais são as exceções?");
        break;
        
      case 'TUTORIAL':
        sugestoes.push("Quanto tempo leva o processo completo?");
        sugestoes.push("Quais os custos envolvidos?");
        break;
        
      case 'VALIDACAO':
        if (contextoDeep.riskFactors?.length > 0) {
          sugestoes.push("Como mitigar os riscos identificados?");
        }
        sugestoes.push("Qual o prazo para adequação?");
        break;
    }
    
    // Adiciona sugestões baseadas em necessidades implícitas
    if (contextoDeep.implicitNeeds?.length > 0) {
      sugestoes.push(contextoDeep.implicitNeeds[0]);
    }
    
    // Adiciona sugestão sobre próximos passos
    if (contextoDeep.projectPhase) {
      sugestoes.push("Quais os próximos passos no processo?");
    }
    
    return sugestoes.slice(0, 3); // Limita a 3 sugestões
  }
  
  /**
   * Gera resposta fallback em caso de erro
   * @param pergunta - Pergunta original
   * @param intencao - Intenção detectada
   * @param contexto - Contexto
   * @returns Resposta fallback
   */
  private static gerarRespostaFallback(
    pergunta: string,
    intencao: IntencaoPergunta,
    contexto: ContextoConversa
  ): RespostaInteligente {
    // AIDEV-SUGGESTION: Usa o formatador original como fallback
    const conteudoFallback = {
      resumo: "Estou processando sua pergunta sobre segurança contra incêndio.",
      definicao: "Para uma resposta precisa, consulte as Instruções Técnicas do CBMEPI.",
      relacionadas: ["IT-001", "IT-008", "IT-021"],
      sugestoes: [
        "Reformule sua pergunta com mais detalhes",
        "Especifique o tipo de edificação",
        "Indique a IT específica de interesse"
      ]
    };
    
    return this.formatarRespostaPorTipo(intencao, contexto, conteudoFallback);
  }
  
  /**
   * Processa feedback do usuário sobre uma resposta
   * @param responseId - ID da resposta
   * @param feedback - Feedback fornecido
   */
  static processarFeedback(responseId: string, feedback: {
    rating: 1 | 2 | 3 | 4 | 5;
    helpful: boolean;
    accurate: boolean;
    complete: boolean;
    issues?: string[];
    suggestions?: string;
  }): void {
    processFeedback({
      responseId,
      ...feedback,
      timestamp: new Date()
    });
    
    logInfo('Feedback processado', {
      responseId,
      rating: feedback.rating
    });
  }
  
  /**
   * Limpa histórico da conversa
   */
  static limparHistorico(): void {
    this.historico = [];
    logInfo('Histórico de conversa limpo');
  }
  
  /**
   * Obtém estatísticas da sessão
   * @returns Estatísticas atuais
   */
  static obterEstatisticas(): {
    totalPerguntas: number;
    cacheHitRate: number;
    tempoMedioResposta: number;
  } {
    // AIDEV-SUGGESTION: Implementar coleta real de métricas
    return {
      totalPerguntas: this.historico.filter(h => h.role === 'user').length,
      cacheHitRate: 0.73, // Placeholder
      tempoMedioResposta: 1250 // ms - Placeholder
    };
  }
}

// AIDEV-SUGGESTION: Exporta a classe enhanced como padrão para facilitar migração
export default EnhancedChatInteligenteService;