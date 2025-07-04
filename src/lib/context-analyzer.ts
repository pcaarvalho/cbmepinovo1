// AIDEV-EXPLANATION: Analisador de contexto avançado para IA superinteligente
// Analisa contexto profundo incluindo histórico, intenção e conhecimento prévio

import { logIA } from '../shared/log/logger';
import { getFromCache } from './ai-cache';

/**
 * Informações contextuais extraídas
 */
interface ContextualInfo {
  userIntent: UserIntent;
  technicalLevel: 'basico' | 'intermediario' | 'avancado' | 'especialista';
  projectPhase?: ProjectPhase;
  buildingType?: string;
  specificRequirements: string[];
  relatedITs: string[];
  previousQuestions: string[];
  implicitNeeds: string[];
  riskFactors: string[];
}

/**
 * Intenção do usuário identificada
 */
interface UserIntent {
  primary: string;
  secondary: string[];
  confidence: number;
}

/**
 * Fase do projeto
 */
enum ProjectPhase {
  CONCEPCAO = 'concepcao',
  PROJETO = 'projeto',
  APROVACAO = 'aprovacao',
  EXECUCAO = 'execucao',
  VISTORIA = 'vistoria',
  MANUTENCAO = 'manutencao',
  REGULARIZACAO = 'regularizacao'
}

/**
 * Banco de conhecimento contextual
 */
interface KnowledgeBase {
  commonMistakes: Map<string, string[]>;
  bestPractices: Map<string, string[]>;
  relatedTopics: Map<string, string[]>;
  technicalTerms: Map<string, string>;
  itDependencies: Map<string, string[]>;
}

// AIDEV-EXPLANATION: Base de conhecimento do domínio CBMEPI
const knowledgeBase: KnowledgeBase = {
  commonMistakes: new Map([
    ['saida_emergencia', [
      'Portas abrindo para dentro',
      'Largura insuficiente das rotas',
      'Obstrução de saídas',
      'Falta de sinalização',
      'Distâncias de caminhamento excessivas'
    ]],
    ['extintores', [
      'Altura de instalação incorreta',
      'Distância entre unidades superior a 20m',
      'Classe inadequada para o risco',
      'Falta de sinalização',
      'Obstrução do acesso'
    ]],
    ['memorial', [
      'Falta de ART/RRT',
      'Ausência de detalhamento técnico',
      'Não conformidade com modelo CBMEPI',
      'Falta de assinatura do responsável',
      'Dados do imóvel incompletos'
    ]]
  ]),
  
  bestPractices: new Map([
    ['projeto', [
      'Consultar ITs antes de iniciar',
      'Considerar todas as ocupações do prédio',
      'Prever expansões futuras',
      'Documentar todas as decisões técnicas',
      'Manter registro fotográfico'
    ]],
    ['vistoria', [
      'Organizar documentação previamente',
      'Realizar checklist interno antes',
      'Fotografar todos os sistemas',
      'Testar equipamentos antecipadamente',
      'Ter responsável técnico presente'
    ]]
  ]),
  
  relatedTopics: new Map([
    ['hidrantes', ['reserva de incêndio', 'bombas', 'tubulação', 'mangueiras', 'abrigos']],
    ['iluminacao', ['autonomia', 'baterias', 'luminárias', 'circuitos', 'acionamento']],
    ['alarme', ['detectores', 'central', 'acionadores', 'sirenes', 'setorização']]
  ]),
  
  technicalTerms: new Map([
    ['RTI', 'Reserva Técnica de Incêndio'],
    ['AVCB', 'Auto de Vistoria do Corpo de Bombeiros'],
    ['PCI', 'Proteção Contra Incêndio'],
    ['TRRF', 'Tempo Requerido de Resistência ao Fogo'],
    ['CAF', 'Controle de Acesso de Fumaça']
  ]),
  
  itDependencies: new Map([
    ['IT-008', ['IT-011', 'IT-018']], // Saídas dependem de sinalização e iluminação
    ['IT-022', ['IT-023']], // Hidrantes dependem de reserva de incêndio
    ['IT-019', ['IT-020']] // Detecção depende de alarme
  ])
};

