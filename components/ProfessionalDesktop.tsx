import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useMenu } from '@/components/MenuContext';
import { useSnakeGame } from '@/hooks/useSnakeGame';
import { owner } from '@/data/owner';
import styles from '@/styles/ProfessionalDesktop.module.css';

// ── Outliner actors ────────────────────────────────────────────────────────────

const ACTORS = [
  { id: 'vsport',    label: 'VSPortfolio',           icon: '🎮', folder: false },
  { id: 'page-home', label: '  HomeLevel',           icon: '🗺', folder: false },
  { id: 'page-work', label: '  WorkLevel',           icon: '🗺', folder: false },
  { id: 'page-gh',   label: '  GitHubLevel',         icon: '🗺', folder: false },
  { id: 'page-contact','label': '  ContactLevel',    icon: '🗺', folder: false },
  { id: 'snake',     label: '  BP_SnakePawn',        icon: '🐍', folder: false },
  { id: 'playerctrl','label': '  BP_PlayerController',icon: '🎮', folder: false },
  { id: 'skyatm',    label: 'SkyAtmosphere',         icon: '🌌', folder: false },
  { id: 'dirlght',   label: 'DirectionalLight',      icon: '💡', folder: false },
  { id: 'postfx',    label: 'PostProcessVolume',     icon: '✨', folder: false },
  { id: 'navmesh',   label: 'NavMeshBoundsVolume',   icon: '📐', folder: false },
];

// ── Details panel ──────────────────────────────────────────────────────────────

type Section = { label: string; open: boolean; fields: { k: string; v: string; color?: string }[] };

const DETAILS: Record<string, Section[]> = {
  vsport: [
    { label: 'Transform', open: true, fields: [
      { k: 'Location', v: '(X=0, Y=0, Z=0)' },
      { k: 'Rotation', v: '(P=0, Y=0, R=0)' },
      { k: 'Scale',    v: '(X=1, Y=1, Z=1)' },
    ]},
    { label: 'Portfolio Settings', open: true, fields: [
      { k: 'Owner Name', v: owner.name,             color: '#e8860c' },
      { k: 'Role',       v: owner.title                              },
      { k: 'Company',    v: owner.company                            },
      { k: 'Stack',      v: owner.stack                              },
      { k: 'Shipped',    v: owner.shipped.join(', ')                 },
      { k: 'Experience', v: owner.yearsExperience + '+ yrs'         },
    ]},
    { label: 'Rendering', open: false, fields: [
      { k: 'Lumen GI',        v: 'Enabled'  },
      { k: 'Nanite',          v: 'Enabled'  },
      { k: 'Ray Tracing',     v: 'Disabled' },
      { k: 'Shadow Quality',  v: 'Cinematic'},
    ]},
  ],
  snake: [
    { label: 'Transform', open: true, fields: [
      { k: 'Location', v: '(X=320, Y=-180, Z=0)' },
      { k: 'Rotation', v: '(P=0, Y=0, R=0)' },
    ]},
    { label: 'Snake Pawn', open: true, fields: [
      { k: 'Grid Size', v: '20 × 15' },
      { k: 'Speed',     v: '8 tiles/s' },
      { k: 'State',     v: 'ALIVE', color: '#39d353' },
    ]},
  ],
};

const DEFAULT_DETAILS: Section[] = [
  { label: 'Transform', open: true, fields: [
    { k: 'Location', v: '(X=0, Y=0, Z=0)' },
    { k: 'Rotation', v: '(P=0, Y=0, R=0)' },
    { k: 'Scale',    v: '(X=1, Y=1, Z=1)' },
  ]},
];

// ── Output log lines ───────────────────────────────────────────────────────────

const BOOT_LOGS = [
  { type: 'info', msg: 'LogInit: Unreal Engine 5 initialized' },
  { type: 'info', msg: 'LogLoad: Loading map /Game/Levels/Portfolio' },
  { type: 'info', msg: 'LogBlueprint: Compiling BP_SnakePawn...' },
  { type: 'info', msg: 'LogBlueprint: BP_SnakePawn compiled in 0.012s' },
  { type: 'info', msg: 'LogLoad: All packages loaded' },
  { type: 'warn', msg: 'LogRenderer: Lumen scene update 2.1ms' },
  { type: 'info', msg: 'LogPortfolio: VSPortfolio.BeginPlay() called' },
  { type: 'info', msg: 'LogPortfolio: 5 pages registered' },
  { type: 'info', msg: 'LogNet: Session ready — visitors accepted' },
];

