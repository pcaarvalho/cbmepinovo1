// AIDEV-EXPLANATION: Página de debug para IA conforme AIDEV-IMPROVEMENTS.md
// Exibe estatísticas e últimas interações com a IA

'use client';

import { useState, useEffect } from 'react';

// AIDEV-SUGGESTION: Interface para dados de interação
interface IAInteraction {
  id: string;
  timestamp: Date;
  model: string;
  prompt: string;
  response: string;
  tokens: number;
  responseTime: number;
  score?: number;
  cached: boolean;
}

// AIDEV-SUGGESTION: Interface para estatísticas do cache
interface CacheStats {
  size: number;
  maxSize: number;
  ttlMinutes: number;
  hitRate: number;
  mostUsed: Array<{ key: string; hits: number }>;
}

export default function IADebugPage() {
  const [interactions, setInteractions] = useState<IAInteraction[]>([]);
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  // AIDEV-EXPLANATION: Simula autenticação básica
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    // AIDEV-SUGGESTION: Em produção, usar autenticação real
    if (password === 'debug123') {
      setAuthenticated(true);
      loadData();
    } else {
      alert('Senha incorreta');
    }
  };

  // AIDEV-EXPLANATION: Carrega dados simulados
  const loadData = async () => {
    setLoading(true);
    
    // AIDEV-SUGGESTION: Em produção, buscar dados reais da API
    // Simulando dados para demonstração
    const mockInteractions: IAInteraction[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        model: 'mistralai/mixtral-8x7b-instruct',
        prompt: 'Qual a distância máxima entre extintores?',
        response: 'De acordo com a IT-021, a distância máxima entre extintores é de 20 metros...',
        tokens: 150,
        responseTime: 1234,
        score: 8,
        cached: false
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 1000 * 60 * 10),
        model: 'fallback-analysis',
        prompt: 'Dimensionamento de saídas de emergência',
        response: 'Análise técnica da consulta:\n\n🚪 **Saídas de Emergência (IT-008)**...',
        tokens: 200,
        responseTime: 2500,
        score: 6,
        cached: true
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        model: 'mistralai/mixtral-8x7b-instruct',
        prompt: 'Sistema de hidrantes - pressão mínima',
        response: 'Conforme a IT-022, o sistema de hidrantes deve ter pressão dinâmica mínima...',
        tokens: 180,
        responseTime: 1567,
        score: 9,
        cached: false
      }
    ];

    const mockCacheStats: CacheStats = {
      size: 42,
      maxSize: 1000,
      ttlMinutes: 60,
      hitRate: 0.73,
      mostUsed: [
        { key: 'qual a distância máxima entre extintores?', hits: 23 },
        { key: 'dimensionamento de saídas de emergência', hits: 18 },
        { key: 'sistema de hidrantes - pressão mínima', hits: 15 }
      ]
    };

    setInteractions(mockInteractions);
    setCacheStats(mockCacheStats);
    setLoading(false);
  };

  // AIDEV-EXPLANATION: Limpa o cache
  const clearCache = async () => {
    if (confirm('Tem certeza que deseja limpar todo o cache?')) {
      // AIDEV-SUGGESTION: Em produção, chamar API real
      alert('Cache limpo com sucesso!');
      if (cacheStats) {
        setCacheStats({ ...cacheStats, size: 0, hitRate: 0, mostUsed: [] });
      }
    }
  };

  // AIDEV-EXPLANATION: Formata tempo de resposta
  const formatResponseTime = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  // AIDEV-EXPLANATION: Formata data/hora
  const formatDateTime = (date: Date): string => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h1 className="text-2xl font-bold mb-4">🔒 Admin - Debug IA</h1>
          <form onSubmit={handleAuth}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite a senha"
              className="w-full p-2 border rounded mb-4"
              autoFocus
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🧠 Debug IA - Painel Administrativo</h1>

        {/* Estatísticas do Cache */}
        {cacheStats && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">📊 Estatísticas do Cache</h2>
              <button
                onClick={clearCache}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Limpar Cache
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-600">Tamanho do Cache</p>
                <p className="text-2xl font-bold">{cacheStats.size}/{cacheStats.maxSize}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-600">Taxa de Acerto</p>
                <p className="text-2xl font-bold">{(cacheStats.hitRate * 100).toFixed(1)}%</p>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-600">TTL (minutos)</p>
                <p className="text-2xl font-bold">{cacheStats.ttlMinutes}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-600">Média de Resposta</p>
                <p className="text-2xl font-bold">
                  {formatResponseTime(
                    interactions.reduce((acc, i) => acc + i.responseTime, 0) / interactions.length
                  )}
                </p>
              </div>
            </div>

            {cacheStats.mostUsed.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">🔥 Consultas Mais Frequentes</h3>
                <div className="space-y-2">
                  {cacheStats.mostUsed.map((item, index) => (
                    <div key={index} className="flex justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm truncate flex-1">{item.key}</span>
                      <span className="text-sm font-medium ml-2">{item.hits} hits</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Últimas Interações */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">🕐 Últimas 10 Interações</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Horário
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Modelo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Prompt
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tokens
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tempo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Score
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Cache
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {interactions.map((interaction) => (
                  <tr key={interaction.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      {formatDateTime(interaction.timestamp)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        interaction.model.includes('fallback') 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {interaction.model.split('/').pop()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm max-w-xs truncate" title={interaction.prompt}>
                      {interaction.prompt}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {interaction.tokens}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {formatResponseTime(interaction.responseTime)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {interaction.score && (
                        <span className={`font-medium ${
                          interaction.score >= 8 ? 'text-green-600' :
                          interaction.score >= 6 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {interaction.score}/10
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {interaction.cached ? (
                        <span className="text-blue-600">✓ Hit</span>
                      ) : (
                        <span className="text-gray-400">Miss</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AIDEV-SUGGESTION: Adicionar mais funcionalidades como:
            - Gráficos de desempenho
            - Logs de erro
            - Configurações de modelo
            - Teste de prompts
        */}
      </div>
    </div>
  );
}