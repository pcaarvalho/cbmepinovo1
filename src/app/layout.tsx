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
    <html lang="pt-BR" className={inter.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen bg-gray-50 font-sans antialiased">
        <Header />
        <main className="pt-16">
          {children}
        </main>
      </body>
    </html>
  );
}