/**
 * Analisa o contexto profundo de uma consulta
 * @param pergunta - Pergunta atual
 * @param historico - Histórico de conversação
 * @param metadata - Metadados adicionais
 * @returns Informações contextuais extraídas
 */
export function analyzeDeepContext(
  pergunta: string,
  historico: Array<{ role: string; content: string }> = [],
  metadata?: Record<string, any>
): ContextualInfo {
  // AIDEV-EXPLANATION: Extrai intenção principal
  const userIntent = extractUserIntent(pergunta, historico);
  
  // Determina nível técnico
  const technicalLevel = assessTechnicalLevel(pergunta, historico);
  
  // Identifica fase do projeto
  const projectPhase = identifyProjectPhase(pergunta, historico);
  
  // Extrai tipo de edificação
  const buildingType = extractBuildingType(pergunta, historico);
  
  // Identifica requisitos específicos
  const specificRequirements = extractSpecificRequirements(pergunta, historico);
  
  // Encontra ITs relacionadas
  const relatedITs = findRelatedITs(pergunta, historico);
  
  // Analisa perguntas anteriores
  const previousQuestions = historico
    .filter(h => h.role === 'user')
    .map(h => h.content)
    .slice(-5); // Últimas 5 perguntas
  
  // Identifica necessidades implícitas
  const implicitNeeds = identifyImplicitNeeds(pergunta, userIntent, projectPhase);
  
  // Avalia fatores de risco
  const riskFactors = assessRiskFactors(pergunta, buildingType, specificRequirements);
  
  return {
    userIntent,
    technicalLevel,
    projectPhase,
    buildingType,
    specificRequirements,
    relatedITs,
    previousQuestions,
    implicitNeeds,
    riskFactors
  };
}

/**
 * Extrai a intenção principal do usuário
 * @param pergunta - Pergunta atual
 * @param historico - Histórico de conversação
 * @returns Intenção identificada
 */
function extractUserIntent(
  pergunta: string, 
  historico: Array<{ role: string; content: string }>
): UserIntent {
  const intents = new Map<string, number>();
  
  // AIDEV-EXPLANATION: Padrões de intenção
  const intentPatterns = {
    'entender_norma': /o que é|significa|explicar|entender|interpretar/i,
    'aplicar_norma': /como (fazer|aplicar|implementar|instalar)|procedimento/i,
    'calcular': /calcular|dimensionar|quantos|capacidade|área/i,
    'verificar_conformidade': /está (certo|correto|adequado)|conformidade|verificar/i,
    'resolver_problema': /problema|erro|não funciona|defeito|falha/i,
    'obter_aprovacao': /aprovar|aprovação|vistoria|regularizar|AVCB/i,
    'comparar_opcoes': /melhor|ou|versus|comparar|diferença/i,
    'urgencia': /urgente|emergência|rápido|prazo|notificação/i
  };
  
  // Analisa pergunta atual
  for (const [intent, pattern] of Object.entries(intentPatterns)) {
    if (pattern.test(pergunta)) {
      intents.set(intent, (intents.get(intent) || 0) + 2); // Peso maior para pergunta atual
    }
  }
  
  // Analisa histórico
  historico.slice(-3).forEach(h => {
    if (h.role === 'user') {
      for (const [intent, pattern] of Object.entries(intentPatterns)) {
        if (pattern.test(h.content)) {
          intents.set(intent, (intents.get(intent) || 0) + 1);
        }
      }
    }
  });
  
  // Ordena por score
  const sortedIntents = Array.from(intents.entries())
    .sort((a, b) => b[1] - a[1]);
  
  const primary = sortedIntents[0]?.[0] || 'informacao_geral';
  const secondary = sortedIntents.slice(1, 3).map(i => i[0]);
  const confidence = sortedIntents[0]?.[1] || 0;
  
  return {
    primary,
    secondary,
    confidence: Math.min(confidence / 10, 1) // Normaliza para 0-1
  };
}

