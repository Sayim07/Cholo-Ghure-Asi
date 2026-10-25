/**
 * api/chat.js
 * Vercel Serverless Function for Cholo AI Concierge.
 * Keeps GROQ_API_KEY and NVIDIA_API_KEY 100% secure on the server side.
 * Zero keys are exposed to the client browser or committed to GitHub.
 */

export default async function handler(req, res) {
  // CORS & method verification
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const { messages, provider = "groq" } = req.body || {};

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Invalid messages payload." });
    }

    const groqKey = process.env.GROQ_API_KEY;
    const nvidiaKey = process.env.NVIDIA_API_KEY;

    // 1. Try Groq if configured
    if ((provider === "groq" || !nvidiaKey) && groqKey) {
      const groqModels = ["openai/gpt-oss-120b", "qwen/qwen3.8-27b", "openai/gpt-oss-20b"];
      for (const model of groqModels) {
        try {
          const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${groqKey}`
            },
            body: JSON.stringify({
              model,
              messages,
              temperature: 0.5,
              max_tokens: 2200
            })
          });

          if (response.ok) {
            const data = await response.json();
            const reply = data.choices?.[0]?.message?.content;
            if (reply) {
              return res.status(200).json({ success: true, provider: "groq", model, reply });
            }
          }
        } catch (err) {
          console.warn(`[api/chat] Groq error on ${model}:`, err.message);
        }
      }
    }

    // 2. Try NVIDIA NIM if configured
    if (nvidiaKey) {
      const nvidiaModels = [
        "meta/llama-3.2-11b-vision-instruct",
        "mistralai/mistral-large-2-instruct",
        "nvidia/llama-3.1-nemotron-70b-instruct"
      ];
      for (const model of nvidiaModels) {
        try {
          const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${nvidiaKey}`
            },
            body: JSON.stringify({
              model,
              messages,
              temperature: 0.5,
              max_tokens: 2200
            })
          });

          if (response.ok) {
            const data = await response.json();
            const reply = data.choices?.[0]?.message?.content;
            if (reply) {
              return res.status(200).json({ success: true, provider: "nvidia", model, reply });
            }
          }
        } catch (err) {
          console.warn(`[api/chat] NVIDIA error on ${model}:`, err.message);
        }
      }
    }

    // If no keys configured on server
    return res.status(503).json({
      error: "No server-side AI API keys configured. Set GROQ_API_KEY in Vercel Project Settings."
    });

  } catch (error) {
    console.error("[api/chat] Internal Server Error:", error);
    return res.status(500).json({ error: "Internal server error while processing chat query." });
  }
}
