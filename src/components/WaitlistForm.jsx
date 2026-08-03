import React, { useState } from "react";
import { Mail } from "lucide-react";

const studentRoles = ["SSS 1", "SSS 2", "SSS 3", "JAMB"];
const secondaryRoles = ["Parent", "School Principal"];
const roles = [...studentRoles, ...secondaryRoles];

function WaitlistForm() {
  const [role, setRole] = useState("SSS 3");
  const [form, setForm] = useState({ name: "", email: "" });
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        message: data.warning || "You're on the early access list. We'll be in touch."
      });
      setForm({ name: "", email: "" });
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderRoleButton = (item, kind) => (
    <button
      type="button"
      className={`${role === item ? "is-active" : ""} ${kind === "secondary" ? "is-secondary" : ""}`}
      onClick={() => setRole(item)}
      key={item}
    >
      {item}
    </button>
  );

  return (
    <section className="waitlist-section" id="waitlist">
      <div className="section-heading">
        <p className="eyebrow">Early access</p>
        <h2>Get early access.</h2>
      </div>

      <form className="waitlist-console" onSubmit={submitWaitlist}>
        <div className="role-group" aria-label="Select early access role">
          <div className="student-roles">{studentRoles.map((item) => renderRoleButton(item, "student"))}</div>
          <div className="secondary-roles">
            <span>Not a student?</span>
            {secondaryRoles.map((item) => renderRoleButton(item, "secondary"))}
          </div>
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
          <select name="role" value={role} onChange={(event) => setRole(event.target.value)}>
            {roles.map((item) => (
              <option value={item} key={`option-${item}`}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <button className="submit-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Join early access"}
          <Mail size={18} aria-hidden="true" />
        </button>
        {status.message ? (
          <p className={`form-status ${status.type}`} role="status">
            {status.message}
          </p>
        ) : null}
      </form>
    </section>
  );
}

export default WaitlistForm;
