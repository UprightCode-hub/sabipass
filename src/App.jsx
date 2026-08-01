import { useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpenCheck,
  BrainCircuit,
  CheckCircle2,
  CloudOff,
  GraduationCap,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  UsersRound
} from "lucide-react";

const proofPoints = [
  { label: "WAEC / NECO / JAMB", value: "Exam aligned" },
  { label: "SS1 - SS3", value: "Curriculum guided" },
  { label: "Offline first", value: "Built for real devices" }
];

const features = [
  {
    icon: BrainCircuit,
    title: "Socratic, not spoon-fed",
    text: "SP guides students through the next step, checks their reasoning, and keeps the learning honest."
  },
  {
    icon: BookOpenCheck,
    title: "Mapped to Nigerian exams",
    text: "Lessons, practice, and remediation are designed around WAEC, NECO, JAMB, and NERDC-style curriculum paths."
  },
  {
    icon: CloudOff,
    title: "Offline-first by design",
    text: "Practice and flashcards stay useful when data is off. Sync and deep personalization happen when the device reconnects."
  },
  {
    icon: ShieldCheck,
    title: "Parent trust loop",
    text: "The product is framed around progress, confidence, and accountability rather than shortcuts or cheating."
  }
];

const timeline = [
  "Student attempts a question",
  "SP asks for the next reasoning step",
  "Mastery updates from behavior",
  "Parent sees progress, not surveillance"
];

const classLevels = ["SSS 1", "SSS 2", "SSS 3", "JAMB / UTME", "Parent / Guardian", "School / Partner"];

function App() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    class_level: ""
  });
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const messages = useMemo(
    () => [
      { who: "student", text: "I keep missing quadratic equations." },
      { who: "sp", text: "Good. What is the first thing you check before solving one?" },
      { who: "student", text: "Whether it factorizes?" },
      { who: "sp", text: "Exactly. Try x^2 - 5x + 6. Which two numbers multiply to 6 and add to -5?" }
    ],
    []
  );

  const updateField = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const submitWaitlist = async (event) => {
    event.preventDefault();
    setStatus({ type: "idle", message: "" });

    if (!form.name.trim() || !form.email.trim() || !form.class_level) {
      setStatus({ type: "error", message: "Please add your name, email, and class level." });
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
          class_level: form.class_level
        })
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(data.error || "We could not save your spot. Please try again.");
      }

      setStatus({
        type: "success",
        message:
          data.warning ||
          "You are on the SabiPass waitlist. Check your email for confirmation."
      });
      setForm({ name: "", email: "", class_level: "" });
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main>
      <nav className="top-nav" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="SabiPass AI home">
          <span className="brand-mark">SP</span>
          <span>SabiPass AI</span>
        </a>
        <div className="nav-links">
          <a href="#product">Product</a>
          <a href="#trust">Trust</a>
          <a href="#waitlist">Waitlist</a>
        </div>
      </nav>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">
            <Sparkles size={16} aria-hidden="true" />
            Built for Nigerian students, trusted by families
          </p>
          <h1>SabiPass AI</h1>
          <p className="hero-lede">
            A Socratic AI tutor that helps students prepare for WAEC, NECO, and JAMB without
            turning learning into copy-and-paste answers.
          </p>
          <div className="hero-actions">
            <a className="primary-action" href="#waitlist">
              Join the waitlist
              <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a className="secondary-action" href="#product">
              See the simulation
            </a>
          </div>
          <div className="proof-grid" aria-label="SabiPass proof points">
            {proofPoints.map((point) => (
              <div key={point.label}>
                <strong>{point.value}</strong>
                <span>{point.label}</span>
              </div>
            ))}
          </div>
        </div>

        <AppSimulation messages={messages} />
      </section>

      <section className="section-band" id="product">
        <div className="section-heading">
          <p className="eyebrow">Product signal</p>
          <h2>Designed like a learning system, not another chat box.</h2>
        </div>
        <div className="feature-grid">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article className="feature-card" key={feature.title}>
                <Icon size={24} aria-hidden="true" />
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="split-section" id="trust">
        <div>
          <p className="eyebrow">For parents and partners</p>
          <h2>Confidence, mastery, and accountability in one learning loop.</h2>
          <p>
            SabiPass is positioned for families who want AI help without academic shortcuts,
            and for funders who care about access, affordability, and measurable outcomes.
          </p>
        </div>
        <div className="timeline" aria-label="SabiPass learning loop">
          {timeline.map((item, index) => (
            <div className="timeline-row" key={item}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="waitlist-section" id="waitlist">
        <div className="waitlist-copy">
          <p className="eyebrow">Early access</p>
          <h2>Join the SabiPass waitlist.</h2>
          <p>
            Be first to hear when the private launch opens for students, parents, and school
            partners.
          </p>
          <div className="mini-proof">
            <CheckCircle2 size={18} aria-hidden="true" />
            <span>Confirmation email sent automatically after signup.</span>
          </div>
        </div>

        <form className="waitlist-form" onSubmit={submitWaitlist}>
          <label>
            Name
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={updateField}
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
              onChange={updateField}
              placeholder="name@example.com"
              autoComplete="email"
            />
          </label>
          <label>
            Class level or role
            <select name="class_level" value={form.class_level} onChange={updateField}>
              <option value="">Select one...</option>
              {classLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving your spot..." : "Secure my spot"}
            <Mail size={18} aria-hidden="true" />
          </button>
          {status.message ? (
            <p className={`form-status ${status.type}`} role="status">
              {status.message}
            </p>
          ) : null}
        </form>
      </section>
    </main>
  );
}

function AppSimulation({ messages }) {
  return (
    <div className="simulation-shell" aria-label="SabiPass app simulation">
      <div className="phone-frame">
        <div className="phone-top">
          <span>Sabi Garden</span>
          <LockKeyhole size={15} aria-hidden="true" />
        </div>
        <div className="mastery-panel">
          <div>
            <span>Physics mastery</span>
            <strong>72%</strong>
          </div>
          <div className="mastery-bar" aria-hidden="true">
            <span />
          </div>
        </div>
        <div className="subject-stack">
          <div>
            <GraduationCap size={17} aria-hidden="true" />
            WAEC Chemistry
          </div>
          <div>
            <UsersRound size={17} aria-hidden="true" />
            Parent summary ready
          </div>
        </div>
        <div className="chat-window">
          {messages.map((message, index) => (
            <p className={`chat-bubble ${message.who}`} style={{ "--delay": `${index * 0.22}s` }} key={message.text}>
              {message.text}
            </p>
          ))}
        </div>
      </div>
      <div className="orbit-card card-one">
        <span>Offline queue</span>
        <strong>18 answers synced</strong>
      </div>
      <div className="orbit-card card-two">
        <span>SP mode</span>
        <strong>Socratic Solver</strong>
      </div>
    </div>
  );
}

export default App;
