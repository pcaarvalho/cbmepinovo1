'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Library, FileText, Grid, List, Filter, ExternalLink } from 'lucide-react';
import SearchInput from '@/components/ui/SearchInput';
import Button from '@/components/ui/Button';
import Card, { CardContent } from '@/components/ui/Card';
import { instrucoesTecnicas } from '@/lib/instrucoes-scraped';

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

export default function BibliotecaContentScraped() {
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
        it.nomeArquivo.toLowerCase().includes(novosFiltros.termo!.toLowerCase())
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Library className="w-8 h-8 text-red-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Biblioteca Completa de ITs
            </h1>
            <p className="text-gray-600">
              <span className="font-semibold text-green-600">{instrucoesTecnicas.length} Instruções Técnicas</span> extraídas do site oficial do CBMEPI
            </p>
            <p className="text-sm text-gray-500">
              Dados atualizados automaticamente via scraper
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
                  placeholder={`Buscar em ${instrucoesTecnicas.length} ITs...`}
                  value={filtros.termo || ''}
                  onSearch={handleSearch}
                />
              </CardContent>
            </Card>

            {/* Estatísticas */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Estatísticas</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total de ITs:</span>
                    <span className="font-bold text-green-600">{instrucoesTecnicas.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Resultados atuais:</span>
                    <span className="font-bold">{instrucoes.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Categorias:</span>
                    <span className="font-bold">{categorias.length}</span>
                  </div>
                </div>
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
                    Todas as categorias ({instrucoesTecnicas.length})
                  </button>
                  {categorias.map((categoria) => {
                    const count = instrucoesTecnicas.filter(it => it.categoria === categoria).length;
                    return (
                      <button
                        key={categoria}
                        onClick={() => handleCategoriaChange(categoria)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          categoriaSelecionada === categoria
                            ? 'bg-red-100 text-red-700'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{categoria}</span>
                          <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                            {count}
                          </span>
                        </div>
                      </button>
                    );
                  })}
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
              <span className="font-semibold">{instrucoes.length}</span> de <span className="font-semibold">{instrucoesTecnicas.length}</span> instruções técnicas
            </p>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                Ordenadas por ID
              </span>
            </div>
          </div>

          {/* Grid de ITs */}
          {visualizacao === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {instrucoes.map((it) => (
                <Card key={it.id} hover className="h-full cursor-pointer" onClick={() => abrirPDF(it.url)}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-red-600 mb-1">
                            IT #{it.id}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                            {it.titulo}
                          </h3>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center text-xs text-gray-500">
                          <span className="mr-1">Arquivo:</span>
                          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                            {it.nomeArquivo}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-xs text-gray-500">
                          <span className="mr-1">Categoria:</span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                            {it.categoria}
                          </span>
                        </div>

                        <div className="flex items-center text-xs text-gray-500">
                          <span className="mr-1">Origem:</span>
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">
                            {it.origem}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-100">
                        <Button variant="outline" size="sm" className="w-full">
                          <FileText className="w-4 h-4 mr-2" />
                          Abrir PDF
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            /* Lista de ITs */
            <div className="space-y-4">
              {instrucoes.map((it) => (
                <Card key={it.id} hover className="cursor-pointer" onClick={() => abrirPDF(it.url)}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-sm font-medium text-red-600">
                            IT #{it.id}
                          </span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                            {it.categoria}
                          </span>
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                            {it.origem}
                          </span>
                        </div>
                        
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {it.titulo}
                        </h3>
                        
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="mr-1">Arquivo:</span>
                          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                            {it.nomeArquivo}
                          </span>
                        </div>
                      </div>
                      
                      <div className="ml-6 flex items-center space-x-2">
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                        <Button variant="outline" size="sm">
                          <FileText className="w-4 h-4 mr-2" />
                          Abrir PDF
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
                    setInstrucoes(instrucoesTecnicas);
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