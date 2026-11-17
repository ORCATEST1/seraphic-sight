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
