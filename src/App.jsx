import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpenCheck,
  Bot,
  ChevronRight,
  CloudOff,
  Mail,
  MessageCircle,
  Mic2,
  Pause,
  Play,
  Send,
  ShieldCheck,
  Signal,
  Sparkles,
  WifiOff,
  X
} from "lucide-react";

const imageAssets = {
  hero: "/images/african-students-classroom.jpg",
  study: "/images/teacher-classroom-hands-raised.jpg",
  family: "/images/family-study-home.jpg"
};

const heroSlides = [
  {
    src: imageAssets.hero,
    alt: "Nigerian students studying together in a classroom"
  },
  {
    src: imageAssets.study,
    alt: "Teacher guiding students through a classroom question"
  },
  {
    src: imageAssets.family,
    alt: "Parent supporting a student during home revision"
  }
];

const examFlows = {
  WAEC: {
    goal: "Target A1-B3",
    headline: "SabiPass AI teaches WAEC, NECO, and JAMB reasoning, not answer-copying.",
    lede: "Start with the student's next thought, not the final answer. SabiPass guides WAEC-style reasoning, catches shaky steps, and keeps revision moving when data is poor.",
    badge: "SSS 3 Chemistry sprint"
  },
  NECO: {
    goal: "Build steady mastery",
    headline: "NECO revision that rewards process, not answer-copying.",
    lede: "SabiPass turns everyday practice into guided reasoning sessions, with offline saves for students revising between school, home, and lesson centres.",
    badge: "NECO practice lane"
  },
  JAMB: {
    goal: "Target 300+",
    headline: "UTME practice that trains speed, confidence, and the next correct step.",
    lede: "Students work through JAMB-style prompts while SabiPass asks the right follow-up question before revealing any shortcut.",
    badge: "JAMB / UTME focus"
  }
};

const topicFlows = {
  "WAEC Chemistry - Redox": [
    { who: "sabi", text: "Redox check-in: before we calculate, what does oxidation mean in terms of electrons?" },
    { who: "student", text: "Oxidation means losing electrons." },
    { who: "sabi", text: "Good. Now look at Fe2+ becoming Fe3+. Did iron lose or gain an electron?" },
    { who: "student", text: "It lost one electron, so it was oxidised." },
    { who: "sabi", text: "Exactly. Next step: which substance caused that oxidation?" }
  ],
  "JAMB Physics - Vectors": [
    { who: "sabi", text: "Vector warm-up: what makes velocity different from speed in JAMB Physics?" },
    { who: "student", text: "Velocity has direction, speed does not." },
    { who: "sabi", text: "Correct. If two vectors are perpendicular, what operation helps us find the resultant?" },
    { who: "student", text: "Pythagoras theorem." },
    { who: "sabi", text: "Yes. Now explain why we should not add them like ordinary numbers." }
  ],
  "NECO Maths - Quadratics": [
    { who: "sabi", text: "Quadratics without panic: what do you check first before using the formula?" },
    { who: "student", text: "I check if it can factorise." },
    { who: "sabi", text: "Sharp. For x^2 - 5x + 6, which two numbers multiply to 6 and add to -5?" },
    { who: "student", text: "-2 and -3." },
    { who: "sabi", text: "Good reasoning. What are the two roots, and how would you verify them?" }
  ]
};

const roles = {
  "SSS 1": {
    label: "SSS 1",
    benefit: "Build strong reasoning habits before senior secondary pressure peaks.",
    onboarding: "Start with foundations, guided corrections, and confidence-building practice.",
    badge: "Queue badge S1-014"
  },
  "SSS 2": {
    label: "SSS 2",
    benefit: "Repair weak topics early while the exam cycle is still forgiving.",
    onboarding: "Preview WAEC-style reasoning, offline revision, and parent-ready progress signals.",
    badge: "Queue badge S2-028"
  },
  "SSS 3": {
    label: "SSS 3",
    benefit: "Build exam confidence without memorising leaked answers.",
    onboarding: "Start with WAEC Chemistry, NECO Maths, JAMB Physics, and weak-topic repair.",
    badge: "Queue badge S3-042"
  },
  JAMB: {
    label: "JAMB",
    benefit: "Train speed and reasoning before choosing the nearest-looking option.",
    onboarding: "Practise UTME-style prompts with Socratic redirects and mistake repair.",
    badge: "Queue badge J-030"
  },
  Parent: {
    label: "Parent",
    benefit: "See where your child is improving before exam week panic.",
    onboarding: "Receive parent-ready mastery summaries and offline study signals.",
    badge: "Queue badge P-018"
  },
  "School Principal": {
    label: "School Principal",
    benefit: "Support revision across classes with reasoning-first progress signals.",
    onboarding: "Preview school partner onboarding and class-level readiness reports.",
    badge: "Queue badge SP-006"
  }
};

