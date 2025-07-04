// AIDEV-EXPLANATION: Componente de header de página para consistência visual
import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  badge?: string;
  children?: ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  icon: Icon,
  badge,
  children,
}: PageHeaderProps) {
  return (
    <div className="relative mb-12">
      {/* AIDEV-EXPLANATION: Background decorativo */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 to-transparent rounded-3xl blur-3xl" />
      
      <div className="relative">
        {/* Badge opcional */}
        {badge && (
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600/10 border border-red-600/30 rounded-full mb-6">
            {Icon && <Icon className="w-4 h-4 text-red-400" />}
            <span className="text-sm text-red-400">{badge}</span>
          </div>
        )}

        {/* Título principal */}
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            {title}
          </span>
        </h1>

        {/* Subtítulo */}
        {subtitle && (
          <p className="text-xl text-zinc-400 max-w-3xl">
            {subtitle}
          </p>
        )}

        {/* Conteúdo adicional (botões, etc) */}
        {children && (
          <div className="mt-8">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}