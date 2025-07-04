// AIDEV-EXPLANATION: Validador de qualidade para respostas da IA superinteligente
// Garante que todas as respostas atendam aos padrões definidos em CLAUDE.md

import { scoreIAResponse, analyzeIAResponse } from '../core/analysis/ai-score';
import { logIA, logError } from '../shared/log/logger';

/**
 * Critérios de validação de qualidade
 */
interface QualityCriteria {
  hasBaseLegal: boolean;
  hasApplicability: boolean;
  hasTechnicalAlert: boolean;
  hasOfficialReference: boolean;
  citesSpecificIT: boolean;
  usesProperFormatting: boolean;
  isCoherent: boolean;
  isComplete: boolean;
  avoidsForbiddenContent: boolean;
  followsInstitutionalTone: boolean;
}

/**
 * Resultado da validação
 */
interface ValidationResult {
  isValid: boolean;
  score: number;
  criteria: QualityCriteria;
  issues: ValidationIssue[];
  suggestions: string[];
  requiredCorrections: string[];
}

/**
 * Problema identificado na validação
 */
interface ValidationIssue {
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  description: string;
  location?: string;
}

/**
 * Configuração de validação
 */
interface ValidationConfig {
  strictMode: boolean;
  minScore: number;
  requireAllSections: boolean;
  allowGenericContent: boolean;
}

// Configuração padrão
const DEFAULT_CONFIG: ValidationConfig = {
  strictMode: true,
  minScore: 7,
  requireAllSections: false,
  allowGenericContent: false
};

/**
 * Valida a qualidade de uma resposta de IA
 * @param response - Resposta a ser validada
 * @param question - Pergunta original
 * @param config - Configuração de validação
 * @returns Resultado da validação
 */
export function validateResponseQuality(
  response: string,
  question: string,
  config: ValidationConfig = DEFAULT_CONFIG
): ValidationResult {
  // AIDEV-EXPLANATION: Executa validações em múltiplas camadas
  
  const criteria = evaluateCriteria(response, question);
  const issues = identifyIssues(response, criteria, config);
  const score = calculateQualityScore(response, criteria, issues);
  const suggestions = generateSuggestions(criteria, issues);
  const requiredCorrections = identifyRequiredCorrections(issues, config);
  
  const isValid = determineValidity(score, issues, config);
  
  // Log da validação
  logIA('Resposta validada', {
    response: response.substring(0, 100),
    model: 'validator',
    tokens: response.length / 4
  });
  
  return {
    isValid,
    score,
    criteria,
    issues,
    suggestions,
    requiredCorrections
  };
}

/**
 * Avalia critérios de qualidade
 * @param response - Resposta a validar
 * @param question - Pergunta original
 * @returns Critérios avaliados
 */
function evaluateCriteria(response: string, question: string): QualityCriteria {
  return {
    hasBaseLegal: checkBaseLegal(response),
    hasApplicability: checkApplicability(response),
    hasTechnicalAlert: checkTechnicalAlert(response),
    hasOfficialReference: checkOfficialReference(response),
    citesSpecificIT: checkITCitation(response),
    usesProperFormatting: checkFormatting(response),
    isCoherent: checkCoherence(response, question),
    isComplete: checkCompleteness(response, question),
    avoidsForbiddenContent: checkForbiddenContent(response),
    followsInstitutionalTone: checkInstitutionalTone(response)
  };
}

/**
 * Verifica presença de base legal
 * @param response - Resposta
 * @returns true se contém base legal
 */
function checkBaseLegal(response: string): boolean {
  const patterns = [
    /🧠\s*\*\*Base Legal\*\*/i,
    /base legal:/i,
    /de acordo com (?:a |as )?(?:IT|instrução técnica)/i,
    /conforme (?:a |as )?(?:IT|instrução técnica)/i,
    /estabelecido (?:na|pela) (?:IT|instrução técnica)/i
  ];
  
  return patterns.some(pattern => pattern.test(response));
}

/**
 * Verifica presença de aplicabilidade prática
 * @param response - Resposta
 * @returns true se contém aplicabilidade
 */
