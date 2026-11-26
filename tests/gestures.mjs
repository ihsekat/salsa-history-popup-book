import assert from 'node:assert/strict';
import {test} from 'node:test';
import {bindBookGestures} from '../dist/gestures.js';

function bookInput() {
  const canvas = new EventTarget();
  canvas.setPointerCapture = () => {};
  const calls = [];
  let zoom = 1;
  bindBookGestures(canvas, {
    startDrag: () => calls.push('start'), moveDrag: () => calls.push('move'),
    endDrag: () => calls.push('end'), cancelDrag: () => calls.push('cancel'),
    hover: () => {}, zoomBy: ratio => { zoom *= ratio; }
  });
  function send(type, props) {
    const event = Object.assign(new Event(type, {cancelable: true}), props);
    canvas.dispatchEvent(event);
    return event;
  }
  function touch(type, id, x) {
    send(type, {pointerType: 'touch', pointerId: id, button: 0, clientX: x, clientY: 100});
  }
  return {send, touch, calls, zoom: () => zoom};
}

test('pinch takes over a one-finger drag and consumes both releases', () => {
  const {touch, calls, zoom} = bookInput();
  touch('pointerdown', 1, 30);
  touch('pointermove', 1, 40);
  touch('pointerdown', 2, 140);
  touch('pointermove', 2, 115);
  assert.equal(zoom(), .75);
  touch('pointermove', 2, 160);
  assert.ok(Math.abs(zoom() - 1.2) < 1e-12);
  touch('pointerup', 2, 160);
  touch('pointermove', 1, 200);
  touch('pointerup', 1, 200);
  assert.deepEqual(calls, ['start', 'move', 'cancel']);
  touch('pointerdown', 3, 100);
  touch('pointermove', 3, 200);
  touch('pointerup', 3, 200);
  assert.deepEqual(calls.slice(3), ['start', 'move', 'end']);
});

test('replacing or losing a finger re-baselines the pinch without a jump', () => {
  const {touch, calls, zoom} = bookInput();
  touch('pointerdown', 1, 0);
  touch('pointerdown', 2, 100);
  touch('pointerdown', 3, 300);
  touch('pointermove', 3, 200);
  touch('pointercancel', 2, 100);
  touch('lostpointercapture', 2, 100);
  assert.equal(zoom(), 1);
  touch('pointermove', 3, 300);
  assert.equal(zoom(), 1.5);
  touch('lostpointercapture', 3, 300);
  touch('pointerup', 1, 0);
  assert.deepEqual(calls, ['start', 'cancel']);
});

test('trackpad pinch uses one event source and leaves ordinary scrolling alone', () => {
  const {send, touch, zoom} = bookInput();
  assert.equal(send('wheel', {deltaY: 20}).defaultPrevented, false);
  assert.equal(zoom(), 1);
  assert.equal(send('wheel', {ctrlKey: true, deltaY: -10, deltaMode: 0}).defaultPrevented, true);
  const trackpad = zoom();
  assert.ok(trackpad > 1);
  send('gesturestart');
  send('gesturechange', {scale: .8});
  send('wheel', {ctrlKey: true, deltaY: -10, deltaMode: 0});
  send('gesturechange', {scale: .9});
  send('gestureend');
  assert.ok(Math.abs(zoom() - trackpad * .9) < 1e-12);
  const beforeTouch = zoom();
  touch('pointerdown', 1, 0);
  send('gesturestart');
  touch('pointerdown', 2, 100);
  touch('pointermove', 2, 125);
  send('gesturechange', {scale: 1.25});
  touch('pointerup', 2, 125);
  touch('pointerup', 1, 0);
  send('gestureend');
  assert.ok(Math.abs(zoom() - beforeTouch * 1.25) < 1e-12);
});
