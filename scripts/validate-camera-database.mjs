// Run: node scripts/validate-camera-database.mjs
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const db=JSON.parse(readFileSync('data/camera-database.json','utf8'));
const models=JSON.parse(readFileSync('data/cameras.json','utf8')).models;
const recording=JSON.parse(readFileSync('data/recording-matrix.json','utf8')).cameras;
const labs=JSON.parse(readFileSync('data/labs-feature-matrix.json','utf8')).features;
assert.equal(db.schemaVersion,1);
assert.equal(Object.keys(db.cameras).length,models.length);
assert.equal(Object.keys(db.features).length,labs.length);
const states=new Set(['supported','unsupported','partial','grouped-check','unknown']);
for(const m of models){
 const camera=db.cameras[m.id];assert.ok(camera,'Missing camera '+m.id);
 assert.deepEqual(camera.recording.modes,recording[m.id]?.modes||{},'Recording mismatch: '+m.id);
 assert.deepEqual(camera.recording.modeVariants||{},recording[m.id]?.modeVariants||{},'Mode variants mismatch: '+m.id);
 for(const feature of labs){
  const state=camera.labs[feature.feature];
  assert.ok(states.has(state),'Invalid Labs state '+m.id+': '+feature.feature);
  assert.equal(state,feature.support[m.id]||'unknown','Labs mismatch '+m.id+': '+feature.feature);
 }
 for(const [resolution,row] of Object.entries(camera.recording.modes)){
  assert.ok(Array.isArray(row.fps)&&row.fps.length,'Missing FPS '+m.id+' '+resolution);
  assert.equal(new Set(row.fps).size,row.fps.length,'Duplicate FPS '+m.id+' '+resolution);
 }
}
assert.ok(db.extensionCatalog?.entries?.length>=100,'Official Labs extension catalog missing');
for(const e of db.extensionCatalog.entries){assert.match(e.code,/^[A-Z0-9]{4}$/);for(const m of models)assert.ok(['listed-in-section','not-resolved'].includes(db.cameras[m.id].extensionSupport[e.code]));}
assert.ok(Object.keys(db.officialQrControls?.groups||{}).length>=35,'Official QR controls not imported');
for(const [internal,official] of Object.entries(db.officialQrControls.appTokenAliases||{})){assert.ok(db.officialQrControls.verifiedTokenSets.resolution.includes(official),'Unknown official resolution token '+internal);}
assert.ok(Object.keys(db.officialDocumentation?.pages||{}).length>=30,'Bulk official documentation pages missing');
for(const [slug,page] of Object.entries(db.officialDocumentation.pages)){assert.ok(page.sourceSha&&page.sourcePath,'Missing documentation provenance: '+slug);for(const id of page.applicability?.explicitlyListedModels||[])assert.ok(db.cameras[id],'Unknown model '+id+' in '+slug);}
console.log('Camera database valid:',models.length,'cameras,',labs.length,'Labs features,',Object.values(db.cameras).reduce((n,c)=>n+Object.keys(c.recording.modes).length,0),'recording rows,',Object.keys(db.officialDocumentation.pages).length,'documentation pages.');
