import { APPROXIMATE_SERVICE_FOOTPRINT } from "./serviceCoverage";

// Regression checks for the owner's approximate travel illustration. These
// point tests are NOT an eligibility rule: all quotes still require review.
function insideOutline(lat,lng){
  let inside=false;
  const outline=APPROXIMATE_SERVICE_FOOTPRINT;
  for(let i=0,j=outline.length-1;i<outline.length;j=i++){
    const [a,b]=outline[i], [c,d]=outline[j];
    if((a>lat)!==(c>lat) && lng<(d-b)*(lat-a)/(c-a)+b)inside=!inside;
  }
  return inside;
}

test("service footprint is a valid geographically anchored outline",()=>{
  expect(APPROXIMATE_SERVICE_FOOTPRINT.length).toBeGreaterThan(20);
  for(const [lat,lng] of APPROXIMATE_SERVICE_FOOTPRINT){
    expect(lat).toBeGreaterThan(30);
    expect(lat).toBeLessThan(39);
    expect(lng).toBeGreaterThan(-123);
    expect(lng).toBeLessThan(-114);
  }
});

test("contiguous footprint includes Montclair and every listed service hub",()=>{
  const cities=[
    ["Montclair",34.0775,-117.6898],
    ["Los Angeles",34.0522,-118.2437],
    ["Orange County",33.7455,-117.8677],
    ["San Bernardino",34.0695,-117.2898],
    ["Temecula",33.4936,-117.1484],
    ["Palm Springs",33.8303,-116.5453],
    ["Victorville",34.5361,-117.2928],
    ["San Diego",32.7157,-117.1611],
    ["Bakersfield",35.3733,-119.0187],
    ["Fresno",36.7378,-119.7871]
  ];
  for(const [name,lat,lng] of cities){
    expect(insideOutline(lat,lng)).toBe(true);
  }
});

test("the footprint roughly follows the sketch instead of claiming statewide coverage",()=>{
  expect(insideOutline(37.7749,-122.4194)).toBe(false); // San Francisco
  expect(insideOutline(36.1699,-115.1398)).toBe(false); // Las Vegas
});
