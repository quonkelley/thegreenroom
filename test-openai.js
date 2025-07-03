// Simple test script to verify OpenAI integration
const fetch = require('node-fetch');

async function testOpenAIIntegration() {
  console.log('🧪 Testing OpenAI Integration...\n');

  try {
    const response = await fetch('http://localhost:3000/api/generate-pitch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        artist_id: 'a0fa0f33-c981-45e6-8061-d8b18be402eb', // Use the existing artist ID
        venue_info: {
          name: 'The Blue Note',
          city: 'New York, NY'
        }
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Success! OpenAI Integration Working');
      console.log('\n📧 Generated Pitch:');
      console.log('Subject:', data.pitch.subject);
      console.log('\nBody:');
      console.log(data.pitch.body);
    } else {
      console.log('❌ Error:', data.error);
      
      if (data.error.includes('OpenAI') || data.error.includes('API')) {
        console.log('\n💡 This might be because:');
        console.log('1. OPENAI_API_KEY is not set in .env.local');
        console.log('2. OpenAI API key is invalid');
        console.log('3. OpenAI API is down');
        console.log('\n🔄 The system should fallback to template generation');
      }
    }
  } catch (error) {
    console.log('❌ Network Error:', error.message);
    console.log('💡 Make sure the dev server is running: npm run dev');
  }
}

testOpenAIIntegration(); 