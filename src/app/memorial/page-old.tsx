'use client';

import { useState } from 'react';
import { FileCheck, CheckCircle, XCircle, AlertTriangle, Download, FileText } from 'lucide-react';
import FileUpload from '@/components/ui/FileUpload';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader, CardActions } from '@/components/ui/Card';
import { ResultadoAnalise, AnalysisStatus, VerificationResult, Severity } from '@/types';

// Mock data para demonstração
const mockAnalise: ResultadoAnalise = {
  id: 'analise-001',
  nomeArquivo: 'memorial-descritivo-edificio-comercial.pdf',
  dataAnalise: '2024-01-15',
  conformidade: 78,
  status: AnalysisStatus.COMPLETED,
  observacoes: 'Memorial apresenta boa estrutura geral, mas necessita ajustes em alguns itens específicos.',
  tempoProcessamento: 5000,
  versaoAlgoritmo: '2.0.0',
  metadados: {},
  userId: 'user-001',
  user: { 
    id: 'user-001', 
    name: 'João Silva', 
    email: 'joao@email.com',
    avatar: undefined,
    position: undefined,
    department: undefined,
    isActive: true,
    lastLoginAt: undefined,
    loginCount: 0,
    organizationId: 'cbm-pi',
    organization: {
      id: 'cbm-pi',
      name: 'CB-PI',
      slug: 'cbm-pi',
      isActive: true,
      settings: { features: { analytics: true, collaboration: true, api: true, customBranding: false, sso: false }, limits: { users: 100, storage: 10, apiCalls: 1000 }, branding: { primaryColor: '#dc2626' } },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    roles: [],
    permissions: [],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  organizationId: 'cbm-pi',
  itensVerificados: [
    {
      id: 'item-001',
      item: 'Identificação do responsável técnico',
      resultado: VerificationResult.CONFORME,
      observacao: 'CREA/PI válido e dentro da área de competência',
      itReferencia: 'IT-001/2023',
      severidade: Severity.MEDIUM,
      analiseId: 'analise-001',
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 'item-002',
      item: 'Descrição das atividades desenvolvidas',
      resultado: VerificationResult.CONFORME,
      observacao: 'Atividade compatível com a classificação de risco',
      itReferencia: 'IT-004/2023',
      severidade: Severity.MEDIUM,
      analiseId: 'analise-001',
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 'item-003',
      item: 'Especificação de materiais de acabamento',
      resultado: VerificationResult.NAO_CONFORME,
      observacao: 'Necessário especificar classe de reação ao fogo dos materiais',
      itReferencia: 'IT-005/2023',
      severidade: Severity.HIGH,
      analiseId: 'analise-001',
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 'item-004',
      item: 'Dimensionamento das saídas de emergência',
      resultado: VerificationResult.NAO_CONFORME,
      observacao: 'Largura das escadas insuficiente para a população calculada',
      itReferencia: 'IT-008/2023',
      severidade: Severity.CRITICAL,
      analiseId: 'analise-001',
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 'item-005',
      item: 'Sistema de iluminação de emergência',
      resultado: VerificationResult.CONFORME,
      observacao: 'Especificação adequada conforme norma técnica',
      itReferencia: 'IT-010/2023',
      severidade: Severity.MEDIUM,
      analiseId: 'analise-001',
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 'item-006',
      item: 'Sinalização de emergência',
      resultado: VerificationResult.PARCIAL,
      observacao: 'Faltam algumas placas de sinalização em corredores',
      itReferencia: 'IT-011/2023',
      severidade: Severity.MEDIUM,
      analiseId: 'analise-001',
      createdAt: '2024-01-15T10:00:00Z'
    }
  ],
  comments: [],
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z'
};

export default function MemorialPage() {
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(null);
  const [analisando, setAnalisando] = useState(false);
  const [analise, setAnalise] = useState<ResultadoAnalise | null>(null);

  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) {
      setArquivoSelecionado(files[0]);
      setAnalise(null);
    }
  };

  const iniciarAnalise = async () => {
    if (!arquivoSelecionado) return;

    setAnalisando(true);
    
    // Simular análise
    setTimeout(() => {
      setAnalise(mockAnalise);
      setAnalisando(false);
    }, 3000);
  };

  const getStatusIcon = (resultado: string) => {
    switch (resultado) {
      case 'conforme':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'nao_conforme':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'nao_aplicavel':
        return <AlertTriangle className="w-5 h-5 text-gray-400" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (resultado: string) => {
    switch (resultado) {
      case 'conforme':
        return 'bg-green-100 text-green-800';
      case 'nao_conforme':
        return 'bg-red-100 text-red-800';
      case 'nao_aplicavel':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getConformidadeColor = (percentual: number) => {
    if (percentual >= 80) return 'text-green-600';
    if (percentual >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <FileCheck className="w-12 h-12 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Análise de Memorial Descritivo
        </h1>
        <p className="text-xl text-gray-600">
          Faça upload do memorial descritivo e receba análise automatizada de conformidade
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload e Controles */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Upload do Memorial</h3>
            </CardHeader>
            <CardContent>
              <FileUpload onFileSelect={handleFileSelect} />
            </CardContent>
            {arquivoSelecionado && (
              <CardActions>
                <Button
                  onClick={iniciarAnalise}
                  disabled={analisando}
                  className="w-full"
                >
                  {analisando ? 'Analisando...' : 'Iniciar Análise'}
                </Button>
              </CardActions>
            )}
          </Card>

          {/* Instruções */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Como funciona?</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-600 text-sm font-medium">1</span>
                </div>
                <p className="text-gray-600">
                  Faça upload do memorial descritivo em formato PDF ou DOCX
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-600 text-sm font-medium">2</span>
                </div>
                <p className="text-gray-600">
                  O sistema analisa automaticamente o documento comparando com as ITs vigentes
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-600 text-sm font-medium">3</span>
                </div>
                <p className="text-gray-600">
                  Receba relatório detalhado com conformidades, não conformidades e sugestões
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resultados da Análise */}
        <div className="space-y-6">
          {analisando && (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-spin w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Analisando Memorial</h3>
                <p className="text-gray-600">
                  Processando documento e verificando conformidade com as ITs...
                </p>
              </CardContent>
            </Card>
          )}

          {analise && (
            <>
              {/* Resumo da Análise */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Resumo da Análise</h3>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Baixar Relatório
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <FileText className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-900">{analise.nomeArquivo}</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Analisado em {new Date(analise.dataAnalise).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Conformidade Geral</span>
                      <span className={`text-2xl font-bold ${getConformidadeColor(analise.conformidade)}`}>
                        {analise.conformidade}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          analise.conformidade >= 80 ? 'bg-green-500' :
                          analise.conformidade >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${analise.conformidade}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">
                        {analise.itensVerificados.filter(item => item.resultado === VerificationResult.CONFORME).length}
                      </div>
                      <div className="text-xs text-gray-600">Conformes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-yellow-600">
                        {analise.itensVerificados.filter(item => item.resultado === VerificationResult.PARCIAL).length}
                      </div>
                      <div className="text-xs text-gray-600">Parciais</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-red-600">
                        {analise.itensVerificados.filter(item => item.resultado === VerificationResult.NAO_CONFORME).length}
                      </div>
                      <div className="text-xs text-gray-600">Não Conformes</div>
                    </div>
                  </div>

                  {analise.observacoes && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Observações gerais:</strong> {analise.observacoes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Detalhamento dos Itens */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">Itens Verificados</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analise.itensVerificados.map((item) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start space-x-3">
                        {getStatusIcon(item.resultado)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{item.item}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.resultado)}`}>
                              {item.resultado === VerificationResult.CONFORME && 'Conforme'}
                              {item.resultado === VerificationResult.NAO_CONFORME && 'Não Conforme'}
                              {item.resultado === VerificationResult.PARCIAL && 'Parcialmente Conforme'}
                              {item.resultado === VerificationResult.NAO_APLICAVEL && 'Não Aplicável'}
                            </span>
                          </div>
                          
                          {item.observacao && (
                            <p className="text-sm text-gray-600 mb-2">{item.observacao}</p>
                          )}
                          
                          {item.itReferencia && (
                            <div className="text-xs text-blue-600">
                              Referência: {item.itReferencia}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}