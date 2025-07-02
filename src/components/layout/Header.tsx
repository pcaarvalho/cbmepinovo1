'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, BookOpen, FileCheck, Library, HelpCircle } from 'lucide-react';
import IntelligentSearchBar from '@/components/ui/IntelligentSearchBar';

const navigationItems = [
  {
    href: '/pesquisar',
    label: 'Pesquisar ITs',
    icon: Search
  },
  {
    href: '/memorial',
    label: 'Verificar Memorial',
    icon: FileCheck
  },
  {
    href: '/biblioteca',
    label: 'Biblioteca (105 ITs)',
    icon: Library
  },
  {
    href: '/ajuda',
    label: 'Ajuda',
    icon: HelpCircle
  }
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const isHomePage = pathname === '/';

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/pesquisar?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSuggestionSelect = (suggestion: { type: string; title: string; id?: string }) => {
    if (suggestion.type === 'instruction') {
      router.push(`/biblioteca/${suggestion.id}`);
    } else if (suggestion.type === 'category') {
      router.push(`/pesquisar?categoria=${encodeURIComponent(suggestion.title)}`);
    } else {
      handleSearch(suggestion.title);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-red-600 rounded-lg">
              <span className="text-white font-bold text-sm">CB</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">CB-PI</h1>
              <p className="text-xs text-gray-600">Instruções Técnicas</p>
            </div>
          </Link>

          {/* Search Bar (only on non-home pages) */}
          {!isHomePage && (
            <div className="flex-1 max-w-md mx-8 hidden lg:block">
              <IntelligentSearchBar
                placeholder="Buscar ITs..."
                onSearch={handleSearch}
                onSuggestionSelect={handleSuggestionSelect}
                size="sm"
                showCommands={false}
                maxSuggestions={5}
              />
            </div>
          )}

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-red-100 text-red-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900"
            >
              <BookOpen className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        <div className="md:hidden border-t border-gray-200 pt-4 pb-3">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium ${
                    isActive
                      ? 'bg-red-100 text-red-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}