import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ENVIRONMENT_LAYOUT, ENVIRONMENT_PROPS, GROUND_PLANTING, loadEnvironment, drawEnvironmentPond } from '../src/features/academy/environment.js';
import { BUILDINGS, OBSTACLES, PONDS } from '../src/features/academy/world.js';

test('environment atlas is RGBA, crops stay in bounds and uniform sprite caches do not clip artwork', () => {
  const data = readFileSync(new URL('../public/' + ENVIRONMENT_LAYOUT.source, import.meta.url));
  assert.deepEqual([data.readUInt32BE(16),data.readUInt32BE(20)],ENVIRONMENT_LAYOUT.sourceSize);
  assert.equal(data[25],6);
  for(const s of ENVIRONMENT_LAYOUT.sprites) {
    const c=s.source, f=s.frame;
    assert.ok(c.x>=0&&c.y>=0&&c.x+c.width<=ENVIRONMENT_LAYOUT.sourceSize[0]&&c.y+c.height<=ENVIRONMENT_LAYOUT.sourceSize[1]);
    assert.ok(c.width*s.scale<=f.width+1e-8&&s.origin.y-c.height*s.scale>=-1e-8&&s.origin.y<=f.height);
  }
});

test('new solid-looking posts reuse existing colliders and low planting clears entrances and south gate', () => {
  for(const p of ENVIRONMENT_PROPS.filter((v)=>v.key!=='fountain')) {
    const c=OBSTACLES.find((r)=>r.id===p.collider);
    assert.ok(c&&p.x>=c.x&&p.x<=c.x+c.width&&p.y>=c.y&&p.y<=c.y+c.height,p.key);
  }
  for(const p of GROUND_PLANTING) {
    for(const b of BUILDINGS) assert.ok(Math.hypot(p.x-b.entrance.x,p.y-b.entrance.y)>96,'clear entrance approach');
    if(p.y>1872) assert.ok(p.x<1216||p.x>1408,'clear south gate');
  }
});

test('pond water tiles clip to the inner pool and shoreline covers non-square existing ponds without stretching their bounds', () => {
  for(const pond of PONDS) {
    const draws=[], clips=[];
    const ctx={drawImage:(...args)=>draws.push(args),fillRect(){},save(){},restore(){},beginPath(){},rect:(...args)=>clips.push(args),clip(){}};
    assert.equal(drawEnvironmentPond(ctx,{image:{}},pond),true);
    assert.deepEqual(clips[0],[pond.x+16,pond.y+16,pond.width-32,pond.height-32]);
    for(const args of draws) {
      const [sx,sy,sw,sh]=args.slice(1,5);
      assert.ok(sx>=0&&sy>=0&&sx+sw<=ENVIRONMENT_LAYOUT.sourceSize[0]&&sy+sh<=ENVIRONMENT_LAYOUT.sourceSize[1]);
    }
    assert.equal(drawEnvironmentPond(ctx,null,pond),false,'graybox fallback');
  }
});

test('optional environment loading validates dimensions, falls back on failure and releases cancelled requests', async () => {
  let image;
  class FakeImage {constructor(){image=this;}set src(value){this.path=value;}}
  const pending=loadEnvironment({ImageConstructor:FakeImage});
  [image.naturalWidth,image.naturalHeight]=ENVIRONMENT_LAYOUT.sourceSize;image.onload();assert.equal(await pending,image);
  const failed=loadEnvironment({ImageConstructor:FakeImage});image.onerror();assert.equal(await failed,null);
  const controller=new AbortController(),cancelled=loadEnvironment({signal:controller.signal,ImageConstructor:FakeImage});
  controller.abort();await assert.rejects(cancelled,{name:'AbortError'});assert.equal(image.onload,null);assert.equal(image.onerror,null);
});
