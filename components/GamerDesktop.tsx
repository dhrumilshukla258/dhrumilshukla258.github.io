import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useMenu } from '@/components/MenuContext';
import { useSnakeGame } from '@/hooks/useSnakeGame';
import styles from '@/styles/GamerDesktop.module.css';

// ── Map constants ──────────────────────────────────────────────────────────────

const T = 24; // tile size px

// Terrain codes: W=water, G=grass, D=darkgrass, P=path, M=mountain, S=sand
const MAP_W = 36;
const MAP_H = 22;
type Tile = 'W'|'G'|'D'|'P'|'M'|'S'|'B'; // B=building

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const RAW_MAP: string[] = [
  'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
  'WWWMMMMWWWWWGGGGGGGGGGWWWWWMMMMMWWWW',
  'WWWMMMMWWWWWGGBBBBBBGGWWWWWMMMMMWWWW',
  'WWWMMMMWWWWWGGBBBBBBGGWWWWWMMMMMWWWW',
  'WWWWWWWWWWWWGGGGPPGGGGWWWWWWWWWWWWWW',
  'WWWWWWGGGGGGGGGGPPGGGGGGGGGGWWWWWWWW',
  'WWWWWWGGBBBBGGGGPPGGGGBBBBGGWWWWWWWW',
  'WWWWWWGGBBBBGGGGPPGGGGBBBBGGWWWWWWWW',
  'WWWWWWGGGGGGGGGGPPGGGGGGGGGGWWWWWWWW',
  'WWWWWWWWWWGGGGGGPPGGGGGGWWWWWWWWWWWW',
  'WWWWWWWWWWGGGGBBBBBBBBGGWWWWWWWWWWWW',
  'WWWWWWWWWWGGGGBBBBBBBBGGWWWWWWWWWWWW',
  'WWWWWWWWWWGGGGGGPPGGGGGGWWWWWWWWWWWW',
  'WWWWWWWWWWGGGGGGPPGGGGGGWWWWWWWWWWWW',
  'WWWGGGGGGGGGGGGGPPGGGGGGGGGGGWWWWWWWW',
  'WWWGGGBBBBGGGGGPPGGGGGGBBBBGWWWWWWWW',
  'WWWGGGBBBBGGGGGPPGGGGGGBBBBGWWWWWWWW',
  'WWWGGGGGGGGGGGGGPPGGGGGGGGGGGWWWWWWWW',
  'WWWWWWWWWWWWWWWWPPWWWWWWWWWWWWWWWWWW',
  'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
  'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
  'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
];

// Zones: name, tile-coordinates (top-left of building), nav path, icon
const ZONES = [
  { id:'work',     label:'WORK\nCASTLE',    col:12, row:1,  path:'/work',     icon:'🏰', color:'#c0392b' },
  { id:'projects', label:'PROJECTS\nTOWER', col:22, row:1,  path:'/projects', icon:'🗼', color:'#8e44ad' },
  { id:'skills',   label:'SKILLS\nFOREST',  col:6,  row:6,  path:'/about',    icon:'🌲', color:'#27ae60' },
  { id:'github',   label:'GITHUB\nDUNGEON', col:22, row:6,  path:'/github',   icon:'⚔️', color:'#2980b9' },
  { id:'home',     label:'HOME\nTOWN',      col:12, row:10, path:'/',         icon:'🏘️', color:'#d4a017' },
  { id:'contact',  label:'CONTACT\nSHRINE', col:6,  row:15, path:'/contact',  icon:'🛕', color:'#e67e22' },
  { id:'arcade',   label:'ARCADE\n🐍SNAKE', col:22, row:15, path:null,        icon:'🕹️', color:'#00cc66' },
];

// ── Canvas map renderer ────────────────────────────────────────────────────────

const TILE_COLORS: Record<string, string> = {
  W: '#1a3a6c',
  G: '#2d5a1e',
  D: '#1e3d12',
  P: '#6b4f2a',
  M: '#3a3340',
  S: '#8b7355',
  B: '#4a3828',
};

