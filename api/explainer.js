const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

const systemPrompt =
  "You are the SabiPass AI Explainer. You do not teach school subjects. Your only purpose is to explain how the SabiPass app works, its offline capabilities, and its benefits for Nigerian students taking WAEC, NECO, and JAMB. You MUST use the Socratic method: instead of just giving a direct answer, explain briefly and then ask the user a guiding question to help them realize the value of reasoning over rote memorization. Keep responses short, conversational, and tailored to Nigerian students, parents, or teachers.";

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ success: false, error: "Method not allowed" });
    return;
  }

  if (!GROQ_API_KEY) {
    console.log("[explainer] Missing GROQ_API_KEY");
    res.status(500).json({
      success: false,
      error: "The SabiPass AI Explainer is not configured yet."
    });
    return;
  }

  let body;

  try {
    body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  } catch (error) {
    res.status(400).json({ success: false, error: "Invalid request body." });
    return;
  }

  const message = String(body.message || "").trim();
  const history = Array.isArray(body.history) ? body.history : [];

  if (!message) {
    res.status(400).json({ success: false, error: "Please ask a question." });
    return;
  }

  const safeHistory = history
    .filter((item) => item && ["user", "assistant"].includes(item.role) && item.content)
    .slice(-6)
    .map((item) => ({
      role: item.role,
      content: String(item.content).slice(0, 900)
    }));

  try {
    console.log("[explainer] Sending Groq request", { model: GROQ_MODEL });
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.45,
        max_tokens: 180,
        messages: [
          { role: "system", content: systemPrompt },
          ...safeHistory,
          { role: "user", content: message }
        ]
      })
    });

    const data = await groqResponse.json().catch(() => ({}));

    if (!groqResponse.ok) {
      console.error("[explainer] Groq request failed", groqResponse.status, data);
      res.status(502).json({
        success: false,
        error: "The SabiPass AI Explainer could not respond yet."
      });
      return;
    }

    const reply = data?.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      throw new Error("Groq returned an empty response.");
    }

    console.log("[explainer] Groq response received");
    res.status(200).json({ success: true, reply });
  } catch (error) {
    console.error("[explainer] Unexpected error", error);
    res.status(500).json({
      success: false,
      error: "Unexpected explainer error. Please try again."
    });
  }
};