/**
 * Avalia o nível técnico do usuário
 * @param pergunta - Pergunta atual
 * @param historico - Histórico
 * @returns Nível técnico identificado
 */
function assessTechnicalLevel(
  pergunta: string,
  historico: Array<{ role: string; content: string }>
): 'basico' | 'intermediario' | 'avancado' | 'especialista' {
  let score = 0;
  
  // AIDEV-EXPLANATION: Indicadores de nível técnico
  const advancedTerms = [
    'RTI', 'TRRF', 'CAF', 'sprinkler', 'pressurização', 'compartimentação',
    'carga incêndio', 'risco isolado', 'central endereçável', 'laço', 'setorização'
  ];
  
  const intermediateTerms = [
    'hidrante', 'mangotinho', 'extintor', 'iluminação emergência', 'alarme',
    'detector', 'sinalização', 'rota fuga', 'memorial', 'ART'
  ];
  
  const basicQuestions = [
    'o que é', 'como funciona', 'para que serve', 'preciso de', 'é obrigatório'
  ];
  
  // Analisa uso de termos técnicos
  advancedTerms.forEach(term => {
    if (pergunta.toLowerCase().includes(term.toLowerCase())) score += 3;
  });
  
  intermediateTerms.forEach(term => {
    if (pergunta.toLowerCase().includes(term.toLowerCase())) score += 1;
  });
  
  // Penaliza perguntas básicas
  basicQuestions.forEach(question => {
    if (pergunta.toLowerCase().includes(question)) score -= 2;
  });
  
  // Analisa histórico
  const userMessages = historico.filter(h => h.role === 'user').slice(-5);
  userMessages.forEach(msg => {
    if (advancedTerms.some(t => msg.content.toLowerCase().includes(t.toLowerCase()))) {
      score += 1;
    }
  });
  
  // Classifica baseado no score
  if (score >= 10) return 'especialista';
  if (score >= 5) return 'avancado';
  if (score >= 2) return 'intermediario';
  return 'basico';
}

/**
 * Identifica a fase do projeto
 * @param pergunta - Pergunta atual
 * @param historico - Histórico
 * @returns Fase identificada ou undefined
 */
function identifyProjectPhase(
  pergunta: string,
  historico: Array<{ role: string; content: string }>
): ProjectPhase | undefined {
  const phasePatterns = {
    [ProjectPhase.CONCEPCAO]: /inicial|começar|planejar|ideia|viabilidade/i,
    [ProjectPhase.PROJETO]: /projeto|projetar|desenho|planta|memorial/i,
    [ProjectPhase.APROVACAO]: /aprovar|aprovação|entrada|protocolo|documentos/i,
    [ProjectPhase.EXECUCAO]: /executar|instalar|obra|construção|implementar/i,
    [ProjectPhase.VISTORIA]: /vistoria|inspeção|teste|verificar sistemas/i,
    [ProjectPhase.MANUTENCAO]: /manutenção|trocar|substituir|revisar|periódico/i,
    [ProjectPhase.REGULARIZACAO]: /regularizar|adequar|notificação|prazo|multa/i
  };
  
  for (const [phase, pattern] of Object.entries(phasePatterns)) {
    if (pattern.test(pergunta)) {
      return phase as ProjectPhase;
    }
  }
  
  // Verifica histórico se não encontrou na pergunta atual
  const recentMessages = historico.filter(h => h.role === 'user').slice(-3);
  for (const msg of recentMessages) {
    for (const [phase, pattern] of Object.entries(phasePatterns)) {
      if (pattern.test(msg.content)) {
        return phase as ProjectPhase;
      }
    }
  }
  
  return undefined;
}

/**
 * Extrai tipo de edificação
 * @param pergunta - Pergunta atual
 * @param historico - Histórico
 * @returns Tipo de edificação ou undefined
 */
