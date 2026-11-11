import test from 'node:test';
import assert from 'node:assert/strict';
import {readInfo,completeBatch,describeLines,squarePoint} from '../extension/core.js';
test('UCI : profondeur, score, mat, bornes',()=>{
  assert.equal(readInfo('info depth 9 score cp 12 lowerbound pv e2e4'),null);
  assert.deepEqual(readInfo('info depth 9 multipv 2 score mate -3 pv e2e4 e7e5'),{kind:'mate',score:-3,depth:9,index:2,pv:['e2e4','e7e5']});
});
test('ne mélange pas les profondeurs des variantes',()=>{
 const batches=new Map([[8,new Map([[1,{index:1,depth:8}],[2,{index:2,depth:8}]])],[9,new Map([[1,{index:1,depth:9}]])]]);
 assert.deepEqual(completeBatch(batches,2).map(l=>l.depth),[8,8]);
});
test('promotion, notation SAN et score du point de vue blanc',()=>{
 const line={pv:['a7a8q'],score:900,kind:'cp',depth:8,index:1};
 assert.equal(describeLines('7k/P7/8/8/8/8/8/7K w - - 0 1',[line])[0].san,'a8=Q+');
 const black=describeLines('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',[{...line,pv:['e7e5'],score:30}])[0];
 assert.equal(black.scoreLabel,'-0.30');
 assert.throws(()=>describeLines('7k/P7/8/8/8/8/8/7K w - - 0 1',[{...line,pv:['e2e4']}]));
});
test('coordonnées de flèche dans les deux orientations',()=>{
 assert.deepEqual(squarePoint('a1',false),[.5,7.5]);assert.deepEqual(squarePoint('a1',true),[7.5,.5]);
 assert.deepEqual(squarePoint('h8',true),[.5,7.5]);
});