function checkApplicability(response: string): boolean {
  const patterns = [
    /📌\s*\*\*Aplicabilidade Prática\*\*/i,
    /na prática/i,
    /aplicação:/i,
    /como aplicar/i,
    /procedimento/i,
    /deve-se/i,
    /recomenda-se/i
  ];
  
  return patterns.some(pattern => pattern.test(response));
}

/**
 * Verifica presença de alerta técnico
 * @param response - Resposta
 * @returns true se contém alerta
 */
function checkTechnicalAlert(response: string): boolean {
  const patterns = [
    /⚠️\s*\*\*Alerta Técnico\*\*/i,
    /atenção:/i,
    /importante:/i,
    /cuidado:/i,
    /observ(?:e|ação):/i,
    /exceção:/i
  ];
  
  return patterns.some(pattern => pattern.test(response));
}

/**
 * Verifica presença de referência oficial
 * @param response - Resposta
 * @returns true se contém referência
 */
function checkOfficialReference(response: string): boolean {
  const patterns = [
    /📄\s*\*\*Referência Oficial\*\*/i,
    /consulte (?:a |as )?(?:IT|instrução técnica)/i,
    /para (?:mais )?informações/i,
    /referência:/i,
    /veja também/i
  ];
  
  return patterns.some(pattern => pattern.test(response));
}

/**
 * Verifica citação específica de IT
 * @param response - Resposta
 * @returns true se cita IT específica
 */
function checkITCitation(response: string): boolean {
  const itPattern = /\b(?:IT[- ]?\d{1,3}|Instrução Técnica[- ]?\d{1,3})\b/i;
  return itPattern.test(response);
}

/**
 * Verifica formatação adequada
 * @param response - Resposta
 * @returns true se bem formatado
 */
function checkFormatting(response: string): boolean {
  const hasHeaders = /\*\*[^*]+\*\*/g.test(response);
  const hasParagraphs = response.split('\n\n').length > 1;
  const hasStructure = response.includes('**') || response.includes('##');
  
  return hasHeaders || hasParagraphs || hasStructure;
}

/**
 * Verifica coerência com a pergunta
 * @param response - Resposta
 * @param question - Pergunta
 * @returns true se coerente
 */
function checkCoherence(response: string, question: string): boolean {
  // AIDEV-EXPLANATION: Extrai palavras-chave da pergunta
  const questionKeywords = question
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 4);
  
  // Verifica se resposta contém palavras-chave relevantes
  const responseText = response.toLowerCase();
  const matchCount = questionKeywords.filter(keyword => 
    responseText.includes(keyword)
  ).length;
  
  // Pelo menos 30% das palavras-chave devem estar presentes
  return matchCount >= questionKeywords.length * 0.3;
}

/**
 * Verifica completude da resposta
 * @param response - Resposta
 * @param question - Pergunta
 * @returns true se completa
 */
function checkCompleteness(response: string, question: string): boolean {
  // Resposta muito curta provavelmente é incompleta
  if (response.length < 200) return false;
  
  // Verifica se tem conclusão
  const hasConclusion = /portanto|assim|dessa forma|em resumo|concluindo/i.test(response);
  
  // Verifica se tem múltiplas seções
  const sections = response.split(/\n\n/).filter(s => s.trim().length > 0);
  
  return hasConclusion || sections.length >= 3;
}

/**
 * Verifica conteúdo proibido
 * @param response - Resposta
 * @returns true se não contém conteúdo proibido
 */
function checkForbiddenContent(response: string): boolean {
  // AIDEV-EXPLANATION: Lista de conteúdos que não devem aparecer
  const forbiddenPatterns = [
    /distância.*terra.*sol/i,
    /golfe.*jetta/i,
    /não.*posso.*ajudar/i,
    /fora.*do.*escopo/i,
    /não.*tenho.*informação/i
  ];
  
  // Retorna false se encontrar conteúdo proibido
  return !forbiddenPatterns.some(pattern => pattern.test(response));
}

/**
 * Verifica tom institucional
 * @param response - Resposta
 * @returns true se segue tom adequado
 */
