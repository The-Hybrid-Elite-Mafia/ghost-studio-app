import ts from 'typescript';
function replaceOnce(text,needle,value,label){if(text.split(needle).length!==2)throw Error('Workflow integration point changed: '+label);return text.replace(needle,value);}
const jsx=(source,key)=>'l.jsx(GhostWorkflowLink,{source:'+JSON.stringify(source)+',entryKey:'+key+'})';
export function enhanceHem(html){
 const transforms={
  CA:()=>`function GhostWorkflowLink({source,entryKey}){return l.jsx("button",{type:"button",className:"ghost-chain-link",onClick:()=>window.GhostChainBridge.open(source,entryKey),children:"Workflow & chains"})}function CA(){const host=k.useRef(null);k.useEffect(()=>window.GhostChainBridge.mount(host.current),[]);return l.jsx("div",{ref:host,"data-workflow-library":"all"})}`,
  di:text=>replaceOnce(text,'s&&l.jsx(Se.div',jsx('reference-name','e')+',s&&l.jsx(Se.div','reference cards'),
  dl:text=>replaceOnce(text,'children:[l.jsx("button",{className:"w-full px-4 py-2','children:['+jsx('plugin-reference','e.name')+',l.jsx("button",{className:"w-full px-4 py-2','plugin cards'),
  Xj:text=>replaceOnce(text,'children:r.shortDescription})','children:r.shortDescription}),'+jsx('vocal','r.id'),'vocal profile'),
  MA:text=>replaceOnce(text,'e&&l.jsx("button",{onClick:()=>e(d)',jsx('genre','d')+',e&&l.jsx("button",{onClick:()=>e(d)','genre explorer'),
  AA:text=>replaceOnce(text,'e&&l.jsx("button",{onClick:()=>e(g)',jsx('beat-builder','g')+',e&&l.jsx("button",{onClick:()=>e(g)','beat builder'),
  BA:text=>replaceOnce(text,'e&&l.jsx("button",{onClick:()=>e(y)',jsx('voice-builder','y')+',e&&l.jsx("button",{onClick:()=>e(y)','vocal builder'),
  oA:text=>replaceOnce(text,'children:[t," / ",r]}),','children:[t," / ",r]}),'+jsx('signature','t+":"+r')+',','signature instrument'),
  rVocals:text=>replaceOnce(text,'c.appendChild(head);','c.appendChild(head);c.appendChild(window.GhostChainBridge.button("voice",v.n));','voice cards'),
  rBeats:text=>replaceOnce(text,'w.appendChild(btn);','w.appendChild(btn);w.appendChild(window.GhostChainBridge.button("beat",b.n));','beat cards'),
  rGenres:text=>replaceOnce(text,'t.appendChild(b);','var pair=document.createElement("span");pair.appendChild(b);pair.appendChild(window.GhostChainBridge.button("genre",g,"Chain guide"));t.appendChild(pair);','genre cards'),
  rPresets:text=>replaceOnce(text,'hd2.appendChild(ca);','hd2.appendChild(ca);hd2.appendChild(window.GhostChainBridge.button("preset",p.id));','preset details'),
  rPlugins:text=>replaceOnce(text,'bd.appendChild(c);','c.appendChild(window.GhostChainBridge.button("tool",p.n));bd.appendChild(c);','tool cards'),
  rBuilder:text=>replaceOnce(text,'bd.appendChild(row);','bd.appendChild(row);if(state.bGenre)bd.appendChild(window.GhostChainBridge.button("genre",state.bGenre,"Genre workflow"));if(state.bBeat)bd.appendChild(window.GhostChainBridge.button("beat",state.bBeat.n,"Beat workflow"));if(state.bVocal)bd.appendChild(window.GhostChainBridge.button("voice",state.bVocal.n,"Vocal workflow"));','compiled builder')
 };
 const found=new Set();
 html=html.replace(/(<script\b[^>]*>)([\s\S]*?)(<\/script>)/gi,(whole,start,source,end)=>{
  const file=ts.createSourceFile('hem-page.js',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS),edits=[];
  function visit(n){if(ts.isFunctionDeclaration(n)&&transforms[n.name?.text]){const name=n.name.text;if(found.has(name))throw Error('Duplicate integration function '+name);found.add(name);edits.push({start:n.getStart(file),end:n.end,text:transforms[name](n.getText(file))});}ts.forEachChild(n,visit);}visit(file);
  for(const edit of edits.sort((a,b)=>b.start-a.start))source=source.slice(0,edit.start)+edit.text+source.slice(edit.end);
  return start+source+end;
 });
 for(const name of Object.keys(transforms))if(!found.has(name))throw Error('Missing workflow integration '+name);
 return html;
}
