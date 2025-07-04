# Exemplos de Teste do Chat Inteligente

## 1. CÁLCULO - Pergunta Simples
**Pergunta:** "quantos extintores para loja 450m²?"

**Resposta Esperada:**
```
📌 Para loja de 450m², você precisa de 3 extintores.

📋 Cálculo conforme IT-21:
- Risco médio comercial: 1 extintor/150m²
- 450m² ÷ 150m² = 3 extintores
- Tipo recomendado: ABC 6kg
- Distância máxima: 20 metros

💡 Dica: Posicione 1 próximo à entrada, 1 no centro e 1 nos fundos.

🔗 Veja também: IT-20 (Sinalização)
```

## 2. DEFINIÇÃO - Pergunta Básica
**Pergunta:** "o que é extintor ABC?"

**Resposta Esperada:**
```
Extintor ABC é um equipamento que combate incêndios classes A (sólidos), B (líquidos) e C (elétricos). É o tipo mais versátil e recomendado pela IT-21 para a maioria dos estabelecimentos.
```

## 3. PERGUNTA COMPLEXA - Vários Requisitos
**Pergunta:** "vou abrir um restaurante, o que preciso?"

**Resposta Esperada:**
```
📌 Para restaurante, você precisará cumprir várias ITs obrigatórias.

📋 Checklist principal:
- IT-21: Extintores (quantidade depende da área)
- IT-11: Saídas de emergência (mín. 2)
- IT-20: Sinalização de segurança
- IT-24: Cozinha industrial (sistemas especiais)
- IT-17: Brigada de incêndio (se >750m²)

💡 Próximo passo: Me informe a área total para calcular os equipamentos.

Quer que eu detalhe alguma IT específica?
```

## 4. VALIDAÇÃO - Conformidade
**Pergunta:** "1 extintor é suficiente para 500m²?"

**Resposta Esperada:**
```
⚠️ NÃO! Para 500m² você precisa de NO MÍNIMO 3 extintores.

❌ Seu cálculo: 1 extintor
✅ Correto IT-21: 3-4 extintores

Risco de multa e interdição com apenas 1 extintor!
```

## 5. RESPOSTAS CONTEXTUAIS PROGRESSIVAS

### Primeira pergunta:
**Pergunta:** "Quantos extintores preciso?"
**Resposta:** "Para calcular, preciso saber: qual o tipo e área da edificação?"

### Segunda pergunta:
**Pergunta:** "É uma loja de 300m²"
**Resposta:** "Para loja de 300m² você precisa de 2 extintores ABC 6kg. Quer saber sobre outras ITs obrigatórias para comércio?"

### Terceira pergunta:
**Pergunta:** "Sim, o que mais?"
**Resposta:** 
```
Além dos 2 extintores, sua loja de 300m² precisa de:
• Saídas de emergência (IT-11)
• Iluminação de emergência (IT-18)
• Sinalização (IT-20)
• Brigada (IT-17) se tiver mais de 750m²
```

## Como Testar

1. Acesse `/chat-especialista`
2. Digite cada pergunta exatamente como mostrada
3. Verifique se:
   - A intenção foi detectada corretamente
   - O contexto foi atualizado (área, tipo de edificação)
   - A formatação está correta (emojis, estrutura)
   - As sugestões são relevantes
   - As ITs são citadas corretamente

## Verificação de Funcionalidades

- [ ] Detecção de intenção funciona para todos os tipos
- [ ] Contexto é mantido entre mensagens
- [ ] Cálculos são realizados corretamente
- [ ] Formatação com emojis é aplicada
- [ ] Sugestões contextuais aparecem
- [ ] ITs são extraídas e mostradas
- [ ] Respostas progressivas funcionam
- [ ] Sistema lembra informações anteriores