'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Trash2, RefreshCw, Copy, Check, Info, ChevronRight } from 'lucide-react';
import { useChatInteligente, useSugestoesInteligentes } from '@/hooks/useChatInteligente';
// Removido ReactMarkdown - usar renderização HTML simples

export function ChatInteligente() {
  const { 
    messages, 
    contexto, 
    isLoading, 
    sendMessage, 
    clearChat, 
    deleteMessage, 
    retryLastMessage 
  } = useChatInteligente();
  
  const sugestoesContextuais = useSugestoesInteligentes(contexto);
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll para o final quando novas mensagens chegarem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Função para copiar texto
  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  // Função para enviar mensagem
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      await sendMessage(input);
      setInput('');
    }
  };

  // Função para usar sugestão
  const usarSugestao = (sugestao: string) => {
    setInput(sugestao);
    inputRef.current?.focus();
  };

  // Renderizar contexto atual
  const renderContexto = () => {
    if (!contexto.tipoEdificacao && !contexto.areaTotal && !contexto.numeroAndares) {
      return null;
    }

    return (
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">Contexto da Conversa</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {contexto.tipoEdificacao && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {contexto.tipoEdificacao}
            </span>
          )}
          {contexto.areaTotal && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {contexto.areaTotal}m²
            </span>
          )}
          {contexto.numeroAndares && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {contexto.numeroAndares} {contexto.numeroAndares === 1 ? 'andar' : 'andares'}
            </span>
          )}
          {contexto.itsJaMencionadas.length > 0 && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              ITs: {contexto.itsJaMencionadas.join(', ')}
            </span>
          )}
        </div>
      </div>
    );
  };

  // Renderizar mensagem estruturada
  const renderMensagemEstruturada = (message: any) => {
    if (!message.respostaEstruturada) {
      return (
        <div className="whitespace-pre-wrap text-sm">
          {message.content}
        </div>
      );
    }

    const resposta = message.respostaEstruturada;

    return (
      <div className="space-y-4">
        {/* Resumo */}
        <div className="font-medium text-gray-900">
          {resposta.resumo}
        </div>

        {/* Detalhes */}
        {resposta.detalhes.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">📋 Detalhes:</div>
            <div className="ml-4 space-y-1">
              {resposta.detalhes.map((detalhe, idx) => (
                <div key={idx} className="text-sm text-gray-600">
                  • {detalhe.item}
                  {detalhe.referencia && (
                    <span className="text-xs text-blue-600 ml-1">
                      ({detalhe.referencia})
                    </span>
                  )}
                  {detalhe.calculo && (
                    <div className="mt-1 ml-4 p-2 bg-gray-50 rounded text-xs font-mono">
                      {detalhe.calculo}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dica */}
        {resposta.dica && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-sm text-green-800">
              💡 {resposta.dica}
            </div>
          </div>
        )}

        {/* ITs Relacionadas */}
        {resposta.relacionadas.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">🔗 Veja também:</span>
            <div className="flex flex-wrap gap-1">
              {resposta.relacionadas.map((it, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full hover:bg-blue-200 cursor-pointer"
                >
                  {it}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Sugestões de próximas perguntas */}
        {resposta.sugestoes.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600 mb-2">Próximas perguntas sugeridas:</div>
            <div className="space-y-1">
              {resposta.sugestoes.map((sugestao, idx) => (
                <button
                  key={idx}
                  onClick={() => usarSugestao(sugestao)}
                  className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 group"
                >
                  <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-gray-600" />
                  <span className="text-gray-700">{sugestao}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Chat Especialista CBM-PI</h2>
            <p className="text-sm text-gray-600">Sistema Inteligente de Consulta às ITs</p>
          </div>
          <button
            onClick={clearChat}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Limpar conversa"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Contexto */}
      <div className="px-6 pt-4">
        {renderContexto()}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {/* Loading state */}
              {message.loading && (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
                  <span className="text-sm">Processando sua pergunta...</span>
                </div>
              )}

              {/* Message content */}
              {!message.loading && (
                <>
                  {message.role === 'user' ? (
                    <div className="text-sm">{message.content}</div>
                  ) : (
                    renderMensagemEstruturada(message)
                  )}

                  {/* Message actions */}
                  {message.role === 'assistant' && !message.loading && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => copyToClipboard(message.content, message.id)}
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
                        title="Copiar resposta"
                      >
                        {copiedId === message.id ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      {message.intencao && (
                        <span className="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded-full">
                          {message.intencao}
                        </span>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Sugestões contextuais */}
      {sugestoesContextuais.length > 0 && !isLoading && (
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-600 mb-2">Sugestões baseadas no contexto:</div>
          <div className="flex flex-wrap gap-2">
            {sugestoesContextuais.map((sugestao, idx) => (
              <button
                key={idx}
                onClick={() => usarSugestao(sugestao)}
                className="px-3 py-1.5 text-xs bg-white hover:bg-gray-100 border border-gray-300 rounded-full transition-colors"
              >
                {sugestao}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="px-6 py-4 border-t border-gray-200">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Digite sua pergunta sobre as ITs..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={1}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChatInteligente;