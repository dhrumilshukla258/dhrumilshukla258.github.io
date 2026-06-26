import { useEffect, useRef } from 'react';
import { usePersonality } from '@/components/context/PersonalityContext';
import { useMenu } from '@/components/context/MenuContext';

// ── Simple canvas NPC draw helpers ───────────────────────────────────────────

const SKIN = '#c8956c';

/** Bench NPC — sits, walks in holding coffee */
function drawBenchNPC(ctx: CanvasRenderingContext2D, cx: number, ground: number, walkT: number, color: string) {
  const G = ground;
  // legs
  for (const [ox, phase] of [[-8, 0], [8, Math.PI]] as [number, number][]) {
    const s = Math.sin(walkT * Math.PI * 2 + phase) * 20;
    ctx.save(); ctx.translate(cx + ox, G - 28); ctx.rotate(s * Math.PI / 180);
    ctx.fillStyle = '#2a2a2a'; ctx.fillRect(-4, 0, 8, 28);
    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.roundRect(-4, 24, 12, 6, 2); ctx.fill();
    ctx.restore();
  }
  // body
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.roundRect(cx - 14, G - 62, 28, 36, 4); ctx.fill();
  // arms
  for (const [ox, phase] of [[-14, 0], [14, Math.PI]] as [number, number][]) {
    const s = Math.sin(walkT * Math.PI * 2 + phase) * 18;
    ctx.save(); ctx.translate(cx + ox, G - 56); ctx.rotate(s * Math.PI / 180);
    ctx.fillStyle = color; ctx.fillRect(-4, 0, 8, 24);
    ctx.fillStyle = SKIN; ctx.beginPath(); ctx.arc(0, 24, 5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  // coffee cup in right hand (static)
  const rHandX = cx + 14 + Math.sin(walkT * Math.PI * 2 + Math.PI) * 4;
  const rHandY = G - 32 + Math.cos(walkT * Math.PI * 2) * 4;
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(rHandX - 4, rHandY - 10, 9, 12, 2); ctx.fill();
  ctx.fillStyle = '#6b3a2a'; ctx.fillRect(rHandX - 3, rHandY - 8, 7, 5);
  // head
  ctx.fillStyle = SKIN;
  ctx.beginPath(); ctx.ellipse(cx, G - 74, 12, 14, 0, 0, Math.PI * 2); ctx.fill();
  // hair
  ctx.fillStyle = '#3a2010';
  ctx.beginPath(); ctx.ellipse(cx, G - 82, 12, 8, 0, Math.PI, Math.PI * 2); ctx.fill();
  // eyes
  ctx.fillStyle = '#222';
  ctx.fillRect(cx - 6, G - 77, 3, 3);
  ctx.fillRect(cx + 3, G - 77, 3, 3);
}

/** Laptop NPC — walks in with laptop under arm */
function drawLaptopNPC(ctx: CanvasRenderingContext2D, cx: number, ground: number, walkT: number) {
  const G = ground;
  for (const [ox, phase] of [[-8, 0], [8, Math.PI]] as [number, number][]) {
    const s = Math.sin(walkT * Math.PI * 2 + phase) * 18;
    ctx.save(); ctx.translate(cx + ox, G - 28); ctx.rotate(s * Math.PI / 180);
    ctx.fillStyle = '#1a1a2a'; ctx.fillRect(-4, 0, 8, 28);
    ctx.fillStyle = '#0a0a14'; ctx.beginPath(); ctx.roundRect(-4, 24, 12, 6, 2); ctx.fill();
    ctx.restore();
  }
  // hoodie
  ctx.fillStyle = '#2a2a4a';
  ctx.beginPath(); ctx.roundRect(cx - 14, G - 62, 28, 36, 5); ctx.fill();
  // left arm tucked (holding laptop)
  ctx.save(); ctx.translate(cx - 14, G - 54);
  ctx.rotate(-60 * Math.PI / 180);
  ctx.fillStyle = '#2a2a4a'; ctx.fillRect(-4, 0, 8, 24);
  ctx.restore();
  // laptop under arm
  ctx.fillStyle = '#888'; ctx.beginPath(); ctx.roundRect(cx - 22, G - 44, 20, 14, 2); ctx.fill();
  ctx.fillStyle = '#222'; ctx.fillRect(cx - 21, G - 43, 18, 10);
  ctx.fillStyle = 'rgba(0,255,100,0.4)'; ctx.fillRect(cx - 20, G - 42, 16, 8);
  // right arm swings
  const rS = Math.sin(walkT * Math.PI * 2 + Math.PI) * 18;
  ctx.save(); ctx.translate(cx + 14, G - 56); ctx.rotate(rS * Math.PI / 180);
  ctx.fillStyle = '#2a2a4a'; ctx.fillRect(-4, 0, 8, 24);
  ctx.fillStyle = SKIN; ctx.beginPath(); ctx.arc(0, 24, 5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // head
  ctx.fillStyle = SKIN;
  ctx.beginPath(); ctx.ellipse(cx, G - 74, 12, 14, 0, 0, Math.PI * 2); ctx.fill();
  // glasses
  ctx.strokeStyle = '#88aacc'; ctx.lineWidth = 1.5;
  ctx.strokeRect(cx - 9, G - 78, 7, 5);
  ctx.strokeRect(cx + 2, G - 78, 7, 5);
  ctx.beginPath(); ctx.moveTo(cx - 2, G - 76); ctx.lineTo(cx + 2, G - 76); ctx.stroke();
  // dark hair
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.ellipse(cx, G - 82, 11, 7, 0, Math.PI, Math.PI * 2); ctx.fill();
}

/** Snake — professional personality */
function drawSnake(ctx: CanvasRenderingContext2D, segments: { x: number; y: number }[], t: number) {
  const SEG_R = 7;
  // body segments
  for (let i = segments.length - 1; i >= 1; i--) {
    const alpha = 1 - i / (segments.length * 1.2);
    ctx.fillStyle = `rgba(74,222,128,${alpha})`;
    ctx.strokeStyle = `rgba(34,197,94,${alpha})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(segments[i].x, segments[i].y, SEG_R - i * 0.3, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
  }
  // head
  ctx.fillStyle = '#22c55e';
  ctx.strokeStyle = '#16a34a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(segments[0].x, segments[0].y, SEG_R + 1, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  // eyes
  const eyeAngle = Math.atan2(
    segments[0].y - (segments[1]?.y ?? segments[0].y),
    segments[0].x - (segments[1]?.x ?? segments[0].x)
  );
  for (const side of [-1, 1]) {
    const ex = segments[0].x + Math.cos(eyeAngle + side * 1.2) * 5;
    const ey = segments[0].y + Math.sin(eyeAngle + side * 1.2) * 5;
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ex, ey, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(ex, ey, 1.2, 0, Math.PI * 2); ctx.fill();
  }
  // tongue flick
  if (Math.sin(t * 8) > 0.5) {
    ctx.strokeStyle = '#f43f5e'; ctx.lineWidth = 1.5;
    const tx = segments[0].x + Math.cos(eyeAngle) * 10;
    const ty = segments[0].y + Math.sin(eyeAngle) * 10;
    ctx.beginPath(); ctx.moveTo(segments[0].x + Math.cos(eyeAngle) * 8, segments[0].y + Math.sin(eyeAngle) * 8);
    ctx.lineTo(tx + Math.cos(eyeAngle - 0.5) * 4, ty + Math.sin(eyeAngle - 0.5) * 4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(segments[0].x + Math.cos(eyeAngle) * 8, segments[0].y + Math.sin(eyeAngle) * 8);
    ctx.lineTo(tx + Math.cos(eyeAngle + 0.5) * 4, ty + Math.sin(eyeAngle + 0.5) * 4); ctx.stroke();
  }
}

// ── Main component ────────────────────────────────────────────────────────────

function easeInOut(t: number) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

export function GameHintAnimation() {
  const { personality } = usePersonality();
  const { miniGameOpen } = useMenu();
  const personalityRef = useRef(personality);
  personalityRef.current = personality;
  const miniGameRef = useRef(miniGameOpen);
  miniGameRef.current = miniGameOpen;
  const rafRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    let cancelled = false;

    const runNPCAnimation = () => {
      if (miniGameRef.current) return; // game is open, don't hint

      const canvas = document.createElement('canvas');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:8000;';
      document.body.appendChild(canvas);
      const ctx = canvas.getContext('2d')!;

      const p = personalityRef.current;
      const ground = window.innerHeight - 26; // just above bottombar
      const SCALE = 0.55;
      const fromRight = Math.random() > 0.5;
      const startX = fromRight ? window.innerWidth + 60 : -60;
      const endX = fromRight ? -60 : window.innerWidth + 60;
      const peekX = fromRight
        ? window.innerWidth - 80 - Math.random() * 120
        : 80 + Math.random() * 120;
      const npcColor = ['#e67e22', '#3b82f6', '#a855f7', '#ef4444'][Math.floor(Math.random() * 4)];

      // Snake: build segment path
      const NUM_SEGS = 8;
      type Pt = { x: number; y: number };
      const snakeSegs: Pt[] = Array.from({ length: NUM_SEGS }, () => ({ x: startX, y: ground - 14 }));
      const snakePath: Pt[] = [];

      let x = startX;
      let walkT = 0;
      let phase: 'in' | 'peek' | 'out' = 'in';
      let phaseT = 0; // 0→1 within phase
      let elapsed = 0;

      const PEEK_DURATION = 90; // frames
      const WALK_SPEED = fromRight ? -3.2 : 3.2;

      const tick = () => {
        if (cancelled) { canvas.remove(); return; }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        walkT += 0.05;
        elapsed++;

        if (phase === 'in') {
          x += WALK_SPEED;
          const arrived = fromRight ? x <= peekX : x >= peekX;
          if (arrived) { x = peekX; phase = 'peek'; phaseT = 0; }
        } else if (phase === 'peek') {
          phaseT++;
          if (phaseT >= PEEK_DURATION) { phase = 'out'; }
        } else if (phase === 'out') {
          x += fromRight ? WALK_SPEED * 1.5 : -WALK_SPEED * 1.5;
          const gone = fromRight ? x < -80 : x > window.innerWidth + 80;
          if (gone) { canvas.remove(); scheduleNext(); return; }
        }

        if (p === 'professional') {
          // Snake animation
          snakePath.unshift({ x, y: ground - 14 + Math.sin(walkT * 2) * 6 });
          if (snakePath.length > NUM_SEGS * 4) snakePath.pop();
          // sample segments evenly along path
          for (let i = 0; i < NUM_SEGS; i++) {
            const idx = Math.floor(i * 4);
            snakeSegs[i] = snakePath[Math.min(idx, snakePath.length - 1)] ?? snakeSegs[i];
          }
          drawSnake(ctx, snakeSegs, walkT);
        } else {
          // NPC walk
          ctx.save();
          ctx.translate(x, ground);
          ctx.scale(SCALE * (fromRight ? -1 : 1), SCALE); // flip if coming from right
          if (p === 'gamer') {
            drawBenchNPC(ctx, 0, 0, phase === 'peek' ? 0 : walkT, npcColor);
          } else {
            drawLaptopNPC(ctx, 0, 0, phase === 'peek' ? 0 : walkT);
          }
          ctx.restore();

          // speech bubble on peek
          if (phase === 'peek' && phaseT > 15 && phaseT < PEEK_DURATION - 15) {
            const bubbleAlpha = Math.min(1, (phaseT - 15) / 10) * Math.min(1, (PEEK_DURATION - phaseT - 15) / 10);
            const lines: Record<string, string> = {
              gamer: '> start game?',
              technical: '$ ./game.sh',
            };
            const msg = lines[p] ?? '> start game?';
            const bx = fromRight ? x - 20 : x + 20;
            const by = ground - 90 * SCALE;
            ctx.save();
            ctx.globalAlpha = bubbleAlpha;
            ctx.fillStyle = 'rgba(20,20,30,0.88)';
            ctx.strokeStyle = 'rgba(0,255,136,0.7)';
            ctx.lineWidth = 1.5;
            const w = 120, h = 26;
            ctx.beginPath(); ctx.roundRect(bx - w / 2, by - h / 2, w, h, 6); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#00ff88';
            ctx.font = '11px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(msg, bx, by + 4);
            ctx.restore();
          }
        }

        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
    };

    const scheduleNext = () => {
      if (cancelled) return;
      // play every 35–55 seconds
      const delay = 35000 + Math.random() * 20000;
      timerRef.current = setTimeout(() => {
        if (!cancelled) runNPCAnimation();
      }, delay);
    };

    // first appearance after 20s
    timerRef.current = setTimeout(() => {
      if (!cancelled) runNPCAnimation();
    }, 20000);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      clearTimeout(timerRef.current);
    };
  }, [personality]);

  return null;
}
