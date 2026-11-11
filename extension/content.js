(async () => {
  const existing=document.getElementById('chess-compagnon');
  if(existing) {existing.dispatchEvent(new Event('compagnon-close'));return;}
  const host=document.createElement('div');host.id='chess-compagnon';
  document.documentElement.append(host);
  const root=host.attachShadow({mode:'open'});
  root.innerHTML=`
  <style>
  :host{all:initial;color-scheme:dark;font-family:Inter,Segoe UI,sans-serif}
  *{box-sizing:border-box}button,select,input{font:inherit}button,select{cursor:pointer}
  .panel{position:fixed;right:24px;top:112px;width:318px;max-width:calc(100vw - 16px);max-height:calc(100vh - 24px);overflow:auto;background:#171d26;color:#edf2f8;border:1px solid #364151;border-radius:18px;box-shadow:0 16px 60px #0008;z-index:2147483646;font:14px/1.45 Inter,Segoe UI,sans-serif}
  header{display:flex;align-items:center;gap:10px;padding:17px 18px 13px;cursor:move;user-select:none;touch-action:none}
  .logo{display:grid;place-items:center;width:34px;height:34px;background:#b6ed85;color:#182416;border-radius:10px;font-size:27px}
  .brand{font-size:15px;font-weight:750;letter-spacing:-.3px}.sub{font-size:10px;letter-spacing:1.5px;color:#98aa99;text-transform:uppercase}
  .close{margin-left:auto;border:0;color:#b5c1d1;background:transparent;font-size:23px;padding:0 4px}
  .body{padding:0 18px 18px}.status{min-height:38px;color:#a7b7c9;font-size:12px;padding:6px 0 10px}
  .row{display:flex;gap:8px}.field{flex:1;min-width:0}[hidden]{display:none!important}label{display:block;color:#9daaba;font-size:11px;margin:0 0 5px}select{width:100%;padding:8px;border:1px solid #3b4554;border-radius:7px;background:#222c39;color:#e5edf5;font-size:12px}
  .profile-block{margin-top:12px}.profile-options{margin-top:10px}.profile-options[hidden]{display:none}.profile-options input[type=number]{width:100%;padding:8px;border:1px solid #3b4554;border-radius:7px;background:#222c39;color:#e5edf5;font-size:12px}.level-note{font-size:10px;color:#a6b7c9;margin:8px 0}
  .start{margin:14px 0;width:100%;border:0;border-radius:9px;background:#b6ed85;color:#172513;padding:11px;font-size:13px;font-weight:750}.start.running{background:#2b3745;color:#e5edf5}
  .empty{border:1px dashed #3b4655;border-radius:10px;padding:22px 16px;font-size:13px;color:#97a8bb;text-align:center}
  .candidate{display:block;width:100%;text-align:left;margin:7px 0;padding:12px;border:1px solid #333f4e;border-radius:10px;background:#202a36;color:inherit}.candidate.selected{border-color:#b6ed85;background:#25352b}
  .candidate-top{display:flex;align-items:center;gap:10px}.rank{font-size:10px;color:#8a9bb0}.move{font-size:21px;font-weight:750;letter-spacing:-.5px}.score{margin-left:auto;background:#151e27;border-radius:5px;padding:3px 6px;font-size:13px;font-variant-numeric:tabular-nums;color:#c7eda6}
  .pv{color:#9caec0;font-size:11px;margin-top:5px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.meta{color:#8da0b4;font-size:10px;margin:9px 0}
  .check{display:flex;align-items:center;gap:7px;color:#b8c4d2;font-size:12px;margin-top:12px}.check input{accent-color:#b6ed85}
  details{border-top:1px solid #303b4b;margin-top:14px;padding-top:11px;font-size:11px;color:#94a6b9}summary{cursor:pointer}.fen{width:100%;height:55px;resize:vertical;background:#101720;color:#afbed0;border:1px solid #344252;border-radius:6px;margin-top:10px;font:10px/1.5 monospace;padding:7px}.copy{background:#273442;color:#cdd8e5;border:1px solid #3a4757;padding:5px 9px;border-radius:5px;font:11px Segoe UI;margin-top:5px}.hint{font-size:10px;color:#7e8f9f;margin-top:13px}.hint a{color:#a1ba91}
  svg.arrows{position:fixed;pointer-events:none;z-index:2147483645;overflow:visible}
  button:focus-visible,select:focus-visible,summary:focus-visible{outline:2px solid #b6ed85;outline-offset:3px}
  </style>
  <section class="panel" aria-label="Chess Compagnon">
    <header><span class="logo">♞</span><div><div class="brand">Chess Compagnon</div><div class="sub">Stockfish · local</div></div><button class="close" title="Fermer" aria-label="Fermer">×</button></header>
    <div class="body"><div class="status" role="status" aria-live="polite">Connexion au moteur local…</div>
    <div class="row"><div class="field"><label for="engine">Moteur</label><select id="engine"><option value="stockfish">Stockfish</option><option value="maia">Maia 3</option></select></div><div class="field"><label for="side">Camp conseillé</label><select id="side"><option value="both">Les deux camps</option><option value="w">Blancs</option><option value="b">Noirs</option></select></div></div>
    <div class="profile-block maia-options" hidden><label for="maia-elo">Profil Maia · Elo</label><select id="maia-elo"></select><p class="level-note">Maia prédit les coups de joueurs à ce niveau. Les pourcentages indiquent la fréquence estimée du coup.</p></div>
    <div class="profile-block stockfish-time"><label for="time">Temps de calcul</label><select id="time"><option value="300">Rapide · 0,3 s</option><option value="1000" selected>Normal · 1 s</option><option value="3000">Précis · 3 s</option></select></div>
    <div class="profile-block stockfish-profile"><label for="mode">Style de calcul</label><select id="mode"><option value="level" selected>Niveau cible · adversaire + marge</option><option value="full">Analyse maximale · 3 variantes</option></select>
    <div class="profile-options"><div class="row"><div class="field"><label for="opponent">Classement adverse</label><input id="opponent" type="number" min="100" max="3500" step="50" value="1500"></div><div class="field"><label for="margin">Marge souhaitée</label><input id="margin" type="number" min="0" max="400" step="25" value="100"></div></div><label class="check"><input id="paced" type="checkbox" checked>Réflexion variable · 2 à 6 s</label><p class="level-note">Cible moteur approximative. La victoire et un comportement humain ne sont pas garantis.</p></div></div>
    <button class="start" disabled>Démarrer les suggestions</button>
    <div class="results"><div class="empty">Les meilleurs coups apparaîtront ici, avec une flèche sur l’échiquier.</div></div>
    <div class="meta">Évaluations du point de vue des Blancs.</div>
    <label class="check"><input id="arrows" type="checkbox" checked>Afficher la flèche sur l’échiquier</label>
    <details><summary>Position détectée</summary><textarea class="fen" readonly aria-label="Position FEN"></textarea><button class="copy">Copier la FEN</button></details>
    <button class="copy research">Research · résultats d’expérience</button>
    <div class="hint">Pour l’analyse et les parties contre les bots. <a href="https://support.chess.com/en/articles/8568369-what-do-i-need-to-know-about-fair-play-on-chess-com" target="_blank" rel="noopener noreferrer">Règles Chess.com</a></div>
    </div>
  </section><svg class="arrows" viewBox="0 0 8 8" aria-hidden="true"></svg>`;
  const $=s=>root.querySelector(s), panel=$('.panel'), status=$('.status'), results=$('.results'), arrow=$('.arrows');
  let active=false, closed=false, connected=false, board=null, fen='', lastKey='', requestId=0, lines=[], selected=0, port;
  let displayTimer=null,requestStarted=0,resultProfile=null;
  const {squarePoint}=await import(chrome.runtime.getURL('core.js'));
  const {normalizeProfile,reflectionMs}=await import(chrome.runtime.getURL('play-profile.js'));
  const {MAIA_LEVELS,normalizeMaiaElo}=await import(chrome.runtime.getURL('maia.js'));
  const saved=await chrome.storage.local.get('compagnonSettings');
  for(const elo of MAIA_LEVELS)$('#maia-elo').add(new Option(`${elo} Elo`,elo));
  $('#engine').value=saved.compagnonSettings?.engine==='maia'?'maia':'stockfish';
  $('#maia-elo').value=normalizeMaiaElo(saved.compagnonSettings?.maiaElo);
  if(saved.compagnonSettings) {const s=saved.compagnonSettings;if(['w','b','both'].includes(s.side))$('#side').value=s.side;if([300,1000,3000].includes(s.ms))$('#time').value=String(s.ms);$('#arrows').checked=s.arrows!==false;}
  if(saved.compagnonSettings?.profile){const p=normalizeProfile(saved.compagnonSettings.profile);$('#mode').value=p.mode;$('#opponent').value=p.opponent;$('#margin').value=p.margin;$('#paced').checked=p.paced;}
  function profileValues(){return normalizeProfile({mode:$('#mode').value,opponent:$('#opponent').value,margin:$('#margin').value,paced:$('#paced').checked});}
  const isMaia=()=>$('#engine').value==='maia';
  const engineLabel=()=>isMaia()?'Maia 3':'Stockfish';
  const metaLabel=()=>isMaia()?'Probabilités de jeu estimées par Maia.':'Évaluations du point de vue des Blancs.';
  function updateProfileControls(){const p=profileValues();$('#opponent').value=p.opponent;$('#margin').value=p.margin;$('.profile-options').hidden=p.mode!=='level';$('.stockfish-profile').hidden=isMaia();$('.stockfish-time').hidden=isMaia();$('.maia-options').hidden=!isMaia();$('.sub').textContent=engineLabel()+' · local';}
  updateProfileControls();
  $('.meta').textContent=metaLabel();
  function save(){chrome.storage.local.set({compagnonSettings:{engine:$('#engine').value,maiaElo:normalizeMaiaElo($('#maia-elo').value),side:$('#side').value,ms:Number($('#time').value),arrows:$('#arrows').checked,profile:profileValues()}});}
  function empty(text){results.replaceChildren();const el=document.createElement('div');el.className='empty';el.textContent=text;results.append(el);}
  function clear(){clearTimeout(displayTimer);displayTimer=null;resultProfile=null;lines=[];arrow.replaceChildren();$('.meta').textContent=metaLabel();}
  function draw(){
    arrow.replaceChildren();
    if(!active || document.hidden || !board || !lines[selected] || !$('#arrows').checked)return;
    const r=board.getBoundingClientRect();if(r.width<80)return;
    Object.assign(arrow.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'});
    const move=lines[selected].move;if(!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(move))return;
    const flipped=board.classList.contains('flipped') || board.getAttribute('orientation')==='black';
    const [x1,y1]=squarePoint(move.slice(0,2),flipped),[x2,y2]=squarePoint(move.slice(2,4),flipped);
    const angle=Math.atan2(y2-y1,x2-x1), len=Math.hypot(x2-x1,y2-y1),end=len-.12;
    const points=[[.05,-.10],[end-.40,-.10],[end-.40,-.26],[end,0],[end-.40,.26],[end-.40,.10],[.05,.10]].map(([x,y])=>`${x1+x*Math.cos(angle)-y*Math.sin(angle)},${y1+x*Math.sin(angle)+y*Math.cos(angle)}`).join(' ');
    const polygon=document.createElementNS('http://www.w3.org/2000/svg','polygon');polygon.setAttribute('points',points);polygon.setAttribute('fill','#b6ed85');polygon.setAttribute('stroke','#20361c');polygon.setAttribute('stroke-width','.025');polygon.setAttribute('opacity','.9');arrow.append(polygon);
  }
  function render(){
    results.replaceChildren();
    lines.forEach((line,i)=>{
      const button=document.createElement('button');button.className='candidate'+(i===selected?' selected':'');button.title='Afficher ce coup sur l’échiquier';
      const top=document.createElement('div');top.className='candidate-top';
      for(const [cls,text] of [['rank',String(i+1).padStart(2,'0')],['move',line.san],['score',line.scoreLabel]]){const el=document.createElement('span');el.className=cls;el.textContent=text;top.append(el);}
      const pv=document.createElement('div');pv.className='pv';pv.textContent=line.variation;button.append(top,pv);
      button.addEventListener('click',()=>{selected=i;render();draw();});results.append(button);
    });
    if(isMaia()){$('.meta').textContent=`Maia 3 · ${$('#maia-elo').value} Elo · Probabilités des coups`;return;}
    $('.meta').textContent=`Profondeur ${lines[0]?.depth||'—'} · Évaluation pour les Blancs`;
    if(resultProfile?.mode==='level')$('.meta').textContent=`Cible moteur ${resultProfile.target}${resultProfile.clamped?` (demandée ${resultProfile.requested}, limitée par le moteur)`:''} · coup à force réduite · évaluation Blancs`;
  }
  function tick(){
    if(closed)return;
    const candidates=[...document.querySelectorAll('wc-chess-board,chess-board')].filter(b=>{const r=b.getBoundingClientRect();return r.width>100&&r.height>100});
    const nextBoard=candidates.sort((a,b)=>b.clientWidth-a.clientWidth)[0]||null;
    const nextFen=nextBoard?.getAttribute('data-compagnon-fen')||'';
    if(nextBoard!==board || nextFen!==fen){board=nextBoard;fen=nextFen;lastKey='';requestId++;port?.postMessage({type:'stop'});clear();$('.fen').value=fen;if(active)empty('Lecture de la nouvelle position…');}
    if(!active){status.textContent=connected?(board?'Prêt · échiquier détecté':'Ouvre un échiquier Chess.com'):'Connexion au moteur local…';return;}
    if(document.hidden)return;
    if(!board || !fen){status.textContent=board?'Lecture de position indisponible':'En attente d’un échiquier…';clear();empty(board?'Recharge la page puis rouvre le panneau.':'Ouvre une analyse ou une partie contre un bot.');return;}
    const turn=fen.split(' ')[1],side=$('#side').value;
    if(side!=='both' && turn!==side){status.textContent='En attente du camp choisi';clear();empty(`Trait aux ${turn==='w'?'Blancs':'Noirs'}. Le moteur est en veille.`);return;}
    const profile=profileValues(),engine=$('#engine').value,elo=normalizeMaiaElo($('#maia-elo').value),key=JSON.stringify([fen,engine,elo,$('#time').value,profile]);
    if(connected && key!==lastKey){
      lastKey=key;requestId++;clear();status.textContent=`Calcul pour les ${turn==='w'?'Blancs':'Noirs'}…`;empty(engineLabel()+' analyse la position…');
      requestStarted=performance.now();port.postMessage({type:'analyze',id:requestId,fen,engine,elo,ms:Number($('#time').value),profile});
    }
    draw();
  }
  port={postMessage:data=>chrome.runtime.sendMessage({target:'engine-request',data}).then(result=>{if(result?.error&&!closed&&(data.id===undefined||data.id===requestId)){status.textContent='Moteur indisponible';empty(result.error);}}).catch(()=>{if(!closed)status.textContent='Extension rechargée : actualise cette page.';}),close:()=>{}};
  function receive(message){
      if(message?.target!=='compagnon-result')return;
      const data=message.data;
      if(closed)return;
      if(data.type==='ready'){connected=true;$('.start').disabled=false;tick();return;}
      if(data.type==='fatal'){status.textContent=data.error;empty(data.error);clear();return;}
      if(!active || data.id!==requestId || (data.fen && data.fen!==fen))return;
      if(data.type==='error'){status.textContent='Analyse indisponible';empty(data.error);clear();return;}
      if(data.type==='result'){
        const show=()=>{displayTimer=null;tick();if(closed||!active||document.hidden||data.id!==requestId||data.fen!==fen)return;lines=data.lines;resultProfile=data.profile;selected=0;status.textContent=data.terminal||`Trait aux ${fen.split(' ')[1]==='w'?'Blancs':'Noirs'} · ${lines.length} suggestion${lines.length>1?'s':''}`;if(lines.length){render();draw();}else{empty(data.terminal||'Aucun coup légal');clear();}};
        const remaining=data.lines.length&&data.engine!=='maia'?Math.max(0,reflectionMs(data.profile||profileValues(),data.legalCount)-(performance.now()-requestStarted)):0;
        if(remaining>0){status.textContent='Réflexion · délai expérimental';empty(`Suggestion dans environ ${Math.ceil(remaining/1000)} s…`);displayTimer=setTimeout(show,remaining);}else show();
      }
  }
  chrome.runtime.onMessage.addListener(receive);
  port.postMessage({type:'connect'});
  const timer=setInterval(tick,350);
  const connectionTimer=setTimeout(()=>{if(!connected&&!closed){status.textContent='Connexion impossible';empty('Le navigateur a bloqué le moteur. Recharge la page et rouvre l’extension.');}},12000);
  $('.start').addEventListener('click',()=>{
    active=!active;lastKey='';requestId++;clear();
    $('.start').textContent=active?'Mettre en pause':'Démarrer les suggestions';$('.start').classList.toggle('running',active);
    if(!active){port?.postMessage({type:'stop'});empty('En pause. Le moteur est arrêté.');}tick();
  });
  for(const selector of ['#engine','#maia-elo','#side','#time','#mode','#opponent','#margin','#paced'])$(selector).addEventListener('change',()=>{updateProfileControls();save();lastKey='';requestId++;port?.postMessage({type:'stop'});clear();if(!active)empty('Démarre les suggestions pour utiliser '+engineLabel()+'.');tick();});
  $('#arrows').addEventListener('change',()=>{save();draw();});
  $('.research').addEventListener('click',()=>chrome.runtime.sendMessage({target:'open-research'}));
  $('.copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(fen);$('.copy').textContent='Copiée';}catch{$('.fen').select();$('.copy').textContent='Ctrl+C pour copier';}});
  function visibility(){if(document.hidden){requestId++;lastKey='';clear();port?.postMessage({type:'stop'});}else tick();}
  function close(){closed=true;clear();clearInterval(timer);clearTimeout(connectionTimer);port?.postMessage({type:'release'});chrome.runtime.onMessage.removeListener(receive);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('scroll',draw,true);window.removeEventListener('resize',draw);host.remove();}
  host.addEventListener('compagnon-close',close);$('.close').addEventListener('click',close);
  document.addEventListener('visibilitychange',visibility);window.addEventListener('scroll',draw,true);window.addEventListener('resize',draw);
  const header=$('header');let drag;
  header.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;const r=panel.getBoundingClientRect();drag={x:e.clientX-r.left,y:e.clientY-r.top};header.setPointerCapture(e.pointerId);});
  header.addEventListener('pointermove',e=>{if(!drag)return;panel.style.right='auto';panel.style.left=Math.max(8,Math.min(innerWidth-panel.offsetWidth-8,e.clientX-drag.x))+'px';panel.style.top=Math.max(8,Math.min(innerHeight-panel.offsetHeight-8,e.clientY-drag.y))+'px';});
  header.addEventListener('pointerup',()=>drag=null);header.addEventListener('pointercancel',()=>drag=null);
  tick();
})().catch(error=>{console.error('Chess Compagnon',error);document.getElementById('chess-compagnon')?.remove();});
