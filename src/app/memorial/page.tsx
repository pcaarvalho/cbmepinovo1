'use client';

import { useState } from 'react';

export default function MemorialPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    conformidade: number;
    itensVerificados: Array<{
      item: string;
      resultado: string;
      observacao?: string;
      itReferencia?: string;
    }>;
  } | null>(null);
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
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
        setError(data.error || 'Erro na análise');
      }
    } catch {
      setError('Erro ao processar arquivo');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Análise de Memorial Descritivo
          </h1>
          <p className="text-lg text-gray-600">
            Faça upload do seu memorial descritivo para análise de conformidade
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {!result && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Upload do Arquivo</h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={handleFileChange}
                className="hidden"
                id="file-input"
              />
              <label htmlFor="file-input" className="cursor-pointer">
                <div className="text-gray-400 mb-4">
                  📄
                </div>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Clique para selecionar arquivo
                </p>
                <p className="text-sm text-gray-600">
                  PDF, DOCX ou DOC (máx. 10MB)
                </p>
              </label>
            </div>

            {file && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-green-800">{file.name}</p>
                    <p className="text-sm text-green-600">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Analisando...' : 'Analisar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {loading && (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Processando arquivo...</h3>
            <p className="text-gray-600">Analisando conformidade com as ITs</p>
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Resultado da Análise</h2>
                <button
                  onClick={reset}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  Nova Análise
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {Math.round(result.conformidade || 0)}%
                  </div>
                  <div className="text-sm text-gray-600">Conformidade Geral</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {result.itensVerificados?.filter((item) => item.resultado === 'CONFORME').length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Itens Conformes</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600 mb-2">
                    {result.itensVerificados?.filter((item) => item.resultado === 'NAO_CONFORME').length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Não Conformes</div>
                </div>
              </div>

              {result.itensVerificados && result.itensVerificados.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Itens Verificados</h3>
                  <div className="space-y-3">
                    {result.itensVerificados.map((item, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-2">
                              {item.item || 'Item não especificado'}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                              {item.observacao || 'Sem observações'}
                            </p>
                            <p className="text-xs text-gray-500">
                              Referência: {item.itReferencia || 'Não especificada'}
                            </p>
                          </div>
                          <div className="ml-4">
                            {item.resultado === 'CONFORME' && (
                              <span className="text-green-600">✅</span>
                            )}
                            {item.resultado === 'NAO_CONFORME' && (
                              <span className="text-red-600">❌</span>
                            )}
                            {item.resultado === 'PARCIAL' && (
                              <span className="text-yellow-600">⚠️</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}