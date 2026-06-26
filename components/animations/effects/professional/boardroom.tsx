import { useRef, useEffect } from 'react';
import { drawProfessional } from '../../avatars';
import { easeInOut, easeOut, clamp, remap, MID } from '../../utils';
import { owner } from '@/data/owner';
import styles from '../../PageTransition.module.css';

export function BoardroomEffect({ onMid, onDone }: { onMid: () => void; onDone: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width  = window.innerWidth;
    const H = canvas.height = window.innerHeight;
    const cx = W / 2;

    const TILE_W = Math.min(W * 0.24, 190);
    const TILE_H = TILE_W * 0.62;
    const GAP    = 10;
    const TILES_X = W * 0.03;
    const TILE_POSITIONS = [
      { x: TILES_X, y: H * 0.08,                    name: 'Sarah M.',  role: 'PM',      color: '#4EC9B0' },
      { x: TILES_X, y: H * 0.08 + TILE_H + GAP,     name: 'James R.',  role: 'Design',  color: '#CE9178' },
      { x: TILES_X, y: H * 0.08 + (TILE_H + GAP)*2, name: 'Alex T.',   role: 'Eng',     color: '#DCDCAA' },
    ];

    const SLIDE_X = TILES_X + TILE_W + GAP * 2;
    const SLIDE_W = W - SLIDE_X - W * 0.03;
    const SLIDE_H = Math.min(SLIDE_W * 0.60, H * 0.72);
    const SLIDE_Y = H * 0.08;

    const CHAT: { t: number; from: string; msg: string; color: string }[] = [
      { t: 0.16, from: 'Sarah M.',  msg: 'Love the direction 👍',   color: '#4EC9B0' },
      { t: 0.26, from: 'James R.',  msg: 'Chart looks great!',       color: '#CE9178' },
      { t: 0.36, from: 'Alex T.',   msg: 'Q: timeline for v2?',      color: '#DCDCAA' },
      { t: MID,  from: 'Sarah M.',  msg: '🎉 Excellent work!',        color: '#4EC9B0' },
      { t: MID + 0.08, from: 'James R.', msg: '👍 Ship it!',         color: '#CE9178' },
    ];

    function drawSlide(progress: number, shipped: boolean) {
      ctx.save();
      ctx.beginPath(); ctx.roundRect(SLIDE_X, SLIDE_Y, SLIDE_W, SLIDE_H, 6); ctx.clip();

      ctx.fillStyle = '#0d1117'; ctx.fillRect(SLIDE_X, SLIDE_Y, SLIDE_W, SLIDE_H);

      const slide = shipped ? 2 : Math.floor(progress * 3);
      const FS = Math.floor(Math.min(SLIDE_W * 0.05, 28));
      const subFS = Math.floor(FS * 0.5);

      if (slide === 0) {
        ctx.font = `bold ${FS}px serif`; ctx.textAlign = 'center'; ctx.fillStyle = '#fff';
        ctx.fillText('Q4 ROADMAP', cx + (SLIDE_X - W * 0.03) / 2 - W * 0.03, SLIDE_Y + SLIDE_H * 0.38);
        ctx.font = `${subFS}px serif`; ctx.fillStyle = '#aaa';
        ctx.fillText('Professional Portfolio · 2024', cx + (SLIDE_X - W * 0.03) / 2 - W * 0.03, SLIDE_Y + SLIDE_H * 0.38 + FS * 1.3);
        ctx.fillStyle = '#1a3a5c'; ctx.beginPath();
        ctx.roundRect(SLIDE_X + SLIDE_W * 0.3, SLIDE_Y + SLIDE_H * 0.68, SLIDE_W * 0.4, 28, 4); ctx.fill();
        ctx.font = `bold ${subFS * 0.9}px sans-serif`; ctx.fillStyle = '#4ec9ff';
        ctx.fillText(`${owner.name} – Presenting`, SLIDE_X + SLIDE_W * 0.5, SLIDE_Y + SLIDE_H * 0.68 + 18);

      } else if (slide === 1) {
        ctx.font = `bold ${subFS}px serif`; ctx.textAlign = 'left'; ctx.fillStyle = '#ccc';
        ctx.fillText('IMPACT METRICS', SLIDE_X + 16, SLIDE_Y + 28);
        ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(SLIDE_X + 16, SLIDE_Y + 40); ctx.lineTo(SLIDE_X + SLIDE_W - 16, SLIDE_Y + 40); ctx.stroke();

        const bars = [
          { label: 'Perf', val: 0.82, color: '#4EC9B0' },
          { label: 'Scale', val: 0.65, color: '#569CD6' },
          { label: 'UX',   val: 0.91, color: '#CE9178' },
          { label: 'Ship', val: 0.74, color: '#DCDCAA' },
        ];
        const chartH = SLIDE_H * 0.55;
        const chartY = SLIDE_Y + SLIDE_H - chartH - 30;
        const barW   = (SLIDE_W - 40) / bars.length - 12;
        const animP  = Math.min((progress - 0.33) / 0.15, 1);
        bars.forEach((b, i) => {
          const bx = SLIDE_X + 20 + i * (barW + 12);
          const bh = chartH * b.val * Math.max(animP, 0);
          const bg2 = ctx.createLinearGradient(bx, chartY + chartH - bh, bx, chartY + chartH);
          bg2.addColorStop(0, b.color); bg2.addColorStop(1, b.color + '55');
          ctx.fillStyle = bg2;
          ctx.beginPath(); ctx.roundRect(bx, chartY + chartH - bh, barW, bh, [3, 3, 0, 0]); ctx.fill();
          ctx.font = `${subFS * 0.8}px sans-serif`; ctx.textAlign = 'center'; ctx.fillStyle = '#aaa';
          ctx.fillText(b.label, bx + barW / 2, chartY + chartH + 14);
          if (animP > 0.5) {
            ctx.font = `bold ${subFS * 0.85}px monospace`; ctx.fillStyle = b.color;
            ctx.fillText(`${Math.floor(b.val * 100)}%`, bx + barW / 2, chartY + chartH - bh - 6);
          }
        });

      } else {
        ctx.font = `bold ${FS * 1.1}px serif`; ctx.textAlign = 'center'; ctx.fillStyle = '#ffe44d';
        ctx.shadowColor = '#ffe44d'; ctx.shadowBlur = 16;
        ctx.fillText('TARGETS MET ✓', SLIDE_X + SLIDE_W / 2, SLIDE_Y + SLIDE_H * 0.35);
        ctx.shadowBlur = 0;
        const items = ['▸ 3 features shipped on time', '▸ Performance up 24%', '▸ 98% user satisfaction'];
        ctx.font = `${subFS}px serif`; ctx.fillStyle = '#ccc';
        items.forEach((it, i) => ctx.fillText(it, SLIDE_X + SLIDE_W / 2, SLIDE_Y + SLIDE_H * 0.52 + i * (subFS + 8)));
      }

      ctx.restore();

      ctx.strokeStyle = slide === 2 ? '#ffe44d' : '#333'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(SLIDE_X, SLIDE_Y, SLIDE_W, SLIDE_H, 6); ctx.stroke();

      ctx.fillStyle = '#1a6639'; ctx.beginPath(); ctx.roundRect(SLIDE_X + 8, SLIDE_Y + 8, 110, 20, 4); ctx.fill();
      ctx.font = '10px monospace'; ctx.textAlign = 'left'; ctx.fillStyle = '#fff';
      ctx.fillText('● SCREEN SHARE', SLIDE_X + 14, SLIDE_Y + 21);
    }

    function drawTile(tile: typeof TILE_POSITIONS[0], progress: number, celebrating: boolean) {
      const { x, y, name, role, color } = tile;
      ctx.fillStyle = '#1c1c28';
      ctx.beginPath(); ctx.roundRect(x, y, TILE_W, TILE_H, 6); ctx.fill();
      ctx.strokeStyle = celebrating ? color : '#333'; ctx.lineWidth = celebrating ? 2 : 1;
      ctx.beginPath(); ctx.roundRect(x, y, TILE_W, TILE_H, 6); ctx.stroke();

      const faceX = x + TILE_W / 2;
      const faceY = y + TILE_H * 0.42;
      const faceR  = Math.min(TILE_W, TILE_H) * 0.18;

      ctx.fillStyle = celebrating ? color + '44' : '#2a2a3a';
      ctx.beginPath();
      ctx.ellipse(faceX, faceY + faceR * 2.4, faceR * 1.6, faceR * 1.1, 0, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = '#f5c5a3';
      ctx.beginPath(); ctx.arc(faceX, faceY, faceR, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = color === '#4EC9B0' ? '#8b4513' : color === '#CE9178' ? '#1a1a1a' : '#6b3a2a';
      ctx.beginPath(); ctx.arc(faceX, faceY - faceR * 0.4, faceR * 1.05, Math.PI, 0); ctx.fill();

      ctx.fillStyle = '#333';
      ctx.beginPath(); ctx.arc(faceX - faceR * 0.35, faceY - faceR * 0.05, faceR * 0.12, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(faceX + faceR * 0.35, faceY - faceR * 0.05, faceR * 0.12, 0, Math.PI * 2); ctx.fill();

      if (celebrating) {
        ctx.strokeStyle = '#333'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(faceX, faceY + faceR * 0.2, faceR * 0.3, 0, Math.PI); ctx.stroke();
      }

      const nod = Math.sin(progress * Math.PI * 4 + tile.x) > 0.7 && !celebrating ? -3 : 0;
      if (nod < 0) {
        ctx.save();
        ctx.translate(faceX, faceY + nod);
        ctx.fillStyle = '#f5c5a3';
        ctx.beginPath(); ctx.arc(0, 0, faceR, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }

      if (celebrating) {
        const emojiFS = Math.floor(faceR * 1.2);
        ctx.font = `${emojiFS}px serif`;
        ctx.textAlign = 'center';
        ctx.fillText('👍', faceX + faceR * 1.6, faceY - faceR * 0.8);
      }

      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.beginPath(); ctx.roundRect(x, y + TILE_H - 22, TILE_W, 22, [0, 0, 6, 6]); ctx.fill();
      ctx.font = `bold ${Math.floor(Math.min(TILE_W * 0.12, 11))}px sans-serif`;
      ctx.textAlign = 'left'; ctx.fillStyle = '#fff';
      ctx.fillText(name, x + 8, y + TILE_H - 8);
      ctx.fillStyle = color;
      ctx.fillText(role, x + TILE_W - ctx.measureText(role).width - 8, y + TILE_H - 8);

      const micColor = progress > 0 && Math.sin(progress * 25 + tile.x) > 0.5 ? color : '#555';
      ctx.fillStyle = micColor;
      ctx.beginPath(); ctx.roundRect(x + 6, y + 6, 10, 14, 3); ctx.fill();
      ctx.beginPath(); ctx.arc(x + 11, y + 20, 6, Math.PI, 0, true); ctx.strokeStyle = micColor; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + 11, y + 26); ctx.lineTo(x + 11, y + 30); ctx.stroke();
    }

    const DUR = 3400;

    function drawToolbar() {
      const tbH = 48; const tbY = H * 0.88;
      ctx.fillStyle = 'rgba(10,10,18,0.9)'; ctx.fillRect(0, tbY, W, tbH);
      ctx.strokeStyle = '#222'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, tbY); ctx.lineTo(W, tbY); ctx.stroke();

      const ICONS = ['🎤', '📷', '🖥️', '💬', '👥', '🔴'];
      const LABELS = ['Mute', 'Stop Video', 'Share', 'Chat', 'Participants', 'End'];
      const btnW = 72; const startX = cx - (ICONS.length * btnW) / 2;
      ICONS.forEach((icon, i) => {
        const bx = startX + i * btnW + btnW / 2;
        ctx.font = '16px serif'; ctx.textAlign = 'center'; ctx.fillText(icon, bx, tbY + 22);
        ctx.font = `${Math.floor(Math.min(W * 0.014, 10))}px sans-serif`; ctx.fillStyle = '#888';
        ctx.fillText(LABELS[i], bx, tbY + 38);
      });

      const elapsed = '00:' + String(Math.floor(H * 0.9 * 60)).padStart(2, '0');
      ctx.font = 'bold 11px monospace'; ctx.textAlign = 'left'; ctx.fillStyle = '#4a4a5a';
      ctx.fillText(`${elapsed}  ·  4 Participants`, 14, tbY + 28);

      ctx.fillStyle = '#ff4444'; ctx.beginPath(); ctx.arc(W - 60, tbY + 24, 5, 0, Math.PI * 2); ctx.fill();
      ctx.font = '10px sans-serif'; ctx.fillStyle = '#ff4444'; ctx.textAlign = 'left';
      ctx.fillText('REC', W - 52, tbY + 28);
    }

    function drawSelfTile(celebrate: boolean) {
      const selfW = TILE_W * 0.85; const selfH = selfW * 0.62;
      const selfX = SLIDE_X; const selfY = SLIDE_Y + SLIDE_H + GAP;

      ctx.fillStyle = '#12121e';
      ctx.beginPath(); ctx.roundRect(selfX, selfY, selfW, selfH, 6); ctx.fill();
      ctx.strokeStyle = celebrate ? '#ffe44d' : '#4a9eff'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(selfX, selfY, selfW, selfH, 6); ctx.stroke();

      const avS = selfH * 0.65;
      ctx.save();
      const scaleF = avS / 90;
      ctx.translate(selfX + selfW / 2, selfY + selfH * 0.85);
      ctx.scale(scaleF, scaleF);
      drawProfessional(ctx, 0, 0, 0, celebrate ? 0.3 : 0);
      ctx.restore();

      ctx.fillStyle = 'rgba(0,0,0,0.65)';
      ctx.beginPath(); ctx.roundRect(selfX, selfY + selfH - 22, selfW, 22, [0, 0, 6, 6]); ctx.fill();
      ctx.font = `bold ${Math.floor(Math.min(selfW * 0.115, 11))}px sans-serif`;
      ctx.textAlign = 'left'; ctx.fillStyle = '#4a9eff';
      ctx.fillText('You  |  Presenting', selfX + 8, selfY + selfH - 7);
    }

    const activeMsgs: { msg: typeof CHAT[0]; born: number }[] = [];
    let fired = false;
    const start = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const t = Math.min((now - start) / DUR, 1);
      if (t >= MID && !fired) { fired = true; onMid(); }

      for (const c of CHAT) {
        if (t >= c.t && !activeMsgs.find(m => m.msg === c)) {
          activeMsgs.push({ msg: c, born: t });
        }
      }

      ctx.clearRect(0, 0, W, H);

      const bgA = t < 0.06 ? t / 0.06 : t > 0.9 ? 1 - remap(t, 0.9, 1) : 1;
      ctx.fillStyle = `rgba(8,8,14,${bgA * 0.96})`; ctx.fillRect(0, 0, W, H);

      const uiA = clamp(remap(t, 0.06, 0.18), 0, 1) * bgA;
      const progress = clamp(remap(t, 0.14, MID), 0, 1);
      const celebrating = t > MID + 0.06;

      ctx.save(); ctx.globalAlpha = uiA;
      drawSlide(progress, celebrating);
      ctx.restore();

      TILE_POSITIONS.forEach(tile => {
        ctx.save(); ctx.globalAlpha = uiA;
        drawTile(tile, progress, celebrating);
        ctx.restore();
      });

      ctx.save(); ctx.globalAlpha = uiA;
      drawSelfTile(celebrating);
      ctx.restore();

      ctx.save(); ctx.globalAlpha = uiA;
      drawToolbar();
      ctx.restore();

      activeMsgs.forEach(({ msg, born }) => {
        const age  = t - born;
        const msgA = age < 0.06 ? age / 0.06 : age > 0.22 ? 1 - clamp(remap(age, 0.22, 0.32), 0, 1) : 1;
        if (msgA <= 0) return;
        const chatX = SLIDE_X + SLIDE_W - 8;
        const chatY = SLIDE_Y + SLIDE_H - 48 - activeMsgs.indexOf({ msg, born }) * 30;
        const tw2 = Math.min(ctx.measureText(msg.msg).width + ctx.measureText(msg.from).width + 28, SLIDE_W * 0.55);
        ctx.save(); ctx.globalAlpha = msgA * bgA;
        ctx.fillStyle = '#1a1f2e';
        ctx.beginPath(); ctx.roundRect(chatX - tw2, chatY - 14, tw2, 22, 11); ctx.fill();
        ctx.strokeStyle = msg.color; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect(chatX - tw2, chatY - 14, tw2, 22, 11); ctx.stroke();
        ctx.font = `bold ${Math.floor(Math.min(W * 0.018, 11))}px sans-serif`;
        ctx.textAlign = 'left'; ctx.fillStyle = msg.color;
        ctx.fillText(msg.from + ': ', chatX - tw2 + 10, chatY + 2);
        ctx.fillStyle = '#ddd';
        ctx.fillText(msg.msg, chatX - tw2 + 10 + ctx.measureText(msg.from + ': ').width, chatY + 2);
        ctx.restore();
      });

      if (t >= MID && t < MID + 0.36) {
        const st = remap(t, MID, MID + 0.36);
        const scale = st < 0.18 ? easeOut(st / 0.18) * 1.2 : 1 + (1 - easeInOut((st - 0.18) / 0.82)) * 0.2;
        const alpha = st < 0.08 ? st / 0.08 : st > 0.8 ? 1 - remap(st, 0.8, 1) : 1;
        ctx.save(); ctx.globalAlpha = alpha * bgA;
        ctx.translate(SLIDE_X + SLIDE_W / 2, SLIDE_Y + SLIDE_H / 2);
        ctx.scale(scale, scale);
        ctx.font = `bold ${clamp(SLIDE_W * 0.075, 28, 56)}px serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffe44d'; ctx.shadowColor = '#ffe44d'; ctx.shadowBlur = 20;
        ctx.fillText('TARGETS MET ✓', 0, 0);
        ctx.shadowBlur = 0;
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
