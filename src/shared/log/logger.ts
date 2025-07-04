// AIDEV-EXPLANATION: Logger simples criado conforme solicitado em AIDEV-IMPROVEMENTS.md
// Usa console.log com prefixos e timestamps para facilitar debug

/**
 * Formata timestamp para logs
 */
function getTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Registra informações gerais do sistema
 * @param message - Mensagem a ser registrada
 * @param data - Dados adicionais opcionais
 */
export function logInfo(message: string, data?: any): void {
  console.log(`[INFO] ${getTimestamp()} - ${message}`, data || '');
}

/**
 * Registra erros do sistema
 * @param message - Mensagem de erro
 * @param error - Objeto de erro ou dados adicionais
 */
export function logError(message: string, error?: any): void {
  console.error(`[ERROR] ${getTimestamp()} - ${message}`, error || '');
}

/**
 * Registra informações específicas de IA/OpenRouter
 * @param message - Mensagem relacionada à IA
 * @param details - Detalhes da operação (modelo, tokens, tempo de resposta, etc)
 */
export function logIA(message: string, details?: {
  model?: string;
  prompt?: string;
  response?: string;
  tokens?: number;
  responseTime?: number;
  error?: any;
}): void {
  const prefix = details?.error ? '[IA-ERROR]' : '[IA]';
  console.log(`${prefix} ${getTimestamp()} - ${message}`, {
    ...(details && {
      model: details.model,
      promptLength: details.prompt?.length,
      responseLength: details.response?.length,
      tokens: details.tokens,
      responseTimeMs: details.responseTime,
      ...(details.error && { error: details.error })
    })
  });
}

// AIDEV-SUGGESTION: Futuramente pode ser expandido para usar winston ou outro logger mais robusto