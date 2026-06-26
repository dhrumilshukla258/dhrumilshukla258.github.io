// ── Audio engine (Web Audio API — no files needed) ─────────────────────────────

export function createAudioEngine() {
  let ctx: AudioContext | null = null;

  function unlock() {
    try {
      const AC = (window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
      if (!ctx) ctx = new AC();
      if (ctx.state === 'suspended') ctx.resume();
    } catch { /* browser blocked audio entirely — silently skip */ }
  }
  ['keydown', 'pointerdown', 'touchstart'].forEach(ev =>
    window.addEventListener(ev, unlock, { passive: true }),
  );

  const getCtx = (): AudioContext | null => {
    if (!ctx) return null;
    if (ctx.state === 'suspended') ctx.resume();
    return ctx.state === 'running' ? ctx : null;
  };

  const tone = (freq: number, dur: number, vol: number, type: OscillatorType = 'sine', t0 = 0) => {
    const c = getCtx(); if (!c) return;
    const osc = c.createOscillator();
    const g   = c.createGain();
    osc.connect(g); g.connect(c.destination);
    osc.type = type; osc.frequency.value = freq;
    const at = c.currentTime + t0;
    g.gain.setValueAtTime(vol, at);
    g.gain.exponentialRampToValueAtTime(0.001, at + dur);
    osc.start(at); osc.stop(at + dur);
  };

  return {
    footstep() {
      const c = getCtx(); if (!c) return;
      const len = Math.floor(c.sampleRate * 0.055);
      const buf = c.createBuffer(1, len, c.sampleRate);
      const d   = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = c.createBufferSource(); src.buffer = buf;
      const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 280; f.Q.value = 0.8;
      const g = c.createGain(); g.gain.value = 0.1;
      src.connect(f); f.connect(g); g.connect(c.destination);
      src.start();
    },
    zoneEnter()  { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.35, 0.12, 'sine', i * 0.07)); },
    navigate()   { [392, 494, 587, 784, 988].forEach((f, i) => tone(f, 0.55, 0.18, 'sine', i * 0.055)); },
    zoneExit()   { tone(400, 0.15, 0.08); tone(300, 0.15, 0.06, 'sine', 0.08); },
  };
}
