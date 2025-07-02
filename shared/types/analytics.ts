/**
 * Tipos específicos para o sistema de analytics de busca
 */

export interface SearchAnalyticsEvent {
  id: string;
  type: 'search' | 'click' | 'suggestion_used' | 'result_viewed';
  userId?: string;
  sessionId: string;
  organizationId?: string;
  timestamp: Date;
  data: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface SearchMetrics {
  totalSearches: number;
  uniqueUsers: number;
  avgResultsPerSearch: number;
  avgSearchDuration: number;
  clickThroughRate: number;
  bounceRate: number;
  popularQueries: string[];
  topCategories: string[];
}

export interface SearchTrendData {
  date: string;
  searches: number;
  clicks: number;
  suggestions: number;
  newUsers: number;
}

export interface CategoryAnalytics {
  category: string;
  label: string;
  searchCount: number;
  clickRate: number;
  avgResults: number;
  topQueries: string[];
  trend: 'up' | 'down' | 'stable';
}

export interface UserSearchBehavior {
  userId: string;
  totalSearches: number;
  avgSessionDuration: number;
  topCategories: string[];
  searchFrequency: 'high' | 'medium' | 'low';
  lastActiveDate: Date;
  preferredTopics: string[];
}

export interface SuggestionEffectiveness {
  suggestion: string;
  type: 'contextual' | 'popular' | 'related' | 'autocomplete' | 'typo';
  usageCount: number;
  acceptanceRate: number;
  avgImprovementScore: number;
  categories: string[];
}

export interface SearchSessionAnalytics {
  sessionId: string;
  userId?: string;
  startTime: Date;
  endTime: Date;
  searchCount: number;
  clickCount: number;
  suggestionsUsed: number;
  categories: string[];
  successful: boolean;
  bounced: boolean;
}

// Interfaces para API responses
export interface SearchAnalyticsResponse {
  success: boolean;
  data?: {
    metrics: SearchMetrics;
    trends: SearchTrendData[];
    categories: CategoryAnalytics[];
    recentActivity: SearchAnalyticsEvent[];
  };
  error?: string;
}

export interface TopTermsResponse {
  success: boolean;
  data?: {
    period: string;
    totalTerms: number;
    totalSearches: number;
    avgClickRate: number;
    terms: Array<{
      term: string;
      frequency: number;
      clickRate: number;
      avgResults: number;
      avgDuration: number;
      successRate: number;
      category?: string;
      relatedTerms: string[];
      trend: 'up' | 'down' | 'stable';
      lastUsed: string;
    }>;
    categories: Array<{
      category: string;
      label: string;
      count: number;
      percentage: number;
    }>;
  };
  error?: string;
}

// Enum para tipos de eventos
export enum AnalyticsEventType {
  SEARCH_EXECUTED = 'search_executed',
  SEARCH_CLICKED = 'search_clicked',
  SUGGESTION_USED = 'suggestion_used',
  RESULT_VIEWED = 'result_viewed',
  SESSION_STARTED = 'session_started',
  SESSION_ENDED = 'session_ended'
}

// Enum para categorias de busca
export enum SearchCategory {
  SAIDAS_EMERGENCIA = 'saidas_emergencia',
  ILUMINACAO = 'iluminacao',
  EXTINTORES = 'extintores',
  HIDRANTES = 'hidrantes',
  SINALIZACAO = 'sinalizacao',
  DOCUMENTACAO = 'documentacao',
  ESTRUTURAL = 'estrutural',
  DETECCAO = 'deteccao',
  GERAL = 'geral'
}

// Tipos utilitários
export type SearchPeriod = '1h' | '24h' | '7d' | '30d' | '90d';
export type SortBy = 'frequency' | 'clickRate' | 'successRate' | 'recent' | 'avgResults';
export type TrendDirection = 'up' | 'down' | 'stable';

// Interface para configurações de analytics
export interface AnalyticsConfig {
  enableTracking: boolean;
  enableSuggestions: boolean;
  cacheTimeout: number;
  batchSize: number;
  retentionPeriod: number;
  anonymizeData: boolean;
}