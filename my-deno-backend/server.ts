import { serve } from "https://deno.land/std@0.203.0/http/server.ts";

const API_KEY = Deno.env.get("API_KEY");
const SECRET_KEY = "your-secret-key"; // Replace with your actual secret key

const handler = async (req: Request) => {
  const url = new URL(req.url);

  // Root route
  if (req.method === "GET" && url.pathname === "/") {
    return new Response("Welcome to the AI Backend!", {
      headers: { "Content-Type": "text/plain" },
    });
  }

  // API generate route
  if (req.method === "POST" && url.pathname === "/api/generate") {
    const clientKey = req.headers.get("Authorization");

    if (clientKey !== `Bearer ${SECRET_KEY}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    try {
      const body = await req.json();
      const prompt = body.prompt;

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

      return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // Catch all other routes
  return new Response("Not Found", { status: 404 });
};

console.log("Deno server running...");
serve(handler, { port: 8000 });
