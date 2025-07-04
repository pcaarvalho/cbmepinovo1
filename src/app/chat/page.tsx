// AIDEV-EXPLANATION: Página de chat com layout unificado
'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Copy, Brain, MessageCircle, User, Bot, CheckCircle, Sparkles, RotateCcw } from 'lucide-react';
import CardContainer from '@/components/layout/CardContainer';
import PageHeader from '@/components/layout/PageHeader';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
}

const SUGGESTION_CHIPS = [
  "Quantos extintores preciso?",
  "Normas para restaurante", 
  "Como calcular saídas de emergência",
  "ITs para posto de combustível",
  "Dimensionamento de hidrantes",
  "Iluminação de emergência obrigatória"
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mensagem de boas-vindas
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: `👋 Olá! Sou o assistente superinteligente do CBMEPI, especializado nas 105 Instruções Técnicas.

Posso ajudar com:
• 🧯 Dimensionamento de extintores e sistemas
• 💧 Cálculos de hidrantes e RTI
• 🚪 Saídas de emergência e rotas de fuga
• 🏢 Normas específicas por tipo de edificação
• 📋 Análise de conformidade
• 💡 Orientações técnicas detalhadas

Como posso ajudar você hoje?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  const generateKnowledgeBase = () => {
    return `INSTRUÇÕES TÉCNICAS DO CBMEPI - BASE COMPLETA:

SISTEMA SUPERINTELIGENTE COM:
- Análise contextual profunda
- Respostas estruturadas (Base Legal, Aplicabilidade, Alertas)
- Auto-aprendizado contínuo
- Validação de qualidade em tempo real

INSTRUÇÕES PRINCIPAIS:
• IT-001: Procedimentos administrativos
• IT-008: Saídas de emergência
• IT-011: Sinalização de emergência
• IT-018: Iluminação de emergência
• IT-020: Sinalização de emergência
• IT-021: Sistema de proteção por extintores
• IT-022: Sistema de hidrantes e mangotinhos
• IT-023: Sistemas de chuveiros automáticos
• IT-025: Segurança contra incêndio para líquidos combustíveis e inflamáveis

SEMPRE:
1. Cite a IT específica com artigos
2. Forneça base legal completa
3. Inclua aplicabilidade prática
4. Adicione alertas técnicos relevantes
5. Sugira ITs relacionadas`;
  };

  const extractITReferences = (text: string): string[] => {
    const matches = text.match(/IT-\d+/g);
    return matches ? [...new Set(matches)] : [];
  };

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat-ai-inteligente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...messages.filter(msg => msg.role !== 'assistant' || msg.id === 'welcome').slice(-5).map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            {
              role: 'user',
              content: messageText
            }
          ]
        })
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message || 'Desculpe, não consegui processar sua pergunta.',
          timestamp: new Date(),
          sources: extractITReferences(data.message || '')
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || 'Erro na comunicação');
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant', 
        content: 'Desculpe, ocorreu um erro. Tente novamente em alguns instantes.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    sendMessage(suggestion);
  };

  const copyMessage = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
    }
  };

  const newChat = () => {
    setMessages([]);
    setInput('');
    setTimeout(() => {
      const welcomeMessage: Message = {
        id: 'welcome-new',
        role: 'assistant',
        content: `👋 Olá! Sou o assistente superinteligente do CBMEPI, especializado nas 105 Instruções Técnicas.

Posso ajudar com:
• 🧯 Dimensionamento de extintores e sistemas
• 💧 Cálculos de hidrantes e RTI
• 🚪 Saídas de emergência e rotas de fuga
• 🏢 Normas específicas por tipo de edificação
• 📋 Análise de conformidade
• 💡 Orientações técnicas detalhadas

Como posso ajudar você hoje?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const isFirstMessage = messages.length <= 1;

  return (
    <div className="min-h-[calc(100vh-4rem)] pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header da página */}
        <PageHeader
          title="Chat IA Superinteligente"
          subtitle="Converse com nossa IA especializada em todas as 105 Instruções Técnicas do CBMEPI"
          icon={Brain}
          badge="Powered by AI"
        >
          <button
            onClick={newChat}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Nova Conversa</span>
          </button>
        </PageHeader>

        {/* Container principal do chat */}
        <CardContainer variant="default" className="flex flex-col h-[calc(100vh-20rem)] bg-zinc-50/50">
          {/* Área de mensagens */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                )}
                
                <div
                  className={`max-w-3xl ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl px-5 py-3 shadow-lg'
                      : 'bg-white/95 backdrop-blur rounded-2xl px-5 py-3 border border-zinc-200 shadow-sm text-zinc-900'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </div>

                  {/* Fontes/Referências */}
                  {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-zinc-200">
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs text-zinc-600">Referências:</span>
                        {message.sources.map((source, index) => (
                          <span
                            key={index}
                            className="inline-block px-2 py-1 bg-red-600/10 text-red-600 text-xs rounded-md font-medium"
                          >
                            {source}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {message.role === 'assistant' && (
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-200">
                      <span className="text-xs text-zinc-600">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                      <button
                        onClick={() => copyMessage(message.id, message.content)}
                        className="text-zinc-600 hover:text-zinc-900 transition-colors"
                        title="Copiar resposta"
                      >
                        {copiedId === message.id ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {message.role === 'user' && (
                  <div className="w-10 h-10 bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <User className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="bg-white/95 backdrop-blur rounded-2xl px-5 py-3 border border-zinc-200 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-red-500 animate-pulse" />
                    <span className="text-sm text-zinc-600">Analisando com IA superinteligente...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Sugestões de perguntas */}
          {isFirstMessage && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {SUGGESTION_CHIPS.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-3 py-2 text-sm bg-white/95 border border-zinc-200 rounded-full hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all text-zinc-700"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input de mensagem */}
          <div className="relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua pergunta sobre Instruções Técnicas..."
              className="w-full resize-none rounded-xl bg-white/95 border border-zinc-200 px-4 py-3 pr-12 text-zinc-900 placeholder-zinc-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 backdrop-blur"
              rows={1}
              disabled={loading}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="absolute right-2 bottom-2 p-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </CardContainer>
      </div>
    </div>
  );
}