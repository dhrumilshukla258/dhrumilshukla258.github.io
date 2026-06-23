import {
  createContext, useContext, useRef, useState,
  useCallback, useEffect, ReactNode,
} from 'react';
import { PersonalityType } from './PersonalityContext';
import styles from '@/styles/PageTransition.module.css';

interface TransCtx {
  trigger: (type: PersonalityType, commit: () => void) => void;
  isActive: boolean;
}
const Ctx = createContext<TransCtx>({ trigger: () => {}, isActive: false });
export function usePageTransition() { return useContext(Ctx); }

const DURATION = 2200;
const MID      = 0.48;

const easeInOut = (t: number) => t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
const easeOut   = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp     = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const remap     = (t: number, a: number, b: number) => clamp((t - a) / (b - a), 0, 1);

// ─────────────────────────────────────────────────────────────────
// Avatar draw helpers
// ─────────────────────────────────────────────────────────────────

// shared skin / neutral
const SKIN   = '#c8956c';
const SKIN_D = '#a0704a';

/** Professional — suit, tie, briefcase, eraser in hand */
function drawProfessional(
  ctx: CanvasRenderingContext2D,
  cx: number, ground: number,
  walkT: number,   // 0–1 loop for leg swing
  armRaise: number // 0 = down, 1 = fully raised (holding eraser)
) {
  const G = ground;
  // shadow
  ctx.save(); ctx.globalAlpha = 0.18;
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.ellipse(cx, G + 2, 22, 5, 0, 0, Math.PI*2); ctx.fill();
  ctx.restore();

  // legs
  for (const [ox, phase] of [[-10, 0], [10, Math.PI]] as [number,number][]) {
    const s = Math.sin(walkT * Math.PI * 2 + phase) * 18;
    ctx.save(); ctx.translate(cx + ox, G - 36);
    ctx.rotate(s * Math.PI / 180);
    ctx.fillStyle = '#1a2535'; ctx.fillRect(-5, 0, 10, 36);
    // shoe
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.roundRect(-5, 32, 16, 8, 3); ctx.fill();
    ctx.restore();
  }

  // body — suit jacket
  ctx.fillStyle = '#1e2d42';
  ctx.beginPath(); ctx.roundRect(cx - 18, G - 78, 36, 44, 4); ctx.fill();

  // shirt
  ctx.fillStyle = '#e8e8e8';
  ctx.fillRect(cx - 5, G - 76, 10, 42);

  // lapels
  ctx.fillStyle = '#132030';
  ctx.beginPath();
  ctx.moveTo(cx - 5, G - 76); ctx.lineTo(cx - 18, G - 60); ctx.lineTo(cx - 5, G - 34);
  ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + 5, G - 76); ctx.lineTo(cx + 18, G - 60); ctx.lineTo(cx + 5, G - 34);
  ctx.closePath(); ctx.fill();

  // tie
  ctx.fillStyle = '#8b1a1a';
  ctx.beginPath();
  ctx.moveTo(cx - 3, G - 75); ctx.lineTo(cx + 3, G - 75);
  ctx.lineTo(cx + 5, G - 46); ctx.lineTo(cx, G - 36); ctx.lineTo(cx - 5, G - 46);
  ctx.closePath(); ctx.fill();

  // right arm + briefcase (swings with walk)
  const rSwing = Math.sin(walkT * Math.PI * 2 + Math.PI) * 15;
  ctx.save(); ctx.translate(cx + 18, G - 72);
  ctx.rotate(rSwing * Math.PI / 180);
  ctx.fillStyle = '#1e2d42'; ctx.fillRect(-5, 0, 10, 36);
  // hand
  ctx.fillStyle = SKIN; ctx.beginPath(); ctx.arc(0, 36, 6, 0, Math.PI*2); ctx.fill();
  // briefcase
  ctx.fillStyle = '#8b5e14'; ctx.beginPath(); ctx.roundRect(-9, 34, 22, 15, 3); ctx.fill();
  ctx.strokeStyle = '#5a3d0a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.roundRect(-9, 34, 22, 15, 3); ctx.stroke();
  ctx.strokeStyle = '#5a3d0a'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(2, 34, 5, Math.PI, 0); ctx.stroke();
  ctx.restore();

  // left arm — raised to hold eraser
  const baseAngle = Math.sin(walkT * Math.PI * 2) * 15;
  const raiseAngle = -armRaise * 80; // negative = up
  ctx.save(); ctx.translate(cx - 18, G - 72);
  ctx.rotate((baseAngle + raiseAngle) * Math.PI / 180);
  ctx.fillStyle = '#1e2d42'; ctx.fillRect(-5, 0, 10, 36);
  ctx.fillStyle = SKIN; ctx.beginPath(); ctx.arc(0, 36, 6, 0, Math.PI*2); ctx.fill();
  if (armRaise > 0.3) {
    // eraser block
    ctx.fillStyle = '#d4cfc0'; ctx.fillRect(-8, 34, 22, 11);
    ctx.strokeStyle = '#a09880'; ctx.lineWidth = 1; ctx.strokeRect(-8, 34, 22, 11);
  }
  ctx.restore();

  // head
  ctx.fillStyle = SKIN;
  ctx.beginPath(); ctx.ellipse(cx, G - 92, 16, 18, 0, 0, Math.PI*2); ctx.fill();

  // hair
  ctx.fillStyle = '#2c1810';
  ctx.beginPath(); ctx.ellipse(cx, G - 104, 16, 10, 0, Math.PI, Math.PI*2); ctx.fill();
  ctx.fillRect(cx - 16, G - 110, 32, 10);

  // eyes
  ctx.fillStyle = '#1a1010';
  ctx.fillRect(cx - 8, G - 96, 4, 4);
  ctx.fillRect(cx + 4, G - 96, 4, 4);

  // smile
  ctx.strokeStyle = SKIN_D; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(cx, G - 86, 5, 0.2, Math.PI - 0.2); ctx.stroke();
}

