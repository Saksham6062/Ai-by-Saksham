const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Text models
const textModels = ["gemma-open-weight","gemma-3n","gemma-3","gemma-2","codegemma"];
// Image models
const imageModels = ["imagen-4","imagen-gen","imagen-fast","imagen-edit","imagen-caption","nano-banana"];

// Proxy endpoint
app.post('/api/generate', async (req, res) => {
  const { model, prompt } = req.body;
  const apiKey = process.env.GOOGLE_API_KEY;

  if(!model || !prompt) return res.status(400).json({ error: "Missing model or prompt" });

  let apiUrl = "";
  let payload = {};

  try {
    if(textModels.includes(model)){
      apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      payload = { contents: [{ parts: [{ text: prompt }] }] };
    } else if(imageModels.includes(model)){
      apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${apiKey}`;
      payload = { instances: [{ prompt }], parameters: { sampleCount: 1 } };
    } else {
      return res.status(400).json({ error: "Model not supported via backend proxy" });
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    res.json(data);

  } catch(err){
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Backend running at http://localhost:${PORT}`));
