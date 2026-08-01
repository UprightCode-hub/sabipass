import React, { Component, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

class LandingPageErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("SabiPass landing page failed to render", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="fallback-page" aria-label="SabiPass AI fallback">
          <section className="fallback-hero">
            <p className="fallback-eyebrow">Built for Nigerian students, trusted by families</p>
            <h1>SabiPass AI teaches WAEC, NECO, and JAMB reasoning, not answer-copying.</h1>
            <p>
              A Socratic mobile tutor that asks the next question, checks each step, and builds
              mastery instead of handing over copy-and-paste answers.
            </p>
            <a href="#waitlist">Join the waitlist</a>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <LandingPageErrorBoundary>
        <App />
      </LandingPageErrorBoundary>
    </StrictMode>
  );
}
