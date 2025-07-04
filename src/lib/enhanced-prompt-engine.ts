// AIDEV-EXPLANATION: Motor de prompts superinteligente para IA do CBMEPI
// Implementa estratégias avançadas de prompt engineering para respostas de alta qualidade

import { extractKeywords } from './prompt-utils';
import { logIA } from '../shared/log/logger';

/**
 * Tipos de consulta para otimização de prompt
 */
enum QueryType {
  NORMATIVA = 'normativa',           // Consultas sobre ITs específicas
  APLICACAO = 'aplicacao',           // Como aplicar uma norma
  DIMENSIONAMENTO = 'dimensionamento', // Cálculos e dimensionamentos
  CONFORMIDADE = 'conformidade',     // Análise de conformidade
  MEMORIAL = 'memorial',             // Memorial descritivo
  EMERGENCIAL = 'emergencial',       // Questões urgentes/críticas
  COMPARATIVA = 'comparativa',       // Comparação entre normas
  INTERPRETATIVA = 'interpretativa'  // Interpretação de texto normativo
}

/**
 * Contexto enriquecido para geração de prompts
 */
interface EnhancedContext {
  queryType: QueryType;
  keywords: string[];
  itReferences: string[];
  userProfile?: 'profissional' | 'estudante' | 'proprietario' | 'bombeiro';
  urgencyLevel: 'baixa' | 'media' | 'alta' | 'critica';
  previousContext?: string;
  specificDomain?: string;
}

/**
 * Templates de system prompts otimizados por tipo
 */
const SYSTEM_PROMPT_TEMPLATES: Record<QueryType, string> = {
  [QueryType.NORMATIVA]: `Você é um especialista sênior em Instruções Técnicas do Corpo de Bombeiros do Piauí com 20 anos de experiência. 
Seu papel é fornecer interpretações precisas e detalhadas das normas, sempre citando artigos, parágrafos e itens específicos.
Estruture suas respostas com: Base Legal detalhada, Aplicabilidade Prática com exemplos, Alertas Técnicos importantes e Referências Oficiais.
Use linguagem técnica apropriada mas clara. Seja extremamente preciso com números, medidas e especificações.`,

  [QueryType.APLICACAO]: `Você é um engenheiro de segurança contra incêndio experiente, especializado na aplicação prática das ITs do CBMEPI.
Forneça orientações passo a passo sobre como implementar as normas em situações reais.
Inclua: procedimentos detalhados, materiais necessários, pontos de atenção, erros comuns e boas práticas.
Use exemplos concretos e casos típicos do Piauí. Considere as particularidades climáticas e construtivas locais.`,

  [QueryType.DIMENSIONAMENTO]: `Você é um calculista especializado em sistemas de proteção contra incêndio conforme normas do CBMEPI.
Apresente cálculos detalhados, fórmulas aplicáveis, parâmetros de projeto e fatores de segurança.
Sempre cite a IT específica, tabelas e anexos utilizados. Mostre o desenvolvimento completo dos cálculos.
Considere variações e casos especiais. Indique software ou ferramentas recomendadas quando aplicável.`,

  [QueryType.CONFORMIDADE]: `Você é um auditor técnico do CBMEPI especializado em análise de conformidade de projetos.
Avalie criteriosamente cada aspecto apresentado contra as ITs vigentes.
Identifique: conformidades, não-conformidades, pontos de atenção e recomendações de adequação.
Use checklist mental completo. Seja rigoroso mas construtivo. Sugira soluções para cada problema identificado.`,

  [QueryType.MEMORIAL]: `Você é um projetista especializado em elaboração de memoriais descritivos para o CBMEPI.
Oriente sobre estrutura, conteúdo obrigatório, nível de detalhamento e apresentação adequada.
Forneça templates, exemplos de redação e dicas para aprovação rápida.
Destaque os erros mais comuns que levam a exigências ou reprovação.`,

  [QueryType.EMERGENCIAL]: `Você é um oficial bombeiro experiente respondendo a uma consulta urgente sobre segurança contra incêndio.
Seja direto, claro e priorize a segurança. Indique ações imediatas e medidas provisórias aceitáveis.
Após resolver o urgente, oriente sobre regularização definitiva conforme ITs do CBMEPI.
Em situações de risco iminente, recomende evacuação e acionamento do 193.`,

  [QueryType.COMPARATIVA]: `Você é um pesquisador especializado em normas de segurança contra incêndio, expert nas ITs do CBMEPI.
Compare sistematicamente diferentes normas, versões ou requisitos.
Use tabelas comparativas quando apropriado. Destaque diferenças críticas e implicações práticas.
Contextualize historicamente as mudanças quando relevante.`,

  [QueryType.INTERPRETATIVA]: `Você é um jurista especializado em direito administrativo e normas técnicas do CBMEPI.
Interprete o texto normativo considerando: literalidade, finalidade, sistemática e razoabilidade.
Cite jurisprudência administrativa quando existente. Considere o espírito da norma e a segurança como princípio.
Em casos ambíguos, apresente interpretações possíveis e recomende a mais segura.`
};

