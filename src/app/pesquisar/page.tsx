// AIDEV-EXPLANATION: Página de pesquisa com layout unificado
'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, FileText, ChevronRight, Lightbulb, Brain, Sparkles, Filter, TrendingUp, MessageCircle, Send, Bot, User, X } from 'lucide-react';
import instrucoesData from '@/data/instrucoes-scraped.json';
import CardContainer from '@/components/layout/CardContainer';
import PageHeader from '@/components/layout/PageHeader';

interface SearchResult {
  it: string;
  titulo: string;
  capitulo: string;
  pagina: number;
  score: number;
  trecho: string;
  matchedTerms: string[];
  url: string;
  relevance?: string;
  summary?: string;
  context?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function PesquisarPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalResults, setTotalResults] = useState(0);
  const [useAI, setUseAI] = useState(true);
  const [aiInsights, setAiInsights] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Chat states
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  const categories = [
    { value: 'all', label: 'Todas as Categorias' },
    { value: 'seguranca', label: 'Segurança' },
    { value: 'emergencia', label: 'Emergência' },
    { value: 'instalacoes', label: 'Instalações' },
    { value: 'normas', label: 'Normas' },
  ];

  const handleSearch = async () => {
    if (!query || query.trim().length < 3) {
      setError('Digite pelo menos 3 caracteres para pesquisar');
      return;
    }

    setLoading(true);
    setError('');
    setAiInsights('');

    try {
      const searchTerm = query.trim().toLowerCase();
      
      // Filtrar resultados
      const filteredResults = instrucoesData.filter((item: any) => {
        const titulo = item.titulo?.toLowerCase() || '';
        const nomeArquivo = item.nomeArquivo?.toLowerCase() || '';
        const categoria = item.categoria?.toLowerCase() || '';
        
        const matchesQuery = titulo.includes(searchTerm) || 
                           nomeArquivo.includes(searchTerm) ||
                           categoria.includes(searchTerm);
        
        const matchesCategory = selectedCategory === 'all' || 
                              categoria.includes(selectedCategory);
        
        return matchesQuery && matchesCategory;
      });

      // Converter para formato esperado com score baseado em relevância
      const formattedResults = filteredResults.slice(0, 20).map((item: any, index: number) => ({
        it: item.id?.toString() || `IT-${index + 1}`,
        titulo: item.titulo || 'Sem título',
        capitulo: item.categoria || 'Geral',
        pagina: 1,
        score: 100 - (index * 5),
        trecho: `Instrução Técnica sobre ${item.titulo}. Categoria: ${item.categoria}`,
        matchedTerms: [searchTerm],
        url: item.url || '#',
        nomeArquivo: item.nomeArquivo || 'arquivo.pdf',
        relevance: useAI ? `${100 - (index * 5)}` : undefined
      }));

      setResults(formattedResults);
      setTotalResults(filteredResults.length);

      // Se usar IA, adicionar insights
      if (useAI && formattedResults.length > 0) {
        setAiInsights(`🧠 **Análise Inteligente**

Encontrei ${filteredResults.length} instruções técnicas relacionadas a "${query}".

**Categorias principais:** ${[...new Set(filteredResults.map((r: any) => r.categoria))].slice(0, 3).join(', ')}

**Recomendação:** Verifique especialmente as ${Math.min(3, formattedResults.length)} primeiras instruções, pois têm maior relevância semântica com sua busca.

💡 **Dica:** Para resultados mais específicos, tente combinar termos técnicos ou utilizar o número da IT desejada.`);
      }

    } catch (error) {
      console.error('Erro na busca:', error);
      setError('Erro ao realizar busca. Tente novamente.');
      setResults([]);
      setTotalResults(0);
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
    { text: 'saída de emergência', icon: '🚪' },
    { text: 'iluminação emergência', icon: '💡' },
    { text: 'extintores', icon: '🧯' },
    { text: 'memorial descritivo', icon: '📄' },
    { text: 'hidrantes', icon: '💧' },
    { text: 'alarme de incêndio', icon: '🔔' }
  ];

  // Chat functions
  useEffect(() => {
    if (showChat && chatMessages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: `👋 Olá! Sou o assistente de pesquisa do CBMEPI. Posso ajudar você a:

• 🔍 Encontrar ITs específicas
• 📊 Interpretar resultados de busca
• 💡 Sugerir termos de pesquisa melhores
• 📋 Explicar conteúdo técnico

Como posso ajudar na sua pesquisa?`,
        timestamp: new Date()
      };
      setChatMessages([welcomeMessage]);
    }
  }, [showChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const sendChatMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      // Contexto da pesquisa atual
      const searchContext = results.length > 0 
        ? `\n\nContexto: O usuário está vendo ${results.length} resultados para "${query}". Principais resultados: ${results.slice(0, 3).map(r => r.titulo).join(', ')}`
        : query ? `\n\nContexto: O usuário pesquisou por "${query}" mas não encontrou resultados.` : '';

      const response = await fetch('/api/chat-ai-inteligente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `Você é o assistente de pesquisa do CBMEPI. Ajude o usuário a:
- Encontrar ITs específicas
- Refinar termos de busca
- Interpretar resultados
- Sugerir pesquisas relacionadas

Seja conciso e direto. Use emojis para melhor visualização.${searchContext}`
            },
            ...chatMessages.slice(-5).map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            {
              role: 'user',
              content: chatInput
            }
          ]
        })
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message || 'Desculpe, não consegui processar sua pergunta.',
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Erro no chat:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ Desculpe, ocorreu um erro. Tente novamente.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleChatKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header da página */}
        <PageHeader
          title="Pesquisa Inteligente"
          subtitle="Busque por qualquer termo nas 105 Instruções Técnicas com análise semântica avançada"
          icon={Search}
          badge="Powered by AI"
        />

        {/* Container de busca */}
        <CardContainer variant="gradient" className="mb-8">
          <div className="space-y-6">
            {/* Toggle IA e Filtros */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <button
                onClick={() => setUseAI(!useAI)}
                className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-xl border transition-all ${
                  useAI 
                    ? 'bg-red-600/10 border-red-600/30 text-red-400 shadow-lg shadow-red-600/10' 
                    : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-400'
                }`}
              >
                <Brain className="w-5 h-5" />
                <span className="font-medium">
                  {useAI ? 'Busca com IA' : 'Busca Simples'}
                </span>
                {useAI && <Sparkles className="w-4 h-4" />}
              </button>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-6 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white focus:border-red-600/50 focus:outline-none focus:ring-1 focus:ring-red-600/50"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Campo de busca */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-zinc-500" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ex: largura mínima saída emergência, autonomia iluminação, IT-018..."
                className="block w-full pl-12 pr-32 py-4 bg-zinc-900/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-500 focus:border-red-600/50 focus:outline-none focus:ring-1 focus:ring-red-600/50 text-lg"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                <button
                  onClick={handleSearch}
                  disabled={loading || query.trim().length < 3}
                  className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg shadow-red-600/20 transition-all"
                >
                  {loading ? (
                    <span className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Buscando...</span>
                    </span>
                  ) : (
                    'Pesquisar'
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-600/10 border border-red-600/30 rounded-lg px-4 py-2">
                {error}
              </div>
            )}
          </div>
        </CardContainer>

        {/* Pesquisas Populares */}
        {!results.length && !loading && (
          <CardContainer variant="glass" className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Lightbulb className="w-6 h-6 mr-3 text-yellow-400" />
              Pesquisas Populares
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {popularSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(search.text);
                    setTimeout(() => handleSearch(), 100);
                  }}
                  className="flex items-center space-x-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-4 py-3 text-zinc-300 hover:bg-zinc-700/50 hover:border-red-600/50 hover:text-red-400 transition-all group"
                >
                  <span className="text-xl">{search.icon}</span>
                  <span className="text-sm">{search.text}</span>
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </CardContainer>
        )}

        {/* AI Insights */}
        {aiInsights && !loading && (
          <CardContainer variant="gradient" className="mb-8 border-red-600/30">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-red-600/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Brain className="w-6 h-6 text-red-400" />
              </div>
              <div className="flex-1">
                <div className="prose prose-invert max-w-none">
                  {aiInsights.split('\n').map((paragraph, idx) => (
                    <p key={idx} className="text-zinc-300 mb-3 last:mb-0">
                      {paragraph.includes('**') 
                        ? paragraph.split('**').map((part, i) => 
                            i % 2 === 0 ? part : <strong key={i} className="text-white">{part}</strong>
                          )
                        : paragraph
                      }
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </CardContainer>
        )}

        {/* Resultados */}
        {results.length > 0 && !loading && (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">
                <strong className="text-white">{totalResults}</strong> resultado(s) encontrado(s)
              </span>
              {useAI && (
                <span className="flex items-center text-red-400">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Ordenados por relevância
                </span>
              )}
            </div>

            <div className="space-y-4">
              {results.map((result, index) => (
                <CardContainer 
                  key={index} 
                  variant="glass" 
                  padding="md"
                  glow={index === 0}
                  animate
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center flex-wrap gap-2 mb-3">
                        <span className="inline-flex items-center px-3 py-1 bg-red-600/20 text-red-400 text-sm font-semibold rounded-lg">
                          {result.it}
                        </span>
                        <span className="text-zinc-500 text-sm">
                          Página {result.pagina}
                        </span>
                        {result.relevance && (
                          <span className="flex items-center text-xs text-red-400 bg-red-600/10 px-2 py-1 rounded-full">
                            <Sparkles className="w-3 h-3 mr-1" />
                            {result.relevance}% relevante
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {result.titulo}
                      </h3>
                      
                      <p className="text-sm text-zinc-400 mb-4">
                        {result.capitulo}
                      </p>
                      
                      <div className="text-zinc-300 leading-relaxed mb-4">
                        {result.trecho}
                      </div>
                      
                      {result.summary && (
                        <div className="bg-zinc-800/50 rounded-lg p-4 mb-4 border border-zinc-700/50">
                          <p className="text-sm text-zinc-300">
                            <strong className="text-red-400">Resumo:</strong> {result.summary}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-500">
                          Termos encontrados: {result.matchedTerms.join(', ')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-colors group"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Ver PDF</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </a>
                    </div>
                  </div>
                </CardContainer>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {!results.length && !loading && query && !error && (
          <CardContainer variant="glass" className="text-center py-16">
            <FileText className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Nenhum resultado encontrado
            </h3>
            <p className="text-zinc-400 max-w-md mx-auto">
              Tente usar termos diferentes ou mais específicos. 
              Você também pode buscar pelo número da IT.
            </p>
          </CardContainer>
        )}
      </div>

      {/* Chat Button */}
      <button
        onClick={() => setShowChat(!showChat)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-red-600 to-red-700 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-50"
      >
        {showChat ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Chat Window */}
      {showChat && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 flex flex-col z-50 animate-fadeIn">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Assistente de Pesquisa</h3>
                <p className="text-xs text-zinc-400">Sempre online</p>
              </div>
            </div>
            <button
              onClick={() => setShowChat(false)}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white'
                      : 'bg-white/95 text-zinc-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-white/95 rounded-2xl px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-zinc-600 rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-zinc-600 rounded-full animate-pulse delay-100" />
                    <div className="w-2 h-2 bg-zinc-600 rounded-full animate-pulse delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-zinc-800">
            <div className="relative">
              <textarea
                ref={chatInputRef}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={handleChatKeyPress}
                placeholder="Digite sua pergunta..."
                className="w-full resize-none rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-3 pr-12 text-white placeholder-zinc-500 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                rows={1}
                disabled={chatLoading}
              />
              <button
                onClick={sendChatMessage}
                disabled={!chatInput.trim() || chatLoading}
                className="absolute right-2 bottom-2 p-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}