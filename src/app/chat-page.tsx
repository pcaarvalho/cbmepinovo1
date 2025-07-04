'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Copy, Brain, MessageCircle, User, Bot, CheckCircle, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
}

// Sugestões de perguntas clicáveis
const SUGGESTION_CHIPS = [
  "Quantos extintores preciso?",
  "Normas para restaurante", 
  "Como calcular saídas de emergência",
  "ITs para posto de combustível",
  "Dimensionamento de hidrantes",
  "Iluminação de emergência obrigatória"
];

export default function HomePage() {
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

  // Adicionar mensagem de boas-vindas na primeira carga
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: `👋 Olá! Sou o assistente especializado nas 105 Instruções Técnicas do CBMEPI.

Posso ajudar com:
• 🧯 Dimensionamento de extintores
• 💧 Sistemas de hidrantes  
• 🚪 Saídas de emergência
• 🏢 Normas específicas por tipo de edificação

Como posso ajudar você hoje?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  // Função para gerar knowledge base igual ao chat-especialista
  const generateKnowledgeBase = () => {
    return `INSTRUÇÕES TÉCNICAS DO CBMEPI:

INSTRUÇÕES PRINCIPAIS POR TEMA:
• Extintores: IT-21 (Sistema de proteção por extintores de incêndio)  
• Hidrantes: IT-22 (Sistema de hidrantes e mangotinhos), IT-34 (Hidrante urbano)
• Saídas: IT-11 (Saídas de emergência)
• Iluminação: IT-18 (Iluminação de emergência)
• Sinalização: IT-20 (Sinalização de emergência)
• Estrutural: IT-08 (Segurança estrutural)
• Compartimentação: IT-09 (Compartimentação horizontal e vertical)`;
  };

  // Função para extrair referências de ITs das respostas
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
      const response = await fetch('/api/chat-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `Você é um especialista em normas técnicas do Corpo de Bombeiros do Piauí (CBMEPI).

${generateKnowledgeBase()}

INSTRUÇÕES:
1. Sempre cite a IT específica (ex: "Segundo a IT-21...")
2. Use linguagem técnica mas clara
3. Forneça informações práticas e aplicáveis
4. Quando não souber algo específico, seja honesto
5. Priorize segurança e conformidade normativa
6. Sugira consultar a IT completa quando necessário

Responda SEMPRE em português brasileiro.`
            },
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
    // Recriar mensagem de boas-vindas
    setTimeout(() => {
      const welcomeMessage: Message = {
        id: 'welcome-new',
        role: 'assistant',
        content: `👋 Olá! Sou o assistente especializado nas 105 Instruções Técnicas do CBMEPI.

Posso ajudar com:
• 🧯 Dimensionamento de extintores
• 💧 Sistemas de hidrantes  
• 🚪 Saídas de emergência
• 🏢 Normas específicas por tipo de edificação

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
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header minimalista */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CB</span>
            </div>
            <h1 className="text-lg font-semibold text-gray-900">
              Assistente de Instruções Técnicas CBMEPI
            </h1>
          </div>
          <button
            onClick={newChat}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Nova Conversa
          </button>
        </div>
      </header>

      {/* Área de conversa */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              
              <div
                className={`max-w-2xl ${
                  message.role === 'user'
                    ? 'bg-red-600 text-white rounded-2xl px-4 py-3'
                    : 'bg-white rounded-2xl px-4 py-3 border border-gray-200'
                }`}
              >
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content}
                </div>

                {/* Fontes/Referências */}
                {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-gray-100">
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs text-gray-500 mr-2">Referências:</span>
                      {message.sources.map((source, index) => (
                        <span
                          key={index}
                          className="inline-block px-2 py-1 bg-red-50 text-red-700 text-xs rounded-md"
                        >
                          {source}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {message.role === 'assistant' && (
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                    <button
                      onClick={() => copyMessage(message.id, message.content)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title="Copiar resposta"
                    >
                      {copiedId === message.id ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white rounded-2xl px-4 py-3 border border-gray-200">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-red-500 animate-pulse" />
                  <span className="text-sm text-gray-500">Analisando instruções técnicas...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Sugestões de perguntas (apenas na primeira mensagem) */}
      {isFirstMessage && (
        <div className="max-w-4xl mx-auto px-4 pb-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {SUGGESTION_CHIPS.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:border-red-300 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input fixo */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Pergunte sobre qualquer Instrução Técnica..."
                className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 pr-12 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 max-h-32"
                rows={1}
                disabled={loading}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                className="absolute right-2 bottom-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="text-xs text-gray-500 text-center mt-2">
            Especializado em Instruções Técnicas do Corpo de Bombeiros do Piauí
          </div>
        </div>
      </div>
    </div>
  );
}