import React from "react";

function Nav({ currentPath }) {
  return (
    <nav className="top-nav" aria-label="Primary navigation">
      <a className="brand" href="/" aria-label="SabiPass AI home">
        <img className="brand-mark" src="/sabipass-logo.png" alt="" aria-hidden="true" />
        <span>SabiPass AI</span>
      </a>
      <div className="nav-links">
        <a className={currentPath === "/" ? "is-active" : ""} href="/">
          Home
        </a>
        <a className={currentPath === "/how-it-works" ? "is-active" : ""} href="/how-it-works">
          How it Works
        </a>
      </div>
      <a className="nav-cta" href="/#waitlist">
        Get early access
      </a>
    </nav>
  );
}

export default Nav;
