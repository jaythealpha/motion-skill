import test from 'node:test';import assert from 'node:assert/strict';
import {nearWallSide,pinchZoom} from '../engine/opera-navigation.js';
test('the wall nearest a view is cut without treating the opposite side as near',()=>{assert.equal(nearWallSide(60),1);assert.equal(nearWallSide(180),-1);assert.equal(nearWallSide(225),-1);assert.equal(nearWallSide(90),0);assert.equal(nearWallSide(270),0);assert.equal(nearWallSide(420),1);});
test('a first pinch movement uses the two-finger starting distance and remains bounded',()=>{assert.equal(pinchZoom(1,200,250),.8);assert.equal(pinchZoom(.8,250,200),1);assert.equal(pinchZoom(1,200,100000),.2);assert.equal(pinchZoom(1,200,1),5);assert.equal(pinchZoom(1,0,250),1);assert.equal(pinchZoom(1,200,0),1);});
