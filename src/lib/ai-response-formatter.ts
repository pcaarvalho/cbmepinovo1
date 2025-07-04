// AIDEV-EXPLANATION: Sistema de formatação de respostas estruturadas para IA superinteligente
// Implementa o padrão definido em CLAUDE.md para respostas técnicas do CBMEPI

import { scoreIAResponse } from '../core/analysis/ai-score';
import { logIA } from '../shared/log/logger';

/**
 * Interface para componentes da resposta estruturada
 */
interface StructuredResponseComponents {
  baseLegal?: string;           // Base legal com citação de ITs
  aplicabilidadePratica?: string; // Como aplicar na prática
  alertaTecnico?: string;       // Alertas e exceções importantes
  referenciaOficial?: string;   // Referências às ITs completas
  contextoAdicional?: string;   // Informações extras relevantes
}

/**
 * Interface para análise de conteúdo da resposta
 */
interface ResponseAnalysis {
  mencionaIT: boolean;
  itsMencionadas: string[];
  temExemplos: boolean;
  temAlertaTecnico: boolean;
  qualidadeScore: number;
}

/**
 * Extrai números de ITs mencionadas no texto
 * @param texto - Texto para análise
 * @returns Array com números de ITs encontradas
 */
function extractITNumbers(texto: string): string[] {
  const itPattern = /\b(?:IT[- ]?(\d{1,3})|Instrução Técnica[- ]?(\d{1,3}))\b/gi;
  const matches = [...texto.matchAll(itPattern)];
  
  return matches
    .map(match => match[1] || match[2])
    .filter(Boolean)
    .map(num => `IT-${num.padStart(3, '0')}`);
}

/**
 * Analisa o conteúdo de uma resposta de IA
 * @param resposta - Resposta da IA
 * @returns Análise detalhada
 */
function analyzeResponse(resposta: string): ResponseAnalysis {
  const textoLower = resposta.toLowerCase();
  const itsMencionadas = extractITNumbers(resposta);
  
  return {
    mencionaIT: itsMencionadas.length > 0,
    itsMencionadas,
    temExemplos: /por exemplo|exemplo:|caso típico|na prática/i.test(resposta),
    temAlertaTecnico: /atenção|cuidado|importante|exceção|erro comum|crítico/i.test(resposta),
    qualidadeScore: scoreIAResponse(resposta)
  };
}

/**
 * Formata uma resposta de IA no padrão estruturado do CBMEPI
 * @param respostaIA - Resposta bruta da IA
 * @param perguntaUsuario - Pergunta original do usuário
 * @returns Resposta formatada no padrão estruturado
 */
export function formatStructuredResponse(
  respostaIA: string, 
  perguntaUsuario: string
): string {
  // AIDEV-EXPLANATION: Analisa a resposta para extrair componentes
  const analysis = analyzeResponse(respostaIA);
  const components = extractResponseComponents(respostaIA, analysis);
  
  // AIDEV-SUGGESTION: Se a qualidade for baixa, tenta reformular
  if (analysis.qualidadeScore < 5) {
    logIA('Resposta com qualidade baixa, aplicando melhorias', {
      response: respostaIA.substring(0, 100),
      tokens: respostaIA.length / 4,
      model: 'formatter'
    });
    
    return enhanceLowQualityResponse(respostaIA, perguntaUsuario, analysis);
  }
  
  // Monta resposta estruturada
  return buildStructuredResponse(components, analysis);
}

/**
 * Extrai componentes da resposta baseado em padrões
 * @param resposta - Resposta da IA
 * @param analysis - Análise da resposta
 * @returns Componentes extraídos
 */
