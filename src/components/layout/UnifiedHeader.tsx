// AIDEV-EXPLANATION: Header unificado com navegação moderna e glassmorphism
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Shield, Menu, X, Search, FileText, Brain, BookOpen, 
  HelpCircle, Home, MessageCircle, ChevronDown 
} from 'lucide-react';

export default function UnifiedHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const pathname = usePathname();

  // AIDEV-EXPLANATION: Efeito de scroll para ativar glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // AIDEV-EXPLANATION: Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (servicesDropdownOpen && !(event.target as Element).closest('.services-dropdown')) {
        setServicesDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [servicesDropdownOpen]);

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { path: '/', label: 'Início', icon: Home },
    { 
      path: '#', 
      label: 'Serviços', 
      icon: ChevronDown,
      isDropdown: true,
      dropdownItems: [
        { path: '/pesquisar', label: 'Pesquisar ITs', icon: Search },
        { path: '/chat', label: 'Chat IA', icon: MessageCircle },
        { path: '/memorial', label: 'Verificar Memorial', icon: FileText },
        { path: '/biblioteca', label: 'Biblioteca', icon: BookOpen },
      ]
    },
    { path: '/ajuda', label: 'Ajuda', icon: HelpCircle },
  ];

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50 shadow-lg' 
        : 'bg-transparent'
    }`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo e Brasão */}
          <Link href="/" className="flex items-center space-x-3 group">
            {/* AIDEV-EXPLANATION: Brasão com efeito 3D e glow */}
            <div className="relative">
              <div className="absolute inset-0 bg-red-600/20 rounded-lg blur-lg group-hover:bg-red-600/30 transition-all duration-300" />
              <div className="relative w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 shadow-xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                CBMEPI
              </span>
              <span className="text-xs text-zinc-400 hidden sm:block">
                Sistema Inteligente
              </span>
            </div>
          </Link>

          {/* Menu Desktop */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              item.isDropdown ? (
                <div key={item.label} className="relative services-dropdown">
                  <button
                    onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      servicesDropdownOpen
                        ? 'text-red-400 bg-red-600/10'
                        : 'text-zinc-300 hover:text-white hover:bg-zinc-800/50'
                    }`}
                  >
                    <span>{item.label}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${
                      servicesDropdownOpen ? 'rotate-180' : ''
                    }`} />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {servicesDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800/50 rounded-xl shadow-2xl overflow-hidden">
                      {item.dropdownItems?.map((dropdownItem) => (
                        <Link
                          key={dropdownItem.path}
                          href={dropdownItem.path}
                          className={`flex items-center space-x-3 px-4 py-3 hover:bg-zinc-800/50 transition-colors ${
                            isActive(dropdownItem.path) ? 'text-red-400 bg-zinc-800/30' : 'text-zinc-300'
                          }`}
                          onClick={() => setServicesDropdownOpen(false)}
                        >
                          <dropdownItem.icon className="w-4 h-4" />
                          <span>{dropdownItem.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? 'text-red-400 bg-red-600/10'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-800/50'
                  }`}
                >
                  {item.icon && <item.icon className="w-4 h-4" />}
                  <span>{item.label}</span>
                </Link>
              )
            ))}

            {/* CTA Button */}
            <Link 
              href="/chat" 
              className="ml-4 flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 rounded-lg text-white font-medium hover:from-red-700 hover:to-red-800 transform hover:scale-105 transition-all duration-300 shadow-lg shadow-red-600/20"
            >
              <Brain className="w-4 h-4" />
              <span>Acessar IA</span>
            </Link>
          </div>

          {/* Menu Mobile Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800/50 shadow-2xl">
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                item.isDropdown ? (
                  <div key={item.label} className="space-y-2">
                    <div className="text-zinc-400 text-sm font-medium px-3 py-2">
                      {item.label}
                    </div>
                    {item.dropdownItems?.map((dropdownItem) => (
                      <Link
                        key={dropdownItem.path}
                        href={dropdownItem.path}
                        className={`flex items-center space-x-3 px-6 py-2 rounded-lg transition-colors ${
                          isActive(dropdownItem.path)
                            ? 'text-red-400 bg-red-600/10'
                            : 'text-zinc-300 hover:text-white hover:bg-zinc-800/50'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <dropdownItem.icon className="w-4 h-4" />
                        <span>{dropdownItem.label}</span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? 'text-red-400 bg-red-600/10'
                        : 'text-zinc-300 hover:text-white hover:bg-zinc-800/50'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.icon && <item.icon className="w-4 h-4" />}
                    <span>{item.label}</span>
                  </Link>
                )
              ))}
              
              {/* Mobile CTA */}
              <Link 
                href="/chat" 
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 rounded-lg text-white font-medium mt-4"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Brain className="w-4 h-4" />
                <span>Acessar IA</span>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}