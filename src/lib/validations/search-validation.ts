// ==============================================================================
// VALIDAÇÕES PARA API DE BUSCA INTELIGENTE
// ==============================================================================

// ==============================================================================
// TIPOS E INTERFACES
// ==============================================================================

interface ValidationResult {
  success: boolean;
  errors: Record<string, string>;
  warnings?: string[];
}

interface SearchAIRequestValidation {
  prompt: string;
  searchTerm: string;
  filters?: {
    categoria?: string;
    severidade?: string;
    tipo?: string;
  };
  options?: {
    useCache?: boolean;
    maxResults?: number;
    includeContext?: boolean;
  };
}

// ==============================================================================
// CONSTANTES DE VALIDAÇÃO
// ==============================================================================

const VALIDATION_RULES = {
  prompt: {
    minLength: 10,
    maxLength: 2000,
    required: true
  },
  searchTerm: {
    minLength: 3,
    maxLength: 200,
    required: true
  },
  maxResults: {
    min: 1,
    max: 50,
    default: 10
  }
};

const ALLOWED_CATEGORIAS = [
  'procedimentos-administrativos',
  'saidas-emergencia',
  'iluminacao-emergencia',
  'extintores',
  'hidrantes',
  'alarme-deteccao',
  'sprinklers',
  'gases',
  'espumas',
  'brigada-incendio',
  'plano-emergencia'
];

const ALLOWED_SEVERIDADES = [
  'LOW',
  'MEDIUM', 
  'HIGH',
  'CRITICAL'
];

const ALLOWED_TIPOS = [
  'normativo',
  'tecnico',
  'procedimental',
  'calculo',
  'projeto'
];

// ==============================================================================
// FUNÇÕES DE VALIDAÇÃO
// ==============================================================================

function validateString(
  value: unknown,
  fieldName: string,
  rules: { minLength?: number; maxLength?: number; required?: boolean; pattern?: RegExp }
): string | null {
  // Verificar se é obrigatório
  if (rules.required && (value === undefined || value === null || value === '')) {
    return `${fieldName} é obrigatório`;
  }

  // Se não é obrigatório e está vazio, permitir
  if (!rules.required && (value === undefined || value === null || value === '')) {
    return null;
  }

  // Verificar se é string
  if (typeof value !== 'string') {
    return `${fieldName} deve ser uma string`;
  }

  // Verificar comprimento mínimo
  if (rules.minLength && value.length < rules.minLength) {
    return `${fieldName} deve ter pelo menos ${rules.minLength} caracteres`;
  }

  // Verificar comprimento máximo
  if (rules.maxLength && value.length > rules.maxLength) {
    return `${fieldName} deve ter no máximo ${rules.maxLength} caracteres`;
  }

  // Verificar padrão regex
  if (rules.pattern && !rules.pattern.test(value)) {
    return `${fieldName} possui formato inválido`;
  }

  return null;
}

function validateNumber(
  value: unknown,
  fieldName: string,
  rules: { min?: number; max?: number; required?: boolean; integer?: boolean }
): string | null {
  // Verificar se é obrigatório
  if (rules.required && (value === undefined || value === null)) {
    return `${fieldName} é obrigatório`;
  }

  // Se não é obrigatório e está vazio, permitir
  if (!rules.required && (value === undefined || value === null)) {
    return null;
  }

  // Verificar se é número
  if (typeof value !== 'number' || isNaN(value)) {
    return `${fieldName} deve ser um número válido`;
  }

  // Verificar se deve ser inteiro
  if (rules.integer && !Number.isInteger(value)) {
    return `${fieldName} deve ser um número inteiro`;
  }

  // Verificar valor mínimo
  if (rules.min !== undefined && value < rules.min) {
    return `${fieldName} deve ser pelo menos ${rules.min}`;
  }

  // Verificar valor máximo
  if (rules.max !== undefined && value > rules.max) {
    return `${fieldName} deve ser no máximo ${rules.max}`;
  }

  return null;
}

function validateEnum<T extends string>(
  value: unknown,
  fieldName: string,
  allowedValues: readonly T[],
  required = false
): string | null {
  // Verificar se é obrigatório
  if (required && (value === undefined || value === null || value === '')) {
    return `${fieldName} é obrigatório`;
  }

  // Se não é obrigatório e está vazio, permitir
  if (!required && (value === undefined || value === null || value === '')) {
    return null;
  }

  // Verificar se é string
  if (typeof value !== 'string') {
    return `${fieldName} deve ser uma string`;
  }

  // Verificar se está na lista de valores permitidos
  if (!allowedValues.includes(value as T)) {
    return `${fieldName} deve ser um dos valores: ${allowedValues.join(', ')}`;
  }

  return null;
}

function sanitizeString(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, ' ') // Múltiplos espaços em um só
    .replace(/[<>]/g, '') // Remover < e > por segurança
    .substring(0, 2000); // Limitar tamanho
}

function containsSqlInjection(value: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(UNION\s+SELECT)/i,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
    /(--|\#|\/\*|\*\/)/,
    /(\bSCRIPT\b.*\>)/i
  ];

  return sqlPatterns.some(pattern => pattern.test(value));
}