const voiceNotes = [
  {
    speaker: "Chemistry teacher",
    context: "Lagos mainland",
    avatar: "CT",
    duration: "0:24",
    progress: 64,
    transcript: "The useful part is that it asks the student to explain the next step. That is where you know who understands redox.",
    waves: [42, 68, 54, 76, 38, 62, 47, 72, 55]
  },
  {
    speaker: "Parent",
    context: "Abuja",
    avatar: "PA",
    duration: "0:18",
    progress: 48,
    transcript: "When network goes off, my daughter can continue. Later I still see what she practised.",
    waves: [34, 58, 77, 45, 69, 52, 40, 66, 50]
  },
  {
    speaker: "JAMB candidate",
    context: "Port Harcourt",
    avatar: "JC",
    duration: "0:21",
    progress: 56,
    transcript: "It does not just give me option B. It asks why option B makes sense.",
    waves: [50, 70, 44, 61, 82, 36, 58, 73, 48]
  }
];

const explainerStarter = {
  role: "assistant",
  content:
    "Hi, I am the SabiPass AI Explainer. Ask me how the app helps students reason through WAEC, NECO, and JAMB practice."
};

const readinessDate = new Date("2027-05-04T08:00:00+01:00");

function getReadinessDays() {
  const diff = readinessDate.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

function useScrollMotion() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frameId = 0;

    const update = () => {
      frameId = 0;
      const height = window.innerHeight || 1;

      document.querySelectorAll("[data-scroll-tilt]").forEach((element) => {
        const rect = element.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const progress = Math.max(-1, Math.min(1, (height / 2 - center) / height));
        element.style.setProperty("--scroll-progress", reduceMotion.matches ? "0" : progress.toFixed(3));
      });
    };

    const request = () => {
      if (!frameId) frameId = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);

    return () => {
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, []);
}

function MagneticButton({ as: Component = "button", className = "", children, ...props }) {
  const [style, setStyle] = useState({});

  const move = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 8;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 8;
    setStyle({ "--magnet-x": `${x.toFixed(2)}px`, "--magnet-y": `${y.toFixed(2)}px` });
  };

  return (
    <Component
      className={`magnetic ${className}`}
      onMouseMove={move}
      onMouseLeave={() => setStyle({})}
      style={style}
      {...props}
    >
      {children}
    </Component>
  );
}

