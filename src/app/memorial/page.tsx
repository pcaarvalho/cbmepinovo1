// AIDEV-EXPLANATION: Página de análise de memorial com layout unificado
'use client';

import { useState } from 'react';
import { FileText, Upload, CheckCircle, XCircle, AlertCircle, FileCheck, RotateCcw, Brain, Sparkles } from 'lucide-react';
import CardContainer from '@/components/layout/CardContainer';
import PageHeader from '@/components/layout/PageHeader';

interface VerificationItem {
  item: string;
  resultado: 'CONFORME' | 'NAO_CONFORME' | 'PARCIAL';
  observacao?: string;
  itReferencia?: string;
}

interface AnalysisResult {
  conformidade: number;
  itensVerificados: VerificationItem[];
}

export default function MemorialPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    
    if (!validTypes.includes(selectedFile.type)) {
      setError('Por favor, selecione um arquivo PDF ou Word');
      return;
    }
    
    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB
      setError('O arquivo deve ter no máximo 10MB');
      return;
    }
    
    setFile(selectedFile);
    setError('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;

    setLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('arquivo', file);

      const response = await fetch('/api/analise', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data.analise);
      } else {
        setError(data.error || 'Erro na análise do memorial');
      }
    } catch {
      setError('Erro ao processar arquivo. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError('');
  };

  const getStatusIcon = (resultado: string) => {
    switch (resultado) {
      case 'CONFORME':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'NAO_CONFORME':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'PARCIAL':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (resultado: string) => {
    switch (resultado) {
      case 'CONFORME':
        return 'bg-green-600/20 text-green-400 border-green-600/30';
      case 'NAO_CONFORME':
        return 'bg-red-600/20 text-red-400 border-red-600/30';
      case 'PARCIAL':
        return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
      default:
        return 'bg-zinc-600/20 text-zinc-400 border-zinc-600/30';
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header da página */}
        <PageHeader
          title="Análise de Memorial Descritivo"
          subtitle="Verificação automática de conformidade com as Instruções Técnicas do CBMEPI"
          icon={FileCheck}
          badge="IA Especializada"
        />

        {error && (
          <CardContainer variant="glass" className="mb-6 bg-red-600/10 border-red-600/30">
            <div className="flex items-center space-x-3">
              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400">{error}</p>
            </div>
          </CardContainer>
        )}

        {!result && (
          <CardContainer variant="gradient" glow animate>
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
              <Upload className="w-6 h-6 mr-3" />
              Upload do Memorial
            </h2>
            
            <div 
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                dragActive 
                  ? 'border-red-600/50 bg-red-600/10' 
                  : 'border-zinc-700/50 hover:border-zinc-600/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={handleFileChange}
                className="hidden"
                id="file-input"
              />
              <label htmlFor="file-input" className="cursor-pointer">
                <div className="mb-4">
                  <FileText className="w-16 h-16 text-zinc-500 mx-auto" />
                </div>
                <p className="text-xl font-medium text-white mb-2">
                  {dragActive ? 'Solte o arquivo aqui' : 'Clique ou arraste para selecionar'}
                </p>
                <p className="text-sm text-zinc-400">
                  PDF, DOCX ou DOC (máximo 10MB)
                </p>
              </label>
            </div>

            {file && (
              <div className="mt-6 p-6 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-red-600/10 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{file.name}</p>
                      <p className="text-sm text-zinc-400">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg shadow-red-600/20 transition-all flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Analisando...</span>
                      </>
                    ) : (
                      <>
                        <Brain className="w-5 h-5" />
                        <span>Analisar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </CardContainer>
        )}

        {loading && (
          <CardContainer variant="glass" className="text-center py-16">
            <div className="mb-6">
              <div className="w-20 h-20 border-4 border-red-600/30 border-t-red-600 rounded-full mx-auto animate-spin" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-3">Processando memorial...</h3>
            <p className="text-zinc-400">Nossa IA está analisando a conformidade com as 105 ITs</p>
            <div className="flex items-center justify-center mt-4 text-red-400">
              <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
              <span>Análise superinteligente em andamento</span>
            </div>
          </CardContainer>
        )}

        {result && (
          <div className="space-y-6">
            <CardContainer variant="gradient" glow>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-semibold text-white flex items-center">
                  <FileCheck className="w-6 h-6 mr-3" />
                  Resultado da Análise
                </h2>
                <button
                  onClick={reset}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-white font-medium transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Nova Análise</span>
                </button>
              </div>

              {/* Estatísticas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
                  <div className="text-4xl font-bold mb-2">
                    <span className={`
                      ${result.conformidade >= 80 ? 'text-green-400' : 
                        result.conformidade >= 60 ? 'text-yellow-400' : 'text-red-400'}
                    `}>
                      {Math.round(result.conformidade || 0)}%
                    </span>
                  </div>
                  <div className="text-sm text-zinc-400">Conformidade Geral</div>
                </div>
                
                <div className="text-center p-6 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
                  <div className="text-4xl font-bold text-green-400 mb-2">
                    {result.itensVerificados?.filter((item) => item.resultado === 'CONFORME').length || 0}
                  </div>
                  <div className="text-sm text-zinc-400">Itens Conformes</div>
                </div>
                
                <div className="text-center p-6 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
                  <div className="text-4xl font-bold text-red-400 mb-2">
                    {result.itensVerificados?.filter((item) => item.resultado === 'NAO_CONFORME').length || 0}
                  </div>
                  <div className="text-sm text-zinc-400">Não Conformes</div>
                </div>
              </div>

              {/* Itens Verificados */}
              {result.itensVerificados && result.itensVerificados.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                    <Brain className="w-5 h-5 mr-2" />
                    Itens Verificados
                  </h3>
                  <div className="space-y-4">
                    {result.itensVerificados.map((item, index: number) => (
                      <div 
                        key={index} 
                        className="p-6 bg-zinc-800/30 rounded-xl border border-zinc-700/50 hover:bg-zinc-800/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-white mb-3 text-lg">
                              {item.item || 'Item não especificado'}
                            </h4>
                            {item.observacao && (
                              <p className="text-zinc-300 mb-3 leading-relaxed">
                                {item.observacao}
                              </p>
                            )}
                            {item.itReferencia && (
                              <p className="text-sm text-zinc-500 flex items-center">
                                <FileText className="w-4 h-4 mr-2" />
                                Referência: {item.itReferencia}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-center space-y-2">
                            {getStatusIcon(item.resultado)}
                            <span className={`text-xs px-3 py-1 rounded-full border ${getStatusColor(item.resultado)}`}>
                              {item.resultado.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContainer>
          </div>
        )}
      </div>
    </div>
  );
}