'use client';

import { useState } from 'react';
import { Search, FileText, ChevronRight, Lightbulb } from 'lucide-react';

interface SearchResult {
  it: string;
  titulo: string;
  capitulo: string;
  pagina: number;
  score: number;
  trecho: string;
  matchedTerms: string[];
  url: string;
}

export default function PesquisarPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalResults, setTotalResults] = useState(0);

  const handleSearch = async () => {
    if (!query || query.trim().length < 3) {
      setError('Digite pelo menos 3 caracteres para pesquisar');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/pesquisa?q=${encodeURIComponent(query.trim())}`);
      const data = await response.json();

      if (data.success) {
        setResults(data.data.results);
        setTotalResults(data.data.totalResults);
      } else {
        setError(data.error || 'Erro na pesquisa');
      }
    } catch {
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const popularSearches = [
    'saída de emergência',
    'iluminação emergência',
    'extintores',
    'memorial descritivo',
    'hidrantes'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header de Pesquisa */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Pesquisar Instruções Técnicas
          </h1>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ex: largura mínima saída emergência, autonomia iluminação..."
              className="block w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            <div className="absolute inset-y-0 right-0 flex items-center">
              <button
                onClick={handleSearch}
                disabled={loading || query.trim().length < 3}
                className="mr-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {loading ? 'Buscando...' : 'Pesquisar'}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-3 text-red-600 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Pesquisas Populares */}
        {!results.length && !loading && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
              Pesquisas Populares
            </h2>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(search);
                    setError('');
                  }}
                  className="bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Pesquisando nas Instruções Técnicas...</p>
          </div>
        )}

        {/* Resultados */}
        {results.length > 0 && !loading && (
          <div>
            <div className="mb-6 text-sm text-gray-600">
              <strong>{totalResults}</strong> resultado(s) encontrado(s)
            </div>

            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                          {result.it}
                        </span>
                        <span className="text-gray-500 text-sm">
                          Página {result.pagina}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {result.titulo}
                      </h3>
                      
                      <p className="text-sm text-gray-600 mb-3">
                        {result.capitulo}
                      </p>
                      
                      <div 
                        className="text-gray-700 leading-relaxed mb-4 text-sm"
                        dangerouslySetInnerHTML={{ __html: result.trecho }}
                      />
                      
                      <div className="text-xs text-gray-500">
                        Termos: {result.matchedTerms.join(', ')}
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      <a
                        href={result.url}
                        className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Ver PDF
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {!results.length && !loading && query && !error && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum resultado encontrado
            </h3>
            <p className="text-gray-600">
              Tente usar termos diferentes ou mais específicos
            </p>
          </div>
        )}
      </div>
    </div>
  );
}