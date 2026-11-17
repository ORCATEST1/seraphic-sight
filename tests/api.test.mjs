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
