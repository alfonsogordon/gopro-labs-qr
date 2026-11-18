const $=id=>document.getElementById(id);
const KEY='labsbuddy.v2';let db, presets=[];
try{presets=JSON.parse(localStorage.getItem(KEY+'.presets')||'[]')}catch{}
const opt=(v,t)=>{let e=document.createElement('option');e.value=v;e.textContent=t;return e};
const options=(id,arr)=>$(id).replaceChildren(...arr.map(x=>opt(x.value,x.label)));
const groups=[
['Recording','Default mode on power-up',[['','Leave unchanged'],['dL','Last used'],['dV','Video'],['dP','Photo'],['dT','Time-lapse']]],
['Recording','Mode',[['','Leave unchanged'],['m3','360° (MAX)'],['mH','HERO (MAX)'],['mHF','HERO front (MAX)'],['mHR','HERO rear (MAX)'],['mV','Video'],['mP','Photo'],['mT','Time-lapse video'],['mTP','Time-lapse photo'],['mTW','TimeWarp'],['mPB','Burst photo'],['mPN','Night photo'],['mNL','Night-lapse video'],['mNP','Night-lapse photo']]],
['Recording','Resolution',[['','Leave unchanged'],['r1','1080p 16:9'],['r1T','1440p 4:3'],['r2','2.7K 16:9'],['r2T','2.7K 4:3'],['r4','4K 16:9'],['r4T','4K 4:3'],['r4X','4K 8:7'],['r5','5K / 5.3K / MAX 5.6K'],['r5X','5.3K 8:7'],['r8','8K']]],
['Recording','Frame rate',[['','Leave unchanged'],...[24,25,30,50,60,100,120,200,240].map(n=>['p'+n,n+' fps'])]],
['Recording','Digital lens',[['','Leave unchanged'],['fW','Wide'],['fL','Linear'],['fS','SuperView'],['fV','HyperView'],['fH','Linear + Horizon Level'],['fN','Narrow'],['fM','Medium']]],
['Recording','Exposure lock',[['','Leave unchanged'],['eL0','Off'],['eL1','On'],...[2,3,4,5,6,7,8,9].map(n=>['eL'+n,'Lock after '+n+' seconds'])]],
['Recording','Hindsight',[['','Leave unchanged'],['hS0','Off'],['hS1','15 seconds'],['hS2','30 seconds']]],
['Recording','Raw audio processing',[['','Leave unchanged'],['aL','Low'],['aM','Medium'],['aH','High']]],
['Recording','HyperSmooth',[['','Leave unchanged'],['e0','Off'],['e1','On'],['e2','High'],['e3','Boost'],['e4','Auto']]],
['Recording','Time-lapse interval',[['','Leave unchanged'],['p2','0.5 seconds'],['p1','1 second'],['p.2','2 seconds'],['p.5','5 seconds'],['p.10','10 seconds'],['p.30','30 seconds'],['p.60','1 minute'],['p.120','2 minutes'],['p.300','5 minutes'],['p.1800','30 minutes'],['p.3600','1 hour']]],
['Recording','RAW photos',[['','Leave unchanged'],['r','On'],['r0','Off']]],
['Recording','Night photo shutter',[['','Leave unchanged'],['eA','Auto'],['e2','2 seconds'],['e5','5 seconds'],['e10','10 seconds'],['e15','15 seconds'],['e20','20 seconds'],['e30','30 seconds']]],
['Protune','Bitrate',[['','Leave unchanged'],['b0','Standard'],['b1','High'],['b2','Maximum (MISSION)'],['bS','Standard/Low (MISSION)'],['bH','High (MISSION)'],['bM','Max1 (MISSION)']]],
['Protune','Colour',[['','Leave unchanged'],['cF','Flat'],['cG','Vibrant / GoPro Color'],['cN','Natural']]],
['Protune','Colour depth',[['','Leave unchanged'],['d8','8-bit'],['d10','10-bit']]],
['Protune','White balance',[['','Leave unchanged'],['wA','Auto'],...[23,28,32,40,45,50,55,60,65].map(n=>['w'+n,(n*100)+'K']),['wN','Native']]],
['Protune','EV compensation',[['','Leave unchanged'],...[-2,-1.5,-1,-.5,0,.5,1,1.5,2].map(n=>['x'+(n===0?'0':String(n).replace('0.','.')),String(n)+' EV'])]],
['Protune','Sharpness',[['','Leave unchanged'],['sL','Low'],['sM','Medium'],['sH','High']]],
['Protune','Shutter angle',[['','Leave unchanged'],['0','Auto'],['360','360°'],['180','180°'],['90','90°'],['45','45°'],['22','22°'],['10','10°'],['5','5°'],['2','2°']]],
['Protune','MISSION ISO',[['','Leave unchanged'],...['1','2','4','8','16','32','64'].map(n=>['i'+n,'Maximum '+Number(n)*100]),...['1','2','4','8','16','32','64'].map(n=>['i'+n+'M'+n,'Fixed '+Number(n)*100])]],
['Protune','MISSION shutter',[['','Leave unchanged'],['s0','Auto'],['s360','360°'],['s180','180°'],['s90','90°'],['s45','45°'],['s22','22°'],['s11','11°']]],
['Protune','ISO range',[['','Leave unchanged'],['i1M1','100 fixed'],['i2M1','100–200'],['i4M1','100–400'],['i8M1','100–800'],['i16M2','200–1600'],['i32M1','100–3200'],['i64M16','1600–6400']]],
['Protune','Noise reduction preset',[['','Leave unchanged'],['oN0','High'],['oN1','Medium'],['oN2','Low']]],

['Labs','Custom bitrate (Mb/s)',{type:'number',min:1,max:999,prefix:'$BITR='}],
['Labs','Noise reduction (1–100)',{type:'number',min:1,max:100,prefix:'$NR01='}],
['Labs','Histogram',[['','Leave unchanged'],['$HIST=0','Off'],['$HIST=5','On (contrast 5)']]],
['Labs','Spirit level',[['','Leave unchanged'],['$LEVL=0','Off'],['$LEVL=6','On (size 6)']]],
['Labs','QR scanning during recording',[['','Leave unchanged'],['$QRDR=0','Off'],['$QRDR=1','On']]],
['Camera','Orientation',[['','Leave unchanged'],['oR0','Auto'],['oR1','Up'],['oR2','Down'],['oR3','Right']]],
['Camera','Daylight saving',[['','Leave unchanged'],['oTD0','Off'],['oTD1','On']]],
['Camera','Language',[['','Leave unchanged'],['oL0','English (US)'],['oL01','English (UK)'],['oL02','English (AU)'],['oL03','English (India)'],['oL1','German'],['oL2','French'],['oL3','Italian'],['oL4','Spanish'],['oL5','Chinese'],['oL6','Japanese'],['oL7','Korean'],['oL8','Portuguese'],['oL9','Russian'],['oL91','Swedish']]],
['Camera','Touch screen',[['','Leave unchanged'],['tE','Enabled'],['tD','Disabled']]],
['Camera','Screen auto-off',[['','Leave unchanged'],['oS0','Never'],['oS1','1 minute'],['oS3','3 minutes']]],
['Camera','Front screen',[['','Leave unchanged'],['oF0','Off'],['oFU','Status only'],['oFF','Full image'],['oFC','Cropped image'],['oFN','Never timeout'],['oFM','Match rear screen']]],
['Camera','External microphone',[['','Leave unchanged'],['oE1','Standard'],['oE2','Standard+'],['oE3','Powered'],['oE4','Powered+'],['oE5','Line in']]],
['Camera','GPS',[['','Leave unchanged'],['g0','Off'],['g1','On']]],
['Camera','QuickCapture',[['','Leave unchanged'],['q0','Off'],['q1','On']]],
['Camera','Voice control',[['','Leave unchanged'],['v0','Off'],['v1','On']]],
['Camera','Beep volume',[['','Leave unchanged'],['oV0','Muted'],['oV1','10%'],['oV3','30%'],['oV7','70%'],['oV9','Maximum']]],
['Camera','LEDs',[['','Leave unchanged'],['oD0','Off'],['oD2','Some'],['oD4','All']]],
['Camera','Screen brightness',[['','Leave unchanged'],['oB0','0%'],['oB1','10%'],['oB4','40%'],['oB7','70%'],['oB9','100%']]],
['Camera','Auto power off',[['','Leave unchanged'],['oC0','Never'],['oC1','1 minute'],['oC5','5 minutes'],['oC15','15 minutes'],['oC30','30 minutes']]],
['Labs','Wireless',[['','Leave unchanged'],['oW0','Off'],['oW1','On']]],
['Labs','Disable audio',[['','Leave unchanged'],['$DAUD=0','Off'],['$DAUD=1','On']]],
['Labs','Wake on USB power',[['','Leave unchanged'],['$WAKE=0','Off'],['$WAKE=1','On']]]
];
const hero9Options={Resolution:['','r1','r1T','r2','r2T','r4','r4T','r5'], 'Frame rate':['','p24','p25','p30','p50','p60','p100','p120','p200','p240'], 'Digital lens':['','fW','fL','fS','fH','fN'],Colour:['','cF','cG'], 'HyperSmooth':['','e0','e1','e2','e3'], 'ISO range':['','i1M1','i2M1','i4M1','i8M1','i16M2','i32M1','i64M16']};
const compat={hero5session:{blocked:['Colour depth','Custom bitrate (Mb/s)','Noise reduction (1–100)','Spirit level']},hero7:{blocked:['Colour depth','Custom bitrate (Mb/s)','Noise reduction (1–100)']},hero8:{blocked:['Colour depth','Custom bitrate (Mb/s)','Noise reduction (1–100)']},hero9:{blocked:['Colour depth','Custom bitrate (Mb/s)','Noise reduction (1–100)']},max:{blocked:['Colour depth','Noise reduction (1–100)']}};
let fields=[];
function build(){const root=$('extraControls');root.replaceChildren();fields=[];for(const group of ['Recording','Protune','Camera','Labs']){const details=document.createElement('details');details.className='settingGroup';details.open=group==='Recording';const heading=document.createElement('summary');heading.textContent=group;details.append(heading);root.append(details);for(const [g,label,spec] of groups.filter(x=>x[0]===group)){const id='field'+fields.length;const wrap=document.createElement('div');const l=document.createElement('label');l.htmlFor=id;l.textContent=label;wrap.append(l);let e;if(Array.isArray(spec)){e=document.createElement('select');e.replaceChildren(...spec.map(x=>opt(x[0],x[1])))}else{e=document.createElement('input');e.type='number';e.min=spec.min;e.max=spec.max;e.placeholder='Leave unchanged'}e.id=id;e.addEventListener('input',updateSetting);e.addEventListener('change',updateSetting);wrap.append(e);details.append(wrap);fields.push({label,spec,e});}}}
function camera(){return db?.models.find(m=>m.id===$('camera').value)}
const modelCapabilities={
hero5session:{resolution:['r1','r1T','r2','r2T','r4'],lens:['fW','fL','fS','fN','fM'],color:['cF','cG'],depth:[],modes:['mV','mP','mT','mTP','mTW','mPB','mPN','mNL','mNP']},
hero7:{resolution:['r1','r1T','r2','r2T','r4','r4T'],lens:['fW','fL','fS','fN'],color:['cF','cG'],depth:[]},
hero8:{resolution:['r1','r1T','r2','r2T','r4','r4T'],lens:['fW','fL','fS','fN'],color:['cF','cG'],depth:[]},
hero9:{resolution:['r1','r1T','r2','r2T','r4','r4T','r5'],lens:['fW','fL','fS','fH','fN'],color:['cF','cG'],depth:[]},
hero10:{resolution:['r1','r1T','r2','r2T','r4','r4T','r5','r5T'],lens:['fW','fL','fS','fH'],color:['cF','cG','cN'],depth:[]},
hero10bones:{resolution:['r1','r1T','r2','r2T','r4','r4T','r5'],lens:['fW','fL','fS'],color:['cF','cG','cN'],depth:[]},
hero11:{resolution:['r1','r2','r2T','r4','r4T','r4X','r5','r5X'],lens:['fW','fL','fS','fV','fH'],color:['cF','cG','cN'],depth:['d8','d10']},
hero11mini:{resolution:['r1','r2','r2T','r4','r4T','r4X','r5','r5T','r5X'],lens:['fW','fL','fS','fV','fH'],color:['cF','cG','cN'],depth:['d8','d10']},
hero12:{resolution:['r1','r2','r2T','r4','r4T','r4X','r5','r5X'],lens:['fW','fL','fS','fV','fH'],color:['cF','cG','cN'],depth:['d8','d10']},
hero13:{resolution:['r1','r1V','r2','r2T','r4','r4T','r4X','r4S','r4V','r5','r5X'],lens:['fW','fL','fS','fV','fH'],color:['cF','cG','cN'],depth:['d8','d10']},
max:{resolution:['r3','r5'],lens:['fW'],color:['cF','cG'],depth:[]},
max2:{resolution:['r4','r5','r8'],lens:['fW'],color:['cF','cG','cN'],depth:['d8','d10']},
mission1:{resolution:['r1','r2','r4','r4V','r5','r8','r8T'],lens:['fW','fL'],color:['cF','cG','cN','cC','cL'],depth:['d8','d10']},
mission1pro:{resolution:['r1','r2','r4','r4V','r5','r8','r8T'],lens:['fW','fL'],color:['cF','cG','cN','cC','cL'],depth:['d8','d10']},
mission1proils:{resolution:['r1','r2','r4','r4V','r5','r8','r8T'],lens:['fW','fL'],color:['cF','cG','cN','cC','cL'],depth:['d8','d10']}
};
const extraModes=[['mVL','Video Looping'],['mST','Star Trails'],['mLP','Light Painting'],['mLT','Vehicle Lights'],['mVN','Night Video']];
const extraRes=[['r1V','1080p vertical'],['r4S','4K square'],['r5T','5K 4:3'],['r3','3K 360'],['r4V','4K Vertical'],['r8T','8K 4:3']];
const extraColors=[['cC','Cinematic'],['cL','GPLog2']];
groups.find(g=>g[1]==='Mode')[2].push(...extraModes);
groups.find(g=>g[1]==='Resolution')[2].push(...extraRes);
groups.find(g=>g[1]==='Colour')[2].push(...extraColors);groups.find(g=>g[1]==='Digital lens')[2].push(['fX','SuperMax Wide (lens mod)']);
function profileAllowed(id,label){const p=cameraProfiles[id]||modelCapabilities[id];if(!p)return null;const map={'Resolution':'resolution','Digital lens':'lens','Colour':'color','Colour depth':'depth','Mode':'modes'};if(label==='Mode'){const base=['mV','mP','mT','mTP','mTW','mPB','mPN','mNL','mNP'];const extra=id==='hero10'?['mL']:id.startsWith('mission')?['mVN','mST','mLP','mLT']:['hero11','hero12','hero13'].includes(id)?['mST','mLP','mLT']:[];return ['',...(p.modes||base),...extra,...(['max','max2'].includes(id)?['m3','mH','mHF','mHR']:[])]}const k=map[label];return k?['',...(p[k]||[])]:null}
// GoPro Labs official README feature matrix (October 2026). Partial support is excluded.
const labsSupport={

'Custom bitrate (Mb/s)':['mission1proils','mission1pro','mission1','max2','hero13','hero12','hero11','hero11mini','hero10','hero10bones','max'],
'Noise reduction (1–100)':['mission1proils','mission1pro','mission1','max2','hero13','hero12','hero11','hero11mini'],
'Histogram':['mission1proils','mission1pro','mission1','max2','hero13','hero12','hero11','hero11mini','hero10','hero10bones','hero9','hero8'],
'Spirit level':['mission1proils','mission1pro','mission1','max2','hero13','hero12','hero11'],
'Disable audio':['mission1proils','mission1pro','mission1','max2','hero13','hero12','hero11','hero11mini','hero10','hero10bones'],
'Wake on USB power':['mission1proils','mission1pro','mission1','max2','hero13','hero12','hero11','hero11mini','hero10','hero10bones','hero8','max']
};
const videoLabels=['Resolution','Frame rate','Digital lens','HyperSmooth'];
const fpsByModel={hero5session:[24,25,30,50,60,90,100,120],hero7:[24,25,30,50,60,100,120,200,240],hero8:[24,25,30,50,60,100,120,200,240],hero9:[24,25,30,50,60,100,120,200,240],hero10:[24,25,30,50,60,100,120,200,240],hero10bones:[24,25,30,50,60,100,120,200,240],hero11:[24,25,30,50,60,100,120,200,240],hero11mini:[24,25,30,50,60,100,120,200,240],hero12:[24,25,30,50,60,100,120,200,240],hero13:[24,25,30,50,60,100,120,200,240],max:[24,25,30,50,60],max2:[24,25,30,50,60],mission1:[24,25,30,50,60,100,120],mission1pro:[24,25,30,50,60,100,120],mission1proils:[24,25,30,50,60,100,120]};
// Manufacturer-sourced resolution/FPS tables. An absent resolution is not validated.
const verifiedVideoMatrices={
hero9:{
r5:{fps:[24,25,30],lens:['fW','fL','fH','fN']},
r4:{fps:[24,25,30,50,60],lens:['fW','fL','fH','fN'],lensByFps:{24:['fS','fW','fL','fH','fN'],25:['fS','fW','fL','fH','fN'],30:['fS','fW','fL','fH','fN']}},
r4T:{fps:[24,25,30],lens:['fW','fL','fH','fN']},
r2:{fps:[50,60,100,120],lens:['fS','fW','fL','fH','fN']},
r2T:{fps:[50,60],lens:['fW','fL','fH','fN']},
r1T:{fps:[24,25,30,50,60,100,120],lens:['fW','fL','fH','fN']},
r1:{fps:[24,25,30,50,60,100,120,200,240],lens:['fS','fW','fL','fH','fN'],lensByFps:{200:['fW','fL','fH','fN'],240:['fW','fL','fH','fN']}}
},
hero11mini:{
r5X:{fps:[24,25,30]},r5:{fps:[24,25,30,50,60]},r5T:{fps:[24,25,30]},
r4X:{fps:[50,60]},r4:{fps:[24,25,30,50,60,100,120]},r4T:{fps:[24,25,30,50,60]},
r2:{fps:[50,60,100,120,200,240]},r2T:{fps:[50,60,100,120]},
r1:{fps:[24,25,30,50,60,100,120,200,240]}
}
};
// Single normalized capability registry consumed by dropdown filtering.
// "fps" and "resolution" are model-level candidates, NOT verified combinations.
// videoMatrix entries are provisional until checked against manufacturer mode tables.
let recordingMatrixData=null,labsFeatureData=null;
const cameraProfiles=Object.fromEntries(Object.entries(modelCapabilities).map(([id,cap])=>[id,{
  ...cap,
  fps:fpsByModel[id]||[],
  labs:Object.keys(labsSupport).filter(label=>labsSupport[label].includes(id)),
  videoMatrix:recordingMatrixData?.cameras?.[id]?.modes||verifiedVideoMatrices[id]||{}
}]));
function field(name){return fields.find(f=>f.label===name)}
function setChoices(f,allowed){if(!f||!Array.isArray(f.spec))return;const old=f.e.value;const values=f.spec.filter(([value])=>!allowed||allowed.includes(value));f.e.replaceChildren(...values.map(([v,label])=>opt(v,label)));f.e.value=values.some(x=>x[0]===old)?old:''}
function applyConstraints(){const c=camera();if(!c)return;const hero=c.id==='hero9';const selected=field('Resolution').e.value;const recording=field('Mode').e.value;const video=!recording||recording==='mV'||['m3','mH','mHF','mHR'].includes(recording);const matrix=cameraProfiles[c.id]?.videoMatrix[selected]||null;const fpsSelected=Number((field('Frame rate')?.e.value||'').slice(1));
for(const f of fields){let allowed=null;allowed=profileAllowed(c.id,f.label);if(hero&&hero9Options[f.label]&&!['Resolution','Digital lens'].includes(f.label))allowed=hero9Options[f.label];if(hero&&f.label==='Resolution')allowed=['',...modelCapabilities.hero9.resolution];if(matrix&&matrix.complete===true&&f.label==='Frame rate')allowed=['',...matrix.fps.map(n=>'p'+n)];if(matrix&&matrix.lens&&matrix.lensComplete===true&&f.label==='Digital lens')allowed=['',...(matrix.lensByFps?.[fpsSelected]||matrix.lens)];if(f.label==='Shutter angle')allowed=c.id.startsWith('mission')?['']:['','0','360','180','90','45','22','10','5','2'];if(f.label==='Default mode on power-up'&&c.id.startsWith('mission'))allowed=['','dL'];if(f.label==='MISSION ISO')allowed=c.id.startsWith('mission')?null:[''];if(f.label==='ISO range'&&c.id.startsWith('mission'))allowed=[''];if(f.label==='Bitrate'&&!c.id.startsWith('mission'))allowed=['','b0','b1'];if(f.label==='Noise reduction preset')allowed=c.id==='hero13'?null:[''];if(f.label==='Touch screen')allowed=['hero13','max2'].includes(c.id)?null:[''];if(f.label==='Front screen')allowed=['hero9','hero10','hero11','hero12','hero13'].includes(c.id)?null:[''];if(f.label==='External microphone')allowed=['hero10','hero11','hero12','hero13'].includes(c.id)?null:[''];if(f.label==='MISSION shutter')allowed=c.id.startsWith('mission')?null:[''];if(f.label==='RAW photos')allowed=['mP','mPB','mPN','mTP','mNP'].includes(recording)?['','r','r0']:[''];if(f.label==='Night photo shutter')allowed=['mPN','mNP'].includes(recording)?null:[''];if(f.label==='Hindsight')allowed=['hero9','hero10','hero10bones','hero11','hero11mini','hero12','hero13'].includes(c.id)&&video?null:[''];if(hero&&f.label==='Frame rate'&&!matrix)allowed=['',...cameraProfiles[c.id].fps.map(n=>'p'+n)];if(hero&&f.label==='Digital lens'&&!matrix)allowed=['',...cameraProfiles[c.id].lens];if(hero&&f.label==='HyperSmooth'&&!matrix)allowed=['','e0','e1','e2','e3'];if(!hero&&f.label==='Frame rate')allowed=['',...((matrix&&matrix.complete===true)?matrix.fps:cameraProfiles[c.id]?.fps||[]).map(n=>'p'+n)];if(f.label==='HyperSmooth'&&video)allowed=['','e0','e1','e2','e3','e4'];const lapse=['mT','mTP','mNL','mNP'].includes(recording);if(f.label==='Time-lapse interval'&&!lapse)allowed=[''];if(lapse&&f.label==='Frame rate')allowed=[''];if(!video&&videoLabels.includes(f.label))allowed=[''];if(!video&&f.label==='Shutter angle')allowed=[''];setChoices(f,allowed);const blocked=compat[c.id]?.blocked||[];if(f.label==='GPS'&&['hero11mini','hero10bones'].includes(c.id))allowed=[''];const featureName={'Custom bitrate (Mb/s)':'Bitrate Controls','Noise reduction (1–100)':'Noise Reduction','Histogram':'Histogram','Spirit level':'Spirit Level','Disable audio':'Audio Disable','Wake on USB power':'Wake on Power'}[f.label];const official=labsFeatureData?.features?.find(x=>x.feature.startsWith(featureName||'\u0000'));const state=official?.support?.[c.id];const labsUnsupported=featureName?state==='unsupported'||state==='grouped-check'||state==='partial'||state==='unknown'||(!state&&!cameraProfiles[c.id]?.labs.includes(f.label)):false;f.e.disabled=!!labsUnsupported||(f.label==='GPS'&&['hero11mini','hero10bones'].includes(c.id))||blocked.includes(f.label)||(f.label==='RAW photos'&&!['mP','mPB','mPN','mTP','mNP'].includes(recording))||(f.label==='Night photo shutter'&&!['mPN','mNP'].includes(recording))||(f.label==='Hindsight'&&(!video||!['hero9','hero10','hero10bones','hero11','hero11mini','hero12','hero13'].includes(c.id)))||(!video&&videoLabels.includes(f.label))||(f.label==='Time-lapse interval'&&!['mT','mTP','mNL','mNP'].includes(recording))||(!video&&f.label==='Shutter angle')||(f.label==='Shutter angle'&&c.id.startsWith('mission'))||(f.label==='MISSION shutter'&&!c.id.startsWith('mission'))||(f.label==='MISSION ISO'&&!c.id.startsWith('mission'))||(f.label==='ISO range'&&c.id.startsWith('mission'))||(f.label==='Noise reduction preset'&&c.id!=='hero13')||(f.label==='Touch screen'&&!['hero13','max2'].includes(c.id))||(f.label==='Front screen'&&!['hero9','hero10','hero11','hero12','hero13'].includes(c.id))||(f.label==='External microphone'&&!['hero10','hero11','hero12','hero13'].includes(c.id));if(f.e.disabled)f.e.value='';f.e.parentElement.hidden=!!labsUnsupported||(f.label==='GPS'&&['hero11mini','hero10bones'].includes(c.id))||(f.e.disabled&&['RAW photos','Night photo shutter','Hindsight','MISSION shutter','MISSION ISO','ISO range','Shutter angle','Noise reduction preset','Touch screen','Front screen','External microphone'].includes(f.label));}
}
function refreshCamera(){const c=camera();if(!c)return;$('cameraInfo').textContent=c.notes+(c.id==='hero9'?' • HERO9 resolution/FPS and lens combinations sourced from the official user manual.':' • Verified resolution/FPS combinations are filtered where available; other combinations require camera confirmation.');for(const f of fields)f.e.value='';field('Mode').e.value='mV';applyConstraints();render()}
function updateSetting(e){if(e?.target===field('Mode')?.e||e?.target===field('Resolution')?.e||e?.target===field('Frame rate')?.e)applyConstraints();render()}
function command(){let parts=[];const shutter=field('Shutter angle')?.e.value;const iso=field('ISO range')?.e.value;if(shutter!==''&&shutter!==undefined){if(!iso)return '';const max=iso.match(/^i(\d+)M/);if(!max)return '';}for(const f of fields){if(f.e.disabled||f.e.value==='')continue;if(Array.isArray(f.spec)){if(f.label==='Shutter angle')continue;if(f.label==='ISO range'&&shutter!==''){const max=f.e.value.match(/^i(\d+)M(\d+)$/);parts.push(max?'i'+max[1]+'S'+shutter:f.e.value)}else parts.push(f.e.value);}else{let n=Number(f.e.value);if(Number.isFinite(n)&&n>=f.spec.min&&n<=f.spec.max)parts.push(f.spec.prefix+n)}}return parts.join('')}
function render(){const code=command();const needsIso=field('Shutter angle')?.e.value!==''&&!field('ISO range')?.e.value;$('command').textContent=code||'Select settings below to generate a QR';$('qr').replaceChildren();if(!code){$('qr').textContent=needsIso?'Select ISO range first':'Select a setting';$('status').textContent=needsIso?'Shutter angle requires an ISO range. Selecting an angle sets ISO maximum but replaces the minimum ISO command.':'Only selected controls are encoded.';return}if(typeof QRCode==='undefined'){$('qr').textContent='QR library unavailable';return}try{new QRCode($('qr'),{text:code,width:256,height:256,colorDark:'#000',colorLight:'#fff',correctLevel:QRCode.CorrectLevel.M});$('status').textContent='Labs syntax generated. Confirm camera and firmware compatibility before use.'}catch(e){$('qr').textContent='QR too large; use fewer settings';$('status').textContent=e.message}}
function refreshPresets(){options('presets',[{value:'',label:'Choose a saved preset…'},...presets.map((p,i)=>({value:String(i),label:p.name}))])}
$('camera').addEventListener('change',refreshCamera);
$('save').addEventListener('click',()=>{const name=prompt('Preset name');if(!name)return;presets.push({name,camera:$('camera').value,values:fields.map(f=>f.e.value)});localStorage.setItem(KEY+'.presets',JSON.stringify(presets));refreshPresets()});
$('load').addEventListener('click',()=>{const p=presets[Number($('presets').value)];if(!p||$('presets').value==='')return;$('camera').value=p.camera;refreshCamera();fields.forEach((f,i)=>{if(!f.e.disabled)f.e.value=p.values[i]||''});applyConstraints();fields.forEach((f,i)=>{if(!f.e.disabled&&Array.isArray(f.spec)&&[...f.e.options].some(o=>o.value===p.values[i]))f.e.value=p.values[i]||''});applyConstraints();render()});
$('fullscreen').addEventListener('click',()=>{$('qr').requestFullscreen?.()});
(async()=>{try{build();const r=await fetch('./data/cameras.json');if(!r.ok)throw Error('Camera database unavailable');db=await r.json();try{const mr=await fetch('./data/recording-matrix.json');if(mr.ok){recordingMatrixData=await mr.json();for(const [id,profile] of Object.entries(cameraProfiles))profile.videoMatrix=recordingMatrixData.cameras?.[id]?.modes||verifiedVideoMatrices[id]||{};}}catch(err){console.warn('Recording matrix unavailable; using built-in fallback',err)}try{const lr=await fetch('./data/labs-feature-matrix.json');if(lr.ok)labsFeatureData=await lr.json()}catch(err){console.warn('Labs feature matrix unavailable',err)}options('camera',db.models.map(m=>({value:m.id,label:m.name})));refreshCamera();render();refreshPresets()}catch(e){$('status').textContent=e.message}})();
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(console.warn);
