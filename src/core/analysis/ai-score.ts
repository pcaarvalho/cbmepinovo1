// AIDEV-EXPLANATION: Sistema de pontuação para respostas de IA conforme AIDEV-IMPROVEMENTS.md
// Avalia qualidade e relevância das respostas baseado em critérios técnicos

/**
 * Critérios de avaliação para respostas de IA
 */
interface ScoreCriteria {
  mentionsIT: boolean;           // Menciona número de IT
  hasTechnicalParagraph: boolean; // Possui parágrafo técnico
  hasConclusion: boolean;         // Possui conclusão/recomendação
  citesSpecificArticles: boolean; // Cita artigos específicos
  usesProperTerminology: boolean; // Usa terminologia adequada
  providesExamples: boolean;      // Fornece exemplos práticos
}

/**
 * Avalia a qualidade de uma resposta de IA baseada em critérios técnicos
 * @param texto - Texto da resposta a ser avaliada
 * @returns Pontuação de 0 a 10
 */
export function scoreIAResponse(texto: string): number {
  if (!texto || texto.trim().length === 0) {
    return 0;
  }

  const textoLower = texto.toLowerCase();
  let score = 0;

  // AIDEV-EXPLANATION: Critério 1 - Menciona número da IT (+2 pontos)
  const itPattern = /\b(it[- ]?\d{1,3}|instrução técnica[- ]?\d{1,3})\b/i;
  if (itPattern.test(texto)) {
    score += 2;
  }

  // AIDEV-EXPLANATION: Critério 2 - Possui parágrafo técnico (+2 pontos)
  const technicalTerms = [
    'dimensionamento', 'cálculo', 'norma', 'nbr', 'abnt',
    'pressão', 'vazão', 'capacidade', 'resistência', 'classificação',
    'categoria', 'tipo', 'classe', 'especificação', 'requisito',
    'parâmetro', 'coeficiente', 'fator', 'índice', 'limite'
  ];
  
  const technicalCount = technicalTerms.filter(term => 
    textoLower.includes(term)
  ).length;
  
  if (technicalCount >= 3) {
    score += 2;
  } else if (technicalCount >= 1) {
    score += 1;
  }

  // AIDEV-EXPLANATION: Critério 3 - Possui conclusão ou recomendação (+1 ponto)
  const conclusionKeywords = [
    'portanto', 'assim', 'dessa forma', 'concluindo', 'conclusão',
    'recomenda-se', 'deve-se', 'é necessário', 'é importante',
    'sugere-se', 'indica-se', 'orienta-se'
  ];
  
  if (conclusionKeywords.some(keyword => textoLower.includes(keyword))) {
    score += 1;
  }

  // AIDEV-SUGGESTION: Critérios adicionais para melhor avaliação

  // Critério 4 - Cita artigos ou seções específicas (+1 ponto)
  const articlePattern = /\b(art(igo)?\.?\s*\d+|seção\s*\d+|item\s*\d+|§\s*\d+)\b/i;
  if (articlePattern.test(texto)) {
    score += 1;
  }

  // Critério 5 - Usa terminologia de segurança contra incêndio (+1 ponto)
  const safetyTerms = [
    'segurança', 'incêndio', 'emergência', 'evacuação', 'proteção',
    'prevenção', 'combate', 'extintor', 'hidrante', 'alarme',
    'detecção', 'sinalização', 'rota de fuga', 'saída'
  ];
  
  const safetyCount = safetyTerms.filter(term => 
    textoLower.includes(term)
  ).length;
  
  if (safetyCount >= 2) {
    score += 1;
  }

  // Critério 6 - Fornece exemplos práticos (+1 ponto)
  const exampleKeywords = [
    'por exemplo', 'exemplo:', 'ex:', 'como:', 'tais como',
    'a saber', 'isto é', 'ou seja', 'casos em que'
  ];
  
  if (exampleKeywords.some(keyword => textoLower.includes(keyword))) {
    score += 1;
  }

  // Critério 7 - Estrutura e organização (+1 ponto)
  const hasNumberedList = /\b\d+[\)\.]\s/m.test(texto);
  const hasBulletPoints = /^[\-\*\•]/m.test(texto);
  const hasParagraphs = texto.split('\n\n').length >= 2;
  
  if (hasNumberedList || hasBulletPoints || hasParagraphs) {
    score += 1;
  }

  // Garante que a pontuação fique entre 0 e 10
  return Math.min(score, 10);
}

/**
 * Analisa detalhadamente uma resposta e retorna os critérios atendidos
 * @param texto - Texto da resposta a ser analisada
 * @returns Objeto com detalhes da análise
 */
export function analyzeIAResponse(texto: string): {
  score: number;
  criteria: ScoreCriteria;
  details: string[];
} {
  const textoLower = texto.toLowerCase();
  const criteria: ScoreCriteria = {
    mentionsIT: false,
    hasTechnicalParagraph: false,
    hasConclusion: false,
    citesSpecificArticles: false,
    usesProperTerminology: false,
    providesExamples: false
  };
  const details: string[] = [];

  // Verifica menção a IT
  const itPattern = /\b(it[- ]?\d{1,3}|instrução técnica[- ]?\d{1,3})\b/i;
  const itMatches = texto.match(itPattern);
  if (itMatches) {
    criteria.mentionsIT = true;
    details.push(`Menciona IT: ${itMatches[0]}`);
  }

  // Verifica parágrafo técnico
  const technicalTerms = [
    'dimensionamento', 'cálculo', 'norma', 'nbr', 'abnt',
    'pressão', 'vazão', 'capacidade', 'resistência', 'classificação'
  ];
  const foundTechnical = technicalTerms.filter(term => textoLower.includes(term));
  if (foundTechnical.length >= 3) {
    criteria.hasTechnicalParagraph = true;
    details.push(`Termos técnicos encontrados: ${foundTechnical.join(', ')}`);
  }

  // Verifica conclusão
  const conclusionKeywords = ['portanto', 'recomenda-se', 'deve-se', 'é necessário'];
  const foundConclusion = conclusionKeywords.find(keyword => textoLower.includes(keyword));
  if (foundConclusion) {
    criteria.hasConclusion = true;
    details.push(`Possui conclusão com: "${foundConclusion}"`);
  }

  // Verifica citação de artigos
  if (/\b(art(igo)?\.?\s*\d+|seção\s*\d+|item\s*\d+)\b/i.test(texto)) {
    criteria.citesSpecificArticles = true;
    details.push('Cita artigos ou seções específicas');
  }

  // Verifica terminologia adequada
  const safetyTerms = ['segurança', 'incêndio', 'emergência', 'proteção'];
  const foundSafety = safetyTerms.filter(term => textoLower.includes(term));
  if (foundSafety.length >= 2) {
    criteria.usesProperTerminology = true;
    details.push(`Usa terminologia de segurança: ${foundSafety.join(', ')}`);
  }

  // Verifica exemplos
  if (/por exemplo|exemplo:|ex:|como:/i.test(texto)) {
    criteria.providesExamples = true;
    details.push('Fornece exemplos práticos');
  }

  const score = scoreIAResponse(texto);

  return {
    score,
    criteria,
    details
  };
}

// AIDEV-SUGGESTION: Função adicional para comparar múltiplas respostas
export function compareIAResponses(responses: string[]): {
  bestIndex: number;
  scores: number[];
  winner: string;
} {
  const scores = responses.map(response => scoreIAResponse(response));
  const bestIndex = scores.indexOf(Math.max(...scores));
  
  return {
    bestIndex,
    scores,
    winner: responses[bestIndex]
  };
}