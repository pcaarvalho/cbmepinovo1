'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Filter, FileText, Calendar, Tag, HelpCircle } from 'lucide-react';
import SmartSearchInput from '@/components/ui/SmartSearchInput';
import SearchCommandsHelp from '@/components/ui/SearchCommandsHelp';
import { useSmartSearch } from '@/hooks/useSmartSearch';
import Button from '@/components/ui/Button';
import Card, { CardContent } from '@/components/ui/Card';
import { todasInstrucoes, categoriasIT } from '@/lib/data';
import { filtrarInstrucoes, buscarInstrucoes, formatarData } from '@/lib/utils';
import { InstrucaoTecnica, FiltrosPesquisa } from '@/types';

export default function PesquisarContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const smartSearch = useSmartSearch();
  const [resultados, setResultados] = useState<InstrucaoTecnica[]>([]);
  const [filtros, setFiltros] = useState<FiltrosPesquisa>({});
  const [showFiltros, setShowFiltros] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [showCommandsHelp, setShowCommandsHelp] = useState(false);

  // Inicializar com query da URL
  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setFiltros(prev => ({ ...prev, termo: query }));
      realizarBusca({ termo: query });
    } else {
      setResultados(todasInstrucoes);
    }
  }, [searchParams]);

  const realizarBusca = (filtrosAtivos: FiltrosPesquisa) => {
    setCarregando(true);
    
    // Simular delay de busca
    setTimeout(() => {
      let resultadosFiltrados = todasInstrucoes;
      
      if (filtrosAtivos.termo) {
        resultadosFiltrados = buscarInstrucoes(resultadosFiltrados, filtrosAtivos.termo);
      }
      
      resultadosFiltrados = filtrarInstrucoes(resultadosFiltrados, filtrosAtivos);
      
      setResultados(resultadosFiltrados);
      setCarregando(false);
    }, 300);
  };

  const handleSearch = (termo: string) => {
    const novosFiltros = { ...filtros, termo };
    setFiltros(novosFiltros);
    realizarBusca(novosFiltros);
  };

  const handleSuggestionSelect = (suggestion: { type: string; title: string; id?: string }) => {
    if (suggestion.type === 'instruction') {
      // Navegar diretamente para a instrução específica
      router.push(`/biblioteca/${suggestion.id}`);
    } else if (suggestion.type === 'category') {
      // Aplicar filtro de categoria
      const novosFiltros = { ...filtros, categoria: suggestion.title };
      setFiltros(novosFiltros);
      realizarBusca(novosFiltros);
    } else {
      // Fazer busca padrão
      handleSearch(suggestion.title);
    }
  };


  const handleFiltroChange = (key: keyof FiltrosPesquisa, value: string | string[] | undefined) => {
    const novosFiltros = { ...filtros, [key]: value };
    setFiltros(novosFiltros);
    realizarBusca(novosFiltros);
  };

  const limparFiltros = () => {
    const novosFiltros = { termo: filtros.termo };
    setFiltros(novosFiltros);
    realizarBusca(novosFiltros);
  };

  const handleCommandExecute = (command: string, param?: string) => {
    smartSearch.executeCommand(command, param);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header da Busca */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Pesquisar Instruções Técnicas</h1>
        
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <SmartSearchInput
              placeholder="Busque ITs, use comandos (/) ou mencione recursos (@)..."
              value={filtros.termo || ''}
              onChange={(value) => setFiltros(prev => ({ ...prev, termo: value }))}
              onSearch={handleSearch}
              onCommandExecute={handleCommandExecute}
              size="lg"
              showSuggestions={true}
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFiltros(!showFiltros)}
              className="lg:w-auto"
            >
              <Filter className="w-5 h-5 mr-2" />
              Filtros
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowCommandsHelp(true)}
              className="lg:w-auto"
              title="Ver comandos disponíveis"
            >
              <HelpCircle className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar de Filtros */}
        <div className={`lg:w-80 ${showFiltros ? 'block' : 'hidden lg:block'}`}>
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={limparFiltros}
                  className="text-red-600 hover:text-red-700"
                >
                  Limpar
                </Button>
              </div>

              {/* Filtro por Categoria */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria
                </label>
                <select
                  value={filtros.categoria || ''}
                  onChange={(e) => handleFiltroChange('categoria', e.target.value || undefined)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                >
                  <option value="">Todas as categorias</option>
                  {categoriasIT.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por Data */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Publicação
                </label>
                <div className="space-y-2">
                  <input
                    type="date"
                    placeholder="Data inicial"
                    value={filtros.dataInicio || ''}
                    onChange={(e) => handleFiltroChange('dataInicio', e.target.value || undefined)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                  <input
                    type="date"
                    placeholder="Data final"
                    value={filtros.dataFim || ''}
                    onChange={(e) => handleFiltroChange('dataFim', e.target.value || undefined)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Tags Comuns */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags Populares
                </label>
                <div className="flex flex-wrap gap-2">
                  {['procedimentos', 'edificações', 'emergência', 'prevenção', 'análise'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        const tagsAtuais = filtros.tags || [];
                        const novasTags = tagsAtuais.includes(tag)
                          ? tagsAtuais.filter(t => t !== tag)
                          : [...tagsAtuais, tag];
                        handleFiltroChange('tags', novasTags.length > 0 ? novasTags : undefined);
                      }}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        (filtros.tags || []).includes(tag)
                          ? 'bg-red-100 border-red-300 text-red-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resultados */}
        <div className="flex-1">
          {/* Contador de Resultados */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              {carregando ? 'Buscando...' : `${resultados.length} resultado(s) encontrado(s)`}
            </p>
          </div>

          {/* Lista de Resultados */}
          {carregando ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : resultados.length > 0 ? (
            <div className="space-y-4">
              {resultados.map((it) => (
                <Card key={it.id} hover className="cursor-pointer">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-sm font-medium text-red-600">
                              {it.numero}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatarData(it.dataPublicacao)}
                            </span>
                          </div>
                          
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {it.titulo}
                          </h3>
                          
                          <p className="text-gray-600 mb-4">
                            {it.descricao}
                          </p>
                          
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs text-gray-500">Categoria:</span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                              {categoriasIT.find(c => c.id === it.categoria)?.nome}
                            </span>
                            
                            <span className="text-xs text-gray-500 ml-2">Tags:</span>
                            {it.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs flex items-center"
                              >
                                <Tag className="w-3 h-3 mr-1" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="ml-4">
                          <Button variant="outline" size="sm">
                            <FileText className="w-4 h-4 mr-2" />
                            Ver IT
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Nenhum resultado encontrado
                </h3>
                <p className="text-gray-600 mb-4">
                  Tente ajustar os filtros ou usar termos diferentes na busca.
                </p>
                <Button variant="outline" onClick={limparFiltros}>
                  Limpar Filtros
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modal de Ajuda dos Comandos */}
      <SearchCommandsHelp 
        isOpen={showCommandsHelp}
        onClose={() => setShowCommandsHelp(false)}
      />
    </div>
  );
}