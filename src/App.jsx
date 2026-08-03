import React from "react";
import Nav from "./components/Nav.jsx";
import SabiDemo from "./components/SabiDemo.jsx";
import WaitlistForm from "./components/WaitlistForm.jsx";

function useCurrentPath() {
  const path = window.location.pathname;
  return path === "/how-it-works" ? "/how-it-works" : "/";
}

function HomePage() {
  return (
    <>
      <section className="hero-section" id="top">
        <div className="hero-media" aria-hidden="true">
          <img src="/images/african-students-classroom.jpg" alt="" />
        </div>
        <div className="hero-copy">
          <h1>Stuck on a WAEC question? SabiPass asks you the next question — not the answer.</h1>
          <p>
            Type a real JAMB, WAEC, or NECO question. SabiPass walks you through it step by step
            and only moves on once you've actually got it.
          </p>
          <a className="primary-action" href="#demo">
            Try it now
          </a>
        </div>
      </section>
      <SabiDemo />
      <WaitlistForm />
    </>
  );
}

function HowItWorksPage() {
  return (
    <main className="content-page">
      <section className="story-hero">
        <p className="eyebrow">Works even with no data</p>
        <h1>SabiPass is built for how Nigerian students actually revise.</h1>
        <p>
          SabiPass keeps working, saves what the student did, and shows it to parents once it's
          back online.
        </p>
      </section>

      <section className="info-grid" aria-label="How SabiPass works">
        <article>
          <span>01</span>
          <h2>It starts with the student's thinking.</h2>
          <p>
            When a student brings a WAEC, NECO, or JAMB question, SabiPass does not jump straight
            to the final option. It asks the next useful question, checks the student's reasoning,
            and keeps the work moving one step at a time.
          </p>
        </article>
        <article>
          <span>02</span>
          <h2>It changes style by subject.</h2>
          <p>
            Maths, Physics, Chemistry, and Accounting need strict step-by-step solving. Government,
            Literature, History, and theory-heavy topics need active recall, short quizzes, and
            patient explanation. SabiPass is being designed to know the difference.
          </p>
        </article>
        <article>
          <span>03</span>
          <h2>It respects poor network days.</h2>
          <p>
            Practice and flashcards should not stop because data finishes or signal drops. The
            product is being built offline-first, so students can keep studying and sync feedback
            later.
          </p>
          <div className="sync-strip">
            <span>Waiting to send</span>
            <strong>Saved practice will sync when data returns.</strong>
          </div>
        </article>
      </section>

      <section className="founder-note">
        <p className="eyebrow">Founder note</p>
        <h2>Why AI-native, not just another CBT app?</h2>
        <p>
          CBT practice is useful, but many students already know the feeling of choosing an answer,
          seeing red or green, and still not knowing what went wrong. SabiPass is for the quieter
          moment before the answer: the moment where a student needs someone to ask, "what is the
          next step, and why?"
        </p>
        <p>
          The aim is not to help students copy answers faster. It is to make a patient tutor
          available when a lesson teacher is busy, when a parent is not sure how to help, or when a
          student is revising alone at night with limited data.
        </p>
      </section>
    </main>
  );
}

function App() {
  const path = useCurrentPath();

  return (
    <>
      <Nav currentPath={path} />
      {path === "/how-it-works" ? <HowItWorksPage /> : <HomePage />}
      <footer className="site-footer">
        <strong>SabiPass AI</strong>
        <span>An AI tutor that helps you think it through, not just Google it.</span>
      </footer>
    </>
  );
}

export default App;
