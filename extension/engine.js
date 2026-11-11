import {Chess} from './vendor/chess.js';
import {readInfo,completeBatch,describeLines} from './core.js';
import {normalizeProfile,resolveTarget,chooseEngineLine} from './play-profile.js';
import {analyzeMaia,normalizeMaiaElo} from './maia.js';
export function createSession(port){
let worker, boot, pending, serial = 0, eloBounds=null, supportsLimit=false;
const cache = new Map();
function timeout(){port?.postMessage({type:'fatal',error:'Stockfish ne répond plus. Mets en pause puis redémarre les suggestions.'});stop();}
function stop() {
  serial++;
  if (pending) {clearTimeout(pending.timer);pending.reject(new Error('Annulée'));pending=null;}
  if (boot) {clearTimeout(boot.timer);boot.reject(new Error('Annulée'));boot=null;}
  worker?.terminate();worker=null;
}
function ready() {
  if (worker && !boot) return Promise.resolve();
  if (boot) return boot.promise;
  const w = new Worker('./vendor/stockfish-17.1-lite-single-03e3232.js'); worker=w;
  eloBounds=null;supportsLimit=false;
  const promise = new Promise((resolve,reject)=>{
    boot={resolve,reject,timer:setTimeout(timeout,25000)};
  }); boot.promise=promise;
  w.onerror=event=>{
    console.error('Stockfish worker:',event.message,event.filename);
    port?.postMessage({type:'fatal',error:'Chargement de Stockfish impossible : '+(event.message||'erreur du moteur')});stop();
  };
  w.onmessage=event=>{
    if(worker!==w) return;
    for(const line of String(event.data).split('\n')) {
      const elo=line.match(/^option name UCI_Elo type spin .* min (\d+) max (\d+)/);
      if(elo)eloBounds={min:Number(elo[1]),max:Number(elo[2])};
      if(line.startsWith('option name UCI_LimitStrength type check'))supportsLimit=true;
      if(line==='uciok') {w.postMessage('setoption name Hash value 32');w.postMessage('setoption name Threads value 1');w.postMessage('setoption name Ponder value false');w.postMessage('isready');}
      if(line==='readyok' && boot) {clearTimeout(boot.timer);const b=boot;boot=null;b.resolve();}
      if(!pending) continue;
      const info=readInfo(line);
      if(info) {
        if(!pending.batches.has(info.depth)) pending.batches.set(info.depth,new Map());
        pending.batches.get(info.depth).set(info.index,info);
      }
      if(line.startsWith('bestmove')) {
        const p=pending;pending=null;clearTimeout(p.timer);
        const bestmove=line.split(/\s+/)[1];
        const lines=p.limited?[chooseEngineLine(p.batches,bestmove)]:completeBatch(p.batches,p.expected);
        if(lines.length) p.resolve({lines,bestmove});else p.reject(new Error('Analyse incomplète. Augmente le temps de calcul.'));
      }
    }
  };
  w.postMessage('uci');return promise;
}
async function analyze(message) {
  if(pending || boot) stop();
  const ticket=++serial, {id,fen}=message;
  try {
    if(typeof fen!=='string' || fen.length>150) throw new Error('Position FEN invalide.');
    const game=new Chess(fen), count=game.moves().length;
    const maia=message.engine==='maia', elo=normalizeMaiaElo(message.elo);
    if(!count || game.isInsufficientMaterial() || game.isDrawByFiftyMoves()) {
      port.postMessage({id,type:'result',fen,engine:maia?'maia':'stockfish',elo,lines:[],terminal:game.isCheckmate()?'Échec et mat':!count?'Pat': 'Position nulle'}); return;
    }
    if(maia) {
      const key=`maia|${elo}|${fen}`;
      const lines=cache.get(key)?.lines || await analyzeMaia(fen,elo);
      if(ticket!==serial)return;
      const result={engine:'maia',elo,lines,bestmove:lines[0].move,legalCount:count};
      cache.set(key,result);
      if(cache.size>64)cache.delete(cache.keys().next().value);
      port.postMessage({id,type:'result',fen,...result});return;
    }
    const ms=[300,1000,3000].includes(message.ms)?message.ms:1000;
    const profile=normalizeProfile(message.profile||{});
    const key=`${fen}|${ms}|${JSON.stringify(profile)}`;
    if(cache.has(key)) {port.postMessage({id,type:'result',fen,...cache.get(key)});return;}
    await ready();if(ticket!==serial) return;
    const resolved=resolveTarget(profile,eloBounds),limited=profile.mode==='level';
    if(limited&&!supportsLimit)throw new Error('La limitation de force est indisponible sur ce moteur.');
    worker.postMessage(`setoption name UCI_LimitStrength value ${limited}`);
    worker.postMessage('setoption name Skill Level value 20');
    if(limited)worker.postMessage(`setoption name UCI_Elo value ${resolved.target}`);
    const {lines,bestmove}=await new Promise((resolve,reject)=>{
      const expected=limited?1:Math.min(3,count);
      pending={resolve,reject,expected,limited,batches:new Map(),timer:setTimeout(timeout,ms+10000)};
      worker.postMessage(`setoption name MultiPV value ${expected}`);
      worker.postMessage(`position fen ${fen}`);
      worker.postMessage(`go movetime ${ms} depth 24`);
    });
    if(ticket!==serial) return;
    const described=describeLines(fen,lines),result={lines:described,bestmove,profile:resolved,legalCount:count};cache.set(key,result);
    if(cache.size>64) cache.delete(cache.keys().next().value);
    port.postMessage({id,type:'result',fen,...result});
  } catch(error) {
    if(ticket===serial) port.postMessage({id,type:'error',error:error.message});
  }
}
return {analyze,stop};
}
