import test from "node:test";
import assert from "node:assert/strict";
import contact from "../api/contact.js";
import cloudinary from "../api/cloudinary-images.js";
import claimReward from "../api/claim-reward.js";

function response() {
  return {
    statusCode: 200, headers: {}, payload: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.payload = payload; return this; },
    end() { return this; },
    setHeader(key, value) { this.headers[key] = value; }
  };
}
function request(body, method = "POST") {
  return { method, headers: { "content-type": "application/json" }, body, query: {}, socket: {remoteAddress: "127.0.0.1"} };
}
test("contact rejects invalid field type before attempting email", async () => {
  const res = response();
  await contact(request({name:["array"],email:"valid@example.com"}), res);
  assert.equal(res.statusCode, 400);
});
test("contact enforces actual JSON size without Content-Length", async () => {
  const res = response();
  await contact(request({name:"a".repeat(9000),email:"valid@example.com"}), res);
  assert.equal(res.statusCode, 413);
});
test("contact rejects unsupported project types", async () => {
  const res = response();
  await contact(request({name:"Test",email:"valid@example.com",type:"../../../"}), res);
  assert.equal(res.statusCode, 400);
});
test("cloudinary rejects injected folder expressions", async () => {
  const res = response();
  await cloudinary({...request(undefined,"GET"),query:{folder:'photos" OR resource_type:raw',type:"image"}}, res);
  assert.equal(res.statusCode, 400);
});
test("cloudinary denies unapproved folders without credentials", async () => {
  const old = process.env.CLOUDINARY_PUBLIC_FOLDERS;
  delete process.env.CLOUDINARY_PUBLIC_FOLDERS;
  try {
    const res = response();
    await cloudinary({...request(undefined,"GET"),query:{folder:"private",type:"image"}}, res);
    assert.equal(res.statusCode, 403);
  } finally { if (old === undefined) delete process.env.CLOUDINARY_PUBLIC_FOLDERS; else process.env.CLOUDINARY_PUBLIC_FOLDERS = old; }
});
test("archived reward endpoint never issues promo codes", () => {
  const res = response();
  claimReward(request({email:"test@example.com"}), res);
  assert.equal(res.statusCode, 410);
  assert.equal(res.payload?.promoCode, undefined);
});

