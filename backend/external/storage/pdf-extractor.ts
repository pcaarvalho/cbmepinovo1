// Configurar PDF.js apenas no lado cliente

export interface ExtractedContent {
  text: string;
  sections: {
    title: string;
    content: string;
    pageStart: number;
    pageEnd: number;
  }[];
  metadata: {
    pages: number;
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
    producer?: string;
    creationDate?: Date;
    modificationDate?: Date;
  };
  textByPage: string[];
  annotations: {
    page: number;
    type: string;
    content: string;
    position: { x: number; y: number; width: number; height: number };
  }[];
}

// Padrões para identificar seções do memorial
const SECTION_PATTERNS = {
  identificacao: /(?:1\.|I\.)\s*(?:IDENTIFICA[ÇC][AÃ]O|DADOS\s+GERAIS|INFORMA[ÇC][ÕO]ES\s+GERAIS)/i,
  caracteristicas: /(?:2\.|II\.)\s*(?:CARACTER[ÍI]STICAS|DESCRI[ÇC][AÃ]O\s+DA\s+EDIFICA[ÇC][AÃ]O)/i,
  sistemas: /(?:3\.|III\.)\s*(?:SISTEMAS?\s+DE\s+SEGURAN[ÇC]A|SISTEMAS?\s+PREVENTIVOS?)/i,
  saidas: /(?:sa[íi]da|exit)(?:s)?\s+(?:de\s+)?emerg[êe]ncia/i,
  iluminacao: /ilumina[çc][aã]o\s+(?:de\s+)?emerg[êe]ncia/i,
  extintores: /(?:extintor(?:es)?|sistema\s+de\s+extintores)/i,
  hidrantes: /(?:hidrante(?:s)?|sistema\s+de\s+hidrantes)/i,
  sprinklers: /(?:sprinkler(?:s)?|chuveiro(?:s)?\s+autom[aá]tico(?:s)?)/i,
  alarme: /(?:alarme|detec[çc][aã]o)/i,
  materiais: /(?:material(?:is)?|revestimento(?:s)?|acabamento(?:s)?)/i,
  observacoes: /(?:observa[çc][õo]es|considera[çc][õo]es|notas?)/i
};

/**
 * Extrai texto e metadados de um arquivo PDF
 */
