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
console.log('Camera database valid:',models.length,'cameras,',labs.length,'Labs features,',Object.values(db.cameras).reduce((n,c)=>n+Object.keys(c.recording.modes).length,0),'recording rows.');
