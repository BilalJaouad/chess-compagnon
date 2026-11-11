// Model inputs and move vocabulary follow the official Maia Chess web export.
export const MAIA_LEVELS = [1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300, 2400, 2500];
export const normalizeMaiaElo = elo => MAIA_LEVELS.includes(Number(elo)) ? Number(elo) : 1500;

function mirrorMove(move) {
  return move[0] + (9 - Number(move[1])) + move[2] + (9 - Number(move[3])) + move.slice(4);
}

export function maiaInputs(game, vocabulary) {
  const black = game.turn() === 'b';
  const tokens = new Float32Array(64 * 12);
  for (const [row, rank] of game.board().entries()) {
    for (const [file, piece] of rank.entries()) {
      if (!piece) continue;
      const square = (black ? row : 7 - row) * 8 + file;
      const channel = 'pnbrqk'.indexOf(piece.type) + (piece.color === game.turn() ? 0 : 6);
      tokens[square * 12 + channel] = 1;
    }
  }
  const moves = game.moves({verbose:true}).map(({from,to,promotion,san}) => {
    const move = from + to + (promotion || '');
    const index = vocabulary[black ? mirrorMove(move) : move];
    if (!Number.isInteger(index)) throw new Error('Coup absent du modèle Maia.');
    return {move, san, index};
  });
  return {tokens, moves};
}

export function rankMaiaMoves(moves, logits) {
  const ranked = moves.map(({move,san,index}) => ({move,san,logit:logits[index]}));
  if (!ranked.length || ranked.some(({logit}) => !Number.isFinite(logit))) throw new Error('Résultat Maia invalide.');
  ranked.sort((a,b) => b.logit - a.logit);
  const weights = ranked.map(({logit}) => Math.exp(logit - ranked[0].logit));
  const sum = weights.reduce((a,b) => a+b, 0);
  return ranked.slice(0,3).map(({move,san}, i) => ({
    move, san, probability:weights[i]/sum,
    scoreLabel:new Intl.NumberFormat('fr', {style:'percent',maximumFractionDigits:1}).format(weights[i]/sum),
    variation:'Probabilité estimée de jouer ce coup'
  }));
}

let worker, serial = 0;
const pending = new Map();
function reset(error) {
  worker?.terminate();
  worker = null;
  for (const {reject, timer} of pending.values()) {
    clearTimeout(timer);
    reject(error);
  }
  pending.clear();
}

export function analyzeMaia(fen, elo) {
  if (!worker) {
    worker = new Worker(new URL('./maia-worker.js', import.meta.url));
    worker.onerror = event => {
      console.error('Maia 3:', event.message);
      reset(new Error('Impossible de charger Maia 3. Recharge l’extension et réessaie.'));
    };
    worker.onmessage = ({data}) => {
      const request = pending.get(data.id);
      if (!request) return;
      pending.delete(data.id);
      clearTimeout(request.timer);
      if (data.error) request.reject(new Error(data.error));
      else request.resolve(data.lines);
    };
  }
  return new Promise((resolve, reject) => {
    const id = ++serial;
    const timer = setTimeout(() => reset(new Error('Maia 3 ne répond plus. Mets en pause puis redémarre les suggestions.')), 30000);
    pending.set(id, {resolve,reject,timer});
    worker.postMessage({id,fen,elo});
  });
}
