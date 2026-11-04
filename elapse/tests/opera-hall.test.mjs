import test from 'node:test';import assert from 'node:assert/strict';
import {hallRow,hallSeat,rowOutline,riserOutline,STAGE_Y} from '../engine/opera-hall-layout.js';
function inside([x,y],polygon){let inPoly=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const a=polygon[i],b=polygon[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inPoly=!inPoly;}return inPoly;}
test('curved seats sit on their matching floor tread and face the south stage',()=>{
 for(let row=0;row<25;row++){const q=hallRow(row),floor=rowOutline(row);for(let x=-q.width+.55;x<q.width-.4;x+=.82){const s=hallSeat(row,x);assert.ok(inside([s.x,s.y],floor));assert.equal(s.z,q.z);const dx=-x,dy=STAGE_Y-s.y,forward=[Math.sin(s.angle),-Math.cos(s.angle)];assert.ok((dx*forward[0]+dy*forward[1])/Math.hypot(dx,dy)>1-1e-12);assert.ok(Math.abs(Math.hypot(s.backX-x,s.backY-s.y)-.28)<1e-9);}}
});
test('estimated horseshoe lift outlines remain inside the normal stage envelope',()=>{
 for(let i=0;i<4;i++)for(const [x,y] of riserOutline(6.9-i*1.3,5.85-i*1.3)){assert.ok(Math.abs(x)<7.25);assert.ok(y>=STAGE_Y-6.15&&y<=STAGE_Y+6.15);}
});
