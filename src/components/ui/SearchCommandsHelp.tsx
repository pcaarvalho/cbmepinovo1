'use client';

import React, { useState } from 'react';
import { X, Search, Hash, HelpCircle, Zap, FileText, Calculator, Shield, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchCommandsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchCommandsHelp({ isOpen, onClose }: SearchCommandsHelpProps) {
  const [activeTab, setActiveTab] = useState<'commands' | 'mentions' | 'examples'>('commands');

  if (!isOpen) return null;

  const commands = [
    {
      trigger: '/buscar',
      name: 'Buscar Instrução Técnica',
      description: 'Pesquisar ITs por número, título ou conteúdo',
      icon: <Search className="w-5 h-5" />,
      examples: ['/buscar IT-01', '/buscar saídas de emergência', '/buscar procedimentos'],
      category: 'Pesquisa'
    },
    {
      trigger: '/analisar',
      name: 'Analisar Memorial Descritivo',
      description: 'Fazer análise de conformidade de memorial',
      icon: <FileText className="w-5 h-5" />,
      examples: ['/analisar', '/analisar memorial comercial'],
      category: 'Análise'
    },
    {
      trigger: '/calcular',
      name: 'Calcular Carga de Incêndio',
      description: 'Ferramenta para cálculo de carga de incêndio',
      icon: <Calculator className="w-5 h-5" />,
      examples: ['/calcular carga', '/calcular MJ/m2'],
      category: 'Cálculos'
    },
    {
      trigger: '/verificar',
      name: 'Verificar Conformidade',
      description: 'Verificar se projeto atende às ITs aplicáveis',
      icon: <Shield className="w-5 h-5" />,
      examples: ['/verificar projeto', '/verificar conformidade'],
      category: 'Verificação'
    }
  ];

  const mentions = [
    {
      trigger: '@IT-01',
      name: 'Procedimentos Administrativos',
      description: 'Referenciar diretamente a IT-01',
      category: 'Instruções Técnicas'
    },
    {
      trigger: '@IT-11',
      name: 'Saídas de Emergência',
      description: 'Referenciar diretamente a IT-11',
      category: 'Instruções Técnicas'
    },
    {
      trigger: '@sistemas',
      name: 'Sistemas de Proteção',
      description: 'Categoria de sistemas de combate a incêndio',
      category: 'Categorias'
    },
    {
      trigger: '@procedimentos',
      name: 'Procedimentos Administrativos',
      description: 'Categoria de procedimentos do CB-PI',
      category: 'Categorias'
    }
  ];

  const examples = [
    {
      query: '/buscar IT-18',
      description: 'Busca diretamente pela IT-18 (Iluminação de Emergência)',
      result: 'Abre a página de pesquisa com resultados da IT-18'
    },
    {
      query: '/analisar memorial comercial',
      description: 'Abre a ferramenta de análise com contexto de memorial comercial',
      result: 'Direciona para upload de memorial com foco em edificações comerciais'
    },
    {
      query: 'saídas de emergência @IT-11',
      description: 'Busca por saídas de emergência referenciando a IT-11',
      result: 'Pesquisa contextual focada na IT-11 sobre saídas de emergência'
    },
    {
      query: '?como calcular carga de incêndio',
      description: 'Solicita ajuda sobre cálculo de carga de incêndio',
      result: 'Mostra tutoriais e ferramentas para cálculo de carga'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Comandos de Pesquisa Inteligente</h2>
            <p className="text-sm text-gray-600 mt-1">
              Use comandos rápidos para navegar e encontrar informações específicas do CB-PI
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {[
            { id: 'commands', label: 'Comandos', icon: <Zap className="w-4 h-4" /> },
            { id: 'mentions', label: 'Menções', icon: <Hash className="w-4 h-4" /> },
            { id: 'examples', label: 'Exemplos', icon: <HelpCircle className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-red-500 text-red-600 bg-red-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {activeTab === 'commands' && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">Como usar comandos</h3>
                <p className="text-sm text-blue-700">
                  Digite <kbd className="px-2 py-1 bg-white border rounded text-xs">/</kbd> seguido do comando para executar ações rápidas.
                  Use <kbd className="px-2 py-1 bg-white border rounded text-xs">Tab</kbd> ou <kbd className="px-2 py-1 bg-white border rounded text-xs">Enter</kbd> para completar.
                </p>
              </div>
              
              <div className="space-y-4">
                {commands.map((command) => (
                  <div key={command.trigger} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 p-2 bg-red-100 rounded-lg">
                        {command.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                            {command.trigger}
                          </code>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {command.category}
                          </span>
                        </div>
                        <h4 className="font-semibold text-gray-900">{command.name}</h4>
                        <p className="text-sm text-gray-600 mb-3">{command.description}</p>
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-2">Exemplos:</p>
                          <div className="flex flex-wrap gap-2">
                            {command.examples.map((example, index) => (
                              <code key={index} className="text-xs bg-gray-50 px-2 py-1 rounded border">
                                {example}
                              </code>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'mentions' && (
            <div className="space-y-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-green-900 mb-2">Como usar menções</h3>
                <p className="text-sm text-green-700">
                  Digite <kbd className="px-2 py-1 bg-white border rounded text-xs">@</kbd> seguido do recurso para referenciar 
                  instruções técnicas ou categorias específicas do CB-PI.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mentions.map((mention) => (
                  <div key={mention.trigger} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                        {mention.trigger}
                      </code>
                      <span className="text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded">
                        {mention.category}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm">{mention.name}</h4>
                    <p className="text-xs text-gray-600">{mention.description}</p>
                  </div>
                ))}
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-yellow-900 mb-2">Dica Pro</h4>
                <p className="text-sm text-yellow-700">
                  Combine menções com busca normal: <code className="bg-white px-1 rounded">"sistemas de proteção @sistemas"</code> 
                  para buscar especificamente na categoria de sistemas.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'examples' && (
            <div className="space-y-6">
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-purple-900 mb-2">Exemplos práticos</h3>
                <p className="text-sm text-purple-700">
                  Veja como usar os comandos e menções em situações reais do dia a dia no CB-PI.
                </p>
              </div>
              
              <div className="space-y-4">
                {examples.map((example, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-50 p-3 rounded-lg mb-3">
                          <code className="text-sm font-mono text-gray-900">{example.query}</code>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{example.description}</p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <ChevronRight className="w-3 h-3" />
                          <span>{example.result}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Pressione <kbd className="px-2 py-1 bg-white border rounded text-xs">?</kbd> na barra de pesquisa para ajuda rápida
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Começar a usar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}