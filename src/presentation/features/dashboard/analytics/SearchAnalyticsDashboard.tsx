'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Search, 
  MousePointer, 
  Clock,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { searchAnalytics, SearchTerm } from '@/lib/search-analytics';

interface SearchAnalyticsDashboardProps {
  className?: string;
}

export function SearchAnalyticsDashboard({ className = '' }: SearchAnalyticsDashboardProps) {
  const [topTerms, setTopTerms] = useState<SearchTerm[]>([]);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<'24h' | '7d' | '30d'>('7d');
  const [sortBy, setSortBy] = useState<'frequency' | 'clickRate' | 'successRate'>('frequency');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadAnalytics();
  }, [period, sortBy, selectedCategory]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const terms = await searchAnalytics.getTopSearchTerms(period);
      setTopTerms(terms);
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'all', label: 'Todas as categorias' },
    { value: 'saidas_emergencia', label: 'Saídas de Emergência' },
    { value: 'iluminacao', label: 'Iluminação' },
    { value: 'extintores', label: 'Extintores' },
    { value: 'hidrantes', label: 'Hidrantes' },
    { value: 'sinalizacao', label: 'Sinalização' },
    { value: 'documentacao', label: 'Documentação' },
    { value: 'estrutural', label: 'Estrutural' },
    { value: 'deteccao', label: 'Detecção' }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      default:
        return <TrendingUp className="w-4 h-4 text-gray-400" />;
    }
  };

  const getCategoryColor = (category?: string) => {
    const colors = {
      'saidas_emergencia': 'bg-red-100 text-red-800',
      'iluminacao': 'bg-yellow-100 text-yellow-800',
      'extintores': 'bg-orange-100 text-orange-800',
      'hidrantes': 'bg-blue-100 text-blue-800',
      'sinalizacao': 'bg-purple-100 text-purple-800',
      'documentacao': 'bg-green-100 text-green-800',
      'estrutural': 'bg-gray-100 text-gray-800',
      'deteccao': 'bg-indigo-100 text-indigo-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const exportData = () => {
    const csvData = topTerms.map(term => ({
      Termo: term.term,
      Frequencia: term.frequency,
      'Taxa de Clique': `${(term.clickRate * 100).toFixed(1)}%`,
      'Taxa de Sucesso': `${(term.successRate * 100).toFixed(1)}%`,
      'Média de Resultados': term.avgResults.toFixed(1),
      'Tempo Médio (ms)': term.avgDuration.toFixed(0),
      Categoria: term.category || 'N/A',
      'Termos Relacionados': term.relatedTerms.join(', ')
    }));

    const csv = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `search-analytics-${period}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const calculateStats = () => {
    if (topTerms.length === 0) {
      return {
        totalSearches: 0,
        avgClickRate: 0,
        avgSuccessRate: 0,
        avgResultsPerSearch: 0
      };
    }

    const totalSearches = topTerms.reduce((sum, term) => sum + term.frequency, 0);
    const avgClickRate = topTerms.reduce((sum, term) => sum + term.clickRate, 0) / topTerms.length;
    const avgSuccessRate = topTerms.reduce((sum, term) => sum + term.successRate, 0) / topTerms.length;
    const avgResultsPerSearch = topTerms.reduce((sum, term) => sum + term.avgResults, 0) / topTerms.length;

    return {
      totalSearches,
      avgClickRate,
      avgSuccessRate,
      avgResultsPerSearch
    };
  };

  const stats = calculateStats();

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Analytics de Busca
              </h2>
              <p className="text-sm text-gray-600">
                Análise de desempenho e padrões de busca
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={loadAnalytics}
              disabled={loading}
              className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
              title="Atualizar dados"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            
            <button
              onClick={exportData}
              disabled={topTerms.length === 0}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-100 bg-gray-50">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as '24h' | '7d' | '30d')}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="24h">Últimas 24h</option>
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'frequency' | 'clickRate' | 'successRate')}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="frequency">Frequência</option>
              <option value="clickRate">Taxa de Clique</option>
              <option value="successRate">Taxa de Sucesso</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-6 border-b border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <Search className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">Total de Buscas</p>
                <p className="text-2xl font-bold text-blue-700">
                  {stats.totalSearches.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <MousePointer className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900">Taxa de Clique Média</p>
                <p className="text-2xl font-bold text-green-700">
                  {(stats.avgClickRate * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-purple-900">Taxa de Sucesso</p>
                <p className="text-2xl font-bold text-purple-700">
                  {(stats.avgSuccessRate * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-orange-900">Resultados por Busca</p>
                <p className="text-2xl font-bold text-orange-700">
                  {stats.avgResultsPerSearch.toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Terms Table */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Carregando dados...</span>
          </div>
        ) : topTerms.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhum dado encontrado</p>
            <p className="text-sm">Dados de busca aparecerão aqui conforme as consultas forem realizadas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-medium text-gray-900">Termo</th>
                  <th className="text-center py-3 px-2 font-medium text-gray-900">Freq.</th>
                  <th className="text-center py-3 px-2 font-medium text-gray-900">Cliques</th>
                  <th className="text-center py-3 px-2 font-medium text-gray-900">Sucesso</th>
                  <th className="text-center py-3 px-2 font-medium text-gray-900">Resultados</th>
                  <th className="text-center py-3 px-2 font-medium text-gray-900">Tempo</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-900">Categoria</th>
                  <th className="text-center py-3 px-2 font-medium text-gray-900">Tendência</th>
                </tr>
              </thead>
              <tbody>
                {topTerms.map((term, index) => (
                  <tr key={term.term} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <div>
                        <p className="font-medium text-gray-900">{term.term}</p>
                        {term.relatedTerms.length > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            Relacionados: {term.relatedTerms.slice(0, 3).join(', ')}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="text-center py-3 px-2">
                      <span className="font-semibold text-gray-900">{term.frequency}</span>
                    </td>
                    <td className="text-center py-3 px-2">
                      <span className={`font-semibold ${
                        term.clickRate > 0.7 ? 'text-green-700' :
                        term.clickRate > 0.4 ? 'text-yellow-700' : 'text-red-700'
                      }`}>
                        {(term.clickRate * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-center py-3 px-2">
                      <span className={`font-semibold ${
                        term.successRate > 0.7 ? 'text-green-700' :
                        term.successRate > 0.4 ? 'text-yellow-700' : 'text-red-700'
                      }`}>
                        {(term.successRate * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-center py-3 px-2">
                      <span className="text-gray-700">{term.avgResults.toFixed(1)}</span>
                    </td>
                    <td className="text-center py-3 px-2">
                      <span className="text-gray-700">{term.avgDuration.toFixed(0)}ms</span>
                    </td>
                    <td className="py-3 px-2">
                      {term.category && (
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${getCategoryColor(term.category)}`}>
                          {term.category.replace('_', ' ')}
                        </span>
                      )}
                    </td>
                    <td className="text-center py-3 px-2">
                      {getTrendIcon(term.relatedTerms[0])} {/* Placeholder for trend */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}