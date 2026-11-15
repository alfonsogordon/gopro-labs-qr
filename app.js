const $=id=>document.getElementById(id);
const KEY='labsbuddy.v2';let db, presets=[];
try{presets=JSON.parse(localStorage.getItem(KEY+'.presets')||'[]')}catch{}
const opt=(v,t)=>{let e=document.createElement('option');e.value=v;e.textContent=t;return e};
const options=(id,arr)=>$(id).replaceChildren(...arr.map(x=>opt(x.value,x.label)));
const groups=[
['Recording','Mode',[['','Leave unchanged'],['mV','Video'],['mP','Photo'],['mT','Time-lapse video'],['mTP','Time-lapse photo'],['mTW','TimeWarp'],['mPB','Burst photo'],['mPN','Night photo'],['mNL','Night-lapse video'],['mNP','Night-lapse photo']]],
['Recording','Resolution',[['','Leave unchanged'],['r1','1080p 16:9'],['r1T','1440p 4:3'],['r2','2.7K 16:9'],['r2T','2.7K 4:3'],['r4','4K 16:9'],['r4T','4K 4:3'],['r4X','4K 8:7'],['r5','5K / 5.3K / MAX 5.6K'],['r5X','5.3K 8:7'],['r8','8K']]],
['Recording','Frame rate',[['','Leave unchanged'],...[24,25,30,50,60,100,120,200,240].map(n=>['p'+n,n+' fps'])]],
['Recording','Digital lens',[['','Leave unchanged'],['fW','Wide'],['fL','Linear'],['fS','SuperView'],['fV','HyperView'],['fH','Linear + Horizon Level'],['fN','Narrow'],['fM','Medium']]],
['Recording','HyperSmooth',[['','Leave unchanged'],['e0','Off'],['e1','On'],['e2','High'],['e3','Boost'],['e4','Auto']]],
['Protune','Bitrate',[['','Leave unchanged'],['b0','Standard'],['b1','High']]],
['Protune','Colour',[['','Leave unchanged'],['cF','Flat'],['cG','Vibrant / GoPro Color'],['cN','Natural']]],
['Protune','Colour depth',[['','Leave unchanged'],['d8','8-bit'],['d10','10-bit']]],
['Protune','White balance',[['','Leave unchanged'],['wA','Auto'],...[23,28,32,40,45,50,55,60,65].map(n=>['w'+n,(n*100)+'K']),['wN','Native']]],
['Protune','EV compensation',[['','Leave unchanged'],...[-2,-1.5,-1,-.5,0,.5,1,1.5,2].map(n=>['x'+(n===0?'0':String(n).replace('0.','.')),String(n)+' EV'])]],
['Protune','Sharpness',[['','Leave unchanged'],['sL','Low'],['sM','Medium'],['sH','High']]],
['Protune','Shutter angle',[['','Leave unchanged'],['0','Auto'],['360','360°'],['180','180°'],['90','90°'],['45','45°'],['22','22°'],['10','10°'],['5','5°'],['2','2°']]],
['Protune','ISO range',[['','Leave unchanged'],['i1M1','100 fixed'],['i2M1','100–200'],['i4M1','100–400'],['i8M1','100–800'],['i16M2','200–1600'],['i32M1','100–3200'],['i64M16','1600–6400']]],
['Labs','Custom bitrate (Mb/s)',{type:'number',min:1,max:999,prefix:'$BITR='}],
['Labs','Noise reduction (1–100)',{type:'number',min:1,max:100,prefix:'$NR01='}],
['Labs','Histogram',[['','Leave unchanged'],['$HIST=0','Off'],['$HIST=5','On (contrast 5)']]],
['Labs','Spirit level',[['','Leave unchanged'],['$LEVL=0','Off'],['$LEVL=6','On (size 6)']]],
['Labs','QR scanning during recording',[['','Leave unchanged'],['$QRDR=0','Off'],['$QRDR=1','On']]],
['Labs','Wireless',[['','Leave unchanged'],['oW0','Off'],['oW1','On']]],
['Labs','Disable audio',[['','Leave unchanged'],['$DAUD=0','Off'],['$DAUD=1','On']]],
['Labs','Wake on USB power',[['','Leave unchanged'],['$WAKE=0','Off'],['$WAKE=1','On']]]
];
const hero9Options={Resolution:['','r1','r1T','r2','r2T','r4','r4T','r5'], 'Frame rate':['','p24','p25','p30','p50','p60','p100','p120','p200','p240'], 'Digital lens':['','fW','fL','fS','fH','fN'],Colour:['','cF','cG'], 'HyperSmooth':['','e0','e1','e2','e3'], 'ISO range':['','i1M1','i2M1','i4M1','i8M1','i16M2','i32M1','i64M16']};
const compat={hero5session:{blocked:['Colour depth','Custom bitrate (Mb/s)','Noise reduction (1–100)','Spirit level']},hero7:{blocked:['Colour depth','Custom bitrate (Mb/s)','Noise reduction (1–100)']},hero8:{blocked:['Colour depth','Custom bitrate (Mb/s)','Noise reduction (1–100)']},hero9:{blocked:['Colour depth','Custom bitrate (Mb/s)','Noise reduction (1–100)']},max:{blocked:['Colour depth','Noise reduction (1–100)']}};
let fields=[];
function build(){const root=$('extraControls');root.replaceChildren();fields=[];for(const group of ['Recording','Protune','Labs']){const details=document.createElement('details');details.className='settingGroup';details.open=group==='Recording';const heading=document.createElement('summary');heading.textContent=group;details.append(heading);root.append(details);for(const [g,label,spec] of groups.filter(x=>x[0]===group)){const id='field'+fields.length;const wrap=document.createElement('div');const l=document.createElement('label');l.htmlFor=id;l.textContent=label;wrap.append(l);let e;if(Array.isArray(spec)){e=document.createElement('select');e.replaceChildren(...spec.map(x=>opt(x[0],x[1])))}else{e=document.createElement('input');e.type='number';e.min=spec.min;e.max=spec.max;e.placeholder='Leave unchanged'}e.id=id;e.addEventListener('input',updateSetting);e.addEventListener('change',updateSetting);wrap.append(e);details.append(wrap);fields.push({label,spec,e});}}}
function camera(){return db?.models.find(m=>m.id===$('camera').value)}
const modelCapabilities={
hero5session:{resolution:['r1','r1T','r2','r2T','r4'],lens:['fW','fL','fS','fN','fM'],color:['cF','cG'],depth:[],modes:['mV','mP','mT','mTP','mTW','mPB','mPN','mNL','mNP']},
hero7:{resolution:['r1','r1T','r2','r2T','r4','r4T'],lens:['fW','fL','fS','fN'],color:['cF','cG'],depth:[]},
hero8:{resolution:['r1','r1T','r2','r2T','r4','r4T'],lens:['fW','fL','fS','fN'],color:['cF','cG'],depth:[]},
hero9:{resolution:['r1','r1T','r2','r2T','r4','r4T','r5'],lens:['fW','fL','fS','fH','fN'],color:['cF','cG'],depth:[]},
hero10:{resolution:['r1','r1T','r2','r2T','r4','r4T','r5'],lens:['fW','fL','fS','fH'],color:['cF','cG','cN'],depth:[]},
hero10bones:{resolution:['r1','r1T','r2','r2T','r4','r4T','r5'],lens:['fW','fL','fS'],color:['cF','cG','cN'],depth:[]},
hero11:{resolution:['r1','r2','r2T','r4','r4T','r4X','r5','r5X'],lens:['fW','fL','fS','fV','fH'],color:['cF','cG','cN'],depth:['d8','d10']},
hero11mini:{resolution:['r1','r2','r2T','r4','r4T','r4X','r5','r5X'],lens:['fW','fL','fS','fV','fH'],color:['cF','cG','cN'],depth:['d8','d10']},
hero12:{resolution:['r1','r2','r2T','r4','r4T','r4X','r5','r5X'],lens:['fW','fL','fS','fV','fH'],color:['cF','cG','cN'],depth:['d8','d10']},
hero13:{resolution:['r1','r2','r2T','r4','r4T','r4X','r5','r5X'],lens:['fW','fL','fS','fV','fH'],color:['cF','cG','cN'],depth:['d8','d10']},
max:{resolution:['r3','r5'],lens:['fW'],color:['cF','cG'],depth:[]},
max2:{resolution:['r4','r5','r8'],lens:['fW'],color:['cF','cG','cN'],depth:['d8','d10']},
mission1:{resolution:['r1','r2','r4','r4V','r5','r8','r8T'],lens:['fW','fL'],color:['cF','cG','cN','cC','cL'],depth:['d8','d10']},
mission1pro:{resolution:['r1','r2','r4','r4V','r5','r8','r8T'],lens:['fW','fL'],color:['cF','cG','cN','cC','cL'],depth:['d8','d10']},
mission1proils:{resolution:['r1','r2','r4','r4V','r5','r8','r8T'],lens:['fW','fL'],color:['cF','cG','cN','cC','cL'],depth:['d8','d10']}
};
const extraModes=[['mVL','Video Looping'],['mST','Star Trails'],['mLP','Light Painting'],['mLT','Vehicle Lights'],['mVN','Night Video']];
const extraRes=[['r3','3K 360'],['r4V','4K Vertical'],['r8T','8K 4:3']];
const extraColors=[['cC','Cinematic'],['cL','GPLog2']];
groups.find(g=>g[1]==='Mode')[2].push(...extraModes);
groups.find(g=>g[1]==='Resolution')[2].push(...extraRes);
groups.find(g=>g[1]==='Colour')[2].push(...extraColors);
function profileAllowed(id,label){const p=modelCapabilities[id];if(!p)return null;const map={'Resolution':'resolution','Digital lens':'lens','Colour':'color','Colour depth':'depth','Mode':'modes'};if(label==='Mode'){const base=['mV','mP','mT','mTP','mTW','mPB','mPN','mNL','mNP'];const extra=id==='hero10'?['mL']:id.startsWith('mission')?['mVN','mST','mLP','mLT']:['hero11','hero12','hero13'].includes(id)?['mST','mLP','mLT']:[];return ['',...(p.modes||base),...extra]}const k=map[label];return k?['',...(p[k]||[])]:null}
const videoLabels=['Resolution','Frame rate','Digital lens','HyperSmooth'];
const hero9Matrix={
'r4T':{fps:['p24','p25','p30'],lens:['fW'],smooth:['e0','e1']},
'r2T':{fps:['p24','p25','p30','p50','p60'],lens:['fW'],smooth:['e0','e1']},
'r4':{fps:['p24','p25','p30','p50','p60'],lens:['fW'],smooth:['e0','e1']}
};
function field(name){return fields.find(f=>f.label===name)}
function setChoices(f,allowed){if(!f||!Array.isArray(f.spec))return;const old=f.e.value;const values=f.spec.filter(([value])=>!allowed||allowed.includes(value));f.e.replaceChildren(...values.map(([v,label])=>opt(v,label)));f.e.value=values.some(x=>x[0]===old)?old:''}
function applyConstraints(){const c=camera();if(!c)return;const hero=c.id==='hero9';const selected=field('Resolution').e.value;const recording=field('Mode').e.value;const video=!recording||recording==='mV';const matrix=hero?hero9Matrix[selected]:null;
for(const f of fields){let allowed=null;allowed=profileAllowed(c.id,f.label);if(hero&&hero9Options[f.label]&&!['Resolution','Digital lens'].includes(f.label))allowed=hero9Options[f.label];if(hero&&f.label==='Resolution')allowed=['',...Object.keys(hero9Matrix)];if(hero&&matrix&&f.label==='Frame rate')allowed=['',...matrix.fps];if(hero&&matrix&&f.label==='Digital lens')allowed=['',...matrix.lens];if(hero&&matrix&&f.label==='HyperSmooth')allowed=['',...matrix.smooth];if(hero&&f.label==='Shutter angle')allowed=['','0','360','180','90','45','22','10','5','2'];if(hero&&f.label==='Frame rate'&&!matrix)allowed=[''];if(hero&&f.label==='Digital lens'&&!matrix)allowed=[''];if(hero&&f.label==='HyperSmooth'&&!matrix)allowed=[''];if(!hero&&['Frame rate','HyperSmooth'].includes(f.label))allowed=[''];if(!video&&videoLabels.includes(f.label))allowed=[''];setChoices(f,allowed);const blocked=compat[c.id]?.blocked||[];f.e.disabled=blocked.includes(f.label)||(!hero&&['Frame rate','HyperSmooth'].includes(f.label))||(!video&&videoLabels.includes(f.label));if(f.e.disabled)f.e.value='';}
}
function refreshCamera(){const c=camera();if(!c)return;$('cameraInfo').textContent=c.notes+(c.id==='hero9'?' • Video combinations limited to the three currently mapped modes.':' • Model options shown; frame-rate combinations locked until verified.');for(const f of fields)f.e.value='';field('Mode').e.value='mV';applyConstraints();render()}
function updateSetting(e){if(e?.target===field('Mode')?.e||e?.target===field('Resolution')?.e)applyConstraints();render()}
function command(){let parts=[];const shutter=field('Shutter angle')?.e.value;const iso=field('ISO range')?.e.value;if(shutter!==''&&shutter!==undefined){if(!iso)return '';if(!camera()?.id.startsWith('mission')){const max=iso.match(/^i(\\d+)M/);if(!max)return '';}}for(const f of fields){if(f.e.disabled||f.e.value==='')continue;if(Array.isArray(f.spec)){if(f.label==='Shutter angle')continue;if(f.label==='ISO range'&&shutter!==''){const max=f.e.value.match(/^i(\\d+)M/);parts.push(max?'i'+max[1]+'S'+shutter:f.e.value)}else parts.push(f.e.value);}else{let n=Number(f.e.value);if(Number.isFinite(n)&&n>=f.spec.min&&n<=f.spec.max)parts.push(f.spec.prefix+n)}}return parts.join('')}
function render(){const code=command();const needsIso=field('Shutter angle')?.e.value!==''&&!field('ISO range')?.e.value;$('command').textContent=code||'Select settings below to generate a QR';$('qr').replaceChildren();if(!code){$('qr').textContent=needsIso?'Select ISO range first':'Select a setting';$('status').textContent=needsIso?'Shutter angle requires an ISO range. Selecting an angle sets ISO maximum but replaces the minimum ISO command.':'Only selected controls are encoded.';return}if(typeof QRCode==='undefined'){$('qr').textContent='QR library unavailable';return}try{new QRCode($('qr'),{text:code,width:256,height:256,colorDark:'#000',colorLight:'#fff',correctLevel:QRCode.CorrectLevel.M});$('status').textContent='Labs syntax generated. Confirm camera and firmware compatibility before use.'}catch(e){$('qr').textContent='QR too large; use fewer settings';$('status').textContent=e.message}}
function refreshPresets(){options('presets',[{value:'',label:'Choose a saved preset…'},...presets.map((p,i)=>({value:String(i),label:p.name}))])}
$('camera').addEventListener('change',refreshCamera);
$('save').addEventListener('click',()=>{const name=prompt('Preset name');if(!name)return;presets.push({name,camera:$('camera').value,values:fields.map(f=>f.e.value)});localStorage.setItem(KEY+'.presets',JSON.stringify(presets));refreshPresets()});
$('load').addEventListener('click',()=>{const p=presets[Number($('presets').value)];if(!p||$('presets').value==='')return;$('camera').value=p.camera;refreshCamera();fields.forEach((f,i)=>{if(!f.e.disabled)f.e.value=p.values[i]||''});applyConstraints();render()});
$('fullscreen').addEventListener('click',()=>{$('qr').requestFullscreen?.()});
(async()=>{try{build();const r=await fetch('./data/cameras.json');if(!r.ok)throw Error('Camera database unavailable');db=await r.json();options('camera',db.models.map(m=>({value:m.id,label:m.name})));refreshCamera();const modeField=fields.find(f=>f.label==='Mode');if(modeField)modeField.e.value='mV';render();refreshPresets()}catch(e){$('status').textContent=e.message}})();
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(console.warn);
