import fetch from "node-fetch";

const ENDPOINTS = {
  chat: "https://api.openai.com/v1/chat/completions",
  completion: "https://api.openai.com/v1/completions",
  image: "https://api.openai.com/v1/images/generations"
};

const DEFAULT_MAX_TOKENS = 500;
const DEFAULT_IMAGE_SIZE = "512x512";

function buildRequestBody(type, model, prompt) {
  switch (type) {
    case "chat":
      return {
        model,
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: prompt }
        ],
        max_tokens: DEFAULT_MAX_TOKENS
      };
    case "completion":
      return { model, prompt, max_tokens: DEFAULT_MAX_TOKENS };
    case "image":
      return { model, prompt, n: 1, size: DEFAULT_IMAGE_SIZE };
    default:
      return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { model, prompt, type } = req.body;
  if (!model || !prompt)
    return res.status(400).json({ error: "Missing model or prompt" });

  if (!ENDPOINTS[type])
    return res.status(400).json({ error: "Unsupported type" });

  if (!process.env.OPENAI_API_KEY)
    return res.status(500).json({ error: "Missing OpenAI API key" });

  const body = buildRequestBody(type, model, prompt);
  if (!body)
    return res.status(400).json({ error: "Invalid request body for type" });

  try {
    const response = await fetch(ENDPOINTS[type], {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: errorData.error || "OpenAI API error" });
    }

    const data = await response.json();
    res.status(200).json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