/** Gamer — hoodie, headset, controller, big energy */
function drawGamer(
  ctx: CanvasRenderingContext2D,
  cx: number, ground: number,
  walkT: number,
  jump: number,     // 0–1 jump height factor
  celebrate: boolean
) {
  const G = ground - jump * 60;

  // shadow (stays on ground)
  const shadowScale = 1 - jump * 0.5;
  ctx.save(); ctx.globalAlpha = 0.15 * shadowScale;
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.ellipse(cx, ground + 2, 22, 5, 0, 0, Math.PI*2); ctx.fill();
  ctx.restore();

  // legs
  for (const [ox, phase] of [[-10, 0], [10, Math.PI]] as [number,number][]) {
    const s = jump > 0.1 ? (ox < 0 ? -30 : 30) : Math.sin(walkT * Math.PI * 2 + phase) * 22;
    ctx.save(); ctx.translate(cx + ox, G - 30);
    ctx.rotate(s * Math.PI / 180);
    ctx.fillStyle = '#2a1a4a'; ctx.fillRect(-5, 0, 10, 30);
    ctx.fillStyle = '#e84040'; ctx.beginPath(); ctx.roundRect(-6, 26, 15, 8, 3); ctx.fill();
    ctx.restore();
  }

  // hoodie body
  ctx.fillStyle = '#e67e22';
  ctx.beginPath(); ctx.roundRect(cx - 20, G - 80, 40, 52, 6); ctx.fill();

  // hoodie pocket
  ctx.fillStyle = '#c0650e';
  ctx.beginPath(); ctx.roundRect(cx - 12, G - 42, 24, 14, 3); ctx.fill();

  // arms + controller
  const armBob = celebrate ? Math.sin(walkT * Math.PI * 4) * 25 : Math.sin(walkT * Math.PI * 2) * 15;
  // left arm
  ctx.save(); ctx.translate(cx - 20, G - 72);
  ctx.rotate((-armBob - 15) * Math.PI / 180);
  ctx.fillStyle = '#e67e22'; ctx.fillRect(-5, 0, 10, 32);
  ctx.fillStyle = SKIN; ctx.beginPath(); ctx.arc(0, 32, 6, 0, Math.PI*2); ctx.fill();
  ctx.restore();
  // right arm
  ctx.save(); ctx.translate(cx + 20, G - 72);
  ctx.rotate((armBob + 15) * Math.PI / 180);
  ctx.fillStyle = '#e67e22'; ctx.fillRect(-5, 0, 10, 32);
  ctx.fillStyle = SKIN; ctx.beginPath(); ctx.arc(0, 32, 6, 0, Math.PI*2); ctx.fill();
  ctx.restore();

  // controller (held between hands area)
  if (!celebrate) {
    ctx.fillStyle = '#222'; ctx.beginPath(); ctx.roundRect(cx - 16, G - 46, 32, 16, 6); ctx.fill();
    ctx.fillStyle = '#e84040'; ctx.beginPath(); ctx.arc(cx + 8, G - 40, 3, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#4040e8'; ctx.beginPath(); ctx.arc(cx + 3, G - 36, 3, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#444'; ctx.beginPath(); ctx.roundRect(cx - 12, G - 44, 8, 4, 2); ctx.fill();
  }

  // head
  ctx.fillStyle = SKIN;
  ctx.beginPath(); ctx.ellipse(cx, G - 94, 16, 18, 0, 0, Math.PI*2); ctx.fill();

  // headset band
  ctx.strokeStyle = '#111'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(cx, G - 94, 20, Math.PI, 0); ctx.stroke();
  // ear cups
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.ellipse(cx - 20, G - 94, 7, 9, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + 20, G - 94, 7, 9, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#e84040';
  ctx.beginPath(); ctx.ellipse(cx - 20, G - 94, 4, 5, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + 20, G - 94, 4, 5, 0, 0, Math.PI*2); ctx.fill();

  // hair under headset
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath(); ctx.ellipse(cx, G - 106, 14, 8, 0, Math.PI, Math.PI*2); ctx.fill();

  // eyes — wide open
  ctx.fillStyle = '#1a1010';
  ctx.fillRect(cx - 8, G - 99, 5, 6);
  ctx.fillRect(cx + 3, G - 99, 5, 6);
  ctx.fillStyle = '#fff';
  ctx.fillRect(cx - 7, G - 98, 2, 2);
  ctx.fillRect(cx + 4, G - 98, 2, 2);

  // mouth — grin
  ctx.strokeStyle = SKIN_D; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, G - 85, 7, 0.1, Math.PI - 0.1); ctx.stroke();
  if (celebrate) {
    // teeth
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(cx, G - 85, 6, 0.1, Math.PI - 0.1); ctx.fill();
    ctx.fillStyle = SKIN; ctx.fillRect(cx - 6, G - 88, 12, 4);
  }
}

/** Technical — dark hoodie, glasses, floating keyboard */
function drawTechnical(
  ctx: CanvasRenderingContext2D,
  cx: number, ground: number,
  walkT: number,
  typing: number,   // 0–1
  teleportIn: number  // 0=fully visible, 1=fully teleported out
) {
  const G = ground;
  const alpha = 1 - teleportIn;

  ctx.save(); ctx.globalAlpha = alpha;

  // shadow
  ctx.save(); ctx.globalAlpha = 0.15 * alpha;
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.ellipse(cx, G + 2, 22, 5, 0, 0, Math.PI*2); ctx.fill();
  ctx.restore();

  // legs
  for (const [ox, phase] of [[-10, 0], [10, Math.PI]] as [number,number][]) {
    const s = Math.sin(walkT * Math.PI * 2 + phase) * 16;
    ctx.save(); ctx.translate(cx + ox, G - 34);
    ctx.rotate(s * Math.PI / 180);
    ctx.fillStyle = '#1a1a2a'; ctx.fillRect(-5, 0, 10, 34);
    ctx.fillStyle = '#0a0a14'; ctx.beginPath(); ctx.roundRect(-5, 30, 14, 8, 3); ctx.fill();
    ctx.restore();
  }

  // hoodie body
  ctx.fillStyle = '#1e1e2e';
  ctx.beginPath(); ctx.roundRect(cx - 20, G - 82, 40, 50, 6); ctx.fill();

  // hoodie strings
  ctx.strokeStyle = '#2a2a3e'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx - 5, G - 82); ctx.lineTo(cx - 8, G - 55); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + 5, G - 82); ctx.lineTo(cx + 8, G - 55); ctx.stroke();

  // green code glow on hoodie
  const glowPulse = 0.3 + typing * 0.4 + Math.sin(walkT * 8) * 0.1;
  ctx.fillStyle = `rgba(0,255,136,${glowPulse * 0.1})`;
  ctx.beginPath(); ctx.roundRect(cx - 20, G - 82, 40, 50, 6); ctx.fill();

  // arms — forward typing pose
  const typingBob = typing > 0 ? Math.sin(walkT * Math.PI * 8) * 5 : 0;
  ctx.save(); ctx.translate(cx - 20, G - 74);
  ctx.rotate((-50 + typingBob) * Math.PI / 180);
  ctx.fillStyle = '#1e1e2e'; ctx.fillRect(-5, 0, 10, 32);
  ctx.fillStyle = SKIN; ctx.beginPath(); ctx.arc(0, 32, 6, 0, Math.PI*2); ctx.fill();
  ctx.restore();

  ctx.save(); ctx.translate(cx + 20, G - 74);
  ctx.rotate((50 - typingBob) * Math.PI / 180);
  ctx.fillStyle = '#1e1e2e'; ctx.fillRect(-5, 0, 10, 32);
  ctx.fillStyle = SKIN; ctx.beginPath(); ctx.arc(0, 32, 6, 0, Math.PI*2); ctx.fill();
  ctx.restore();

  // floating keyboard
  if (typing > 0) {
    const kbY = G - 52 - typing * 12;
    ctx.fillStyle = 'rgba(0,20,10,0.9)';
    ctx.beginPath(); ctx.roundRect(cx - 28, kbY, 56, 18, 3); ctx.fill();
    ctx.strokeStyle = `rgba(0,255,136,${typing * 0.8})`; ctx.lineWidth = 1;
    ctx.strokeRect(cx - 28, kbY, 56, 18);
    // key rows
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 8; col++) {
        const kx = cx - 26 + col * 7;
        const ky = kbY + 3 + row * 7;
        ctx.fillStyle = `rgba(0,255,136,${0.3 + Math.sin(walkT * 15 + col + row) * 0.15})`;
        ctx.fillRect(kx, ky, 5, 5);
      }
    }
  }

  // head
  ctx.fillStyle = SKIN;
  ctx.beginPath(); ctx.ellipse(cx, G - 96, 16, 18, 0, 0, Math.PI*2); ctx.fill();

  // hoodie hood partially up
  ctx.fillStyle = '#181828';
  ctx.beginPath();
  ctx.arc(cx, G - 104, 19, Math.PI * 1.15, Math.PI * 1.85); ctx.fill();

  // glasses
  ctx.strokeStyle = '#88aacc'; ctx.lineWidth = 2;
  ctx.strokeRect(cx - 12, G - 101, 9, 7);
  ctx.strokeRect(cx + 3, G - 101, 9, 7);
  ctx.beginPath(); ctx.moveTo(cx - 3, G - 98); ctx.lineTo(cx + 3, G - 98); ctx.stroke();
  // lenses tint
  ctx.fillStyle = `rgba(0,255,136,0.12)`;
  ctx.fillRect(cx - 11, G - 100, 7, 5);
  ctx.fillRect(cx + 4, G - 100, 7, 5);

  // eyes behind glasses
  ctx.fillStyle = '#1a1010';
  ctx.fillRect(cx - 10, G - 99, 4, 4);
  ctx.fillRect(cx + 5, G - 99, 4, 4);

  // slight smirk
  ctx.strokeStyle = SKIN_D; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(cx + 2, G - 86, 4, 0.4, Math.PI - 0.8); ctx.stroke();

  // teleport pixel scatter effect
  if (teleportIn > 0) {
    for (let i = 0; i < 30; i++) {
      const px = cx + Math.sin(i * 137.5) * 40 * teleportIn;
      const py = G - 50 + Math.cos(i * 97.3) * 60 * teleportIn;
      ctx.fillStyle = `rgba(0,255,136,${(1 - teleportIn) * 0.8})`;
      ctx.fillRect(px, py, 3, 3);
    }
  }

  ctx.restore();
}

