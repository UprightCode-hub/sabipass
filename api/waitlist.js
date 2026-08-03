const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_REST_KEY = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
const BREVO_API_KEY = process.env.BREVO_API_KEY;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const allowedRoles = new Set([
  "SSS 1",
  "SSS 2",
  "SSS 3",
  "JAMB",
  "Parent",
  "School Principal",
]);

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ success: false, error: "Method not allowed" });
    return;
  }

  if (!SUPABASE_URL || !SUPABASE_REST_KEY) {
    console.error("[waitlist] Missing required Supabase environment variables");
    res.status(500).json({
      success: false,
      error: "Missing Supabase environment variables.",
    });
    return;
  }

  let body;

  try {
    body =
      typeof req.body === "string"
        ? JSON.parse(req.body || "{}")
        : req.body || {};
  } catch (error) {
    res.status(400).json({ success: false, error: "Invalid request body." });
    return;
  }

  const name = String(body.name || "").trim();
  const email = String(body.email || "")
    .trim()
    .toLowerCase();
  const role = String(body.role || "").trim();

  if (!name || !email || !role) {
    res.status(400).json({
      success: false,
      error: "Name, email, and role are required.",
    });
    return;
  }

  if (!allowedRoles.has(role)) {
    res.status(400).json({
      success: false,
      error: "Please choose a valid role.",
    });
    return;
  }

  if (!emailPattern.test(email)) {
    res.status(400).json({
      success: false,
      error: "Please enter a valid email address.",
    });
    return;
  }

  try {
    console.log("[waitlist] Attempting Supabase insert", { email, role });
    const supabaseResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/waitlist_signups`,
      {
        method: "POST",
        headers: {
          apikey: SUPABASE_REST_KEY,
          Authorization: `Bearer ${SUPABASE_REST_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal"
        },
        body: JSON.stringify([{ name: name, email: email, class_level: role }]),
      },
    );

    if (!supabaseResponse.ok) {
      const errorText = await supabaseResponse.text();
      const isDuplicateEmail = supabaseResponse.status === 409;

      if (isDuplicateEmail) {
        console.log("[waitlist] Duplicate email detected; retrying confirmation email", {
          email,
          role,
        });

        if (!BREVO_API_KEY) {
          res.status(200).json({
            success: true,
            warning: "You're already on the waitlist — we'll be in touch!",
          });
          return;
        }

        try {
          const retryBrevoResponse = await sendConfirmationEmail({ email, name, role });

          if (!retryBrevoResponse.ok) {
            res.status(200).json({
              success: true,
              warning: "You're already on the waitlist — we'll be in touch!",
            });
            return;
          }

          res.status(200).json({
            success: true,
            warning: "You're already on the waitlist — we've resent your confirmation email.",
          });
        } catch (error) {
          res.status(200).json({
            success: true,
            warning: "You're already on the waitlist — we'll be in touch!",
          });
        }
        return;
      }

      console.error(
        `Supabase insert failed: ${supabaseResponse.status} ${errorText}`,
      );
      res.status(502).json({
        success: false,
        error: "We could not save your waitlist request yet. Please try again.",
      });
      return;
    }

    console.log("[waitlist] Supabase insert succeeded", { email, role });

    if (!BREVO_API_KEY) {
      console.warn(
        "[waitlist] BREVO_API_KEY is not configured; skipping confirmation email",
      );
      res.status(200).json({
        success: true,
        warning: "You are on the early access queue - SP-006.",
      });
      return;
    }

    const brevoResponse = await sendConfirmationEmail({ email, name, role });

    if (!brevoResponse.ok) {
      const errorText = await brevoResponse.text();
      console.error(`Brevo email failed: ${brevoResponse.status} ${errorText}`);
      res.status(202).json({
        success: true,
        warning: "Your spot was saved, but the confirmation email could not be sent yet.",
      });
      return;
    }

    console.log("[waitlist] Confirmation email sent", { email });
    res.status(200).json({ success: true, queueCode: "SP-006" });
  } catch (error) {
    console.error("[waitlist] Unexpected error", error);
    res.status(500).json({
      success: false,
      error: "Unexpected server error. Please try again.",
    });
  }
};

async function sendConfirmationEmail({ email, name, role }) {
  return fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: "Sabipass", email: "sabipass.edu@gmail.com" },
      to: [{ email }],
      subject: "Your SabiPass waitlist request is confirmed",
      htmlContent: buildConfirmationEmail({ name, role }),
    }),
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildConfirmationEmail({ name, role }) {
  const safeName = escapeHtml(name);
  const safeRole = escapeHtml(role);

  return `
    <div style="font-family: Inter, Arial, sans-serif; color: #111312; line-height: 1.6;">
      <p>Hi ${safeName},</p>
      <p>You are officially on the SabiPass AI waitlist.</p>
      <p>
        We received your request for <strong>${safeRole}</strong> support. SabiPass is
        being built as a Socratic AI tutor for Nigerian students preparing for WAEC, NECO,
        and JAMB - guiding students step by step instead of spoon-feeding answers.
      </p>
      <p>We will contact you when early access opens.</p>
      <p style="margin-top: 24px;">Stay sharp,<br />The SabiPass team</p>
    </div>
  `;
}
