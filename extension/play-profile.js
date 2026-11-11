const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
function number(value,fallback){return value!==''&&value!==null&&Number.isFinite(Number(value))?Number(value):fallback;}
export function normalizeProfile(raw={}){
  return {mode:raw.mode==='level'?'level':'full',opponent:Math.round(clamp(number(raw.opponent,1500),100,3500)),margin:Math.round(clamp(number(raw.margin,100),0,400)),paced:raw.paced===true};
}
export function resolveTarget(raw,bounds){
  const profile=normalizeProfile(raw),requested=profile.opponent+profile.margin;
  if(profile.mode!=='level')return {...profile,requested:null,target:null,clamped:false};
  if(!bounds||!Number.isFinite(bounds.min)||!Number.isFinite(bounds.max)||bounds.min>bounds.max)throw new Error('Ce moteur ne déclare pas de plage Elo utilisable.');
  const target=clamp(requested,bounds.min,bounds.max);
  return {...profile,requested,target,clamped:target!==requested};
}
// Experimental display pacing, not a fitted model of human decision times.
export function reflectionMs(profile,legalCount,random=Math.random){
  if(profile.mode!=='level'||!profile.paced)return 0;
  const sample=clamp(number(random(),.5),0,1);
  return Math.round(legalCount===1?800+sample*1200:2000+sample*4000);
}
export function chooseEngineLine(batches,bestmove){
  for(const [,lines] of [...batches.entries()].sort((a,b)=>b[0]-a[0])){
    const match=[...lines.values()].find(line=>line.pv[0]===bestmove);
    if(match)return {...match,pv:[...match.pv]};
  }
  return {pv:[bestmove],kind:'unknown',score:null,depth:null,index:1};
}