/**
 * Identifica o tipo de consulta baseado no conteúdo
 * @param pergunta - Pergunta do usuário
 * @param keywords - Palavras-chave extraídas
 * @returns Tipo de consulta identificado
 */
function identifyQueryType(pergunta: string, keywords: string[]): QueryType {
  const perguntaLower = pergunta.toLowerCase();
  
  // AIDEV-EXPLANATION: Padrões para identificar tipo de consulta
  if (/como (calcular|dimensionar)|cálculo|dimensionamento|quantidade|capacidade/i.test(pergunta)) {
    return QueryType.DIMENSIONAMENTO;
  }
  
  if (/como (aplicar|implementar|instalar|executar)|passo a passo|procedimento/i.test(pergunta)) {
    return QueryType.APLICACAO;
  }
  
  if (/conformidade|está (correto|adequado)|análise|verificar|validar/i.test(pergunta)) {
    return QueryType.CONFORMIDADE;
  }
  
  if (/memorial|descritivo|documentação|projeto|art|rrt/i.test(pergunta)) {
    return QueryType.MEMORIAL;
  }
  
  if /(urgente|emergência|risco|perigo|imediato)/i.test(pergunta)) {
    return QueryType.EMERGENCIAL;
  }
  
  if (/(comparar|diferença|versus|melhor|ou)/i.test(pergunta)) {
    return QueryType.COMPARATIVA;
  }
  
  if (/(o que significa|interpretar|entender|explicar)/i.test(pergunta)) {
    return QueryType.INTERPRETATIVA;
  }
  
  // Default: consulta normativa
  return QueryType.NORMATIVA;
}

/**
 * Detecta nível de urgência da consulta
 * @param pergunta - Pergunta do usuário
 * @returns Nível de urgência
 */
function detectUrgency(pergunta: string): 'baixa' | 'media' | 'alta' | 'critica' {
  const perguntaLower = pergunta.toLowerCase();
  
  if (/urgente|emergência|imediato|agora|socorro|perigo|risco (iminente|grave)/i.test(pergunta)) {
    return 'critica';
  }
  
  if (/rápido|hoje|amanhã|prazo|vencendo|notificação/i.test(pergunta)) {
    return 'alta';
  }
  
  if (/breve|semana|preciso|necessito/i.test(pergunta)) {
    return 'media';
  }
  
  return 'baixa';
}

/**
 * Extrai referências a ITs mencionadas
 * @param texto - Texto para análise
 * @returns Array de ITs mencionadas
 */
function extractITReferences(texto: string): string[] {
  const itPattern = /\b(?:IT[- ]?(\d{1,3})|Instrução Técnica[- ]?(\d{1,3}))\b/gi;
  const matches = [...texto.matchAll(itPattern)];
  
  return [...new Set(matches.map(m => {
    const num = (m[1] || m[2]).padStart(3, '0');
    return `IT-${num}`;
  }))];
}

