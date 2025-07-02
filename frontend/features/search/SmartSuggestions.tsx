'use client';

import React, { useState, useEffect } from 'react';
import { Lightbulb, TrendingUp, Clock, Zap, ArrowRight } from 'lucide-react';
import { searchAnalytics, SearchSuggestion } from '@/lib/search-analytics';

interface SmartSuggestionsProps {
  query: string;
  userId?: string;
  sessionId?: string;
  onSuggestionClick?: (suggestion: string) => void;
  className?: string;
}

export function SmartSuggestions({ 
  query, 
  userId, 
  sessionId, 
  onSuggestionClick, 
  className = '' 
}: SmartSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query && query.length >= 2) {
      loadSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [query, userId]);

  const loadSuggestions = async () => {
    if (!query || query.length < 2) return;

    setLoading(true);

    try {
      const context = {
        userId,
        sessionId: sessionId || generateSessionId(),
        organizationId: undefined,
        ipAddress: undefined,
        userAgent: undefined
      };

      const smartSuggestions = await searchAnalytics.getSmartSuggestions(query, context);
      setSuggestions(smartSuggestions);
    } catch (error) {
      console.error('Erro ao carregar sugestões:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'contextual':
        return <Lightbulb className="w-4 h-4 text-yellow-500" />;
      case 'popular':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'related':
        return <ArrowRight className="w-4 h-4 text-blue-500" />;
      case 'autocomplete':
        return <Zap className="w-4 h-4 text-purple-500" />;
      case 'typo':
        return <Clock className="w-4 h-4 text-orange-500" />;
      default:
        return <Lightbulb className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSuggestionTypeLabel = (type: string) => {
    const labels = {
      'contextual': 'Baseado no seu histórico',
      'popular': 'Busca popular',
      'related': 'Termo relacionado',
      'autocomplete': 'Sugestão de completar',
      'typo': 'Correção sugerida'
    };
    return labels[type as keyof typeof labels] || 'Sugestão';
  };

  const getSuggestionTypeColor = (type: string) => {
    const colors = {
      'contextual': 'bg-yellow-50 border-yellow-200 text-yellow-800',
      'popular': 'bg-green-50 border-green-200 text-green-800',
      'related': 'bg-blue-50 border-blue-200 text-blue-800',
      'autocomplete': 'bg-purple-50 border-purple-200 text-purple-800',
      'typo': 'bg-orange-50 border-orange-200 text-orange-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-50 border-gray-200 text-gray-800';
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onSuggestionClick?.(suggestion.suggestion);
    
    // Registrar uso da sugestão para melhorar algoritmo
    recordSuggestionUsage(suggestion);
  };

  const recordSuggestionUsage = async (suggestion: SearchSuggestion) => {
    try {
      await fetch('/api/analytics/suggestion-usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          originalQuery: query,
          selectedSuggestion: suggestion.suggestion,
          suggestionType: suggestion.type,
          userId,
          sessionId
        })
      });
    } catch (error) {
      console.error('Erro ao registrar uso da sugestão:', error);
    }
  };

  if (!query || query.length < 2) return null;

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-lg ${className}`}>
      {loading && (
        <div className="p-4 text-center">
          <div className="animate-pulse flex items-center justify-center gap-2">
            <Lightbulb className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">Buscando sugestões inteligentes...</span>
          </div>
        </div>
      )}

      {!loading && suggestions.length > 0 && (
        <div className="p-2">
          <div className="flex items-center gap-2 px-2 py-1 mb-2">
            <Lightbulb className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-gray-700">Sugestões Inteligentes</span>
          </div>
          
          <div className="space-y-1">
            {suggestions.map((suggestion, index) => (
              <div
                key={`${suggestion.suggestion}-${index}`}
                onClick={() => handleSuggestionClick(suggestion)}
                className="p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getSuggestionIcon(suggestion.type)}
                      <span className="font-medium text-gray-900 truncate">
                        {suggestion.suggestion}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full border ${getSuggestionTypeColor(suggestion.type)}`}>
                        {getSuggestionTypeLabel(suggestion.type)}
                      </span>
                      
                      <div className="flex items-center gap-1">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-1 h-1 rounded-full mr-0.5 ${
                                i < Math.round(suggestion.score * 5)
                                  ? 'bg-yellow-400'
                                  : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          {Math.round(suggestion.score * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
                </div>

                {suggestion.metadata && (
                  <div className="mt-2 text-xs text-gray-500">
                    {suggestion.metadata.reason && (
                      <p>{suggestion.metadata.reason}</p>
                    )}
                    
                    {suggestion.metadata.lastUsed && (
                      <p>Última busca: {new Date(suggestion.metadata.lastUsed).toLocaleDateString()}</p>
                    )}
                    
                    {suggestion.metadata.frequency && (
                      <p>Buscado {suggestion.metadata.frequency}x</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && suggestions.length === 0 && query.length >= 2 && (
        <div className="p-4 text-center text-gray-500">
          <Lightbulb className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">Nenhuma sugestão disponível</p>
          <p className="text-xs">Continue digitando para obter sugestões personalizadas</p>
        </div>
      )}
    </div>
  );
}

function generateSessionId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}