function drawMap(ctx: CanvasRenderingContext2D, time: number) {
  // Draw all tiles
  for (let row = 0; row < MAP_H; row++) {
    for (let col = 0; col < MAP_W; col++) {
      const ch = (RAW_MAP[row]?.[col] ?? 'W') as Tile;
      if (ch === 'W') {
        // animated water
        const wave = Math.sin(time / 800 + col * 0.4 + row * 0.3) * 0.08;
        const base = [26, 58, 108];
        ctx.fillStyle = `rgb(${Math.round(base[0]*(1+wave))},${Math.round(base[1]*(1+wave))},${Math.round(base[2]*(1+wave))})`;
      } else {
        ctx.fillStyle = TILE_COLORS[ch] ?? '#2d5a1e';
      }
      ctx.fillRect(col * T, row * T, T, T);
    }
  }

  // Subtle grid for non-water tiles
  ctx.strokeStyle = 'rgba(0,0,0,0.12)';
  ctx.lineWidth = 0.5;
  for (let row = 0; row < MAP_H; row++) {
    for (let col = 0; col < MAP_W; col++) {
      const ch = RAW_MAP[row]?.[col] ?? 'W';
      if (ch !== 'W') {
        ctx.strokeRect(col * T, row * T, T, T);
      }
    }
  }

  // Draw zone buildings (2×2 tiles each)
  ZONES.forEach(z => {
    const x = z.col * T;
    const y = z.row * T;
    const bw = T * 2;
    const bh = T * 2;
    // building base
    ctx.fillStyle = z.color + '33';
    ctx.fillRect(x, y, bw, bh);
    // pulsing border
    const pulse = 0.6 + 0.4 * Math.sin(time / 600 + z.col);
    ctx.strokeStyle = z.color;
    ctx.lineWidth = 2;
    ctx.globalAlpha = pulse;
    ctx.strokeRect(x + 1, y + 1, bw - 2, bh - 2);
    ctx.globalAlpha = 1;
    // icon
    ctx.font = `${T - 4}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.fillText(z.icon, x + bw / 2, y + bh / 2);
  });
}

// ── GamerDesktop ───────────────────────────────────────────────────────────────

const SNAKE_COLORS = { bg:'#080810', grid:'#10101a', snake:'#39c95a', head:'#5dde78', food:'#c47829' };

export function GamerDesktop() {
  const router = useRouter();
  const { setMiniGameOpen } = useMenu();
  const mapRef    = useRef<HTMLCanvasElement>(null);
  const frameRef  = useRef<number>(0);
  const [arcadeOpen, setArcadeOpen] = useState(true);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  const { canvasRef: snakeRef, score, highScore, gameOver, restart, W: SW, H: SH } = useSnakeGame({
    active: arcadeOpen, colors: SNAKE_COLORS, cols: 18, rows: 14, cell: 20,
  });

  // animate map
  useEffect(() => {
    const canvas = mapRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let start: number;
    function loop(ts: number) {
      if (!start) start = ts;
      drawMap(ctx!, ts - start);
      frameRef.current = requestAnimationFrame(loop);
    }
    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  const navigate = (path: string | null) => {
    if (!path) { setArcadeOpen(true); return; }
    setMiniGameOpen(false);
    router.push(path);
  };

  return (
    <div className={styles.desktop}>
      {/* Map canvas (left 60%) */}
      <div className={styles.mapSide}>
        <canvas ref={mapRef} width={MAP_W * T} height={MAP_H * T} className={styles.mapCanvas} />

        {/* Zone click overlays */}
        {ZONES.map(z => (
          <button
            key={z.id}
            className={styles.zoneBtn}
            style={{
              left:   z.col * T,
              top:    z.row * T,
              width:  T * 2,
              height: T * 2,
              borderColor: hoveredZone === z.id ? z.color : 'transparent',
            }}
            onClick={() => navigate(z.path)}
            onMouseEnter={() => setHoveredZone(z.id)}
            onMouseLeave={() => setHoveredZone(null)}
          />
        ))}

        {/* Zone tooltip */}
        {hoveredZone && (() => {
          const z = ZONES.find(z => z.id === hoveredZone)!;
          return (
            <div className={styles.tooltip} style={{
              left: z.col * T + T * 2 + 6,
              top:  z.row * T,
              borderColor: z.color,
              color: z.color,
            }}>
              {z.label.split('\n').map((ln, i) => <div key={i}>{ln}</div>)}
              {z.path && <div className={styles.tooltipHint}>→ navigate</div>}
            </div>
          );
        })()}

        {/* HUD overlay */}
        <div className={styles.mapHud}>
          <span className={styles.hudTitle}>🗺 WORLD MAP</span>
          <span className={styles.hudHint}>Click a zone to navigate · Arcade = Snake</span>
        </div>
      </div>

      {/* Snake arcade (right 40%) */}
      <div className={styles.arcadeSide}>
        <div className={styles.arcadeHeader}>
          <span className={styles.arcadeTitle}>🕹️ ARCADE — SNAKE</span>
          <div className={styles.arcadeScores}>
            <span>SCORE <strong>{score}</strong></span>
            <span>BEST <strong>{highScore}</strong></span>
          </div>
        </div>

        <div className={styles.arcadeScreen}>
          <canvas ref={snakeRef} width={SW} height={SH} className={styles.snakeCanvas} />
          {gameOver && (
            <div className={styles.arcadeOver}>
              <p className={styles.arcadeGameOver}>GAME OVER</p>
              <p className={styles.arcadeScoreLine}>SCORE: {score}{score === highScore && score > 0 ? ' ★' : ''}</p>
              <button className={styles.arcadeBtn} onClick={restart}>INSERT COIN</button>
              <button className={styles.arcadeBtnSec} onClick={() => setMiniGameOpen(false)}>EXIT ARCADE</button>
            </div>
          )}
        </div>

        <div className={styles.arcadeControls}>
          <div className={styles.dpadRow}>
            <div className={styles.dpadBtn}>↑</div>
          </div>
          <div className={styles.dpadRow}>
            <div className={styles.dpadBtn}>←</div>
            <div className={styles.dpadCenter} />
            <div className={styles.dpadBtn}>→</div>
          </div>
          <div className={styles.dpadRow}>
            <div className={styles.dpadBtn}>↓</div>
          </div>
          <span className={styles.controlHint}>or WASD · wraps around</span>
        </div>

        <button className={styles.restoreBtn} onClick={() => setMiniGameOpen(false)}>
          ↩ RESTORE PORTFOLIO
        </button>
      </div>
    </div>
  );
}
