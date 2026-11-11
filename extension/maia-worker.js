/* global ort */
importScripts('./vendor/maia/ort.wasm.min.js');
const assets = new URL('./vendor/maia/', self.location.href);
ort.env.wasm.wasmPaths = assets.href;
ort.env.wasm.numThreads = 1;
ort.env.wasm.proxy = false;
let ready;
function initialize() {
  if (!ready) {
    ready = Promise.all([
      import('./vendor/chess.js'),
      import('./maia.js'),
      fetch(new URL('all_moves_maia3.json', assets)).then(response => response.json()),
      ort.InferenceSession.create(new URL('maia3.onnx', assets).href, {
        executionProviders:['wasm'], graphOptimizationLevel:'basic'
      })
    ]).catch(error => { ready = null; throw error; });
  }
  return ready;
}
let queue = Promise.resolve();
self.onmessage = ({data:{id,fen,elo}}) => {
  queue = queue.then(async () => {
    try {
      const [{Chess}, {maiaInputs,rankMaiaMoves}, vocabulary, session] = await initialize();
      const {tokens,moves} = maiaInputs(new Chess(fen), vocabulary);
      const rating = () => new ort.Tensor('float32', Float32Array.of(elo), [1]);
      const {logits_move} = await session.run({
        tokens:new ort.Tensor('float32', tokens, [1,64,12]),
        elo_self:rating(), elo_oppo:rating()
      }, ['logits_move']);
      self.postMessage({id,lines:rankMaiaMoves(moves, logits_move.data)});
    } catch (error) {
      console.error('Maia 3:', error);
      self.postMessage({id,error:'Calcul Maia 3 impossible. Mets en pause puis réessaie.'});
    }
  });
};
