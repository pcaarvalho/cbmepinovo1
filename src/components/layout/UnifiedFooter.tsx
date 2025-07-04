// AIDEV-EXPLANATION: Footer unificado institucional e elegante
import Link from 'next/link';
import { 
  Shield, Phone, Mail, MapPin, Clock, 
  Facebook, Instagram, Twitter, Youtube,
  ExternalLink, Users, Award, BookOpen
} from 'lucide-react';

export default function UnifiedFooter() {
  const currentYear = new Date().getFullYear();

  // AIDEV-EXPLANATION: Links organizados por categoria
  const footerLinks = {
    servicos: [
      { label: 'Pesquisar ITs', href: '/pesquisar' },
      { label: 'Chat IA Especialista', href: '/chat' },
      { label: 'Verificar Memorial', href: '/memorial' },
      { label: 'Biblioteca Completa', href: '/biblioteca' },
    ],
    institucional: [
      { label: 'Sobre o CBMEPI', href: 'https://www.cbm.pi.gov.br/sobre', external: true },
      { label: 'Portal da Transparência', href: 'https://transparencia.pi.gov.br/', external: true },
      { label: 'Ouvidoria', href: 'https://www.ouvidoria.pi.gov.br/', external: true },
      { label: 'Legislação', href: '/legislacao', external: false },
    ],
    suporte: [
      { label: 'Central de Ajuda', href: '/ajuda' },
      { label: 'Tutoriais', href: '/ajuda#tutoriais' },
      { label: 'Perguntas Frequentes', href: '/ajuda#faq' },
      { label: 'Contato Técnico', href: '/ajuda#contato' },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: 'https://www.facebook.com/cbmpi', label: 'Facebook' },
    { icon: Instagram, href: 'https://www.instagram.com/cbmpi', label: 'Instagram' },
    { icon: Twitter, href: 'https://twitter.com/cbmpi', label: 'Twitter' },
    { icon: Youtube, href: 'https://www.youtube.com/@cbmpi', label: 'Youtube' },
  ];

  return (
    <footer className="relative border-t border-zinc-800/50 bg-zinc-950/50 backdrop-blur-xl mt-24">
      {/* AIDEV-EXPLANATION: Gradiente decorativo superior */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-red-600/20 rounded-lg blur-lg" />
                <div className="relative w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center shadow-xl">
                  <Shield className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">CBMEPI</h3>
                <p className="text-sm text-zinc-400">
                  Corpo de Bombeiros Militar do Estado do Piauí
                </p>
              </div>
            </div>
            <p className="text-sm text-zinc-500 max-w-md mb-6">
              Sistema oficial para consulta inteligente de Instruções Técnicas 
              com tecnologia de IA avançada, garantindo segurança e conformidade 
              em projetos de prevenção contra incêndio.
            </p>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap gap-4 text-zinc-500">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span className="text-xs">Sistema Oficial</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4" />
                <span className="text-xs">Certificado</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span className="text-xs">Suporte 24/7</span>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="font-semibold text-white mb-4">Serviços</h4>
            <ul className="space-y-2">
              {footerLinks.servicos.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-sm text-zinc-400 hover:text-red-400 transition-colors flex items-center space-x-1"
                  >
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Institucional</h4>
            <ul className="space-y-2">
              {footerLinks.institucional.map((link) => (
                <li key={link.href}>
                  <a 
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    className="text-sm text-zinc-400 hover:text-red-400 transition-colors flex items-center space-x-1"
                  >
                    <span>{link.label}</span>
                    {link.external && <ExternalLink className="w-3 h-3" />}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Suporte</h4>
            <ul className="space-y-2">
              {footerLinks.suporte.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-sm text-zinc-400 hover:text-red-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Section */}
        <div className="border-t border-zinc-800/50 pt-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-zinc-800/50 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Emergência</p>
                <p className="text-sm text-zinc-400">193</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-zinc-800/50 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Ouvidoria</p>
                <p className="text-sm text-zinc-400">(86) 3216-1234</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-zinc-800/50 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">E-mail</p>
                <p className="text-sm text-zinc-400">contato@cbm.pi.gov.br</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-zinc-800/50 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Atendimento</p>
                <p className="text-sm text-zinc-400">24 horas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-zinc-800/50 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-sm text-zinc-500">
                © {currentYear} Corpo de Bombeiros Militar do Estado do Piauí. Todos os direitos reservados.
              </p>
              <p className="text-xs text-zinc-600 mt-1">
                Sistema desenvolvido com tecnologia de ponta para melhor servir a população piauiense.
              </p>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-zinc-800/50 rounded-lg flex items-center justify-center hover:bg-red-600/20 hover:text-red-400 transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AIDEV-EXPLANATION: Linha de gradiente decorativa inferior */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600/30 to-transparent" />
    </footer>
  );
}