import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpenCheck,
  BrainCircuit,
  CheckCircle2,
  CloudOff,
  GraduationCap,
  LockKeyhole,
  Mail,
  MapPinned,
  School,
  ShieldCheck,
  Sparkles,
  Store,
  UsersRound
} from "lucide-react";

const proofPoints = [
  { label: "Exam aligned", value: "WAEC / NECO / JAMB" },
  { label: "Offline first", value: "18 answers sync later" },
  { label: "Parent-ready progress reports", value: "Mastery, not marks alone" }
];

const features = [
  {
    icon: BrainCircuit,
    title: "Socratic step-by-step tutoring",
    text: "SabiPass asks what the student would try next, catches shaky reasoning, and nudges them toward the WAEC-style method."
  },
  {
    icon: BookOpenCheck,
    title: "WAEC / NECO / JAMB aligned practice",
    text: "Practice sets are framed around Nigerian senior secondary topics, UTME readiness, and curriculum-aligned exam habits."
  },
  {
    icon: CloudOff,
    title: "Offline-first learning support",
    text: "Students can keep revising when data is poor, then sync completed answers and tutor history when the phone reconnects."
  },
  {
    icon: GraduationCap,
    title: "Mastery tracking",
    text: "Physics mastery 72%, Chemistry gaps, and next-topic readiness are tracked from reasoning steps, not just final answers."
  },
  {
    icon: ShieldCheck,
    title: "Parent and school progress summaries",
    text: "Parents and school partners see where a learner is improving, where support is needed, and which exam topics need attention."
  }
];

const timeline = [
  "Student attempts a WAEC Chemistry question",
  "SabiPass asks for the next reasoning step",
  "Physics mastery updates from student behavior",
  "Parent summary shows progress without encouraging shortcuts"
];

const classLevels = ["SSS 1", "SSS 2", "SSS 3", "JAMB / UTME", "Parent / Guardian", "School / Partner"];

const waitlistSignals = [
  { label: "Private beta forming", value: "500+" },
  { label: "Exam tracks", value: "3" },
  { label: "Offline queue", value: "18 synced" }
];

const enterpriseSignals = [
  "WAEC / NECO / JAMB readiness focus",
  "Parent-ready progress reports",
  "School and partner onboarding"
];

const betaSocialProof =
  "Join 500+ students, parents, and school partners forming the private beta.";

const imageAssets = {
  hero: "/images/african-students-classroom.jpg",
  study: "/images/teacher-classroom-hands-raised.jpg",
  waitlist: "/images/family-study-home.jpg"
};

const showcaseSlides = [
  {
    eyebrow: "Socratic tutoring",
    title: "WAEC Chemistry starts with a greeting, not a final answer.",
    text: "Sabi AI checks how the student is feeling, asks what topic they want to tackle, then guides oxidation and reduction one reasoning step at a time.",
    image: imageAssets.hero,
    stat: "Try the next reasoning step",
    meta: "Live tutor conversation"
  },
  {
    eyebrow: "Offline learning",
    title: "Practice continues when mobile data is unstable.",
    text: "Students can keep revising on Android or iOS, then sync completed answers and tutor history once the device reconnects.",
    image: imageAssets.study,
    stat: "18 answers synced",
    meta: "Offline queue ready"
  },
  {
    eyebrow: "Mastery tracking",
    title: "Progress is measured by reasoning, not guessing.",
    text: "Physics mastery, Chemistry gaps, and JAMB practice streaks update from the student’s work so parents and schools can see real readiness.",
    image: imageAssets.waitlist,
    stat: "Physics mastery 72%",
    meta: "Parent summary ready"
  }
];

const liveTutorMessages = [
  {
    who: "sp",
    text: "Good afternoon, Chidera. Welcome back to SabiPass. How are you feeling before today's study?"
  },
  {
    who: "student",
    text: "I am okay, just tired. Chemistry has been stressing me for WAEC."
  },
  {
    who: "sp",
    text: "Thanks for saying that. We can go gently. Do you want revision, practice questions, or help with one confusing topic?"
  },
  {
    who: "student",
    text: "Help me understand oxidation and reduction."
  },
  {
    who: "sp",
    text: "Alright. In your own words, what does oxidation mean before we look at any answer?"
  },
  {
    who: "student",
    text: "Is it when a substance gains oxygen?"
  },
  {
    who: "sp",
    text: "Good start. Now try the next reasoning step: what happens to electrons during oxidation?"
  }
];

