'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, History, BarChart3, Settings, X } from 'lucide-react';
import { SearchHistory } from './SearchHistory';
import { SmartSuggestions } from './SmartSuggestions';
import { searchAnalytics } from '@/lib/search-analytics';

interface EnhancedSearchInterfaceProps {
  onSearch: (query: string) => void;
  className?: string;
  userId?: string;
}

export function EnhancedSearchInterface({ 
  onSearch, 
  className = '', 
  userId 
}: EnhancedSearchInterfaceProps) {
  const [query, setQuery] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sessionId] = useState(() => generateSessionId());
  const [searchStats, setSearchStats] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userId) {
      loadUserStats();
    }
  }, [userId]);

  const generateSessionId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const loadUserStats = async () => {
    if (!userId) return;
    
    try {
      const history = await searchAnalytics.getUserSearchHistory(userId, 10);
      const totalSearches = history.reduce((acc, group) => acc + group.frequency, 0);
      const topTopics = history.slice(0, 3).map(group => group.topic);
      
      setSearchStats({
        totalSearches,
        topTopics,
        recentGroups: history.length
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    const startTime = Date.now();

    // Executar busca
    onSearch(searchQuery);

    // Registrar no analytics
    const searchDuration = Date.now() - startTime;
    const context = {
      userId,
      sessionId,
      organizationId: undefined,
      ipAddress: undefined,
      userAgent: undefined
    };

    try {
      await searchAnalytics.recordSearch(context, {
        query: searchQuery,
        resultsCount: 0, // Será atualizado quando os resultados chegarem
        duration: searchDuration,
        timestamp: new Date(),
        clicked: false,
        filters: {}
      });
    } catch (error) {
      console.error('Erro ao registrar busca:', error);
    }

    setQuery(searchQuery);
    setShowSuggestions(false);
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    setShowSuggestions(value.length >= 2);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSearch(suggestion);
  };

  const handleSearchSelect = (selectedQuery: string) => {
    handleSearch(selectedQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch(query);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleResultClick = async (resultId: string, resultType: string) => {
    if (!query) return;

    const context = {
      userId,
      sessionId,
      organizationId: undefined,
      ipAddress: undefined,
      userAgent: undefined
    };

    try {
      await searchAnalytics.recordClick(context, query, resultId, resultType);
    } catch (error) {
      console.error('Erro ao registrar clique:', error);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Barra de busca principal */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(query.length >= 2)}
            placeholder="Busque por instruções técnicas, normas, especificações..."
            className="w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          {/* Botões de ação */}
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setShowSuggestions(false);
                  inputRef.current?.focus();
                }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
                title="Limpar"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            
            {userId && (
              <button
                onClick={() => setShowHistory(true)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                title="Ver histórico de buscas"
              >
                <History className="w-4 h-4" />
              </button>
            )}
            
            <button
              onClick={() => handleSearch(query)}
              disabled={!query.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Buscar
            </button>
          </div>
        </div>

        {/* Sugestões inteligentes */}
        {showSuggestions && (
          <div className="absolute top-full left-0 right-0 z-10 mt-1">
            <SmartSuggestions
              query={query}
              userId={userId}
              sessionId={sessionId}
              onSuggestionClick={handleSuggestionClick}
            />
          </div>
        )}
      </div>

      {/* Estatísticas rápidas do usuário */}
      {userId && searchStats && (
        <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <BarChart3 className="w-4 h-4" />
            <span>{searchStats.totalSearches} buscas realizadas</span>
          </div>
          
          {searchStats.topTopics.length > 0 && (
            <div className="flex items-center gap-1">
              <span>Tópicos frequentes:</span>
              <span className="font-medium">
                {searchStats.topTopics.slice(0, 2).join(', ')}
              </span>
            </div>
          )}
          
          <div className="flex items-center gap-1">
            <span>{searchStats.recentGroups} grupos de busca</span>
          </div>
        </div>
      )}

      {/* Histórico de buscas */}
      <SearchHistory
        userId={userId}
        onSearchSelect={handleSearchSelect}
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
      />

      {/* Feedback para desenvolvimento */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="text-sm font-medium text-yellow-800 mb-2">
            Sistema de Analytics Ativo
          </h4>
          <div className="text-xs text-yellow-700 space-y-1">
            <p>• Histórico inteligente habilitado</p>
            <p>• Sugestões contextuais ativas</p>
            <p>• Agrupamento automático por tópicos</p>
            <p>• Analytics de performance em tempo real</p>
            {userId && <p>• Personalização baseada no usuário: {userId}</p>}
            <p>• Session ID: {sessionId}</p>
          </div>
        </div>
      )}

      {/* Overlay para fechar sugestões */}
      {showSuggestions && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowSuggestions(false)}
        />
      )}
    </div>
  );
}

// Hook para usar o sistema de analytics em outros componentes
export function useSearchAnalytics(userId?: string) {
  const [sessionId] = useState(() => 
    Date.now().toString(36) + Math.random().toString(36).substr(2)
  );

  const recordSearch = async (query: string, resultsCount: number, duration: number) => {
    const context = {
      userId,
      sessionId,
      organizationId: undefined,
      ipAddress: undefined,
      userAgent: undefined
    };

    try {
      await searchAnalytics.recordSearch(context, {
        query,
        resultsCount,
        duration,
        timestamp: new Date(),
        clicked: false,
        filters: {}
      });
    } catch (error) {
      console.error('Erro ao registrar busca:', error);
    }
  };

  const recordClick = async (query: string, resultId: string, resultType: string) => {
    const context = {
      userId,
      sessionId,
      organizationId: undefined,
      ipAddress: undefined,
      userAgent: undefined
    };

    try {
      await searchAnalytics.recordClick(context, query, resultId, resultType);
    } catch (error) {
      console.error('Erro ao registrar clique:', error);
    }
  };

  const getSearchHistory = async (limit: number = 50) => {
    if (!userId) return [];

    try {
      return await searchAnalytics.getUserSearchHistory(userId, limit);
    } catch (error) {
      console.error('Erro ao obter histórico:', error);
      return [];
    }
  };

  const getSmartSuggestions = async (query: string) => {
    const context = {
      userId,
      sessionId,
      organizationId: undefined,
      ipAddress: undefined,
      userAgent: undefined
    };

    try {
      return await searchAnalytics.getSmartSuggestions(query, context);
    } catch (error) {
      console.error('Erro ao obter sugestões:', error);
      return [];
    }
  };

  return {
    sessionId,
    recordSearch,
    recordClick,
    getSearchHistory,
    getSmartSuggestions
  };
}