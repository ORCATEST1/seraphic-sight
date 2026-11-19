import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const source=readFileSync("src/components/PortfolioSection.js","utf8");
const catalogue=source.split("const PHOTOS = [")[1]?.split("];")[0];
assert.ok(catalogue,"Photo catalogue exists");
const records=[...catalogue.matchAll(/\{\s*id:\s*"([^"]+)"\s*,\s*tags:\s*\[([^\]]*)\](?:,\s*archived:\s*(true))?\s*\}/g)]
 .map(([,id,tags,archived])=>({id,tags:[...tags.matchAll(/"([^"]+)"/g)].map(m=>m[1]),archived:archived==="true"}));
const byId=Object.fromEntries(records.map(x=>[x.id,x]));
const visible=records.filter(x=>!x.archived);

test("original asset catalogue is retained with all 42 unique public IDs",()=>{
 assert.equal(records.length,42);
 assert.equal(new Set(records.map(x=>x.id)).size,42);
});
test("public gallery contains 35 unique, retrievable photos",()=>{
 assert.equal(visible.length,35);
 assert.match(source,/const VISIBLE_PHOTOS = PHOTOS\.filter\(photo => !photo\.archived\)/);
 assert.match(source,/isPhoto \? VISIBLE_PHOTOS : VIDEOS/);
 assert.match(source,/count: VISIBLE_PHOTOS\.length/);
});
test("five 404 image IDs are archived rather than displayed broken",()=>{
 for(const id of ["Showcase_nmenkd","Showcase_2_pkjbvm","Showcase_3_n4gxow",
  "AB3BA538-17AE-4CB0-9614-64DACF77AD60_qdj1dz",
  "dji_fly_20230107_163233_917_1673141677255_photo_m5emzx"]){
  assert.equal(byId[id]?.archived,true,id);
  assert.deepEqual(byId[id]?.tags,[]);
 }
});
test("byte-identical duplicates are archived and preserve deep link aliases",()=>{
 for(const id of ["DJI_0944_gho2t4","DJI_0726_c1ezfe"])assert.equal(byId[id]?.archived,true,id);
 for(const id of ["DJI_0944_hlpmgh","DJI_0726_ffmdmr"])assert.equal(byId[id]?.archived,false,id);
 assert.match(source,/"DJI_0944_gho2t4": "DJI_0944_hlpmgh"/);
 assert.match(source,/"DJI_0726_c1ezfe": "DJI_0726_ffmdmr"/);
 assert.match(source,/const canonicalId = PHOTO_ALIASES\[itemId\] \|\| itemId/);
});
test("photo categories describe what the downloaded images actually show",()=>{
 const expected={
  "DJI_0454_bkvuwb":"Real Estate",
  "DJI_0011_zmbnvw":"Land",
  "DJI_0002_xzpfp5":"Land",
  "sola-florance-construction-aerial_oapibr":"Real Estate",
  "4-DJI_0960_etujxs":"Construction",
  "3-DJI_0014_xn3a13":"Construction",
  "DJI_0768_nvafya":"Real Estate",
  "DJI_0104_uzqlyr":"Cityscapes",
  "DJI_0841_tmdv2e":"Cityscapes",
  "DJI_0147-Pano-2_ewomdl":"Cityscapes",
  "DJI_0726_ffmdmr":"Cityscapes",
  "map-snapshot_q3dk25":"Mapping",
  "5-DJI_0138-HDR_eroxlw":"Coastal",
  "B8BF74C3-98E2-4C69-8958-D92124D1FE27_mlcue4":"Coastal",
  "dji_fly_20230107_145206_631_1673132863018_photo_m5emzx":"Commercial"
 };
 for(const [id,category] of Object.entries(expected)) assert.deepEqual(byId[id]?.tags,[category],id);
});
test("each displayed photo has a single supported subject category",()=>{
 const allowed=new Set(["Real Estate","Commercial","Construction","Land","Cityscapes","Mapping","Coastal"]);
 for(const x of visible){
  assert.equal(x.tags.length,1,x.id+" needs a subject");
  assert.ok(allowed.has(x.tags[0]),x.id+" invalid subject");
 }
});
test("featured images correspond to existing unique media in correct categories",()=>{
 const featureIds=["DJI_0036-HDR_bxyo9o","3-DJI_0014_xn3a13","DJI_0104_uzqlyr"];
 assert.deepEqual(featureIds.map(id=>byId[id]?.tags[0]),["Real Estate","Construction","Cityscapes"]);
 for(const id of featureIds)assert.equal(byId[id]?.archived,false,id);
 for(const id of featureIds)assert.ok(source.includes('id:"'+id+'"'));
 assert.match(source,/const idx=VISIBLE_PHOTOS\.findIndex/);
});
test("filters use accurate dimensions and empty categories are hidden",()=>{
 assert.match(source,/isPhoto \? "FILTER BY SUBJECT" : "FILTER BY FILM TYPE"/);
 assert.match(source,/allBubbles\.filter\(b => b\.label === "All" \|\| \(counts\[b\.label\] \?\? 0\) > 0\)/);
});
