import {buildReport} from './research-metrics.js';
const $=s=>document.querySelector(s);let input=null,report=null,source='';
const template={schemaVersion:1,runs:[{runId:'run-001',participantId:'participant-001',arm:'stockfish-baseline',timeControl:'180+2',label:'assisted',observedGames:10,detectorFeedbackAvailable:false,firstFlagGame:null,firstEnforcementGame:10}]};
$('#schema').textContent=JSON.stringify(template,null,2);
function download(value,name){const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
const pct=x=>x===null?'—':`${(100*x).toFixed(1)}%`,range=r=>r?r.map(pct).join(' – '):'—';
function cell(row,text,tag='td'){const n=document.createElement(tag);n.textContent=text;row.append(n);}
function render(){try{
 report=buildReport(input,Number($('#horizon').value));$('#results').replaceChildren();const title=document.createElement('h2');title.textContent=`${report.totalRuns} runs · outcomes by game ${report.horizon}`;$('#results').append(title);
 const wrapper=document.createElement('div');wrapper.className='table-wrap';const table=document.createElement('table');wrapper.append(table);const head=table.createTHead().insertRow();
 ['Arm / time control','Ground truth','Endpoint','Events / known outcomes','Unknown / early-ended','Known-outcome rate','95% Wilson interval','Missing-outcome bounds'].forEach(t=>cell(head,t,'th'));
 const body=table.createTBody();for(const g of report.groups)for(const key of ['flag','enforcement']){const s=g[key],row=body.insertRow();[`${g.arm} / ${g.timeControl}`,g.label,key==='flag'?'Detector flag':'Enforcement',`${s.events} / ${s.eligible}`,`${s.unavailable} unknown, ${s.censored} early-ended`,pct(s.eligibleRate),range(s.eligibleWilson95),range(s.allRunRateBounds)].forEach(t=>cell(row,t));}
 $('#results').append(wrapper);const note=document.createElement('p');note.className='note';note.textContent=report.warnings.join(' ');$('#results').append(note);
 $('#status').textContent=`${source} · evaluated locally. ${source.startsWith('SYNTHETIC')?'Invented examples, not experimental results.':''}`;$('#export').disabled=false;
 }catch(e){report=null;$('#results').replaceChildren();$('#status').textContent=e.message;$('#export').disabled=true;}}
$('#file').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;try{if(f.size>5_000_000)throw new Error('Maximum file size: 5 MB.');input=JSON.parse(await f.text());source=f.name;render();}catch(e){input=null;report=null;$('#results').replaceChildren();$('#export').disabled=true;$('#status').textContent=e.message;}});
$('#horizon').addEventListener('change',()=>{if(input)render();});
$('#template').addEventListener('click',()=>download(template,'research-input-template.json'));
$('#export').addEventListener('click',()=>{if(report)download({...report,source,synthetic:source.startsWith('SYNTHETIC')},'chess-compagnon-research-report.json');});
$('#example').addEventListener('click',()=>{input={schemaVersion:1,runs:[{...template.runs[0],runId:'demo-1',participantId:'demo-a'},{...template.runs[0],runId:'demo-2',participantId:'demo-b',observedGames:15,firstEnforcementGame:null},{...template.runs[0],runId:'demo-3',participantId:'demo-c',observedGames:6,firstEnforcementGame:null},{...template.runs[0],runId:'demo-4',participantId:'demo-d',arm:'human-control',label:'human-control',observedGames:15,firstEnforcementGame:null}]};source='SYNTHETIC EXAMPLE';render();});
