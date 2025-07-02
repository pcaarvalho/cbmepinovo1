// ==============================================================================
// TYPES - ANALYSIS DOMAIN
// ==============================================================================

import { User } from './auth';
import { InstrucaoTecnica } from './instructions';

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
  user?: User;
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

export interface ComplianceAnalysisResult {
  items: ItemVerificacao[];
  summary: {
    total: number;
    conforme: number;
    naoConforme: number;
    naoAplicavel: number;
    parcial: number;
    pendente: number;
  };
  recommendations: string[];
  criticalIssues: ItemVerificacao[];
}

export interface AnalysisFilter {
  userId?: string;
  status?: AnalysisStatus;
  conformidadeMin?: number;
  conformidadeMax?: number;
  dataInicio?: string;
  dataFim?: string;
  limit?: number;
  offset?: number;
}

export interface AnalysisStatistics {
  totalAnalyses: number;
  avgConformidade: number;
  topIssues: Array<{
    item: string;
    frequency: number;
    severidade: Severity;
  }>;
  trendsOverTime: Array<{
    month: string;
    totalAnalyses: number;
    avgConformidade: number;
  }>;
  complianceDistribution: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
}

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

export interface Comment {
  id: string;
  content: string;
  isResolved: boolean;
  userId: string;
  user?: User;
  instructionId?: string;
  analysisId?: string;
  parentId?: string;
  replies: Comment[];
  createdAt: string;
  updatedAt: string;
}