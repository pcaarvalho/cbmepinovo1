// ==============================================================================
// DADOS MOCKADOS DAS INSTRUÇÕES TÉCNICAS COM CONTEÚDO DETALHADO
// ==============================================================================

export interface MockITCapitulo {
  numero: string;
  titulo: string;
  pagina: number;
  conteudo: string;
}

export interface MockInstrucaoTecnica {
  id: string;
  titulo: string;
  capitulos: MockITCapitulo[];
}

export const MOCK_IT_CONTENT: MockInstrucaoTecnica[] = [
  {
    id: 'IT-001',
    titulo: 'IT-001 - Procedimentos Administrativos',
    capitulos: [
      {
        numero: '1',
        titulo: 'Disposições Gerais',
        pagina: 3,
        conteudo: `
Esta Instrução Técnica estabelece os procedimentos administrativos para análise e aprovação de projetos preventivos contra incêndio e pânico.

1.1 OBJETIVO
Estabelecer critérios para a tramitação de processos de análise de projetos preventivos.

1.2 APLICAÇÃO
Aplica-se a todas as edificações que necessitem de projeto preventivo conforme legislação vigente.

1.3 RESPONSABILIDADES
O responsável técnico deve apresentar a documentação completa conforme esta IT.
        `
      },
      {
        numero: '2',
        titulo: 'Documentação Necessária',
        pagina: 5,
        conteudo: `
2.1 PROJETO ARQUITETÔNICO
Memorial descritivo detalhado da edificação com todas as especificações técnicas.

2.2 PLANTA BAIXA
Plantas baixas de todos os pavimentos em escala adequada (1:100 ou 1:50).

2.3 ART/RRT
Anotação de Responsabilidade Técnica devidamente preenchida e assinada.

2.4 CRONOGRAMA
Cronograma de execução das obras e instalações de segurança.
        `
      },
      {
        numero: '3',
        titulo: 'Tramitação do Processo',
        pagina: 8,
        conteudo: `
3.1 PROTOCOLO
Todos os processos devem ser protocolados no sistema online do CB-PI.

3.2 ANÁLISE TÉCNICA
A análise será realizada por técnico habilitado no prazo de 30 dias úteis.

3.3 PARECER TÉCNICO
O parecer será emitido em formulário próprio com classificação: Aprovado, Aprovado com Ressalvas ou Reprovado.
        `
      }
    ]
  },
  {
    id: 'IT-008',
    titulo: 'IT-008 - Saídas de Emergência',
    capitulos: [
      {
        numero: '3',
        titulo: 'Dimensionamento das Saídas',
        pagina: 12,
        conteudo: `
3.1 LARGURA MÍNIMA
As saídas de emergência devem ter largura mínima de 1,20m (um metro e vinte centímetros).

3.2 CAPACIDADE DE ESCOAMENTO
A capacidade de escoamento é de 100 pessoas por metro de largura da saída.

3.3 PORTAS DE EMERGÊNCIA
As portas devem abrir no sentido do escape e ter barra antipânico quando exigido.

3.4 CORREDORES
Os corredores de emergência devem ter largura mínima de 1,20m e máxima de 2,20m.
        `
      },
      {
        numero: '4',
        titulo: 'Sinalização de Emergência',
        pagina: 18,
        conteudo: `
4.1 PLACAS DE SAÍDA
Todas as saídas de emergência devem ser sinalizadas com placas fotoluminescentes.

4.2 ORIENTAÇÃO DO FLUXO
Setas indicativas devem orientar o fluxo de pessoas até as saídas.

4.3 ILUMINAÇÃO DE EMERGÊNCIA
Sistema de iluminação de emergência com autonomia mínima de 1 hora.
        `
      },
      {
        numero: '5',
        titulo: 'Escadas de Emergência',
        pagina: 25,
        conteudo: `
5.1 DIMENSIONAMENTO
Largura mínima de 1,20m para escadas retilíneas e 1,50m para escadas com mudança de direção.

5.2 DEGRAUS
Altura máxima do espelho: 18cm. Largura mínima do piso: 25cm.

5.3 PATAMARES
Comprimento mínimo igual à largura da escada, nunca inferior a 1,20m.

5.4 ANTECÂMARA
Quando exigida, deve ter área mínima de 4,00m² e ventilação natural ou forçada.
        `
      }
    ]
  },
  {
    id: 'IT-018',
    titulo: 'IT-018 - Iluminação de Emergência',
    capitulos: [
      {
        numero: '5',
        titulo: 'Especificações Técnicas',
        pagina: 8,
        conteudo: `
5.1 AUTONOMIA
O sistema deve ter autonomia mínima de 1 (uma) hora após falta de energia elétrica.

5.2 INTENSIDADE LUMINOSA
Mínimo de 5 lux em corredores e 3 lux em ambientes de permanência.

5.3 TEMPO DE COMUTAÇÃO
A comutação deve ocorrer em no máximo 5 segundos após a falta de energia.

5.4 BATERIAS
Utilizar baterias seladas livres de manutenção com vida útil mínima de 3 anos.
        `
      },
      {
        numero: '6',
        titulo: 'Localização dos Pontos de Luz',
        pagina: 12,
        conteudo: `
6.1 ROTAS DE FUGA
Instalar luminárias a cada 15 metros ao longo das rotas de fuga.

6.2 MUDANÇAS DE DIREÇÃO
Obrigatória instalação em todos os pontos de mudança de direção.

6.3 ESCADAS
Uma luminária a cada patamar e no máximo a cada 3 metros de desnível.

6.4 SAÍDAS
Luminária sobre cada saída de emergência e na área imediatamente anterior.
        `
      }
    ]
  },
  {
    id: 'IT-021',
    titulo: 'IT-021 - Sistema de Proteção por Extintores',
    capitulos: [
      {
        numero: '6',
        titulo: 'Classificação e Distribuição',
        pagina: 15,
        conteudo: `
6.1 CLASSES DE FOGO
Classe A: materiais sólidos (madeira, papel, tecido)
Classe B: líquidos inflamáveis (gasolina, álcool)
Classe C: equipamentos elétricos energizados

6.2 DISTÂNCIA MÁXIMA
A distância máxima de caminhamento até o extintor não deve exceder 20 metros.

6.3 ALTURA DE INSTALAÇÃO
Os extintores devem ser instalados com a parte superior a 1,60m do piso.

6.4 SINALIZAÇÃO
Todos os extintores devem ter sinalização adequada conforme normas.
        `
      },
      {
        numero: '7',
        titulo: 'Tipos de Extintores',
        pagina: 20,
        conteudo: `
7.1 EXTINTOR DE ÁGUA
Indicado para classe A. Capacidade mínima de 10 litros.

7.2 EXTINTOR DE PÓ QUÍMICO SECO
Multipropósito (ABC). Capacidade mínima de 4kg.

7.3 EXTINTOR DE CO2
Indicado para classes B e C. Capacidade mínima de 6kg.

7.4 EXTINTOR DE ESPUMA
Indicado para classes A e B. Capacidade mínima de 9 litros.
        `
      }
    ]
  },
  {
    id: 'IT-022',
    titulo: 'IT-022 - Sistema de Hidrantes',
    capitulos: [
      {
        numero: '7',
        titulo: 'Dimensionamento do Sistema',
        pagina: 22,
        conteudo: `
7.1 PRESSÃO MÍNIMA
A pressão dinâmica mínima no hidrante mais desfavorável deve ser de 10 mca.

7.2 VAZÃO MÍNIMA
Vazão mínima de 125 L/min (cento e vinte e cinco litros por minuto).

7.3 RESERVA TÉCNICA
Volume mínimo de reserva de incêndio conforme área e risco da edificação.

7.4 MANGUEIRAS
Mangueiras de 40mm de diâmetro com comprimento de 15 ou 30 metros.
        `
      },
      {
        numero: '8',
        titulo: 'Componentes do Sistema',
        pagina: 28,
        conteudo: `
8.1 BOMBA DE INCÊNDIO
Bomba centrífuga com motor elétrico e sistema de partida automática.

8.2 RESERVATÓRIO
Reservatório exclusivo para incêndio ou compartimento específico.

8.3 TUBULAÇÃO
Tubulação de ferro galvanizado ou aço carbono conforme normas técnicas.

8.4 ABRIGO DE HIDRANTE
Caixa metálica com pintura vermelha e identificação visível.
        `
      }
    ]
  },
  {
    id: 'IT-019',
    titulo: 'IT-019 - Sinalização de Emergência',
    capitulos: [
      {
        numero: '4',
        titulo: 'Características das Placas',
        pagina: 10,
        conteudo: `
4.1 MATERIAL
Placas em material fotoluminescente ou com iluminação artificial.

4.2 DIMENSÕES
Dimensões conforme distância de visualização e altura de instalação.

4.3 CORES PADRONIZADAS
Verde para indicação de rotas de fuga e equipamentos de segurança.
Vermelho para indicação de equipamentos de combate a incêndio.

4.4 SÍMBOLOS
Utilizar símbolos conforme normas ISO e ABNT vigentes.
        `
      },
      {
        numero: '5',
        titulo: 'Instalação e Posicionamento',
        pagina: 15,
        conteudo: `
5.1 ALTURA DE INSTALAÇÃO
Placas instaladas entre 1,80m e 2,50m do piso acabado.

5.2 VISIBILIDADE
Garantir visibilidade em todas as condições de iluminação.

5.3 ROTAS DE FUGA
Sinalizar todas as mudanças de direção e saídas.

5.4 EQUIPAMENTOS
Sinalizar todos os equipamentos de segurança e combate a incêndio.
        `
      }
    ]
  },
  {
    id: 'IT-017',
    titulo: 'IT-017 - Brigada de Incêndio',
    capitulos: [
      {
        numero: '3',
        titulo: 'Composição da Brigada',
        pagina: 8,
        conteudo: `
3.1 DIMENSIONAMENTO
O número de brigadistas deve ser proporcional à população da edificação.

3.2 LÍDER DA BRIGADA
Designação de líder com conhecimento e autoridade para coordenar ações.

3.3 SETORIZAÇÃO
Distribuição dos brigadistas por pavimentos e setores da edificação.

3.4 TURNOS DE TRABALHO
Cobertura de todos os turnos de funcionamento da edificação.
        `
      },
      {
        numero: '4',
        titulo: 'Treinamentos e Capacitação',
        pagina: 12,
        conteudo: `
4.1 TREINAMENTO INICIAL
Curso básico de 16 horas com teoria e prática.

4.2 RECICLAGEM
Treinamento de reciclagem anual de 8 horas.

4.3 SIMULADOS
Realização de simulados semestrais com toda a população.

4.4 CERTIFICAÇÃO
Emissão de certificado de conclusão para todos os brigadistas.
        `
      }
    ]
  },
  {
    id: 'IT-015',
    titulo: 'IT-015 - Controle de Fumaça',
    capitulos: [
      {
        numero: '5',
        titulo: 'Sistemas de Controle',
        pagina: 18,
        conteudo: `
5.1 PRESSURIZAÇÃO DE ESCADAS
Sistema de insuflamento de ar para manter escadas livres de fumaça.

5.2 EXAUSTÃO DE FUMAÇA
Sistema de exaustão mecânica para remoção de fumaça e gases.

5.3 BARREIRAS DE FUMAÇA
Vedações para impedir a propagação de fumaça entre ambientes.

5.4 CONTROLES AUTOMÁTICOS
Sistema de acionamento automático integrado ao sistema de detecção.
        `
      },
      {
        numero: '6',
        titulo: 'Dimensionamento',
        pagina: 25,
        conteudo: `
6.1 VAZÃO DE AR
Cálculo da vazão necessária conforme volume e características do ambiente.

6.2 PRESSÃO DIFERENCIAL
Manter pressão positiva nas rotas de fuga em relação às áreas sinistradas.

6.3 VELOCIDADE DO AR
Controlar velocidade para evitar desconforto e garantir eficiência.

6.4 REDUNDÂNCIA
Prever sistemas redundantes para garantir funcionamento em emergências.
        `
      }
    ]
  }
];

// Exportar também uma versão simplificada para compatibilidade
export const MOCK_INSTRUCTIONS_SIMPLE = MOCK_IT_CONTENT.map(it => ({
  id: it.id,
  titulo: it.titulo,
  conteudo: it.capitulos.map(cap => cap.conteudo).join('\n\n'),
  capitulos: it.capitulos.length,
  tags: extractTagsFromContent(it.capitulos.map(cap => cap.conteudo).join(' '))
}));

function extractTagsFromContent(content: string): string[] {
  const keywords = content.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  return Object.entries(keywords)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);
}