import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "CB-PI | Instruções Técnicas",
  description: "Sistema de consulta inteligente de Instruções Técnicas do Corpo de Bombeiros do Piauí com análise de conformidade de memoriais descritivos.",
  keywords: "corpo de bombeiros, piauí, instruções técnicas, segurança contra incêndio, memorial descritivo",
  authors: [{ name: "Corpo de Bombeiros do Piauí" }],
  robots: "index, follow",
  openGraph: {
    title: "CB-PI | Instruções Técnicas",
    description: "Sistema de consulta inteligente de Instruções Técnicas do Corpo de Bombeiros do Piauí",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} font-sans antialiased bg-gray-50`}>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="bg-gray-900 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-gray-300">
                © 2024 Corpo de Bombeiros do Piauí. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
