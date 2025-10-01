const express = require("express");
const fetch = require("node-fetch");
const app = express();

app.use(express.json());

const API_KEY = process.env.API_KEY;

app.post("/api/generate", async (req, res) => {
  const prompt = req.body.prompt;
  try {
    const response = await fetch("https://api.openai.com/v1/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-davinci-003",
        prompt: prompt,
        max_tokens: 100,
      }),
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running!");
});