/**
 * Gera contexto enriquecido para o prompt
 * @param pergunta - Pergunta do usuário
 * @param historico - Histórico de conversação (opcional)
 * @returns Contexto enriquecido
 */
export function generateEnhancedContext(
  pergunta: string,
  historico?: string[]
): EnhancedContext {
  const keywords = extractKeywords(pergunta);
  const queryType = identifyQueryType(pergunta, keywords);
  const urgencyLevel = detectUrgency(pergunta);
  const itReferences = extractITReferences(pergunta);
  
  // AIDEV-SUGGESTION: Análise de domínio específico
  let specificDomain: string | undefined;
  const domainPatterns = {
    'edificações residenciais': /residencial|casa|apartamento|condomínio/i,
    'edificações comerciais': /loja|comércio|shopping|mercado/i,
    'indústrias': /indústria|fábrica|galpão industrial/i,
    'eventos': /evento|show|festa|concentração/i,
    'educacional': /escola|faculdade|universidade|creche/i,
    'saúde': /hospital|clínica|posto de saúde|upa/i,
    'combustíveis': /posto de gasolina|glp|gás|combustível/i
  };
  
  for (const [domain, pattern] of Object.entries(domainPatterns)) {
    if (pattern.test(pergunta)) {
      specificDomain = domain;
      break;
    }
  }
  
  return {
    queryType,
    keywords,
    itReferences,
    urgencyLevel,
    specificDomain,
    previousContext: historico?.slice(-2).join('\n')
  };
}

/**
 * Gera prompt otimizado para IA superinteligente
 * @param pergunta - Pergunta do usuário
 * @param context - Contexto enriquecido
 * @returns Prompt otimizado
 */
export function generateSuperPrompt(
  pergunta: string,
  context: EnhancedContext
): { systemPrompt: string; userPrompt: string } {
  // AIDEV-EXPLANATION: Seleciona system prompt baseado no tipo
  let systemPrompt = SYSTEM_PROMPT_TEMPLATES[context.queryType];
  
  // Enriquece com contexto específico
  if (context.specificDomain) {
    systemPrompt += `\n\nATENÇÃO: Esta consulta é específica para ${context.specificDomain}. 
Considere as particularidades e requisitos especiais deste tipo de ocupação conforme ITs do CBMEPI.`;
  }
  
  if (context.urgencyLevel === 'critica') {
    systemPrompt += `\n\n🚨 CONSULTA URGENTE: Priorize segurança e ações imediatas. 
Seja direto e objetivo. Indique claramente o que fazer AGORA e o que regularizar depois.`;
  }
  
  // AIDEV-EXPLANATION: Constrói prompt do usuário com contexto
  let userPrompt = '';
  
  // Adiciona contexto histórico se existir
  if (context.previousContext) {
    userPrompt += `[CONTEXTO DA CONVERSA ANTERIOR]\n${context.previousContext}\n\n`;
  }
  
  // Adiciona ITs relevantes se mencionadas
  if (context.itReferences.length > 0) {
    userPrompt += `[ITs MENCIONADAS: ${context.itReferences.join(', ')}]\n\n`;
  }
  
  // Pergunta principal
  userPrompt += `PERGUNTA: ${pergunta}\n\n`;
  
  // Instruções específicas por tipo
  switch (context.queryType) {
    case QueryType.DIMENSIONAMENTO:
      userPrompt += `Por favor, apresente os cálculos de forma detalhada, incluindo:
- Dados de entrada e premissas
- Fórmulas utilizadas com referência à IT
- Memorial de cálculo passo a passo
- Resultado final com unidades
- Verificações e fatores de segurança aplicados`;
      break;
      
    case QueryType.CONFORMIDADE:
      userPrompt += `Analise a conformidade considerando:
- Requisitos normativos aplicáveis (cite ITs e artigos)
- Avaliação item por item
- Identificação clara de conformidades e não-conformidades
- Recomendações específicas para adequação
- Priorização das correções necessárias`;
      break;
      
    case QueryType.MEMORIAL:
      userPrompt += `Oriente sobre o memorial descritivo incluindo:
- Estrutura e seções obrigatórias
- Nível de detalhamento necessário
- Documentos complementares
- Dicas para evitar exigências comuns
- Exemplo de redação quando aplicável`;
      break;
      
    default:
      userPrompt += `Estruture sua resposta seguindo o padrão:
🧠 Base Legal - com citação específica de ITs e artigos
📌 Aplicabilidade Prática - como implementar na prática
⚠️ Alerta Técnico - pontos de atenção importantes
📄 Referência Oficial - ITs completas para consulta`;
  }
  
  // Log para análise
  logIA('Prompt superinteligente gerado', {
    model: 'enhanced-engine',
    promptLength: userPrompt.length,
    responseTime: 0
  });
  
  return { systemPrompt, userPrompt };
}

