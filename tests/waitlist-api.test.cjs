const assert = require("node:assert/strict");
const path = require("node:path");

const handlerPath = path.resolve(__dirname, "../api/waitlist.js");
const originalEnv = { ...process.env };
const originalFetch = global.fetch;
const originalConsoleError = console.error;

function loadHandler(env = {}) {
  delete require.cache[handlerPath];
  process.env = { ...originalEnv, ...env };
  return require(handlerPath);
}

function createResponse() {
  return {
    headers: {},
    statusCode: undefined,
    payload: undefined,
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    }
  };
}

async function invoke(handler, req) {
  const res = createResponse();
  await handler(req, res);
  return res;
}

function createFetchMock(responses) {
  const calls = [];
  global.fetch = async (url, options) => {
    calls.push({ url, options });
    const response = responses.shift();

    if (!response) {
      throw new Error("Unexpected fetch call");
    }

    return {
      ok: response.ok,
      status: response.status,
      text: async () => response.text || ""
    };
  };
  return calls;
}

const validEnv = {
  SUPABASE_URL: "https://project.supabase.co",
  SUPABASE_ANON_KEY: "anon-test-key",
  RESEND_API_KEY: "resend-test-key",
  RESEND_FROM: "SabiPass <hello@sabipass.test>"
};

async function run() {
  console.error = () => {};

  {
    const handler = loadHandler(validEnv);
    const res = await invoke(handler, { method: "GET" });
    assert.equal(res.statusCode, 405);
    assert.equal(res.headers.Allow, "POST");
    assert.deepEqual(res.payload, { success: false, error: "Method not allowed" });
  }

  {
    const handler = loadHandler({
      SUPABASE_URL: "",
      SUPABASE_ANON_KEY: "",
      RESEND_API_KEY: ""
    });
    const res = await invoke(handler, { method: "POST", body: {} });
    assert.equal(res.statusCode, 500);
    assert.equal(res.payload.success, false);
    assert.match(res.payload.error, /Missing Supabase or Resend/);
  }

  {
    const handler = loadHandler(validEnv);
    const res = await invoke(handler, { method: "POST", body: "{" });
    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.payload, { success: false, error: "Invalid request body." });
  }

  {
    const handler = loadHandler(validEnv);
    const res = await invoke(handler, { method: "POST", body: { name: "Ada" } });
    assert.equal(res.statusCode, 400);
    assert.match(res.payload.error, /required/);
  }

  {
    const handler = loadHandler(validEnv);
    const res = await invoke(handler, {
      method: "POST",
      body: { name: "Ada", email: "not-email", class_level: "SSS 2" }
    });
    assert.equal(res.statusCode, 400);
    assert.match(res.payload.error, /valid email/);
  }

  {
    const calls = createFetchMock([
      { ok: true, status: 201 },
      { ok: true, status: 200 }
    ]);
    const handler = loadHandler(validEnv);
    const res = await invoke(handler, {
      method: "POST",
      body: { name: " Ada <script> ", email: "ADA@EXAMPLE.COM ", class_level: "SSS 2" }
    });

    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.payload, { success: true });
    assert.equal(calls.length, 2);
    assert.equal(calls[0].url, "https://project.supabase.co/rest/v1/waitlist");
    assert.equal(calls[0].options.headers.apikey, "anon-test-key");
    assert.equal(calls[1].url, "https://api.resend.com/emails");

    const supabaseBody = JSON.parse(calls[0].options.body)[0];
    assert.equal(supabaseBody.name, "Ada <script>");
    assert.equal(supabaseBody.email, "ada@example.com");
    assert.equal(supabaseBody.class_level, "SSS 2");

    const resendBody = JSON.parse(calls[1].options.body);
    assert.equal(resendBody.to, "ada@example.com");
    assert.match(resendBody.html, /Ada &lt;script&gt;/);
    assert.doesNotMatch(resendBody.html, /Hi Ada <script>/);
  }

  {
    createFetchMock([{ ok: false, status: 409, text: "duplicate" }]);
    const handler = loadHandler(validEnv);
    const res = await invoke(handler, {
      method: "POST",
      body: { name: "Ada", email: "ada@example.com", class_level: "SSS 2" }
    });
    assert.equal(res.statusCode, 502);
    assert.equal(res.payload.success, false);
    assert.match(res.payload.error, /could not save/i);
  }

  {
    createFetchMock([
      { ok: true, status: 201 },
      { ok: false, status: 401, text: "bad key" }
    ]);
    const handler = loadHandler(validEnv);
    const res = await invoke(handler, {
      method: "POST",
      body: { name: "Ada", email: "ada@example.com", class_level: "SSS 2" }
    });
    assert.equal(res.statusCode, 202);
    assert.equal(res.payload.success, true);
    assert.match(res.payload.warning, /confirmation email/);
  }
}

run()
  .then(() => {
    console.log("waitlist API tests passed");
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
    console.error = originalConsoleError;
  });
