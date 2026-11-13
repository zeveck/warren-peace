// Input: keys and mouse into "held" and "just pressed" sets. Just-pressed survives until the next
// update reads it (then input.endFrame() clears it), so taps shorter than a frame still count.
const USED = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Tab', 'Enter', 'Escape',
  'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyE', 'KeyI', 'KeyN', 'KeyM', 'KeyP', 'KeyQ', 'KeyR', 'KeyT', 'KeyF', 'KeyC', 'KeyV', 'KeyB',
  'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'KeyZ', 'KeyX', 'Backspace',
  'Digit0', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9']);

export const input = {
  held: new Set(), pressed: new Set(), order: [],   // order: key codes in press order this frame
  shift: false, shiftPressed: new Set(),   // keys pressed this frame with Shift down (a quick Shift+key tap can release Shift before the frame runs)
  mouse: { x: 0, y: 0, inside: false, down: [false, false, false], pressed: [false, false, false], released: [false, false, false], dragFrom: null, wheel: 0, moved: false, px: -1, py: -1 },   // px, py: where the last left press went down
  anyPressed: false,
  toLogical: null,     // set by main.js: (clientX, clientY) -> {x, y} in 640x360 units
  onFirstInput: null,  // set by main.js: resumes audio

  isHeld(code) { return this.held.has(code); },
  isPressed(code) { return this.pressed.has(code); },
  // action helpers
  act() { return this.pressed.has('Space') || this.pressed.has('Enter') || this.pressed.has('KeyE'); },
  back() { return this.pressed.has('Escape') || this.pressed.has('Backspace'); },
  up() { return this.pressed.has('ArrowUp') || this.pressed.has('KeyW'); },
  down() { return this.pressed.has('ArrowDown') || this.pressed.has('KeyS'); },
  left() { return this.pressed.has('ArrowLeft') || this.pressed.has('KeyA'); },
  right() { return this.pressed.has('ArrowRight') || this.pressed.has('KeyD'); },
  heldDir() {
    const h = this.held;
    return {
      up: h.has('ArrowUp') || h.has('KeyW'), down: h.has('ArrowDown') || h.has('KeyS'),
      left: h.has('ArrowLeft') || h.has('KeyA'), right: h.has('ArrowRight') || h.has('KeyD'),
    };
  },
  shiftWith(code) { return this.shift || this.shiftPressed.has(code); },
  digit() { for (let i = 0; i <= 9; i++) if (this.pressed.has('Digit' + i)) return i; return -1; },
  click() { return this.mouse.pressed[0]; },
  // a left press this frame that went down inside the box. Tested against where the press went DOWN, not where the
  // pointer is now: a fast click (down, up, and the pointer already moving on, all inside one frame) still lands.
  clickIn(x, y, w, h) { const m = this.mouse; return m.pressed[0] && m.px >= x && m.px < x + w && m.py >= y && m.py < y + h; },
  rclick() { return this.mouse.pressed[2]; },
  // consume: stop lower handlers in the same frame from seeing a press
  eat(code) { this.pressed.delete(code); },
  eatAll() { this.pressed.clear(); this.mouse.pressed = [false, false, false]; this.anyPressed = false; },
  endKeys() { this.pressed.clear(); this.shiftPressed.clear(); this.order.length = 0; this.anyPressed = false; this.mouse.pressed = [false, false, false]; this.mouse.released = [false, false, false]; },
  endMouse() { this.mouse.pressed = [false, false, false]; this.mouse.released = [false, false, false]; this.mouse.wheel = 0; this.mouse.moved = false; },
  endFrame() {
    this.pressed.clear(); this.shiftPressed.clear(); this.order.length = 0; this.anyPressed = false;
    this.mouse.pressed = [false, false, false]; this.mouse.released = [false, false, false];
    this.mouse.wheel = 0; this.mouse.moved = false;
  },
};

function first() { if (input.onFirstInput) input.onFirstInput(); }

export function initInput(canvas) {
  window.addEventListener('keydown', e => {
    if (USED.has(e.code)) e.preventDefault();
    first();
    input.shift = e.shiftKey;
    if (!e.repeat) { input.pressed.add(e.code); if (e.shiftKey) input.shiftPressed.add(e.code); input.order.push(e.code); input.anyPressed = true; }
    input.held.add(e.code);
  }, { capture: true });
  window.addEventListener('keyup', e => {
    if (USED.has(e.code)) e.preventDefault();
    input.shift = e.shiftKey; input.held.delete(e.code);
  }, { capture: true });
  window.addEventListener('blur', () => { input.held.clear(); input.mouse.down = [false, false, false]; });
  const pos = e => { const p = input.toLogical(e.clientX, e.clientY); input.mouse.x = p.x; input.mouse.y = p.y; input.mouse.inside = p.inside; };
  canvas.addEventListener('pointermove', e => { pos(e); input.mouse.moved = true; });
  canvas.addEventListener('pointerdown', e => {
    e.preventDefault(); canvas.focus(); first(); pos(e);
    const b = e.button === 1 ? 1 : e.button === 2 ? 2 : 0;
    input.mouse.down[b] = true; input.mouse.pressed[b] = true; input.anyPressed = true;
    if (b === 0) { input.mouse.px = input.mouse.x; input.mouse.py = input.mouse.y; }
    input.shift = e.shiftKey;
    if (b === 0 || b === 1) input.mouse.dragFrom = { x: input.mouse.x, y: input.mouse.y, b };
    try { canvas.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
  });
  canvas.addEventListener('pointerup', e => {
    pos(e); const b = e.button === 1 ? 1 : e.button === 2 ? 2 : 0;
    input.mouse.down[b] = false; input.mouse.released[b] = true;
  });
  canvas.addEventListener('pointerleave', () => { input.mouse.inside = false; });
  canvas.addEventListener('contextmenu', e => e.preventDefault());
  canvas.addEventListener('wheel', e => { e.preventDefault(); input.mouse.wheel += Math.sign(e.deltaY); }, { passive: false });
}
