import React, { useEffect, useState } from "react";
import { Bot, CloudOff, RotateCcw, Send, Sparkles } from "lucide-react";

const starterMessage = {
  role: "assistant",
  content:
    "Hey, I'm SP. Ask me a real WAEC, JAMB, or NECO question — I'll show you how I'd walk you through it."
};

const topics = [
  "WAEC Chemistry",
  "JAMB Physics",
  "NECO Maths"
];

const topicMessages = {
  "WAEC Chemistry": [
    { role: "assistant", content: "Let's use redox. What does oxidation mean in terms of electrons?" },
    { role: "user", content: "Losing electrons." },
    { role: "assistant", content: "Good. If Fe2+ becomes Fe3+, did iron lose or gain an electron?" }
  ],
  "JAMB Physics": [
    { role: "assistant", content: "Two perpendicular vectors are 3N and 4N. Should we add directly first?" },
    { role: "user", content: "No, they form a right-angle triangle." },
    { role: "assistant", content: "Exactly. Which theorem helps with the resultant?" }
  ],
  "NECO Maths": [
    { role: "assistant", content: "For x^2 - 5x + 6 = 0, what do we check before using the formula?" },
    { role: "user", content: "If it can factorise." },
    { role: "assistant", content: "Sharp. Which two numbers multiply to 6 and add to -5?" }
  ]
};

function SabiDemo() {
  const [topic, setTopic] = useState(topics[0]);
  const [messages, setMessages] = useState([starterMessage, ...topicMessages[topics[0]]]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("idle");
  const [offline, setOffline] = useState(false);
  const [mistakeStep, setMistakeStep] = useState("question");

  useEffect(() => {
    setMessages([starterMessage, ...topicMessages[topic]]);
    setMistakeStep("question");
  }, [topic]);

  const submitQuestion = async (event) => {
    event.preventDefault();
    const question = input.trim();
    if (!question || status === "loading") return;

    const nextMessages = [...messages, { role: "user", content: question }];
    setMessages(nextMessages);
    setInput("");
    setStatus("loading");

    try {
      const response = await fetch("/api/explainer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question, history: nextMessages.slice(-6) })
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.reply) {
        throw new Error(data.error || "SP is not available yet.");
      }

      setMessages((current) => [...current, { role: "assistant", content: data.reply }]);
      setStatus("idle");
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: error.message || "I could not reach SP right now. Try another question in a moment."
        }
      ]);
      setStatus("error");
    }
  };

  return (
    <section className="demo-section" id="demo">
      <div className="section-heading">
        <p className="eyebrow">
          <Sparkles size={15} aria-hidden="true" />
          See what happens when you get it wrong
        </p>
        <h2>What happens when a student makes a tempting mistake?</h2>
        <p>Try it below — ask SabiPass a real WAEC Chemistry, JAMB Physics, or NECO Maths question.</p>
      </div>

      <div className="demo-shell">
        <div className="demo-toolbar">
          <div>
            <span className="micro-label">{offline ? "Waiting to send" : "SabiPass is helping right now"}</span>
            <strong>{offline ? "Saved until data returns" : "Helping now"}</strong>
          </div>
          <button
            className={offline ? "quiet-button is-on" : "quiet-button"}
            type="button"
            aria-pressed={offline}
            onClick={() => setOffline((current) => !current)}
          >
            <CloudOff size={16} aria-hidden="true" />
            Try it with no data
          </button>
        </div>

        <div className="topic-row" aria-label="Choose a demo topic">
          {topics.map((item) => (
            <button
              type="button"
              className={topic === item ? "is-active" : ""}
              onClick={() => setTopic(item)}
              key={item}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="demo-grid">
          <div className="chat-card">
            <div className="chat-title">
              <Bot size={18} aria-hidden="true" />
              <span>SP live demo</span>
            </div>
            <div className="chat-log" aria-live="polite">
              {messages.map((message, index) => (
                <p className={`chat-bubble ${message.role}`} key={`${message.role}-${index}`}>
                  {message.content}
                </p>
              ))}
              {status === "loading" ? <p className="chat-bubble assistant">Thinking...</p> : null}
            </div>
            <form className="chat-form" onSubmit={submitQuestion}>
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Paste your exam question"
                aria-label="Ask SabiPass a real exam question"
              />
              <button type="submit" disabled={status === "loading"} aria-label="Send question">
                <Send size={17} aria-hidden="true" />
              </button>
            </form>
          </div>

          <aside className="mistake-card">
            <span className="micro-label">JAMB Physics - Vectors</span>
            {mistakeStep === "question" ? (
              <p>Question: Two perpendicular vectors are 3N and 4N. What should you do before choosing an option?</p>
            ) : null}
            {mistakeStep === "mistake" ? (
              <p>Student: "I will add 3 + 4, so the resultant is 7N."</p>
            ) : null}
            {mistakeStep === "hint" ? (
              <p>
                SabiPass: "That addition works only when they point the same way. Since they are
                perpendicular, what triangle do the two vectors form?"
              </p>
            ) : null}
            <div className="demo-actions">
              <button type="button" onClick={() => setMistakeStep("question")}>
                <RotateCcw size={15} aria-hidden="true" />
                Reset
              </button>
              <button type="button" onClick={() => setMistakeStep("mistake")}>
                Make the wrong choice
              </button>
              <button type="button" onClick={() => setMistakeStep("hint")}>
                See the hint
              </button>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default SabiDemo;