function extractBuildingType(
  pergunta: string,
  historico: Array<{ role: string; content: string }>
): string | undefined {
  const buildingPatterns = {
    'residencial_unifamiliar': /casa|residência|unifamiliar/i,
    'residencial_multifamiliar': /prédio|apartamento|condomínio|edifício residencial/i,
    'comercial_pequeno': /loja|comércio pequeno|escritório/i,
    'comercial_grande': /shopping|centro comercial|galeria/i,
    'industrial': /indústria|fábrica|galpão/i,
    'educacional': /escola|faculdade|universidade|creche/i,
    'saude': /hospital|clínica|posto saúde|upa/i,
    'reuniao_publico': /teatro|cinema|igreja|auditório|salão/i,
    'hospedagem': /hotel|pousada|motel|hostel/i,
    'servicos': /oficina|posto combustível|estacionamento/i
  };
  
  // Busca na pergunta atual e histórico
  const allText = pergunta + ' ' + historico.map(h => h.content).join(' ');
  
  for (const [type, pattern] of Object.entries(buildingPatterns)) {
    if (pattern.test(allText)) {
      return type;
    }
  }
  
  return undefined;
}

/**
 * Extrai requisitos específicos mencionados
 * @param pergunta - Pergunta atual
 * @param historico - Histórico
 * @returns Lista de requisitos específicos
 */
function extractSpecificRequirements(
  pergunta: string,
  historico: Array<{ role: string; content: string }>
): string[] {
  const requirements: Set<string> = new Set();
  const allText = pergunta + ' ' + historico.map(h => h.content).join(' ');
  
  // AIDEV-EXPLANATION: Padrões de requisitos específicos
  const requirementPatterns = {
    'altura_especifica': /\d+\s*(m|metro|andar|pavimento)/i,
    'area_especifica': /\d+\s*(m²|m2|metro quadrado)/i,
    'capacidade_pessoas': /\d+\s*(pessoa|ocupante|usuário)/i,
    'material_especifico': /(madeira|alvenaria|metal|concreto|drywall)/i,
    'uso_especial': /(depósito|arquivo|datacenter|cozinha industrial|laboratório)/i,
    'risco_especial': /(produto químico|inflamável|GLP|explosivo|hospitalar)/i,
    'restricao_local': /(centro histórico|patrimônio|subsolo|cobertura)/i
  };
  
  for (const [req, pattern] of Object.entries(requirementPatterns)) {
    if (pattern.test(allText)) {
      const match = allText.match(pattern);
      if (match) {
        requirements.add(`${req}: ${match[0]}`);
      }
    }
  }
  
  return Array.from(requirements);
}

/**
 * Encontra ITs relacionadas ao contexto
 * @param pergunta - Pergunta atual
 * @param historico - Histórico
 * @returns Lista de ITs relacionadas
 */
function findRelatedITs(
  pergunta: string,
  historico: Array<{ role: string; content: string }>
): string[] {
  const relatedITs: Set<string> = new Set();
  const allText = pergunta + ' ' + historico.map(h => h.content).join(' ');
  
  // AIDEV-EXPLANATION: Mapeamento de tópicos para ITs
  const topicToIT = {
    'saída|emergência|rota fuga': ['IT-008', 'IT-011'],
    'iluminação emergência': ['IT-018'],
    'extintor': ['IT-021'],
    'hidrante|mangotinho': ['IT-022'],
    'reserva|RTI': ['IT-023'],
    'chuveiro automático|sprinkler': ['IT-024'],
    'GLP|gás': ['IT-025'],
    'alarme|detecção': ['IT-019', 'IT-020'],
    'sinalização': ['IT-011'],
    'memorial|projeto': ['IT-001'],
    'vistoria': ['IT-002'],
    'fogos artifício': ['IT-030'],
    'controle fumaça': ['IT-038']
  };
  
  for (const [pattern, its] of Object.entries(topicToIT)) {
    if (new RegExp(pattern, 'i').test(allText)) {
      its.forEach(it => relatedITs.add(it));
    }
  }
  
  // Adiciona ITs explicitamente mencionadas
  const explicitITs = allText.match(/IT[- ]?\d{1,3}/gi) || [];
  explicitITs.forEach(it => {
    const num = it.match(/\d+/)?.[0];
    if (num) {
      relatedITs.add(`IT-${num.padStart(3, '0')}`);
    }
  });
  
  // Adiciona ITs dependentes
  Array.from(relatedITs).forEach(it => {
    const deps = knowledgeBase.itDependencies.get(it);
    if (deps) {
      deps.forEach(dep => relatedITs.add(dep));
    }
  });
  
  return Array.from(relatedITs).sort();
}