function checkInstitutionalTone(response: string): boolean {
  // Deve mencionar CBMEPI ou Corpo de Bombeiros
  const mentionsInstitution = /CB[-\s]?PI|Corpo de Bombeiros.*Piauí/i.test(response);
  
  // Não deve ter linguagem informal demais
  const informalPatterns = /\b(oi|olá|tchau|beleza|valeu|né|tá)\b/i;
  const hasInformalLanguage = informalPatterns.test(response);
  
  // Deve usar tratamento formal
  const formalTreatment = /você|senhor|senhora/i.test(response);
  
  return (mentionsInstitution || formalTreatment) && !hasInformalLanguage;
}

/**
 * Identifica problemas na resposta
 * @param response - Resposta
 * @param criteria - Critérios avaliados
 * @param config - Configuração
 * @returns Lista de problemas
 */
function identifyIssues(
  response: string, 
  criteria: QualityCriteria,
  config: ValidationConfig
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  
  // AIDEV-EXPLANATION: Verifica cada critério e adiciona issues
  
  if (!criteria.hasBaseLegal) {
    issues.push({
      severity: 'high',
      category: 'structure',
      description: 'Falta seção de Base Legal com citação de ITs'
    });
  }
  
  if (!criteria.citesSpecificIT) {
    issues.push({
      severity: 'high',
      category: 'content',
      description: 'Não cita nenhuma IT específica'
    });
  }
  
  if (!criteria.hasApplicability && config.requireAllSections) {
    issues.push({
      severity: 'medium',
      category: 'structure',
      description: 'Falta seção de Aplicabilidade Prática'
    });
  }
  
  if (!criteria.usesProperFormatting) {
    issues.push({
      severity: 'low',
      category: 'formatting',
      description: 'Formatação inadequada - use markdown e seções'
    });
  }
  
  if (!criteria.isCoherent) {
    issues.push({
      severity: 'critical',
      category: 'content',
      description: 'Resposta não é coerente com a pergunta'
    });
  }
  
  if (!criteria.isComplete) {
    issues.push({
      severity: 'medium',
      category: 'content',
      description: 'Resposta parece incompleta ou muito superficial'
    });
  }
  
  if (!criteria.avoidsForbiddenContent) {
    issues.push({
      severity: 'critical',
      category: 'policy',
      description: 'Contém conteúdo fora do domínio CBMEPI'
    });
  }
  
  if (!criteria.followsInstitutionalTone) {
    issues.push({
      severity: 'medium',
      category: 'tone',
      description: 'Tom não segue padrão institucional esperado'
    });
  }
  
  return issues;
}

/**
 * Calcula score de qualidade
 * @param response - Resposta
 * @param criteria - Critérios
 * @param issues - Problemas identificados
 * @returns Score de 0 a 10
 */
function calculateQualityScore(
  response: string,
  criteria: QualityCriteria,
  issues: ValidationIssue[]
): number {
  // Começa com score base do ai-score
  let score = scoreIAResponse(response);
  
  // AIDEV-EXPLANATION: Ajusta baseado em critérios específicos
  
  // Penaliza por issues críticas
  const criticalIssues = issues.filter(i => i.severity === 'critical').length;
  score -= criticalIssues * 3;
  
  // Penaliza por issues altas
  const highIssues = issues.filter(i => i.severity === 'high').length;
  score -= highIssues * 1.5;
  
  // Bonus por completude
  if (criteria.hasBaseLegal && criteria.hasApplicability && 
      criteria.hasTechnicalAlert && criteria.hasOfficialReference) {
    score += 1; // Bonus por ter todas as seções
  }
  
  // Garante score entre 0 e 10
  return Math.max(0, Math.min(10, score));
}

/**
 * Gera sugestões de melhoria
 * @param criteria - Critérios avaliados
 * @param issues - Problemas identificados
 * @returns Lista de sugestões
 */
function generateSuggestions(
  criteria: QualityCriteria,
  issues: ValidationIssue[]
): string[] {
  const suggestions: string[] = [];
  
  // AIDEV-EXPLANATION: Sugestões baseadas nos problemas
  
  if (!criteria.hasBaseLegal) {
    suggestions.push('Adicione uma seção "🧠 **Base Legal**" citando as ITs aplicáveis');
  }
  
  if (!criteria.citesSpecificIT) {
    suggestions.push('Cite pelo menos uma IT específica (ex: IT-008, IT-021)');
  }
  
  if (!criteria.hasApplicability) {
    suggestions.push('Inclua uma seção "📌 **Aplicabilidade Prática**" com exemplos');
  }
  
  if (!criteria.hasTechnicalAlert && issues.some(i => i.category === 'content')) {
    suggestions.push('Considere adicionar "⚠️ **Alerta Técnico**" para pontos importantes');
  }
  
  if (!criteria.usesProperFormatting) {
    suggestions.push('Use markdown para melhor formatação (**, ##, listas)');
  }
  
  if (!criteria.isComplete) {
    suggestions.push('Desenvolva mais a resposta com detalhes técnicos relevantes');
  }
  
  return suggestions;
}