/**
 * Otimiza prompt para modelos específicos
 * @param prompt - Prompt original
 * @param model - Modelo alvo
 * @returns Prompt otimizado para o modelo
 */
export function optimizeForModel(
  prompt: { systemPrompt: string; userPrompt: string },
  model: string
): { systemPrompt: string; userPrompt: string } {
  // AIDEV-SUGGESTION: Otimizações específicas por modelo
  
  if (model.includes('claude')) {
    // Claude responde melhor com instruções estruturadas
    return {
      ...prompt,
      userPrompt: prompt.userPrompt + '\n\nPor favor, seja detalhado e técnico em sua resposta.'
    };
  }
  
  if (model.includes('gpt')) {
    // GPT prefere instruções mais diretas
    return {
      ...prompt,
      systemPrompt: prompt.systemPrompt.replace(/\n\n/g, '\n'),
      userPrompt: prompt.userPrompt.replace(/\n\n/g, '\n')
    };
  }
  
  if (model.includes('mistral') || model.includes('mixtral')) {
    // Mistral funciona melhor com exemplos
    return {
      ...prompt,
      systemPrompt: prompt.systemPrompt + '\n\nSempre forneça exemplos práticos quando possível.'
    };
  }
  
  // Default: retorna sem modificações
  return prompt;
}

/**
 * Valida qualidade do prompt gerado
 * @param prompt - Prompt para validar
 * @returns Validação com score e sugestões
 */
export function validatePromptQuality(
  prompt: { systemPrompt: string; userPrompt: string }
): { isValid: boolean; score: number; issues: string[] } {
  const issues: string[] = [];
  let score = 10;
  
  // Verifica tamanho
  const totalLength = prompt.systemPrompt.length + prompt.userPrompt.length;
  if (totalLength > 8000) {
    issues.push('Prompt muito longo, pode ser truncado');
    score -= 2;
  }
  
  // Verifica clareza
  if (!prompt.userPrompt.includes('?') && !prompt.userPrompt.includes(':')) {
    issues.push('Pergunta pouco clara, adicione pontuação adequada');
    score -= 1;
  }
  
  // Verifica contexto
  if (!prompt.systemPrompt.includes('CBMEPI') && !prompt.systemPrompt.includes('Corpo de Bombeiros')) {
    issues.push('Falta contexto institucional no system prompt');
    score -= 2;
  }
  
  // Verifica instruções
  if (!prompt.userPrompt.includes('Base Legal') && !prompt.userPrompt.includes('cite')) {
    issues.push('Falta instrução para citar base legal');
    score -= 1;
  }
  
  return {
    isValid: score >= 7,
    score,
    issues
  };
}

// AIDEV-SUGGESTION: Exporta tipos e enums para uso externo
export { QueryType, EnhancedContext };