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

const app = express();
app.use(cors());
app.use(express.json({ limit: '25mb' }));

// mount the router you already have
const genThreeRouter = require('./routes/genThree');
app.use('/api/gen-three', genThreeRouter);

// Gemini endpoints
if (GeminiClient) {
  const geminiClient = new GeminiClient();

  // Extract step from image
  app.post('/api/extract-step', async (req, res) => {
    try {
      const result = await geminiClient.extractStep(req.body);
      res.json(result);
    } catch (error) {
      console.error('Extract step error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Generate Three.js code
  app.post('/api/generate-code', async (req, res) => {
    try {
      const result = await geminiClient.generateThreeCode(req.body);
      res.json(result);
    } catch (error) {
      console.error('Generate code error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Answer questions
  app.post('/api/answer-question', async (req, res) => {
    try {
      const result = await geminiClient.answerQuestion(req.body);
      res.json(result);
    } catch (error) {
      console.error('Answer question error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Generate embeddings
  app.post('/api/embed', async (req, res) => {
    try {
      const result = await geminiClient.embed(req.body);
      res.json(result);
    } catch (error) {
      console.error('Embed error:', error);
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

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server running on :${PORT}`);
  if (GeminiClient) {
    console.log('Gemini endpoints available:');
    console.log('- POST /api/extract-step');
    console.log('- POST /api/generate-code');
    console.log('- POST /api/answer-question');
    console.log('- POST /api/embed');
  } else {
    console.log('Run `npx tsc` to enable Gemini endpoints');
  }
});