function extractResponseComponents(
  resposta: string, 
  analysis: ResponseAnalysis
): StructuredResponseComponents {
  const components: StructuredResponseComponents = {};
  
  // AIDEV-EXPLANATION: Tenta identificar seções na resposta
  const sections = resposta.split(/\n\n+/);
  
  // Procura por base legal
  const baseLegalSection = sections.find(s => 
    /base legal|norma|artigo|it[- ]?\d+|instrução técnica/i.test(s)
  );
  if (baseLegalSection) {
    components.baseLegal = baseLegalSection.trim();
  } else if (analysis.mencionaIT) {
    // Se menciona IT mas não tem seção específica, cria uma
    components.baseLegal = `De acordo com as ${analysis.itsMencionadas.join(', ')}, ${
      resposta.substring(0, 200)
    }...`;
  }
  
  // Procura por aplicabilidade prática
  const praticaSection = sections.find(s => 
    /na prática|aplicação|como aplicar|exemplo|caso típico/i.test(s)
  );
  if (praticaSection) {
    components.aplicabilidadePratica = praticaSection.trim();
  } else {
    // Extrai partes práticas da resposta
    const praticaParts = resposta.match(/(?:deve|precisa|necessário|recomenda-se)[^.]+\./gi);
    if (praticaParts) {
      components.aplicabilidadePratica = praticaParts.join(' ');
    }
  }
  
  // Procura por alertas técnicos
  const alertaSection = sections.find(s => 
    /atenção|importante|cuidado|exceção|observ/i.test(s)
  );
  if (alertaSection) {
    components.alertaTecnico = alertaSection.trim();
  }
  
  // Define referências oficiais
  if (analysis.itsMencionadas.length > 0) {
    components.referenciaOficial = `Para informações completas, consulte: ${
      analysis.itsMencionadas.map(it => {
        const num = it.replace('IT-', '');
        return `${it} – ${getITName(num)}`;
      }).join(', ')
    }`;
  }
  
  return components;
}

/**
 * Constrói a resposta estruturada final
 * @param components - Componentes da resposta
 * @param analysis - Análise da resposta
 * @returns Resposta formatada
 */
function buildStructuredResponse(
  components: StructuredResponseComponents,
  analysis: ResponseAnalysis
): string {
  let response = '';
  
  // Base Legal
  if (components.baseLegal) {
    response += `🧠 **Base Legal**\n${components.baseLegal}\n\n`;
  }
  
  // Aplicabilidade Prática
  if (components.aplicabilidadePratica) {
    response += `📌 **Aplicabilidade Prática**\n${components.aplicabilidadePratica}\n\n`;
  }
  
  // Alerta Técnico
  if (components.alertaTecnico) {
    response += `⚠️ **Alerta Técnico**\n${components.alertaTecnico}\n\n`;
  }
  
  // Referência Oficial
  if (components.referenciaOficial) {
    response += `📄 **Referência Oficial**\n${components.referenciaOficial}`;
  }
  
  // Se ainda estiver vazia, retorna resposta original com formatação básica
  if (!response.trim()) {
    return `📋 **Resposta Técnica**\n${components.baseLegal || components.aplicabilidadePratica || 'Consulte as Instruções Técnicas do CBMEPI para orientações específicas.'}`;
  }
  
  return response.trim();
}

/**
 * Melhora respostas de baixa qualidade
 * @param resposta - Resposta original
 * @param pergunta - Pergunta do usuário
 * @param analysis - Análise da resposta
 * @returns Resposta melhorada
 */
function enhanceLowQualityResponse(
  resposta: string,
  pergunta: string,
  analysis: ResponseAnalysis
): string {
  // AIDEV-SUGGESTION: Identifica tópico principal da pergunta
  const topico = identifyTopic(pergunta);
  
  let enhanced = '';
  
  // Base Legal genérica baseada no tópico
  enhanced += `🧠 **Base Legal**\n`;
  if (topico) {
    enhanced += `As normas aplicáveis para ${topico} estão definidas nas Instruções Técnicas do CBMEPI. `;
  }
  enhanced += resposta.substring(0, 150) + '...\n\n';
  
  // Aplicabilidade Prática genérica
  enhanced += `📌 **Aplicabilidade Prática**\n`;
  enhanced += `Para aplicar corretamente essas orientações, verifique:\n`;
  enhanced += `- As características específicas da edificação\n`;
  enhanced += `- O tipo de ocupação e uso\n`;
  enhanced += `- As particularidades do projeto\n\n`;
  
  // Alerta Técnico padrão
  enhanced += `⚠️ **Alerta Técnico**\n`;
  enhanced += `Esta é uma orientação geral. Consulte sempre um profissional habilitado `;
  enhanced += `e as Instruções Técnicas completas do CBMEPI para seu caso específico.\n\n`;
  
  // Referência Oficial
  enhanced += `📄 **Referência Oficial**\n`;
  enhanced += `Consulte as Instruções Técnicas do CBMEPI em sua versão mais atualizada `;
  enhanced += `para garantir conformidade com as normas vigentes.`;
  
  return enhanced;
}

