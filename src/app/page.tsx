'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, Shield, FileText, Sparkles, CheckCircle, 
  ArrowRight, Bot, Brain, Zap, Lock, Target,
  ChevronDown, Menu, X, BookOpen, Users, Award
} from 'lucide-react';

// AIDEV-EXPLANATION: Página inicial ajustada para usar o novo layout unificado
export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // AIDEV-EXPLANATION: Efeito de scroll para ativar glassmorphism no header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // AIDEV-EXPLANATION: Tracking do mouse para efeitos visuais interativos
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative overflow-x-hidden">


      {/* AIDEV-EXPLANATION: Hero Section com animações e efeitos visuais avançados */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-24">
        {/* Elemento decorativo animado */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-transparent rounded-full blur-3xl animate-spin-slow" />
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          {/* Badge de IA */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600/10 border border-red-600/30 rounded-full mb-8">
            <Sparkles className="w-4 h-4 text-red-400" />
            <span className="text-sm text-red-400">Powered by AI Superinteligente</span>
          </div>

          {/* Título Principal com efeito de gradiente */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Consulta Inteligente das
            </span>
            <br />
            <span className="bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent">
              Instruções Técnicas
            </span>
          </h1>

          {/* Subtítulo */}
          <p className="text-xl md:text-2xl text-zinc-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Sistema oficial do Corpo de Bombeiros do Piauí para consulta normativa 
            com <span className="text-red-400">inteligência artificial avançada</span> e 
            análise semântica de documentos técnicos
          </p>

          {/* CTAs principais */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/pesquisar" className="group relative px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 rounded-xl text-white font-semibold text-lg shadow-2xl shadow-red-600/20 hover:shadow-red-600/40 transform hover:scale-105 transition-all duration-300">
              <span className="relative z-10 flex items-center justify-center space-x-2">
                <Search className="w-5 h-5" />
                <span>Pesquisar Instruções Técnicas</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-800 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>

            <Link href="/memorial" className="group px-8 py-4 bg-zinc-800 border border-zinc-600 rounded-xl text-white font-semibold text-lg hover:bg-zinc-700 hover:border-zinc-500 transform hover:scale-105 transition-all duration-300">
              <span className="flex items-center justify-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Verificar Memorial</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-transparent rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative bg-zinc-800/80 backdrop-blur border border-zinc-700 rounded-xl p-6">
                <div className="text-3xl font-bold text-red-400 mb-2">105</div>
                <div className="text-zinc-300">Instruções Técnicas</div>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-transparent rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative bg-zinc-800/80 backdrop-blur border border-zinc-700 rounded-xl p-6">
                <div className="text-3xl font-bold text-red-400 mb-2">IA</div>
                <div className="text-zinc-300">Análise Inteligente</div>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-transparent rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative bg-zinc-800/80 backdrop-blur border border-zinc-700 rounded-xl p-6">
                <div className="text-3xl font-bold text-red-400 mb-2">24/7</div>
                <div className="text-zinc-300">Disponibilidade</div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronDown className="w-6 h-6 text-zinc-400" />
          </div>
        </div>
      </section>

      {/* AIDEV-EXPLANATION: Seção de Funcionalidades com cards interativos */}
      <section id="funcionalidades" className="relative py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                Funcionalidades Avançadas
              </span>
            </h2>
            <p className="text-xl text-zinc-300 max-w-2xl mx-auto">
              Sistema completo para consulta e análise de normas técnicas com IA
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card 1 - Busca Inteligente */}
            <Link href="/pesquisar" className="group relative block">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="relative bg-zinc-800/80 backdrop-blur border border-zinc-700 rounded-2xl p-8 hover:border-zinc-600 transition-all duration-300 h-full cursor-pointer">
                <div className="w-14 h-14 bg-red-600/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Brain className="w-7 h-7 text-red-400" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">Busca Semântica</h3>
                <p className="text-zinc-300 mb-6">
                  IA analisa contexto e intenção, não apenas palavras-chave. 
                  Encontre exatamente o que precisa.
                </p>
                <div className="flex items-center text-red-400 font-medium">
                  <span>Explorar</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Card 2 - Chat IA */}
            <Link href="/chat" className="group relative block">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="relative bg-zinc-800/80 backdrop-blur border border-zinc-700 rounded-2xl p-8 hover:border-zinc-600 transition-all duration-300 h-full cursor-pointer">
                <div className="w-14 h-14 bg-red-600/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Bot className="w-7 h-7 text-red-400" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">Chat Especialista</h3>
                <p className="text-zinc-300 mb-6">
                  Converse com IA treinada em todas as 105 ITs. 
                  Respostas precisas e contextualizadas.
                </p>
                <div className="flex items-center text-red-400 font-medium">
                  <span>Conversar</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Card 3 - Análise de Memorial */}
            <Link href="/memorial" className="group relative block">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="relative bg-zinc-800/80 backdrop-blur border border-zinc-700 rounded-2xl p-8 hover:border-zinc-600 transition-all duration-300 h-full cursor-pointer">
                <div className="w-14 h-14 bg-red-600/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="w-7 h-7 text-red-400" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">Análise de Memorial</h3>
                <p className="text-zinc-300 mb-6">
                  Verificação automática de conformidade. 
                  Identifica pontos de atenção instantaneamente.
                </p>
                <div className="flex items-center text-red-400 font-medium">
                  <span>Analisar</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Card 4 - Cálculos Automáticos */}
            <Link href="/calculadora" className="group relative block">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="relative bg-zinc-800/80 backdrop-blur border border-zinc-700 rounded-2xl p-8 hover:border-zinc-600 transition-all duration-300 h-full cursor-pointer">
                <div className="w-14 h-14 bg-red-600/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Target className="w-7 h-7 text-red-400" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">Dimensionamentos</h3>
                <p className="text-zinc-300 mb-6">
                  Cálculos precisos de extintores, hidrantes e saídas 
                  conforme normas vigentes.
                </p>
                <div className="flex items-center text-red-400 font-medium">
                  <span>Calcular</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Card 5 - Base Atualizada */}
            <Link href="/instrucoes" className="group relative block">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="relative bg-zinc-800/80 backdrop-blur border border-zinc-700 rounded-2xl p-8 hover:border-zinc-600 transition-all duration-300 h-full">
                <div className="w-14 h-14 bg-red-600/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="w-7 h-7 text-red-400" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">Base Atualizada</h3>
                <p className="text-zinc-300 mb-6">
                  Todas as 105 ITs sempre atualizadas. 
                  Acompanhe mudanças e revisões.
                </p>
                <div className="flex items-center text-red-400 font-medium">
                  <span>Acessar</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Card 6 - Segurança */}
            <Link href="/ajuda#seguranca" className="group relative block">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="relative bg-zinc-800/80 backdrop-blur border border-zinc-700 rounded-2xl p-8 hover:border-zinc-600 transition-all duration-300 h-full cursor-pointer">
                <div className="w-14 h-14 bg-red-600/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Lock className="w-7 h-7 text-red-400" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">Segurança Total</h3>
                <p className="text-zinc-300 mb-6">
                  Sistema oficial e seguro. Dados protegidos 
                  e conformidade garantida.
                </p>
                <div className="flex items-center text-red-400 font-medium">
                  <span>Saiba mais</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* AIDEV-EXPLANATION: Seção de Tecnologia com visual futurista */}
      <section id="tecnologia" className="relative py-24 px-6 overflow-hidden">
        {/* Background decorativo */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-950/10 to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-red-600/10 border border-red-600/30 rounded-full mb-6">
                <Zap className="w-3 h-3 text-red-400" />
                <span className="text-xs text-red-400 uppercase tracking-wider">Tecnologia de Ponta</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                  IA Superinteligente
                </span>
                <br />
                <span className="text-2xl md:text-3xl text-zinc-300">
                  para Segurança Contra Incêndio
                </span>
              </h2>
              
              <p className="text-lg text-zinc-300 mb-8 leading-relaxed">
                Desenvolvemos uma inteligência artificial especializada que compreende 
                profundamente o contexto normativo do CBMEPI, oferecendo respostas 
                precisas e aplicáveis.
              </p>

              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-red-600/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-1">Análise Contextual Profunda</h4>
                    <p className="text-zinc-300">
                      Compreende intenção, nível técnico e necessidades implícitas
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-red-600/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-1">Auto-Aprendizado Contínuo</h4>
                    <p className="text-zinc-300">
                      Melhora com cada interação através de feedback inteligente
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-red-600/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-1">Respostas Estruturadas</h4>
                    <p className="text-zinc-300">
                      Base legal, aplicabilidade prática e alertas técnicos sempre presentes
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <Link href="/chat" className="inline-flex items-center space-x-2 px-6 py-3 bg-red-600 rounded-xl text-white font-semibold hover:bg-red-700 transform hover:scale-105 transition-all duration-300">
                  <span>Experimentar Agora</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Visual Tech */}
            <div className="relative">
              <div className="relative w-full h-[500px] bg-zinc-800/50 backdrop-blur border border-zinc-700 rounded-2xl p-8 overflow-hidden">
                {/* Animated neural network visualization */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-64 h-64">
                    {/* Central node */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center">
                      <Brain className="w-10 h-10 text-red-400" />
                    </div>
                    
                    {/* Orbiting nodes */}
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="absolute w-12 h-12 bg-zinc-800/50 rounded-full flex items-center justify-center animate-orbit"
                        style={{
                          top: '50%',
                          left: '50%',
                          transform: `rotate(${i * 60}deg) translateX(100px) rotate(-${i * 60}deg)`,
                          animationDelay: `${i * 0.5}s`,
                        }}
                      >
                        <div className="w-3 h-3 bg-red-400 rounded-full" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tech stats overlay */}
                <div className="absolute bottom-8 left-8 right-8 bg-zinc-900/90 backdrop-blur rounded-lg p-4 border border-zinc-700">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-red-400">98.5%</div>
                      <div className="text-xs text-zinc-300">Precisão</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-400">&lt;2s</div>
                      <div className="text-xs text-zinc-300">Resposta</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-400">24/7</div>
                      <div className="text-xs text-zinc-300">Online</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AIDEV-EXPLANATION: CTA Final com visual impactante */}
      <section className="relative py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-red-600/10 to-red-600/20 blur-3xl" />
            
            <div className="relative bg-gradient-to-r from-zinc-800 to-zinc-700 rounded-3xl p-12 border border-zinc-600">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Comece a usar o sistema mais avançado do Brasil
              </h2>
              <p className="text-xl text-zinc-300 mb-8 max-w-2xl mx-auto">
                Junte-se aos profissionais que já utilizam nossa IA para 
                garantir conformidade e segurança em seus projetos
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/pesquisar" className="px-8 py-4 bg-red-600 rounded-xl text-white font-semibold hover:bg-red-700 transform hover:scale-105 transition-all duration-300">
                  Começar Agora
                </Link>
                <Link href="/ajuda" className="px-8 py-4 bg-zinc-800 border border-zinc-600 rounded-xl text-white font-semibold hover:bg-zinc-700 hover:border-zinc-500 transform hover:scale-105 transition-all duration-300">
                  Saiba Mais
                </Link>
              </div>

              {/* Trust badges */}
              <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-zinc-300">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span className="text-sm">Sistema Oficial</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Lock className="w-5 h-5" />
                  <span className="text-sm">100% Seguro</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5" />
                  <span className="text-sm">Certificado CBMEPI</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
}