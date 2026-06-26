import { SKIN, SKIN_D } from './utils';

/** Professional — suit, tie, briefcase, eraser in hand */
export function drawProfessional(
  ctx: CanvasRenderingContext2D,
  cx: number, ground: number,
  walkT: number,   // 0–1 loop for leg swing
  armRaise: number // 0 = down, 1 = fully raised (holding eraser)
) {
  const G = ground;
  // shadow
  ctx.save(); ctx.globalAlpha = 0.18;
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.ellipse(cx, G + 2, 22, 5, 0, 0, Math.PI*2); ctx.fill();
  ctx.restore();

  // legs
  for (const [ox, phase] of [[-10, 0], [10, Math.PI]] as [number,number][]) {
    const s = Math.sin(walkT * Math.PI * 2 + phase) * 18;
    ctx.save(); ctx.translate(cx + ox, G - 36);
    ctx.rotate(s * Math.PI / 180);
    ctx.fillStyle = '#1a2535'; ctx.fillRect(-5, 0, 10, 36);
    // shoe
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.roundRect(-5, 32, 16, 8, 3); ctx.fill();
    ctx.restore();
  }

  // body — suit jacket
  ctx.fillStyle = '#1e2d42';
  ctx.beginPath(); ctx.roundRect(cx - 18, G - 78, 36, 44, 4); ctx.fill();

  // shirt
  ctx.fillStyle = '#e8e8e8';
  ctx.fillRect(cx - 5, G - 76, 10, 42);

  // lapels
  ctx.fillStyle = '#132030';
  ctx.beginPath();
  ctx.moveTo(cx - 5, G - 76); ctx.lineTo(cx - 18, G - 60); ctx.lineTo(cx - 5, G - 34);
  ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + 5, G - 76); ctx.lineTo(cx + 18, G - 60); ctx.lineTo(cx + 5, G - 34);
  ctx.closePath(); ctx.fill();

  // tie
  ctx.fillStyle = '#8b1a1a';
  ctx.beginPath();
  ctx.moveTo(cx - 3, G - 75); ctx.lineTo(cx + 3, G - 75);
  ctx.lineTo(cx + 5, G - 46); ctx.lineTo(cx, G - 36); ctx.lineTo(cx - 5, G - 46);
  ctx.closePath(); ctx.fill();

  // right arm + briefcase (swings with walk)
  const rSwing = Math.sin(walkT * Math.PI * 2 + Math.PI) * 15;
  ctx.save(); ctx.translate(cx + 18, G - 72);
  ctx.rotate(rSwing * Math.PI / 180);
  ctx.fillStyle = '#1e2d42'; ctx.fillRect(-5, 0, 10, 36);
  // hand
  ctx.fillStyle = SKIN; ctx.beginPath(); ctx.arc(0, 36, 6, 0, Math.PI*2); ctx.fill();
  // briefcase
  ctx.fillStyle = '#8b5e14'; ctx.beginPath(); ctx.roundRect(-9, 34, 22, 15, 3); ctx.fill();
  ctx.strokeStyle = '#5a3d0a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.roundRect(-9, 34, 22, 15, 3); ctx.stroke();
  ctx.strokeStyle = '#5a3d0a'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(2, 34, 5, Math.PI, 0); ctx.stroke();
  ctx.restore();

  // left arm — raised to hold eraser
  const baseAngle = Math.sin(walkT * Math.PI * 2) * 15;
  const raiseAngle = -armRaise * 80; // negative = up
  ctx.save(); ctx.translate(cx - 18, G - 72);
  ctx.rotate((baseAngle + raiseAngle) * Math.PI / 180);
  ctx.fillStyle = '#1e2d42'; ctx.fillRect(-5, 0, 10, 36);
  ctx.fillStyle = SKIN; ctx.beginPath(); ctx.arc(0, 36, 6, 0, Math.PI*2); ctx.fill();
  if (armRaise > 0.3) {
    // eraser block
    ctx.fillStyle = '#d4cfc0'; ctx.fillRect(-8, 34, 22, 11);
    ctx.strokeStyle = '#a09880'; ctx.lineWidth = 1; ctx.strokeRect(-8, 34, 22, 11);
  }
  ctx.restore();

  // head
  ctx.fillStyle = SKIN;
  ctx.beginPath(); ctx.ellipse(cx, G - 92, 16, 18, 0, 0, Math.PI*2); ctx.fill();

  // hair
  ctx.fillStyle = '#2c1810';
  ctx.beginPath(); ctx.ellipse(cx, G - 104, 16, 10, 0, Math.PI, Math.PI*2); ctx.fill();
  ctx.fillRect(cx - 16, G - 110, 32, 10);

  // eyes
  ctx.fillStyle = '#1a1010';
  ctx.fillRect(cx - 8, G - 96, 4, 4);
  ctx.fillRect(cx + 4, G - 96, 4, 4);

  // smile
  ctx.strokeStyle = SKIN_D; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(cx, G - 86, 5, 0.2, Math.PI - 0.2); ctx.stroke();
}

