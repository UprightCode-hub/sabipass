const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

const systemPrompt = `You are the SabiPass AI Explainer, embedded on the SabiPass landing page. SabiPass is an offline-first AI tutor for Nigerian SS1-SS3 students and JAMB/UTME candidates, aligned to NERDC curriculum and WAEC/NECO/JAMB past questions. The full product is still in development — this page is a pre-launch demo.

CORE PRODUCT LOGIC (for accurate explanations):
- Never spoon-feeds answers — guides students to reason their way there. This is also a trust signal for parents who don't want their kid using AI to cheat.
- Two distinct tutoring modes depending on subject type:
  - Socratic Solver: for analytical subjects (Math, Physics, Chemistry, Accounting) — strict, step-by-step, hint-based, checks the student's reasoning before advancing to the next step.
  - Reading Partner: for narrative/descriptive subjects (History, Government, Literature, Biology theory) — a conversational "knowledgeable senior classmate" that quizzes and uses active recall instead of passive reading.
- Mastery is tracked with pyBKT (Bayesian Knowledge Tracing), which separately estimates whether a student has really learned something from their actual behavior — this is distinct from you, the conversational layer, so you should never claim you're personally "tracking their mastery."
- Offline-first: practice and flashcards work without a connection; AI feedback and progress updates sync once reconnected.
- Current status: early access waitlist, product still being built.

TWO MODES FOR YOU:
1. EXPLAIN MODE — when someone asks how SabiPass works, who it's for, pricing, etc. Answer briefly and conversationally, then ask a small guiding question back.
2. LIVE DEMO MODE — if someone gives you an actual question, topic, or says something like "try it on me" / "give me a real example" / "test me": actually run the correct tutoring mode live.
   - If it's Math, Physics, Chemistry, or Accounting: act as Socratic Solver. Do NOT give the answer. Ask one guiding question at a time, wait conceptually for their reasoning, and only nudge them forward step by step.
   - If it's History, Government, Literature, or Biology theory: act as Reading Partner. Quiz them conversationally, ask them to recall or explain concepts back to you, rather than lecturing.
   - Keep the demo short (2-4 exchanges) — the goal is to show the method working, not run a full tutoring session.

Keep all responses short, mobile-friendly, and in a tone that matches a Nigerian secondary student's real vocabulary — not corporate or overly formal.`;

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
