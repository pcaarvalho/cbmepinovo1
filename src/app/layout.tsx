// AIDEV-EXPLANATION: Layout unificado moderno e institucional para toda aplicação CBMEPI
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import UnifiedFooter from "@/components/layout/UnifiedFooter";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "CBMEPI | Sistema Inteligente de Instruções Técnicas",
  description: "Sistema oficial do Corpo de Bombeiros do Piauí para consulta inteligente de Instruções Técnicas com IA avançada",
  keywords: "corpo de bombeiros, piauí, instruções técnicas, segurança contra incêndio, memorial descritivo, inteligência artificial",
  authors: [{ name: "Corpo de Bombeiros Militar do Estado do Piauí" }],
  robots: "index, follow",
  openGraph: {
    title: "CBMEPI | Sistema Inteligente de Instruções Técnicas",
    description: "Sistema oficial do Corpo de Bombeiros do Piauí com IA avançada",
    type: "website",
    locale: "pt_BR",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CBMEPI - Sistema Inteligente",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-red-950/20 text-white font-sans antialiased">
        {/* AIDEV-EXPLANATION: Background patterns e efeitos visuais globais */}
        <div className="fixed inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-red-950/20 pointer-events-none" />
        
        {/* Pattern técnico sutil */}
        <div className="fixed inset-0 opacity-[0.015] pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Ornamentos decorativos animados */}
        <div className="fixed top-1/4 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="fixed bottom-1/4 left-1/4 w-72 h-72 bg-red-500/5 rounded-full blur-3xl pointer-events-none animate-pulse animation-delay-2000" />

        {/* AIDEV-EXPLANATION: Header unificado com glassmorphism */}
        <UnifiedHeader />
        
        {/* AIDEV-EXPLANATION: Main content com espaçamento adequado */}
        <main className="relative z-10 min-h-[calc(100vh-4rem)]">
          {children}
        </main>

        {/* AIDEV-EXPLANATION: Footer unificado institucional */}
        <UnifiedFooter />
      </body>
    </html>
  );
}