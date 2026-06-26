import { useRef, useEffect } from 'react';
import { drawGamer } from '../../avatars';
import { easeInOut, easeOut, clamp, remap, MID } from '../../utils';
import styles from '../../PageTransition.module.css';

export function OvercookedEffect({ onMid, onDone }: { onMid: () => void; onDone: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width  = window.innerWidth;
    const H = canvas.height = window.innerHeight;
    const cx = W / 2;
    const GROUND = H * 0.78;
    // kitchen layout
    const COUNTER_Y  = GROUND - 10;
    const COUNTER_H  = H - COUNTER_Y;
    const STOVE_X    = W * 0.25;
    const BOARD_X    = cx;
    const WINDOW_X   = W * 0.76;
    const WINDOW_Y   = H * 0.32;
    const WINDOW_W   = Math.min(W * 0.16, 110);
    const WINDOW_H   = Math.min(H * 0.14, 80);

    // wife character (purple hoodie, bun hair)
    function drawWife(wx: number, wy: number, walkCycle: number, jumpFrac: number, celebrate: boolean) {
      const s = 1;
      const bobY = celebrate ? Math.abs(Math.sin(walkCycle * Math.PI * 2)) * 10 : 0;
      const jY   = jumpFrac * 50;
      const by   = wy - jY - bobY;

      // shadow
      ctx.save(); ctx.globalAlpha = 0.18;
      ctx.beginPath(); ctx.ellipse(wx, wy - 2, 18 * s, 5 * s, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#000'; ctx.fill(); ctx.restore();

      // legs – walk cycle
      const legSwing = Math.sin(walkCycle * Math.PI * 2) * (celebrate ? 20 : 14);
      ctx.save();
      ctx.strokeStyle = '#6b2fa0'; ctx.lineWidth = 7 * s; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(wx, by - 28 * s); ctx.lineTo(wx - 7 * s + legSwing, by); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(wx, by - 28 * s); ctx.lineTo(wx + 7 * s - legSwing, by); ctx.stroke();
      ctx.restore();

      // body – purple hoodie
      const bodyGrad = ctx.createLinearGradient(wx - 14 * s, by - 56 * s, wx + 14 * s, by - 26 * s);
      bodyGrad.addColorStop(0, '#8e44d9'); bodyGrad.addColorStop(1, '#6b2fa0');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath(); ctx.roundRect(wx - 14 * s, by - 60 * s, 28 * s, 34 * s, 6 * s);
      ctx.fill();
      // hoodie pocket
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath(); ctx.roundRect(wx - 8 * s, by - 38 * s, 16 * s, 10 * s, 3 * s); ctx.fill();

      // arms – carry/celebrate
      const armSwing = Math.sin(walkCycle * Math.PI * 2) * 18;
      const armRaise = celebrate ? Math.min(remap(Math.sin(walkCycle * 3), -1, 1), 1) * 20 : 0;
      ctx.strokeStyle = '#8e44d9'; ctx.lineWidth = 7 * s; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(wx - 14 * s, by - 54 * s);
      ctx.lineTo(wx - 26 * s, by - 40 * s + armSwing - armRaise);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(wx + 14 * s, by - 54 * s);
      ctx.lineTo(wx + 26 * s, by - 40 * s - armSwing - armRaise);
      ctx.stroke();

      // head
      ctx.fillStyle = '#f5c5a3';
      ctx.beginPath(); ctx.arc(wx, by - 70 * s, 14 * s, 0, Math.PI * 2); ctx.fill();

      // hair bun (top)
      ctx.fillStyle = '#4a2010';
      ctx.beginPath(); ctx.arc(wx, by - 83 * s, 10 * s, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(wx + 6 * s, by - 80 * s, 7 * s, 0, Math.PI * 2); ctx.fill();
      // side strands
      ctx.strokeStyle = '#4a2010'; ctx.lineWidth = 3 * s; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(wx - 13 * s, by - 72 * s); ctx.lineTo(wx - 16 * s, by - 60 * s); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(wx + 13 * s, by - 72 * s); ctx.lineTo(wx + 16 * s, by - 60 * s); ctx.stroke();

      // eyes
      ctx.fillStyle = '#333';
      ctx.beginPath(); ctx.arc(wx - 5 * s, by - 70 * s, 2 * s, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(wx + 5 * s, by - 70 * s, 2 * s, 0, Math.PI * 2); ctx.fill();
      if (celebrate) {
        // happy ^^ eyes
        ctx.strokeStyle = '#333'; ctx.lineWidth = 1.5 * s; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(wx - 5 * s, by - 69 * s, 3 * s, Math.PI, 0); ctx.stroke();
        ctx.beginPath(); ctx.arc(wx + 5 * s, by - 69 * s, 3 * s, Math.PI, 0); ctx.stroke();
      }

      // chef hat
      ctx.fillStyle = '#fff';
      ctx.fillRect(wx - 10 * s, by - 90 * s, 20 * s, 8 * s);
      ctx.beginPath(); ctx.arc(wx, by - 93 * s, 10 * s, Math.PI, 0); ctx.fill();
      ctx.strokeStyle = '#ddd'; ctx.lineWidth = 1;
      ctx.strokeRect(wx - 10 * s, by - 90 * s, 20 * s, 8 * s);
    }

    function drawKitchen() {
      // counter top
      const cGrad = ctx.createLinearGradient(0, COUNTER_Y, 0, COUNTER_Y + COUNTER_H);
      cGrad.addColorStop(0, '#8a6a3c'); cGrad.addColorStop(1, '#5a3e1e');
      ctx.fillStyle = cGrad; ctx.fillRect(0, COUNTER_Y, W, COUNTER_H);
      ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(0, COUNTER_Y, W, 3);

      // stove
      ctx.fillStyle = '#2a2a2a';
      ctx.beginPath(); ctx.roundRect(STOVE_X - 50, COUNTER_Y - 50, 100, 50, 4); ctx.fill();
      for (const [bx, by2] of [[STOVE_X - 22, COUNTER_Y - 30], [STOVE_X + 22, COUNTER_Y - 30]]) {
        ctx.strokeStyle = '#444'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(bx, by2, 14, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = '#555'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(bx, by2, 8, 0, Math.PI * 2); ctx.stroke();
      }

      // cutting board
      ctx.fillStyle = '#c4874a';
      ctx.beginPath(); ctx.roundRect(BOARD_X - 40, COUNTER_Y - 16, 80, 14, 3); ctx.fill();

      // delivery window
      ctx.fillStyle = '#1a0a04';
      ctx.fillRect(WINDOW_X - WINDOW_W / 2, WINDOW_Y, WINDOW_W, WINDOW_H);
      ctx.strokeStyle = '#8a6a3c'; ctx.lineWidth = 4;
      ctx.strokeRect(WINDOW_X - WINDOW_W / 2, WINDOW_Y, WINDOW_W, WINDOW_H);
      ctx.font = `bold ${Math.floor(Math.min(W * 0.018, 13))}px monospace`;
      ctx.textAlign = 'center'; ctx.fillStyle = '#c47829';
      ctx.fillText('ORDER', WINDOW_X, WINDOW_Y + WINDOW_H + 16);
      ctx.fillText('HERE', WINDOW_X, WINDOW_Y + WINDOW_H + 29);

      // wall tiles bg hint
      ctx.save(); ctx.globalAlpha = 0.06;
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 0.5;
      for (let tx = 0; tx < W; tx += 32) ctx.strokeRect(tx, 0, 32, 32);
      for (let ty = 0; ty < COUNTER_Y; ty += 32) ctx.strokeRect(0, ty, W, 32);
      ctx.restore();
    }

    // bubbling pot on stove
    function drawPot(shake: number) {
      const potX = STOVE_X;
      const potY = COUNTER_Y - 52;
      const wobble = Math.sin(shake * Math.PI * 2) * 2;
      ctx.fillStyle = '#333';
      ctx.beginPath(); ctx.ellipse(potX + wobble, potY, 24, 14, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#555';
      ctx.beginPath(); ctx.ellipse(potX + wobble, potY - 8, 22, 10, 0, 0, Math.PI * 2); ctx.fill();
      // lid
      ctx.fillStyle = '#666';
      ctx.beginPath(); ctx.ellipse(potX + wobble, potY - 16, 24, 7, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#888';
      ctx.beginPath(); ctx.arc(potX + wobble, potY - 22, 5, 0, Math.PI * 2); ctx.fill();
      // steam
      if (Math.sin(shake * Math.PI * 3) > 0.3) {
        ctx.save(); ctx.globalAlpha = 0.35;
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.lineCap = 'round';
        for (const sx of [-10, 0, 10]) {
          const sw = Math.sin(shake * Math.PI * 4 + sx) * 4;
          ctx.beginPath();
          ctx.moveTo(potX + sx, potY - 26);
          ctx.quadraticCurveTo(potX + sx + sw, potY - 40, potX + sx, potY - 52);
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    // plate being carried
    function drawPlate(px: number, py: number, complete: boolean) {
      ctx.fillStyle = '#f0f0f0';
      ctx.beginPath(); ctx.ellipse(px, py, 20, 7, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#ddd'; ctx.lineWidth = 1; ctx.stroke();
      if (complete) {
        // food on plate
        ctx.fillStyle = '#e84040'; ctx.beginPath(); ctx.arc(px - 6, py - 2, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#f5a623'; ctx.beginPath(); ctx.arc(px + 4, py - 3, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#7ed321'; ctx.beginPath(); ctx.arc(px + 2, py + 2, 3, 0, Math.PI * 2); ctx.fill();
      }
    }

    // flying ingredient
    function drawIngredient(ix: number, iy: number, type: number) {
      ctx.save(); ctx.translate(ix, iy);
      if (type === 0) { // tomato
        ctx.fillStyle = '#e84040'; ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#6db33f'; ctx.fillRect(-2, -11, 4, 6);
      } else if (type === 1) { // onion
        ctx.fillStyle = '#d4a827'; ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#b8911f'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(0, 0, 5, 3, 0, 0, Math.PI * 2); ctx.stroke();
      } else { // lettuce
        ctx.fillStyle = '#7ed321'; ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#5aaa10';
        ctx.beginPath(); ctx.arc(-3, -2, 5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(3, -2, 5, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }

    // confetti on WIN
    type Confetti = { x: number; y: number; vx: number; vy: number; color: string; rot: number; vrot: number };
    const confetti: Confetti[] = [];
    const CCOLS = ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#ff6bca','#fff'];
    function spawnConfetti() {
      for (let i = 0; i < 70; i++) {
        confetti.push({
          x: cx + (Math.random() - 0.5) * W * 0.6,
          y: -10,
          vx: (Math.random() - 0.5) * 6,
          vy: Math.random() * 5 + 2,
          color: CCOLS[i % CCOLS.length],
          rot: Math.random() * Math.PI * 2,
          vrot: (Math.random() - 0.5) * 0.2,
        });
      }
    }

    const DUR = 2600;
    let confettiSpawned = false;
    let fired = false;
    const start = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const t = Math.min((now - start) / DUR, 1);
      if (t >= MID && !fired) { fired = true; onMid(); }
      if (t >= MID && !confettiSpawned) { confettiSpawned = true; spawnConfetti(); }

      ctx.clearRect(0, 0, W, H);

      // kitchen bg
      const bgA = t < 0.06 ? t / 0.06 : t > 0.9 ? 1 - remap(t, 0.9, 1) : 1;
      const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
      bgGrad.addColorStop(0, `rgba(18,10,6,${bgA * 0.96})`);
      bgGrad.addColorStop(1, `rgba(28,16,8,${bgA * 0.96})`);
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, W, H);

      ctx.save(); ctx.globalAlpha = bgA;
      drawKitchen();
      ctx.restore();

      // ── Timer bar (top center, counts down 0→MID) ──
      {
        const timerA = clamp(remap(t, 0.06, 0.14), 0, 1) * bgA;
        const timerFill = t < MID ? 1 - t / MID : 0;
        const barW = Math.min(W * 0.3, 220); const barH = 18;
        const barX = cx - barW / 2; const barY = H * 0.07;
        ctx.save(); ctx.globalAlpha = timerA;
        // bg
        ctx.fillStyle = '#111'; ctx.beginPath(); ctx.roundRect(barX - 8, barY - 24, barW + 16, barH + 32, 6); ctx.fill();
        ctx.font = `bold ${Math.floor(Math.min(W * 0.02, 14))}px monospace`;
        ctx.textAlign = 'center'; ctx.fillStyle = '#c47829';
        ctx.fillText('TIME LEFT', cx, barY - 8);
        // track
        ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.beginPath(); ctx.roundRect(barX, barY, barW, barH, 6); ctx.fill();
        const fillColor = timerFill > 0.4 ? '#44dd44' : timerFill > 0.2 ? '#ffaa00' : '#ff4444';
        ctx.fillStyle = fillColor; ctx.beginPath(); ctx.roundRect(barX, barY, barW * timerFill, barH, 6); ctx.fill();
        // pulse when low
        if (timerFill < 0.25 && Math.sin(t * 25) > 0) {
          ctx.save(); ctx.globalAlpha = 0.3; ctx.fillStyle = '#ff4444';
          ctx.beginPath(); ctx.roundRect(barX, barY, barW * timerFill, barH, 6); ctx.fill(); ctx.restore();
        }
        ctx.restore();
      }

      // pot bubbling
      ctx.save(); ctx.globalAlpha = bgA;
      drawPot(t * 6);
      ctx.restore();

      // ── Flying ingredient (gamer throws to wife 0.08→0.34) ──
      if (t > 0.08 && t < 0.38) {
        const ft = easeInOut(clamp(remap(t, 0.08, 0.34), 0, 1));
        const fromX = W * 0.18; const fromY = GROUND - 60;
        const toX = BOARD_X; const toY = COUNTER_Y - 30;
        const ix = fromX + (toX - fromX) * ft;
        const iy = fromY + (toY - fromY) * ft - Math.sin(ft * Math.PI) * 60;
        ctx.save(); ctx.globalAlpha = bgA * (t > 0.30 ? 1 - remap(t, 0.30, 0.38) : 1);
        drawIngredient(ix, iy, 0);
        ctx.restore();
      }

      // second ingredient (wife throws back 0.28→0.52)
      if (t > 0.28 && t < 0.56) {
        const ft = easeInOut(clamp(remap(t, 0.28, 0.52), 0, 1));
        const fromX = BOARD_X; const fromY = COUNTER_Y - 30;
        const toX = STOVE_X; const toY = COUNTER_Y - 60;
        const ix = fromX + (toX - fromX) * ft;
        const iy = fromY + (toY - fromY) * ft - Math.sin(ft * Math.PI) * 45;
        ctx.save(); ctx.globalAlpha = bgA * (t > 0.48 ? 1 - remap(t, 0.48, 0.56) : 1);
        drawIngredient(ix, iy, 1);
        ctx.restore();
      }

      // third ingredient (gamer runs plate to window at MID)
      if (t > 0.36 && t < 0.56) {
        const ft = easeInOut(clamp(remap(t, 0.36, 0.52), 0, 1));
        const fromX = BOARD_X; const fromY = COUNTER_Y - 24;
        const toX = W * 0.62;
        const ix = fromX + (toX - fromX) * ft;
        ctx.save(); ctx.globalAlpha = bgA * (t > 0.48 ? 1 - remap(t, 0.48, 0.56) : 1);
        drawIngredient(ix, fromY, 2);
        ctx.restore();
      }

      // plate carried by gamer toward window (0.44→MID)
      if (t > 0.44 && t < MID + 0.06) {
        const ft = clamp(remap(t, 0.44, MID), 0, 1);
        const px = W * 0.34 + ft * (WINDOW_X - W * 0.34);
        const plateA = t > MID ? 1 - remap(t, MID, MID + 0.06) : 1;
        ctx.save(); ctx.globalAlpha = bgA * plateA;
        drawPlate(px, COUNTER_Y - 24, t > 0.48);
        ctx.restore();
      }

      // ── ORDER COMPLETE! (MID → MID+0.38) ──
      if (t >= MID && t < MID + 0.42) {
        const ot = remap(t, MID, MID + 0.42);
        const scale = ot < 0.2 ? easeOut(ot / 0.2) * 1.2 : 1 + (1 - easeInOut((ot - 0.2) / 0.8)) * 0.2;
        const alpha = ot < 0.1 ? ot / 0.1 : ot > 0.82 ? 1 - remap(ot, 0.82, 1) : 1;
        ctx.save(); ctx.globalAlpha = alpha * bgA;
        ctx.translate(cx, H * 0.38); ctx.scale(scale, scale);
        ctx.font = `bold ${clamp(W * 0.075, 36, 68)}px monospace`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffd93d'; ctx.shadowColor = '#ffa500'; ctx.shadowBlur = 28;
        ctx.fillText('ORDER COMPLETE!', 0, 0);
        ctx.shadowBlur = 0;
        // three stars below
        const starFS = clamp(W * 0.06, 28, 52);
        ctx.font = `${starFS}px serif`;
        const delay = ot > 0.15 ? 1 : 0;
        if (delay) ctx.fillText('⭐  ⭐  ⭐', 0, starFS * 1.1);
        ctx.restore();
      }

      // confetti
      if (confetti.length) {
        ctx.save(); ctx.globalAlpha = bgA;
        for (const p of confetti) {
          p.x += p.vx; p.y += p.vy; p.rot += p.vrot;
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
          ctx.fillStyle = p.color; ctx.fillRect(-5, -3, 10, 6);
          ctx.restore();
        }
        ctx.restore();
      }

      // ── Gamer (player 1) – walks in from left ──
      const av1In  = easeOut(clamp(remap(t, 0, 0.12), 0, 1));
      const av1Out = clamp(remap(t, 0.86, 0.98), 0, 1);
      const av1A   = av1Out > 0 ? 1 - av1Out : av1In;
      // gamer runs toward window at MID, then celebrates
      const gamerX = t > MID
        ? W * 0.32 + clamp(remap(t, MID, MID + 0.14), 0, 1) * (W * 0.18)
        : t > 0.44
        ? W * 0.22 + clamp(remap(t, 0.44, MID), 0, 1) * (W * 0.32 - W * 0.22)
        : W * 0.22;
      const jump1  = t > MID + 0.1 ? Math.abs(Math.sin(remap(t, MID + 0.1, 0.86) * Math.PI * 2.5)) * 0.7 : 0;
      ctx.save(); ctx.globalAlpha = Math.max(av1A, 0) * bgA;
      drawGamer(ctx, gamerX, GROUND, t * 7, jump1, t > MID + 0.1);
      ctx.restore();

      // ── Wife (player 2) – walks in from right ──
      const av2In  = easeOut(clamp(remap(t, 0.04, 0.16), 0, 1));
      const av2Out = clamp(remap(t, 0.86, 0.98), 0, 1);
      const av2A   = av2Out > 0 ? 1 - av2Out : av2In;
      // wife stays near cutting board, then moves to celebrate
      const wifeX = t > MID + 0.1
        ? BOARD_X + clamp(remap(t, MID + 0.1, MID + 0.25), 0, 1) * (W * 0.12)
        : BOARD_X;
      const jump2  = t > MID + 0.12 ? Math.abs(Math.sin(remap(t, MID + 0.12, 0.86) * Math.PI * 2)) * 0.6 : 0;
      ctx.save(); ctx.globalAlpha = Math.max(av2A, 0) * bgA;
      drawWife(wifeX, GROUND, t * 6, jump2, t > MID + 0.12);
      ctx.restore();

      if (t < 1) { raf = requestAnimationFrame(tick); }
      else { ctx.clearRect(0, 0, W, H); onDone(); }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onMid, onDone]);

  return <canvas ref={ref} className={styles.canvas} />;
}
