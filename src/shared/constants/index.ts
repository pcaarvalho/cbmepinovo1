// ==============================================================================
// APPLICATION CONSTANTS
// ==============================================================================

export const APP_CONFIG = {
  NAME: 'CB-PI Instruções Técnicas',
  VERSION: '2.0.0',
  DESCRIPTION: 'Sistema de consulta inteligente de Instruções Técnicas do Corpo de Bombeiros do Piauí',
  BASE_URL: process.env.SITE_URL || 'http://localhost:3000',
} as const;

export const API_CONFIG = {
  BASE_PATH: '/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  CACHE_TTL: 300, // 5 minutes
} as const;

export const SEARCH_CONFIG = {
  MIN_QUERY_LENGTH: 2,
  MAX_RESULTS: 50,
  DEFAULT_LIMIT: 10,
  SUGGESTION_LIMIT: 5,
  DEBOUNCE_DELAY: 300,
} as const;

export const ANALYSIS_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_FORMATS: ['pdf', 'doc', 'docx'],
  PROCESSING_TIMEOUT: 60000, // 1 minute
} as const;

export const CATEGORIES = {
  GERAL: 'Procedimentos Gerais',
  SAIDAS: 'Saídas de Emergência',
  ILUMINACAO: 'Iluminação e Sinalização',
  EXTINTORES: 'Sistemas de Extintores',
  HIDRANTES: 'Sistemas de Hidrantes',
  DIVERSOS: 'Diversos',
} as const;

export const SEVERITY_LABELS = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  CRITICAL: 'Crítica',
} as const;

export const STATUS_LABELS = {
  PENDING: 'Pendente',
  PROCESSING: 'Processando',
  COMPLETED: 'Concluído',
  FAILED: 'Falha',
  CANCELLED: 'Cancelado',
} as const;

export const VERIFICATION_RESULT_LABELS = {
  CONFORME: 'Conforme',
  NAO_CONFORME: 'Não Conforme',
  NAO_APLICAVEL: 'Não Aplicável',
  PARCIAL: 'Parcialmente Conforme',
  PENDENTE: 'Pendente',
} as const;

export const ROUTES = {
  HOME: '/',
  SEARCH: '/pesquisar',
  LIBRARY: '/biblioteca',
  ANALYSIS: '/memorial',
  HELP: '/ajuda',
  API: {
    INSTRUCTIONS: '/api/routes/instrucoes',
    SEARCH: '/api/routes/pesquisa',
    ANALYSIS: '/api/routes/analise',
    SEARCH_AI: '/api/routes/search-ai',
    CHAT_AI: '/api/routes/chat-ai',
  },
} as const;

export const COLORS = {
  PRIMARY: '#dc2626', // red-600
  PRIMARY_DARK: '#991b1b', // red-800
  PRIMARY_LIGHT: '#fecaca', // red-200
  SUCCESS: '#16a34a', // green-600
  WARNING: '#ca8a04', // yellow-600
  ERROR: '#dc2626', // red-600
  INFO: '#2563eb', // blue-600
} as const;

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;