// backend/index.js
// created to test if backend works fine
// !! run from the backend folder !!
// run with `node index.js` or `npm start` or `npm run dev` after setting up .env file

require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import the compiled GeminiClient (will need to compile TypeScript first)
let GeminiClient;
try {
  const { GeminiClient: Client } = require('./dist/gemini/client.js');
  GeminiClient = Client;
} catch (error) {
  console.warn('GeminiClient not found. Run `npx tsc` to compile TypeScript files first.');
  console.warn('Error:', error.message);
}

const app = express()
app.use(cors())
app.use(express.json({ limit: '25mb' }))

// Request/Response logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString()
  const requestId = Math.random().toString(36).substring(2, 15)
  
  // Log incoming request
  console.log('\n' + '='.repeat(80))
  console.log(`🔵 [${timestamp}] INCOMING REQUEST [${requestId}]`)
  console.log(`Method: ${req.method}`)
  console.log(`URL: ${req.url}`)
  console.log(`Headers:`, JSON.stringify(req.headers, null, 2))
  
  // Log request body (truncate if too large)
  if (req.body) {
    const bodyStr = JSON.stringify(req.body, null, 2)
    if (bodyStr.length > 1000) {
      console.log(`Request Body (truncated):`, bodyStr.substring(0, 1000) + '... [TRUNCATED]')
    } else {
      console.log(`Request Body:`, bodyStr)
    }
  } else {
    console.log(`Request Body: [EMPTY]`)
  }
  
  // Store original res.json to intercept response
  const originalJson = res.json
  res.json = function(body) {
    console.log(`\n🟢 [${new Date().toISOString()}] OUTGOING RESPONSE [${requestId}]`)
    console.log(`Status: ${res.statusCode}`)
    console.log(`Response Headers:`, JSON.stringify(res.getHeaders(), null, 2))
    
    // Log response body (truncate if too large)
    const responseStr = JSON.stringify(body, null, 2)
    if (responseStr.length > 2000) {
      console.log(`Response Body (truncated):`, responseStr.substring(0, 2000) + '... [TRUNCATED]')
    } else {
      console.log(`Response Body:`, responseStr)
    }
    console.log('='.repeat(80) + '\n')
    
    return originalJson.call(this, body)
  }
  
  next()
})

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

// Gemini endpoints
if (GeminiClient) {
  const geminiClient = new GeminiClient();

  // Extract step from image
  app.post('/api/extract-step', async (req, res) => {
    try {
      console.log('\n🤖 [GEMINI AI] Starting extractStep...')
      const result = await geminiClient.extractStep(req.body);
      console.log('🤖 [GEMINI AI] Raw response from Gemini API:')
      console.log(result.rawText)
      console.log('🤖 [GEMINI AI] Parsed result:')
      console.log(JSON.stringify({ 
        instructions: result.instructions, 
        parts: result.parts, 
        tools: result.tools,
        sceneJson: result.sceneJson 
      }, null, 2))
      res.json(result);
    } catch (error) {
      console.error('❌ [GEMINI AI] Extract step error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Generate Three.js code
  app.post('/api/generate-code', async (req, res) => {
    try {
      console.log('\n🤖 [GEMINI AI] Starting generateThreeCode...')
      const result = await geminiClient.generateThreeCode(req.body);
      console.log('🤖 [GEMINI AI] Raw response from Gemini API:')
      console.log(result.rawText)
      console.log('🤖 [GEMINI AI] Generated code length:', result.threeCode.length, 'characters')
      console.log('🤖 [GEMINI AI] Code preview (first 200 chars):')
      console.log(result.threeCode.substring(0, 200) + '...')
      res.json(result);
    } catch (error) {
      console.error('❌ [GEMINI AI] Generate code error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Answer questions
  app.post('/api/answer-question', async (req, res) => {
    try {
      console.log('\n🤖 [GEMINI AI] Starting answerQuestion...')
      const result = await geminiClient.answerQuestion(req.body);
      console.log('🤖 [GEMINI AI] Raw response from Gemini API:')
      console.log(result.rawText)
      console.log('🤖 [GEMINI AI] Final answer:', result.answer)
      res.json(result);
    } catch (error) {
      console.error('❌ [GEMINI AI] Answer question error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Generate embeddings
  app.post('/api/embed', async (req, res) => {
    try {
      console.log('\n🤖 [GEMINI AI] Starting embed...')
      console.log('🤖 [GEMINI AI] Embedding', req.body.texts?.length || 0, 'text(s)')
      const result = await geminiClient.embed(req.body);
      console.log('🤖 [GEMINI AI] Generated', result.vectors.length, 'vectors')
      console.log('🤖 [GEMINI AI] Vector dimensions:', result.vectors[0]?.length || 0)
      res.json(result);
    } catch (error) {
      console.error('❌ [GEMINI AI] Embed error:', error);
      res.status(500).json({ error: error.message });
    }
  });
} else {
  // Fallback endpoints when TypeScript isn't compiled
  const endpoints = ['/api/extract-step', '/api/generate-code', '/api/answer-question', '/api/embed'];
  endpoints.forEach(endpoint => {
    app.post(endpoint, (_req, res) => {
      res.status(503).json({ error: 'Service unavailable. Please compile TypeScript first with: npx tsc' });
    });
  });
}

const port = process.env.PORT || 5050
app.listen(port, () => {
  console.log(`Server running on :${port}`)
  if (GeminiClient) {
    console.log('Gemini endpoints available:')
    console.log('- POST /api/extract-step')
    console.log('- POST /api/generate-code') 
    console.log('- POST /api/answer-question')
    console.log('- POST /api/embed')
  } else {
    console.log('Run `npx tsc` to enable Gemini endpoints')
  }
})
