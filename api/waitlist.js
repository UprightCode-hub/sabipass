const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM || "no-reply@example.com";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ success: false, error: "Method not allowed" });
    return;
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !RESEND_API_KEY) {
    res.status(500).json({
      success: false,
      error: "Missing Supabase or Resend environment variables."
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

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const class_level = String(body.class_level || "").trim();

  if (!name || !email || !class_level) {
    res.status(400).json({
      success: false,
      error: "Name, email, and class level are required."
    });
    return;
  }

  if (!emailPattern.test(email)) {
    res.status(400).json({
      success: false,
      error: "Please enter a valid email address."
    });
    return;
  }

  try {
    const supabaseResponse = await fetch(`${SUPABASE_URL}/rest/v1/waitlist`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify([{ name, email, class_level, created_at: new Date().toISOString() }])
    });

    if (!supabaseResponse.ok) {
      const errorText = await supabaseResponse.text();
      console.error(`Supabase insert failed: ${supabaseResponse.status} ${errorText}`);
      res.status(502).json({
        success: false,
        error: "We could not save your waitlist request yet. Please try again."
      });
      return;
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: email,
        subject: "Your SabiPass waitlist request is confirmed",
        html: buildConfirmationEmail({ name, class_level })
      })
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      console.error(`Resend email failed: ${resendResponse.status} ${errorText}`);
      res.status(202).json({
        success: true,
        warning: "Your spot was saved, but the confirmation email could not be sent yet."
      });
      return;
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Unexpected server error. Please try again."
    });
  }
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildConfirmationEmail({ name, class_level }) {
  const safeName = escapeHtml(name);
  const safeClassLevel = escapeHtml(class_level);

  return `
    <div style="font-family: Inter, Arial, sans-serif; color: #111312; line-height: 1.6;">
      <p>Hi ${safeName},</p>
      <p>You are officially on the SabiPass AI waitlist.</p>
      <p>
        We received your request for <strong>${safeClassLevel}</strong> support. SabiPass is
        being built as a Socratic AI tutor for Nigerian students preparing for WAEC, NECO,
        and JAMB - guiding students step by step instead of spoon-feeding answers.
      </p>
      <p>We will contact you when early access opens.</p>
      <p style="margin-top: 24px;">Stay sharp,<br />The SabiPass team</p>
    </div>
  `;
}
