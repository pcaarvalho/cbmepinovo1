'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, FileText, ArrowRight } from 'lucide-react';
import IntelligentSearchBar from '@/components/ui/IntelligentSearchBar';
// import SimpleChatSearch from '@/components/ui/SimpleChatSearch';

// Dados das categorias
const CATEGORIAS_IT = [
  { id: 'geral', nome: 'Procedimentos Gerais', icone: '📋', count: 15 },
  { id: 'saidas', nome: 'Saídas de Emergência', icone: '🚪', count: 8 },
  { id: 'iluminacao', nome: 'Iluminação e Sinalização', icone: '💡', count: 12 },
  { id: 'extintores', nome: 'Sistemas de Extintores', icone: '🧯', count: 10 },
  { id: 'hidrantes', nome: 'Sistemas de Hidrantes', icone: '🚰', count: 7 },
  { id: 'diversos', nome: 'Diversos', icone: '📝', count: 20 }
];

// ITs mais populares
const ITS_POPULARES = [
  { id: 'IT-001', numero: 'IT-001/2019', titulo: 'Procedimentos Administrativos', descricao: 'Estabelece critérios para tramitação de processos' },
  { id: 'IT-008', numero: 'IT-008/2019', titulo: 'Saídas de Emergência', descricao: 'Dimensionamento e características das saídas' },
  { id: 'IT-018', numero: 'IT-018/2019', titulo: 'Iluminação de Emergência', descricao: 'Sistemas de iluminação e sinalização de emergência' },
  { id: 'IT-021', numero: 'IT-021/2019', titulo: 'Sistema de Proteção por Extintores', descricao: 'Instalação e manutenção de extintores' }
];

// Componente para card de categoria
function CategoryCard({ categoria }: { categoria: typeof CATEGORIAS_IT[0] }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 text-center space-y-4 hover:shadow-md transition-shadow cursor-pointer">
      <div className="text-4xl">{categoria.icone}</div>
      <h3 className="text-xl font-semibold text-gray-900">{categoria.nome}</h3>
      <div className="text-sm text-red-600 font-medium">
        {categoria.count} instruções
      </div>
    </div>
  );
}

// Componente para card de IT
function ITCard({ instrucao }: { instrucao: typeof ITS_POPULARES[0] }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="text-sm font-medium text-red-600 mb-1">
              {instrucao.numero}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {instrucao.titulo}
            </h3>
            <p className="text-gray-600 text-sm">
              {instrucao.descricao}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/pesquisar?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSuggestionSelect = (suggestion: { type: string; title: string; id?: string }) => {
    if (suggestion.type === 'instruction') {
      // Navegar diretamente para a instrução específica
      router.push(`/biblioteca/${suggestion.id}`);
    } else if (suggestion.type === 'category') {
      // Navegar para busca filtrada por categoria
      router.push(`/pesquisar?categoria=${encodeURIComponent(suggestion.title)}`);
    } else {
      // Fazer busca padrão
      handleSearch(suggestion.title);
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-red-600 to-red-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold">
              Instruções Técnicas
              <span className="block text-red-200">CB-PI</span>
            </h1>
            <p className="text-xl md:text-2xl text-red-100 max-w-3xl mx-auto">
              Sistema inteligente de consulta às Instruções Técnicas do Corpo de Bombeiros do Piauí
              com análise de conformidade de memoriais descritivos
            </p>
            
            {/* Chat AI Search */}
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-lg p-4 shadow-lg">
                <p className="text-gray-600">Chat AI temporariamente desabilitado</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => router.push('/pesquisar')}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-red-600 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Search className="w-5 h-5 mr-2" />
                Explorar Todas as ITs
              </button>
              <button
                onClick={() => router.push('/memorial')}
                className="inline-flex items-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
              >
                <FileText className="w-5 h-5 mr-2" />
                Analisar Memorial
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Categorias de ITs</h2>
          <p className="text-xl text-gray-600">
            Explore as instruções técnicas organizadas por categoria
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIAS_IT.map((categoria) => (
            <CategoryCard key={categoria.id} categoria={categoria} />
          ))}
        </div>
      </section>

      {/* Popular ITs Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              ITs Mais Consultadas
            </h2>
            <p className="text-xl text-gray-600 mt-2">
              As instruções técnicas mais acessadas pelos usuários
            </p>
          </div>
          <button
            onClick={() => router.push('/biblioteca')}
            className="hidden sm:inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Ver Todas
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {ITS_POPULARES.map((it) => (
            <ITCard key={it.id} instrucao={it} />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Recursos Disponíveis</h2>
            <p className="text-xl text-gray-600">
              Ferramentas para facilitar o trabalho com as Instruções Técnicas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <Search className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Busca Inteligente</h3>
              <p className="text-gray-600">
                Encontre rapidamente as ITs usando linguagem natural ou palavras-chave específicas
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <FileText className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Análise de Memorial</h3>
              <p className="text-gray-600">
                Faça upload de memoriais descritivos e receba análise automatizada de conformidade
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <FileText className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Biblioteca Organizada</h3>
              <p className="text-gray-600">
                Acesse todas as ITs organizadas por categoria com visualizador integrado
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}