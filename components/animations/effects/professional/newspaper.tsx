import { useRef, useEffect } from 'react';
import { drawProfessional } from '../../avatars';
import { easeInOut, easeOut, clamp, remap, MID } from '../../utils';
import styles from '../../PageTransition.module.css';

export function NewspaperEffect({ onMid, onDone }: { onMid: () => void; onDone: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width  = window.innerWidth;
    const H = canvas.height = window.innerHeight;
    const cx = W / 2, cy = H / 2;
    const GROUND = H * 0.82;

    const paperW = Math.min(W * 0.82, 700);
    const paperH = Math.min(H * 0.78, 520);
    const paperX = cx - paperW / 2;
    const paperY = cy - paperH / 2;

    function drawFrontPage() {
      const half = paperW / 2;
      ctx.fillStyle = '#f4ecd8';
      ctx.fillRect(paperX, paperY, half, paperH);
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(paperX, paperY, paperW, 48);
      ctx.font = `bold ${Math.floor(Math.min(paperW * 0.052, 36))}px serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#f4ecd8';
      ctx.fillText('THE PORTFOLIO TIMES', cx, paperY + 18);
      ctx.font = `${Math.floor(Math.min(paperW * 0.021, 14))}px serif`;
      ctx.fillStyle = '#bbb';
      ctx.fillText('EST. 2019  ·  SPECIAL EDITION', cx, paperY + 36);
      ctx.fillStyle = '#1a1a1a'; ctx.fillRect(paperX + 12, paperY + 48, half - 24, 2);
      ctx.font = `bold ${Math.floor(Math.min(half * 0.13, 32))}px serif`;
      ctx.textAlign = 'left'; ctx.fillStyle = '#1a1a1a';
      const hlLines = half < 280 ? ['PROFESSIONAL', 'MODE ACTIVE'] : ['PROFESSIONAL', 'MODE', 'ACTIVATED'];
      hlLines.forEach((l, i) => ctx.fillText(l, paperX + 14, paperY + 70 + i * Math.min(half * 0.14, 36)));
      const afterHL = paperY + 70 + hlLines.length * Math.min(half * 0.14, 36) + 8;
      ctx.font = `italic ${Math.floor(Math.min(half * 0.055, 13))}px serif`;
      ctx.fillStyle = '#555';
      ctx.fillText('"Credentials verified."', paperX + 14, afterHL);
      ctx.fillStyle = '#ddd';
      for (let li = 0; li < 10; li++) {
        const lw = (0.5 + Math.abs(Math.sin(li * 1.3)) * 0.4) * (half - 28);
        ctx.fillRect(paperX + 14, afterHL + 18 + li * 13, lw, 3);
      }
      const imgY = afterHL + 18 + 10 * 13 + 8;
      ctx.fillStyle = '#d8cebc';
      ctx.fillRect(paperX + 14, imgY, half - 28, 40);
      ctx.font = `${Math.floor(Math.min(half * 0.05, 11))}px serif`;
      ctx.textAlign = 'center'; ctx.fillStyle = '#999';
      ctx.fillText('[PHOTO]', paperX + half / 2, imgY + 22);
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.fillRect(cx - 4, paperY, 4, paperH);
    }

    function drawRightFront() {
      const half = paperW / 2;
      ctx.fillStyle = '#f0e8d4';
      ctx.fillRect(cx, paperY, half, paperH);
      ctx.fillStyle = '#1a1a1a'; ctx.fillRect(cx + 12, paperY + 48, half - 24, 2);
      ctx.font = `bold ${Math.floor(Math.min(half * 0.09, 22))}px serif`;
      ctx.textAlign = 'left'; ctx.fillStyle = '#1a1a1a';
      ctx.fillText('INSIDE', cx + 14, paperY + 66);
      ctx.fillStyle = '#ddd';
      for (let li = 0; li < 14; li++) {
        const lw = (0.4 + Math.abs(Math.sin(li * 2.1)) * 0.5) * (half - 28);
        ctx.fillRect(cx + 14, paperY + 80 + li * 13, lw, 3);
      }
      ctx.fillStyle = '#e8dfc8'; ctx.fillRect(cx + 14, paperY + 80 + 14 * 13 + 6, half - 28, 50);
      ctx.font = `bold ${Math.floor(Math.min(half * 0.06, 13))}px serif`;
      ctx.textAlign = 'center'; ctx.fillStyle = '#888';
      ctx.fillText('ADVERTISEMENT', cx + half / 2, paperY + 80 + 14 * 13 + 34);
    }

    function drawNewPage() {
      const half = paperW / 2;
      ctx.fillStyle = '#f8f4ec';
      ctx.fillRect(cx, paperY, half, paperH);
      ctx.fillStyle = '#1a1a1a'; ctx.fillRect(cx + 12, paperY + 48, half - 24, 2);
      ctx.font = `bold ${Math.floor(Math.min(half * 0.1, 24))}px serif`;
      ctx.textAlign = 'center'; ctx.fillStyle = '#1a1a1a';
      ctx.fillText('NEW PAGE,', cx + half / 2, paperY + 80);
      ctx.fillText('NEW YOU.', cx + half / 2, paperY + 80 + Math.min(half * 0.12, 28));
      ctx.font = `italic ${Math.floor(Math.min(half * 0.055, 13))}px serif`;
      ctx.fillStyle = '#666';
      ctx.fillText('Personality loaded.', cx + half / 2, paperY + 80 + Math.min(half * 0.12, 28) * 2 + 8);
      ctx.fillStyle = '#ddd';
      for (let li = 0; li < 10; li++) {
        const lw = (0.4 + Math.abs(Math.sin(li * 1.8)) * 0.5) * (half - 28);
        ctx.fillRect(cx + 14, paperY + 145 + li * 13, lw, 3);
      }
    }

    function drawPaperBorder() {
      ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 1.5;
      ctx.strokeRect(paperX, paperY, paperW, paperH);
      ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(cx, paperY); ctx.lineTo(cx, paperY + paperH); ctx.stroke();
      ctx.setLineDash([]);
    }

    const DUR = 1800;
    let fired = false;
    const start = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const t = Math.min((now - start) / DUR, 1);
      if (t >= MID && !fired) { fired = true; onMid(); }

      ctx.clearRect(0, 0, W, H);

      const bgA = t < 0.06 ? t / 0.06 : t > 0.9 ? 1 - remap(t, 0.9, 1) : 1;
      ctx.fillStyle = `rgba(10,8,6,${bgA * 0.88})`; ctx.fillRect(0, 0, W, H);

      const unfold = easeOut(clamp(remap(t, 0.10, 0.26), 0, 1));
      const fold   = easeInOut(clamp(remap(t, 0.74, 0.88), 0, 1));
      const paperScale = fold > 0 ? 1 - fold * 0.92 : unfold;
      const paperAlpha = fold > 0 ? 1 - fold : unfold;

      const flipRaw  = clamp(remap(t, 0.40, 0.56), 0, 1);
      const flipT    = easeInOut(flipRaw);
      const rightScaleX = 1 - 2 * flipT;
      const showNewPage = rightScaleX < 0;

      if (paperScale > 0.01) {
        ctx.save();
        ctx.globalAlpha = paperAlpha * bgA;
        ctx.translate(cx, cy);
        ctx.scale(paperScale, paperScale);
        ctx.translate(-cx, -cy);

        drawFrontPage();

        ctx.save();
        ctx.beginPath(); ctx.rect(cx, paperY, paperW / 2, paperH); ctx.clip();
        ctx.translate(cx, cy);
        ctx.scale(Math.abs(rightScaleX) || 0.001, 1);
        ctx.translate(-cx, -cy);
        if (showNewPage) { drawNewPage(); } else { drawRightFront(); }
        ctx.restore();

        drawPaperBorder();
        ctx.restore();

        if (flipRaw > 0.05 && flipRaw < 0.95 && paperScale > 0.5) {
          const curlX = cx + rightScaleX * (paperW / 2);
          const curlA = Math.sin(flipRaw * Math.PI) * 0.35 * paperAlpha;
          ctx.save(); ctx.globalAlpha = curlA * bgA;
          const grad = ctx.createLinearGradient(curlX - 10, 0, curlX + 10, 0);
          grad.addColorStop(0, 'rgba(0,0,0,0)');
          grad.addColorStop(0.5, 'rgba(0,0,0,0.5)');
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = grad;
          ctx.fillRect(curlX - 10, paperY * paperScale + cy * (1 - paperScale), 20, paperH * paperScale);
          ctx.restore();
        }
      }

      const avIn  = easeOut(clamp(remap(t, 0, 0.12), 0, 1));
      const avOut = clamp(remap(t, 0.86, 0.98), 0, 1);
      const avX   = avOut > 0
        ? W * 0.18 + avOut * (W + 80)
        : -80 + avIn * (W * 0.18 + 80);
      const avA = avOut > 0 ? 1 - avOut : avIn;
      const armRaise = clamp(remap(t, 0.36, 0.44), 0, 1) * (1 - clamp(remap(t, 0.52, 0.60), 0, 1));
      ctx.save(); ctx.globalAlpha = Math.max(avA, 0) * bgA;
      drawProfessional(ctx, avX, GROUND, t * 5, armRaise);
      ctx.restore();

      if (t < 1) { raf = requestAnimationFrame(tick); }
      else { ctx.clearRect(0, 0, W, H); onDone(); }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onMid, onDone]);

  return <canvas ref={ref} className={styles.canvas} />;
}
