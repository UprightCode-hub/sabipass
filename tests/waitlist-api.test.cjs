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
  BREVO_API_KEY: "brevo-test-key"
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
      SUPABASE_SERVICE_ROLE_KEY: ""
    });
    const res = await invoke(handler, { method: "POST", body: {} });
    assert.equal(res.statusCode, 500);
    assert.equal(res.payload.success, false);
    assert.match(res.payload.error, /Missing Supabase/);
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
      body: { name: "Ada", email: "not-email", role: "SSS 2" }
    });
    assert.equal(res.statusCode, 400);
    assert.match(res.payload.error, /valid email/);
  }

  {
    const handler = loadHandler(validEnv);
    const res = await invoke(handler, {
      method: "POST",
      body: { name: "Ada", email: "ada@example.com", role: "Graduate" }
    });
    assert.equal(res.statusCode, 400);
    assert.match(res.payload.error, /valid role/);
  }

  {
    const calls = createFetchMock([
      { ok: true, status: 201 },
      { ok: true, status: 200 }
    ]);
    const handler = loadHandler(validEnv);
    const res = await invoke(handler, {
      method: "POST",
      body: { name: " Ada <script> ", email: "ADA@EXAMPLE.COM ", role: "SSS 2" }
    });

    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.payload, { success: true, queueCode: "SP-006" });
    assert.equal(calls.length, 2);
    assert.equal(calls[0].url, "https://project.supabase.co/rest/v1/waitlist_signups");
    assert.equal(calls[0].options.headers.apikey, "anon-test-key");
    assert.equal(calls[1].url, "https://api.brevo.com/v3/smtp/email");

    const supabaseBody = JSON.parse(calls[0].options.body)[0];
    assert.equal(supabaseBody.name, "Ada <script>");
    assert.equal(supabaseBody.email, "ada@example.com");
    assert.equal(supabaseBody.class_level, "SSS 2");

    const brevoBody = JSON.parse(calls[1].options.body);
    assert.equal(brevoBody.to[0].email, "ada@example.com");
    assert.equal(brevoBody.sender.email, "sabipass.edu@gmail.com");
    assert.match(brevoBody.htmlContent, /Ada &lt;script&gt;/);
    assert.doesNotMatch(brevoBody.htmlContent, /Hi Ada <script>/);
  }

  {
    const calls = createFetchMock([
      { ok: true, status: 201 },
      { ok: true, status: 200 }
    ]);
    const handler = loadHandler({
      ...validEnv,
      SUPABASE_ANON_KEY: "anon-test-key",
      SUPABASE_SERVICE_ROLE_KEY: "service-role-test-key"
    });
    const res = await invoke(handler, {
      method: "POST",
      body: { name: "Ada", email: "ada@example.com", role: "SSS 2" }
    });

    assert.equal(res.statusCode, 200);
    assert.equal(calls[0].options.headers.apikey, "service-role-test-key");
    assert.equal(calls[0].options.headers.Authorization, "Bearer service-role-test-key");
  }

  {
    createFetchMock([
      {
        ok: false,
        status: 409,
        text: 'duplicate key value violates unique constraint "waitlist_signups_unique_email" (SQLSTATE 23505)'
      }
    ]);
    const handler = loadHandler(validEnv);
    const res = await invoke(handler, {
      method: "POST",
      body: { name: "Ada", email: "ada@example.com", role: "SSS 2" }
    });
    assert.equal(res.statusCode, 200);
    assert.equal(res.payload.success, true);
    assert.match(res.payload.warning, /already on the waitlist/i);
  }

  {
    createFetchMock([
      { ok: true, status: 201 },
      { ok: false, status: 401, text: "bad key" }
    ]);
    const handler = loadHandler(validEnv);
    const res = await invoke(handler, {
      method: "POST",
      body: { name: "Ada", email: "ada@example.com", role: "SSS 2" }
    });
    assert.equal(res.statusCode, 202);
    assert.equal(res.payload.success, true);
    assert.match(res.payload.warning, /confirmation email/);
  }

  {
    const calls = createFetchMock([{ ok: true, status: 201 }]);
    const handler = loadHandler({ ...validEnv, BREVO_API_KEY: "" });
    const res = await invoke(handler, {
      method: "POST",
      body: { name: "Ada", email: "ada@example.com", role: "School Principal" }
    });
    assert.equal(res.statusCode, 200);
    assert.equal(res.payload.success, true);
    assert.match(res.payload.warning, /early access queue/);
    assert.equal(calls.length, 1);
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
