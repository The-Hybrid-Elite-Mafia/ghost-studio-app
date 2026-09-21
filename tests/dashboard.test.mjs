import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../studio/dashboard.js',import.meta.url),'utf8');
function fixture(){
 const events={},nodes={},messages=[];let pauses=0;
 const node=id=>nodes[id]||=( {style:{},hidden:false,children:[],textContent:'',addEventListener(){},append(x){this.children.push(x)},replaceChildren(){this.children=[]},click(){},contentWindow:{postMessage(data,origin){messages.push({data,origin})}}} );
 const document={getElementById:node,body:{classList:{toggle(){}}},createElement:()=>node(crypto.randomUUID())};
 const window={location:{origin:'https://studio.test'},addEventListener:(type,fn)=>events[type]=fn};
 const context={window,document,localStorage:{getItem:()=>JSON.stringify({drafts:[{song:{songBrief:{title:'<script>malicious label</script>'}},created:'2026-09-16'}]})},setTimeout:()=>1,clearTimeout(){},console};
 vm.runInNewContext(source,context);
 const dash=window.GhostDashboard({engine:{tracks:[],pause(){pauses++;}},state:{name:'Actual session'},showView(){}});
 return {dash,nodes,node,events,messages,get pauses(){return pauses}};
}
const origin='https://studio.test';
test('dashboard reuses one radio frame and rejects forged sizing and playback messages',()=>{
 const f=fixture();f.dash.show('dashboard');const radio=f.nodes.dashboardRadio;assert.equal(radio.src,origin+'/radio?embed=studio');
 f.events.message({origin:'https://evil.invalid',source:radio.contentWindow,data:{type:'hem-radio-size',height:900}});assert.equal(radio.style.height,undefined);
 f.events.message({origin,source:{},data:{type:'hem-radio-play'}});assert.equal(f.pauses,0);
 f.events.message({origin,source:radio.contentWindow,data:{type:'hem-radio-size',height:Infinity}});assert.equal(radio.style.height,undefined);
 f.events.message({origin,source:radio.contentWindow,data:{type:'hem-radio-size',height:1600}});assert.equal(radio.style.height,'1600px');
 f.events.message({origin,source:radio.contentWindow,data:{type:'hem-radio-size',height:540}});assert.equal(radio.style.height,'540px','frame can shrink after closing upload or EQ');
 f.events.message({origin,source:radio.contentWindow,data:{type:'hem-radio-play'}});assert.equal(f.pauses,1);
 f.dash.show('studio');assert.equal(f.messages.at(-1).data.type,'hem-radio-pause');
 f.dash.show('dashboard');assert.equal(f.messages.at(-1).data.type,'hem-radio-measure');assert.equal(f.nodes.dashboardRadio,radio);
 assert.equal(f.nodes.dashboardSession.textContent,'Actual session');assert.equal(f.nodes.dashboardDrafts.children[0].textContent,'Lyrics are temporary. Copy or download before leaving Lyrics Creator.');
});