// ─────────────────────────────────────────────────────────────────
// PROFESSIONAL — chalk erase with suit avatar
// ─────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────
// PROFESSIONAL A — elevator doors + briefcase burst
// ─────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────
// PROFESSIONAL A — Zoom roundtable / boardroom presentation
// ─────────────────────────────────────────────────────────────────
function BoardroomEffect({ onMid, onDone }: { onMid: () => void; onDone: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width  = window.innerWidth;
    const H = canvas.height = window.innerHeight;
    const cx = W / 2;

    // ── Zoom-style layout ──
    // Left column: 3 attendee tiles stacked
    // Right area: presenter's main slide view
    const TILE_W = Math.min(W * 0.24, 190);
    const TILE_H = TILE_W * 0.62;
    const GAP    = 10;
    const TILES_X = W * 0.03;
    const TILE_POSITIONS = [
      { x: TILES_X, y: H * 0.08,                    name: 'Sarah M.',  role: 'PM',      color: '#4EC9B0' },
      { x: TILES_X, y: H * 0.08 + TILE_H + GAP,     name: 'James R.',  role: 'Design',  color: '#CE9178' },
      { x: TILES_X, y: H * 0.08 + (TILE_H + GAP)*2, name: 'Alex T.',   role: 'Eng',     color: '#DCDCAA' },
    ];

    // Main presenter area (slide view)
    const SLIDE_X = TILES_X + TILE_W + GAP * 2;
    const SLIDE_W = W - SLIDE_X - W * 0.03;
    const SLIDE_H = Math.min(SLIDE_W * 0.60, H * 0.72);
    const SLIDE_Y = H * 0.08;

    // Chat messages that appear on the slide overlay
    const CHAT: { t: number; from: string; msg: string; color: string }[] = [
      { t: 0.16, from: 'Sarah M.',  msg: 'Love the direction 👍',   color: '#4EC9B0' },
      { t: 0.26, from: 'James R.',  msg: 'Chart looks great!',       color: '#CE9178' },
      { t: 0.36, from: 'Alex T.',   msg: 'Q: timeline for v2?',      color: '#DCDCAA' },
      { t: MID,  from: 'Sarah M.',  msg: '🎉 Excellent work!',        color: '#4EC9B0' },
      { t: MID + 0.08, from: 'James R.', msg: '👏 Ship it!',         color: '#CE9178' },
    ];

    // Slide content — 3 slides cycling
    function drawSlide(progress: number, shipped: boolean) {
      ctx.save();
      ctx.beginPath(); ctx.roundRect(SLIDE_X, SLIDE_Y, SLIDE_W, SLIDE_H, 6); ctx.clip();

      // bg
      ctx.fillStyle = '#0d1117'; ctx.fillRect(SLIDE_X, SLIDE_Y, SLIDE_W, SLIDE_H);

      const slide = shipped ? 2 : Math.floor(progress * 3);
      const FS = Math.floor(Math.min(SLIDE_W * 0.05, 28));
      const subFS = Math.floor(FS * 0.5);

      if (slide === 0) {
        // Title slide
        ctx.font = `bold ${FS}px serif`; ctx.textAlign = 'center'; ctx.fillStyle = '#fff';
        ctx.fillText('Q4 ROADMAP', cx + (SLIDE_X - W * 0.03) / 2 - W * 0.03, SLIDE_Y + SLIDE_H * 0.38);
        ctx.font = `${subFS}px serif`; ctx.fillStyle = '#aaa';
        ctx.fillText('Professional Portfolio · 2024', cx + (SLIDE_X - W * 0.03) / 2 - W * 0.03, SLIDE_Y + SLIDE_H * 0.38 + FS * 1.3);
        // presenter name tag
        ctx.fillStyle = '#1a3a5c'; ctx.beginPath();
        ctx.roundRect(SLIDE_X + SLIDE_W * 0.3, SLIDE_Y + SLIDE_H * 0.68, SLIDE_W * 0.4, 28, 4); ctx.fill();
        ctx.font = `bold ${subFS * 0.9}px sans-serif`; ctx.fillStyle = '#4ec9ff';
        ctx.fillText('Dhrumil Shukla — Presenting', SLIDE_X + SLIDE_W * 0.5, SLIDE_Y + SLIDE_H * 0.68 + 18);

      } else if (slide === 1) {
        // Bar chart slide
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
          // bar
          const bg2 = ctx.createLinearGradient(bx, chartY + chartH - bh, bx, chartY + chartH);
          bg2.addColorStop(0, b.color); bg2.addColorStop(1, b.color + '55');
          ctx.fillStyle = bg2;
          ctx.beginPath(); ctx.roundRect(bx, chartY + chartH - bh, barW, bh, [3, 3, 0, 0]); ctx.fill();
          // label
          ctx.font = `${subFS * 0.8}px sans-serif`; ctx.textAlign = 'center'; ctx.fillStyle = '#aaa';
          ctx.fillText(b.label, bx + barW / 2, chartY + chartH + 14);
          // value
          if (animP > 0.5) {
            ctx.font = `bold ${subFS * 0.85}px monospace`; ctx.fillStyle = b.color;
            ctx.fillText(`${Math.floor(b.val * 100)}%`, bx + barW / 2, chartY + chartH - bh - 6);
          }
        });

      } else {
        // Victory / summary slide
        ctx.font = `bold ${FS * 1.1}px serif`; ctx.textAlign = 'center'; ctx.fillStyle = '#ffe44d';
        ctx.shadowColor = '#ffe44d'; ctx.shadowBlur = 16;
        ctx.fillText('TARGETS MET ✓', SLIDE_X + SLIDE_W / 2, SLIDE_Y + SLIDE_H * 0.35);
        ctx.shadowBlur = 0;
        const items = ['▸ 3 features shipped on time', '▸ Performance up 24%', '▸ 98% user satisfaction'];
        ctx.font = `${subFS}px serif`; ctx.fillStyle = '#ccc';
        items.forEach((it, i) => ctx.fillText(it, SLIDE_X + SLIDE_W / 2, SLIDE_Y + SLIDE_H * 0.52 + i * (subFS + 8)));
      }

      ctx.restore();

      // slide border
      ctx.strokeStyle = slide === 2 ? '#ffe44d' : '#333'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(SLIDE_X, SLIDE_Y, SLIDE_W, SLIDE_H, 6); ctx.stroke();

      // "SCREEN SHARE" badge top-left
      ctx.fillStyle = '#1a6639'; ctx.beginPath(); ctx.roundRect(SLIDE_X + 8, SLIDE_Y + 8, 110, 20, 4); ctx.fill();
      ctx.font = '10px monospace'; ctx.textAlign = 'left'; ctx.fillStyle = '#fff';
      ctx.fillText('● SCREEN SHARE', SLIDE_X + 14, SLIDE_Y + 21);
    }

    // Draw a single attendee's video tile
    function drawTile(tile: typeof TILE_POSITIONS[0], progress: number, celebrating: boolean) {
      const { x, y, name, role, color } = tile;
      // bg
      ctx.fillStyle = '#1c1c28';
      ctx.beginPath(); ctx.roundRect(x, y, TILE_W, TILE_H, 6); ctx.fill();
      ctx.strokeStyle = celebrating ? color : '#333'; ctx.lineWidth = celebrating ? 2 : 1;
      ctx.beginPath(); ctx.roundRect(x, y, TILE_W, TILE_H, 6); ctx.stroke();

      // simple face silhouette (no full avatar — just a Zoom-style head+shoulders)
      const faceX = x + TILE_W / 2;
      const faceY = y + TILE_H * 0.42;
      const faceR  = Math.min(TILE_W, TILE_H) * 0.18;

      // shoulders (blouse/shirt)
      ctx.fillStyle = celebrating ? color + '44' : '#2a2a3a';
      ctx.beginPath();
      ctx.ellipse(faceX, faceY + faceR * 2.4, faceR * 1.6, faceR * 1.1, 0, 0, Math.PI * 2); ctx.fill();

      // head
      ctx.fillStyle = '#f5c5a3';
      ctx.beginPath(); ctx.arc(faceX, faceY, faceR, 0, Math.PI * 2); ctx.fill();

      // hair (varied by index based on color)
      ctx.fillStyle = color === '#4EC9B0' ? '#8b4513' : color === '#CE9178' ? '#1a1a1a' : '#6b3a2a';
      ctx.beginPath(); ctx.arc(faceX, faceY - faceR * 0.4, faceR * 1.05, Math.PI, 0); ctx.fill();

      // eyes
      ctx.fillStyle = '#333';
      ctx.beginPath(); ctx.arc(faceX - faceR * 0.35, faceY - faceR * 0.05, faceR * 0.12, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(faceX + faceR * 0.35, faceY - faceR * 0.05, faceR * 0.12, 0, Math.PI * 2); ctx.fill();

      // happy or neutral mouth
      if (celebrating) {
        ctx.strokeStyle = '#333'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(faceX, faceY + faceR * 0.2, faceR * 0.3, 0, Math.PI); ctx.stroke();
      }

      // nod bob when listening
      const nod = Math.sin(progress * Math.PI * 4 + tile.x) > 0.7 && !celebrating ? -3 : 0;
      if (nod < 0) {
        ctx.save();
        ctx.translate(faceX, faceY + nod);
        ctx.fillStyle = '#f5c5a3';
        ctx.beginPath(); ctx.arc(0, 0, faceR, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }

      // reaction emoji when celebrating
      if (celebrating) {
        const emojiFS = Math.floor(faceR * 1.2);
        ctx.font = `${emojiFS}px serif`;
        ctx.textAlign = 'center';
        ctx.fillText('👏', faceX + faceR * 1.6, faceY - faceR * 0.8);
      }

      // name bar at bottom
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.beginPath(); ctx.roundRect(x, y + TILE_H - 22, TILE_W, 22, [0, 0, 6, 6]); ctx.fill();
      ctx.font = `bold ${Math.floor(Math.min(TILE_W * 0.12, 11))}px sans-serif`;
      ctx.textAlign = 'left'; ctx.fillStyle = '#fff';
      ctx.fillText(name, x + 8, y + TILE_H - 8);
      ctx.fillStyle = color;
      ctx.fillText(role, x + TILE_W - ctx.measureText(role).width - 8, y + TILE_H - 8);

      // mic active indicator
      const micColor = progress > 0 && Math.sin(progress * 25 + tile.x) > 0.5 ? color : '#555';
      ctx.fillStyle = micColor;
      ctx.beginPath(); ctx.roundRect(x + 6, y + 6, 10, 14, 3); ctx.fill();
      ctx.beginPath(); ctx.arc(x + 11, y + 20, 6, Math.PI, 0, true); ctx.strokeStyle = micColor; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + 11, y + 26); ctx.lineTo(x + 11, y + 30); ctx.stroke();
    }

    // Zoom toolbar at bottom
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

      // timer + participant count
      const elapsed = '00:' + String(Math.floor(H * 0.9 * 60)).padStart(2, '0');
      ctx.font = 'bold 11px monospace'; ctx.textAlign = 'left'; ctx.fillStyle = '#4a4a5a';
      ctx.fillText(`${elapsed}  ·  4 Participants`, 14, tbY + 28);

      // recording dot
      ctx.fillStyle = '#ff4444'; ctx.beginPath(); ctx.arc(W - 60, tbY + 24, 5, 0, Math.PI * 2); ctx.fill();
      ctx.font = '10px sans-serif'; ctx.fillStyle = '#ff4444'; ctx.textAlign = 'left';
      ctx.fillText('REC', W - 52, tbY + 28);
    }

    // Your own Zoom tile (bottom strip — "You | Presenting")
    function drawSelfTile(celebrate: boolean) {
      const selfW = TILE_W * 0.85; const selfH = selfW * 0.62;
      const selfX = SLIDE_X; const selfY = SLIDE_Y + SLIDE_H + GAP;

      ctx.fillStyle = '#12121e';
      ctx.beginPath(); ctx.roundRect(selfX, selfY, selfW, selfH, 6); ctx.fill();
      ctx.strokeStyle = celebrate ? '#ffe44d' : '#4a9eff'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(selfX, selfY, selfW, selfH, 6); ctx.stroke();

      // draw mini professional avatar inside the tile
      const avS = selfH * 0.65;
      ctx.save();
      const scaleF = avS / 90;
      ctx.translate(selfX + selfW / 2, selfY + selfH * 0.85);
      ctx.scale(scaleF, scaleF);
      drawProfessional(ctx, 0, 0, 0, celebrate ? 0.3 : 0);
      ctx.restore();

      // "YOU — PRESENTING" label
      ctx.fillStyle = 'rgba(0,0,0,0.65)';
      ctx.beginPath(); ctx.roundRect(selfX, selfY + selfH - 22, selfW, 22, [0, 0, 6, 6]); ctx.fill();
      ctx.font = `bold ${Math.floor(Math.min(selfW * 0.115, 11))}px sans-serif`;
      ctx.textAlign = 'left'; ctx.fillStyle = '#4a9eff';
      ctx.fillText('You  |  Presenting', selfX + 8, selfY + selfH - 7);
    }

    // Floating chat messages
    const activeMsgs: { msg: typeof CHAT[0]; born: number }[] = [];
    let fired = false;
    const start = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const t = Math.min((now - start) / DURATION, 1);
      if (t >= MID && !fired) { fired = true; onMid(); }

      // spawn chat messages at their trigger times
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

      // ── Slide / main view ──
      ctx.save(); ctx.globalAlpha = uiA;
      drawSlide(progress, celebrating);
      ctx.restore();

      // ── Attendee tiles ──
      TILE_POSITIONS.forEach(tile => {
        ctx.save(); ctx.globalAlpha = uiA;
        drawTile(tile, progress, celebrating);
        ctx.restore();
      });

      // ── Self tile ──
      ctx.save(); ctx.globalAlpha = uiA;
      drawSelfTile(celebrating);
      ctx.restore();

      // ── Zoom toolbar ──
      ctx.save(); ctx.globalAlpha = uiA;
      drawToolbar();
      ctx.restore();

      // ── Chat messages ──
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

      // ── "TARGETS MET" burst at MID ──
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

