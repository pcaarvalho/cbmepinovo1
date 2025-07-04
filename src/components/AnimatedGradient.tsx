// AIDEV-EXPLANATION: Componente de gradiente animado para efeitos visuais avançados
'use client';

import { useEffect, useRef } from 'react';

interface AnimatedGradientProps {
  className?: string;
}

export default function AnimatedGradient({ className = '' }: AnimatedGradientProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const animate = () => {
      time += 0.001;

      // Create gradient
      const gradient = ctx.createLinearGradient(
        0, 
        0, 
        canvas.width, 
        canvas.height
      );

      // Animated color stops
      const r1 = Math.sin(time) * 50 + 100;
      const r2 = Math.sin(time + 2) * 50 + 150;
      
      gradient.addColorStop(0, `rgba(${r1}, 0, 0, 0.1)`);
      gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(1, `rgba(${r2}, 0, 0, 0.1)`);

      // Clear and draw
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animationId = requestAnimationFrame(animate);
    };

    resize();
    animate();

    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{ mixBlendMode: 'screen' }}
    />
  );
}