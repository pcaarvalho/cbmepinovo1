// Script de teste para o chat AI
const testChat = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/chat-ai-inteligente', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: 'Quantos extintores preciso para uma loja de 450m²?'
          }
        ]
      })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Erro:', error);
  }
};

testChat();