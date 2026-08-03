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
            <p className="fallback-eyebrow">SabiPass AI</p>
            <h1>Stuck on a WAEC question? SabiPass asks you the next question — not the answer.</h1>
            <p>
              Type a real JAMB, WAEC, or NECO question. SabiPass walks you through it step by step
              and only moves on once you've actually got it.
            </p>
            <a href="#waitlist">Get early access</a>
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
