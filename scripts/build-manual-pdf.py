from pathlib import Path
import json, re, xml.etree.ElementTree as ET
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, KeepTogether, CondPageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.graphics.shapes import Drawing, Rect, Circle, String, Line
from reportlab.platypus.tableofcontents import TableOfContents
from xml.sax.saxutils import escape
root=Path(__file__).resolve().parents[1];out=root/'public/manual/Ghost-Studio-Illustrated-Manual.pdf'
chapters=json.loads((root/'studio/manual/chapters.json').read_text());defs=json.loads((root/'studio/manual/processor-reference.json').read_text())
styles=getSampleStyleSheet();styles.add(ParagraphStyle(name='BodyManual',fontName='Helvetica',fontSize=10.5,leading=14,spaceAfter=8));styles.add(ParagraphStyle(name='SmallManual',fontSize=8.5,leading=11,textColor=colors.HexColor('#355365'),spaceAfter=7));styles['Title'].fontSize=27;styles['Title'].leading=32;styles['Heading1'].fontSize=20;styles['Heading1'].leading=25;styles['Heading1'].spaceAfter=15
styles['Heading2'].fontSize=13;styles['Heading2'].leading=18
styles.add(ParagraphStyle(name='Cell',fontSize=9,leading=12,spaceAfter=0));styles.add(ParagraphStyle(name='WhiteCell',parent=styles['Cell'],textColor=colors.white))
def norm(s):return str(s).replace('→',' > ').replace('↗','').replace('↑','up').replace('−','-').replace('–','-').replace('—','-').replace('’',"'").replace('‘',"'").replace('“','"').replace('”','"').replace('×','x').replace('…','...')
def para(s,sty='BodyManual'):return Paragraph(escape(norm(s)),styles[sty])
def color(s):return colors.HexColor(s) if s and s!='none' else None
def drawing(path,width=528,maxheight=540):
 svg=ET.fromstring(path.read_text()); _,_,w,h=map(float,svg.attrib['viewBox'].split()); d=Drawing(w,h)
 for e in svg.iter():
  t=e.tag.split('}')[-1];a=e.attrib
  if t=='rect':d.add(Rect(float(a.get('x',0)),h-float(a.get('y',0))-float(a['height']),float(a['width']),float(a['height']),rx=float(a.get('rx',0)),fillColor=color(a.get('fill')),strokeColor=color(a.get('stroke')),strokeWidth=1))
  elif t=='circle':d.add(Circle(float(a['cx']),h-float(a['cy']),float(a['r']),fillColor=color(a.get('fill')),strokeColor=color(a.get('stroke'))))
  elif t=='text':d.add(String(float(a['x']),h-float(a['y']),norm(e.text or ''),fontName='Helvetica',fontSize=float(a.get('font-size',18)),fillColor=color(a.get('fill','#000000')),textAnchor=a.get('text-anchor','start')))
  elif t=='path':
   # Only step connector arrows are in generated diagrams.
   nums=re.findall(r'-?\d+(?:\.\d+)?',a.get('d',''))
   if len(nums)>=2:
    x,y=map(float,nums[:2]);d.add(Line(x,h-y,x,h-y-18,strokeColor=colors.HexColor('#6ce4cf')));d.add(Line(x-5,h-y-12,x,h-y-18,strokeColor=colors.HexColor('#6ce4cf')));d.add(Line(x+5,h-y-12,x,h-y-18,strokeColor=colors.HexColor('#6ce4cf')))
 scale=min(width/w,maxheight/h);d.scale(scale,scale);d.width=w*scale;d.height=h*scale;return d

def table(rows,headers=('Control or item','What it does'),widths=(138,390)):
 cells=[[para(x,'WhiteCell') for x in headers]]+[[para(x,'Cell') for x in row] for row in rows]
 t=Table(cells,colWidths=widths,repeatRows=1,hAlign='LEFT');t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#163749')),('VALIGN',(0,0),(-1,-1),'TOP'),('GRID',(0,0),(-1,-1),.4,colors.HexColor('#cbd4da')),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,colors.HexColor('#f0f5f7')]),('LEFTPADDING',(0,0),(-1,-1),8),('RIGHTPADDING',(0,0),(-1,-1),8),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7)]));return t
class Doc(SimpleDocTemplate):
 def afterFlowable(self,f):
  if isinstance(f,Paragraph) and f.style.name=='Heading1':
   key='section-'+str(self.seq.nextf('heading'));self.canv.bookmarkPage(key);self.canv.addOutlineEntry(f.getPlainText(),key,0);self.notify('TOCEntry',(0,f.getPlainText(),self.page,key))
def footer(canvas,doc):
 canvas.setFont('Helvetica',8);canvas.setFillColor(colors.HexColor('#536877'));canvas.drawString(42,25,'GHOST STUDIOS  |  Operating manual  |  19 September 2026');canvas.drawRightString(570,25,str(doc.page))
