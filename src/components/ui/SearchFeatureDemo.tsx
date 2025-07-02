'use client';

import React, { useState, useEffect } from 'react';
import { Search, Zap, Hash, HelpCircle, ChevronRight, Code, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchFeatureDemoProps {
  className?: string;
}

export default function SearchFeatureDemo({ className }: SearchFeatureDemoProps) {
  const [currentExample, setCurrentExample] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [typedText, setTypedText] = useState('');

  const examples = [
    {
      id: 'command',
      icon: <Zap className="w-5 h-5" />,
      title: 'Comandos Rápidos',
      description: 'Execute ações específicas com comandos',
      query: '/buscar IT-18',
      result: 'Abre diretamente a IT-18 (Iluminação de Emergência)',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'mention',
      icon: <Hash className="w-5 h-5" />,
      title: 'Menções de Recursos',
      description: 'Referencie ITs e categorias específicas',
      query: 'sistemas de proteção @sistemas',
      result: 'Busca focada na categoria de sistemas de proteção',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'help',
      icon: <HelpCircle className="w-5 h-5" />,
      title: 'Ajuda Contextual',
      description: 'Obtenha ajuda sobre procedimentos específicos',
      query: '?como calcular carga de incêndio',
      result: 'Mostra tutoriais e ferramentas para cálculo',
      color: 'from-purple-500 to-purple-600'
    }
  ];

  // Efeito de digitação automática
  useEffect(() => {
    const example = examples[currentExample];
    let timeout: NodeJS.Timeout;

    if (isTyping) {
      const targetText = example.query;
      const currentLength = typedText.length;

      if (currentLength < targetText.length) {
        timeout = setTimeout(() => {
          setTypedText(targetText.substring(0, currentLength + 1));
        }, 100);
      } else {
        timeout = setTimeout(() => {
          setIsTyping(false);
          setTimeout(() => {
            setCurrentExample((prev) => (prev + 1) % examples.length);
            setTypedText('');
            setIsTyping(true);
          }, 2000);
        }, 1000);
      }
    }

    return () => clearTimeout(timeout);
  }, [typedText, isTyping, currentExample, examples]);

  // Iniciar animação
  useEffect(() => {
    setIsTyping(true);
  }, []);

  const currentExampleData = examples[currentExample];

  return (
    <div className={cn('bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm', className)}>
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-red-500 to-red-600 rounded-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Pesquisa Inteligente CB-PI</h3>
            <p className="text-sm text-gray-600">
              Use comandos rápidos, menções e ajuda contextual
            </p>
          </div>
        </div>
      </div>

      {/* Demo Area */}
      <div className="p-6">
        {/* Search Bar Demo */}
        <div className="relative mb-6">
          <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Search className="w-5 h-5 text-gray-400" />
            <span className="text-gray-500 flex-1">
              {typedText}
              {isTyping && <span className="animate-pulse">|</span>}
            </span>
          </div>
          
          {/* Resultado simulado */}
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 animate-in slide-in-from-top-2">
            <div className="flex items-center space-x-3">
              <div className={cn(
                'p-2 rounded-lg bg-gradient-to-r text-white',
                currentExampleData.color
              )}>
                {currentExampleData.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {currentExampleData.result}
                </p>
                <p className="text-xs text-gray-500">
                  {currentExampleData.title}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Feature Tabs */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {examples.map((example, index) => (
            <button
              key={example.id}
              onClick={() => {
                setCurrentExample(index);
                setTypedText('');
                setIsTyping(true);
              }}
              className={cn(
                'p-3 rounded-lg text-center transition-all text-sm',
                index === currentExample
                  ? 'bg-red-50 border-2 border-red-200 text-red-700'
                  : 'bg-gray-50 border-2 border-transparent text-gray-600 hover:bg-gray-100'
              )}
            >
              <div className="flex justify-center mb-2">
                {example.icon}
              </div>
              <p className="font-medium">{example.title}</p>
            </button>
          ))}
        </div>

        {/* Command Examples */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900 flex items-center">
            <Code className="w-4 h-4 mr-2" />
            Exemplos de Comandos Populares
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { cmd: '/buscar', desc: 'Buscar ITs específicas' },
              { cmd: '/analisar', desc: 'Analisar memorial descritivo' },
              { cmd: '@IT-11', desc: 'Referenciar IT-11 diretamente' },
              { cmd: '?procedimentos', desc: 'Ajuda sobre procedimentos' }
            ].map((item, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <code className="text-xs font-mono bg-white px-2 py-1 rounded border">
                  {item.cmd}
                </code>
                <span className="text-xs text-gray-600 flex-1">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gradient-to-r from-red-50 to-orange-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Experimente na <strong>página de pesquisa</strong>
          </p>
          <div className="flex space-x-1">
            {examples.map((_, index) => (
              <div
                key={index}
                className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  index === currentExample ? 'bg-red-500' : 'bg-gray-300'
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}