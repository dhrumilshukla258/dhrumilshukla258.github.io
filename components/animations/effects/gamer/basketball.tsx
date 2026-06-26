import { useRef, useEffect } from 'react';
import { drawGamer } from '../../avatars';
import { easeInOut, easeOut, clamp, remap, MID } from '../../utils';
import styles from '../../PageTransition.module.css';

export function BasketballEffect({ onMid, onDone }: { onMid: () => void; onDone: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width  = window.innerWidth;
    const H = canvas.height = window.innerHeight;
    const GROUND = H * 0.78;
    const hoopX  = W * 0.74;
    const hoopY  = H * 0.30;
    const rimR   = Math.min(W * 0.032, 24);
    const avX    = W * 0.24;
    const ballStartX = avX + 30;
    const ballStartY = GROUND - 100;
    const arcPeak    = H * 0.12;

    function drawCourt() {
      const floorGrad = ctx.createLinearGradient(0, GROUND, 0, H);
      floorGrad.addColorStop(0, '#6b3b12'); floorGrad.addColorStop(1, '#3e1f06');
      ctx.fillStyle = floorGrad; ctx.fillRect(0, GROUND, W, H - GROUND);
      ctx.save(); ctx.globalAlpha = 0.18;
      for (let px = 0; px < W; px += Math.max(W * 0.04, 32)) {
        ctx.strokeStyle = '#000'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(px, GROUND); ctx.lineTo(px, H); ctx.stroke();
      }
      ctx.restore();
      ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, GROUND); ctx.lineTo(W, GROUND); ctx.stroke();
    }

    function drawHoop(netSwing: number) {
      ctx.strokeStyle = '#555'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(hoopX + rimR * 1.8, GROUND); ctx.lineTo(hoopX + rimR * 1.8, hoopY); ctx.stroke();
      ctx.fillStyle = 'rgba(180,200,220,0.22)'; ctx.strokeStyle = '#aaa'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(hoopX + rimR * 0.8, hoopY - rimR * 1.6, rimR * 2, rimR * 2.4, 3);
      ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,80,0,0.6)'; ctx.lineWidth = 1.5;
      ctx.strokeRect(hoopX + rimR * 1.1, hoopY - rimR * 1.1, rimR * 1.1, rimR * 0.9);
      ctx.strokeStyle = '#e05500'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.ellipse(hoopX, hoopY, rimR, rimR * 0.28, 0, 0, Math.PI * 2); ctx.stroke();
      const netH = rimR * 1.8; const netBot = rimR * 0.5;
      const swing = Math.sin(netSwing * Math.PI) * rimR * 0.3;
      ctx.save(); ctx.globalAlpha = 0.7; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1;
      for (let s = 0; s < 8; s++) {
        const angle = (s / 8) * Math.PI * 2;
        const tx = hoopX + Math.cos(angle) * rimR; const ty = hoopY + Math.sin(angle) * rimR * 0.28;
        const bx = hoopX + Math.cos(angle) * netBot + swing * Math.cos(angle); const by = hoopY + netH + swing;
        ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(bx, by); ctx.stroke();
      }
      for (let r = 0; r < 3; r++) {
        const ry = hoopY + (r + 1) * (netH / 3.5);
        const rr = rimR * (1 - r * 0.2) * (netBot / rimR + (1 - netBot / rimR) * (r / 3));
        const swingY = swing * (r / 3);
        ctx.beginPath(); ctx.ellipse(hoopX + swingY * 0.3, ry + swingY, rr, rr * 0.22, 0, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.restore();
    }

    function drawBall(bx: number, by: number, spin: number) {
      const r = Math.min(W * 0.025, 20);
      const grad = ctx.createRadialGradient(bx - r * 0.3, by - r * 0.3, r * 0.05, bx, by, r);
      grad.addColorStop(0, '#f87c2a'); grad.addColorStop(1, '#b34800');
      ctx.beginPath(); ctx.arc(bx, by, r, 0, Math.PI * 2); ctx.fillStyle = grad; ctx.fill();
      ctx.save(); ctx.translate(bx, by); ctx.rotate(spin);
      ctx.strokeStyle = '#7a2e00'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(0, 0, r, Math.PI * 0.1, Math.PI * 0.9); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, r, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
      ctx.setLineDash([3, 3]); ctx.strokeStyle = '#7a2e00'; ctx.stroke(); ctx.setLineDash([]);
      ctx.restore();
    }

    type Particle = { x: number; y: number; vx: number; vy: number; color: string; size: number; rot: number; vrot: number };
    const particles: Particle[] = [];
    const COLORS = ['#f87c2a', '#ffdd00', '#00cfff', '#ff4488', '#fff', '#44ff88'];
    function spawnConfetti() {
      for (let i = 0; i < 60; i++) {
        particles.push({
          x: hoopX + (Math.random() - 0.5) * 60, y: hoopY,
          vx: (Math.random() - 0.5) * 8, vy: -Math.random() * 12 - 4,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          size: Math.random() * 8 + 4, rot: Math.random() * Math.PI * 2, vrot: (Math.random() - 0.5) * 0.3,
        });
      }
    }

    const DUR = 1600;
    let confettiSpawned = false;
    let fired = false;
    const start = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const t = Math.min((now - start) / DUR, 1);
      if (t >= MID && !fired) { fired = true; onMid(); }
      if (t >= MID && !confettiSpawned) { confettiSpawned = true; spawnConfetti(); }

      ctx.clearRect(0, 0, W, H);
      const bgA = t < 0.06 ? t / 0.06 : t > 0.9 ? 1 - remap(t, 0.9, 1) : 1;
      ctx.fillStyle = `rgba(6,6,10,${bgA * 0.94})`; ctx.fillRect(0, 0, W, H);

      // crowd silhouette top
      ctx.save(); ctx.globalAlpha = bgA * 0.14;
      for (let ci = 0; ci < W; ci += 22) {
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ci, H * 0.1 + Math.sin(ci) * 8, 7, 0, Math.PI); ctx.fill();
      }
      ctx.restore();

      ctx.save(); ctx.globalAlpha = bgA;
      drawCourt();
      const netSwing = t > MID && t < MID + 0.18 ? remap(t, MID, MID + 0.18) : 0;
      drawHoop(netSwing);
      ctx.restore();

      // ball arc
      const ballT = clamp(remap(t, 0.28, 0.52), 0, 1);
      if (t < 0.56) {
        const bx = ballStartX + (hoopX - ballStartX) * easeInOut(ballT);
        const straightY = ballStartY + (hoopY - ballStartY) * ballT;
        const by = straightY - arcPeak * Math.sin(ballT * Math.PI);
        ctx.save(); ctx.globalAlpha = bgA;
        drawBall(bx, by, t * 12);
        ctx.globalAlpha = bgA * 0.18;
        ctx.beginPath(); ctx.ellipse(bx, GROUND + 4, 18 * (0.3 + ballT * 0.7), 4, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#000'; ctx.fill();
        ctx.restore();
      }

      // ball drops through net
      if (t >= 0.52 && t < 0.7) {
        const dropT = remap(t, 0.52, 0.7);
        ctx.save(); ctx.globalAlpha = bgA * (1 - dropT * 0.6);
        drawBall(hoopX, hoopY + dropT * (GROUND - hoopY) * 0.5, t * 12);
        ctx.restore();
      }

      // confetti
      if (particles.length) {
        ctx.save(); ctx.globalAlpha = bgA;
        for (const p of particles) {
          p.x += p.vx; p.y += p.vy; p.vy += 0.4; p.rot += p.vrot;
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
          ctx.fillStyle = p.color; ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
          ctx.restore();
        }
        ctx.restore();
      }

      // SWISH!
      if (t > MID && t < MID + 0.38) {
        const st = remap(t, MID, MID + 0.38);
        const scale = st < 0.15 ? easeOut(st / 0.15) * 1.3 : 1 + (1 - easeInOut((st - 0.15) / 0.85)) * 0.3;
        const alpha = st < 0.08 ? st / 0.08 : st > 0.78 ? 1 - remap(st, 0.78, 1) : 1;
        ctx.save(); ctx.globalAlpha = alpha * bgA;
        ctx.translate(hoopX, hoopY - 60); ctx.scale(scale, scale);
        ctx.font = `bold ${clamp(W * 0.07, 36, 64)}px monospace`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffdd00'; ctx.shadowColor = '#ffdd00'; ctx.shadowBlur = 24;
        ctx.fillText('SWISH!', 0, 0);
        ctx.font = `bold ${clamp(W * 0.025, 14, 22)}px monospace`;
        ctx.fillStyle = '#fff'; ctx.shadowBlur = 8;
        ctx.fillText('+2 PTS', 0, clamp(W * 0.07, 36, 64) * 0.9);
        ctx.restore();
      }

      // scoreboard
      if (t > 0.1) {
        const sbA = clamp(remap(t, 0.1, 0.22), 0, 1) * bgA;
        const score = t > MID ? '2' : '0';
        const sbW = Math.min(W * 0.22, 160); const sbH = 48;
        ctx.save(); ctx.globalAlpha = sbA;
        ctx.fillStyle = '#111'; ctx.beginPath(); ctx.roundRect(W / 2 - sbW / 2, H * 0.06, sbW, sbH, 6); ctx.fill();
        ctx.strokeStyle = '#333'; ctx.lineWidth = 1; ctx.stroke();
        ctx.font = `bold ${Math.min(W * 0.028, 22)}px monospace`;
        ctx.textAlign = 'center'; ctx.fillStyle = '#f87c2a';
        ctx.fillText(`HOME  ${score}  AWAY`, W / 2, H * 0.06 + 30);
        ctx.restore();
      }

      // avatar
      const avIn  = easeOut(clamp(remap(t, 0, 0.14), 0, 1));
      const avOut = clamp(remap(t, 0.86, 0.98), 0, 1);
      const avA   = avOut > 0 ? 1 - avOut : avIn;
      const jump      = t > MID + 0.08 ? Math.abs(Math.sin(remap(t, MID + 0.08, 0.82) * Math.PI * 1.5)) * 0.6 : 0;
      const throwAnim = t > 0.22 && t < 0.56 ? clamp(remap(t, 0.22, 0.56), 0, 1) : 0;
      ctx.save(); ctx.globalAlpha = Math.max(avA, 0) * bgA;
      drawGamer(ctx, avX, GROUND, t * 5, jump, t > MID + 0.08, throwAnim);
      ctx.restore();

      if (t < 1) { raf = requestAnimationFrame(tick); }
      else { ctx.clearRect(0, 0, W, H); onDone(); }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onMid, onDone]);

  return <canvas ref={ref} className={styles.canvas} />;
}
