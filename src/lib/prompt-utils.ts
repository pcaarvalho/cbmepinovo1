// AIDEV-EXPLANATION: Utilitários para manipulação de prompts conforme AIDEV-IMPROVEMENTS.md
// Inclui sanitização e formatação de prompts para consultas de IA

/**
 * Limita um prompt a no máximo 2048 tokens (aproximadamente)
 * Considerando que 1 token ≈ 4 caracteres em português
 * @param prompt - Prompt original
 * @returns Prompt sanitizado e limitado
 */
export function sanitizePrompt(prompt: string): string {
  // AIDEV-EXPLANATION: Remove espaços extras e caracteres problemáticos
  let sanitized = prompt
    .trim()
    .replace(/\s+/g, ' ') // Remove espaços múltiplos
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove caracteres de controle
    .replace(/[<>]/g, ''); // Remove caracteres que podem ser interpretados como HTML
  
  // Limita a aproximadamente 2048 tokens (8192 caracteres)
  const maxChars = 8192;
  if (sanitized.length > maxChars) {
    // AIDEV-SUGGESTION: Corta no último espaço completo antes do limite
    const cutPosition = sanitized.lastIndexOf(' ', maxChars);
    sanitized = sanitized.substring(0, cutPosition > 0 ? cutPosition : maxChars);
    sanitized += '...'; // Indica que foi truncado
  }
  
  return sanitized;
}

/**
 * Formata um prompt para pesquisa com estrutura padrão
 * @param pergunta - Pergunta do usuário
 * @param contexto - Contexto adicional opcional
 * @returns Prompt formatado com contexto, pergunta e instruções
 */
export function formatPromptForSearch(pergunta: string, contexto?: string): string {
  // AIDEV-EXPLANATION: Estrutura padrão para melhorar qualidade das respostas
  const contextoPadrao = contexto || 
    'Você é um especialista em Instruções Técnicas (ITs) do Corpo de Bombeiros do Piauí (CB-PI). ' +
    'Suas respostas devem ser precisas, técnicas e baseadas nas normas vigentes.';
  
  const instrucoes = `
INSTRUÇÕES:
1. Responda de forma clara e objetiva
2. Cite sempre o número da IT relevante quando aplicável
3. Use linguagem técnica apropriada
4. Se não tiver certeza, indique que é necessário consultar a IT específica
5. Forneça exemplos práticos quando possível
`;

  const promptFormatado = `
CONTEXTO:
${contextoPadrao}

PERGUNTA:
${pergunta}

${instrucoes}

RESPOSTA:`;

  // Aplica sanitização ao prompt final
  return sanitizePrompt(promptFormatado);
}

/**
 * Extrai palavras-chave relevantes de uma pergunta para otimizar busca
 * @param pergunta - Pergunta do usuário
 * @returns Array de palavras-chave relevantes
 */
export function extractKeywords(pergunta: string): string[] {
  // AIDEV-SUGGESTION: Lista de palavras comuns a serem ignoradas
  const stopWords = new Set([
    'o', 'a', 'os', 'as', 'um', 'uma', 'de', 'da', 'do', 'dos', 'das',
    'em', 'no', 'na', 'nos', 'nas', 'por', 'para', 'com', 'sem',
    'que', 'qual', 'quais', 'como', 'quando', 'onde', 'porque',
    'é', 'são', 'foi', 'foram', 'ser', 'estar', 'ter', 'haver'
  ]);

  // AIDEV-EXPLANATION: Termos técnicos importantes para manter
  const technicalTerms = new Set([
    'it', 'its', 'instrução', 'técnica', 'norma', 'nbr', 'cb-pi',
    'extintor', 'hidrante', 'saída', 'emergência', 'iluminação',
    'alarme', 'detecção', 'memorial', 'projeto', 'vistoria'
  ]);

  const words = pergunta
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ') // Remove pontuação exceto hífens
    .split(/\s+/)
    .filter(word => {
      // Mantém palavras técnicas ou palavras com mais de 3 caracteres que não sejam stopwords
      return (technicalTerms.has(word) || (word.length > 3 && !stopWords.has(word)));
    });

  // Remove duplicatas e retorna
  return [...new Set(words)];
}

/**
 * Valida se um prompt é adequado para processamento
 * @param prompt - Prompt a ser validado
 * @returns Objeto com status de validação e mensagem de erro se aplicável
 */
export function validatePrompt(prompt: string): { isValid: boolean; error?: string } {
  if (!prompt || prompt.trim().length === 0) {
    return { isValid: false, error: 'Prompt não pode estar vazio' };
  }

  if (prompt.trim().length < 10) {
    return { isValid: false, error: 'Pergunta muito curta. Por favor, forneça mais detalhes.' };
  }

  if (prompt.length > 10000) {
    return { isValid: false, error: 'Pergunta muito longa. Por favor, seja mais conciso.' };
  }

  // AIDEV-SUGGESTION: Verificação básica de spam/repetição
  const uniqueChars = new Set(prompt.toLowerCase()).size;
  if (uniqueChars < 5) {
    return { isValid: false, error: 'Pergunta inválida detectada' };
  }

  return { isValid: true };
}