/**
 * Identifica necessidades implícitas baseado no contexto
 * @param pergunta - Pergunta atual
 * @param intent - Intenção identificada
 * @param phase - Fase do projeto
 * @returns Lista de necessidades implícitas
 */
function identifyImplicitNeeds(
  pergunta: string,
  intent: UserIntent,
  phase?: ProjectPhase
): string[] {
  const needs: string[] = [];
  
  // AIDEV-EXPLANATION: Necessidades baseadas na intenção
  if (intent.primary === 'obter_aprovacao') {
    needs.push('Checklist de documentação completa');
    needs.push('Prazos e procedimentos do CBMEPI');
    needs.push('Taxas e custos envolvidos');
  }
  
  if (intent.primary === 'calcular') {
    needs.push('Normas de referência para cálculo');
    needs.push('Fatores de segurança aplicáveis');
    needs.push('Exemplos de memorial de cálculo');
  }
  
  if (intent.primary === 'resolver_problema') {
    needs.push('Diagnóstico de causas comuns');
    needs.push('Soluções alternativas permitidas');
    needs.push('Necessidade de responsável técnico');
  }
  
  // Necessidades baseadas na fase
  if (phase === ProjectPhase.VISTORIA) {
    needs.push('Checklist de preparação para vistoria');
    needs.push('Documentos necessários na vistoria');
    needs.push('Testes obrigatórios dos sistemas');
  }
  
  if (phase === ProjectPhase.REGULARIZACAO) {
    needs.push('Procedimentos para regularização');
    needs.push('Documentação para edificação existente');
    needs.push('Possíveis adequações necessárias');
  }
  
  return needs;
}

/**
 * Avalia fatores de risco no contexto
 * @param pergunta - Pergunta atual
 * @param buildingType - Tipo de edificação
 * @param requirements - Requisitos específicos
 * @returns Lista de fatores de risco identificados
 */
function assessRiskFactors(
  pergunta: string,
  buildingType?: string,
  requirements: string[] = []
): string[] {
  const riskFactors: string[] = [];
  
  // AIDEV-EXPLANATION: Riscos por tipo de edificação
  const buildingRisks: Record<string, string[]> = {
    'industrial': [
      'Carga de incêndio elevada',
      'Produtos perigosos',
      'Grandes áreas compartimentadas'
    ],
    'saude': [
      'Evacuação de pessoas com mobilidade reduzida',
      'Áreas críticas (UTI, centro cirúrgico)',
      'Gases medicinais'
    ],
    'educacional': [
      'Grande concentração de pessoas',
      'Evacuação de crianças',
      'Múltiplos pavimentos'
    ],
    'comercial_grande': [
      'Alta circulação de pessoas',
      'Múltiplas rotas de fuga',
      'Sistemas complexos'
    ]
  };
  
  if (buildingType && buildingRisks[buildingType]) {
    riskFactors.push(...buildingRisks[buildingType]);
  }
  
  // Riscos baseados em requisitos
  requirements.forEach(req => {
    if (req.includes('subsolo')) {
      riskFactors.push('Dificuldade de evacuação em subsolo');
      riskFactors.push('Necessidade de ventilação especial');
    }
    if (req.includes('produto químico') || req.includes('inflamável')) {
      riskFactors.push('Risco de explosão ou incêndio rápido');
      riskFactors.push('Necessidade de sistemas especiais');
    }
    if (req.includes('altura') && parseInt(req.match(/\d+/)?.[0] || '0') > 30) {
      riskFactors.push('Edificação alta - sistemas pressurizados');
      riskFactors.push('Elevadores de segurança necessários');
    }
  });
  
  // Riscos detectados na pergunta
  if (/urgente|emergência|notificação|multa/i.test(pergunta)) {
    riskFactors.push('Situação urgente - risco de penalidades');
  }
  
  if (/não funciona|defeito|quebrado/i.test(pergunta)) {
    riskFactors.push('Sistemas inoperantes - risco à segurança');
  }
  
  return [...new Set(riskFactors)]; // Remove duplicatas
}

