// Teste simples para verificar se a implementação está funcionando
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3000/api';

async function testSearchAI() {
  console.log('🧪 Testando API de Busca Inteligente...\n');

  // Teste 1: GET endpoint (informações da API)
  try {
    console.log('📋 Teste 1: Informações da API');
    const response = await fetch(`${API_BASE}/search-ai`);
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ GET endpoint funcionando');
      console.log(`   Versão: ${result.data.version}`);
      console.log(`   Rate Limit: ${result.data.rateLimit.requests} req/${result.data.rateLimit.windowMs}ms\n`);
    } else {
      console.log('❌ Erro no GET endpoint:', result.error || 'Desconhecido\n');
    }
  } catch (error) {
    console.log('❌ Erro de conexão GET:', error.message + '\n');
  }

  // Teste 2: POST com dados válidos
  try {
    console.log('📋 Teste 2: Busca sobre saídas de emergência');
    
    const requestData = {
      prompt: 'Preciso saber sobre as especificações técnicas para saídas de emergência',
      searchTerm: 'saídas emergência largura mínima',
      options: {
        useCache: false,
        maxResults: 5
      }
    };

    const response = await fetch(`${API_BASE}/search-ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ POST endpoint funcionando');
      console.log(`   Resultados: ${result.data.results.length}`);
      console.log(`   Tempo: ${result.data.metadata.processingTime}ms`);
      console.log(`   Cache: ${result.data.metadata.cacheHit ? 'HIT' : 'MISS'}`);
      console.log(`   IA: ${result.data.aiAnalysis.substring(0, 80)}...`);
      
      if (result.data.results.length > 0) {
        const firstResult = result.data.results[0];
        console.log(`   Primeiro resultado: ${firstResult.titulo}`);
        console.log(`   Score: ${firstResult.relevanciaScore}`);
      }
      console.log('');
    } else {
      console.log('❌ Erro no POST endpoint:', result.error || 'Desconhecido');
      if (result.details) {
        console.log('   Detalhes:', result.details);
      }
      console.log('');
    }
  } catch (error) {
    console.log('❌ Erro de conexão POST:', error.message + '\n');
  }

  // Teste 3: POST com dados inválidos (teste de validação)
  try {
    console.log('📋 Teste 3: Dados inválidos (validação)');
    
    const invalidData = {
      prompt: '', // Prompt vazio (inválido)
      searchTerm: 'abc' // Muito curto
    };

    const response = await fetch(`${API_BASE}/search-ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(invalidData)
    });

    const result = await response.json();
    
    if (!response.ok && !result.success) {
      console.log('✅ Validação funcionando corretamente');
      console.log(`   Erro esperado: ${result.error}`);
      console.log('');
    } else {
      console.log('❌ Validação deveria ter falhado');
      console.log('');
    }
  } catch (error) {
    console.log('❌ Erro de conexão na validação:', error.message + '\n');
  }

  console.log('🎯 Testes concluídos!');
}

// Executar testes se chamado diretamente
if (require.main === module) {
  testSearchAI().catch(console.error);
}

module.exports = { testSearchAI };