function getDeviceProfile() {
  if (typeof navigator === "undefined") {
    return { type: "web", label: "Mobile preview", store: "iOS + Android ready" };
  }

  const agent = navigator.userAgent || "";
  const isAndroid = /Android/i.test(agent);
  const isIos = /iPhone|iPad|iPod/i.test(agent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  if (isAndroid) {
    return { type: "android", label: "Android preview", store: "Google Play coming soon" };
  }

  if (isIos) {
    return { type: "ios", label: "iOS preview", store: "App Store coming soon" };
  }

  return { type: "web", label: "Mobile preview", store: "iOS + Android ready" };
}

function useScrollGlide() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let frameId = 0;

    const updateGlide = () => {
      frameId = 0;
      const viewportHeight = window.innerHeight || 1;

      if (!prefersReducedMotion.matches) {
        document.querySelectorAll("[data-scroll-glide]").forEach((element) => {
          const rect = element.getBoundingClientRect();
          const elementCenter = rect.top + rect.height / 2;
          const progress = Math.max(-1, Math.min(1, (viewportHeight / 2 - elementCenter) / viewportHeight));
          element.style.setProperty("--glide-progress", progress.toFixed(3));
        });
      }

      document.querySelectorAll("[data-slideshow]").forEach((element) => {
        const rect = element.getBoundingClientRect();
        const rawProgress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
        const progress = Math.max(0, Math.min(0.999, rawProgress));
        const slideCount = Number(element.getAttribute("data-slide-count")) || 1;
        const activeSlide = Math.min(slideCount - 1, Math.floor(progress * slideCount));

        element.style.setProperty("--slideshow-progress", progress.toFixed(3));
        element.style.setProperty("--active-slide", String(activeSlide));
        element.querySelectorAll("[data-slide]").forEach((slide) => {
          slide.toggleAttribute("data-active", Number(slide.getAttribute("data-slide")) === activeSlide);
        });
      });
    };

    const requestUpdate = () => {
      if (!frameId) {
        frameId = window.requestAnimationFrame(updateGlide);
      }
    };

    updateGlide();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, []);
}

