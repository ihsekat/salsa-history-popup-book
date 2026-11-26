export function bindBookGestures(canvas, {startDrag, moveDrag, endDrag, cancelDrag, hover, zoomBy}, signal) {
  const touches = new Map();
  let dragId = null;
  let pinching = false;
  let lastGap = 0;
  let safariScale = null;
  let safariUsesTouch = false;

  function gap() {
    if (touches.size < 2) return 0;
    const [a, b] = touches.values();
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  }

  function interruptDrag() {
    if (dragId === null) return;
    dragId = null;
    cancelDrag();
  }

  canvas.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    if (e.pointerType === 'touch') {
      canvas.setPointerCapture(e.pointerId);
      touches.set(e.pointerId, e);
      if (safariScale !== null) safariUsesTouch = true;
      if (touches.size === 2) {
        interruptDrag();
        pinching = true;
        lastGap = gap();
      }
    }
    if (pinching || safariScale !== null || dragId !== null) return;
    if (e.pointerType !== 'touch') canvas.setPointerCapture(e.pointerId);
    dragId = e.pointerId;
    startDrag(e);
  }, {signal});

  canvas.addEventListener('pointermove', e => {
    if (touches.has(e.pointerId)) {
      touches.set(e.pointerId, e);
      if (pinching) {
        const nextGap = gap();
        if (lastGap > 0 && nextGap > 0) zoomBy(nextGap / lastGap);
        lastGap = nextGap;
        return;
      }
    }
    if (pinching || safariScale !== null) return;
    if (dragId === e.pointerId) moveDrag(e);
    else if (dragId === null && e.pointerType !== 'touch') hover(e);
  }, {signal});

  function finishPointer(e) {
    if (touches.delete(e.pointerId) && pinching) {
      lastGap = gap();
      pinching = touches.size > 0;
      return;
    }
    if (dragId !== e.pointerId) return;
    dragId = null;
    if (e.type === 'pointerup') endDrag();
    else cancelDrag();
  }
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    canvas.addEventListener(type, finishPointer, {signal});
  }

  canvas.addEventListener('wheel', e => {
    if (!e.ctrlKey) return;
    e.preventDefault();
    if (pinching || safariScale !== null) return;
    const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? canvas.clientHeight : 1;
    zoomBy(Math.exp(-e.deltaY * unit * .01));
  }, {passive: false, signal});

  // Desktop Safari reports trackpad magnification through gesture events.
  canvas.addEventListener('gesturestart', e => {
    e.preventDefault();
    safariScale = 1;
    safariUsesTouch = touches.size > 0;
    interruptDrag();
  }, {passive: false, signal});
  canvas.addEventListener('gesturechange', e => {
    e.preventDefault();
    if (safariScale === null || safariUsesTouch || !(e.scale > 0)) return;
    zoomBy(e.scale / safariScale);
    safariScale = e.scale;
  }, {passive: false, signal});
  canvas.addEventListener('gestureend', e => {
    e.preventDefault();
    safariScale = null;
  }, {passive: false, signal});
}