/**
 * Identifica o tópico principal de uma pergunta
 * @param pergunta - Pergunta do usuário
 * @returns Tópico identificado ou null
 */
function identifyTopic(pergunta: string): string | null {
  const topicos = {
    'saída de emergência': /saída|emergência|evacuação|escape|rota de fuga/i,
    'sistema de hidrantes': /hidrante|mangueira|bomba|pressão|vazão/i,
    'extintores': /extintor|pó químico|co2|água|classe de fogo/i,
    'iluminação de emergência': /iluminação|emergência|autonomia|lux|luminárias/i,
    'alarme e detecção': /alarme|detecção|detector|fumaça|incêndio/i,
    'memorial descritivo': /memorial|projeto|planta|art|rrt/i,
    'análise de conformidade': /conformidade|vistoria|regularização|aprovação/i
  };
  
  for (const [topico, pattern] of Object.entries(topicos)) {
    if (pattern.test(pergunta)) {
      return topico;
    }
  }
  
  return null;
}

/**
 * Obtém o nome de uma IT baseado no número
 * @param numero - Número da IT (string)
 * @returns Nome da IT ou descrição genérica
 */
function getITName(numero: string): string {
  // AIDEV-SUGGESTION: Mapa de ITs mais comuns do CBMEPI
  const itNames: Record<string, string> = {
    '001': 'Procedimentos Administrativos',
    '008': 'Saídas de Emergência',
    '018': 'Iluminação de Emergência',
    '021': 'Sistema de Proteção por Extintores',
    '022': 'Sistemas de Hidrantes',
    '025': 'Armazenamento de GLP',
    '030': 'Fogos de Artifício',
    '038': 'Controle de Fumaça'
  };
  
  const numClean = numero.replace(/^0+/, '');
  return itNames[numero] || itNames[numClean] || 'Instrução Técnica do CBMEPI';
}

/**
 * Valida se uma resposta atende aos padrões de qualidade
 * @param respostaFormatada - Resposta já formatada
 * @returns Objeto com validação e sugestões
 */
export function validateFormattedResponse(respostaFormatada: string): {
  isValid: boolean;
  score: number;
  suggestions: string[];
} {
  const suggestions: string[] = [];
  let componentCount = 0;
  
  // Verifica presença dos componentes
  if (respostaFormatada.includes('🧠 **Base Legal**')) componentCount++;
  else suggestions.push('Adicionar seção de Base Legal com citação de ITs');
  
  if (respostaFormatada.includes('📌 **Aplicabilidade Prática**')) componentCount++;
  else suggestions.push('Incluir exemplos práticos de aplicação');
  
  if (respostaFormatada.includes('⚠️ **Alerta Técnico**')) componentCount++;
  else suggestions.push('Considerar adicionar alertas técnicos relevantes');
  
  if (respostaFormatada.includes('📄 **Referência Oficial**')) componentCount++;
  else suggestions.push('Citar as ITs específicas para consulta completa');
  
  const score = scoreIAResponse(respostaFormatada);
  const isValid = componentCount >= 2 && score >= 6;
  
  if (score < 6) {
    suggestions.push('Melhorar conteúdo técnico e citações específicas');
  }
  
  return { isValid, score, suggestions };
}

// AIDEV-SUGGESTION: Exporta funções auxiliares para testes
export { extractITNumbers, analyzeResponse, identifyTopic };