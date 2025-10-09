import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { model, prompt, type } = req.body;
  if (!model || !prompt) return res.status(400).json({ error: "Missing model or prompt" });

  try {
    let endpoint = "";
    let body = {};

    if (type === "chat") {
      endpoint = "https://api.openai.com/v1/chat/completions";
      body = {
        model,
        messages: [{ role: "system", content: "You are a helpful assistant." }, { role: "user", content: prompt }],
        max_tokens: 500
      };
    } else if (type === "completion") {
      endpoint = "https://api.openai.com/v1/completions";
      body = { model, prompt, max_tokens: 500 };
    } else if (type === "image") {
      endpoint = "https://api.openai.com/v1/images/generations";
      body = { model, prompt, n: 1, size: "512x512" };
    } else {
      return res.status(400).json({ error: "Unsupported type" });
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    res.status(200).json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
