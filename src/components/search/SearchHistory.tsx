'use client';

import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp, BarChart3, Search, X, RefreshCw } from 'lucide-react';
import { searchAnalytics, SearchGroup } from '@/lib/search-analytics';

interface SearchHistoryProps {
  userId?: string;
  onSearchSelect?: (query: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function SearchHistory({ userId, onSearchSelect, isOpen, onClose }: SearchHistoryProps) {
  const [searchGroups, setSearchGroups] = useState<SearchGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'recent' | 'groups' | 'stats'>('recent');

  useEffect(() => {
    if (isOpen && userId) {
      loadSearchHistory();
    }
  }, [isOpen, userId]);

  const loadSearchHistory = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const groups = await searchAnalytics.getUserSearchHistory(userId, 100);
      setSearchGroups(groups);
    } catch (err) {
      setError('Erro ao carregar histórico de buscas');
      console.error('Erro ao carregar histórico:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchClick = (query: string) => {
    onSearchSelect?.(query);
    onClose();
  };

  const getTopicIcon = (topic: string) => {
    const icons = {
      'saidas_emergencia': '🚪',
      'iluminacao': '💡',
      'extintores': '🧯',
      'hidrantes': '🚰',
      'sinalizacao': '🚨',
      'documentacao': '📄',
      'estrutural': '🏗️',
      'deteccao': '🔍',
      'geral': '📋'
    };
    return icons[topic as keyof typeof icons] || '🔍';
  };

  const getTopicLabel = (topic: string) => {
    const labels = {
      'saidas_emergencia': 'Saídas de Emergência',
      'iluminacao': 'Iluminação',
      'extintores': 'Extintores',
      'hidrantes': 'Hidrantes',
      'sinalizacao': 'Sinalização',
      'documentacao': 'Documentação',
      'estrutural': 'Estrutural',
      'deteccao': 'Detecção',
      'geral': 'Geral'
    };
    return labels[topic as keyof typeof labels] || 'Outros';
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}min atrás`;
    } else if (hours < 24) {
      return `${hours}h atrás`;
    } else {
      return `${days}d atrás`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[90%] max-w-4xl h-[80%] max-h-[600px] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Histórico de Buscas Inteligente
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadSearchHistory}
              disabled={loading}
              className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
              title="Atualizar"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-4">
            <button
              onClick={() => setActiveTab('recent')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'recent'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Recentes
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'groups'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Por Tópicos
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'stats'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Estatísticas
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {loading && (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Carregando histórico...</span>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
              <button
                onClick={loadSearchHistory}
                className="mt-2 text-blue-600 hover:text-blue-700"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {!loading && !error && activeTab === 'recent' && (
            <div className="space-y-3">
              {searchGroups.flatMap(group => group.searches).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhuma busca encontrada</p>
                  <p className="text-sm">Suas buscas recentes aparecerão aqui</p>
                </div>
              ) : (
                searchGroups.flatMap(group => 
                  group.searches.map(search => (
                    <div
                      key={search.id}
                      onClick={() => handleSearchClick(search.query)}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{search.query}</p>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                            <span>{search.resultsCount} resultados</span>
                            <span>{search.duration}ms</span>
                            <span>{formatRelativeTime(search.timestamp)}</span>
                            {search.clicked && (
                              <span className="text-green-600 font-medium">✓ Clicado</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ).slice(0, 20)
              )}
            </div>
          )}

          {!loading && !error && activeTab === 'groups' && (
            <div className="space-y-4">
              {searchGroups.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhum grupo encontrado</p>
                  <p className="text-sm">Buscas relacionadas serão agrupadas automaticamente</p>
                </div>
              ) : (
                searchGroups.map(group => (
                  <div key={group.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getTopicIcon(group.topic)}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {getTopicLabel(group.topic)}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {group.frequency} buscas • Última: {formatRelativeTime(group.lastUsed)}
                          </p>
                        </div>
                      </div>
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    </div>

                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {group.keywords.slice(0, 8).map(keyword => (
                          <span
                            key={keyword}
                            className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {group.searches.slice(0, 3).map(search => (
                        <div
                          key={search.id}
                          onClick={() => handleSearchClick(search.query)}
                          className="p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                          <p className="text-sm font-medium text-gray-800">{search.query}</p>
                          <p className="text-xs text-gray-500">
                            {search.resultsCount} resultados • {formatRelativeTime(search.timestamp)}
                          </p>
                        </div>
                      ))}
                      {group.searches.length > 3 && (
                        <p className="text-xs text-gray-500 text-center">
                          +{group.searches.length - 3} buscas similares
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {!loading && !error && activeTab === 'stats' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900">Total de Buscas</h4>
                  <p className="text-2xl font-bold text-blue-700">
                    {searchGroups.reduce((acc, group) => acc + group.frequency, 0)}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900">Tópicos Únicos</h4>
                  <p className="text-2xl font-bold text-green-700">{searchGroups.length}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900">Mais Buscado</h4>
                  <p className="text-sm font-medium text-purple-700">
                    {searchGroups.length > 0 
                      ? getTopicLabel(searchGroups.sort((a, b) => b.frequency - a.frequency)[0].topic)
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Distribuição por Tópicos</h4>
                <div className="space-y-2">
                  {searchGroups
                    .sort((a, b) => b.frequency - a.frequency)
                    .slice(0, 5)
                    .map(group => {
                      const total = searchGroups.reduce((acc, g) => acc + g.frequency, 0);
                      const percentage = total > 0 ? (group.frequency / total) * 100 : 0;
                      
                      return (
                        <div key={group.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span>{getTopicIcon(group.topic)}</span>
                            <span className="text-sm font-medium">
                              {getTopicLabel(group.topic)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600 w-8">
                              {percentage.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}