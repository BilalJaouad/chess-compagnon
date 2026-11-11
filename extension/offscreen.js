import {createSession} from './engine.js';
const sessions=new Map();
chrome.runtime.onMessage.addListener(message=>{
  if(message?.target!=='offscreen')return;
  const {tabId,data}=message;
  const send=data=>chrome.runtime.sendMessage({target:'engine-result',tabId,data}).catch(()=>{});
  if(data.type==='release'){sessions.get(tabId)?.stop();sessions.delete(tabId);return;}
  if(data.type==='connect'){
    sessions.get(tabId)?.stop();sessions.set(tabId,createSession({postMessage:send}));send({type:'ready'});return;
  }
  if(data.type==='stop'){sessions.get(tabId)?.stop();return;}
  if(data.type==='analyze'){
    if(!sessions.has(tabId))sessions.set(tabId,createSession({postMessage:send}));
    sessions.get(tabId).analyze(data);
  }
});