function App() {
  useScrollGlide();

  const [form, setForm] = useState({
    name: "",
    email: "",
    class_level: ""
  });
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const messages = useMemo(() => liveTutorMessages, []);

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
        <div className="hero-visual scroll-glide scroll-glide-right" data-scroll-glide aria-hidden="true">
          <img src={imageAssets.hero} alt="" />
          <span className="hero-visual-sheen" />
        </div>
        <div className="hero-copy">
          <p className="eyebrow">
            <Sparkles size={16} aria-hidden="true" />
            Built for Nigerian students preparing for real exams
          </p>
          <h1>SabiPass AI teaches WAEC, NECO, and JAMB reasoning, not answer-copying.</h1>
          <p className="hero-lede">
            A Socratic mobile tutor that asks the next question, checks each step, and builds
            mastery instead of handing over copy-and-paste answers.
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
          <p className="social-proof">{betaSocialProof}</p>
          <div className="proof-grid" aria-label="SabiPass proof points">
            {proofPoints.map((point) => (
              <div key={point.label}>
                <strong>{point.label}</strong>
                <span>{point.value}</span>
              </div>
            ))}
          </div>
        </div>

        <AppSimulation messages={messages} studyImage={imageAssets.study} />
      </section>

      <section className="showcase-section" data-slideshow data-slide-count={showcaseSlides.length} aria-label="SabiPass animated product showcase">
        <div className="showcase-sticky">
          <div className="showcase-copy">
            <p className="eyebrow">Interactive product motion</p>
            <h2>Scroll through the SabiPass learning loop for Nigerian exam prep.</h2>
            <p>
              Each moment shows how Socratic tutoring, offline learning, mastery tracking, and
              parent-ready reports work together for WAEC, NECO, and JAMB preparation.
            </p>
          </div>
          <div className="showcase-stage">
            {showcaseSlides.map((slide, index) => (
              <article className="showcase-slide" data-active={index === 0 ? "true" : undefined} data-slide={index} key={slide.title}>
                <img src={slide.image} alt="" />
                <div className="showcase-overlay">
                  <span>{slide.eyebrow}</span>
                  <h3>{slide.title}</h3>
                  <p>{slide.text}</p>
                  <div>
                    <strong>{slide.stat}</strong>
                    <small>{slide.meta}</small>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-band" id="product">
        <div className="section-heading">
          <p className="eyebrow">Product signal</p>
          <h2>Every SabiPass flow is built around exam reasoning, offline practice, and mastery.</h2>
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
          <h2>Parents and schools see exam progress without turning AI into an answer shortcut.</h2>
          <p>
            SabiPass is positioned for Nigerian families who want WAEC, NECO, and JAMB support
            that rewards reasoning, and for schools or partners who need measurable mastery data.
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
          <h2>Join the private beta for Socratic WAEC, NECO, and JAMB tutoring.</h2>
          <p>
            Students, parents, schools, and partners can register now for early access to the
            SabiPass mobile learning pilot.
          </p>
          <div className="waitlist-visual scroll-glide scroll-glide-left" data-scroll-glide aria-label="SabiPass launch readiness panel">
            <img src={imageAssets.waitlist} alt="Parent studying with a child at home" />
            <div className="signal-radar" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <div className="launch-card">
              <span>Launch readiness</span>
              <strong>Private beta forming</strong>
            </div>
          </div>
          <div className="mini-proof">
            <CheckCircle2 size={18} aria-hidden="true" />
            <span>{betaSocialProof}</span>
          </div>
        </div>

        <div className="waitlist-console">
          <div className="console-header" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="signal-grid" aria-label="SabiPass waitlist launch signals">
            {waitlistSignals.map((signal) => (
              <div key={signal.label}>
                <strong>{signal.value}</strong>
                <span>{signal.label}</span>
              </div>
            ))}
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
          <div className="enterprise-list" aria-label="Enterprise readiness">
            {enterpriseSignals.map((signal) => (
              <div key={signal}>
                <CheckCircle2 size={17} aria-hidden="true" />
                <span>{signal}</span>
              </div>
            ))}
          </div>
          <div className="store-badges" aria-label="SabiPass mobile app coming soon">
            <span>
              <Store size={18} aria-hidden="true" />
              App Store coming soon
            </span>
            <span>
              <MapPinned size={18} aria-hidden="true" />
              Google Play coming soon
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}

function AppSimulation({ messages, studyImage }) {
  const [visibleMessages, setVisibleMessages] = useState(1);
  const [deviceProfile, setDeviceProfile] = useState({ type: "web", label: "Mobile preview", store: "iOS + Android ready" });

  useEffect(() => {
    setDeviceProfile(getDeviceProfile());
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setVisibleMessages((current) => (current >= messages.length ? 1 : current + 1));
    }, 1850);

    return () => window.clearInterval(interval);
  }, [messages.length]);

  const currentMessages = messages.slice(Math.max(0, visibleMessages - 5), visibleMessages);
  const isThinking = visibleMessages < messages.length;

  return (
    <div className={`simulation-shell scroll-glide scroll-glide-phone ${deviceProfile.type}`} data-scroll-glide aria-label="SabiPass app simulation">
      <img className="study-photo" src={studyImage} alt="Students studying together with notebooks" />
      <div className="phone-frame">
        <div className="phone-shell">
          <div className="device-notch" aria-hidden="true" />
          <div className="phone-device-badge">{deviceProfile.label}</div>
          <div className="app-header">
            <div>
              <span>Sabi AI Tutor</span>
              <strong>Hi Chidera</strong>
            </div>
            <LockKeyhole size={15} aria-hidden="true" />
          </div>
          <div className="wellbeing-card">
            <span>Today's check-in</span>
            <strong>Feeling tired? We go gently.</strong>
            <small>SS3 · WAEC Chemistry · {deviceProfile.store}</small>
          </div>
          <div className="topic-row" aria-label="Sabi AI study context">
            <span>Oxidation</span>
            <span>Reduction</span>
            <span>Offline ready</span>
          </div>
          <div className="app-metrics">
            <div>
              <span>Physics mastery</span>
              <strong>72%</strong>
              <div className="mastery-bar" aria-hidden="true">
                <span />
              </div>
            </div>
            <div>
              <span>Offline queue</span>
              <strong>18 synced</strong>
              <small>NECO practice saved</small>
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
            <div>
              <School size={17} aria-hidden="true" />
              JAMB streak: 6 days
            </div>
          </div>
          <div className="chat-window">
            {currentMessages.map((message, index) => (
              <p className={`chat-bubble ${message.who}`} style={{ "--delay": `${index * 0.16}s` }} key={message.text}>
                {message.text}
              </p>
            ))}
            {isThinking ? (
              <p className="typing-bubble" aria-label="SabiPass is preparing the next Socratic prompt">
                <span />
                <span />
                <span />
              </p>
            ) : null}
          </div>
        </div>
      </div>
      <div className="orbit-card card-one">
        <span>Offline queue</span>
        <strong>18 answers synced</strong>
      </div>
      <div className="orbit-card card-two">
        <span>SabiPass mode</span>
        <strong>Socratic Solver</strong>
      </div>
      <div className="orbit-card card-three">
        <span>Next prompt</span>
        <strong>Try the next reasoning step</strong>
      </div>
    </div>
  );
}

export default App;
