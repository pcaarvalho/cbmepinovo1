// ==============================================================================
// TYPES - SEARCH DOMAIN
// ==============================================================================

import { InstrucaoTecnica } from './instructions';

export interface SearchRequest {
  query: string;
  filters?: {
    categoria?: string;
    tags?: string[];
    dataInicio?: string;
    dataFim?: string;
  };
  options?: {
    maxResults?: number;
    offset?: number;
    useCache?: boolean;
    includeContext?: boolean;
  };
}

export interface AISearchRequest extends SearchRequest {
  prompt: string;
  searchTerm: string;
}

export interface SearchResponse {
  query: string;
  results: InstrucaoTecnica[];
  suggestions: string[];
  total: number;
  processingTime: number;
  cacheHit: boolean;
  aiAnalysis?: string;
  confidence?: number;
  metadata?: {
    modelUsed?: string;
    tokenUsage?: {
      prompt: number;
      completion: number;
    };
  };
}

export interface SearchSuggestion {
  id: string;
  query: string;
  suggestion: string;
  type: SearchSuggestionType;
  score: number;
  metadata: Record<string, unknown>;
  isActive: boolean;
  usage: number;
  createdAt: string;
  updatedAt: string;
}

export interface SearchHistory {
  id: string;
  query: string;
  filters: Record<string, unknown>;
  resultsCount: number;
  duration?: number;
  clicked: boolean;
  clickedResult?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  userId?: string;
  organizationId?: string;
}

export interface SearchAnalytics {
  totalSearches: number;
  avgResultsPerSearch: number;
  avgSearchTime: number;
  clickThroughRate: number;
  topQueries: Array<{
    query: string;
    count: number;
    successRate: number;
  }>;
  topCategories: Array<{
    categoria: string;
    count: number;
  }>;
  searchTrends: Array<{
    date: string;
    searches: number;
    uniqueUsers: number;
  }>;
}

export interface AISearchIntent {
  extractedQuery: string;
  suggestedCategory?: string;
  explanation: string;
  confidence: number;
  suggestedFilters?: Record<string, unknown>;
}

export enum SearchSuggestionType {
  AUTOCOMPLETE = 'AUTOCOMPLETE',
  RELATED_SEARCH = 'RELATED_SEARCH',
  POPULAR_TERM = 'POPULAR_TERM',
  CONTEXTUAL = 'CONTEXTUAL',
  TYPO_CORRECTION = 'TYPO_CORRECTION'
}