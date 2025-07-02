'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Library, FileText, Calendar, Tag, Grid, List, Filter } from 'lucide-react';
import SearchInput from '@/components/ui/SearchInput';
import Button from '@/components/ui/Button';
import Card, { CardContent } from '@/components/ui/Card';
import { todasInstrucoes, categoriasIT } from '@/lib/data';
import { filtrarInstrucoes, formatarData } from '@/lib/utils';
import { InstrucaoTecnica, FiltrosPesquisa } from '@/types';

export default function BibliotecaContent() {
  const searchParams = useSearchParams();
  const [instrucoes, setInstrucoes] = useState<InstrucaoTecnica[]>(todasInstrucoes);
  const [filtros, setFiltros] = useState<FiltrosPesquisa>({});
  const [visualizacao, setVisualizacao] = useState<'grid' | 'list'>('grid');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>('');

  useEffect(() => {
    const categoria = searchParams.get('categoria');
    if (categoria) {
      setCategoriaSelecionada(categoria);
      setFiltros({ categoria });
      const instrucoesFiltradasByCategory = filtrarInstrucoes(todasInstrucoes, { categoria });
      setInstrucoes(instrucoesFiltradasByCategory);
    }
  }, [searchParams]);

  const handleFiltroChange = (novosFiltros: FiltrosPesquisa) => {
    setFiltros(novosFiltros);
    const instrucoesFiltradasByFilters = filtrarInstrucoes(todasInstrucoes, novosFiltros);
    setInstrucoes(instrucoesFiltradasByFilters);
  };

  const handleCategoriaChange = (categoriaId: string) => {
    const novosFiltros = categoriaId ? { ...filtros, categoria: categoriaId } : { ...filtros };
    if (!categoriaId) {
      delete novosFiltros.categoria;
    }
    setCategoriaSelecionada(categoriaId);
    handleFiltroChange(novosFiltros);
  };

  const handleSearch = (termo: string) => {
    const novosFiltros = { ...filtros, termo: termo || undefined };
    handleFiltroChange(novosFiltros);
  };

  const categoriaAtual = categoriasIT.find(c => c.id === categoriaSelecionada);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Library className="w-8 h-8 text-red-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {categoriaAtual ? categoriaAtual.nome : 'Biblioteca de ITs'}
            </h1>
            <p className="text-gray-600">
              {categoriaAtual 
                ? categoriaAtual.descricao 
                : 'Todas as Instruções Técnicas do Corpo de Bombeiros do Piauí'
              }
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={visualizacao === 'grid' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setVisualizacao('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={visualizacao === 'list' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setVisualizacao('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-80">
          <div className="space-y-6">
            {/* Busca */}
            <Card>
              <CardContent className="p-4">
                <SearchInput
                  placeholder="Buscar na biblioteca..."
                  value={filtros.termo || ''}
                  onSearch={handleSearch}
                />
              </CardContent>
            </Card>

            {/* Filtro por Categoria */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Categorias</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleCategoriaChange('')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      !categoriaSelecionada
                        ? 'bg-red-100 text-red-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Todas as categorias ({todasInstrucoes.length})
                  </button>
                  {categoriasIT.map((categoria) => (
                    <button
                      key={categoria.id}
                      onClick={() => handleCategoriaChange(categoria.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        categoriaSelecionada === categoria.id
                          ? 'bg-red-100 text-red-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-2">
                          <span>{categoria.icone}</span>
                          <span>{categoria.nome}</span>
                        </span>
                        <span className="text-xs">
                          {todasInstrucoes.filter(it => it.categoria === categoria.id).length}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Filtros Adicionais */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Filtros</h3>
                
                {/* Data de Publicação */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Publicação
                  </label>
                  <select
                    value={filtros.dataInicio || ''}
                    onChange={(e) => {
                      const ano = e.target.value;
                      const novosFiltros = { ...filtros };
                      if (ano) {
                        novosFiltros.dataInicio = `${ano}-01-01`;
                        novosFiltros.dataFim = `${ano}-12-31`;
                      } else {
                        delete novosFiltros.dataInicio;
                        delete novosFiltros.dataFim;
                      }
                      handleFiltroChange(novosFiltros);
                    }}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  >
                    <option value="">Todos os anos</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                  </select>
                </div>

                {/* ITs Populares */}
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filtros.popular || false}
                      onChange={(e) => {
                        const novosFiltros = { ...filtros };
                        if (e.target.checked) {
                          novosFiltros.popular = true;
                        } else {
                          delete novosFiltros.popular;
                        }
                        handleFiltroChange(novosFiltros);
                      }}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">Apenas ITs populares</span>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1">
          {/* Contador de Resultados */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              {instrucoes.length} instrução(ões) técnica(s) encontrada(s)
            </p>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                Ordenar por data de publicação
              </span>
            </div>
          </div>

          {/* Grid de ITs */}
          {visualizacao === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {instrucoes.map((it) => (
                <Link key={it.id} href={`/it/${it.id}`}>
                  <Card hover className="h-full cursor-pointer">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-red-600 mb-1">
                              {it.numero}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                              {it.titulo}
                            </h3>
                            <p className="text-gray-600 text-sm line-clamp-3">
                              {it.descricao}
                            </p>
                          </div>
                          {it.popular && (
                            <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                              Popular
                            </span>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="w-3 h-3 mr-1" />
                            Publicada em {formatarData(it.dataPublicacao)}
                          </div>
                          
                          <div className="flex items-center text-xs text-gray-500">
                            <span className="mr-1">Categoria:</span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                              {categoriasIT.find(c => c.id === it.categoria)?.nome}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {it.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs flex items-center"
                              >
                                <Tag className="w-2 h-2 mr-1" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-gray-100">
                          <Button variant="outline" size="sm" className="w-full">
                            <FileText className="w-4 h-4 mr-2" />
                            Visualizar IT
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            /* Lista de ITs */
            <div className="space-y-4">
              {instrucoes.map((it) => (
                <Link key={it.id} href={`/it/${it.id}`}>
                  <Card hover className="cursor-pointer">
                    <CardContent className="p-6">
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
                            {it.popular && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                Popular
                              </span>
                            )}
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
                            {it.tags.slice(0, 3).map((tag) => (
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
                        
                        <div className="ml-6">
                          <Button variant="outline" size="sm">
                            <FileText className="w-4 h-4 mr-2" />
                            Ver IT
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {/* Mensagem quando não há resultados */}
          {instrucoes.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Library className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Nenhuma IT encontrada
                </h3>
                <p className="text-gray-600 mb-4">
                  Tente ajustar os filtros ou usar termos diferentes na busca.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFiltros({});
                    setCategoriaSelecionada('');
                    setInstrucoes(todasInstrucoes);
                  }}
                >
                  Limpar Filtros
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}