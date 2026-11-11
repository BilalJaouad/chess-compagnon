chrome.action.onClicked.addListener(async tab => {
  if (!tab.id || !/^https:\/\/(www\.)?chess\.com\//.test(tab.url || '')) {
    await chrome.tabs.create({url: chrome.runtime.getURL('welcome.html')});
    return;
  }
  try {
    await chrome.scripting.executeScript({target: {tabId: tab.id}, world: 'MAIN', files: ['bridge.js']});
    await chrome.scripting.executeScript({target: {tabId: tab.id}, files: ['content.js']});
    await chrome.action.setBadgeText({tabId:tab.id,text:''});
  } catch (error) {
    console.error(error);
    await chrome.action.setBadgeText({tabId:tab.id,text:'!'});
    await chrome.action.setTitle({tabId:tab.id,title:'Recharge cette page Chess.com, puis réessaie.'});
  }
});
let creating;
async function ensureEngine(){
  if(creating)return creating;
  creating=(async()=>{
    if(!await chrome.offscreen.hasDocument())await chrome.offscreen.createDocument({url:'offscreen.html',reasons:['WORKERS'],justification:'Calculer les suggestions avec Stockfish et Maia localement.'});
  })();
  try{await creating;}finally{creating=null;}
}
chrome.runtime.onMessage.addListener((message,sender,respond)=>{
  if(message?.target==='open-research' && sender.id===chrome.runtime.id){chrome.runtime.openOptionsPage();return;}
  if(message?.target==='engine-request' && sender.tab){
    (async()=>{
      await ensureEngine();
      await chrome.runtime.sendMessage({target:'offscreen',tabId:sender.tab.id,data:message.data});
    })().then(()=>respond({ok:true})).catch(e=>respond({error:e.message}));return true;
  }
  if(message?.target==='engine-result' && !sender.tab && sender.url===chrome.runtime.getURL('offscreen.html')){
    chrome.tabs.sendMessage(message.tabId,{target:'compagnon-result',data:message.data}).catch(()=>{});
  }
});
async function release(tabId){if(await chrome.offscreen.hasDocument())chrome.runtime.sendMessage({target:'offscreen',tabId,data:{type:'release'}}).catch(()=>{});}
chrome.tabs.onRemoved.addListener(release);
chrome.tabs.onUpdated.addListener((tabId,change)=>{if(change.status==='loading')release(tabId);});