test("contact accepts padded email and sends a normalized reply-to", async () => {
  const previousKey = process.env.RESEND_API_KEY;
  const oldFetch = globalThis.fetch;
  let sent;
  try {
    process.env.RESEND_API_KEY = "mock-test-key";
    globalThis.fetch = async (url, opts) => {
      assert.equal(url, "https://api.resend.com/emails");
      sent = JSON.parse(opts.body);
      return { ok: true };
    };
    const res = response();
    await contact(request({name:"  Test Person  ", email:" qa@example.invalid ",type:"Property Marketing"}),res);
    assert.equal(res.statusCode, 200);
    assert.equal(sent.reply_to, "qa@example.invalid");
    assert.match(sent.html, /Test Person/);
  } finally {
    globalThis.fetch = oldFetch;
    if (previousKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = previousKey;
  }
});
test("contact provider failures return 502 without exposing upstream details", async () => {
  const previousKey = process.env.RESEND_API_KEY;
  const oldFetch = globalThis.fetch;
  try {
    process.env.RESEND_API_KEY = "mock-test-key";
    globalThis.fetch = async () => { throw new Error("private provider details"); };
    const res = response();
    await contact(request({name:"Test",email:"qa@example.invalid",type:"Other"}),res);
    assert.equal(res.statusCode, 502);
    assert.doesNotMatch(JSON.stringify(res.payload), /private provider details/);
  } finally {
    globalThis.fetch = oldFetch;
    if (previousKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = previousKey;
  }
});

test("required Turnstile blocks quote without a challenge token", async () => {
  const before = process.env.CONTACT_REQUIRE_TURNSTILE;
  const secret = process.env.TURNSTILE_SECRET_KEY;
  try {
    process.env.CONTACT_REQUIRE_TURNSTILE = "true";
    process.env.TURNSTILE_SECRET_KEY = "test-secret";
    const req = request({ name: "Tester", email: "test@example.invalid", type: "Other" });
    req.socket.remoteAddress = "127.0.0.51";
    const res = response();
    await contact(req, res);
    assert.equal(res.statusCode, 403);
  } finally {
    if (before === undefined) delete process.env.CONTACT_REQUIRE_TURNSTILE;
    else process.env.CONTACT_REQUIRE_TURNSTILE = before;
    if (secret === undefined) delete process.env.TURNSTILE_SECRET_KEY;
    else process.env.TURNSTILE_SECRET_KEY = secret;
  }
});
test("verified Turnstile token must succeed before quote email", async () => {
  const keys = ["CONTACT_REQUIRE_TURNSTILE", "TURNSTILE_SECRET_KEY", "RESEND_API_KEY"];
  const prev = Object.fromEntries(keys.map(k => [k, process.env[k]]));
  const oldFetch = globalThis.fetch;
  const requests = [];
  try {
    process.env.CONTACT_REQUIRE_TURNSTILE = "true";
    process.env.TURNSTILE_SECRET_KEY = "test-secret";
    process.env.RESEND_API_KEY = "test-resend-key";
    globalThis.fetch = async (url, options) => {
      requests.push({ url, options });
      if (url.includes("/siteverify")) return { ok: true, json: async () => ({ success: true }) };
      return { ok: true };
    };
    const req = request({ name: "Tester", email: "test@example.invalid", type: "Other", turnstileToken: "token-valid_abcdef123" });
    req.socket.remoteAddress = "127.0.0.52";
    const res = response();
    await contact(req, res);
    assert.equal(res.statusCode, 200);
    assert.equal(requests.length, 2);
    assert.match(requests[0].url, /turnstile\/v0\/siteverify/);
    assert.equal(requests[0].options.body.get("secret"), "test-secret");
    assert.equal(requests[0].options.body.get("response"), "token-valid_abcdef123");
    assert.equal(requests[1].url, "https://api.resend.com/emails");
  } finally {
    globalThis.fetch = oldFetch;
    for (const k of keys) {
      if (prev[k] === undefined) delete process.env[k];
      else process.env[k] = prev[k];
    }
  }
});
test("failed challenge never contacts the email provider", async () => {
  const keys = ["CONTACT_REQUIRE_TURNSTILE", "TURNSTILE_SECRET_KEY", "RESEND_API_KEY"];
  const prev = Object.fromEntries(keys.map(k => [k, process.env[k]]));
  const oldFetch = globalThis.fetch;
  let calls = 0;
  try {
    process.env.CONTACT_REQUIRE_TURNSTILE = "true";
    process.env.TURNSTILE_SECRET_KEY = "test-secret";
    process.env.RESEND_API_KEY = "test-resend-key";
    globalThis.fetch = async () => {
      calls++;
      return { ok: true, json: async () => ({ success: false }) };
    };
    const req = request({ name: "Tester", email: "test@example.invalid", type: "Other", turnstileToken: "token-invalid_abcdef123" });
    req.socket.remoteAddress = "127.0.0.53";
    const res = response();
    await contact(req, res);
    assert.equal(res.statusCode, 403);
    assert.equal(calls, 1);
  } finally {
    globalThis.fetch = oldFetch;
    for (const k of keys) {
      if (prev[k] === undefined) delete process.env[k];
      else process.env[k] = prev[k];
    }
  }
});

test("preview quote requests fail closed without an isolated test recipient", async () => {
  const previous = Object.fromEntries(["VERCEL_ENV","PREVIEW_CONTACT_EMAIL_TO","CONTACT_REQUIRE_TURNSTILE"].map(k=>[k,process.env[k]]));
  const oldFetch = globalThis.fetch;
  let calls = 0;
  try {
    process.env.VERCEL_ENV = "preview";
    delete process.env.PREVIEW_CONTACT_EMAIL_TO;
    delete process.env.CONTACT_REQUIRE_TURNSTILE;
    globalThis.fetch = async () => { calls++; throw new Error("Should not send"); };
    const req = request({name:"Preview Test",email:"test@example.invalid",type:"Other"});
    req.socket.remoteAddress = "127.0.0.54";
    const res = response();
    await contact(req,res);
    assert.equal(res.statusCode,503);
    assert.equal(calls,0);
  } finally {
    globalThis.fetch = oldFetch;
    for(const [key,value] of Object.entries(previous)){
      if(value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});

test("cloudinary ignores untrusted external media URLs and applies transformations to valid assets", async () => {
  const keys = ["CLOUDINARY_PUBLIC_FOLDERS", "CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"];
  const previous = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  const oldFetch = globalThis.fetch;
  try {
    process.env.CLOUDINARY_PUBLIC_FOLDERS = "public-gallery";
    process.env.CLOUDINARY_CLOUD_NAME = "test-cloud";
    process.env.CLOUDINARY_API_KEY = "test-key";
    process.env.CLOUDINARY_API_SECRET = "test-secret";
    globalThis.fetch = async () => ({
      ok: true,
      json: async () => ({ resources: [
        { secure_url: "https://res.cloudinary.com/test-cloud/image/upload/v1/photo.jpg" },
        { secure_url: "https://evil.example.net/collect/image/upload/secret" },
        { secure_url: "http://res.cloudinary.com/test-cloud/image/upload/v1/insecure.jpg" },
        { secure_url: "https://res.cloudinary.com/other-cloud/image/upload/v1/other.jpg" },
        { secure_url: null }
      ] })
    });
    const res = response();
    await cloudinary({ ...request(undefined, "GET"), query: { folder:"public-gallery", type:"image" } }, res);
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.payload.urls, [
      "https://res.cloudinary.com/test-cloud/image/upload/f_auto,q_auto,a_exif,w_2000,c_limit/v1/photo.jpg"
    ]);
  } finally {
    globalThis.fetch = oldFetch;
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
test("cloudinary provider errors do not reveal response text", async () => {
  const keys = ["CLOUDINARY_PUBLIC_FOLDERS", "CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"];
  const previous = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  const oldFetch = globalThis.fetch;
  try {
    process.env.CLOUDINARY_PUBLIC_FOLDERS = "public-gallery";
    process.env.CLOUDINARY_CLOUD_NAME = "test-cloud";
    process.env.CLOUDINARY_API_KEY = "test-key";
    process.env.CLOUDINARY_API_SECRET = "test-secret";
    globalThis.fetch = async () => ({ok:false,status:401,text:async()=> "secret upstream response"});
    const res = response();
    await cloudinary({...request(undefined,"GET"),query:{folder:"public-gallery",type:"image"}},res);
    assert.equal(res.statusCode, 502);
    assert.doesNotMatch(JSON.stringify(res.payload), /secret upstream response|401/);
  } finally {
    globalThis.fetch = oldFetch;
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