export async function extractPDFContent(file: File): Promise<ExtractedContent> {
  // Se estamos no servidor (Next.js API), retornar dados simulados realistas
  if (typeof window === 'undefined') {
    console.log('🔄 Executando no servidor - usando extração simulada para desenvolvimento');
    
    return {
      text: `
MEMORIAL DESCRITIVO DE PROJETO DE PREVENÇÃO CONTRA INCÊNDIO

ARQUIVO: ${file.name}
TAMANHO: ${(file.size / 1024 / 1024).toFixed(2)} MB

1. IDENTIFICAÇÃO DO PROJETO
Responsável Técnico: Eng. João Silva - CREA 123456-PI
Proprietário: Empresa XYZ Ltda
Endereço: Rua das Flores, 123 - Centro - Teresina/PI

2. CARACTERÍSTICAS DA EDIFICAÇÃO
Área total construída: 850,00 m²
Altura da edificação: 12,50 metros
Ocupação: A-1 (Residencial unifamiliar)
Número de pavimentos: 3
População máxima: 50 pessoas

3. SISTEMAS DE SEGURANÇA CONTRA INCÊNDIO

3.1 SAÍDAS DE EMERGÊNCIA
- 2 escadas de emergência com largura de 1,20m cada
- Porta corta-fogo com largura de 0,90m
- Distância máxima a percorrer: 30 metros
- Sinalização de emergência conforme IT-20

3.2 ILUMINAÇÃO DE EMERGÊNCIA
- Sistema com autonomia de 3 horas
- Luminárias de LED distribuídas conforme IT-18
- Blocos autônomos com baterias seladas
- Nível de iluminamento: 5 lux

3.3 SISTEMA DE EXTINTORES
- 8 extintores de pó químico seco ABC 6kg
- 4 extintores de água pressurizada 10L
- Distribuição conforme IT-21
- Distância máxima: 20 metros

3.4 SISTEMA DE HIDRANTES
- 3 hidrantes internos tipo 1
- Reserva técnica de incêndio: 15.000 litros
- Bomba de incêndio 150CV
- Pressão na ponta da mangueira: 40 mca

3.5 SISTEMA DE DETECÇÃO E ALARME
- Central de detecção endereçável
- Detectores de fumaça ópticos
- Acionadores manuais
- Sirenes estroboscópicas

4. MATERIAIS DE ACABAMENTO
- Classe A (incombustíveis) nas rotas de fuga
- Classe B nas demais áreas
- Revestimentos cerâmicos e gesso acartonado

5. OBSERVAÇÕES FINAIS
Projeto elaborado conforme as Instruções Técnicas vigentes do CB-PI.
Memorial técnico aprovado em reunião de 15/06/2024.
Todas as instalações seguem normas ABNT aplicáveis.
      `,
      sections: [
        {
          title: 'Identificação',
          content: 'Responsável Técnico: Eng. João Silva - CREA 123456-PI',
          pageStart: 1,
          pageEnd: 1
        },
        {
          title: 'Características',
          content: 'Área total construída: 850,00 m² Altura da edificação: 12,50 metros',
          pageStart: 1,
          pageEnd: 1
        },
        {
          title: 'Saidas',
          content: '2 escadas de emergência com largura de 1,20m cada',
          pageStart: 2,
          pageEnd: 2
        },
        {
          title: 'Iluminacao',
          content: 'Sistema com autonomia de 3 horas',
          pageStart: 2,
          pageEnd: 2
        },
        {
          title: 'Extintores',
          content: '8 extintores de pó químico seco ABC 6kg',
          pageStart: 3,
          pageEnd: 3
        }
      ],
      metadata: {
        pages: 3,
        title: file.name,
        author: 'Sistema CB-PI'
      },
      textByPage: [
        'Página 1: Identificação e características do projeto',
        'Página 2: Sistemas de segurança - saídas e iluminação',
        'Página 3: Extintores, hidrantes e observações finais'
      ],
      annotations: []
    };
  }

  try {
    // Importar PDF.js dinamicamente apenas no cliente
    const pdfjsLib = await import('pdfjs-dist');
    
    // Configurar worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    const metadata = await pdf.getMetadata();
    const textByPage: string[] = [];
    const annotations: ExtractedContent['annotations'] = [];
    let fullText = '';
    
    // Extrair texto de cada página
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Reconstruir texto da página
      let pageText = '';
      const textItems = textContent.items as { str: string; transform: number[] }[];
      
      for (let i = 0; i < textItems.length; i++) {
        const item = textItems[i];
        if ('str' in item) {
          // Adicionar espaços e quebras de linha baseado na posição
          if (i > 0) {
            const prevItem = textItems[i - 1];
            if ('transform' in prevItem && 'transform' in item) {
              const yDiff = Math.abs(item.transform[5] - prevItem.transform[5]);
              const xDiff = item.transform[4] - prevItem.transform[4];
              
              if (yDiff > 5) {
                pageText += '\n';
              } else if (xDiff > 10) {
                pageText += ' ';
              }
            }
          }
          pageText += item.str;
        }
      }
      
      textByPage.push(pageText);
      fullText += pageText + '\n\n';
      
      // Extrair anotações da página
      try {
        const pageAnnotations = await page.getAnnotations();
        for (const annotation of pageAnnotations) {
          if (annotation.contents || annotation.title) {
            annotations.push({
              page: pageNum,
              type: annotation.subtype || 'unknown',
              content: annotation.contents || annotation.title || '',
              position: {
                x: annotation.rect[0],
                y: annotation.rect[1],
                width: annotation.rect[2] - annotation.rect[0],
                height: annotation.rect[3] - annotation.rect[1]
              }
            });
          }
        }
      } catch (error) {
        console.warn(`Erro ao extrair anotações da página ${pageNum}:`, error);
      }
    }
    
    // Identificar seções automaticamente
    const sections = identifyDocumentSections(fullText, textByPage);
    
    // Preparar metadados
    const metadataInfo = metadata.info as {
      Title?: string;
      Author?: string;
      Subject?: string;
      Creator?: string;
      Producer?: string;
      CreationDate?: string;
      ModDate?: string;
    } | null;
    
    const extractedMetadata: ExtractedContent['metadata'] = {
      pages: pdf.numPages,
      title: metadataInfo?.Title || file.name,
      author: metadataInfo?.Author,
      subject: metadataInfo?.Subject,
      creator: metadataInfo?.Creator,
      producer: metadataInfo?.Producer,
      creationDate: metadataInfo?.CreationDate ? new Date(metadataInfo.CreationDate) : undefined,
      modificationDate: metadataInfo?.ModDate ? new Date(metadataInfo.ModDate) : undefined
    };
    
    return {
      text: fullText,
      sections,
      metadata: extractedMetadata,
      textByPage,
      annotations
    };
    
  } catch (error) {
    console.error('Erro ao extrair conteúdo do PDF:', error);
    throw new Error(`Falha na extração do PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

/**
 * Identifica seções do documento automaticamente
 */
function identifyDocumentSections(fullText: string, textByPage: string[]): ExtractedContent['sections'] {
  const sections: ExtractedContent['sections'] = [];
  
  for (const [sectionKey, pattern] of Object.entries(SECTION_PATTERNS)) {
    const matches = Array.from(fullText.matchAll(new RegExp(pattern.source, 'gi')));
    
    for (const match of matches) {
      if (match.index !== undefined) {
        // Encontrar em qual página está a seção
        let currentPos = 0;
        let pageStart = 1;
        
        for (let i = 0; i < textByPage.length; i++) {
          if (currentPos + textByPage[i].length >= match.index) {
            pageStart = i + 1;
            break;
          }
          currentPos += textByPage[i].length + 2; // +2 para as quebras de linha
        }
        
        // Extrair conteúdo da seção (próximos 500 caracteres como exemplo)
        const sectionStart = match.index;
        const sectionEnd = Math.min(sectionStart + 500, fullText.length);
        const content = fullText.substring(sectionStart, sectionEnd).trim();
        
        // Estimar página final baseada no conteúdo
        let pageEnd = pageStart;
        let contentPos = currentPos;
        for (let i = pageStart - 1; i < textByPage.length; i++) {
          if (contentPos >= sectionEnd) break;
          contentPos += textByPage[i].length + 2;
          pageEnd = i + 1;
        }
        
        sections.push({
          title: sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1),
          content: content,
          pageStart,
          pageEnd
        });
      }
    }
  }
  
  // Se não encontrou seções, criar uma seção geral
  if (sections.length === 0) {
    sections.push({
      title: 'Memorial Completo',
      content: fullText.substring(0, Math.min(1000, fullText.length)),
      pageStart: 1,
      pageEnd: textByPage.length
    });
  }
  
  return sections.sort((a, b) => a.pageStart - b.pageStart);
}

/**
 * Extrai texto de arquivo DOCX
 */
export async function extractDOCXContent(file: File): Promise<ExtractedContent> {
  // Para DOCX, retornamos conteúdo mockado por enquanto
  // Em produção, usaria uma biblioteca como mammoth.js
  
  const mockContent: ExtractedContent = {
    text: `
    MEMORIAL DESCRITIVO - ${file.name}
    
    Este documento foi processado a partir de um arquivo DOCX.
    O conteúdo completo seria extraído em uma implementação de produção.
    
    [CONTEÚDO SIMULADO PARA DEMONSTRAÇÃO]
    
    1. IDENTIFICAÇÃO
    Responsável Técnico: [A ser extraído do DOCX]
    
    2. CARACTERÍSTICAS DA EDIFICAÇÃO
    Área construída: [A ser extraído do DOCX]
    
    3. SISTEMAS DE SEGURANÇA
    [Sistemas seriam extraídos do documento original]
    `,
    sections: [
      {
        title: 'Documento DOCX',
        content: 'Conteúdo extraído de arquivo DOCX',
        pageStart: 1,
        pageEnd: 1
      }
    ],
    metadata: {
      pages: 1,
      title: file.name
    },
    textByPage: ['Conteúdo do arquivo DOCX'],
    annotations: []
  };
  
  return mockContent;
}

/**
 * Função principal que decide qual extrator usar baseado no tipo de arquivo
 */
export async function extractDocumentContent(file: File): Promise<ExtractedContent> {
  const fileType = file.type.toLowerCase();
  
  if (fileType === 'application/pdf') {
    return extractPDFContent(file);
  } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return extractDOCXContent(file);
  } else if (fileType === 'application/msword') {
    return extractDOCXContent(file); // Tratar DOC como DOCX por simplicidade
  } else {
    throw new Error(`Tipo de arquivo não suportado: ${fileType}`);
  }
}