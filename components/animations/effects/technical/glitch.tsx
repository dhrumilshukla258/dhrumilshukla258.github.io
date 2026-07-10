import { useRef, useEffect } from 'react';
import { drawTechnical } from '../../avatars';
import { easeOut, remap, MID } from '../../utils';
import styles from '../../PageTransition.module.css';

export function GlitchEffect({ onMid, onDone }: { onMid: () => void; onDone: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width  = window.innerWidth;
    const H = canvas.height = window.innerHeight;

    const FONT = 13;
    const COLS  = Math.floor(W / FONT);
    const drops = Array.from({ length: COLS }, (_, i) => ({
      y:     -Math.abs(Math.sin(i * 1.7)) * H * 0.7,
      speed: 0.7 + Math.abs(Math.sin(i * 0.9)) * 1.5,
    }));
    const CHARS = '01アイウエカキクサシスタニナ<>{}|∑∆∂∫#@$%&';

    const bands = Array.from({ length: 12 }, (_, i) => ({
      y:    (i / 12) * H,
      h:    H / 12,
      seed: Math.sin(i * 3.7),
    }));

    const DUR = 1500;
    const GROUND = H * 0.82;
    let fired = false;
    const start = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const t = Math.min((now - start) / DUR, 1);
      if (t >= MID && !fired) { fired = true; onMid(); }

      ctx.clearRect(0, 0, W, H);

      const bgA = t < 0.08 ? t / 0.08 : t > 0.88 ? 1 - remap(t, 0.88, 1) : 1;
      ctx.fillStyle = `rgba(0,4,2,${bgA * 0.94})`; ctx.fillRect(0, 0, W, H);

      // glitch bands — offset scales with width so tearing reads as a subtle
      // scanline glitch on narrow phones instead of tearing the whole screen
      const bandOffset = Math.min(38, W * 0.09);
      if (t < 0.72) {
        const gt = t / 0.72;
        bands.forEach((b, i) => {
          const intensity = Math.sin(t * 14 + i * 2.1) * Math.sin(t * 7 + i);
          const offset    = intensity * bandOffset * b.seed * easeOut(Math.min(gt * 2, 1));
          if (Math.abs(offset) < 2) return;
          ctx.save(); ctx.globalAlpha = Math.abs(intensity) * 0.55;
          ctx.fillStyle = intensity > 0 ? 'rgba(0,255,180,0.13)' : 'rgba(255,50,80,0.13)';
          ctx.fillRect(Math.max(offset, 0), b.y, W - Math.abs(offset), b.h);
          ctx.fillStyle = intensity > 0 ? '#00ffaa' : '#ff3355';
          ctx.globalAlpha = Math.abs(intensity) * 0.35;
          ctx.fillRect(offset, b.y, W, 1);
          ctx.restore();
        });
      }

      // binary rain
      if (t > 0.04 && t < 0.94) {
        const rainT = remap(t, 0.04, 0.94);
        const rainA = rainT < 0.12 ? rainT / 0.12 : rainT > 0.82 ? 1 - remap(rainT, 0.82, 1) : 1;
        ctx.save(); ctx.font = `${FONT}px monospace`;
        // steps tied to H so rain fills tall portrait screens instead of
        // stopping partway down (previously a fixed frame-time budget)
        drops.forEach((drop, col) => {
          const steps = Math.ceil((rainT * (H + FONT * drop.speed)) / (FONT * drop.speed));
          for (let row = 0; row < steps; row++) {
            const charY = drop.y + row * FONT * drop.speed;
            if (charY < 0 || charY > H) continue;
            const char = CHARS[Math.floor(Math.abs(Math.sin(col * 13.7 + row * 7.3 + t * 20)) * CHARS.length)];
            const isHead = row === steps - 1;
            ctx.globalAlpha = (1 - row / steps) * rainA * 0.85;
            ctx.fillStyle = isHead ? '#ccffee' : row % 3 === 0 ? '#00ff88' : '#006e44';
            ctx.fillText(char, col * FONT, charY);
          }
        });
        ctx.restore();
      }

      // scan line reveal
      if (t > 0.55) {
        const st  = remap(t, 0.55, 1.0);
        const sy  = easeOut(st) * H;
        ctx.save(); ctx.globalAlpha = easeOut(st) * 0.65;
        const sg = ctx.createLinearGradient(0, sy - 28, 0, sy + 4);
        sg.addColorStop(0, 'rgba(0,255,136,0)'); sg.addColorStop(0.8, 'rgba(0,255,136,0.55)'); sg.addColorStop(1, 'rgba(0,255,136,1)');
        ctx.fillStyle = sg; ctx.fillRect(0, sy - 28, W, 32);
        ctx.globalAlpha = easeOut(st) * 0.45;
        ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(0, 0, W, sy);
        ctx.restore();
      }

      // ACCESS GRANTED
      if (t > MID && t < 0.84) {
        const at = remap(t, MID, 0.84);
        const a  = at < 0.18 ? at / 0.18 : at > 0.78 ? 1 - remap(at, 0.78, 1) : 1;
        const titleSize = Math.max(16, Math.min(30, Math.floor(W * 0.07)));
        const subSize   = Math.max(10, Math.min(13, Math.floor(W * 0.032)));
        ctx.save(); ctx.globalAlpha = a;
        ctx.font = `bold ${titleSize}px monospace`; ctx.textAlign = 'center';
        ctx.fillStyle = '#00ff88'; ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 16;
        ctx.fillText('[ ACCESS GRANTED ]', W / 2, H * 0.35);
        ctx.font = `${subSize}px monospace`; ctx.fillStyle = 'rgba(0,255,136,0.5)'; ctx.shadowBlur = 0;
        const sub = W < 480 ? 'sudo personality-switch ✓' : 'sudo personality-switch --target=technical   ✓';
        ctx.fillText(sub, W / 2, H * 0.35 + titleSize + 4);
        ctx.restore();
      }

      const teleOut = remap(t, 0.84, 1.0);
      const typingT = remap(t, 0.04, 0.80);
      drawTechnical(ctx, W * 0.72, GROUND, t * 5, typingT, teleOut);

      if (t < 1) { raf = requestAnimationFrame(tick); }
      else { ctx.clearRect(0, 0, W, H); onDone(); }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onMid, onDone]);

  return <canvas ref={ref} className={styles.canvas} />;
}