// ─────────────────────────────────────────────────────────────────
// PROFESSIONAL B — newspaper spin
// ─────────────────────────────────────────────────────────────────
function NewspaperEffect({ onMid, onDone }: { onMid: () => void; onDone: () => void }) {
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

    // Draw the left half of the open newspaper (front page content)
    function drawFrontPage() {
      const half = paperW / 2;
      // left half background
      ctx.fillStyle = '#f4ecd8';
      ctx.fillRect(paperX, paperY, half, paperH);
      // masthead across full width (drawn on left, bleeds to right)
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(paperX, paperY, paperW, 48);
      ctx.font = `bold ${Math.floor(Math.min(paperW * 0.052, 36))}px serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#f4ecd8';
      ctx.fillText('THE PORTFOLIO TIMES', cx, paperY + 18);
      ctx.font = `${Math.floor(Math.min(paperW * 0.021, 14))}px serif`;
      ctx.fillStyle = '#bbb';
      ctx.fillText('EST. 2019  ·  SPECIAL EDITION', cx, paperY + 36);
      // divider
      ctx.fillStyle = '#1a1a1a'; ctx.fillRect(paperX + 12, paperY + 48, half - 24, 2);
      // headline (left half)
      ctx.font = `bold ${Math.floor(Math.min(half * 0.13, 32))}px serif`;
      ctx.textAlign = 'left'; ctx.fillStyle = '#1a1a1a';
      const hlLines = half < 280 ? ['PROFESSIONAL', 'MODE ACTIVE'] : ['PROFESSIONAL', 'MODE', 'ACTIVATED'];
      hlLines.forEach((l, i) => ctx.fillText(l, paperX + 14, paperY + 70 + i * Math.min(half * 0.14, 36)));
      const afterHL = paperY + 70 + hlLines.length * Math.min(half * 0.14, 36) + 8;
      // sub headline
      ctx.font = `italic ${Math.floor(Math.min(half * 0.055, 13))}px serif`;
      ctx.fillStyle = '#555';
      ctx.fillText('"Credentials verified."', paperX + 14, afterHL);
      // column filler lines
      ctx.fillStyle = '#ddd';
      for (let li = 0; li < 10; li++) {
        const lw = (0.5 + Math.abs(Math.sin(li * 1.3)) * 0.4) * (half - 28);
        ctx.fillRect(paperX + 14, afterHL + 18 + li * 13, lw, 3);
      }
      // small photo box placeholder
      const imgY = afterHL + 18 + 10 * 13 + 8;
      ctx.fillStyle = '#d8cebc';
      ctx.fillRect(paperX + 14, imgY, half - 28, 40);
      ctx.font = `${Math.floor(Math.min(half * 0.05, 11))}px serif`;
      ctx.textAlign = 'center'; ctx.fillStyle = '#999';
      ctx.fillText('[PHOTO]', paperX + half / 2, imgY + 22);
      // center fold shadow
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.fillRect(cx - 4, paperY, 4, paperH);
    }

    // Draw the right half of the open newspaper (same front page, right columns)
    function drawRightFront() {
      const half = paperW / 2;
      ctx.fillStyle = '#f0e8d4';
      ctx.fillRect(cx, paperY, half, paperH);
      // right columns filler
      ctx.fillStyle = '#1a1a1a'; ctx.fillRect(cx + 12, paperY + 48, half - 24, 2);
      ctx.font = `bold ${Math.floor(Math.min(half * 0.09, 22))}px serif`;
      ctx.textAlign = 'left'; ctx.fillStyle = '#1a1a1a';
      ctx.fillText('INSIDE', cx + 14, paperY + 66);
      ctx.fillStyle = '#ddd';
      for (let li = 0; li < 14; li++) {
        const lw = (0.4 + Math.abs(Math.sin(li * 2.1)) * 0.5) * (half - 28);
        ctx.fillRect(cx + 14, paperY + 80 + li * 13, lw, 3);
      }
      // small ad block
      ctx.fillStyle = '#e8dfc8'; ctx.fillRect(cx + 14, paperY + 80 + 14 * 13 + 6, half - 28, 50);
      ctx.font = `bold ${Math.floor(Math.min(half * 0.06, 13))}px serif`;
      ctx.textAlign = 'center'; ctx.fillStyle = '#888';
      ctx.fillText('ADVERTISEMENT', cx + half / 2, paperY + 80 + 14 * 13 + 34);
    }

    // Draw the back/new page (revealed after flip)
    function drawNewPage() {
      const half = paperW / 2;
      ctx.fillStyle = '#f8f4ec';
      ctx.fillRect(cx, paperY, half, paperH);
      ctx.fillStyle = '#1a1a1a'; ctx.fillRect(cx + 12, paperY + 48, half - 24, 2);
      // "NEW PERSONALITY" headline on turned page
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

    // Newspaper border + fold line
    function drawPaperBorder() {
      ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 1.5;
      ctx.strokeRect(paperX, paperY, paperW, paperH);
      // center fold line
      ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(cx, paperY); ctx.lineTo(cx, paperY + paperH); ctx.stroke();
      ctx.setLineDash([]);
    }

    let fired = false;
    const start = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const t = Math.min((now - start) / DURATION, 1);
      if (t >= MID && !fired) { fired = true; onMid(); }

      ctx.clearRect(0, 0, W, H);

      const bgA = t < 0.06 ? t / 0.06 : t > 0.9 ? 1 - remap(t, 0.9, 1) : 1;
      ctx.fillStyle = `rgba(10,8,6,${bgA * 0.88})`; ctx.fillRect(0, 0, W, H);

      // ── Phase 1 (0→0.22): newspaper unfolds from avatar's hands to full size ──
      const unfold = easeOut(clamp(remap(t, 0.10, 0.26), 0, 1));
      // ── Phase 4 (0.74→0.88): newspaper folds back down ──
      const fold   = easeInOut(clamp(remap(t, 0.74, 0.88), 0, 1));
      const paperScale = fold > 0 ? 1 - fold * 0.92 : unfold;
      const paperAlpha = fold > 0 ? 1 - fold : unfold;

      // ── Phase 3 (0.42→0.56): page flip — right half scaleX: 1→0→-1 ──
      // flipT 0→1 over that range; scaleX = 1 - 2*flipT
      const flipRaw  = clamp(remap(t, 0.40, 0.56), 0, 1);
      const flipT    = easeInOut(flipRaw);
      const rightScaleX = 1 - 2 * flipT;  // positive=front, negative=new page
      const showNewPage = rightScaleX < 0;

      if (paperScale > 0.01) {
        ctx.save();
        ctx.globalAlpha = paperAlpha * bgA;
        ctx.translate(cx, cy);
        ctx.scale(paperScale, paperScale);
        ctx.translate(-cx, -cy);

        // left half always shows front page
        drawFrontPage();

        // right half: clip and draw with horizontal scale around center fold
        ctx.save();
        ctx.beginPath(); ctx.rect(cx, paperY, paperW / 2, paperH); ctx.clip();
        ctx.translate(cx, cy);
        ctx.scale(Math.abs(rightScaleX) || 0.001, 1);
        ctx.translate(-cx, -cy);
        if (showNewPage) { drawNewPage(); } else { drawRightFront(); }
        ctx.restore();

        drawPaperBorder();
        ctx.restore();

        // page-flip shadow curl (left edge of right page as it turns)
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

      // ── Avatar: present from t=0, raises arm to turn page during flip, walks off ──
      const avIn  = easeOut(clamp(remap(t, 0, 0.12), 0, 1));
      const avOut = clamp(remap(t, 0.86, 0.98), 0, 1);
      const avX   = avOut > 0
        ? W * 0.18 + avOut * (W + 80)
        : -80 + avIn * (W * 0.18 + 80);
      const avA = avOut > 0 ? 1 - avOut : avIn;
      // raise arm when reaching to turn the page
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

// random picker — alternates between elevator+briefcase and newspaper
// ─────────────────────────────────────────────────────────────────
// PROFESSIONAL C — vintage typewriter
// ─────────────────────────────────────────────────────────────────
function TypewriterEffect({ onMid, onDone }: { onMid: () => void; onDone: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width  = window.innerWidth;
    const H = canvas.height = window.innerHeight;
    const cx = W / 2;
    const GROUND = H * 0.82;
    const TWX = cx;       // typewriter center x
    const TWY = GROUND - 60; // typewriter top y

    const PAPER_LINES = [
      'NAME    : Dhrumil Shukla',
      'MODE    : PROFESSIONAL',
      'STATUS  : Active',
      'ROLE    : Software Engineer',
      'CREDS   : Verified ✓',
      '────────────────────────',
      'Loading portfolio...',
    ];

    function drawTypewriter(tw: number) {
      const TW = Math.min(W * 0.38, 280); // total width
      const TH = 110;
      const x = TWX - TW / 2;
      const y = TWY;

      // body shadow
      ctx.save(); ctx.globalAlpha = 0.25;
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.ellipse(TWX, y + TH + 8, TW * 0.45, 10, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      // main body
      const bodyGrad = ctx.createLinearGradient(x, y, x, y + TH);
      bodyGrad.addColorStop(0, '#3a3a3a');
      bodyGrad.addColorStop(0.5, '#2a2a2a');
      bodyGrad.addColorStop(1, '#1a1a1a');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath(); ctx.roundRect(x, y + 28, TW, TH - 28, [0, 0, 8, 8]); ctx.fill();
      ctx.strokeStyle = '#555'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(x, y + 28, TW, TH - 28, [0, 0, 8, 8]); ctx.stroke();

      // platen (paper roller)
      ctx.fillStyle = '#444';
      ctx.beginPath(); ctx.roundRect(x - 6, y + 14, TW + 12, 22, 8); ctx.fill();
      ctx.strokeStyle = '#555'; ctx.lineWidth = 1; ctx.strokeRect(x - 6, y + 14, TW + 12, 22);
      // roller end knobs
      for (const kx of [x - 12, x + TW + 6]) {
        ctx.fillStyle = '#555'; ctx.beginPath(); ctx.arc(kx, y + 25, 7, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#666'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(kx, y + 25, 7, 0, Math.PI * 2); ctx.stroke();
      }

      // paper slot
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(x + TW * 0.12, y + 14, TW * 0.76, 22);

      // paper sheet (white, sticking up from platen)
      const paperH = 130;
      const paperW = TW * 0.72;
      const paperX = TWX - paperW / 2;
      const paperY = y + 16 - paperH + tw * paperH * 0.6; // paper feeds upward as tw increases
      ctx.fillStyle = '#f5f5f0';
      ctx.fillRect(paperX, paperY, paperW, paperH + 10);
      ctx.strokeStyle = '#ddd'; ctx.lineWidth = 0.5; ctx.strokeRect(paperX, paperY, paperW, paperH + 10);

      // typed lines on paper
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
      // partial current line with cursor
      if (visibleLines < PAPER_LINES.length) {
        const currentLine = PAPER_LINES[visibleLines];
        const charCount = Math.floor(partial * currentLine.length);
        const ly = paperY + 16 + visibleLines * 16;
        if (ly >= paperY + 2 && ly <= paperY + paperH + 8) {
          ctx.fillStyle = '#1a1a1a';
          ctx.fillText(currentLine.slice(0, charCount), paperX + 10, ly);
          // cursor blink
          if (Math.sin(performance.now() * 0.015) > 0) {
            const cw = ctx.measureText(currentLine.slice(0, charCount)).width;
            ctx.fillStyle = '#333'; ctx.fillRect(paperX + 10 + cw, ly - 11, 7, 12);
          }
        }
      }

      // carriage bar (moves left to right with typing)
      const carriageX = x + TW * 0.1 + tw * TW * 0.8;
      ctx.fillStyle = '#555'; ctx.fillRect(x - 4, y + 36, TW + 8, 4);
      ctx.fillStyle = '#666'; ctx.beginPath(); ctx.roundRect(carriageX - 4, y + 33, 8, 10, 2); ctx.fill();

      // key rows
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
          // random key bounce when typing
          const bounce = Math.sin(performance.now() * 0.03 + k * 1.7) > 0.7 && tw > 0.05 && tw < 0.9 ? 2 : 0;
          ctx.fillStyle = '#3d3d3d';
          ctx.beginPath(); ctx.roundRect(kx, row.y + bounce, keyW, 10, 2); ctx.fill();
          ctx.strokeStyle = '#555'; ctx.lineWidth = 0.5;
          ctx.beginPath(); ctx.roundRect(kx, row.y + bounce, keyW, 10, 2); ctx.stroke();
        }
      });
      // space bar
      ctx.fillStyle = '#3d3d3d'; ctx.beginPath(); ctx.roundRect(TWX - TW * 0.25, y + 108, TW * 0.5, 10, 3); ctx.fill();
      ctx.strokeStyle = '#555'; ctx.lineWidth = 0.5; ctx.strokeRect(TWX - TW * 0.25, y + 108, TW * 0.5, 10);
    }

    let fired = false;
    const start = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const t = Math.min((now - start) / DURATION, 1);
      if (t >= MID && !fired) { fired = true; onMid(); }

      ctx.clearRect(0, 0, W, H);

      // dark overlay bg
      const bgA = t < 0.06 ? t / 0.06 : t > 0.9 ? 1 - remap(t, 0.9, 1) : 1;
      ctx.fillStyle = `rgba(8,8,10,${bgA * 0.88})`; ctx.fillRect(0, 0, W, H);

      // desk surface
      if (bgA > 0.3) {
        ctx.save(); ctx.globalAlpha = bgA * 0.7;
        const deskGrad = ctx.createLinearGradient(0, GROUND, 0, H);
        deskGrad.addColorStop(0, '#1e1810'); deskGrad.addColorStop(1, '#0e0c08');
        ctx.fillStyle = deskGrad; ctx.fillRect(0, GROUND, W, H - GROUND);
        ctx.fillStyle = '#2a2218'; ctx.fillRect(0, GROUND - 2, W, 4);
        ctx.restore();
      }

      // typewriter appears (0.12→0.22) via scale-up
      const twAppear = easeOut(clamp(remap(t, 0.12, 0.22), 0, 1));
      // paper yanked out (0.72→0.82)
      const paperYank = easeInOut(clamp(remap(t, 0.72, 0.82), 0, 1));
      // typing progress (0.22→0.68)
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

      // paper yank — sheet flies upward and off screen
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

      // carriage-return ding flashes (at each line boundary)
      const lineT = typingProg * PAPER_LINES.length;
      const lineFrac = lineT % 1;
      if (lineFrac < 0.06 && typingProg > 0.02 && typingProg < 0.98) {
        ctx.fillStyle = `rgba(255,245,200,${(1 - lineFrac / 0.06) * 0.18})`;
        ctx.fillRect(0, 0, W, H);
      }

      // avatar — walks in from left immediately, stands typing, walks off right
      const avIn  = easeOut(clamp(remap(t, 0, 0.14), 0, 1));
      const avOut = clamp(remap(t, 0.86, 0.98), 0, 1);
      const avX   = avOut > 0
        ? cx + avOut * (W - cx + 80)
        : -60 + avIn * (cx - 60 + 60);
      const avA = avOut > 0 ? 1 - avOut : avIn;
      // arm raise tracks typing intensity
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

function ProfessionalEffect({ onMid, onDone }: { onMid: () => void; onDone: () => void }) {
  const pick = useRef(Math.floor(Math.random() * 3)).current;
  if (pick === 0) return <BoardroomEffect  onMid={onMid} onDone={onDone} />;
  if (pick === 1) return <NewspaperEffect  onMid={onMid} onDone={onDone} />;
  return                  <TypewriterEffect onMid={onMid} onDone={onDone} />;
}

// ─────────────────────────────────────────────────────────────────
// GAMER — explosion with gamer avatar
// ─────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────
// GAMER A — Overcooked co-op cooking
// ─────────────────────────────────────────────────────────────────
function OvercookedEffect({ onMid, onDone }: { onMid: () => void; onDone: () => void }) {
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

      // legs — walk cycle
      const legSwing = Math.sin(walkCycle * Math.PI * 2) * (celebrate ? 20 : 14);
      ctx.save();
      ctx.strokeStyle = '#6b2fa0'; ctx.lineWidth = 7 * s; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(wx, by - 28 * s); ctx.lineTo(wx - 7 * s + legSwing, by); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(wx, by - 28 * s); ctx.lineTo(wx + 7 * s - legSwing, by); ctx.stroke();
      ctx.restore();

      // body — purple hoodie
      const bodyGrad = ctx.createLinearGradient(wx - 14 * s, by - 56 * s, wx + 14 * s, by - 26 * s);
      bodyGrad.addColorStop(0, '#8e44d9'); bodyGrad.addColorStop(1, '#6b2fa0');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath(); ctx.roundRect(wx - 14 * s, by - 60 * s, 28 * s, 34 * s, 6 * s);
      ctx.fill();
      // hoodie pocket
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath(); ctx.roundRect(wx - 8 * s, by - 38 * s, 16 * s, 10 * s, 3 * s); ctx.fill();

      // arms — carry/celebrate
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

    let confettiSpawned = false;
    let fired = false;
    const start = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const t = Math.min((now - start) / DURATION, 1);
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

      // ── Gamer (player 1) — walks in from left ──
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

      // ── Wife (player 2) — walks in from right ──
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

// ─────────────────────────────────────────────────────────────────
// GAMER B — NBA Basketball
// ─────────────────────────────────────────────────────────────────
function BasketballEffect({ onMid, onDone }: { onMid: () => void; onDone: () => void }) {
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

    let confettiSpawned = false;
    let fired = false;
    const start = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const t = Math.min((now - start) / DURATION, 1);
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
      const jump  = t > MID + 0.08 ? Math.abs(Math.sin(remap(t, MID + 0.08, 0.82) * Math.PI * 1.5)) * 0.6 : 0;
      ctx.save(); ctx.globalAlpha = Math.max(avA, 0) * bgA;
      drawGamer(ctx, avX, GROUND, t * 5, jump, t > MID + 0.08);
      ctx.restore();

      if (t < 1) { raf = requestAnimationFrame(tick); }
      else { ctx.clearRect(0, 0, W, H); onDone(); }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onMid, onDone]);

  return <canvas ref={ref} className={styles.canvas} />;
}

// ─────────────────────────────────────────────────────────────────
// GAMER C — Mario-style platformer run
// ─────────────────────────────────────────────────────────────────
function PlatformerEffect({ onMid, onDone }: { onMid: () => void; onDone: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width  = window.innerWidth;
    const H = canvas.height = window.innerHeight;
    const cx = W / 2;

    // pixel-art crisp rendering
    ctx.imageSmoothingEnabled = false;

    const GROUND  = H * 0.76;
    const BLOCK   = Math.max(Math.floor(Math.min(W * 0.045, 36)), 20); // tile size
    const QBLK1_X = W * 0.30;
    const QBLK2_X = W * 0.52;
    const PIPE_X  = W * 0.48;
    const POLE_X  = W * 0.82;
    const POLE_TOP = H * 0.20;

    // pixel cloud: stack of rectangles
    function drawCloud(cx2: number, cy2: number, scale: number) {
      ctx.fillStyle = '#fff';
      const w = BLOCK * 2 * scale; const h = BLOCK * scale;
      ctx.fillRect(cx2 - w / 2,        cy2,             w,             h * 0.6);
      ctx.fillRect(cx2 - w * 0.3,      cy2 - h * 0.45,  w * 0.6,       h * 0.55);
      ctx.fillRect(cx2 - w * 0.7,      cy2 - h * 0.22,  w * 0.42,      h * 0.4);
      ctx.fillRect(cx2 + w * 0.28,     cy2 - h * 0.22,  w * 0.42,      h * 0.4);
    }

    function drawGroundRow() {
      // two-tone ground blocks across full width
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
      ctx.fillRect(bx - BLOCK / 2, by, BLOCK, 4);          // top shade
      ctx.fillRect(bx - BLOCK / 2, by + BLOCK - 4, BLOCK, 4); // bottom shade
      ctx.fillRect(bx - BLOCK / 2, by, 4, BLOCK);           // left shade
      ctx.fillStyle = hit ? '#666' : '#8b5a00';
      ctx.font = `bold ${Math.floor(BLOCK * 0.7)}px monospace`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(hit ? '·' : '?', bx, by + BLOCK / 2 + 1);
    }

    function drawPipe(px: number) {
      const pipeH = BLOCK * 3;
      const pipeW = BLOCK * 2.2;
      // body
      ctx.fillStyle = '#28a030';
      ctx.fillRect(px - pipeW / 2, GROUND - pipeH, pipeW, pipeH);
      // highlight stripe
      ctx.fillStyle = '#40cc48';
      ctx.fillRect(px - pipeW / 2 + 4, GROUND - pipeH + 4, 6, pipeH - 8);
      // top lip
      ctx.fillStyle = '#22882a';
      ctx.fillRect(px - pipeW / 2 - 5, GROUND - pipeH - 10, pipeW + 10, 14);
      ctx.fillStyle = '#40cc48';
      ctx.fillRect(px - pipeW / 2 - 5, GROUND - pipeH - 10, pipeW + 10, 5);
    }

    function drawFlagPole(flagSlide: number) {
      // pole
      ctx.fillStyle = '#aaa';
      ctx.fillRect(POLE_X - 2, POLE_TOP, 4, GROUND - POLE_TOP);
      // ball on top
      ctx.fillStyle = '#ffdd00'; ctx.beginPath(); ctx.arc(POLE_X, POLE_TOP, 7, 0, Math.PI * 2); ctx.fill();
      // flag — slides down pole at MID
      const flagY = POLE_TOP + 8 + flagSlide * (GROUND - POLE_TOP - BLOCK * 2);
      ctx.fillStyle = '#e02020';
      ctx.beginPath();
      ctx.moveTo(POLE_X + 2, flagY);
      ctx.lineTo(POLE_X + 2 + BLOCK * 1.6, flagY + BLOCK * 0.6);
      ctx.lineTo(POLE_X + 2, flagY + BLOCK * 1.2);
      ctx.closePath(); ctx.fill();
      // castle outline (right edge hint)
      ctx.fillStyle = '#bbb';
      for (let ci = 0; ci < 5; ci++) {
        if (ci % 2 === 0) ctx.fillRect(POLE_X + BLOCK * 1.4 + ci * (BLOCK * 0.4), GROUND - BLOCK * 3 - BLOCK * 0.5, BLOCK * 0.4, BLOCK * 0.5);
      }
      ctx.fillStyle = '#ccc';
      ctx.fillRect(POLE_X + BLOCK * 1.4, GROUND - BLOCK * 3, BLOCK * 2, BLOCK * 3);
      ctx.fillStyle = '#aaa';
      ctx.fillRect(POLE_X + BLOCK * 1.8, GROUND - BLOCK * 1.5, BLOCK * 1.1, BLOCK * 1.5); // door
    }

    // coin pop from ? block
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

    // firework burst
    type FW = { x: number; y: number; color: string; angle: number; speed: number };
    const fireworks: FW[] = [];
    function spawnFirework(fx: number, fy: number, color: string) {
      for (let i = 0; i < 16; i++) {
        fireworks.push({ x: fx, y: fy, color, angle: (i / 16) * Math.PI * 2, speed: 3 + Math.random() * 5 });
      }
    }

    let fwSpawned = false;
    let fired = false;
    const start = performance.now();
    let raf: number;
    let coinsCollected = 0;

    const tick = (now: number) => {
      const t = Math.min((now - start) / DURATION, 1);
      if (t >= MID && !fired) {
        fired = true; onMid();
        spawnFirework(POLE_X, H * 0.35, '#ffdd00');
        spawnFirework(POLE_X - W * 0.1, H * 0.28, '#ff4488');
        spawnFirework(POLE_X + W * 0.08, H * 0.32, '#44ddff');
        fwSpawned = true;
      }

      ctx.clearRect(0, 0, W, H);

      const bgA = t < 0.05 ? t / 0.05 : t > 0.9 ? 1 - remap(t, 0.9, 1) : 1;

      // ── Sky ──
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

      // ── HUD ──
      if (bgA > 0.2) {
        ctx.save(); ctx.globalAlpha = bgA;
        ctx.font = `bold ${Math.floor(Math.min(W * 0.022, 16))}px monospace`;
        ctx.textAlign = 'left'; ctx.fillStyle = '#fff';
        ctx.fillText(`SCORE  ${String(Math.floor(t * 12400)).padStart(6, '0')}`, W * 0.06, H * 0.07);
        ctx.fillText(`COINS  ×${String(coinsCollected).padStart(2, '0')}`, cx - 60, H * 0.07);
        ctx.fillText(`TIME   ${String(Math.max(0, Math.floor((1 - t) * 340))).padStart(3, '0')}`, W * 0.76, H * 0.07);
        ctx.restore();
      }

      // ── Ground ──
      ctx.save(); ctx.globalAlpha = bgA;
      drawGroundRow();

      // ? blocks — first gets hit when character passes under it (t ≈ 0.24)
      const blk1Hit = t > 0.22;
      const blk1HitBob = blk1Hit ? Math.max(0, Math.sin(remap(t, 0.22, 0.30) * Math.PI) * BLOCK * 0.6) : 0;
      drawQBlock(QBLK1_X, blk1HitBob, blk1Hit);

      const blk2Hit = t > 0.38;
      const blk2HitBob = blk2Hit ? Math.max(0, Math.sin(remap(t, 0.38, 0.46) * Math.PI) * BLOCK * 0.6) : 0;
      drawQBlock(QBLK2_X, blk2HitBob, blk2Hit);

      // pipe
      drawPipe(PIPE_X);

      // flag pole (flag slides down at MID)
      const flagSlide = t >= MID ? easeOut(clamp(remap(t, MID, MID + 0.18), 0, 1)) : 0;
      drawFlagPole(flagSlide);
      ctx.restore();

      // coins popping from ? blocks
      const coin1T = clamp(remap(t, 0.22, 0.46), 0, 1);
      const coin2T = clamp(remap(t, 0.38, 0.62), 0, 1);
      if (coin1T > 0) { if (coin1T > 0.05 && coinsCollected < 1) coinsCollected = 1; ctx.save(); ctx.globalAlpha = bgA; drawCoin(QBLK1_X, coin1T); ctx.restore(); }
      if (coin2T > 0) { if (coin2T > 0.05 && coinsCollected < 2) coinsCollected = 2; ctx.save(); ctx.globalAlpha = bgA; drawCoin(QBLK2_X, coin2T); ctx.restore(); }

      // ── Character movement ──
      // 0→0.12: run in from left
      // 0.12→0.40: run to just before pipe
      // 0.40→0.52: big jump arc over pipe (peak at 0.46)
      // 0.52→MID: run to flag pole
      // MID→0.78: celebrate at pole
      // 0.78→0.94: run off right into castle
      let charX: number, charY: number;
      const jumpT = clamp(remap(t, 0.40, 0.54), 0, 1);
      const jumpHeight = Math.sin(jumpT * Math.PI) * BLOCK * 4.5;

      if (t < 0.40) {
        charX = -60 + easeOut(clamp(remap(t, 0, 0.12), 0, 1)) * (PIPE_X - BLOCK * 1.8 + 60);
        charX = Math.min(charX, PIPE_X - BLOCK * 1.8);
        charY = GROUND;
      } else if (t < 0.54) {
        charX = PIPE_X - BLOCK * 1.8 + jumpT * (BLOCK * 4.5);
        charY = GROUND - jumpHeight;
      } else if (t < MID) {
        charX = (PIPE_X + BLOCK * 2.7) + easeOut(clamp(remap(t, 0.54, MID), 0, 1)) * (POLE_X - (PIPE_X + BLOCK * 2.7) - 10);
        charY = GROUND;
      } else if (t < 0.78) {
        charX = POLE_X - 12;
        charY = GROUND;
      } else {
        charX = POLE_X + easeInOut(clamp(remap(t, 0.78, 0.94), 0, 1)) * (W + 80 - POLE_X);
        charY = GROUND;
      }

      // hit-block jump: tiny hop when near QBLK1 or QBLK2
      const nearBlk1 = t > 0.20 && t < 0.26;
      const nearBlk2 = t > 0.36 && t < 0.42;
      const blockBop = (nearBlk1 || nearBlk2) ? Math.max(0, Math.sin(remap(t, nearBlk1 ? 0.20 : 0.36, nearBlk1 ? 0.26 : 0.42) * Math.PI) * BLOCK * 1.2) : 0;
      charY -= blockBop;

      const celebrate = t >= MID && t < 0.78;
      const celebJump = celebrate ? Math.abs(Math.sin(remap(t, MID, 0.78) * Math.PI * 3)) * 0.8 : 0;
      ctx.save(); ctx.globalAlpha = bgA;
      drawGamer(ctx, charX, charY, t * 9, jumpT > 0 && jumpT < 1 ? jumpHeight / (BLOCK * 4.5) : celebJump, celebrate);
      ctx.restore();

      // ── Fireworks ──
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

      // ── COURSE CLEAR! banner ──
      if (t >= MID && t < MID + 0.52) {
        const bt = remap(t, MID, MID + 0.52);
        const scale = bt < 0.16 ? easeOut(bt / 0.16) * 1.15 : 1 + (1 - easeInOut((bt - 0.16) / 0.84)) * 0.15;
        const alpha = bt < 0.08 ? bt / 0.08 : bt > 0.8 ? 1 - remap(bt, 0.8, 1) : 1;
        const FS = clamp(W * 0.072, 34, 62);
        ctx.save(); ctx.globalAlpha = alpha * bgA;
        ctx.translate(cx, H * 0.44); ctx.scale(scale, scale);

        // banner bg
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(-W * 0.38, -FS * 0.8, W * 0.76, FS * 1.8);

        ctx.font = `bold ${FS}px monospace`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffdd00'; ctx.shadowColor = '#ffaa00'; ctx.shadowBlur = 18;
        ctx.fillText('COURSE CLEAR!', 0, 0);
        ctx.shadowBlur = 0;

        // sub text
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

function GamerEffect({ onMid, onDone }: { onMid: () => void; onDone: () => void }) {
  const pick = useRef(Math.floor(Math.random() * 3)).current;
  if (pick === 0) return <OvercookedEffect   onMid={onMid} onDone={onDone} />;
  if (pick === 1) return <BasketballEffect   onMid={onMid} onDone={onDone} />;
  return                  <PlatformerEffect  onMid={onMid} onDone={onDone} />;
}

// ─────────────────────────────────────────────────────────────────
// TECHNICAL — glitch + binary rain with hacker avatar
// ─────────────────────────────────────────────────────────────────
function GlitchEffect({ onMid, onDone }: { onMid: () => void; onDone: () => void }) {
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
    const CHARS = '01アイウエカキクサシスタチナニ<>{}|∑∆∂∫#@$%&';

    const bands = Array.from({ length: 12 }, (_, i) => ({
      y:    (i / 12) * H,
      h:    H / 12,
      seed: Math.sin(i * 3.7),
    }));

    const GROUND = H * 0.82;
    let fired = false;
    const start = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const t = Math.min((now - start) / DURATION, 1);
      if (t >= MID && !fired) { fired = true; onMid(); }

      ctx.clearRect(0, 0, W, H);

      // bg
      const bgA = t < 0.08 ? t / 0.08 : t > 0.88 ? 1 - remap(t, 0.88, 1) : 1;
      ctx.fillStyle = `rgba(0,4,2,${bgA * 0.94})`; ctx.fillRect(0, 0, W, H);

      // glitch bands
      if (t < 0.72) {
        const gt = t / 0.72;
        bands.forEach((b, i) => {
          const intensity = Math.sin(t * 14 + i * 2.1) * Math.sin(t * 7 + i);
          const offset    = intensity * 38 * b.seed * easeOut(Math.min(gt * 2, 1));
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
        drops.forEach((drop, col) => {
          const steps = Math.floor(rainT * DURATION / 42);
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
        ctx.save(); ctx.globalAlpha = a;
        ctx.font = 'bold 30px monospace'; ctx.textAlign = 'center';
        ctx.fillStyle = '#00ff88'; ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 16;
        ctx.fillText('[ ACCESS GRANTED ]', W / 2, H * 0.35);
        ctx.font = '13px monospace'; ctx.fillStyle = 'rgba(0,255,136,0.5)'; ctx.shadowBlur = 0;
        ctx.fillText('sudo personality-switch --target=technical   ✓', W / 2, H * 0.35 + 28);
        ctx.restore();
      }

      // avatar teleports in immediately, stands typing throughout, teleports out at end
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

// ─────────────────────────────────────────────────────────────────
// TECHNICAL B — BIOS / boot sequence
// ─────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────
// TECHNICAL B — Team game-dev sprint (building NBA 2K together)
// ─────────────────────────────────────────────────────────────────
function TeamBuildEffect({ onMid, onDone }: { onMid: () => void; onDone: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width  = window.innerWidth;
    const H = canvas.height = window.innerHeight;
    const cx = W / 2;
    const GROUND = H * 0.82;
    const DESK_Y  = GROUND - 10;

    // 4 dev stations spread across screen
    const STATIONS = [
      { x: W * 0.12, label: 'engine',   color: '#569CD6' },
      { x: W * 0.36, label: 'gameplay', color: '#4EC9B0' },
      { x: W * 0.62, label: 'art',      color: '#CE9178' },
      { x: W * 0.86, label: 'qa',       color: '#DCDCAA' },
    ];
    // user is station index 1 (gameplay — most central-left)
    const USER_IDX = 1;

    // small technical-style dev figure (monochrome variant)
    function drawDev(dx: number, dy: number, walkT: number, typing: number, celebrate: boolean, isUser: boolean) {
      const col  = isUser ? '#569CD6' : '#4a4a5a';
      const col2 = isUser ? '#3a7abf' : '#3a3a48';
      const bobY = celebrate ? Math.abs(Math.sin(walkT * Math.PI * 2)) * 10 : 0;

      // shadow
      ctx.save(); ctx.globalAlpha = 0.15;
      ctx.beginPath(); ctx.ellipse(dx, dy - 2, 16, 4, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#000'; ctx.fill(); ctx.restore();

      // legs
      const legSw = Math.sin(walkT * Math.PI * 2) * (celebrate ? 18 : 0);
      ctx.strokeStyle = col2; ctx.lineWidth = 6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(dx, dy - bobY - 24); ctx.lineTo(dx - 6 + legSw, dy - bobY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(dx, dy - bobY - 24); ctx.lineTo(dx + 6 - legSw, dy - bobY); ctx.stroke();

      // body
      const bg = ctx.createLinearGradient(dx - 12, dy - bobY - 52, dx + 12, dy - bobY - 22);
      bg.addColorStop(0, col); bg.addColorStop(1, col2);
      ctx.fillStyle = bg;
      ctx.beginPath(); ctx.roundRect(dx - 12, dy - bobY - 56, 24, 34, 5); ctx.fill();

      // hoodie pocket
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath(); ctx.roundRect(dx - 7, dy - bobY - 35, 14, 8, 2); ctx.fill();

      // arms — typing bob or celebrate
      const aSw = Math.sin(walkT * Math.PI * 4) * (typing > 0 ? 6 : 0);
      const aRaise = celebrate ? 20 + Math.abs(Math.sin(walkT * 4)) * 12 : 0;
      ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(dx - 12, dy - bobY - 48); ctx.lineTo(dx - 22, dy - bobY - 38 + aSw - aRaise); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(dx + 12, dy - bobY - 48); ctx.lineTo(dx + 22, dy - bobY - 38 - aSw - aRaise); ctx.stroke();

      // head
      ctx.fillStyle = '#f5c5a3';
      ctx.beginPath(); ctx.arc(dx, dy - bobY - 66, 12, 0, Math.PI * 2); ctx.fill();

      // hair / beanie
      ctx.fillStyle = isUser ? '#1a3a5c' : '#2a2a36';
      ctx.beginPath(); ctx.arc(dx, dy - bobY - 72, 10, Math.PI, 0); ctx.fill();
      ctx.fillRect(dx - 12, dy - bobY - 74, 24, 7);

      // glasses (tech look)
      ctx.strokeStyle = '#888'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.roundRect(dx - 9, dy - bobY - 70, 7, 5, 2); ctx.stroke();
      ctx.beginPath(); ctx.roundRect(dx + 2, dy - bobY - 70, 7, 5, 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(dx - 2, dy - bobY - 67); ctx.lineTo(dx + 2, dy - bobY - 67); ctx.stroke();

      // eyes
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

    // a small laptop/monitor on desk
    function drawDesk(dx: number, stationColor: string, screenContent: () => void) {
      const deskW = Math.min(W * 0.12, 80);
      // desk surface
      ctx.fillStyle = '#2a2a30';
      ctx.beginPath(); ctx.roundRect(dx - deskW / 2, DESK_Y - 18, deskW, 18, [0, 0, 4, 4]); ctx.fill();
      ctx.fillStyle = '#1a1a20'; ctx.fillRect(dx - deskW / 2, DESK_Y - 6, deskW, 6);

      // monitor stand
      ctx.fillStyle = '#333'; ctx.fillRect(dx - 4, DESK_Y - 18 - 26, 8, 26);
      ctx.fillRect(dx - 14, DESK_Y - 18 - 2, 28, 4);

      // monitor screen
      const mW = deskW * 1.1; const mH = mW * 0.62;
      const mX = dx - mW / 2; const mY = DESK_Y - 18 - 26 - mH;
      ctx.fillStyle = '#111';
      ctx.beginPath(); ctx.roundRect(mX - 4, mY - 4, mW + 8, mH + 8, 4); ctx.fill();
      ctx.strokeStyle = '#333'; ctx.lineWidth = 1; ctx.stroke();

      // screen glow
      ctx.save();
      ctx.beginPath(); ctx.roundRect(mX, mY, mW, mH, 2); ctx.clip();
      ctx.fillStyle = '#0d1117'; ctx.fillRect(mX, mY, mW, mH);
      screenContent();
      // station color tint
      ctx.fillStyle = `${stationColor}08`; ctx.fillRect(mX, mY, mW, mH);
      ctx.restore();

      // status LED
      ctx.fillStyle = stationColor;
      ctx.beginPath(); ctx.arc(mX + mW + 4, mY + 4, 3, 0, Math.PI * 2); ctx.fill();
    }

    // PR / notification bubbles that fly between stations
    type Bubble = { fromX: number; toX: number; y: number; t0: number; t1: number; text: string; color: string };
    const BUBBLES: Bubble[] = [
      { fromX: STATIONS[2].x, toX: STATIONS[1].x, y: GROUND - 120, t0: 0.14, t1: 0.28, text: 'art assets ✓', color: '#CE9178' },
      { fromX: STATIONS[0].x, toX: STATIONS[1].x, y: GROUND - 140, t0: 0.20, t1: 0.34, text: 'engine API ready', color: '#569CD6' },
      { fromX: STATIONS[1].x, toX: STATIONS[3].x, y: GROUND - 125, t0: 0.26, t1: 0.40, text: 'PR #847 merged', color: '#4EC9B0' },
      { fromX: STATIONS[3].x, toX: STATIONS[1].x, y: GROUND - 110, t0: 0.32, t1: 0.44, text: 'tests passing ✓', color: '#DCDCAA' },
      { fromX: STATIONS[0].x, toX: cx,             y: GROUND - 160, t0: 0.38, t1: MID,  text: 'build triggered 🚀', color: '#00ff88' },
    ];

    // big central screen (floating above, shows game being built)
    const SCREEN_W = Math.min(W * 0.44, 360);
    const SCREEN_H = SCREEN_W * 0.58;
    const SCREEN_X = cx - SCREEN_W / 2;
    const SCREEN_Y = H * 0.06;

    function drawBigScreen(buildProgress: number, shipped: boolean) {
      // frame
      ctx.fillStyle = '#111';
      ctx.beginPath(); ctx.roundRect(SCREEN_X - 6, SCREEN_Y - 6, SCREEN_W + 12, SCREEN_H + 12, 6); ctx.fill();
      ctx.strokeStyle = '#333'; ctx.lineWidth = 2; ctx.stroke();

      // title bar
      ctx.fillStyle = '#0d1117';
      ctx.beginPath(); ctx.roundRect(SCREEN_X, SCREEN_Y, SCREEN_W, SCREEN_H, 3); ctx.fill();
      ctx.fillStyle = '#161b22'; ctx.fillRect(SCREEN_X, SCREEN_Y, SCREEN_W, 18);
      ctx.font = '10px monospace'; ctx.textAlign = 'left'; ctx.fillStyle = '#569CD6';
      ctx.fillText('  nba2k_engine — main  ●', SCREEN_X + 4, SCREEN_Y + 12);

      // dots
      for (const [di, dc] of [[6,'#ff5f57'],[20,'#ffbd2e'],[34,'#28c840']] as [number,string][]) {
        ctx.fillStyle = dc; ctx.beginPath(); ctx.arc(SCREEN_X + SCREEN_W - di, SCREEN_Y + 9, 4, 0, Math.PI * 2); ctx.fill();
      }

      const CY = SCREEN_Y + 22;
      const CH = SCREEN_H - 22;

      if (!shipped) {
        // show scrolling code lines building up
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
        // cursor blink
        if (Math.sin(buildProgress * 40) > 0 && curY < CY + CH) {
          ctx.fillStyle = '#569CD6'; ctx.fillRect(curX, curY - 9, 6, 10);
        }

        // build bar at bottom of screen
        const barProgress = buildProgress;
        const bY = CY + CH - 22;
        ctx.fillStyle = '#0d1117'; ctx.fillRect(SCREEN_X + 4, bY, SCREEN_W - 8, 18);
        ctx.fillStyle = barProgress > 0.85 ? '#28c840' : '#569CD6';
        ctx.beginPath(); ctx.roundRect(SCREEN_X + 4, bY + 2, (SCREEN_W - 12) * barProgress, 14, 3); ctx.fill();
        ctx.font = '9px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff';
        ctx.fillText(`building… ${Math.floor(barProgress * 100)}%`, cx, bY + 13);
      } else {
        // game screenshot — simplified NBA court
        ctx.fillStyle = '#1a3a1a'; ctx.fillRect(SCREEN_X, CY, SCREEN_W, CH);
        // court floor
        const courtY = CY + CH * 0.45;
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(SCREEN_X, courtY, SCREEN_W, CH - CH * 0.45);
        // court lines
        ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(SCREEN_X, courtY); ctx.lineTo(SCREEN_X + SCREEN_W, courtY); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(cx, courtY, 28, 12, 0, 0, Math.PI * 2); ctx.stroke();
        // hoop
        ctx.strokeStyle = '#e05500'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(SCREEN_X + SCREEN_W * 0.15, courtY - 10, 8, 0, Math.PI * 2); ctx.stroke();
        // crowd silhouette
        ctx.fillStyle = 'rgba(40,40,80,0.8)';
        for (let ci = 0; ci < 14; ci++) {
          ctx.beginPath(); ctx.arc(SCREEN_X + 12 + ci * (SCREEN_W / 14), CY + 16 + Math.sin(ci) * 5, 7, 0, Math.PI); ctx.fill();
        }
        // player sprite (simple)
        ctx.fillStyle = '#1a3a8a'; ctx.fillRect(cx - 8, courtY - 28, 10, 20);
        ctx.fillStyle = '#f5c5a3'; ctx.beginPath(); ctx.arc(cx - 3, courtY - 32, 6, 0, Math.PI * 2); ctx.fill();
        // ball
        ctx.fillStyle = '#f87c2a'; ctx.beginPath(); ctx.arc(cx + 20, courtY - 16, 5, 0, Math.PI * 2); ctx.fill();
        // HUD overlay
        ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(SCREEN_X, CY, SCREEN_W, 18);
        ctx.font = '9px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff';
        ctx.fillText('NBA 2K  ·  Q3  12:44  |  LAL 67 - 71 BOS', cx, CY + 12);
        // green glow "LIVE"
        ctx.fillStyle = '#28c840'; ctx.beginPath(); ctx.arc(SCREEN_X + 12, CY + 9, 4, 0, Math.PI * 2); ctx.fill();
        ctx.font = '8px monospace'; ctx.textAlign = 'left'; ctx.fillStyle = '#28c840';
        ctx.fillText('LIVE', SCREEN_X + 18, CY + 12);
      }
    }

    let fired = false;
    const start = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const t = Math.min((now - start) / DURATION, 1);
      if (t >= MID && !fired) { fired = true; onMid(); }

      ctx.clearRect(0, 0, W, H);

      const bgA = t < 0.06 ? t / 0.06 : t > 0.9 ? 1 - remap(t, 0.9, 1) : 1;
      // dark office blue-grey
      const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
      bgGrad.addColorStop(0, `rgba(8,10,18,${bgA * 0.97})`);
      bgGrad.addColorStop(1, `rgba(12,14,22,${bgA * 0.97})`);
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, W, H);

      // floor
      ctx.save(); ctx.globalAlpha = bgA * 0.5;
      ctx.fillStyle = '#0d0f18'; ctx.fillRect(0, DESK_Y, W, H - DESK_Y);
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, DESK_Y); ctx.lineTo(W, DESK_Y); ctx.stroke();
      ctx.restore();

      // build progress (0.06 → MID)
      const buildProg = clamp(remap(t, 0.06, MID), 0, 1);
      const shipped = t >= MID;

      // big central screen
      ctx.save(); ctx.globalAlpha = clamp(remap(t, 0.04, 0.14), 0, 1) * bgA;
      drawBigScreen(buildProg, shipped);
      ctx.restore();

      // screen title
      if (t > 0.04) {
        ctx.save(); ctx.globalAlpha = clamp(remap(t, 0.04, 0.14), 0, 1) * bgA;
        ctx.font = `bold ${Math.floor(Math.min(W * 0.018, 13))}px monospace`;
        ctx.textAlign = 'center'; ctx.fillStyle = '#569CD6';
        ctx.fillText('visual-concepts / nba2k-engine', cx, SCREEN_Y - 8);
        ctx.restore();
      }

      // ── SHIPPED banner (MID → MID+0.4) ──
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

      // ── PR / notification bubbles flying across ──
      for (const b of BUBBLES) {
        if (t < b.t0 || t > b.t1 + 0.08) continue;
        const bt = clamp(remap(t, b.t0, b.t1), 0, 1);
        const bAlpha = t > b.t1 ? 1 - remap(t, b.t1, b.t1 + 0.08) : bt < 0.12 ? bt / 0.12 : 1;
        const bx = b.fromX + (b.toX - b.fromX) * easeInOut(bt);
        const arc = -Math.sin(bt * Math.PI) * 28;
        const by2 = b.y + arc;
        ctx.save(); ctx.globalAlpha = bAlpha * bgA;
        // bubble bg
        const tw = ctx.measureText(b.text).width + 16;
        ctx.fillStyle = '#1a1f2e';
        ctx.beginPath(); ctx.roundRect(bx - tw / 2, by2 - 10, tw, 18, 9); ctx.fill();
        ctx.strokeStyle = b.color; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect(bx - tw / 2, by2 - 10, tw, 18, 9); ctx.stroke();
        ctx.font = '10px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = b.color;
        ctx.fillText(b.text, bx, by2 + 3);
        ctx.restore();
      }

      // ── Dev stations ──
      ctx.save(); ctx.globalAlpha = bgA;
      STATIONS.forEach((st, i) => {
        const devIn  = easeOut(clamp(remap(t, i * 0.04, i * 0.04 + 0.14), 0, 1));
        const devOut = clamp(remap(t, 0.88, 0.98), 0, 1);
        const devA   = devOut > 0 ? 1 - devOut : devIn;

        // desk + screen
        ctx.save(); ctx.globalAlpha = devA;
        drawDesk(st.x, st.color, () => {
          // mini code/activity on each monitor
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
          // active line cursor blink
          if (Math.sin(t * 12 + i * 2) > 0) {
            const lw2 = (0.3 + Math.abs(Math.sin(lineCount * 1.7 + i)) * 0.4) * (mW2 - 8);
            ctx.fillStyle = st.color;
            ctx.fillRect(mX2 + 4 + lw2, mY2 + 4 + lineCount * 10, 4, 8);
          }
        });
        ctx.restore();

        // dev avatar at station
        const isUser = i === USER_IDX;
        const celebrate = t > MID + 0.08;
        ctx.save(); ctx.globalAlpha = devA;
        drawDev(st.x, DESK_Y, t * (4 + i * 0.5), buildProg, celebrate, isUser);
        ctx.restore();

        // station label + role badge
        ctx.save(); ctx.globalAlpha = devA * 0.7;
        ctx.font = `${Math.floor(Math.min(W * 0.016, 11))}px monospace`;
        ctx.textAlign = 'center'; ctx.fillStyle = st.color;
        ctx.fillText(isUser ? `[ ${st.label} — you ]` : st.label, st.x, DESK_Y + 14);
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

// ─────────────────────────────────────────────────────────────────
// TECHNICAL C — SSH terminal connection
// ─────────────────────────────────────────────────────────────────
function SSHEffect({ onMid, onDone }: { onMid: () => void; onDone: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width  = window.innerWidth;
    const H = canvas.height = window.innerHeight;

    const CMDS = [
      { t: 0.06, prompt: '~  $', text: ' ssh dhrumil@portfolio.dev', color: '#fff' },
      { t: 0.16, prompt: '',     text: 'The authenticity of host \'portfolio.dev\' can\'t be established.', color: '#aaa' },
      { t: 0.22, prompt: '',     text: 'RSA key fingerprint is SHA256:dS3kp9Xq2mR...', color: '#888' },
      { t: 0.27, prompt: '',     text: 'Are you sure you want to continue? (yes/no): yes', color: '#aaa' },
      { t: 0.34, prompt: '',     text: 'Warning: Permanently added \'portfolio.dev\' to known hosts.', color: '#888' },
      { t: 0.39, prompt: '',     text: 'dhrumil@portfolio.dev\'s password: ••••••••••', color: '#aaa' },
      { t: MID,  prompt: '',     text: 'Last login: Today  — personality switch requested', color: '#666' },
      { t: 0.54, prompt: '',     text: '──────────────────────────────────────────', color: '#1a3a2a' },
      { t: 0.57, prompt: '',     text: '  Welcome to Portfolio v3.0  [ TECHNICAL ]', color: '#00ff88' },
      { t: 0.62, prompt: '',     text: '  Stack: React · Next.js · TypeScript · Go', color: '#00cc66' },
      { t: 0.67, prompt: '',     text: '──────────────────────────────────────────', color: '#1a3a2a' },
      { t: 0.72, prompt: 'dhrumil@portfolio  ~  $', text: ' _', color: '#00ff88' },
    ];

    const GROUND = H * 0.82;
    let fired = false;
    const start = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const t = Math.min((now - start) / DURATION, 1);
      if (t >= MID && !fired) { fired = true; onMid(); }

      ctx.clearRect(0, 0, W, H);

      const bgA = t < 0.05 ? t / 0.05 : t > 0.9 ? 1 - remap(t, 0.9, 1) : 1;
      ctx.fillStyle = `rgba(0,4,2,${bgA * 0.95})`; ctx.fillRect(0, 0, W, H);

      // terminal window
      const winW = Math.min(W * 0.86, 660);
      const winX = (W - winW) / 2;
      const winY = H * 0.09;
      const winH = H * 0.68;

      ctx.save(); ctx.globalAlpha = bgA;
      // window bg
      ctx.fillStyle = '#0a100e';
      ctx.beginPath(); ctx.roundRect(winX, winY, winW, winH, 8); ctx.fill();
      ctx.strokeStyle = '#00ff88'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(winX, winY, winW, winH, 8); ctx.stroke();

      // title bar
      ctx.fillStyle = '#0d1f16';
      ctx.beginPath(); ctx.roundRect(winX, winY, winW, 30, [8, 8, 0, 0]); ctx.fill();
      // traffic lights
      [['#ff5f57',10], ['#ffbd2e',26], ['#28c840',42]].forEach(([c, x]) => {
        ctx.fillStyle = c as string;
        ctx.beginPath(); ctx.arc(winX + (x as number), winY + 15, 6, 0, Math.PI * 2); ctx.fill();
      });
      ctx.font = '12px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#00aa55';
      ctx.fillText('dhrumil@portfolio — ssh', winX + winW / 2, winY + 19);
      ctx.restore();

      // terminal lines
      const FS = 13; const lineH = FS + 7;
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

      // blinking cursor on last line
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

      // avatar walks in from left immediately, types throughout, walks out at end
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

function TechnicalEffect({ onMid, onDone }: { onMid: () => void; onDone: () => void }) {
  const pick = useRef(Math.floor(Math.random() * 3)).current;
  if (pick === 0) return <GlitchEffect      onMid={onMid} onDone={onDone} />;
  if (pick === 1) return <TeamBuildEffect   onMid={onMid} onDone={onDone} />;
  return                  <SSHEffect         onMid={onMid} onDone={onDone} />;
}

// ─────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────
export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const [effect, setEffect] = useState<PersonalityType | null>(null);
  const commitRef = useRef<(() => void) | null>(null);

  const trigger = useCallback((type: PersonalityType, commit: () => void) => {
    commitRef.current = commit;
    setEffect(type);
  }, []);

  const handleMid  = useCallback(() => { commitRef.current?.(); commitRef.current = null; }, []);
  const handleDone = useCallback(() => setEffect(null), []);

  return (
    <Ctx.Provider value={{ trigger, isActive: !!effect }}>
      {children}
      {effect === 'professional' && <ProfessionalEffect onMid={handleMid} onDone={handleDone} />}
      {effect === 'gamer'        && <GamerEffect     onMid={handleMid} onDone={handleDone} />}
      {effect === 'technical'    && <TechnicalEffect onMid={handleMid} onDone={handleDone} />}
    </Ctx.Provider>
  );
}
