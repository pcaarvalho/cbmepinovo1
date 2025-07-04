'use client';

import dynamic from 'next/dynamic';
import { Brain, Sparkles, BookOpen, Shield, Calculator } from 'lucide-react';

// Importar o componente ChatInteligente dinamicamente para evitar SSR issues
const ChatInteligente = dynamic(
  () => import('@/components/chat/ChatInteligente'),
  { ssr: false }
);

export default function ChatEspecialistaPage() {
  const features = [
    {
      icon: Calculator,
      title: 'Cálculos Inteligentes',
      description: 'Dimensionamento automático de extintores, hidrantes e saídas'
    },
    {
      icon: BookOpen,
      title: 'Base de 105+ ITs',
      description: 'Acesso completo às Instruções Técnicas do CBM-PI'
    },
    {
      icon: Shield,
      title: 'Validação Normativa',
      description: 'Verificação de conformidade com as normas vigentes'
    },
    {
      icon: Sparkles,
      title: 'IA Contextual',
      description: 'Respostas personalizadas baseadas no seu contexto'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <Brain className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Chat Especialista CBM-PI</h1>
                <p className="text-sm text-gray-600">Sistema Inteligente de Consulta às Instruções Técnicas</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{feature.title}</h3>
                    <p className="text-xs text-gray-600 mt-1">{feature.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Chat Component */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <ChatInteligente />
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900">Informação Importante</h3>
              <p className="text-sm text-blue-800 mt-1">
                Este sistema fornece orientações baseadas nas Instruções Técnicas do CB-PI. 
                Para projetos oficiais, sempre consulte as ITs completas e um profissional habilitado.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}