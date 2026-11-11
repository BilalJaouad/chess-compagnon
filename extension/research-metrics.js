export function validateRuns(input) {
  if(input?.schemaVersion!==1||!Array.isArray(input.runs)||!input.runs.length)throw new Error('Expected {schemaVersion:1,runs:[...]} with at least one run.');
  if(input.runs.length>10000)throw new Error('Maximum 10,000 runs.');
  const ids=new Set(),subjects=new Set();
  return input.runs.map((r,i)=>{
    const fail=m=>{throw new Error(`Run ${i+1}: ${m}`)};
    if(!r||typeof r!=='object')fail('expected an object.');
    for(const f of ['runId','participantId','arm','timeControl'])if(typeof r[f]!=='string'||!r[f].trim()||r[f].length>100)fail(`${f} must be a nonempty string, at most 100 characters.`);
    if(ids.has(r.runId))fail('duplicate runId.');ids.add(r.runId);
    if(subjects.has(r.participantId))fail('repeated participant; use one independent run per participant per report.');subjects.add(r.participantId);
    if(!['human-control','assisted'].includes(r.label))fail('label must be human-control or assisted.');
    if(!Number.isSafeInteger(r.observedGames)||r.observedGames<1)fail('observedGames must be a positive integer.');
    if(typeof r.detectorFeedbackAvailable!=='boolean')fail('detectorFeedbackAvailable must be true or false.');
    for(const k of ['firstFlagGame','firstEnforcementGame'])if(r[k]!==null&&(!Number.isSafeInteger(r[k])||r[k]<1||r[k]>r.observedGames))fail(`${k} must be null or an observed game number.`);
    if(!r.detectorFeedbackAvailable&&r.firstFlagGame!==null)fail('detector flag requires actual detector feedback.');
    if(r.firstFlagGame!==null&&r.firstEnforcementGame!==null&&r.firstEnforcementGame<r.firstFlagGame)fail('enforcement precedes the first flag.');
    return Object.fromEntries(['runId','participantId','arm','timeControl','label','observedGames','detectorFeedbackAvailable','firstFlagGame','firstEnforcementGame'].map(k=>[k,r[k]]));
  });
}
export function wilson(events,n){
  if(!n)return null;
  const z=1.959963984540054,p=events/n,d=1+z*z/n,c=(p+z*z/(2*n))/d,h=z*Math.sqrt(p*(1-p)/n+z*z/(4*n*n))/d;
  return [Math.max(0,c-h),Math.min(1,c+h)];
}
export function horizonSummary(runs,horizon,key){
  const available=runs.filter(r=>key!=='firstFlagGame'||r.detectorFeedbackAvailable);
  const events=available.filter(r=>r[key]!==null&&r[key]<=horizon).length;
  const noEvent=available.filter(r=>(r[key]===null||r[key]>horizon)&&r.observedGames>=horizon).length;
  const censored=available.length-events-noEvent,unavailable=runs.length-available.length,eligible=events+noEvent;
  return {events,noEvent,censored,unavailable,eligible,eligibleRate:eligible?events/eligible:null,eligibleWilson95:wilson(events,eligible),allRunRateBounds:runs.length?[events/runs.length,(events+censored+unavailable)/runs.length]:null};
}
export function buildReport(input,horizon=10){
  if(!Number.isSafeInteger(horizon)||horizon<1||horizon>1000)throw new Error('Horizon must be an integer from 1 to 1000.');
  const runs=validateRuns(input),groups=new Map();
  for(const r of runs){const k=JSON.stringify([r.arm,r.timeControl,r.label]);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(r);}
  return {schemaVersion:1,horizon,totalRuns:runs.length,
    definitions:{horizon:'Event on game H counts as by H.',flag:'Detector flag, only with actual feedback.',enforcement:'Observed ban/action; no ban does not establish no detection.',eligibleWilson95:'Descriptive 95% Wilson interval among known horizon outcomes, assuming independent observations.',allRunRateBounds:'Missing-outcome bounds across all runs, not confidence intervals.'},
    warnings:['Team members playing each other can have correlated outcomes. Intervals are descriptive, not proof of generalization.','Early-ended runs can bias eligible-only estimates; report missing-outcome bounds and excluded counts.','Do not infer detector evasion from absence of enforcement.','Use a fixed held-out evaluation; do not select the longest streak as the primary result.'],
    groups:[...groups.values()].map(rows=>({arm:rows[0].arm,timeControl:rows[0].timeControl,label:rows[0].label,n:rows.length,
      flag:horizonSummary(rows,horizon,'firstFlagGame'),enforcement:horizonSummary(rows,horizon,'firstEnforcementGame'),
      knownEnforcementLags:rows.filter(r=>r.firstFlagGame!==null&&r.firstEnforcementGame!==null).map(r=>({runId:r.runId,games:r.firstEnforcementGame-r.firstFlagGame})),
      observedBeyondHorizonWithoutEnforcement:rows.filter(r=>r.observedGames>horizon&&(r.firstEnforcementGame===null||r.firstEnforcementGame>horizon)).length})),runs};
}
