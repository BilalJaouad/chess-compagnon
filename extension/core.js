import { Chess } from './vendor/chess.js';
export function readInfo(line) {
  if (!line.startsWith('info ') || /\b(lowerbound|upperbound)\b/.test(line)) return null;
  const score = line.match(/\bscore (cp|mate) (-?\d+)/), depth = line.match(/\bdepth (\d+)/), pv = line.match(/\bpv (.+)/);
  if (!score || !depth || !pv) return null;
  return {kind:score[1],score:Number(score[2]),depth:Number(depth[1]),index:Number(line.match(/\bmultipv (\d+)/)?.[1]||1),pv:pv[1].trim().split(/\s+/)};
}
export function moveObject(uci) {return {from:uci.slice(0,2),to:uci.slice(2,4),...(uci[4]?{promotion:uci[4]}:{})};}
export function describeLines(fen, lines) {
  return lines.map(line => {
    const game = new Chess(fen), san = [];
    for (const uci of line.pv.slice(0,8)) {
      try {san.push(game.move(moveObject(uci)).san);} catch {break;}
    }
    if (!san.length) throw new Error('Le moteur a renvoyé un coup invalide.');
    const whiteScore = line.score===null?null:line.score * (fen.split(' ')[1] === 'w' ? 1 : -1);
    return {...line,move:line.pv[0],san:san[0],variation:san.join(' '),whiteScore,
      scoreLabel:whiteScore===null?'—':line.kind === 'mate' ? `${whiteScore < 0 ? '−' : '+'}M${Math.abs(whiteScore)}` : `${whiteScore>=0?'+':''}${(whiteScore/100).toFixed(2)}`};
  });
}
export function completeBatch(batches, expected) {
  const entry = [...batches.entries()].sort((a,b)=>b[0]-a[0]).find(([,lines])=>lines.size===expected);
  return entry ? [...entry[1].values()].sort((a,b)=>a.index-b.index) : [];
}
export function squarePoint(square, flipped) {
  const file = square.charCodeAt(0)-97, rank = Number(square[1])-1;
  return flipped ? [7-file+0.5,rank+0.5] : [file+0.5,7-rank+0.5];
}