/** Gamer — hoodie, headset, controller, big energy */
export function drawGamer(
  ctx: CanvasRenderingContext2D,
  cx: number, ground: number,
  walkT: number,
  jump: number,     // 0–1 jump height factor
  celebrate: boolean,
  throwT = 0        // 0-1: arm raises up to shoot/throw
) {
  const G = ground - jump * 60;

  // shadow (stays on ground)
  const shadowScale = 1 - jump * 0.5;
  ctx.save(); ctx.globalAlpha = 0.15 * shadowScale;
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.ellipse(cx, ground + 2, 22, 5, 0, 0, Math.PI*2); ctx.fill();
  ctx.restore();

  // legs
  for (const [ox, phase] of [[-10, 0], [10, Math.PI]] as [number,number][]) {
    const s = jump > 0.1 ? (ox < 0 ? -30 : 30) : Math.sin(walkT * Math.PI * 2 + phase) * 22;
    ctx.save(); ctx.translate(cx + ox, G - 30);
    ctx.rotate(s * Math.PI / 180);
    ctx.fillStyle = '#2a1a4a'; ctx.fillRect(-5, 0, 10, 30);
    ctx.fillStyle = '#e84040'; ctx.beginPath(); ctx.roundRect(-6, 26, 15, 8, 3); ctx.fill();
    ctx.restore();
  }

  // hoodie body
  ctx.fillStyle = '#e67e22';
  ctx.beginPath(); ctx.roundRect(cx - 20, G - 80, 40, 52, 6); ctx.fill();

  // hoodie pocket
  ctx.fillStyle = '#c0650e';
  ctx.beginPath(); ctx.roundRect(cx - 12, G - 42, 24, 14, 3); ctx.fill();

  // arms + controller
  const armBob = celebrate ? Math.sin(walkT * Math.PI * 4) * 25 : Math.sin(walkT * Math.PI * 2) * 15;
  // left arm
  ctx.save(); ctx.translate(cx - 20, G - 72);
  ctx.rotate((-armBob - 15) * Math.PI / 180);
  ctx.fillStyle = '#e67e22'; ctx.fillRect(-5, 0, 10, 32);
  ctx.fillStyle = SKIN; ctx.beginPath(); ctx.arc(0, 32, 6, 0, Math.PI*2); ctx.fill();
  ctx.restore();
  // right arm — raises toward hoop when throwing
  const throwArmAngle = throwT > 0
    ? (throwT < 0.55 ? 15 - (throwT / 0.55) * 100 : -85 + ((throwT - 0.55) / 0.45) * 100)
    : armBob + 15;
  ctx.save(); ctx.translate(cx + 20, G - 72);
  ctx.rotate(throwArmAngle * Math.PI / 180);
  ctx.fillStyle = '#e67e22'; ctx.fillRect(-5, 0, 10, 32);
  ctx.fillStyle = SKIN; ctx.beginPath(); ctx.arc(0, 32, 6, 0, Math.PI*2); ctx.fill();
  ctx.restore();

  // controller (held between hands area)
  if (!celebrate) {
    ctx.fillStyle = '#222'; ctx.beginPath(); ctx.roundRect(cx - 16, G - 46, 32, 16, 6); ctx.fill();
    ctx.fillStyle = '#e84040'; ctx.beginPath(); ctx.arc(cx + 8, G - 40, 3, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#4040e8'; ctx.beginPath(); ctx.arc(cx + 3, G - 36, 3, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#444'; ctx.beginPath(); ctx.roundRect(cx - 12, G - 44, 8, 4, 2); ctx.fill();
  }

  // head
  ctx.fillStyle = SKIN;
  ctx.beginPath(); ctx.ellipse(cx, G - 94, 16, 18, 0, 0, Math.PI*2); ctx.fill();

  // headset band
  ctx.strokeStyle = '#111'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(cx, G - 94, 20, Math.PI, 0); ctx.stroke();
  // ear cups
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.ellipse(cx - 20, G - 94, 7, 9, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + 20, G - 94, 7, 9, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#e84040';
  ctx.beginPath(); ctx.ellipse(cx - 20, G - 94, 4, 5, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + 20, G - 94, 4, 5, 0, 0, Math.PI*2); ctx.fill();

  // hair under headset
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath(); ctx.ellipse(cx, G - 106, 14, 8, 0, Math.PI, Math.PI*2); ctx.fill();

  // eyes — wide open
  ctx.fillStyle = '#1a1010';
  ctx.fillRect(cx - 8, G - 99, 5, 6);
  ctx.fillRect(cx + 3, G - 99, 5, 6);
  ctx.fillStyle = '#fff';
  ctx.fillRect(cx - 7, G - 98, 2, 2);
  ctx.fillRect(cx + 4, G - 98, 2, 2);

  // mouth — grin
  ctx.strokeStyle = SKIN_D; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, G - 85, 7, 0.1, Math.PI - 0.1); ctx.stroke();
  if (celebrate) {
    // teeth
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(cx, G - 85, 6, 0.1, Math.PI - 0.1); ctx.fill();
    ctx.fillStyle = SKIN; ctx.fillRect(cx - 6, G - 88, 12, 4);
  }
}

/** Technical — dark hoodie, glasses, floating keyboard */
export function drawTechnical(
  ctx: CanvasRenderingContext2D,
  cx: number, ground: number,
  walkT: number,
  typing: number,   // 0–1
  teleportIn: number  // 0=fully visible, 1=fully teleported out
) {
  const G = ground;
  const alpha = 1 - teleportIn;

  ctx.save(); ctx.globalAlpha = alpha;

  // shadow
  ctx.save(); ctx.globalAlpha = 0.15 * alpha;
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.ellipse(cx, G + 2, 22, 5, 0, 0, Math.PI*2); ctx.fill();
  ctx.restore();

  // legs
  for (const [ox, phase] of [[-10, 0], [10, Math.PI]] as [number,number][]) {
    const s = Math.sin(walkT * Math.PI * 2 + phase) * 16;
    ctx.save(); ctx.translate(cx + ox, G - 34);
    ctx.rotate(s * Math.PI / 180);
    ctx.fillStyle = '#1a1a2a'; ctx.fillRect(-5, 0, 10, 34);
    ctx.fillStyle = '#0a0a14'; ctx.beginPath(); ctx.roundRect(-5, 30, 14, 8, 3); ctx.fill();
    ctx.restore();
  }

  // hoodie body
  ctx.fillStyle = '#1e1e2e';
  ctx.beginPath(); ctx.roundRect(cx - 20, G - 82, 40, 50, 6); ctx.fill();

  // hoodie strings
  ctx.strokeStyle = '#2a2a3e'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx - 5, G - 82); ctx.lineTo(cx - 8, G - 55); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + 5, G - 82); ctx.lineTo(cx + 8, G - 55); ctx.stroke();

  // green code glow on hoodie
  const glowPulse = 0.3 + typing * 0.4 + Math.sin(walkT * 8) * 0.1;
  ctx.fillStyle = `rgba(0,255,136,${glowPulse * 0.1})`;
  ctx.beginPath(); ctx.roundRect(cx - 20, G - 82, 40, 50, 6); ctx.fill();

  // arms — forward typing pose
  const typingBob = typing > 0 ? Math.sin(walkT * Math.PI * 8) * 5 : 0;
  ctx.save(); ctx.translate(cx - 20, G - 74);
  ctx.rotate((-50 + typingBob) * Math.PI / 180);
  ctx.fillStyle = '#1e1e2e'; ctx.fillRect(-5, 0, 10, 32);
  ctx.fillStyle = SKIN; ctx.beginPath(); ctx.arc(0, 32, 6, 0, Math.PI*2); ctx.fill();
  ctx.restore();

  ctx.save(); ctx.translate(cx + 20, G - 74);
  ctx.rotate((50 - typingBob) * Math.PI / 180);
  ctx.fillStyle = '#1e1e2e'; ctx.fillRect(-5, 0, 10, 32);
  ctx.fillStyle = SKIN; ctx.beginPath(); ctx.arc(0, 32, 6, 0, Math.PI*2); ctx.fill();
  ctx.restore();

  // floating keyboard
  if (typing > 0) {
    const kbY = G - 52 - typing * 12;
    ctx.fillStyle = 'rgba(0,20,10,0.9)';
    ctx.beginPath(); ctx.roundRect(cx - 28, kbY, 56, 18, 3); ctx.fill();
    ctx.strokeStyle = `rgba(0,255,136,${typing * 0.8})`; ctx.lineWidth = 1;
    ctx.strokeRect(cx - 28, kbY, 56, 18);
    // key rows
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 8; col++) {
        const kx = cx - 26 + col * 7;
        const ky = kbY + 3 + row * 7;
        ctx.fillStyle = `rgba(0,255,136,${0.3 + Math.sin(walkT * 15 + col + row) * 0.15})`;
        ctx.fillRect(kx, ky, 5, 5);
      }
    }
  }

  // head
  ctx.fillStyle = SKIN;
  ctx.beginPath(); ctx.ellipse(cx, G - 96, 16, 18, 0, 0, Math.PI*2); ctx.fill();

  // hoodie hood partially up
  ctx.fillStyle = '#181828';
  ctx.beginPath();
  ctx.arc(cx, G - 104, 19, Math.PI * 1.15, Math.PI * 1.85); ctx.fill();

  // glasses
  ctx.strokeStyle = '#88aacc'; ctx.lineWidth = 2;
  ctx.strokeRect(cx - 12, G - 101, 9, 7);
  ctx.strokeRect(cx + 3, G - 101, 9, 7);
  ctx.beginPath(); ctx.moveTo(cx - 3, G - 98); ctx.lineTo(cx + 3, G - 98); ctx.stroke();
  // lenses tint
  ctx.fillStyle = `rgba(0,255,136,0.12)`;
  ctx.fillRect(cx - 11, G - 100, 7, 5);
  ctx.fillRect(cx + 4, G - 100, 7, 5);

  // eyes behind glasses
  ctx.fillStyle = '#1a1010';
  ctx.fillRect(cx - 10, G - 99, 4, 4);
  ctx.fillRect(cx + 5, G - 99, 4, 4);

  // slight smirk
  ctx.strokeStyle = SKIN_D; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(cx + 2, G - 86, 4, 0.4, Math.PI - 0.8); ctx.stroke();

  // teleport pixel scatter effect
  if (teleportIn > 0) {
    for (let i = 0; i < 30; i++) {
      const px = cx + Math.sin(i * 137.5) * 40 * teleportIn;
      const py = G - 50 + Math.cos(i * 97.3) * 60 * teleportIn;
      ctx.fillStyle = `rgba(0,255,136,${(1 - teleportIn) * 0.8})`;
      ctx.fillRect(px, py, 3, 3);
    }
  }

  ctx.restore();
}
