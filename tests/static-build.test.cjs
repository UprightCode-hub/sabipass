const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const packageJson = JSON.parse(read("package.json"));
const html = read("index.html");
const app = read("src/App.jsx");
const src = [
  read("src/App.jsx"),
  read("src/components/Nav.jsx"),
  read("src/components/SabiDemo.jsx"),
  read("src/components/WaitlistForm.jsx")
].join("\n");
const css = read("src/styles.css");
const api = read("api/waitlist.js");
const explainerApi = read("api/explainer.js");

assert.equal(packageJson.scripts.build, "vite build");
assert.equal(packageJson.scripts.test, "npm run test:api && npm run test:static");
assert.ok(!("type" in packageJson), "package.json should stay CommonJS-compatible for Vercel API files");

assert.match(html, /<div id="root">/);
assert.match(html, /fallback-page/);
assert.match(html, /\/src\/main\.jsx/);

assert.match(src, /fetch\("\/api\/waitlist"/);
assert.match(src, /fetch\("\/api\/explainer"/);
assert.match(src, /SabiPass AI/);
assert.match(src, /Stuck on a WAEC question\? SabiPass asks you the next question — not the answer\./);
assert.match(src, /Try it now/);
assert.match(src, /Try it with no data/);
assert.match(src, /SabiPass is helping right now/);
assert.match(src, /Make the wrong choice/);
assert.match(src, /See the hint/);
assert.match(src, /Get early access\./);
assert.match(src, /School Principal/);
assert.match(src, /\/how-it-works/);
assert.match(src, /\/images\/african-students-classroom\.jpg/);
assert.doesNotMatch(src, /images\.unsplash\.com/);
assert.doesNotMatch(src, /alert\(/);
assert.doesNotMatch(src, /RESEND_API_KEY|RESEND_FROM|SUPABASE_ANON_KEY/);
const cutCopy = {
  crowd: ["Join", "5" + "00+", "students", "parents", "school partners"].join(".*"),
  mastery: ["7", "2", "%", " mastery ", "signal"].join(""),
  reports: ["Parent", "-ready ", "reports"].join(""),
  queue: ["Private ", "beta ", "queue"].join(""),
  voice: ["simulated ", "voice ", "note"].join(""),
  boilerplate: ["Submits ", "securely"].join("")
};

Object.values(cutCopy).forEach((pattern) => {
  assert.doesNotMatch(src, new RegExp(pattern));
});

assert.match(api, /BREVO_API_KEY/);
assert.match(api, /SUPABASE_ANON_KEY/);
assert.doesNotMatch(api, /RESEND_API_KEY|RESEND_FROM/);
assert.match(api, /class_level/);
assert.match(api, /api-key/);
assert.match(api, /htmlContent/);
assert.match(api, /buildConfirmationEmail/);
assert.match(explainerApi, /GROQ_API_KEY/);
assert.match(explainerApi, /SabiPass AI Explainer/);
assert.match(explainerApi, /TWO MODES FOR YOU/);

assert.doesNotMatch(css, /0070f3|00dfd8|gradient\(to right|purple|indigo/i);
assert.match(css, /prefers-reduced-motion/);
assert.match(css, /Fraunces/);
assert.match(css, /--board: #12372a/);
assert.match(css, /--lagos-blue: #245f73/);
assert.match(css, /@media \(hover: hover\) and \(pointer: fine\)/);
assert.match(css, /scroll-snap-type: x mandatory/);

console.log("static project tests passed");
