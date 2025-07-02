// Script de teste para a API de busca inteligente
const API_URL = 'http://localhost:3000/api/search-ai';

const testCases = [
  {
    name: 'Teste básico - saídas de emergência',
    payload: {
      prompt: 'Preciso saber sobre as especificações técnicas para saídas de emergência em edificações comerciais',
      searchTerm: 'saídas emergência largura mínima',
      options: {
        useCache: true,
        maxResults: 5,
        includeContext: true
      }
    }
  },
  {
    name: 'Teste com filtros - iluminação',
    payload: {
      prompt: 'Quais são os requisitos para iluminação de emergência em escadas?',
      searchTerm: 'iluminação emergência autonomia',
      filters: {
        categoria: 'emergencia',
        severidade: 'HIGH'
      },
      options: {
        useCache: false,
        maxResults: 10
      }
    }
  },
  {
    name: 'Teste extintores',
    payload: {
      prompt: 'Como dimensionar sistema de extintores para uma loja de departamentos?',
      searchTerm: 'extintores distância classes fogo',
      filters: {
        tipo: 'tecnico'
      }
    }
  }
];

async function testAPI() {
  console.log('🧪 Iniciando testes da API de Busca Inteligente...\n');

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`📋 Teste ${i + 1}: ${testCase.name}`);
    
    try {
      const startTime = Date.now();
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testCase.payload)
      });

      const responseTime = Date.now() - startTime;
      const result = await response.json();

      if (response.ok && result.success) {
        console.log(`✅ Sucesso (${responseTime}ms)`);
        console.log(`   📊 Resultados: ${result.data.results.length}`);
        console.log(`   🤖 IA: ${result.data.aiAnalysis.substring(0, 100)}...`);
        console.log(`   💾 Cache: ${result.data.metadata.cacheHit ? 'HIT' : 'MISS'}`);
        console.log(`   🔤 Tokens: ${result.data.metadata.tokenUsage.total}`);
      } else {
        console.log(`❌ Falha: ${result.error || 'Erro desconhecido'}`);
      }
      
    } catch (error) {
      console.log(`❌ Erro de conexão: ${error.message}`);
    }
    
    console.log(''); // Linha em branco
  }

  // Teste do endpoint GET (informações da API)
  console.log('📋 Teste GET - Informações da API');
  try {
    const response = await fetch(API_URL, { method: 'GET' });
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Endpoint de informações funcionando');
      console.log(`   📄 Versão: ${result.data.version}`);
      console.log(`   ⏱️  Rate Limit: ${result.data.rateLimit.requests} req/${result.data.rateLimit.windowMs}ms`);
    } else {
      console.log('❌ Erro no endpoint de informações');
    }
  } catch (error) {
    console.log(`❌ Erro de conexão no GET: ${error.message}`);
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  testAPI().catch(console.error);
}

module.exports = { testAPI };