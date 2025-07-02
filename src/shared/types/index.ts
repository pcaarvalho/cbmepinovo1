// ==============================================================================
// CORE DOMAIN TYPES
// ==============================================================================

export interface InstrucaoTecnica {
  id: string;
  numero: string;
  titulo: string;
  descricao: string;
  categoria: string;
  subcategoria?: string;
  conteudo: string;
  versao: string;
  dataPublicacao: string;
  ultimaRevisao: string;
  proximaRevisao?: string;
  arquivo: string;
  tamanhoArquivo?: number;
  hashArquivo?: string;
  tags: string[];
  palavrasChave: string[];
  popular: boolean;
  visualizacoes: number;
  downloads: number;
  isActive: boolean;
  metadata: Record<string, unknown>;
  organizationId: string;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoriaIT {
  id: string;
  nome: string;
  descricao: string;
  icone: string;
  count: number;
  subcategorias?: SubcategoriaIT[];
}

export interface SubcategoriaIT {
  id: string;
  nome: string;
  descricao: string;
  count: number;
}

export interface ResultadoAnalise {
  id: string;
  nomeArquivo: string;
  tamanhoArquivo?: number;
  hashArquivo?: string;
  dataAnalise: string;
  conformidade: number;
  status: AnalysisStatus;
  observacoes?: string;
  tempoProcessamento?: number;
  versaoAlgoritmo?: string;
  metadados: Record<string, unknown>;
  userId: string;
  user: User;
  instructionId?: string;
  instruction?: InstrucaoTecnica;
  organizationId: string;
  itensVerificados: ItemVerificacao[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface ItemVerificacao {
  id: string;
  item: string;
  resultado: VerificationResult;
  observacao?: string;
  itReferencia?: string;
  severidade: Severity;
  linha?: number;
  coluna?: number;
  contexto?: string;
  sugestao?: string;
  analiseId: string;
  createdAt: string;
}

// ==============================================================================
// AUTHENTICATION & AUTHORIZATION TYPES
// ==============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  position?: string;
  department?: string;
  isActive: boolean;
  lastLoginAt?: string;
  loginCount: number;
  organizationId: string;
  organization: Organization;
  roles: UserRole[];
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  logo?: string;
  settings: OrganizationSettings;
  isActive: boolean;
  subscription?: Subscription;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationSettings {
  features: {
    analytics: boolean;
    collaboration: boolean;
    api: boolean;
    customBranding: boolean;
    sso: boolean;
  };
  limits: {
    users: number;
    storage: number; // in GB
    apiCalls: number;
  };
  branding: {
    primaryColor: string;
    logoUrl?: string;
    customDomain?: string;
  };
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  isSystem: boolean;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  role: Role;
  createdAt: string;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: string;
  createdAt: string;
}

// ==============================================================================
// SEARCH & FILTERING TYPES
// ==============================================================================

export interface FiltrosPesquisa {
  categoria?: string;
  subcategoria?: string;
  dataInicio?: string;
  dataFim?: string;
  tags?: string[];
  palavrasChave?: string[];
  termo?: string;
  popular?: boolean;
  status?: string;
  autor?: string;
  organizacao?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult<T = unknown> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    applied: Record<string, unknown>;
    available: Record<string, FilterOption[]>;
  };
  facets?: SearchFacet[];
  suggestions?: string[];
  searchTime: number;
}

// ==============================================================================
// INTELLIGENT SEARCH TYPES (OpenRouter Integration)
// ==============================================================================

export interface SearchResponse {
  query_understood: string;
  intent: 'navigation' | 'information' | 'action' | 'support';
  category: string[];
  suggestions: string[];
  direct_answer?: string;
  relevant_features?: string[];
  confidence: number;
}

export interface SearchFacet {
  field: string;
  label: string;
  values: Array<{
    value: string;
    label: string;
    count: number;
  }>;
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

// ==============================================================================
// COLLABORATION TYPES
// ==============================================================================

export interface Comment {
  id: string;
  content: string;
  isResolved: boolean;
  userId: string;
  user: User;
  instructionId?: string;
  analysisId?: string;
  parentId?: string;
  replies: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Annotation {
  id: string;
  content: string;
  position: AnnotationPosition;
  color: string;
  isPrivate: boolean;
  userId: string;
  user: User;
  instructionId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnnotationPosition {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Favorite {
  id: string;
  userId: string;
  instructionId: string;
  instruction: InstrucaoTecnica;
  createdAt: string;
}

// ==============================================================================
// NOTIFICATION TYPES
// ==============================================================================

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  data: Record<string, unknown>;
  isRead: boolean;
  userId: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  type: SubscriptionType;
  filter: Record<string, unknown>;
  isActive: boolean;
  organizationId: string;
  createdAt: string;
}

// ==============================================================================
// ANALYTICS & MONITORING TYPES
// ==============================================================================

export interface AuditLog {
  id: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  metadata: Record<string, unknown>;
  userId?: string;
  user?: User;
  organizationId: string;
  createdAt: string;
}

export interface Analytics {
  id: string;
  event: string;
  data: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface HealthCheck {
  id: string;
  service: string;
  status: HealthStatus;
  latency?: number;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface SystemMetrics {
  timestamp: string;
  cpu: {
    usage: number;
    load: number[];
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
  };
  database: {
    connections: number;
    activeQueries: number;
    slowQueries: number;
    avgResponseTime: number;
  };
  cache: {
    hitRate: number;
    size: number;
    evictions: number;
  };
}

// ==============================================================================
// API TYPES
// ==============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

export interface ApiPaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface WebSocketMessage {
  type: string;
  payload: Record<string, unknown>;
  timestamp: string;
  userId?: string;
  sessionId?: string;
}

// ==============================================================================
// FORM TYPES
// ==============================================================================

export interface FormState<T = Record<string, unknown>> {
  data: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  touchedFields: Record<string, boolean>;
}

export interface FileUploadState {
  file?: File;
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
}

// ==============================================================================
// ENUMS
// ==============================================================================

export enum AnalysisStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export enum VerificationResult {
  CONFORME = 'CONFORME',
  NAO_CONFORME = 'NAO_CONFORME',
  NAO_APLICAVEL = 'NAO_APLICAVEL',
  PARCIAL = 'PARCIAL',
  PENDENTE = 'PENDENTE'
}

export enum Severity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum NotificationType {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
  SYSTEM = 'SYSTEM'
}

export enum SubscriptionType {
  NEW_INSTRUCTION = 'NEW_INSTRUCTION',
  INSTRUCTION_UPDATE = 'INSTRUCTION_UPDATE',
  ANALYSIS_COMPLETE = 'ANALYSIS_COMPLETE',
  SYSTEM_ALERT = 'SYSTEM_ALERT'
}

export enum HealthStatus {
  HEALTHY = 'HEALTHY',
  DEGRADED = 'DEGRADED',
  DOWN = 'DOWN'
}

export enum UserRoleType {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ORG_ADMIN = 'ORG_ADMIN',
  MANAGER = 'MANAGER',
  ANALYST = 'ANALYST', 
  VIEWER = 'VIEWER'
}

export enum PermissionType {
  // Instructions
  INSTRUCTIONS_READ = 'INSTRUCTIONS_READ',
  INSTRUCTIONS_CREATE = 'INSTRUCTIONS_CREATE',
  INSTRUCTIONS_UPDATE = 'INSTRUCTIONS_UPDATE',
  INSTRUCTIONS_DELETE = 'INSTRUCTIONS_DELETE',
  
  // Analysis
  ANALYSIS_READ = 'ANALYSIS_READ',
  ANALYSIS_CREATE = 'ANALYSIS_CREATE',
  ANALYSIS_DELETE = 'ANALYSIS_DELETE',
  
  // Users
  USERS_READ = 'USERS_READ',
  USERS_CREATE = 'USERS_CREATE',
  USERS_UPDATE = 'USERS_UPDATE',
  USERS_DELETE = 'USERS_DELETE',
  
  // Analytics
  ANALYTICS_READ = 'ANALYTICS_READ',
  ANALYTICS_EXPORT = 'ANALYTICS_EXPORT',
  
  // System
  SYSTEM_CONFIG = 'SYSTEM_CONFIG',
  AUDIT_LOGS = 'AUDIT_LOGS'
}