function containsXSS(value: string): boolean {
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<object[^>]*>.*?<\/object>/gi,
    /<embed[^>]*>/gi
  ];

  return xssPatterns.some(pattern => pattern.test(value));
}

// ==============================================================================
// VALIDAÇÃO PRINCIPAL
// ==============================================================================

export function validateSearchRequest(data: unknown): ValidationResult {
  const errors: Record<string, string> = {};
  const warnings: string[] = [];

  // Verificar se é um objeto
  if (typeof data !== 'object' || data === null) {
    return {
      success: false,
      errors: { general: 'Dados de entrada devem ser um objeto válido' }
    };
  }

  const request = data as SearchAIRequestValidation;

  // Validar prompt
  const promptError = validateString(request.prompt, 'prompt', VALIDATION_RULES.prompt);
  if (promptError) {
    errors.prompt = promptError;
  } else if (request.prompt) {
    // Verificar segurança
    const sanitizedPrompt = sanitizeString(request.prompt);
    
    if (containsSqlInjection(sanitizedPrompt)) {
      errors.prompt = 'Prompt contém caracteres não permitidos';
    } else if (containsXSS(sanitizedPrompt)) {
      errors.prompt = 'Prompt contém código malicioso';
    }

    // Verificar se prompt é muito genérico
    if (sanitizedPrompt.split(' ').length < 3) {
      warnings.push('Prompt muito genérico. Seja mais específico para melhores resultados.');
    }
  }

  // Validar searchTerm
  const searchTermError = validateString(request.searchTerm, 'searchTerm', VALIDATION_RULES.searchTerm);
  if (searchTermError) {
    errors.searchTerm = searchTermError;
  } else if (request.searchTerm) {
    // Verificar segurança
    const sanitizedSearchTerm = sanitizeString(request.searchTerm);
    
    if (containsSqlInjection(sanitizedSearchTerm)) {
      errors.searchTerm = 'Termo de busca contém caracteres não permitidos';
    } else if (containsXSS(sanitizedSearchTerm)) {
      errors.searchTerm = 'Termo de busca contém código malicioso';
    }
  }

  // Validar filtros se fornecidos
  if (request.filters) {
    if (typeof request.filters !== 'object') {
      errors.filters = 'Filtros devem ser um objeto válido';
    } else {
      // Validar categoria
      const categoriaError = validateEnum(
        request.filters.categoria,
        'categoria',
        ALLOWED_CATEGORIAS
      );
      if (categoriaError) {
        errors['filters.categoria'] = categoriaError;
      }

      // Validar severidade
      const severidadeError = validateEnum(
        request.filters.severidade,
        'severidade',
        ALLOWED_SEVERIDADES
      );
      if (severidadeError) {
        errors['filters.severidade'] = severidadeError;
      }

      // Validar tipo
      const tipoError = validateEnum(
        request.filters.tipo,
        'tipo',
        ALLOWED_TIPOS
      );
      if (tipoError) {
        errors['filters.tipo'] = tipoError;
      }
    }
  }

  // Validar opções se fornecidas
  if (request.options) {
    if (typeof request.options !== 'object') {
      errors.options = 'Opções devem ser um objeto válido';
    } else {
      // Validar useCache
      if (request.options.useCache !== undefined && typeof request.options.useCache !== 'boolean') {
        errors['options.useCache'] = 'useCache deve ser um boolean';
      }

      // Validar maxResults
      const maxResultsError = validateNumber(
        request.options.maxResults,
        'maxResults',
        {
          min: VALIDATION_RULES.maxResults.min,
          max: VALIDATION_RULES.maxResults.max,
          integer: true
        }
      );
      if (maxResultsError) {
        errors['options.maxResults'] = maxResultsError;
      }

      // Validar includeContext
      if (request.options.includeContext !== undefined && typeof request.options.includeContext !== 'boolean') {
        errors['options.includeContext'] = 'includeContext deve ser um boolean';
      }
    }
  }

  return {
    success: Object.keys(errors).length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

// ==============================================================================
// UTILITÁRIOS ADICIONAIS
// ==============================================================================

export function sanitizeSearchRequest(data: SearchAIRequestValidation): SearchAIRequestValidation {
  return {
    prompt: data.prompt ? sanitizeString(data.prompt) : '',
    searchTerm: data.searchTerm ? sanitizeString(data.searchTerm) : '',
    filters: data.filters ? {
      categoria: data.filters.categoria?.trim(),
      severidade: data.filters.severidade?.trim(),
      tipo: data.filters.tipo?.trim()
    } : undefined,
    options: data.options ? {
      useCache: data.options.useCache,
      maxResults: data.options.maxResults || VALIDATION_RULES.maxResults.default,
      includeContext: data.options.includeContext
    } : undefined
  };
}

export function getValidationSummary(result: ValidationResult): string {
  if (result.success) {
    return 'Validação bem-sucedida';
  }

  const errorCount = Object.keys(result.errors).length;
  const warningCount = result.warnings?.length || 0;

  return `Validação falhou: ${errorCount} erro(s)${warningCount > 0 ? `, ${warningCount} aviso(s)` : ''}`;
}

// Exportar constantes para uso externo
export { ALLOWED_CATEGORIAS, ALLOWED_SEVERIDADES, ALLOWED_TIPOS, VALIDATION_RULES };