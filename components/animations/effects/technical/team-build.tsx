import { useRef, useEffect } from 'react';
import { drawTechnical } from '../../avatars';
import { easeInOut, easeOut, clamp, remap, MID } from '../../utils';
import { owner } from '@/data/owner';
import styles from '../../PageTransition.module.css';

export function TeamBuildEffect({ onMid, onDone }: { onMid: () => void; onDone: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width  = window.innerWidth;
    const H = canvas.height = window.innerHeight;
    const cx = W / 2;
    const GROUND = H * 0.82;
    const DESK_Y  = GROUND - 10;

    const STATIONS = [
      { x: W * 0.12, label: 'engine',   color: '#569CD6' },
      { x: W * 0.36, label: 'gameplay', color: '#4EC9B0' },
      { x: W * 0.62, label: 'art',      color: '#CE9178' },
      { x: W * 0.86, label: 'qa',       color: '#DCDCAA' },
    ];
    const USER_IDX = 1;

    function drawDev(dx: number, dy: number, walkT: number, typing: number, celebrate: boolean, isUser: boolean) {
      const col  = isUser ? '#569CD6' : '#4a4a5a';
      const col2 = isUser ? '#3a7abf' : '#3a3a48';
      const bobY = celebrate ? Math.abs(Math.sin(walkT * Math.PI * 2)) * 10 : 0;

      ctx.save(); ctx.globalAlpha = 0.15;
      ctx.beginPath(); ctx.ellipse(dx, dy - 2, 16, 4, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#000'; ctx.fill(); ctx.restore();

      const legSw = Math.sin(walkT * Math.PI * 2) * (celebrate ? 18 : 0);
      ctx.strokeStyle = col2; ctx.lineWidth = 6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(dx, dy - bobY - 24); ctx.lineTo(dx - 6 + legSw, dy - bobY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(dx, dy - bobY - 24); ctx.lineTo(dx + 6 - legSw, dy - bobY); ctx.stroke();

      const bg = ctx.createLinearGradient(dx - 12, dy - bobY - 52, dx + 12, dy - bobY - 22);
      bg.addColorStop(0, col); bg.addColorStop(1, col2);
      ctx.fillStyle = bg;
      ctx.beginPath(); ctx.roundRect(dx - 12, dy - bobY - 56, 24, 34, 5); ctx.fill();

      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath(); ctx.roundRect(dx - 7, dy - bobY - 35, 14, 8, 2); ctx.fill();

      const aSw = Math.sin(walkT * Math.PI * 4) * (typing > 0 ? 6 : 0);
      const aRaise = celebrate ? 20 + Math.abs(Math.sin(walkT * 4)) * 12 : 0;
      ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(dx - 12, dy - bobY - 48); ctx.lineTo(dx - 22, dy - bobY - 38 + aSw - aRaise); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(dx + 12, dy - bobY - 48); ctx.lineTo(dx + 22, dy - bobY - 38 - aSw - aRaise); ctx.stroke();

      ctx.fillStyle = '#f5c5a3';
      ctx.beginPath(); ctx.arc(dx, dy - bobY - 66, 12, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = isUser ? '#1a3a5c' : '#2a2a36';
      ctx.beginPath(); ctx.arc(dx, dy - bobY - 72, 10, Math.PI, 0); ctx.fill();
      ctx.fillRect(dx - 12, dy - bobY - 74, 24, 7);

      ctx.strokeStyle = '#888'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.roundRect(dx - 9, dy - bobY - 70, 7, 5, 2); ctx.stroke();
      ctx.beginPath(); ctx.roundRect(dx + 2, dy - bobY - 70, 7, 5, 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(dx - 2, dy - bobY - 67); ctx.lineTo(dx + 2, dy - bobY - 67); ctx.stroke();

      ctx.fillStyle = celebrate ? '#333' : '#222';
      if (!celebrate) {
        ctx.fillRect(dx - 7, dy - bobY - 68, 3, 2);
        ctx.fillRect(dx + 4, dy - bobY - 68, 3, 2);
      } else {
        ctx.strokeStyle = '#333'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(dx - 5, dy - bobY - 67, 2.5, Math.PI, 0); ctx.stroke();
        ctx.beginPath(); ctx.arc(dx + 5, dy - bobY - 67, 2.5, Math.PI, 0); ctx.stroke();
      }
    }

    function drawDesk(dx: number, stationColor: string, screenContent: () => void) {
      const deskW = Math.min(W * 0.12, 80);
      ctx.fillStyle = '#2a2a30';
      ctx.beginPath(); ctx.roundRect(dx - deskW / 2, DESK_Y - 18, deskW, 18, [0, 0, 4, 4]); ctx.fill();
      ctx.fillStyle = '#1a1a20'; ctx.fillRect(dx - deskW / 2, DESK_Y - 6, deskW, 6);

      ctx.fillStyle = '#333'; ctx.fillRect(dx - 4, DESK_Y - 18 - 26, 8, 26);
      ctx.fillRect(dx - 14, DESK_Y - 18 - 2, 28, 4);

      const mW = deskW * 1.1; const mH = mW * 0.62;
      const mX = dx - mW / 2; const mY = DESK_Y - 18 - 26 - mH;
      ctx.fillStyle = '#111';
      ctx.beginPath(); ctx.roundRect(mX - 4, mY - 4, mW + 8, mH + 8, 4); ctx.fill();
      ctx.strokeStyle = '#333'; ctx.lineWidth = 1; ctx.stroke();

      ctx.save();
      ctx.beginPath(); ctx.roundRect(mX, mY, mW, mH, 2); ctx.clip();
      ctx.fillStyle = '#0d1117'; ctx.fillRect(mX, mY, mW, mH);
      screenContent();
      ctx.fillStyle = `${stationColor}08`; ctx.fillRect(mX, mY, mW, mH);
      ctx.restore();

      ctx.fillStyle = stationColor;
      ctx.beginPath(); ctx.arc(mX + mW + 4, mY + 4, 3, 0, Math.PI * 2); ctx.fill();
    }

    type Bubble = { fromX: number; toX: number; y: number; t0: number; t1: number; text: string; color: string };
    const BUBBLES: Bubble[] = [
      { fromX: STATIONS[2].x, toX: STATIONS[1].x, y: GROUND - 120, t0: 0.14, t1: 0.28, text: 'art assets ✓', color: '#CE9178' },
      { fromX: STATIONS[0].x, toX: STATIONS[1].x, y: GROUND - 140, t0: 0.20, t1: 0.34, text: 'engine API ready', color: '#569CD6' },
      { fromX: STATIONS[1].x, toX: STATIONS[3].x, y: GROUND - 125, t0: 0.26, t1: 0.40, text: 'PR #847 merged', color: '#4EC9B0' },
      { fromX: STATIONS[3].x, toX: STATIONS[1].x, y: GROUND - 110, t0: 0.32, t1: 0.44, text: 'tests passing ✓', color: '#DCDCAA' },
      { fromX: STATIONS[0].x, toX: cx,             y: GROUND - 160, t0: 0.38, t1: MID,  text: 'build triggered 🚀', color: '#00ff88' },
    ];

    const SCREEN_W = Math.min(W * 0.44, 360);
    const SCREEN_H = SCREEN_W * 0.58;
    const SCREEN_X = cx - SCREEN_W / 2;
    const SCREEN_Y = H * 0.06;

    function drawBigScreen(buildProgress: number, shipped: boolean) {
      ctx.fillStyle = '#111';
      ctx.beginPath(); ctx.roundRect(SCREEN_X - 6, SCREEN_Y - 6, SCREEN_W + 12, SCREEN_H + 12, 6); ctx.fill();
      ctx.strokeStyle = '#333'; ctx.lineWidth = 2; ctx.stroke();

      ctx.fillStyle = '#0d1117';
      ctx.beginPath(); ctx.roundRect(SCREEN_X, SCREEN_Y, SCREEN_W, SCREEN_H, 3); ctx.fill();
      ctx.fillStyle = '#161b22'; ctx.fillRect(SCREEN_X, SCREEN_Y, SCREEN_W, 18);
      ctx.font = '10px monospace'; ctx.textAlign = 'left'; ctx.fillStyle = '#569CD6';
      ctx.fillText('  nba2k_engine – main  ●', SCREEN_X + 4, SCREEN_Y + 12);

      for (const [di, dc] of [[6,'#ff5f57'],[20,'#ffbd2e'],[34,'#28c840']] as [number,string][]) {
        ctx.fillStyle = dc; ctx.beginPath(); ctx.arc(SCREEN_X + SCREEN_W - di, SCREEN_Y + 9, 4, 0, Math.PI * 2); ctx.fill();
      }

      const CY = SCREEN_Y + 22;
      const CH = SCREEN_H - 22;

      if (!shipped) {
        const lines = [
          { c: '#569CD6', t: 'class ' },  { c: '#4EC9B0', t: 'PlayerController' }, { c: '#ddd', t: ' {' },
          { c: '#DCDCAA', t: '  render' }, { c: '#ddd', t: '() { ' }, { c: '#CE9178', t: '"draw frame"' }, { c: '#ddd', t: ' }' },
          { c: '#6A9955', t: '  // physics engine v4.2' },
          { c: '#569CD6', t: '  async ' }, { c: '#DCDCAA', t: 'update' }, { c: '#ddd', t: '(dt: ' }, { c: '#4EC9B0', t: 'number' }, { c: '#ddd', t: ') {' },
          { c: '#9CDCFE', t: '    this' }, { c: '#ddd', t: '.pos += velocity * dt;' },
          { c: '#ddd', t: '  }' },
          { c: '#ddd', t: '}' },
          { c: '#6A9955', t: '' },
          { c: '#DCDCAA', t: 'export default ' }, { c: '#4EC9B0', t: 'PlayerController' }, { c: '#ddd', t: ';' },
        ];
        const lineH2 = 12; let curX = SCREEN_X + 8; let curY = CY + 10;
        const visLines = Math.floor(buildProgress * lines.length);
        for (let li = 0; li < visLines && curY < CY + CH - 4; li++) {
          const seg = lines[li];
          if (!seg.t) { curX = SCREEN_X + 8; curY += lineH2; continue; }
          if (seg.t.startsWith('  ') || seg.t.startsWith('    ')) { curX = SCREEN_X + 8; curY += lineH2; }
          ctx.font = '9px monospace'; ctx.textAlign = 'left'; ctx.fillStyle = seg.c;
          ctx.fillText(seg.t, curX, curY);
          curX += ctx.measureText(seg.t).width;
          if (curX > SCREEN_X + SCREEN_W - 8) { curX = SCREEN_X + 8; curY += lineH2; }
        }
        if (Math.sin(buildProgress * 40) > 0 && curY < CY + CH) {
          ctx.fillStyle = '#569CD6'; ctx.fillRect(curX, curY - 9, 6, 10);
        }

        const bY = CY + CH - 22;
        ctx.fillStyle = '#0d1117'; ctx.fillRect(SCREEN_X + 4, bY, SCREEN_W - 8, 18);
        ctx.fillStyle = buildProgress > 0.85 ? '#28c840' : '#569CD6';
        ctx.beginPath(); ctx.roundRect(SCREEN_X + 4, bY + 2, (SCREEN_W - 12) * buildProgress, 14, 3); ctx.fill();
        ctx.font = '9px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff';
        ctx.fillText(`building… ${Math.floor(buildProgress * 100)}%`, cx, bY + 13);
      } else {
        ctx.fillStyle = '#1a3a1a'; ctx.fillRect(SCREEN_X, CY, SCREEN_W, CH);
        const courtY = CY + CH * 0.45;
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(SCREEN_X, courtY, SCREEN_W, CH - CH * 0.45);
        ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(SCREEN_X, courtY); ctx.lineTo(SCREEN_X + SCREEN_W, courtY); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(cx, courtY, 28, 12, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = '#e05500'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(SCREEN_X + SCREEN_W * 0.15, courtY - 10, 8, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = 'rgba(40,40,80,0.8)';
        for (let ci = 0; ci < 14; ci++) {
          ctx.beginPath(); ctx.arc(SCREEN_X + 12 + ci * (SCREEN_W / 14), CY + 16 + Math.sin(ci) * 5, 7, 0, Math.PI); ctx.fill();
        }
        ctx.fillStyle = '#1a3a8a'; ctx.fillRect(cx - 8, courtY - 28, 10, 20);
        ctx.fillStyle = '#f5c5a3'; ctx.beginPath(); ctx.arc(cx - 3, courtY - 32, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#f87c2a'; ctx.beginPath(); ctx.arc(cx + 20, courtY - 16, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(SCREEN_X, CY, SCREEN_W, 18);
        ctx.font = '9px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff';
        ctx.fillText(`${owner.shipped[0]}  ·  Q3  12:44  |  LAL 67 - 71 BOS`, cx, CY + 12);
        ctx.fillStyle = '#28c840'; ctx.beginPath(); ctx.arc(SCREEN_X + 12, CY + 9, 4, 0, Math.PI * 2); ctx.fill();
        ctx.font = '8px monospace'; ctx.textAlign = 'left'; ctx.fillStyle = '#28c840';
        ctx.fillText('LIVE', SCREEN_X + 18, CY + 12);
      }
    }

    const DUR = 3000;
    let fired = false;
    const start = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const t = Math.min((now - start) / DUR, 1);
      if (t >= MID && !fired) { fired = true; onMid(); }

      ctx.clearRect(0, 0, W, H);

      const bgA = t < 0.06 ? t / 0.06 : t > 0.9 ? 1 - remap(t, 0.9, 1) : 1;
      const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
      bgGrad.addColorStop(0, `rgba(8,10,18,${bgA * 0.97})`);
      bgGrad.addColorStop(1, `rgba(12,14,22,${bgA * 0.97})`);
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, W, H);

      ctx.save(); ctx.globalAlpha = bgA * 0.5;
      ctx.fillStyle = '#0d0f18'; ctx.fillRect(0, DESK_Y, W, H - DESK_Y);
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, DESK_Y); ctx.lineTo(W, DESK_Y); ctx.stroke();
      ctx.restore();

      const buildProg = clamp(remap(t, 0.06, MID), 0, 1);
      const shipped = t >= MID;

      ctx.save(); ctx.globalAlpha = clamp(remap(t, 0.04, 0.14), 0, 1) * bgA;
      drawBigScreen(buildProg, shipped);
      ctx.restore();

      if (t > 0.04) {
        ctx.save(); ctx.globalAlpha = clamp(remap(t, 0.04, 0.14), 0, 1) * bgA;
        ctx.font = `bold ${Math.floor(Math.min(W * 0.018, 13))}px monospace`;
        ctx.textAlign = 'center'; ctx.fillStyle = '#569CD6';
        ctx.fillText('visual-concepts / nba2k-engine', cx, SCREEN_Y - 8);
        ctx.restore();
      }

      // SHIPPED banner
      if (t >= MID && t < MID + 0.44) {
        const st = remap(t, MID, MID + 0.44);
        const scale = st < 0.18 ? easeOut(st / 0.18) * 1.15 : 1 + (1 - easeInOut((st - 0.18) / 0.82)) * 0.15;
        const alpha = st < 0.1 ? st / 0.1 : st > 0.82 ? 1 - remap(st, 0.82, 1) : 1;
        ctx.save(); ctx.globalAlpha = alpha * bgA;
        ctx.translate(cx, H * 0.56); ctx.scale(scale, scale);
        ctx.font = `bold ${clamp(W * 0.065, 32, 58)}px monospace`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = '#28c840'; ctx.shadowColor = '#28c840'; ctx.shadowBlur = 22;
        ctx.fillText('✓  BUILD PASSED', 0, 0);
        ctx.shadowBlur = 0;
        ctx.font = `bold ${clamp(W * 0.032, 16, 26)}px monospace`;
        ctx.fillStyle = '#fff'; ctx.fillText('SHIPPED TO PROD  🚀', 0, clamp(W * 0.065, 32, 58) * 0.95);
        ctx.restore();
      }

      // PR bubbles flying across
      for (const b of BUBBLES) {
        if (t < b.t0 || t > b.t1 + 0.08) continue;
        const bt = clamp(remap(t, b.t0, b.t1), 0, 1);
        const bAlpha = t > b.t1 ? 1 - remap(t, b.t1, b.t1 + 0.08) : bt < 0.12 ? bt / 0.12 : 1;
        const bx = b.fromX + (b.toX - b.fromX) * easeInOut(bt);
        const arc = -Math.sin(bt * Math.PI) * 28;
        const by2 = b.y + arc;
        ctx.save(); ctx.globalAlpha = bAlpha * bgA;
        const tw = ctx.measureText(b.text).width + 16;
        ctx.fillStyle = '#1a1f2e';
        ctx.beginPath(); ctx.roundRect(bx - tw / 2, by2 - 10, tw, 18, 9); ctx.fill();
        ctx.strokeStyle = b.color; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect(bx - tw / 2, by2 - 10, tw, 18, 9); ctx.stroke();
        ctx.font = '10px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = b.color;
        ctx.fillText(b.text, bx, by2 + 3);
        ctx.restore();
      }

      // Dev stations
      ctx.save(); ctx.globalAlpha = bgA;
      STATIONS.forEach((st, i) => {
        const devIn  = easeOut(clamp(remap(t, i * 0.04, i * 0.04 + 0.14), 0, 1));
        const devOut = clamp(remap(t, 0.88, 0.98), 0, 1);
        const devA   = devOut > 0 ? 1 - devOut : devIn;

        ctx.save(); ctx.globalAlpha = devA;
        drawDesk(st.x, st.color, () => {
          const mW2 = Math.min(W * 0.12, 80) * 1.1;
          const mX2 = st.x - mW2 / 2;
          const mY2 = DESK_Y - 18 - 26 - mW2 * 0.62;
          const lineCount = Math.floor(buildProg * 7) + 2;
          for (let li = 0; li < lineCount; li++) {
            const lw = (0.4 + Math.abs(Math.sin(li * 1.7 + i)) * 0.5) * (mW2 - 8);
            const lc = [st.color, '#6A9955', '#CE9178', '#ddd'][li % 4];
            ctx.fillStyle = lc;
            ctx.fillRect(mX2 + 4, mY2 + 4 + li * 10, lw, 3);
          }
          if (Math.sin(t * 12 + i * 2) > 0) {
            const lw2 = (0.3 + Math.abs(Math.sin(lineCount * 1.7 + i)) * 0.4) * (mW2 - 8);
            ctx.fillStyle = st.color;
            ctx.fillRect(mX2 + 4 + lw2, mY2 + 4 + lineCount * 10, 4, 8);
          }
        });
        ctx.restore();

        const isUser = i === USER_IDX;
        const celebrate = t > MID + 0.08;
        ctx.save(); ctx.globalAlpha = devA;
        drawDev(st.x, DESK_Y, t * (4 + i * 0.5), buildProg, celebrate, isUser);
        ctx.restore();

        ctx.save(); ctx.globalAlpha = devA * 0.7;
        ctx.font = `${Math.floor(Math.min(W * 0.016, 11))}px monospace`;
        ctx.textAlign = 'center'; ctx.fillStyle = st.color;
        ctx.fillText(isUser ? `[ ${st.label} – you ]` : st.label, st.x, DESK_Y + 14);
        ctx.restore();
      });
      ctx.restore();

      if (t < 1) { raf = requestAnimationFrame(tick); }
      else { ctx.clearRect(0, 0, W, H); onDone(); }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onMid, onDone]);

  return <canvas ref={ref} className={styles.canvas} />;
}
