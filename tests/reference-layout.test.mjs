import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const source=await readFile(new URL('../studio/reference-layout.js',import.meta.url),'utf8');
function reference(){
 let contentHeight=900,visible=true,observer,frameId=0;
 const tasks=new Map(),events=new Map(),scrolls=[];
 const body={scrollHeight:20000,getBoundingClientRect:()=>({height:contentHeight})};
 const frame={style:{height:'600px'},clientTop:1,getClientRects:()=>visible?[{}]:[],getBoundingClientRect:()=>({top:240})};
 const parent={scrollY:100,getComputedStyle:()=>({borderTopWidth:'1px',borderBottomWidth:'1px'}),scrollTo:value=>scrolls.push(value.top)};
 const document={body,readyState:'complete',getElementById:id=>id==='tools'?{getBoundingClientRect:()=>({top:36})}:null,addEventListener:(name,fn)=>events.set(name,fn)};
 const window={document,frameElement:frame,parent,scrollY:0,
  getComputedStyle:()=>({marginTop:'0px',marginBottom:'0px'}),
  requestAnimationFrame:fn=>{tasks.set(++frameId,fn);return frameId;},cancelAnimationFrame:id=>tasks.delete(id),
  addEventListener:(name,fn)=>events.set(name,fn),scrollTo:()=>{window.scrollY=0;},
  ResizeObserver:class{constructor(fn){observer=fn;}observe(){}disconnect(){}}
 };
 vm.runInNewContext(source,{window,parseFloat});
 return {frame,window,scrolls,events,setHeight:value=>contentHeight=value,setVisible:value=>visible=value,
  resize:()=>observer(),pending:()=>tasks.size,flush:()=>{const batch=[...tasks.values()];tasks.clear();batch.forEach(fn=>fn());}};
}

test('reference windows grow and shrink with content instead of retaining a second viewport',()=>{
 const page=reference();page.flush();assert.equal(page.frame.style.height,'902px');
 page.setHeight(19000);page.resize();page.flush();assert.equal(page.frame.style.height,'19002px');
 page.setHeight(420);page.window.scrollY=85;page.resize();page.flush();
 assert.equal(page.frame.style.height,'422px');assert.equal(page.window.scrollY,0);
});

test('hidden pages keep their size and recalculate when reopened or resized',()=>{
 const page=reference();page.flush();page.setVisible(false);page.setHeight(0);page.resize();page.flush();
 assert.equal(page.frame.style.height,'902px');
 page.setVisible(true);page.setHeight(780);page.window.GhostReferenceLayout.refresh();page.events.get('resize')();page.resize();
 assert.equal(page.pending(),1);page.flush();assert.equal(page.frame.style.height,'782px');
});

test('opening and closing tools navigates the outer page after its height changes',()=>{
 const page=reference();page.flush();page.setHeight(2400);
 page.events.get('ghost-reference-navigate')({detail:{targetId:'tools'}});page.flush();
 assert.equal(page.frame.style.height,'2402px');assert.deepEqual(page.scrolls,[377]);
 page.events.get('ghost-reference-navigate')({detail:{targetId:'removed'}});page.flush();
 assert.deepEqual(page.scrolls,[377]);
});
