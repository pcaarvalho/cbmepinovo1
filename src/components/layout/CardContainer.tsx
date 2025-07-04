// AIDEV-EXPLANATION: Componente reutilizável para containers com estilo unificado
import { ReactNode } from 'react';

interface CardContainerProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'solid' | 'gradient';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  glow?: boolean;
  animate?: boolean;
}

export default function CardContainer({
  children,
  className = '',
  variant = 'glass',
  padding = 'lg',
  glow = false,
  animate = false,
}: CardContainerProps) {
  // AIDEV-EXPLANATION: Classes base para cada variante
  const variantClasses = {
    default: 'bg-zinc-900/50 backdrop-blur border border-zinc-800/50',
    glass: 'bg-zinc-900/30 backdrop-blur-xl border border-zinc-800/50',
    solid: 'bg-zinc-900 border border-zinc-800',
    gradient: 'bg-gradient-to-br from-zinc-900/90 to-zinc-800/90 backdrop-blur border border-zinc-700/50',
  };

  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };

  // AIDEV-EXPLANATION: Classes condicionais para efeitos
  const effectClasses = [
    glow ? 'shadow-2xl shadow-red-600/10' : 'shadow-lg',
    animate ? 'hover:scale-[1.02] transition-all duration-300' : '',
  ].join(' ');

  return (
    <div className={`relative group ${animate ? 'transform-gpu' : ''}`}>
      {/* AIDEV-EXPLANATION: Efeito de glow opcional */}
      {glow && (
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none" />
      )}
      
      {/* Container principal */}
      <div className={`
        relative 
        rounded-2xl 
        ${variantClasses[variant]} 
        ${paddingClasses[padding]} 
        ${effectClasses} 
        ${className}
      `}>
        {children}
      </div>
    </div>
  );
}