/**
 * Gera recomendações contextuais baseadas na análise
 * @param context - Contexto analisado
 * @returns Lista de recomendações
 */
export function generateContextualRecommendations(context: ContextualInfo): string[] {
  const recommendations: string[] = [];
  
  // AIDEV-EXPLANATION: Recomendações baseadas no nível técnico
  if (context.technicalLevel === 'basico') {
    recommendations.push('Considere consultar um profissional habilitado');
    recommendations.push('Leia as ITs básicas antes de prosseguir');
  }
  
  // Recomendações baseadas na fase
  if (context.projectPhase === ProjectPhase.PROJETO) {
    recommendations.push('Valide o projeto com as ITs antes de finalizar');
    recommendations.push('Considere margem de segurança nos dimensionamentos');
  }
  
  // Recomendações baseadas em riscos
  if (context.riskFactors.length > 2) {
    recommendations.push('Atenção especial aos fatores de risco identificados');
    recommendations.push('Considere consultoria especializada');
  }
  
  // Recomendações baseadas em erros comuns
  if (context.buildingType) {
    const commonMistakes = Array.from(knowledgeBase.commonMistakes.entries())
      .filter(([key]) => context.relatedITs.some(it => key.includes(it.toLowerCase())))
      .flatMap(([, mistakes]) => mistakes);
    
    if (commonMistakes.length > 0) {
      recommendations.push(`Evite erros comuns: ${commonMistakes[0]}`);
    }
  }
  
  return recommendations;
}

/**
 * Enriquece resposta com informações contextuais
 * @param resposta - Resposta original
 * @param context - Contexto analisado
 * @returns Resposta enriquecida
 */
export function enrichResponseWithContext(
  resposta: string,
  context: ContextualInfo
): string {
  let enrichedResponse = resposta;
  
  // AIDEV-EXPLANATION: Adiciona alertas baseados em riscos
  if (context.riskFactors.length > 0) {
    enrichedResponse += `\n\n⚠️ **Fatores de Risco Identificados:**\n`;
    context.riskFactors.forEach(risk => {
      enrichedResponse += `• ${risk}\n`;
    });
  }
  
  // Adiciona necessidades implícitas
  if (context.implicitNeeds.length > 0) {
    enrichedResponse += `\n\n💡 **Você também pode precisar saber sobre:**\n`;
    context.implicitNeeds.forEach(need => {
      enrichedResponse += `• ${need}\n`;
    });
  }
  
  // Adiciona boas práticas relevantes
  if (context.projectPhase) {
    const practices = knowledgeBase.bestPractices.get(context.projectPhase);
    if (practices && practices.length > 0) {
      enrichedResponse += `\n\n✅ **Boas Práticas para ${context.projectPhase}:**\n`;
      practices.slice(0, 3).forEach(practice => {
        enrichedResponse += `• ${practice}\n`;
      });
    }
  }
  
  // Log para análise
  logIA('Contexto analisado e resposta enriquecida', {
    response: enrichedResponse.substring(0, 100),
    tokens: enrichedResponse.length / 4
  });
  
  return enrichedResponse;
}

// AIDEV-SUGGESTION: Exporta tipos e enums para uso externo
export { ContextualInfo, UserIntent, ProjectPhase };