const TICK_LOGS = [
  { type: 'info', msg: 'LogTick: Frame 16.6ms — GPU 12.4ms CPU 4.2ms' },
  { type: 'info', msg: 'LogPortfolio: Visitor interaction recorded' },
  { type: 'warn', msg: 'LogGC: Incremental GC 0.3ms' },
  { type: 'info', msg: 'LogNav: NavMesh rebuild skipped (no change)' },
  { type: 'info', msg: 'LogBlueprint: BP_SnakePawn.Tick() — food at (14,7)' },
  { type: 'err',  msg: 'LogAsset: [Recoverable] Texture ref null — using fallback' },
  { type: 'info', msg: 'LogRHI: Nanite streaming: 0 clusters updated' },
  { type: 'warn', msg: 'LogInput: Key press consumed by BP_SnakePawn' },
  { type: 'info', msg: 'LogPortfolio: Theme "Unreal Engine" active' },
];

// ── Animated viewport ──────────────────────────────────────────────────────────

function Viewport({ simulating }: { simulating: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const t = useRef(0);

  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d'); if (!ctx) return;
    let raf: number;

    const draw = (ts: number) => {
      t.current = ts / 1000;
      const T = t.current;
      const W = c.width, H = c.height;

      // Sky gradient
      const sky = ctx.createLinearGradient(0, 0, 0, H * 0.65);
      sky.addColorStop(0, '#0a0610');
      sky.addColorStop(1, '#1a0e2e');
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

      // Stars
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      const starSeeds = [17,31,53,79,101,127,149,163,181,199,211,229,241,251,257];
      starSeeds.forEach((s, i) => {
        const sx = (s * 37 + i * 51) % W;
        const sy = (s * 13 + i * 23) % (H * 0.55);
        const pulse = 0.4 + 0.6 * Math.abs(Math.sin(T * 0.7 + i));
        ctx.globalAlpha = pulse;
        ctx.fillRect(sx, sy, 1.5, 1.5);
      });
      ctx.globalAlpha = 1;

      // Ground plane perspective
      const horizon = H * 0.58;
      const ground = ctx.createLinearGradient(0, horizon, 0, H);
      ground.addColorStop(0, '#0d0d0d');
      ground.addColorStop(1, '#111');
      ctx.fillStyle = ground; ctx.fillRect(0, horizon, W, H - horizon);

      // Grid on ground (perspective)
      ctx.strokeStyle = 'rgba(232,134,12,0.15)'; ctx.lineWidth = 0.5;
      const vp = { x: W / 2, y: horizon };
      const scrollZ = simulating ? T * 30 : 0;
      for (let row = 0; row < 14; row++) {
        const t0 = row / 14, t1 = (row + 1) / 14;
        const y0 = horizon + (H - horizon) * t0 * t0;
        const y1 = horizon + (H - horizon) * t1 * t1;
        const xScale0 = (y0 - horizon) / (H - horizon);
        const xScale1 = (y1 - horizon) / (H - horizon);
        ctx.beginPath(); ctx.moveTo(0, y0); ctx.lineTo(W, y0); ctx.stroke();
        for (let col = -8; col <= 8; col++) {
          const x0 = vp.x + col * 60 * xScale0;
          const x1 = vp.x + col * 60 * xScale1;
          ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
        }
      }

      // Floating VSCode "level" — large panel
      const panelW = 240, panelH = 150;
      const px = W / 2 - panelW / 2;
      const py = horizon - panelH - 20 + Math.sin(T * 0.5) * 5;

      // Glow
      ctx.shadowColor = '#e8860c'; ctx.shadowBlur = 30;
      ctx.strokeStyle = '#e8860c'; ctx.lineWidth = 1;
      ctx.strokeRect(px, py, panelW, panelH);
      ctx.shadowBlur = 0;

      // Panel body
      ctx.fillStyle = '#1a1a1a'; ctx.fillRect(px, py, panelW, panelH);

      // Titlebar
      ctx.fillStyle = '#2d2d2d'; ctx.fillRect(px, py, panelW, 20);
      ['#e05252','#e0b052','#52a852'].forEach((col, i) => {
        ctx.fillStyle = col; ctx.beginPath();
        ctx.arc(px + 10 + i * 15, py + 10, 5, 0, Math.PI * 2); ctx.fill();
      });
      ctx.fillStyle = '#aaa'; ctx.font = '9px monospace';
      ctx.fillText('portfolio.uproject — Unreal Editor', px + 55, py + 14);

      // Code lines inside
      const codeLines = [
        { c:'#569cd6', t:'UCLASS()' },
        { c:'#4ec9b0', t:'class PORTFOLIO_API APortfolio : public AActor {' },
        { c:'#d4d4d4', t:'  UPROPERTY(EditAnywhere)' },
        { c:'#9cdcfe', t:'  FString OwnerName = "' + owner.name + '";' },
        { c:'#d4d4d4', t:'  UPROPERTY(EditAnywhere)' },
        { c:'#9cdcfe', t:'  FString Company = "' + owner.company + '";' },
        { c:'#6a9955', t:'  // Shipped: ' + owner.shipped.join(', ') },
        { c:'#4ec9b0', t:'  virtual void BeginPlay() override;' },
        { c:'#d4d4d4', t:'};' },
      ];
      codeLines.forEach((l, i) => {
        ctx.fillStyle = l.c; ctx.font = '7px monospace';
        ctx.fillText(l.t.substring(0, 42), px + 6, py + 30 + i * 12);
      });
      // cursor blink
      if (Math.floor(T * 2) % 2 === 0) {
        ctx.fillStyle = '#ffffff99';
        ctx.fillRect(px + 6, py + 30 + 8 * 12 - 9, 5, 10);
      }

      // Orbiting blueprint nodes
      const orbit = 140;
      [
        { label: 'BeginPlay', angle: -0.5, col: '#e8860c' },
        { label: 'Tick',      angle: 1.5,  col: '#4ec9b0' },
        { label: 'EndPlay',   angle: 3.2,  col: '#c586c0' },
      ].forEach(({ label, angle, col }) => {
        const a = angle + (simulating ? T * 0.35 : 0);
        const nx = W / 2 + Math.cos(a) * orbit;
        const ny = horizon - 50 + Math.sin(a) * (orbit * 0.3) + Math.sin(T * 0.5) * 5;

        ctx.strokeStyle = col + '44'; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(W / 2, horizon - 50); ctx.lineTo(nx, ny); ctx.stroke();

        const tw = ctx.measureText(label).width + 16;
        ctx.fillStyle = '#1e1e1e'; ctx.strokeStyle = col; ctx.lineWidth = 1;
        roundRect(ctx, nx - tw / 2, ny - 11, tw, 22, 4);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = col; ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center'; ctx.fillText(label, nx, ny + 4); ctx.textAlign = 'left';
      });

      // Shadow below panel
      const shadowGrad = ctx.createRadialGradient(W/2, horizon + 2, 0, W/2, horizon + 2, 120);
      shadowGrad.addColorStop(0, 'rgba(232,134,12,0.3)');
      shadowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = shadowGrad; ctx.fillRect(W/2 - 120, horizon - 4, 240, 24);

      // HUD overlay
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(8, 8, 160, 18);
      ctx.fillStyle = '#e8860c'; ctx.font = '9px monospace';
      ctx.fillText(`Portfolio Level  |  Lit  |  ${simulating ? 'SIMULATING' : 'EDITOR'}`, 12, 21);

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [simulating]);

  return <canvas ref={ref} className={styles.viewport} width={760} height={360} />;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

// ── Content Browser items ──────────────────────────────────────────────────────

const CONTENT_ITEMS = [
  { icon: '🗺', label: 'L_Portfolio',   type: 'Level'     },
  { icon: '🎮', label: 'BP_Portfolio',  type: 'Blueprint' },
  { icon: '🐍', label: 'BP_SnakePawn',  type: 'Blueprint' },
  { icon: '🎨', label: 'M_VSCodeTheme', type: 'Material'  },
  { icon: '🖼', label: 'T_Avatar',      type: 'Texture2D' },
  { icon: '⚡', label: 'GE_Navbar',     type: 'GameEffect' },
  { icon: '🔊', label: 'SA_KeyClick',   type: 'Sound'     },
];

// ── Main ──────────────────────────────────────────────────────────────────────

const SNAKE_COLORS = { bg: '#0d0d0d', grid: '#181818', snake: '#e8860c', head: '#ffa030', food: '#f44747' };
const COLS = 18; const ROWS = 12; const CELL = 16;

export function ProfessionalDesktop() {
  const { setMiniGameOpen } = useMenu();
  const router = useRouter();
  const [simulating, setSimulating] = useState(false);
  const [selectedActor, setSelectedActor] = useState('vsport');
  const [logs, setLogs] = useState(BOOT_LOGS);
  const [logFilter, setLogFilter] = useState<'all'|'warn'|'err'>('all');
  const [activeView, setActiveView]   = useState<'viewport'|'game'>('viewport');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const { canvasRef, score, gameOver, restart } = useSnakeGame({
    active: activeView === 'game',
    colors: SNAKE_COLORS, cols: COLS, rows: ROWS, cell: CELL,
  });

  // Tick logs when simulating
  useEffect(() => {
    if (!simulating) return;
    const id = setInterval(() => {
      const entry = TICK_LOGS[Math.floor(Math.random() * TICK_LOGS.length)];
      setLogs(prev => [...prev.slice(-80), entry]);
    }, 1800);
    return () => clearInterval(id);
  }, [simulating]);

  useEffect(() => {
    setLogs(prev => [...prev, { type: 'info', msg: `LogPortfolio: Loaded /Game/Levels${router.pathname}` }]);
  }, [router.pathname]);

  const logRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  const handlePlay = useCallback(() => {
    setSimulating(s => {
      const next = !s;
      setLogs(prev => [...prev, next
        ? { type: 'info', msg: 'LogPlay: Simulate In Editor started' }
        : { type: 'warn', msg: 'LogPlay: Simulate In Editor ended' }
      ]);
      return next;
    });
  }, []);

  const sections = DETAILS[selectedActor] ?? DEFAULT_DETAILS;
  const filteredLogs = logs.filter(l => logFilter === 'all' || l.type === logFilter);

  const toggleSection = (label: string) =>
    setOpenSections(prev => ({ ...prev, [label]: !prev[label] }));

  return (
    <div className={styles.ue}>

      {/* ── Menu bar ── */}
      <div className={styles.ueMenu}>
        <span className={styles.ueLogo}>⬡</span>
        {['File','Edit','Window','Tools','Build','Select','Actor','Help'].map(m => (
          <span key={m} className={styles.ueMenuItem}>{m}</span>
        ))}
        <div className={styles.ueSpacer} />
        <button className={styles.ueBackBtn} onClick={() => setMiniGameOpen(false)}>
          ↩ Return to VSCode
        </button>
      </div>

      {/* ── Toolbar ── */}
      <div className={styles.ueToolbar}>
        <div className={styles.ueToolLeft}>
          {['Save','Content','Marketplace','Settings'].map(t => (
            <button key={t} className={styles.ueTool}>{t}</button>
          ))}
        </div>
        <div className={styles.uePlayGroup}>
          <button
            className={`${styles.uePlayBtn} ${simulating ? styles.uePlayActive : ''}`}
            onClick={handlePlay}
            title={simulating ? 'Stop Simulate' : 'Simulate In Editor'}
          >
            {simulating ? '⏹' : '▷'} {simulating ? 'Stop' : 'Simulate'}
          </button>
          <button className={styles.uePlayBtn} onClick={() => setMiniGameOpen(false)}>
            ▶ Play (Open Portfolio)
          </button>
        </div>
        <div className={styles.ueToolRight}>
          <span className={styles.ueStat}>Lumen ✓</span>
          <span className={styles.ueStat}>Nanite ✓</span>
          <span className={styles.ueStat}>{simulating ? '🟠 SIE' : '🟢 Editor'}</span>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className={styles.ueLayout}>

        {/* LEFT: Viewport + Content Browser */}
        <div className={styles.ueCenter}>
          {/* Viewport tabs */}
          <div className={styles.ueViewTabs}>
            <button
              className={`${styles.ueViewTab} ${activeView === 'viewport' ? styles.ueViewTabActive : ''}`}
              onClick={() => setActiveView('viewport')}
            >Perspective</button>
            <button
              className={`${styles.ueViewTab} ${activeView === 'game' ? styles.ueViewTabActive : ''}`}
              onClick={() => setActiveView('game')}
            >🐍 BP_SnakePawn</button>
            <div className={styles.ueSpacer} />
            <span className={styles.ueGizmo}>Lit ▾</span>
            <span className={styles.ueGizmo}>Show ▾</span>
          </div>

          <div className={styles.ueViewport}>
            {activeView === 'viewport' ? (
              <Viewport simulating={simulating} />
            ) : (
              <div className={styles.ueGame}>
                <div className={styles.ueGameHud}>
                  <span>BP_SnakePawn — Score: <b>{score}</b></span>
                  {gameOver && <button className={styles.ueRecompile} onClick={restart}>↻ Hot Reload</button>}
                </div>
                <canvas ref={canvasRef} width={COLS * CELL} height={ROWS * CELL} className={styles.ueSnakeCanvas} />
                {gameOver && (
                  <div className={styles.ueCrash}>
                    <div className={styles.ueCrashTitle}>Unreal Engine has crashed</div>
                    <div className={styles.ueCrashSub}>Fatal error: Access violation — reading address 0x00000000</div>
                    <div className={styles.ueCrashSub}>USnakePawn::Tick() [SnakePawn.cpp:84]</div>
                    <button className={styles.ueRecompileBtn} onClick={restart}>Submit and Restart</button>
                  </div>
                )}
                <div className={styles.ueGameHint}>Arrow / WASD · Click game view first</div>
              </div>
            )}
          </div>

          {/* Output Log */}
          <div className={styles.ueOutputLog}>
            <div className={styles.ueOutputHeader}>
              <span className={styles.uePanelTitle}>Output Log</span>
              <div className={styles.ueLogFilters}>
                {(['all','warn','err'] as const).map(f => (
                  <button
                    key={f}
                    className={`${styles.ueLogFilter} ${logFilter === f ? styles.ueLogFilterActive : ''}`}
                    onClick={() => setLogFilter(f)}
                  >
                    {f === 'all' ? 'All' : f === 'warn' ? 'Warning' : 'Error'}
                  </button>
                ))}
                <button className={styles.ueLogClear} onClick={() => setLogs([])}>Clear</button>
              </div>
            </div>
            <div className={styles.ueLogBody} ref={logRef}>
              {filteredLogs.map((l, i) => (
                <div key={i} className={`${styles.ueLogLine} ${styles['uelog_' + l.type]}`}>
                  <span className={styles.ueLogIcon}>
                    {l.type === 'err' ? '⛔' : l.type === 'warn' ? '⚠️' : ''}
                  </span>
                  <span>{l.msg}</span>
                </div>
              ))}
              {filteredLogs.length === 0 && <div className={styles.ueLogEmpty}>No entries.</div>}
            </div>
          </div>

          {/* Content Browser */}
          <div className={styles.ueContentBrowser}>
            <div className={styles.ueOutputHeader}>
              <span className={styles.uePanelTitle}>Content Browser</span>
              <span className={styles.ueCbPath}>Content / Portfolio /</span>
            </div>
            <div className={styles.ueCbGrid}>
              {CONTENT_ITEMS.map(item => (
                <div key={item.label} className={styles.ueCbItem}>
                  <div className={styles.ueCbIcon}>{item.icon}</div>
                  <div className={styles.ueCbLabel}>{item.label}</div>
                  <div className={styles.ueCbType}>{item.type}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Outliner + Details */}
        <div className={styles.ueRight}>

          {/* Outliner */}
          <div className={styles.ueOutliner}>
            <div className={styles.ueOutputHeader}>
              <span className={styles.uePanelTitle}>Outliner</span>
              <span className={styles.ueCbPath}>Search actors...</span>
            </div>
            <div className={styles.ueOutlinerList}>
              {ACTORS.map(a => (
                <button
                  key={a.id}
                  className={`${styles.ueActor} ${selectedActor === a.id ? styles.ueActorSelected : ''}`}
                  onClick={() => setSelectedActor(a.id)}
                >
                  <span className={styles.ueActorIcon}>{a.icon}</span>
                  <span className={styles.ueActorLabel}>{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className={styles.ueDetails}>
            <div className={styles.ueOutputHeader}>
              <span className={styles.uePanelTitle}>Details</span>
            </div>
            <div className={styles.ueDetailsName}>
              {ACTORS.find(a => a.id === selectedActor)?.icon}{' '}
              <b>{ACTORS.find(a => a.id === selectedActor)?.label.trim()}</b>
            </div>
            <div className={styles.ueDetailsSections}>
              {sections.map((sec, si) => {
                const key = sec.label + si;
                const isOpen = openSections[key] !== false && (openSections[key] === true || sec.open);
                return (
                  <div key={key} className={styles.ueSection}>
                    <button className={styles.ueSectionHeader} onClick={() => toggleSection(key)}>
                      <span>{isOpen ? '▾' : '▸'}</span>
                      <span>{sec.label}</span>
                    </button>
                    {isOpen && (
                      <div className={styles.ueSectionBody}>
                        {sec.fields.map(f => (
                          <div key={f.k} className={styles.ueField}>
                            <span className={styles.ueFieldKey}>{f.k}</span>
                            <span className={styles.ueFieldVal} style={f.color ? { color: f.color } : undefined}>{f.v}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {selectedActor === 'vsport' && (
              <button className={styles.ueOpenPortfolio} onClick={() => setMiniGameOpen(false)}>
                ▶ Open Portfolio Level
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
