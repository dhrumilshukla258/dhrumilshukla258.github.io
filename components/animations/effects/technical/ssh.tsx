import { useRef, useEffect } from 'react';
import { drawTechnical } from '../../avatars';
import { easeOut, clamp, remap, MID } from '../../utils';
import { owner } from '@/data/owner';
import styles from '../../PageTransition.module.css';

export function SSHEffect({ onMid, onDone }: { onMid: () => void; onDone: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width  = window.innerWidth;
    const H = canvas.height = window.innerHeight;

    const CMDS = [
      { t: 0.06, prompt: '~  $', text: ` ssh ${owner.github}@portfolio.dev`, color: '#fff' },
      { t: 0.16, prompt: '',     text: 'The authenticity of host \'portfolio.dev\' can\'t be established.', color: '#aaa' },
      { t: 0.22, prompt: '',     text: 'RSA key fingerprint is SHA256:dS3kp9Xq2mR...', color: '#888' },
      { t: 0.27, prompt: '',     text: 'Are you sure you want to continue? (yes/no): yes', color: '#aaa' },
      { t: 0.34, prompt: '',     text: 'Warning: Permanently added \'portfolio.dev\' to known hosts.', color: '#888' },
      { t: 0.39, prompt: '',     text: `${owner.github}@portfolio.dev's password: ••••••••••`, color: '#aaa' },
      { t: MID,  prompt: '',     text: 'Last login: Today  – personality switch requested', color: '#666' },
      { t: 0.54, prompt: '',     text: '──────────────────────────────────────────', color: '#1a3a2a' },
      { t: 0.57, prompt: '',     text: '  Welcome to Portfolio v3.0  [ TECHNICAL ]', color: '#00ff88' },
      { t: 0.62, prompt: '',     text: '  Stack: React · Next.js · TypeScript · Go', color: '#00cc66' },
      { t: 0.67, prompt: '',     text: '──────────────────────────────────────────', color: '#1a3a2a' },
      { t: 0.72, prompt: `${owner.github}@portfolio  ~  $`, text: ' _', color: '#00ff88' },
    ];

    const DUR = 2400;
    const GROUND = H * 0.82;
    let fired = false;
    const start = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const t = Math.min((now - start) / DUR, 1);
      if (t >= MID && !fired) { fired = true; onMid(); }

      ctx.clearRect(0, 0, W, H);

      const bgA = t < 0.05 ? t / 0.05 : t > 0.9 ? 1 - remap(t, 0.9, 1) : 1;
      ctx.fillStyle = `rgba(0,4,2,${bgA * 0.95})`; ctx.fillRect(0, 0, W, H);

      const winW = Math.min(W * 0.86, 660);
      const winX = (W - winW) / 2;
      const winY = H * 0.09;
      const winH = H * 0.68;

      ctx.save(); ctx.globalAlpha = bgA;
      ctx.fillStyle = '#0a100e';
      ctx.beginPath(); ctx.roundRect(winX, winY, winW, winH, 8); ctx.fill();
      ctx.strokeStyle = '#00ff88'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(winX, winY, winW, winH, 8); ctx.stroke();

      ctx.fillStyle = '#0d1f16';
      ctx.beginPath(); ctx.roundRect(winX, winY, winW, 30, [8, 8, 0, 0]); ctx.fill();
      [['#ff5f57',10], ['#ffbd2e',26], ['#28c840',42]].forEach(([c, x]) => {
        ctx.fillStyle = c as string;
        ctx.beginPath(); ctx.arc(winX + (x as number), winY + 15, 6, 0, Math.PI * 2); ctx.fill();
      });
      ctx.font = '12px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#00aa55';
      ctx.fillText(`${owner.github}@portfolio – ssh`, winX + winW / 2, winY + 19);
      ctx.restore();

      const FS = 13; const lineH = FS + 7;

      // Clip all terminal text to the window bounds so nothing overflows on small screens
      ctx.save();
      ctx.beginPath(); ctx.roundRect(winX, winY + 30, winW, winH - 30, [0, 0, 8, 8]); ctx.clip();

      CMDS.forEach((cmd, i) => {
        if (t < cmd.t) return;
        const lineA = Math.min(remap(t, cmd.t, cmd.t + 0.05), 1) * bgA;
        const y = winY + 46 + i * lineH;
        if (y > winY + winH - 12) return;

        ctx.save(); ctx.globalAlpha = lineA;
        ctx.font = `${FS}px monospace`; ctx.textAlign = 'left';

        if (cmd.prompt) {
          ctx.fillStyle = '#00ff88';
          ctx.fillText(cmd.prompt, winX + 14, y);
          const pw = ctx.measureText(cmd.prompt).width;
          ctx.fillStyle = cmd.color;
          ctx.fillText(cmd.text, winX + 14 + pw, y);
        } else {
          ctx.fillStyle = cmd.color;
          ctx.fillText(cmd.text, winX + 14, y);
        }
        ctx.restore();
      });

      const lastShown = CMDS.filter(c => t >= c.t).length - 1;
      if (lastShown >= 0 && Math.sin(t * 9) > 0 && t < 0.88) {
        const cmd = CMDS[lastShown];
        const ly = winY + 46 + lastShown * lineH;
        if (ly < winY + winH - 12) {
          const pw = cmd.prompt ? ctx.measureText(cmd.prompt + cmd.text).width : ctx.measureText(cmd.text).width;
          ctx.save(); ctx.globalAlpha = bgA;
          ctx.fillStyle = '#00ff88'; ctx.fillRect(winX + 14 + pw + 2, ly - FS + 2, 8, FS);
          ctx.restore();
        }
      }

      ctx.restore(); // end clip

      {
        const walkIn  = easeOut(clamp(remap(t, 0, 0.14), 0, 1));
        const walkOut = remap(t, 0.88, 0.96);
        const avX = walkOut > 0
          ? W * 0.18 - walkOut * (W * 0.18 + 80)
          : -80 + walkIn * (W * 0.18 + 80);
        const avA = walkOut > 0 ? 1 - walkOut : walkIn;
        ctx.save(); ctx.globalAlpha = Math.max(avA, 0);
        drawTechnical(ctx, avX, GROUND, t * 4, remap(t, 0.12, 0.88), walkOut);
        ctx.restore();
      }

      if (t < 1) { raf = requestAnimationFrame(tick); }
      else { ctx.clearRect(0, 0, W, H); onDone(); }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onMid, onDone]);

  return <canvas ref={ref} className={styles.canvas} />;
}
