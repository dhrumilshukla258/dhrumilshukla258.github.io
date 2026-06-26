import { useRef, useEffect } from 'react';
import { drawGamer } from '../../avatars';
import { easeInOut, easeOut, clamp, remap, MID } from '../../utils';
import styles from '../../PageTransition.module.css';

export function PlatformerEffect({ onMid, onDone }: { onMid: () => void; onDone: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width  = window.innerWidth;
    const H = canvas.height = window.innerHeight;
    const cx = W / 2;

    ctx.imageSmoothingEnabled = false;

    const GROUND  = H * 0.76;
    const BLOCK   = Math.max(Math.floor(Math.min(W * 0.045, 36)), 20);
    const QBLK1_X = W * 0.22;
    const QBLK2_X = W * 0.38;
    const PIPE_X  = W * 0.56;
    const POLE_X  = W * 0.82;
    const POLE_TOP = H * 0.20;

    const T_BLK1     = 0.12;
    const T_BLK1E    = 0.26;
    const T_BLK2     = 0.34;
    const T_BLK2E    = 0.46;
    const T_PIPE_END = 0.62;
    const T_POLE     = 0.74;
    const T_CEL      = 0.86;
    const BLK1_HIT   = (T_BLK1 + T_BLK1E) / 2;
    const BLK2_HIT   = (T_BLK2 + T_BLK2E) / 2;

    function drawCloud(cx2: number, cy2: number, scale: number) {
      ctx.fillStyle = '#fff';
      const w = BLOCK * 2 * scale; const h = BLOCK * scale;
      ctx.fillRect(cx2 - w / 2,        cy2,             w,             h * 0.6);
      ctx.fillRect(cx2 - w * 0.3,      cy2 - h * 0.45,  w * 0.6,       h * 0.55);
      ctx.fillRect(cx2 - w * 0.7,      cy2 - h * 0.22,  w * 0.42,      h * 0.4);
      ctx.fillRect(cx2 + w * 0.28,     cy2 - h * 0.22,  w * 0.42,      h * 0.4);
    }

    function drawGroundRow() {
      const rows = 3;
      for (let row = 0; row < rows; row++) {
        for (let bx = 0; bx < W + BLOCK; bx += BLOCK) {
          ctx.fillStyle = row === 0 ? '#e07840' : '#c05820';
          ctx.fillRect(bx, GROUND + row * BLOCK, BLOCK, BLOCK);
          if (row === 0) {
            ctx.fillStyle = '#f09060';
            ctx.fillRect(bx + 1, GROUND + 1, BLOCK - 2, 4);
          }
          ctx.strokeStyle = '#a04010'; ctx.lineWidth = 0.5;
          ctx.strokeRect(bx, GROUND + row * BLOCK, BLOCK, BLOCK);
        }
      }
    }

    function drawQBlock(bx: number, bob: number, hit: boolean) {
      const by = GROUND - BLOCK * 3.5 - bob;
      ctx.fillStyle = hit ? '#888' : '#e8a020';
      ctx.fillRect(bx - BLOCK / 2, by, BLOCK, BLOCK);
      ctx.fillStyle = hit ? '#777' : '#d09010';
      ctx.fillRect(bx - BLOCK / 2, by, BLOCK, 4);
      ctx.fillRect(bx - BLOCK / 2, by + BLOCK - 4, BLOCK, 4);
      ctx.fillRect(bx - BLOCK / 2, by, 4, BLOCK);
      ctx.fillStyle = hit ? '#666' : '#8b5a00';
      ctx.font = `bold ${Math.floor(BLOCK * 0.7)}px monospace`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(hit ? '·' : '?', bx, by + BLOCK / 2 + 1);
    }

    function drawPipe(px: number) {
      const pipeH = BLOCK * 3;
      const pipeW = BLOCK * 2.2;
      ctx.fillStyle = '#28a030';
      ctx.fillRect(px - pipeW / 2, GROUND - pipeH, pipeW, pipeH);
      ctx.fillStyle = '#40cc48';
      ctx.fillRect(px - pipeW / 2 + 4, GROUND - pipeH + 4, 6, pipeH - 8);
      ctx.fillStyle = '#22882a';
      ctx.fillRect(px - pipeW / 2 - 5, GROUND - pipeH - 10, pipeW + 10, 14);
      ctx.fillStyle = '#40cc48';
      ctx.fillRect(px - pipeW / 2 - 5, GROUND - pipeH - 10, pipeW + 10, 5);
    }

    function drawFlagPole(flagSlide: number) {
      ctx.fillStyle = '#aaa';
      ctx.fillRect(POLE_X - 2, POLE_TOP, 4, GROUND - POLE_TOP);
      ctx.fillStyle = '#ffdd00'; ctx.beginPath(); ctx.arc(POLE_X, POLE_TOP, 7, 0, Math.PI * 2); ctx.fill();
      const flagY = POLE_TOP + 8 + flagSlide * (GROUND - POLE_TOP - BLOCK * 2);
      ctx.fillStyle = '#e02020';
      ctx.beginPath();
      ctx.moveTo(POLE_X + 2, flagY);
      ctx.lineTo(POLE_X + 2 + BLOCK * 1.6, flagY + BLOCK * 0.6);
      ctx.lineTo(POLE_X + 2, flagY + BLOCK * 1.2);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#bbb';
      for (let ci = 0; ci < 5; ci++) {
        if (ci % 2 === 0) ctx.fillRect(POLE_X + BLOCK * 1.4 + ci * (BLOCK * 0.4), GROUND - BLOCK * 3 - BLOCK * 0.5, BLOCK * 0.4, BLOCK * 0.5);
      }
      ctx.fillStyle = '#ccc';
      ctx.fillRect(POLE_X + BLOCK * 1.4, GROUND - BLOCK * 3, BLOCK * 2, BLOCK * 3);
      ctx.fillStyle = '#aaa';
      ctx.fillRect(POLE_X + BLOCK * 1.8, GROUND - BLOCK * 1.5, BLOCK * 1.1, BLOCK * 1.5);
    }

    function drawCoin(bx: number, coinT: number) {
      if (coinT <= 0 || coinT >= 1) return;
      const coinY = (GROUND - BLOCK * 3.5) - easeOut(coinT) * BLOCK * 3;
      const alpha = coinT > 0.6 ? 1 - remap(coinT, 0.6, 1) : 1;
      ctx.save(); ctx.globalAlpha = alpha;
      ctx.fillStyle = '#ffdd00';
      ctx.beginPath(); ctx.arc(bx, coinY, BLOCK * 0.35, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#cc9900';
      ctx.font = `bold ${Math.floor(BLOCK * 0.5)}px monospace`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('$', bx, coinY);
      ctx.restore();
    }

    type FW = { x: number; y: number; color: string; angle: number; speed: number };
    const fireworks: FW[] = [];
    function spawnFirework(fx: number, fy: number, color: string) {
      for (let i = 0; i < 16; i++) {
        fireworks.push({ x: fx, y: fy, color, angle: (i / 16) * Math.PI * 2, speed: 3 + Math.random() * 5 });
      }
    }

    const DUR = 3200;
    let fwSpawned = false;
    let fired = false;
    const start = performance.now();
    let raf: number;
    let coinsCollected = 0;

    const tick = (now: number) => {
      const t = Math.min((now - start) / DUR, 1);
      if (t >= MID && !fired) {
        fired = true; onMid();
        spawnFirework(POLE_X, H * 0.35, '#ffdd00');
        spawnFirework(POLE_X - W * 0.1, H * 0.28, '#ff4488');
        spawnFirework(POLE_X + W * 0.08, H * 0.32, '#44ddff');
        fwSpawned = true;
      }

      ctx.clearRect(0, 0, W, H);

      const bgA = t < 0.05 ? t / 0.05 : t > 0.96 ? 1 - remap(t, 0.96, 1) : 1;

      // Full-canvas opaque base so the page never shows through during the animation
      ctx.fillStyle = `rgba(30,55,140,${bgA})`;
      ctx.fillRect(0, 0, W, H);

      // Sky
      const sky = ctx.createLinearGradient(0, 0, 0, GROUND);
      sky.addColorStop(0, `rgba(60,100,200,${bgA})`);
      sky.addColorStop(1, `rgba(92,148,252,${bgA})`);
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, GROUND);

      // clouds
      ctx.save(); ctx.globalAlpha = bgA * 0.9;
      drawCloud(W * 0.18, H * 0.14, 1.1);
      drawCloud(W * 0.55, H * 0.10, 0.85);
      drawCloud(W * 0.80, H * 0.18, 1.0);
      ctx.restore();

      // HUD
      if (bgA > 0.2) {
        ctx.save(); ctx.globalAlpha = bgA;
        ctx.font = `bold ${Math.floor(Math.min(W * 0.022, 16))}px monospace`;
        ctx.textAlign = 'left'; ctx.fillStyle = '#fff';
        ctx.fillText(`SCORE  ${String(Math.floor(t * 12400)).padStart(6, '0')}`, W * 0.06, H * 0.07);
        ctx.fillText(`COINS  ×${String(coinsCollected).padStart(2, '0')}`, cx - 60, H * 0.07);
        ctx.fillText(`TIME   ${String(Math.max(0, Math.floor((1 - t) * 340))).padStart(3, '0')}`, W * 0.76, H * 0.07);
        ctx.restore();
      }

      // Ground
      ctx.save(); ctx.globalAlpha = bgA;
      drawGroundRow();

      const blk1Hit = t >= BLK1_HIT;
      const blk1HitBob = blk1Hit ? Math.max(0, Math.sin(clamp(remap(t, BLK1_HIT, BLK1_HIT + 0.10), 0, 1) * Math.PI) * BLOCK * 0.85) : 0;
      drawQBlock(QBLK1_X, blk1HitBob, blk1Hit);

      const blk2Hit = t >= BLK2_HIT;
      const blk2HitBob = blk2Hit ? Math.max(0, Math.sin(clamp(remap(t, BLK2_HIT, BLK2_HIT + 0.10), 0, 1) * Math.PI) * BLOCK * 0.85) : 0;
      drawQBlock(QBLK2_X, blk2HitBob, blk2Hit);

      drawPipe(PIPE_X);

      const flagSlide = t >= MID ? easeOut(clamp(remap(t, MID, MID + 0.18), 0, 1)) : 0;
      drawFlagPole(flagSlide);
      ctx.restore();

      const coin1T = blk1Hit ? clamp(remap(t, BLK1_HIT, BLK1_HIT + 0.30), 0, 1) : 0;
      const coin2T = blk2Hit ? clamp(remap(t, BLK2_HIT, BLK2_HIT + 0.30), 0, 1) : 0;
      if (coin1T > 0) { if (coin1T > 0.05 && coinsCollected < 1) coinsCollected = 1; ctx.save(); ctx.globalAlpha = bgA; drawCoin(QBLK1_X, coin1T); ctx.restore(); }
      if (coin2T > 0) { if (coin2T > 0.05 && coinsCollected < 2) coinsCollected = 2; ctx.save(); ctx.globalAlpha = bgA; drawCoin(QBLK2_X, coin2T); ctx.restore(); }

      let charX: number, charY: number;
      let jumpFrac = 0;

      if (t < T_BLK1) {
        charX = -60 + easeOut(clamp(remap(t, 0, T_BLK1), 0, 1)) * (QBLK1_X + 60);
        charY = GROUND;
      } else if (t < T_BLK1E) {
        charX = QBLK1_X;
        const jt = remap(t, T_BLK1, T_BLK1E);
        const jh = Math.sin(jt * Math.PI) * BLOCK * 2.8;
        charY = GROUND - jh;
        jumpFrac = jh / (BLOCK * 2.8);
      } else if (t < T_BLK2) {
        charX = QBLK1_X + easeOut(clamp(remap(t, T_BLK1E, T_BLK2), 0, 1)) * (QBLK2_X - QBLK1_X);
        charY = GROUND;
      } else if (t < T_BLK2E) {
        charX = QBLK2_X;
        const jt = remap(t, T_BLK2, T_BLK2E);
        const jh = Math.sin(jt * Math.PI) * BLOCK * 2.8;
        charY = GROUND - jh;
        jumpFrac = jh / (BLOCK * 2.8);
      } else if (t < T_PIPE_END) {
        const jt = clamp(remap(t, T_BLK2E, T_PIPE_END), 0, 1);
        charX = QBLK2_X + BLOCK + jt * (PIPE_X + BLOCK * 3 - QBLK2_X - BLOCK);
        const jh = Math.sin(jt * Math.PI) * BLOCK * 5;
        charY = GROUND - jh;
        jumpFrac = jh / (BLOCK * 5);
      } else if (t < T_POLE) {
        charX = PIPE_X + BLOCK * 3 + easeOut(clamp(remap(t, T_PIPE_END, T_POLE), 0, 1)) * (POLE_X - PIPE_X - BLOCK * 3 - 12);
        charY = GROUND;
      } else if (t < T_CEL) {
        charX = POLE_X - 12;
        charY = GROUND;
      } else {
        charX = POLE_X + easeInOut(clamp(remap(t, T_CEL, 0.98), 0, 1)) * (W + 80 - POLE_X);
        charY = GROUND;
      }

      const celebrate = t >= T_POLE && t < T_CEL;
      const celebJump = celebrate ? Math.abs(Math.sin(remap(t, T_POLE, T_CEL) * Math.PI * 3)) * 0.8 : 0;
      ctx.save(); ctx.globalAlpha = bgA;
      drawGamer(ctx, charX, charY, t * 9, jumpFrac > 0 ? jumpFrac : celebJump, celebrate);
      ctx.restore();

      // Fireworks
      if (fwSpawned && fireworks.length) {
        const fwAge = clamp(remap(t, MID, MID + 0.45), 0, 1);
        ctx.save(); ctx.globalAlpha = bgA;
        for (const fw of fireworks) {
          const fx = fw.x + Math.cos(fw.angle) * fw.speed * fwAge * 60;
          const fy = fw.y + Math.sin(fw.angle) * fw.speed * fwAge * 60;
          const fa = fwAge < 0.4 ? 1 : 1 - remap(fwAge, 0.4, 1);
          ctx.globalAlpha = fa * bgA;
          ctx.fillStyle = fw.color;
          const r = Math.max(2, BLOCK * 0.25 * (1 - fwAge * 0.5));
          ctx.beginPath(); ctx.arc(fx, fy, r, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
      }

      // COURSE CLEAR! banner
      if (t >= MID && t < MID + 0.52) {
        const bt = remap(t, MID, MID + 0.52);
        const scale = bt < 0.16 ? easeOut(bt / 0.16) * 1.15 : 1 + (1 - easeInOut((bt - 0.16) / 0.84)) * 0.15;
        const alpha = bt < 0.08 ? bt / 0.08 : bt > 0.8 ? 1 - remap(bt, 0.8, 1) : 1;
        const FS = clamp(W * 0.072, 34, 62);
        ctx.save(); ctx.globalAlpha = alpha * bgA;
        ctx.translate(cx, H * 0.44); ctx.scale(scale, scale);

        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(-W * 0.38, -FS * 0.8, W * 0.76, FS * 1.8);

        ctx.font = `bold ${FS}px monospace`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffdd00'; ctx.shadowColor = '#ffaa00'; ctx.shadowBlur = 18;
        ctx.fillText('COURSE CLEAR!', 0, 0);
        ctx.shadowBlur = 0;

        if (bt > 0.2) {
          ctx.font = `bold ${Math.floor(FS * 0.42)}px monospace`;
          ctx.fillStyle = '#fff';
          ctx.fillText(`COINS ×${coinsCollected}   SCORE ${String(Math.floor(t * 12400)).padStart(6, '0')}`, 0, FS * 0.85);
        }
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
