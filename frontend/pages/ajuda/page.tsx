import Link from 'next/link';
import { HelpCircle, Search, FileCheck, Library, ArrowRight, MessageCircle, Phone, Mail } from 'lucide-react';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function AjudaPage() {
  const faqItems = [
    {
      pergunta: 'Como posso pesquisar uma Instrução Técnica específica?',
      resposta: 'Use a barra de busca na página inicial ou acesse a seção "Pesquisar ITs". Você pode buscar por número da IT, palavras-chave, assunto ou categoria. O sistema também suporta busca em linguagem natural.'
    },
    {
      pergunta: 'O que é a análise de memorial descritivo?',
      resposta: 'É uma ferramenta que analisa automaticamente seu memorial descritivo comparando com as Instruções Técnicas vigentes. O sistema identifica conformidades, não conformidades e fornece sugestões para melhorar o documento.'
    },
    {
      pergunta: 'Quais tipos de arquivo posso fazer upload para análise?',
      resposta: 'O sistema aceita arquivos em formato PDF (.pdf), Word (.docx) e Word legado (.doc). O tamanho máximo permitido é de 10MB por arquivo.'
    },
    {
      pergunta: 'Como interpretar os resultados da análise de conformidade?',
      resposta: 'Os resultados mostram um percentual geral de conformidade e detalhamento por item. Verde indica conformidade, amarelo indica conformidade parcial e vermelho indica não conformidade. Cada item inclui observações e referências às ITs aplicáveis.'
    },
    {
      pergunta: 'As Instruções Técnicas estão sempre atualizadas?',
      resposta: 'Sim, o sistema é atualizado regularmente com as versões mais recentes das ITs do Corpo de Bombeiros do Piauí. A data da última atualização é exibida em cada instrução técnica.'
    },
    {
      pergunta: 'Posso baixar as Instruções Técnicas?',
      resposta: 'Sim, você pode visualizar e baixar todas as ITs em formato PDF através da biblioteca ou páginas de resultados de pesquisa.'
    }
  ];

  const recursos = [
    {
      titulo: 'Busca Inteligente',
      descricao: 'Encontre ITs usando linguagem natural ou termos técnicos específicos.',
      icone: Search,
      link: '/pesquisar'
    },
    {
      titulo: 'Análise de Memorial',
      descricao: 'Faça upload e receba análise automatizada de conformidade.',
      icone: FileCheck,
      link: '/memorial'
    },
    {
      titulo: 'Biblioteca Completa',
      descricao: 'Acesse todas as ITs organizadas por categoria.',
      icone: Library,
      link: '/biblioteca'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <HelpCircle className="w-12 h-12 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Central de Ajuda</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Encontre respostas para suas dúvidas sobre o uso do sistema de consulta
          às Instruções Técnicas do CB-PI
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recursos Principais */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recursos do Sistema */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recursos do Sistema</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recursos.map((recurso, index) => {
                const Icon = recurso.icone;
                return (
                  <Link key={index} href={recurso.link}>
                    <Card hover className="h-full cursor-pointer">
                      <CardContent className="p-6 text-center">
                        <Icon className="w-8 h-8 text-red-600 mx-auto mb-3" />
                        <h3 className="font-semibold text-gray-900 mb-2">{recurso.titulo}</h3>
                        <p className="text-sm text-gray-600 mb-4">{recurso.descricao}</p>
                        <Button variant="outline" size="sm" className="w-full">
                          Acessar
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Perguntas Frequentes */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Perguntas Frequentes</h2>
            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <Card key={index}>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900">{item.pergunta}</h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{item.resposta}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Guia de Uso */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Como Usar o Sistema</h2>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-red-600 font-bold text-sm">1</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Pesquise Instruções Técnicas</h3>
                      <p className="text-gray-600">
                        Use a barra de busca para encontrar ITs por número, assunto ou palavras-chave.
                        Aplique filtros por categoria, data ou tags para refinar os resultados.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-red-600 font-bold text-sm">2</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Visualize e Baixe ITs</h3>
                      <p className="text-gray-600">
                        Acesse a biblioteca para navegar por todas as ITs organizadas por categoria.
                        Visualize o conteúdo online ou baixe os arquivos PDF.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-red-600 font-bold text-sm">3</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Analise Memoriais Descritivos</h3>
                      <p className="text-gray-600">
                        Faça upload de memoriais descritivos para receber análise automatizada de conformidade
                        com as ITs vigentes, incluindo relatório detalhado e sugestões.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Sidebar de Contato */}
        <div className="space-y-6">
          {/* Contato */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Precisa de Mais Ajuda?</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 text-sm">
                Entre em contato com nossa equipe de suporte para esclarecimentos adicionais.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <MessageCircle className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Chat Online</p>
                    <p className="text-xs text-gray-600">Seg-Sex, 8h às 18h</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">(86) 3218-8000</p>
                    <p className="text-xs text-gray-600">Seg-Sex, 8h às 18h</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">suporte@cbm.pi.gov.br</p>
                    <p className="text-xs text-gray-600">Resposta em até 24h</p>
                  </div>
                </div>
              </div>
              
              <Button variant="primary" className="w-full">
                Entrar em Contato
              </Button>
            </CardContent>
          </Card>

          {/* Links Úteis */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Links Úteis</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <a href="#" className="block text-sm text-red-600 hover:text-red-700">
                Portal do Corpo de Bombeiros PI
              </a>
              <a href="#" className="block text-sm text-red-600 hover:text-red-700">
                Legislação de Segurança Contra Incêndio
              </a>
              <a href="#" className="block text-sm text-red-600 hover:text-red-700">
                Formulários e Modelos
              </a>
              <a href="#" className="block text-sm text-red-600 hover:text-red-700">
                Calendário de Treinamentos
              </a>
            </CardContent>
          </Card>

          {/* Feedback */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Sua Opinião</h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">
                Ajude-nos a melhorar o sistema com seu feedback.
              </p>
              <Button variant="outline" className="w-full">
                Enviar Feedback
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}