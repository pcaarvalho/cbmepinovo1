// AIDEV-EXPLANATION: Página de biblioteca com layout unificado
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Library, FileText, Grid, List, Filter, ExternalLink, BookOpen, Download, Folder } from 'lucide-react';
import { instrucoesTecnicas } from '@/lib/instrucoes-scraped';
import CardContainer from '@/components/layout/CardContainer';
import PageHeader from '@/components/layout/PageHeader';

// Interface para instruções do scraper
interface InstrucaoScraped {
  id: number;
  titulo: string;
  url: string;
  nomeArquivo: string;
  categoria: string;
  status: string;
  origem: string;
}

export default function BibliotecaPage() {
  const searchParams = useSearchParams();
  const [instrucoes, setInstrucoes] = useState<InstrucaoScraped[]>(instrucoesTecnicas);
  const [filtros, setFiltros] = useState<{ termo?: string; categoria?: string }>({});
  const [visualizacao, setVisualizacao] = useState<'grid' | 'list'>('grid');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>('');

  // Extrair categorias únicas dos dados
  const categorias = [...new Set(instrucoesTecnicas.map(it => it.categoria))];

  useEffect(() => {
    const categoria = searchParams.get('categoria');
    if (categoria) {
      setCategoriaSelecionada(categoria);
      setFiltros({ categoria });
      filtrarInstrucoes({ categoria });
    }
  }, [searchParams]);

  const filtrarInstrucoes = (novosFiltros: { termo?: string; categoria?: string }) => {
    let resultado = instrucoesTecnicas;

    if (novosFiltros.termo) {
      resultado = resultado.filter(it =>
        it.titulo.toLowerCase().includes(novosFiltros.termo!.toLowerCase()) ||
        it.nomeArquivo.toLowerCase().includes(novosFiltros.termo!.toLowerCase()) ||
        it.id.toString().includes(novosFiltros.termo!)
      );
    }

    if (novosFiltros.categoria) {
      resultado = resultado.filter(it => it.categoria === novosFiltros.categoria);
    }

    setInstrucoes(resultado);
  };

  const handleFiltroChange = (novosFiltros: { termo?: string; categoria?: string }) => {
    setFiltros(novosFiltros);
    filtrarInstrucoes(novosFiltros);
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

  const abrirPDF = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header da página */}
        <PageHeader
          title="Biblioteca de Instruções Técnicas"
          subtitle={`Acesso completo às ${instrucoesTecnicas.length} Instruções Técnicas do CBMEPI`}
          icon={Library}
          badge="Atualizado"
        >
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-zinc-800/50 backdrop-blur border border-zinc-700/50 rounded-lg px-4 py-2">
              <span className="text-sm text-zinc-400">Visualização:</span>
              <button
                onClick={() => setVisualizacao('grid')}
                className={`p-1.5 rounded transition-colors ${
                  visualizacao === 'grid' 
                    ? 'bg-red-600/20 text-red-400' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setVisualizacao('list')}
                className={`p-1.5 rounded transition-colors ${
                  visualizacao === 'list' 
                    ? 'bg-red-600/20 text-red-400' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </PageHeader>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-80 space-y-6">
            {/* Busca */}
            <CardContainer variant="glass" padding="sm">
              <div className="relative">
                <input
                  type="text"
                  placeholder={`Buscar em ${instrucoesTecnicas.length} ITs...`}
                  value={filtros.termo || ''}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-500 focus:border-red-600/50 focus:outline-none focus:ring-1 focus:ring-red-600/50"
                />
              </div>
            </CardContainer>

            {/* Estatísticas */}
            <CardContainer variant="glass" padding="md">
              <h3 className="font-semibold text-white mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Estatísticas
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Total de ITs:</span>
                  <span className="font-bold text-green-400">{instrucoesTecnicas.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Resultados:</span>
                  <span className="font-bold text-white">{instrucoes.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Categorias:</span>
                  <span className="font-bold text-white">{categorias.length}</span>
                </div>
              </div>
            </CardContainer>

            {/* Filtro por Categoria */}
            <CardContainer variant="glass" padding="md">
              <h3 className="font-semibold text-white mb-4 flex items-center">
                <Folder className="w-5 h-5 mr-2" />
                Categorias
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleCategoriaChange('')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                    !categoriaSelecionada
                      ? 'bg-red-600/20 text-red-400 border border-red-600/30'
                      : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                  }`}
                >
                  Todas as categorias ({instrucoesTecnicas.length})
                </button>
                {categorias.map((categoria) => {
                  const count = instrucoesTecnicas.filter(it => it.categoria === categoria).length;
                  return (
                    <button
                      key={categoria}
                      onClick={() => handleCategoriaChange(categoria)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                        categoriaSelecionada === categoria
                          ? 'bg-red-600/20 text-red-400 border border-red-600/30'
                          : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{categoria}</span>
                        <span className="text-xs bg-zinc-800/50 px-2 py-1 rounded-full">
                          {count}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContainer>
          </div>

          {/* Conteúdo Principal */}
          <div className="flex-1">
            {/* Contador de Resultados */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-zinc-400">
                Exibindo <span className="font-semibold text-white">{instrucoes.length}</span> de{' '}
                <span className="font-semibold text-white">{instrucoesTecnicas.length}</span> instruções técnicas
              </p>
              <div className="flex items-center space-x-2 text-sm text-zinc-500">
                <Filter className="w-4 h-4" />
                <span>Ordenadas por ID</span>
              </div>
            </div>

            {/* Grid de ITs */}
            {visualizacao === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {instrucoes.map((it) => (
                  <CardContainer 
                    key={it.id} 
                    variant="glass" 
                    padding="md" 
                    animate
                    className="cursor-pointer group"
                    onClick={() => abrirPDF(it.url)}
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-red-400 mb-2">
                            IT #{it.id.toString().padStart(3, '0')}
                          </div>
                          <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-red-400 transition-colors">
                            {it.titulo}
                          </h3>
                        </div>
                        <ExternalLink className="w-5 h-5 text-zinc-500 group-hover:text-red-400 flex-shrink-0 ml-2 transition-colors" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center text-xs text-zinc-500">
                          <span className="mr-2">Arquivo:</span>
                          <span className="font-mono bg-zinc-800/50 px-2 py-1 rounded">
                            {it.nomeArquivo}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-full border border-blue-600/30">
                            {it.categoria}
                          </span>
                          <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded-full border border-green-600/30">
                            {it.origem}
                          </span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-zinc-800">
                        <button className="w-full px-4 py-2 bg-zinc-800/50 hover:bg-red-600/20 border border-zinc-700/50 hover:border-red-600/50 rounded-lg text-sm text-zinc-300 hover:text-red-400 transition-all flex items-center justify-center space-x-2">
                          <FileText className="w-4 h-4" />
                          <span>Abrir PDF</span>
                        </button>
                      </div>
                    </div>
                  </CardContainer>
                ))}
              </div>
            ) : (
              /* Lista de ITs */
              <div className="space-y-4">
                {instrucoes.map((it) => (
                  <CardContainer 
                    key={it.id} 
                    variant="glass" 
                    padding="md" 
                    animate
                    className="cursor-pointer group"
                    onClick={() => abrirPDF(it.url)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center flex-wrap gap-3 mb-3">
                          <span className="text-sm font-medium text-red-400">
                            IT #{it.id.toString().padStart(3, '0')}
                          </span>
                          <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-full border border-blue-600/30">
                            {it.categoria}
                          </span>
                          <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded-full border border-green-600/30">
                            {it.origem}
                          </span>
                        </div>
                        
                        <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-red-400 transition-colors">
                          {it.titulo}
                        </h3>
                        
                        <div className="flex items-center text-sm text-zinc-500">
                          <span className="mr-2">Arquivo:</span>
                          <span className="font-mono bg-zinc-800/50 px-2 py-1 rounded">
                            {it.nomeArquivo}
                          </span>
                        </div>
                      </div>
                      
                      <div className="ml-6 flex items-center space-x-3">
                        <ExternalLink className="w-5 h-5 text-zinc-500 group-hover:text-red-400 transition-colors" />
                        <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2">
                          <FileText className="w-4 h-4" />
                          <span>Abrir PDF</span>
                        </button>
                      </div>
                    </div>
                  </CardContainer>
                ))}
              </div>
            )}

            {/* Mensagem quando não há resultados */}
            {instrucoes.length === 0 && (
              <CardContainer variant="glass" className="text-center py-16">
                <Library className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Nenhuma IT encontrada
                </h3>
                <p className="text-zinc-400 mb-6">
                  Tente ajustar os filtros ou usar termos diferentes na busca.
                </p>
                <button
                  onClick={() => {
                    setFiltros({});
                    setCategoriaSelecionada('');
                    setInstrucoes(instrucoesTecnicas);
                  }}
                  className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors"
                >
                  Limpar Filtros
                </button>
              </CardContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}