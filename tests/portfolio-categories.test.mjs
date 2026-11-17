import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync("src/components/PortfolioSection.js", "utf8");
const section = source.split("const PHOTOS = [")[1]?.split("];")[0];
assert.ok(section, "Portfolio photo catalogue must exist");

const rows = [...section.matchAll(/\{\s*id:\s*"([^"]+)"\s*,\s*tags:\s*\[([^\]]*)\]/g)]
  .map(([,id,labels])=>({id,tags:[...labels.matchAll(/"([^"]+)"/g)].map(m=>m[1])}));
const byId = Object.fromEntries(rows.map(row=>[row.id,row.tags]));

test("portfolio retains every distinct photograph",()=>{
  assert.equal(rows.length,42);
  assert.equal(new Set(rows.map(row=>row.id)).size,rows.length);
});

test("a photograph has at most one primary subject and only supported labels",()=>{
  const allowed=new Set(["Real Estate","Commercial","Construction","Land"]);
  for(const row of rows){
    assert.ok(row.tags.length<=1, `${row.id} has conflicting categories`);
    for(const tag of row.tags) assert.ok(allowed.has(tag),`Unsupported category ${tag}`);
  }
});

test("land-filter misclassification shown in screenshot is fixed",()=>{
  const corrected={
    "DJI_0454_bkvuwb":"Real Estate",
    "4-DJI_0960_etujxs":"Construction",
    "3-DJI_0014_xn3a13":"Commercial",
    "DJI_0768_nvafya":"Construction",
    "DJI_0104_uzqlyr":"Real Estate",
    "map-snapshot_q3dk25":"Construction"
  };
  for(const [id,expected] of Object.entries(corrected)){
    assert.deepEqual(byId[id],[expected],`${id} must not appear under Land`);
  }
});

test("photo without visual verification stays only in All, not a guessed category",()=>{
  assert.deepEqual(byId["dji_fly_20230107_163233_917_1673141677255_photo_m5emzx"],[]);
});

test("empty category filters stay hidden",()=>{
  assert.match(source,/allBubbles\.filter\(b => b\.label === "All" \|\| \(counts\[b\.label\] \?\? 0\) > 0\)/);
});
