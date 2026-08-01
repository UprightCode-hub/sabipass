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
assert.match(app, /Parent summary ready/);
assert.match(app, /18 answers synced/);
assert.match(app, /Today's check-in/);
assert.match(app, /Sabi AI Tutor/);
assert.match(app, /How are you feeling/);
assert.match(app, /getDeviceProfile/);
assert.match(app, /showcaseSlides/);
assert.match(app, /data-slideshow/);
assert.match(app, /App Store coming soon/);
assert.doesNotMatch(app, /images\.unsplash\.com/);
assert.doesNotMatch(app, /alert\(/);
assert.doesNotMatch(app, /RESEND_API_KEY|SUPABASE_ANON_KEY/);

assert.match(api, /RESEND_API_KEY/);
assert.match(api, /SUPABASE_ANON_KEY/);
assert.match(api, /buildConfirmationEmail/);

assert.doesNotMatch(css, /0070f3|00dfd8|gradient\(to right/i);
assert.match(css, /prefers-reduced-motion/);
assert.match(css, /imageDrift/);
assert.match(css, /sheenSweep/);
assert.match(css, /showcase-section/);
assert.match(css, /showcase-slide\[data-active\]/);
assert.match(css, /transform: translateY\(-6px\) scale\(1\.015\)/);

console.log("static project tests passed");