function App() {
  useScrollMotion();

  const [exam, setExam] = useState("WAEC");
  const [topic, setTopic] = useState("WAEC Chemistry - Redox");
  const [messageCount, setMessageCount] = useState(3);
  const [offline, setOffline] = useState(false);
  const [mistakeMode, setMistakeMode] = useState("neutral");
  const [sliderValue, setSliderValue] = useState(62);
  const [playingNote, setPlayingNote] = useState(null);
  const [role, setRole] = useState("SSS 3");
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([explainerStarter]);
  const [chatStatus, setChatStatus] = useState("idle");

  const activeExam = examFlows[exam];
  const activeTopicMessages = topicFlows[topic];
  const visibleMessages = activeTopicMessages.slice(0, messageCount);
  const roleDetails = roles[role];
  const readinessDays = useMemo(() => getReadinessDays(), []);

  useEffect(() => {
    setMessageCount(2);
    const timers = [3, 4, 5].map((count, index) =>
      window.setTimeout(() => setMessageCount(count), 620 + index * 620)
    );
    return () => timers.forEach(window.clearTimeout);
  }, [topic]);

  const submitWaitlist = async (event) => {
    event.preventDefault();
    setStatus({ type: "idle", message: "" });

    if (!form.name.trim() || !form.email.trim() || !role) {
      setStatus({ type: "error", message: "Please add your name, email, and role." });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          role
        })
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(data.error || "We could not save your spot. Please try again.");
      }

      setStatus({
        type: "success",
        message: data.warning || `You are on the early access queue - ${roleDetails.badge.replace("Queue badge ", "")}.`
      });
      setForm({ name: "", email: "" });
      console.log("[waitlist] Saved early access request", { role });
    } catch (error) {
      console.log("[waitlist] Submission failed", error);
      setStatus({ type: "error", message: error.message || "Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitExplainerQuestion = async (event) => {
    event.preventDefault();
    const question = chatInput.trim();
    if (!question || chatStatus === "loading") return;

    const nextMessages = [...chatMessages, { role: "user", content: question }];
    setChatMessages(nextMessages);
    setChatInput("");
    setChatStatus("loading");

    try {
      const response = await fetch("/api/explainer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question, history: nextMessages.slice(-6) })
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.reply) {
        throw new Error(data.error || "The explainer is not available yet.");
      }

      setChatMessages((current) => [...current, { role: "assistant", content: data.reply }]);
      setChatStatus("idle");
    } catch (error) {
      setChatMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            error.message ||
            "I could not reach the explainer right now. What part of SabiPass would you like clarified first?"
        }
      ]);
      setChatStatus("error");
    }
  };

  return (
    <main className={offline ? "offline-site" : ""}>
      <nav className="top-nav" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="SabiPass AI home">
          <span className="brand-mark" aria-hidden="true">
            <span className="logo-placeholder">SP</span>
          </span>
          <span>SabiPass AI</span>
        </a>
        <div className="nav-links">
          <a href="#product">Product</a>
          <a href="#offline">Offline</a>
          <a href="#proof">Proof</a>
          <a href="#waitlist">Waitlist</a>
        </div>
      </nav>

      <section className="hero-section" id="top">
        <div className="hero-background" aria-hidden="true">
          {heroSlides.map((slide, index) => (
            <img
              src={slide.src}
              alt=""
              className={`hero-slide hero-slide-${index + 1}`}
              key={slide.src}
            />
          ))}
        </div>
        <div className="hero-copy">
          <p className="eyebrow">
            <Sparkles size={16} aria-hidden="true" />
            Built around Nigerian exam pressure
          </p>
          <div className="exam-pill" aria-label="Select exam track">
            {Object.keys(examFlows).map((item) => (
              <button
                type="button"
                className={exam === item ? "is-active" : ""}
                onClick={() => setExam(item)}
                key={item}
              >
                {item}
              </button>
            ))}
            <span>{activeExam.goal}</span>
          </div>
          <h1>SabiPass AI teaches WAEC, NECO, and JAMB reasoning, not answer-copying.</h1>
          <p className="hero-lede">
            Start with the student's next thought, not the final answer. SabiPass guides WAEC-style
            reasoning, catches shaky steps, and keeps revision moving when data is poor.
          </p>
          <div className="hero-actions">
            <MagneticButton as="a" className="primary-action" href="#waitlist">
              Join early access
              <ArrowRight size={18} aria-hidden="true" />
            </MagneticButton>
            <a className="secondary-action" href="#sandbox">
              Try Interactive Demo
              <ChevronRight size={18} aria-hidden="true" />
            </a>
          </div>
          <div className="trust-banner">
            Join 500+ students, parents, and school partners preparing for the next exam cycle.
          </div>
          <div className="hero-proof" aria-label="SabiPass proof points">
            <span>72% mastery signal</span>
            <span>18 saved offline</span>
            <span>Parent-ready reports</span>
          </div>
        </div>

        <section className="sandbox" id="sandbox" aria-label="Socratic Tutor Sandbox">
          <div className="sandbox-toolbar">
            <div>
              <span>Playable sandbox</span>
              <strong>{activeExam.badge}</strong>
            </div>
            <button
              className={`offline-toggle ${offline ? "is-on" : ""}`}
              type="button"
              aria-pressed={offline}
              onClick={() => setOffline((current) => !current)}
            >
              <WifiOff size={16} aria-hidden="true" />
              Simulate Network Outage
            </button>
          </div>
          <div className="topic-chips" aria-label="Choose a tutor topic">
            {Object.keys(topicFlows).map((item) => (
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
          <div className="tutor-window">
            <div className="tutor-status">
              <span className={offline ? "status-dot offline" : "status-dot"} />
              {offline ? "Offline Mode - 18 answers saved locally" : "Live Socratic session"}
            </div>
            {visibleMessages.map((message, index) => (
              <p
                className={`chat-bubble ${message.who}`}
                style={{ "--delay": `${index * 90}ms` }}
                key={`${topic}-${message.text}`}
              >
                {message.text}
              </p>
            ))}
            {messageCount < activeTopicMessages.length ? (
              <p className="typing-bubble" aria-label="SabiPass is generating the next Socratic prompt">
                <span />
                <span />
                <span />
              </p>
            ) : null}
          </div>
          <div className="offline-meter" aria-live="polite">
            <div>
              <span>{offline ? "Local queue" : "Cloud sync"}</span>
              <strong>{offline ? "18 answers saved offline" : "All reasoning steps synced"}</strong>
            </div>
            <Signal size={20} aria-hidden="true" />
          </div>
        </section>
      </section>

      <section className="product-loop" id="product">
        <div className="section-kicker">
          <p className="eyebrow">Interactive product motion</p>
          <h2>A tutor that corrects the thinking, not just the final option.</h2>
        </div>
        <div className="device-grid">
          <div className="device-stage" data-scroll-tilt>
            <img className="study-card" src={imageAssets.study} alt="Teacher guiding students in a classroom" />
            <div className="phone-frame">
              <div className="phone-screen">
                <div className="app-topline">
                  <span>Sabi AI Tutor</span>
                  <strong>{offline ? "Offline ready" : "Reasoning live"}</strong>
                </div>
                <div className="mastery-card">
                  <span>Physics mastery</span>
                  <strong>72%</strong>
                  <div className="mastery-bar"><span /></div>
                </div>
                <div className="queue-grid">
                  <div>
                    <CloudOff size={17} aria-hidden="true" />
                    <span>{offline ? "18 queued" : "0 queued"}</span>
                  </div>
                  <div>
                    <BookOpenCheck size={17} aria-hidden="true" />
                    <span>WAEC logic</span>
                  </div>
                </div>
                <div className="mini-transcript">
                  {visibleMessages.slice(-3).map((message) => (
                    <p className={message.who} key={`device-${message.text}`}>{message.text}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="reasoning-panel">
            <p className="eyebrow">Live reasoning step simulator</p>
            <h3>What happens when a student makes a tempting mistake?</h3>
            <div className={`reasoning-card ${mistakeMode}`}>
              <span>JAMB Physics - Vectors</span>
              {mistakeMode === "neutral" ? (
                <p>Question: Two perpendicular vectors are 3N and 4N. What should you do before choosing an option?</p>
              ) : null}
              {mistakeMode === "mistake" ? (
                <p>Student: "I will add 3 + 4, so the resultant is 7N."</p>
              ) : null}
              {mistakeMode === "redirect" ? (
                <p>SabiPass: "That addition works only when they point the same way. Since they are perpendicular, what triangle do the two vectors form?"</p>
              ) : null}
            </div>
            <div className="reasoning-actions">
              <button type="button" onClick={() => setMistakeMode("neutral")}>Reset</button>
              <button type="button" onClick={() => setMistakeMode("mistake")}>Intentional Mistake</button>
              <button type="button" onClick={() => setMistakeMode("redirect")}>Socratic Redirect</button>
            </div>
          </div>
        </div>
      </section>

      <section className="offline-band" id="offline">
        <div>
          <p className="eyebrow">Offline-first reliability</p>
          <h2>Revision should not stop because mobile data is misbehaving.</h2>
          <p>
            When the network drops, SabiPass keeps the session usable, saves answers locally, and
            prepares a clean sync trail for parents and schools.
          </p>
        </div>
        <div className="offline-ledger">
          <div><span>Saved answers</span><strong>18</strong></div>
          <div><span>Pending sync</span><strong>{offline ? "On device" : "Clear"}</strong></div>
          <div><span>Parent summary</span><strong>Ready</strong></div>
        </div>
      </section>

      <section className="proof-section" id="proof">
        <div className="section-kicker">
          <p className="eyebrow">High-trust verification engine</p>
          <h2>Proof surfaces for parents, teachers, and school partners.</h2>
        </div>

        <div className="proof-grid">
          <article className="score-slider">
            <div className="score-header">
              <span>Before / after exam readiness</span>
              <strong>{sliderValue}% reasoning mastery</strong>
            </div>
            <input
              type="range"
              min="20"
              max="92"
              value={sliderValue}
              onChange={(event) => setSliderValue(event.target.value)}
              aria-label="Compare rote memorization and reasoning mastery"
            />
            <div className="score-comparison" style={{ "--score": `${sliderValue}%` }}>
              <span>Rote memorization</span>
              <span>Socratic mastery</span>
            </div>
          </article>

          <article className="countdown-card">
            <span>Next exam cycle placeholder</span>
            <strong>{readinessDays}</strong>
            <p>days to prepare students with reasoning-first practice before the next WAEC-style readiness window.</p>
          </article>
        </div>

        <div className="voice-grid" aria-label="Simulated voice note testimonials">
          {voiceNotes.map((note, index) => {
            const isPlaying = playingNote === index;
            return (
              <article className={`voice-card ${isPlaying ? "is-playing" : ""}`} key={note.speaker}>
                <div className="voice-topline">
                  <Mic2 size={18} aria-hidden="true" />
                  <span className="avatar-placeholder" aria-hidden="true">{note.avatar}</span>
                  <div>
                    <strong>{note.speaker}</strong>
                    <span>{note.context} - simulated voice note</span>
                  </div>
                  <button
                    type="button"
                    aria-label={`${isPlaying ? "Pause" : "Play"} ${note.speaker} voice note`}
                    onClick={() => setPlayingNote(isPlaying ? null : index)}
                  >
                    {isPlaying ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
                  </button>
                </div>
                <div className="waveform" aria-hidden="true">
                  {note.waves.map((height, waveIndex) => (
                    <span style={{ "--wave-height": `${height}%` }} key={`${note.speaker}-${waveIndex}`} />
                  ))}
                </div>
                <div className="audio-scrubber" aria-hidden="true">
                  <span>0:00</span>
                  <div><i style={{ "--audio-progress": `${isPlaying ? note.progress : 18}%` }} /></div>
                  <span>{note.duration}</span>
                </div>
                <p>{note.transcript}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="waitlist-section" id="waitlist">
        <div className="waitlist-copy">
          <p className="eyebrow">Early access</p>
          <h2>Choose your role. SabiPass shapes the promise around what you need to see.</h2>
          <p>{roleDetails.benefit}</p>
          <div className="role-preview">
            <ShieldCheck size={20} aria-hidden="true" />
            <span>{roleDetails.onboarding}</span>
          </div>
          <img src={imageAssets.family} alt="Parent studying with a child at home" />
        </div>

        <form className="waitlist-console" onSubmit={submitWaitlist}>
          <div className="console-header">
            <span>Private beta queue</span>
            <strong>{roleDetails.badge}</strong>
          </div>
          <div className="role-selector" aria-label="Select early access role">
            {Object.keys(roles).map((item) => (
              <button
                type="button"
                className={role === item ? "is-active" : ""}
                onClick={() => setRole(item)}
                key={item}
              >
                {roles[item].label}
              </button>
            ))}
          </div>
          <label>
            Name
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="e.g. Tunde"
              autoComplete="name"
            />
          </label>
          <label>
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="name@example.com"
              autoComplete="email"
            />
          </label>
          <label>
            Role
            <select
              name="role"
              value={role}
              onChange={(event) => setRole(event.target.value)}
            >
              {Object.keys(roles).map((item) => (
                <option value={item} key={`option-${item}`}>
                  {roles[item].label}
                </option>
              ))}
            </select>
          </label>
          <MagneticButton className="submit-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving your spot..." : "Join early access"}
            <Mail size={18} aria-hidden="true" />
          </MagneticButton>
          {status.message ? (
            <p className={`form-status ${status.type}`} role="status">
              {status.message}
            </p>
          ) : null}
          <div className="submission-note">
            <Send size={16} aria-hidden="true" />
            <span>Submits securely with the required Name, Email, and Role fields.</span>
          </div>
        </form>
      </section>

      <aside className={`explainer-widget ${chatOpen ? "is-open" : ""}`} aria-label="SabiPass AI explainer chat">
        {chatOpen ? (
          <div className="chat-panel">
            <div className="chat-header">
              <div>
                <Bot size={18} aria-hidden="true" />
                <span>SabiPass AI Explainer</span>
              </div>
              <button type="button" aria-label="Close explainer chat" onClick={() => setChatOpen(false)}>
                <X size={17} aria-hidden="true" />
              </button>
            </div>
            <div className="chat-log" aria-live="polite">
              {chatMessages.map((message, index) => (
                <p className={`explainer-message ${message.role}`} key={`${message.role}-${index}`}>
                  {message.content}
                </p>
              ))}
              {chatStatus === "loading" ? <p className="explainer-message assistant">Thinking...</p> : null}
            </div>
            <form className="chat-form" onSubmit={submitExplainerQuestion}>
              <input
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder="Ask how SabiPass works"
                aria-label="Ask the SabiPass AI Explainer"
              />
              <button type="submit" disabled={chatStatus === "loading"}>
                <Send size={16} aria-hidden="true" />
              </button>
            </form>
          </div>
        ) : (
          <button className="chat-launcher" type="button" onClick={() => setChatOpen(true)}>
            <MessageCircle size={20} aria-hidden="true" />
            Ask SabiPass
          </button>
        )}
      </aside>

      <footer className="site-footer">
        <div>
          <strong>SabiPass AI</strong>
          <span>Socratic, offline-first exam preparation for Nigerian students.</span>
        </div>
        <div className="footer-links">
          <a href="#product">Product</a>
          <a href="#proof">Proof</a>
          <a href="#waitlist">Waitlist</a>
        </div>
      </footer>
    </main>
  );
}

export default App;
