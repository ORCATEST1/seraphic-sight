// Read-only end-to-end QA against the built React app. No contact submissions.
import {createServer} from "node:http";
import {readFile,stat,mkdir} from "node:fs/promises";
import {join,extname,normalize} from "node:path";
import {pathToFileURL} from "node:url";
import {chromium} from "playwright";

const root=join(process.cwd(),"build");
const screenshotDir=join(process.cwd(),"browser-qa-artifacts");
await mkdir(screenshotDir,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"application/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json",".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".svg":"image/svg+xml",".ico":"image/x-icon",".woff2":"font/woff2",".webp":"image/webp",".mp4":"video/mp4"};
const server=createServer(async(req,res)=>{
 const url=new URL(req.url,"http://localhost");
 const relative=decodeURIComponent(url.pathname);
 let path=normalize(join(root,relative));
 if(!path.startsWith(root)){res.writeHead(403);res.end();return;}
 try{const st=await stat(path);if(st.isDirectory())path=join(path,"index.html");}
 catch{path=join(root,"index.html");}
 try{const body=await readFile(path);res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream","cache-control":"no-store"});res.end(body);}
 catch(err){res.writeHead(404);res.end(String(err.message));}
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const base="http://127.0.0.1:"+server.address().port;
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
let failures=0;
const issues=[];
const check=(name,condition,detail="")=>{
 console.log((condition?"PASS":"FAIL")+" "+name+(detail?" — "+detail:""));
 if(!condition){failures++;issues.push(name+": "+detail);}
};
async function screenshot(page,name){
 await page.screenshot({path:join(screenshotDir,name+".png"),fullPage:true,animations:"disabled"});
}
async function go(page,path){
 const rsp=await page.goto(base+path,{waitUntil:"domcontentloaded",timeout:35000});
 await page.waitForTimeout(600);
 return rsp;
}
let page;
try{
 page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 const uncaught=[];
 page.on("pageerror",e=>uncaught.push(e.message));
 // The map is the highest-risk new interactive capability.
 await go(page,"/service-area");
 check("Map page heading",await page.locator("h1").innerText().then(s=>s.includes("On site. Across")).catch(()=>false));
 check("Eight selectable service regions",await page.locator(".ss-region-tab").count()===8);
 try{await page.waitForFunction(()=>Boolean(window.L)&&document.querySelectorAll(".leaflet-marker-icon").length>=8,{timeout:30000});}
 catch{}
 const markers=await page.locator(".leaflet-marker-icon").count();
 const loadedTiles=await page.locator("img.leaflet-tile-loaded").count();
 check("Leaflet initializes with 8 markers",markers>=8,"markers="+markers);
 check("Geographic tiles load",loadedTiles>0,"loaded tiles="+loadedTiles);
 const tileSource=await page.locator(".leaflet-tile").first().getAttribute("src").catch(()=>"");
 check("Basemap does not require a paid API key",tileSource?.startsWith("https://tile.openstreetmap.org/"),"tile source="+tileSource);
 await page.locator(".ss-region-tab").filter({hasText:"San Diego County"}).click();
 check("Region selector changes details",(await page.locator(".ss-region-detail h2").innerText()).includes("San Diego County"));
 await page.locator(".ss-region-tab").filter({hasText:"Orange County"}).click();
 check("Second region selector works",(await page.locator(".ss-region-detail h2").innerText()).includes("Orange County"));
 await screenshot(page,"01-map-desktop");
 // Portfolio
 await go(page,"/portfolio");
 check("Portfolio has new editorial header",(await page.locator(".ps-editorial-intro h1").innerText()).includes("Seen from"));
 const countText=await page.locator(".ps-tab").filter({hasText:"Aerial Photography"}).innerText();
 check("35 unique portfolio images",(await page.locator(".ps-tab").filter({hasText:"Aerial Photography"}).locator(".ps-tab-count").innerText()).trim()==="35","tab="+countText.replace(/\n/g," "));
 const labels=await page.locator(".ps-bubbles-label").allInnerTexts();
 check("Correct photo filter title",labels.some(x=>x.includes("FILTER BY SUBJECT")));
 const subjects=["Real Estate","Commercial","Cityscapes","Construction","Mapping","Land","Coastal"];
 const bubbleText=await page.locator(".ps-bubbles").innerText();
 check("All seven subject filters present",subjects.every(x=>bubbleText.includes(x)),bubbleText.slice(0,300).replace(/\n/g," "));
 await page.locator(".ps-bubble").filter({hasText:"Land"}).click();
 check("Two verified land photographs",(await page.locator(".ps-card").count())===2);
 await page.locator(".ps-bubble").filter({hasText:"Cityscapes"}).click();
 check("Seven cityscape photographs",(await page.locator(".ps-card").count())===7);
 const feature3=await page.locator(".ps-featured-card").nth(2).innerText();
 check("Cityscape feature correctly labeled",feature3.includes("CITYSCAPES"));
 await page.locator(".ps-featured-card").nth(2).click();
 check("Lightbox opens",await page.locator('[role="dialog"]').count()===1);
 await page.keyboard.press("Escape");
 check("Lightbox closes",await page.locator('[role="dialog"]').count()===0);
 await screenshot(page,"02-portfolio-desktop");
 // Service pages
 await go(page,"/property-marketing");
 check("Property editorial h1",(await page.locator("h1").innerText()).includes("Show the place"));
 check("Package tiers present",await page.locator(".ess-package").count()===3);
 await screenshot(page,"03-property-desktop");
 await go(page,"/construction");
 check("Construction editorial h1",(await page.locator("h1").innerText()).includes("Make progress"));
 check("Mapping scope caveat",(await page.locator("body").innerText()).includes("not a replacement for a licensed"));
 await screenshot(page,"04-construction-desktop");
 await go(page,"/faq");
 const faq=page.locator(".ss-faq-item button").first();
 await faq.click();
 check("FAQ accordion accessible",await faq.getAttribute("aria-expanded")==="true");
 await screenshot(page,"05-faq-desktop");
 await go(page,"/contact");
 check("Quote form retained",await page.locator('form input[name="email"]').count()===1);
 check("No customer submission",await page.locator("form button[type=submit]").count()===1);
 await screenshot(page,"06-contact-desktop");
 // Mobile layout.
 await page.setViewportSize({width:390,height:844});
 await go(page,"/service-area");
 check("Mobile map content exists",await page.locator(".ss-region-tab").count()===8);
 check("Mobile map fits viewport",await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+5),"scroll width="+await page.evaluate(()=>document.documentElement.scrollWidth));
 await screenshot(page,"07-map-mobile");
 await go(page,"/portfolio");
 check("Mobile portfolio fits viewport",await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+5),"scroll width="+await page.evaluate(()=>document.documentElement.scrollWidth));
 await screenshot(page,"08-portfolio-mobile");
 await go(page,"/contact");
 check("Mobile contact fits viewport",await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+5),"scroll width="+await page.evaluate(()=>document.documentElement.scrollWidth));
 await screenshot(page,"09-contact-mobile");
 check("No uncaught app errors",uncaught.length===0,uncaught.slice(0,6).join(" | "));
}finally{if(page)await page.close();await browser.close();await new Promise(resolve=>server.close(resolve));}
console.log("QA SUMMARY: "+(failures?"FAIL "+failures+" checks":"PASS all checks"));
if(failures){console.error(issues.join("\n"));process.exitCode=1;}
