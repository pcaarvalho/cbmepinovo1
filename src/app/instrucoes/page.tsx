'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Search, Filter, Download, Eye, Calendar, Tag, FileText, ChevronRight, Grid, List } from 'lucide-react';
import CardContainer from '@/components/layout/CardContainer';
import PageHeader from '@/components/layout/PageHeader';
import instrucoesData from '@/data/instrucoes-scraped.json';
import Link from 'next/link';

interface InstrucaoTecnica {
  id: string;
  titulo: string;
  categoria: string;
  descricao?: string;
  url: string;
  nomeArquivo: string;
  dataAtualizacao?: string;
  tags?: string[];
  visualizacoes?: number;
}

export default function InstrucoesPage() {
  const [instrucoes, setInstrucoes] = useState<InstrucaoTecnica[]>([]);
  const [filteredInstrucoes, setFilteredInstrucoes] = useState<InstrucaoTecnica[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);

  // Categorias únicas
  const categories = [
    { value: 'all', label: 'Todas as Categorias', count: 105 },
    { value: 'seguranca', label: 'Segurança', count: 25 },
    { value: 'emergencia', label: 'Emergência', count: 18 },
    { value: 'instalacoes', label: 'Instalações', count: 22 },
    { value: 'prevencao', label: 'Prevenção', count: 20 },
    { value: 'normas', label: 'Normas Gerais', count: 20 },
  ];

  useEffect(() => {
    // Simular carregamento e processar dados
    setTimeout(() => {
      const processedData = instrucoesData.map((item: any, index: number) => ({
        id: item.id?.toString() || `IT-${index + 1}`,
        titulo: item.titulo || 'Sem título',
        categoria: item.categoria || 'Geral',
        descricao: item.descricao || `Instrução Técnica sobre ${item.titulo}`,
        url: item.url || '#',
        nomeArquivo: item.nomeArquivo || 'arquivo.pdf',
        dataAtualizacao: '2024-01-15', // Mock date
        tags: item.tags || ['normativa', 'técnica'],
        visualizacoes: Math.floor(Math.random() * 1000) + 100
      }));
      setInstrucoes(processedData);
      setFilteredInstrucoes(processedData);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    // Filtrar instruções
    let filtered = instrucoes;

    // Filtro por categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(it => 
        it.categoria.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(it => 
        it.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        it.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        it.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredInstrucoes(filtered);
  }, [searchTerm, selectedCategory, instrucoes]);

  return (
    <div className="min-h-[calc(100vh-4rem)] pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <PageHeader
          title="Instruções Técnicas"
          subtitle="Acesse todas as 105 Instruções Técnicas do CBMEPI sempre atualizadas"
          icon={BookOpen}
          badge="105 ITs"
        />

        {/* Filtros e Busca */}
        <CardContainer variant="glass" className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Buscar por título, número ou palavra-chave..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>
            </div>

            {/* Filtro por Categoria */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label} ({cat.count})
                </option>
              ))}
            </select>

            {/* Toggle View Mode */}
            <div className="flex items-center space-x-2 bg-zinc-800/50 border border-zinc-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-red-600 text-white' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-red-600 text-white' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </CardContainer>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <CardContainer variant="glass" padding="sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{filteredInstrucoes.length}</div>
              <div className="text-sm text-zinc-400">ITs Disponíveis</div>
            </div>
          </CardContainer>
          <CardContainer variant="glass" padding="sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">2024</div>
              <div className="text-sm text-zinc-400">Última Atualização</div>
            </div>
          </CardContainer>
          <CardContainer variant="glass" padding="sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">PDF</div>
              <div className="text-sm text-zinc-400">Formato Digital</div>
            </div>
          </CardContainer>
          <CardContainer variant="glass" padding="sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">24/7</div>
              <div className="text-sm text-zinc-400">Acesso Online</div>
            </div>
          </CardContainer>
        </div>

        {/* Lista de Instruções */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredInstrucoes.length === 0 ? (
          <CardContainer variant="glass" className="text-center py-16">
            <FileText className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Nenhuma instrução encontrada
            </h3>
            <p className="text-zinc-400">
              Tente ajustar os filtros ou termos de busca
            </p>
          </CardContainer>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInstrucoes.map((it) => (
              <CardContainer
                key={it.id}
                variant="glass"
                className="group hover:border-red-600/50 transition-all duration-300"
                animate
              >
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-red-600/10 rounded-lg flex items-center justify-center group-hover:bg-red-600/20 transition-colors">
                        <FileText className="w-6 h-6 text-red-400" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-red-400">{it.id}</span>
                        <div className="flex items-center space-x-2 text-xs text-zinc-500">
                          <Calendar className="w-3 h-3" />
                          <span>{it.dataAtualizacao}</span>
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-zinc-800 text-xs text-zinc-400 rounded">
                      {it.categoria}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                      {it.titulo}
                    </h3>
                    <p className="text-sm text-zinc-400 mb-4 line-clamp-3">
                      {it.descricao}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {it.tags?.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center space-x-1 px-2 py-1 bg-zinc-800/50 text-xs text-zinc-400 rounded"
                      >
                        <Tag className="w-3 h-3" />
                        <span>{tag}</span>
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                    <div className="flex items-center space-x-1 text-xs text-zinc-500">
                      <Eye className="w-3 h-3" />
                      <span>{it.visualizacoes} visualizações</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <a
                        href={it.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded text-white text-sm font-medium transition-colors"
                      >
                        <span>Abrir PDF</span>
                        <ChevronRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </CardContainer>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInstrucoes.map((it) => (
              <CardContainer
                key={it.id}
                variant="glass"
                className="group hover:border-red-600/50 transition-all duration-300"
                animate
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-red-600/10 rounded-lg flex items-center justify-center group-hover:bg-red-600/20 transition-colors">
                      <FileText className="w-6 h-6 text-red-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <span className="text-sm font-semibold text-red-400">{it.id}</span>
                        <span className="px-2 py-1 bg-zinc-800 text-xs text-zinc-400 rounded">
                          {it.categoria}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {it.titulo}
                      </h3>
                      <div className="flex items-center space-x-4 text-xs text-zinc-500">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{it.dataAtualizacao}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>{it.visualizacoes} visualizações</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <a
                    href={it.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Baixar PDF</span>
                  </a>
                </div>
              </CardContainer>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}