/**
 * Identifica correções obrigatórias
 * @param issues - Problemas identificados
 * @param config - Configuração
 * @returns Lista de correções necessárias
 */
function identifyRequiredCorrections(
  issues: ValidationIssue[],
  config: ValidationConfig
): string[] {
  const corrections: string[] = [];
  
  // AIDEV-EXPLANATION: Correções obrigatórias para issues críticas e altas
  
  issues
    .filter(i => i.severity === 'critical' || i.severity === 'high')
    .forEach(issue => {
      switch (issue.category) {
        case 'content':
          if (issue.description.includes('IT')) {
            corrections.push('OBRIGATÓRIO: Citar IT específica relevante');
          }
          if (issue.description.includes('coerente')) {
            corrections.push('OBRIGATÓRIO: Refazer resposta focando na pergunta');
          }
          break;
          
        case 'structure':
          corrections.push('OBRIGATÓRIO: Adicionar seção de Base Legal');
          break;
          
        case 'policy':
          corrections.push('OBRIGATÓRIO: Remover conteúdo fora do escopo CBMEPI');
          break;
      }
    });
  
  return [...new Set(corrections)]; // Remove duplicatas
}

/**
 * Determina se resposta é válida
 * @param score - Score calculado
 * @param issues - Problemas identificados
 * @param config - Configuração
 * @returns true se válida
 */
function determineValidity(
  score: number,
  issues: ValidationIssue[],
  config: ValidationConfig
): boolean {
  // Invalida se tiver issues críticas
  if (issues.some(i => i.severity === 'critical')) {
    return false;
  }
  
  // Invalida se score abaixo do mínimo
  if (score < config.minScore) {
    return false;
  }
  
  // Em modo strict, invalida com issues altas
  if (config.strictMode && issues.some(i => i.severity === 'high')) {
    return false;
  }
  
  return true;
}

/**
 * Corrige automaticamente problemas simples
 * @param response - Resposta original
 * @param validation - Resultado da validação
 * @returns Resposta corrigida ou null se não for possível
 */
export function autoCorrectResponse(
  response: string,
  validation: ValidationResult
): string | null {
  if (validation.isValid) return null; // Não precisa correção
  
  let corrected = response;
  let wasModified = false;
  
  // AIDEV-EXPLANATION: Tenta correções automáticas simples
  
  // Adiciona estrutura básica se faltar
  if (!validation.criteria.hasBaseLegal && validation.criteria.citesSpecificIT) {
    const itMatch = response.match(/\b(IT[- ]?\d{1,3})\b/i);
    if (itMatch) {
      corrected = `🧠 **Base Legal**\nDe acordo com a ${itMatch[0]}:\n\n${corrected}`;
      wasModified = true;
    }
  }
  
  // Adiciona referência oficial se faltar
  if (!validation.criteria.hasOfficialReference && validation.criteria.citesSpecificIT) {
    corrected += '\n\n📄 **Referência Oficial**\nConsulte a Instrução Técnica completa do CBMEPI para informações detalhadas.';
    wasModified = true;
  }
  
  // Se não conseguiu corrigir o suficiente, retorna null
  if (!wasModified || validation.issues.some(i => i.severity === 'critical')) {
    return null;
  }
  
  // Revalida para ver se melhorou
  const revalidation = validateResponseQuality(corrected, '');
  if (revalidation.score > validation.score) {
    logIA('Resposta auto-corrigida', {
      response: corrected.substring(0, 100),
      model: 'auto-corrector'
    });
    return corrected;
  }
  
  return null;
}

// AIDEV-SUGGESTION: Exporta tipos para uso externo
export { QualityCriteria, ValidationResult, ValidationIssue, ValidationConfig };