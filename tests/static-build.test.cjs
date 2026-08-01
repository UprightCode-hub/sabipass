const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const packageJson = JSON.parse(read("package.json"));
const html = read("index.html");
const app = read("src/App.jsx");
const css = read("src/styles.css");
const api = read("api/waitlist.js");
const explainerApi = read("api/explainer.js");

assert.equal(packageJson.scripts.build, "vite build");
assert.equal(packageJson.scripts.test, "npm run test:api && npm run test:static");
assert.ok(!("type" in packageJson), "package.json should stay CommonJS-compatible for Vercel API files");

assert.match(html, /<div id="root">/);
assert.match(html, /fallback-page/);
assert.match(html, /\/src\/main\.jsx/);

assert.match(app, /fetch\("\/api\/waitlist"/);
assert.match(app, /SabiPass AI/);
assert.match(app, /Socratic/);
assert.match(app, /WAEC, NECO, and JAMB/);
assert.match(app, /\/images\/african-students-classroom\.jpg/);
assert.match(app, /Socratic Tutor Sandbox/);
assert.match(app, /Simulate Network Outage/);
assert.match(app, /18 answers saved offline/);
assert.match(app, /Intentional Mistake/);
assert.match(app, /Socratic Redirect/);
assert.match(app, /reasoning mastery/);
assert.match(app, /simulated voice note/);
assert.match(app, /School Principal/);
assert.match(app, /Join 500\+ students, parents, and school partners/);
assert.match(app, /fetch\("\/api\/explainer"/);
assert.match(app, /role/);
assert.match(app, /data-scroll-tilt/);
assert.doesNotMatch(app, /images\.unsplash\.com/);
assert.doesNotMatch(app, /alert\(/);
assert.doesNotMatch(app, /RESEND_API_KEY|SUPABASE_ANON_KEY/);

assert.match(api, /RESEND_API_KEY/);
assert.match(api, /SUPABASE_ANON_KEY/);
assert.match(api, /Name: name/);
assert.match(api, /Email: email/);
assert.match(api, /Role: role/);
assert.match(api, /buildConfirmationEmail/);
assert.match(explainerApi, /GROQ_API_KEY/);
assert.match(explainerApi, /SabiPass AI Explainer/);

assert.doesNotMatch(css, /0070f3|00dfd8|gradient\(to right|purple|indigo/i);
assert.match(css, /prefers-reduced-motion/);
assert.match(css, /Instrument\+Serif/);
assert.match(css, /--forest: #1b3b2b/);
assert.match(css, /--amber: #e07a5f/);
assert.match(css, /rotateX\(calc\(var\(--scroll-progress/);
assert.match(css, /transform: translate\(2px, 2px\) scale\(0\.98\)/);
assert.match(css, /waveform/);

console.log("static project tests passed");