doc=Doc(str(out),pagesize=(612,792),rightMargin=42,leftMargin=42,topMargin=40,bottomMargin=44,title='Ghost Studio Illustrated Operating Manual',author='Hybrid Elite Mafia')
story=[para('Ghost Studio Illustrated Operating Manual','Title'),Spacer(1,20),para('Hybrid Elite Mafia'),para('A practical guide to the 3D rack, preset files, Full DAW, chains, radio, writing tools and all 27 DAW processor types.'),para('Start with the workspace map. Match the numbered diagrams to the control names on your screen, then follow the steps. Control diagrams simplify the layout; they are not screenshots.'),para('Keep a downloaded project backup before changing devices. A local browser save is not cloud sync. Rack presets, DAW plugins, projects and prompt text use different loaders.'),Spacer(1,10),drawing(root/'public/manual/app-map.svg',maxheight=380),para('Live app: https://ghost-daw-mobile.tthehybridelitemafia.chatgpt.site','SmallManual'),PageBreak(),para('Contents','Heading1')]
toc=TableOfContents();toc.levelStyles=[ParagraphStyle(name='TOCManual',fontSize=9.5,leading=13,spaceBefore=4)];story+=[toc,PageBreak()]
for i,c in enumerate(chapters,1):
 story += [para(f'{i}. {c["title"]}','Heading1'),para(c['where'],'SmallManual'),para(c['intro']),drawing(root/f'public/manual/{c["id"]}.svg',maxheight=330),para('Control map: numbers identify the labeled controls for this task.','SmallManual'),para('Follow these steps','Heading2')]
 story.append(table([[str(j),step] for j,step in enumerate(c['steps'],1)],headers=('Step','Action and result'),widths=(48,480)));story.append(Spacer(1,8))
 if c.get('rows'):story += [para('Control details','Heading2'),table(c['rows'])]
 if c.get('note'):story += [Spacer(1,10),para(c['note'])]
 story.append(CondPageBreak(360))
# Processor reference details generated from the same app definition data.
for n,(kind,d) in enumerate(defs.items(),1):
 story += [para('Processor '+str(n)+': '+d['name'],'Heading1'),para(d.get('description','')),para('Full DAW > Plugin workshop. New inserts start neutral and bypassed. Select the destination, insert the module, then enable and adjust it. A sound preset can engage processing.')]
 params=list(d['params'].items())
 # Use original control diagram when it remains legible; very large rack diagrams are explained section by section below.
 if len(params)<=14:story += [drawing(root/f'public/manual/plugin-{kind}.svg',maxheight=420),Spacer(1,8)]
 rows=[]
 for key,v in params:
  label=re.sub(r'([a-z])([A-Z])',r'\1 \2',key).replace('_',' / ')
  choices=d.get('choices',{}).get(key)
  rangeText=' / '.join(str(x[1]) for x in choices) if choices else f'{v[0]} to {v[1]} {v[3]}'
  rows.append([label,rangeText+'; neutral '+str(v[2])+' '+v[3],d.get('purposes',{}).get(key,'Adjusts the labeled parameter.')])
 story += [table(rows,('Control','Range and neutral','Purpose'),(126,174,228)),Spacer(1,10)]
 factories=d.get('factory',[])
 if factories:story.append(para('Factory presets: '+'; '.join(p['name'] for p in factories)))
 story.append(para('0 dB gain means unchanged level. Neutral frequency, timing and ratio values can be nonzero. Compare at matched listening levels; no preset can guarantee a correct mix for every source.'))
 story.append(CondPageBreak(360))
story += [para('Glossary','Heading1'),table([['Stem','A separate recorded part such as vocals, bass or drums.'],['Chain','An ordered set of processors; a prompt chain can instead be text instructions.'],['Bus / master','A shared signal path; the master receives the combined mix.'],['Bypass','Passes the original signal without that processor’s effect.'],['Wet / dry','Processed / original signal; Mix blends the two.'],['dBFS','Digital signal level relative to full scale.'],['LUFS / true peak','Loudness and reconstructed peak measures; this app does not certify mastering compliance.'],['MIDI','Note/performance instructions, not a recorded singer.'],['Preset','Saved parameter settings; the module and file format must match.'],['Project','Editable session state, potentially including source audio.'],['Automation','Parameter changes over session time.'],['Q','EQ bandwidth control; higher Q generally makes a narrower band.']]),Spacer(1,18),para('Finding the right help','Heading2'),para('For a problem, note the workspace, the button you tapped, the exact message and whether sound was playing. Download audio diagnostics from the Full DAW when applicable. Do not share API keys. The online manual has search and enlarged images.')]
doc.multiBuild(story,onFirstPage=footer,onLaterPages=footer)
print(out)
