import { Suspense } from 'react';
import BibliotecaContentScraped from '@/components/BibliotecaContentScraped';

export default function BibliotecaPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Carregando...</div>}>
      <BibliotecaContentScraped />
    </Suspense>
  );
}