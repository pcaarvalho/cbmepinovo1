'use client';

import { useState } from 'react';
import { Calculator, FileText, Droplets, DoorOpen, AlertTriangle, Info } from 'lucide-react';
import CardContainer from '@/components/layout/CardContainer';
import PageHeader from '@/components/layout/PageHeader';

interface CalculatorResult {
  tipo: string;
  quantidade: number;
  detalhes: string;
  norma: string;
}

export default function CalculadoraPage() {
  const [activeCalculator, setActiveCalculator] = useState<'extintores' | 'hidrantes' | 'saidas'>('extintores');
  const [area, setArea] = useState('');
  const [ocupacao, setOcupacao] = useState('');
  const [pavimentos, setPavimentos] = useState('');
  const [populacao, setPopulacao] = useState('');
  const [results, setResults] = useState<CalculatorResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const ocupacoes = [
    { value: 'residencial', label: 'Residencial' },
    { value: 'comercial', label: 'Comercial' },
    { value: 'industrial', label: 'Industrial' },
    { value: 'educacional', label: 'Educacional' },
    { value: 'hospitalar', label: 'Hospitalar' },
    { value: 'escritorio', label: 'Escritório' },
  ];

  const calcularExtintores = () => {
    if (!area || !ocupacao) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const areaNum = parseFloat(area);
    const unidadeExtintora = ocupacao === 'industrial' ? 300 : 500;
    const quantidade = Math.ceil(areaNum / unidadeExtintora);

    setResults([
      {
        tipo: 'Extintores de Pó Químico (ABC)',
        quantidade: quantidade,
        detalhes: `Para área de ${areaNum}m² com ocupação ${ocupacao}`,
        norma: 'Conforme IT-21 - Sistema de proteção por extintores'
      },
      {
        tipo: 'Distância máxima a percorrer',
        quantidade: 20,
        detalhes: 'Metros até o extintor mais próximo',
        norma: 'IT-21, item 5.2.3'
      }
    ]);
    setShowResults(true);
  };

  const calcularHidrantes = () => {
    if (!area || !pavimentos) {
      alert('Por favor, preencha área e número de pavimentos');
      return;
    }

    const areaNum = parseFloat(area);
    const pavNum = parseInt(pavimentos);
    const vazao = areaNum > 5000 ? 500 : 300; // L/min
    const reserva = vazao * 60; // 60 minutos de autonomia

    setResults([
      {
        tipo: 'Vazão mínima por hidrante',
        quantidade: vazao,
        detalhes: 'Litros por minuto (L/min)',
        norma: 'IT-22 - Sistema de hidrantes e mangotinhos'
      },
      {
        tipo: 'Reserva técnica de incêndio',
        quantidade: reserva / 1000,
        detalhes: 'Metros cúbicos (m³) para 60 minutos',
        norma: 'IT-22, Tabela 2'
      },
      {
        tipo: 'Número de hidrantes',
        quantidade: Math.ceil(areaNum / 1500),
        detalhes: `Considerando raio de ação de 30m`,
        norma: 'IT-22, item 5.4'
      }
    ]);
    setShowResults(true);
  };

  const calcularSaidas = () => {
    if (!populacao || !pavimentos) {
      alert('Por favor, preencha população e pavimentos');
      return;
    }

    const popNum = parseInt(populacao);
    const larguraMinima = 1.20; // metros
    const unidadePassagem = 0.55; // metros
    const capacidadeUnidade = 100; // pessoas por unidade
    const unidadesNecessarias = Math.ceil(popNum / capacidadeUnidade);
    const larguraTotal = Math.max(larguraMinima, unidadesNecessarias * unidadePassagem);

    setResults([
      {
        tipo: 'Largura mínima das saídas',
        quantidade: larguraTotal,
        detalhes: 'Metros (m) de largura total',
        norma: 'IT-08 - Saídas de emergência'
      },
      {
        tipo: 'Número de saídas necessárias',
        quantidade: popNum > 500 ? Math.max(2, Math.ceil(popNum / 500)) : 2,
        detalhes: 'Saídas independentes',
        norma: 'IT-08, item 5.3'
      },
      {
        tipo: 'Distância máxima a percorrer',
        quantidade: pavimentos === '1' ? 30 : 25,
        detalhes: 'Metros até a saída mais próxima',
        norma: 'IT-08, Tabela 6'
      }
    ]);
    setShowResults(true);
  };

  const handleCalculate = () => {
    setShowResults(false);
    switch (activeCalculator) {
      case 'extintores':
        calcularExtintores();
        break;
      case 'hidrantes':
        calcularHidrantes();
        break;
      case 'saidas':
        calcularSaidas();
        break;
    }
  };

  const resetCalculator = () => {
    setArea('');
    setOcupacao('');
    setPavimentos('');
    setPopulacao('');
    setResults([]);
    setShowResults(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="Calculadora de Dimensionamento"
          subtitle="Calcule extintores, hidrantes e saídas de emergência conforme as normas do CBMEPI"
          icon={Calculator}
          badge="Cálculos Normativos"
        />

        {/* Seletor de Calculadora */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => { setActiveCalculator('extintores'); resetCalculator(); }}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeCalculator === 'extintores'
                ? 'bg-red-600 text-white shadow-lg'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>Extintores</span>
          </button>
          <button
            onClick={() => { setActiveCalculator('hidrantes'); resetCalculator(); }}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeCalculator === 'hidrantes'
                ? 'bg-red-600 text-white shadow-lg'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            <Droplets className="w-5 h-5" />
            <span>Hidrantes</span>
          </button>
          <button
            onClick={() => { setActiveCalculator('saidas'); resetCalculator(); }}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeCalculator === 'saidas'
                ? 'bg-red-600 text-white shadow-lg'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            <DoorOpen className="w-5 h-5" />
            <span>Saídas de Emergência</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulário */}
          <CardContainer variant="gradient">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Calculator className="w-6 h-6 mr-3 text-red-400" />
              {activeCalculator === 'extintores' && 'Calcular Extintores'}
              {activeCalculator === 'hidrantes' && 'Calcular Hidrantes'}
              {activeCalculator === 'saidas' && 'Calcular Saídas de Emergência'}
            </h2>

            <div className="space-y-4">
              {/* Área */}
              {(activeCalculator === 'extintores' || activeCalculator === 'hidrantes') && (
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Área Total (m²) *
                  </label>
                  <input
                    type="number"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="Ex: 500"
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                  />
                </div>
              )}

              {/* Ocupação */}
              {activeCalculator === 'extintores' && (
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Tipo de Ocupação *
                  </label>
                  <select
                    value={ocupacao}
                    onChange={(e) => setOcupacao(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                  >
                    <option value="">Selecione...</option>
                    {ocupacoes.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Pavimentos */}
              {(activeCalculator === 'hidrantes' || activeCalculator === 'saidas') && (
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Número de Pavimentos *
                  </label>
                  <input
                    type="number"
                    value={pavimentos}
                    onChange={(e) => setPavimentos(e.target.value)}
                    placeholder="Ex: 5"
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                  />
                </div>
              )}

              {/* População */}
              {activeCalculator === 'saidas' && (
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    População Total *
                  </label>
                  <input
                    type="number"
                    value={populacao}
                    onChange={(e) => setPopulacao(e.target.value)}
                    placeholder="Ex: 200"
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                  />
                </div>
              )}

              {/* Aviso */}
              <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-200">
                    <p className="font-medium mb-1">Importante:</p>
                    <p>Este cálculo é uma estimativa baseada nas ITs do CBMEPI. Sempre consulte um profissional habilitado para o dimensionamento final.</p>
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="flex space-x-4">
                <button
                  onClick={handleCalculate}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold transition-colors"
                >
                  Calcular
                </button>
                <button
                  onClick={resetCalculator}
                  className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-white font-medium transition-colors"
                >
                  Limpar
                </button>
              </div>
            </div>
          </CardContainer>

          {/* Resultados */}
          <CardContainer variant="glass">
            <h2 className="text-2xl font-bold text-white mb-6">Resultados</h2>
            
            {!showResults ? (
              <div className="text-center py-16 text-zinc-400">
                <Calculator className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Preencha os campos e clique em calcular</p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div key={index} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-white">{result.tipo}</h3>
                      <span className="text-2xl font-bold text-red-400">
                        {result.quantidade}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-400 mb-2">{result.detalhes}</p>
                    <div className="flex items-center space-x-2 text-xs text-zinc-500">
                      <Info className="w-3 h-3" />
                      <span>{result.norma}</span>
                    </div>
                  </div>
                ))}

                {/* Botão de Download */}
                <button 
                  onClick={() => {
                    // Implementar download do PDF
                    alert('📄 Funcionalidade de download PDF será implementada em breve!');
                  }}
                  className="w-full mt-6 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white font-medium transition-all duration-300 flex items-center justify-center space-x-2 hover:shadow-lg transform hover:scale-105"
                  title="Baixar relatório em PDF com os cálculos realizados"
                >
                  <FileText className="w-5 h-5" />
                  <span>Baixar Relatório PDF</span>
                </button>
              </div>
            )}
          </CardContainer>
        </div>

        {/* Informações Adicionais */}
        <CardContainer variant="glass" className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-white mb-2 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-red-400" />
                IT-21 - Extintores
              </h3>
              <p className="text-sm text-zinc-400">
                Define critérios para proteção contra incêndio por extintores portáteis e sobre rodas.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2 flex items-center">
                <Droplets className="w-5 h-5 mr-2 text-red-400" />
                IT-22 - Hidrantes
              </h3>
              <p className="text-sm text-zinc-400">
                Estabelece critérios para dimensionamento de sistemas de hidrantes e mangotinhos.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2 flex items-center">
                <DoorOpen className="w-5 h-5 mr-2 text-red-400" />
                IT-08 - Saídas
              </h3>
              <p className="text-sm text-zinc-400">
                Fixa condições para o dimensionamento das saídas de emergência em edificações.
              </p>
            </div>
          </div>
        </CardContainer>
      </div>
    </div>
  );
}