import { useRef, useEffect } from 'react';
import { drawProfessional } from '../../avatars';
import { easeInOut, easeOut, clamp, remap, MID } from '../../utils';
import { owner } from '@/data/owner';
import styles from '../../PageTransition.module.css';

export function TypewriterEffect({ onMid, onDone }: { onMid: () => void; onDone: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width  = window.innerWidth;
    const H = canvas.height = window.innerHeight;
    const cx = W / 2;
    const GROUND = H * 0.82;
    const TWX = cx;
    const TWY = GROUND - 60;

    const PAPER_LINES = [
      `NAME    : ${owner.name}`,
      'MODE    : PROFESSIONAL',
      'STATUS  : Active',
      `ROLE    : ${owner.title}`,
      'CREDS   : Verified ✓',
      '────────────────────────',
      'Loading portfolio...',
    ];

    function drawTypewriter(tw: number) {
      const TW = Math.min(W * 0.38, 280);
      const TH = 110;
      const x = TWX - TW / 2;
      const y = TWY;

      ctx.save(); ctx.globalAlpha = 0.25;
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.ellipse(TWX, y + TH + 8, TW * 0.45, 10, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      const bodyGrad = ctx.createLinearGradient(x, y, x, y + TH);
      bodyGrad.addColorStop(0, '#3a3a3a');
      bodyGrad.addColorStop(0.5, '#2a2a2a');
      bodyGrad.addColorStop(1, '#1a1a1a');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath(); ctx.roundRect(x, y + 28, TW, TH - 28, [0, 0, 8, 8]); ctx.fill();
      ctx.strokeStyle = '#555'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(x, y + 28, TW, TH - 28, [0, 0, 8, 8]); ctx.stroke();

      ctx.fillStyle = '#444';
      ctx.beginPath(); ctx.roundRect(x - 6, y + 14, TW + 12, 22, 8); ctx.fill();
      ctx.strokeStyle = '#555'; ctx.lineWidth = 1; ctx.strokeRect(x - 6, y + 14, TW + 12, 22);
      for (const kx of [x - 12, x + TW + 6]) {
        ctx.fillStyle = '#555'; ctx.beginPath(); ctx.arc(kx, y + 25, 7, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#666'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(kx, y + 25, 7, 0, Math.PI * 2); ctx.stroke();
      }

      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(x + TW * 0.12, y + 14, TW * 0.76, 22);

      const paperH = 130;
      const paperW = TW * 0.72;
      const paperX = TWX - paperW / 2;
      const paperY = y + 16 - paperH + tw * paperH * 0.6;
      ctx.fillStyle = '#f5f5f0';
      ctx.fillRect(paperX, paperY, paperW, paperH + 10);
      ctx.strokeStyle = '#ddd'; ctx.lineWidth = 0.5; ctx.strokeRect(paperX, paperY, paperW, paperH + 10);

      const visibleLines = Math.floor(tw * PAPER_LINES.length);
      const partial = (tw * PAPER_LINES.length) % 1;
      ctx.font = `${Math.floor(Math.min(W * 0.018, 13))}px monospace`;
      ctx.textAlign = 'left';
      for (let i = 0; i < visibleLines && i < PAPER_LINES.length; i++) {
        const ly = paperY + 16 + i * 16;
        if (ly < paperY + 2 || ly > paperY + paperH + 8) continue;
        ctx.fillStyle = '#1a1a1a';
        ctx.fillText(PAPER_LINES[i], paperX + 10, ly);
      }
      if (visibleLines < PAPER_LINES.length) {
        const currentLine = PAPER_LINES[visibleLines];
        const charCount = Math.floor(partial * currentLine.length);
        const ly = paperY + 16 + visibleLines * 16;
        if (ly >= paperY + 2 && ly <= paperY + paperH + 8) {
          ctx.fillStyle = '#1a1a1a';
          ctx.fillText(currentLine.slice(0, charCount), paperX + 10, ly);
          if (Math.sin(performance.now() * 0.015) > 0) {
            const cw = ctx.measureText(currentLine.slice(0, charCount)).width;
            ctx.fillStyle = '#333'; ctx.fillRect(paperX + 10 + cw, ly - 11, 7, 12);
          }
        }
      }

      const carriageX = x + TW * 0.1 + tw * TW * 0.8;
      ctx.fillStyle = '#555'; ctx.fillRect(x - 4, y + 36, TW + 8, 4);
      ctx.fillStyle = '#666'; ctx.beginPath(); ctx.roundRect(carriageX - 4, y + 33, 8, 10, 2); ctx.fill();

      const keyRows = [
        { count: 10, y: y + 62, w: TW * 0.88 },
        { count: 9,  y: y + 78, w: TW * 0.80 },
        { count: 8,  y: y + 94, w: TW * 0.72 },
      ];
      keyRows.forEach(row => {
        const startX = TWX - row.w / 2;
        const keyW = row.w / row.count - 2;
        for (let k = 0; k < row.count; k++) {
          const kx = startX + k * (keyW + 2);
          const bounce = Math.sin(performance.now() * 0.03 + k * 1.7) > 0.7 && tw > 0.05 && tw < 0.9 ? 2 : 0;
          ctx.fillStyle = '#3d3d3d';
          ctx.beginPath(); ctx.roundRect(kx, row.y + bounce, keyW, 10, 2); ctx.fill();
          ctx.strokeStyle = '#555'; ctx.lineWidth = 0.5;
          ctx.beginPath(); ctx.roundRect(kx, row.y + bounce, keyW, 10, 2); ctx.stroke();
        }
      });
      ctx.fillStyle = '#3d3d3d'; ctx.beginPath(); ctx.roundRect(TWX - TW * 0.25, y + 108, TW * 0.5, 10, 3); ctx.fill();
      ctx.strokeStyle = '#555'; ctx.lineWidth = 0.5; ctx.strokeRect(TWX - TW * 0.25, y + 108, TW * 0.5, 10);
    }

    const DUR = 2800;
    let fired = false;
    const start = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const t = Math.min((now - start) / DUR, 1);
      if (t >= MID && !fired) { fired = true; onMid(); }

      ctx.clearRect(0, 0, W, H);

      const bgA = t < 0.06 ? t / 0.06 : t > 0.9 ? 1 - remap(t, 0.9, 1) : 1;
      ctx.fillStyle = `rgba(8,8,10,${bgA * 0.88})`; ctx.fillRect(0, 0, W, H);

      if (bgA > 0.3) {
        ctx.save(); ctx.globalAlpha = bgA * 0.7;
        const deskGrad = ctx.createLinearGradient(0, GROUND, 0, H);
        deskGrad.addColorStop(0, '#1e1810'); deskGrad.addColorStop(1, '#0e0c08');
        ctx.fillStyle = deskGrad; ctx.fillRect(0, GROUND, W, H - GROUND);
        ctx.fillStyle = '#2a2218'; ctx.fillRect(0, GROUND - 2, W, 4);
        ctx.restore();
      }

      const twAppear = easeOut(clamp(remap(t, 0.12, 0.22), 0, 1));
      const paperYank = easeInOut(clamp(remap(t, 0.72, 0.82), 0, 1));
      const typingProg = clamp(remap(t, 0.22, 0.68), 0, 1);

      if (twAppear > 0) {
        ctx.save();
        ctx.globalAlpha = bgA * twAppear;
        ctx.translate(TWX, TWY + 60);
        ctx.scale(twAppear, twAppear);
        ctx.translate(-TWX, -(TWY + 60));
        drawTypewriter(paperYank < 0.05 ? typingProg : 1);
        ctx.restore();
      }

      if (paperYank > 0) {
        const paperW = Math.min(W * 0.38, 280) * 0.72;
        const paperH = 130;
        const baseY  = TWY + 16 - paperH + typingProg * paperH * 0.6;
        const flyY   = baseY - paperYank * (H * 0.7);
        const rot    = paperYank * 0.18;

        ctx.save(); ctx.globalAlpha = bgA * (1 - paperYank * 0.8);
        ctx.translate(TWX, flyY + paperH / 2);
        ctx.rotate(rot);
        ctx.fillStyle = '#f5f5f0';
        ctx.fillRect(-paperW / 2, -paperH / 2, paperW, paperH);
        PAPER_LINES.forEach((line, i) => {
          ctx.font = `${Math.floor(Math.min(W * 0.018, 13))}px monospace`;
          ctx.textAlign = 'left'; ctx.fillStyle = '#1a1a1a';
          ctx.fillText(line, -paperW / 2 + 10, -paperH / 2 + 16 + i * 16);
        });
        ctx.restore();
      }

      const lineT = typingProg * PAPER_LINES.length;
      const lineFrac = lineT % 1;
      if (lineFrac < 0.06 && typingProg > 0.02 && typingProg < 0.98) {
        ctx.fillStyle = `rgba(255,245,200,${(1 - lineFrac / 0.06) * 0.18})`;
        ctx.fillRect(0, 0, W, H);
      }

      const avIn  = easeOut(clamp(remap(t, 0, 0.14), 0, 1));
      const avOut = clamp(remap(t, 0.86, 0.98), 0, 1);
      const avX   = avOut > 0
        ? cx + avOut * (W - cx + 80)
        : -60 + avIn * (cx - 60 + 60);
      const avA = avOut > 0 ? 1 - avOut : avIn;
      const armR = typingProg > 0 && typingProg < 0.95 ? 0.3 + Math.sin(t * 18) * 0.15 : 0;
      ctx.save(); ctx.globalAlpha = Math.max(avA, 0) * bgA;
      drawProfessional(ctx, avX, GROUND, t * 6, armR);
      ctx.restore();

      if (t < 1) { raf = requestAnimationFrame(tick); }
      else { ctx.clearRect(0, 0, W, H); onDone(); }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onMid, onDone]);

  return <canvas ref={ref} className={styles.canvas} />;
}
