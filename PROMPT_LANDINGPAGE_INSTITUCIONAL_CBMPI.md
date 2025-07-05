# PROMPT_LANDINGPAGE_INSTITUCIONAL_CBMPI.md

## Objetivo
Desenvolver uma landing page institucional moderna para o Corpo de Bombeiros Militar do Estado do Piauí, reforçando a identidade visual do órgão e a conexão oficial com o Governo do Estado do Piauí.

## Diretrizes Criativas e Técnicas

- **Brasão do Corpo de Bombeiros Militar do Piauí:**  
  Incluir o brasão oficial (fornecido em anexo) em destaque na seção principal da página.
- **Selo do Governo do Estado do Piauí:**  
  Exibir o selo/governo ao lado direito do brasão do CBMEPI, transmitindo autoridade e institucionalidade.
- **Cores institucionais:**  
  Utilizar paleta baseada em tons de vermelho, vinho e dourado, remetendo à identidade do CBMEPI, com gradientes suaves e elementos modernos.
- **Tipografia:**  
  Títulos em fontes sólidas e modernas (ex: Montserrat, Roboto Slab), textos em fontes limpas e legíveis.
- **Layout:**  
  - Seção principal (hero) centralizada, com o brasão do CBMEPI à esquerda, texto institucional ao centro, e selo do governo à direita.
  - Fundo com leve gradiente ou pattern discreto (ex: textura de malha ou linhas suaves).
  - Botão de chamada para ação (CTA) institucional, exemplo: “Consultar Instruções Técnicas” ou “Acesse o Sistema”.

## Texto de Destaque (Hero)
> **Corpo de Bombeiros Militar**
> 
> **81 Anos**  
> Protegendo o Piauí

## Slogan complementar
> Segurança, prevenção e compromisso com a sociedade piauiense.

## Detalhes visuais
- Aplicar efeito sutil de glassmorphism no topo (header).
- Ícones institucionais opcionais (chama, escudo, hidrante).
- Responsividade total para mobile.

## Acessibilidade e Performance
- Imagens com alt text descritivo.
- Contraste adequado de cores para leitura.
- Otimização de imagens para carregamento rápido.

## Observações
- Usar as imagens fornecidas (brasão CBMEPI e selo Governo do Piauí) sem distorção.
- Priorizar um visual de confiança e modernidade, alinhado ao setor público.
- Adicionar seção de informações institucionais ou links úteis na parte inferior.

---

## Exemplo visual em HTML/JSX (apenas referência, adapte ao framework)

```jsx
<section className="relative min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-yellow-900">
  <header className="flex items-center justify-between px-8 py-6 backdrop-blur-lg bg-white/10 border-b border-white/10">
    <img src="/brasao-cbm-pi.png" alt="Brasão Corpo de Bombeiros Militar do Piauí" className="h-16 w-16" />
    <div className="flex flex-col items-center">
      <h1 className="text-3xl font-bold text-white uppercase">Corpo de Bombeiros Militar</h1>
      <span className="text-2xl font-extrabold text-yellow-200 mt-2">81 Anos</span>
      <p className="text-white text-sm mt-1">Protegendo o Piauí</p>
    </div>
    <img  alt="Governo do Estado do Piauí" className="h-16" />
    # procure na internet o brasao do govero do estado do piaui
  </header>
  {/* ...outras seções */}
</section>
