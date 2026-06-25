import React, { useEffect, useRef, useState } from 'react';
import { useMenu } from '@/components/MenuContext';
import { useSnakeGame } from '@/hooks/useSnakeGame';
import { owner } from '@/data/owner';
import styles from '@/styles/TechnicalDesktop.module.css';

// ── Animated sparkline ─────────────────────────────────────────────────────────

interface SparklineProps {
  history: number[];
  color:   string;
  height:  number;
  width:   number;
  max:     number;
}
function Sparkline({ history, color, height, width, max }: SparklineProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d'); if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    if (history.length < 2) return;
    const step = width / (history.length - 1);
    ctx.beginPath();
    // fill
    ctx.moveTo(0, height);
    history.forEach((v, i) => { ctx.lineTo(i * step, height - (v / max) * (height - 2)); });
    ctx.lineTo((history.length - 1) * step, height);
    ctx.closePath();
    ctx.fillStyle = color + '22';
    ctx.fill();
    // line
    ctx.beginPath();
    history.forEach((v, i) => {
      const x = i * step, y = height - (v / max) * (height - 2);
      if (i === 0) { ctx.moveTo(x, y); } else { ctx.lineTo(x, y); }
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }, [history, color, height, width, max]);
  return <canvas ref={ref} width={width} height={height} className={styles.sparkCanvas} />;
}

// ── Metrics hook ───────────────────────────────────────────────────────────────

const MAX_HIST = 60;
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

function useMetrics() {
  const [cpu,  setCpu]  = useState<number[]>([23]);
  const [ram,  setRam]  = useState<number[]>([38]);
  const [net,  setNet]  = useState<number[]>([12]);
  const [uptime, setUptime] = useState(0);
  const targetRef = useRef({ cpu: 23, ram: 38, net: 12 });

  useEffect(() => {
    const id = setInterval(() => {
      // slowly drift targets
      targetRef.current.cpu = Math.max(5, Math.min(90, targetRef.current.cpu + (Math.random()-0.5) * 8));
      targetRef.current.ram = Math.max(28, Math.min(55, targetRef.current.ram + (Math.random()-0.5) * 3));
      targetRef.current.net = Math.max(2,  Math.min(80, targetRef.current.net + (Math.random()-0.5) * 15));

      setCpu(h => [...h.slice(-MAX_HIST), Math.round(lerp(h[h.length-1], targetRef.current.cpu, 0.3))]);
      setRam(h => [...h.slice(-MAX_HIST), parseFloat(lerp(h[h.length-1], targetRef.current.ram, 0.15).toFixed(1))]);
      setNet(h => [...h.slice(-MAX_HIST), Math.round(lerp(h[h.length-1], targetRef.current.net, 0.25))]);
      setUptime(u => u + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return { cpu, ram, net, uptime };
}

// ── Services data ──────────────────────────────────────────────────────────────

const SERVICES = [
  { name: 'nginx',          status:'running', pid: 1,     port: '80,443' },
  { name: 'portfolio',      status:'running', pid: 3142,  port: '3000' },
  { name: 'jellyfin',       status:'running', pid: 4821,  port: '8096' },
  { name: 'opencloud',      status:'running', pid: 5310,  port: '8080' },
  { name: 'syncthing',      status:'running', pid: 6001,  port: '8384' },
  { name: 'ollama',         status:'running', pid: 7204,  port: '11434' },
  { name: 'sunshine',       status:'idle',    pid: 8800,  port: '47989' },
  { name: 'ssh',            status:'running', pid: 22,    port: '22' },
];

const CONTAINERS = [
  { name: 'portfolio-app',  image:'node:20-alpine',  cpu:'0.4%', mem:'128MB', status:'Up 3d' },
  { name: 'nginx-proxy',    image:'nginx:alpine',    cpu:'0.1%', mem:'12MB',  status:'Up 14d' },
  { name: 'jellyfin',       image:'jellyfin/jellyfin',cpu:'1.2%',mem:'512MB', status:'Up 7d' },
  { name: 'opencloud',      image:'owncloud/ocis',   cpu:'0.8%', mem:'256MB', status:'Up 2d' },
  { name: 'ollama',         image:'ollama/ollama',   cpu:'0.0%', mem:'2.1GB', status:'Up 1d' },
];

function fmtUptime(s: number) {
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${sec}s`;
  return `${m}m ${sec}s`;
}

// ── TechnicalDesktop ───────────────────────────────────────────────────────────

const SNAKE_COLORS = { bg:'#0d1117', grid:'#161b22', snake:'#58a6ff', head:'#79c0ff', food:'#3fb950' };

export function TechnicalDesktop() {
  const { setMiniGameOpen } = useMenu();
  const { cpu, ram, net, uptime } = useMetrics();
  const { canvasRef, score, highScore, gameOver, restart, W, H } = useSnakeGame({
    active: true, colors: SNAKE_COLORS, cols: 18, rows: 14, cell: 20,
  });

  const cpuNow = cpu[cpu.length - 1] ?? 0;
  const ramNow = ram[ram.length - 1] ?? 0;
  const netNow = net[net.length - 1] ?? 0;

  return (
    <div className={styles.desktop}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <span className={styles.hostname}>{owner.github}@homelab</span>
        <span className={styles.headerSep}>~</span>
        <span className={styles.uptimeLabel}>uptime: <strong>{fmtUptime(uptime)}</strong></span>
        <span className={styles.headerSep}>·</span>
        <span className={styles.osLabel}>Proxmox 8.2 · Docker 26</span>
        <div className={styles.headerSpacer} />
        <button className={styles.restoreBtn} onClick={() => setMiniGameOpen(false)}>
          ↩ exit dashboard
        </button>
      </div>

      {/* ── Main grid ── */}
      <div className={styles.grid}>

        {/* Column 1: System info + Services */}
        <div className={styles.col}>
          {/* System info panel */}
          <div className={styles.panel}>
            <div className={styles.panelTitle}>$ neofetch</div>
            <div className={styles.neofetchRow}>
              <span className={styles.nfKey}>OS</span>
              <span className={styles.nfVal}>Proxmox VE 8.2</span>
            </div>
            <div className={styles.neofetchRow}>
              <span className={styles.nfKey}>Host</span>
              <span className={styles.nfVal}>homelab-01</span>
            </div>
            <div className={styles.neofetchRow}>
              <span className={styles.nfKey}>Shell</span>
              <span className={styles.nfVal}>zsh + tmux</span>
            </div>
            <div className={styles.neofetchRow}>
              <span className={styles.nfKey}>Storage</span>
              <span className={styles.nfVal}>mergerfs + XFS</span>
            </div>
            <div className={styles.neofetchRow}>
              <span className={styles.nfKey}>Stack</span>
              <span className={styles.nfVal}>Docker + Proxmox</span>
            </div>
            <div className={styles.neofetchRow}>
              <span className={styles.nfKey}>Uptime</span>
              <span className={styles.nfVal} style={{ color:'#3fb950' }}>{fmtUptime(uptime)}</span>
            </div>
          </div>

          {/* Services panel */}
          <div className={`${styles.panel} ${styles.panelGrow}`}>
            <div className={styles.panelTitle}>$ systemctl list-units</div>
            <div className={styles.serviceList}>
              {SERVICES.map(s => (
                <div key={s.name} className={styles.serviceRow}>
                  <span className={`${styles.statusDot} ${s.status==='running' ? styles.dotGreen : styles.dotYellow}`} />
                  <span className={styles.serviceName}>{s.name}</span>
                  <span className={styles.servicePid}>:{s.port}</span>
                  <span className={`${styles.serviceStatus} ${s.status==='running' ? styles.statusGreen : styles.statusYellow}`}>
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 2: Metrics + Containers */}
        <div className={styles.col}>
          {/* CPU */}
          <div className={styles.panel}>
            <div className={styles.metricHeader}>
              <span className={styles.panelTitle}>CPU Usage</span>
              <span className={styles.metricVal} style={{ color: cpuNow > 70 ? '#f85149' : '#58a6ff' }}>
                {cpuNow}%
              </span>
            </div>
            <Sparkline history={cpu} color={cpuNow > 70 ? '#f85149' : '#58a6ff'} height={48} width={220} max={100} />
          </div>

          {/* RAM */}
          <div className={styles.panel}>
            <div className={styles.metricHeader}>
              <span className={styles.panelTitle}>Memory</span>
              <span className={styles.metricVal} style={{ color:'#d2a8ff' }}>
                {(ramNow / 100 * 32).toFixed(1)} / 32 GB
              </span>
            </div>
            <Sparkline history={ram} color="#d2a8ff" height={48} width={220} max={100} />
          </div>

          {/* Network */}
          <div className={styles.panel}>
            <div className={styles.metricHeader}>
              <span className={styles.panelTitle}>Network I/O</span>
              <span className={styles.metricVal} style={{ color:'#79c0ff' }}>
                {netNow} Mbps
              </span>
            </div>
            <Sparkline history={net} color="#79c0ff" height={48} width={220} max={100} />
          </div>

          {/* Docker containers */}
          <div className={`${styles.panel} ${styles.panelGrow}`}>
            <div className={styles.panelTitle}>$ docker ps</div>
            <div className={styles.containerTable}>
              <div className={styles.containerHeader}>
                <span>CONTAINER</span><span>CPU</span><span>MEM</span><span>STATUS</span>
              </div>
              {CONTAINERS.map(c => (
                <div key={c.name} className={styles.containerRow}>
                  <span className={styles.cName}>{c.name}</span>
                  <span className={styles.cCpu}>{c.cpu}</span>
                  <span className={styles.cMem}>{c.mem}</span>
                  <span className={styles.cStatus}>{c.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 3: Snake game as terminal process */}
        <div className={styles.col}>
          <div className={`${styles.panel} ${styles.snakePanel}`}>
            <div className={styles.termPrompt}>
              <span className={styles.promptUser}>{owner.github}@homelab</span>
              <span className={styles.promptSep}>:</span>
              <span className={styles.promptPath}>~/games</span>
              <span className={styles.promptDollar}>$</span>
              <span className={styles.promptCmd}> ./snake --wrap --speed=normal</span>
            </div>
            <div className={styles.termOutput}>Initializing snake v2.0 · grid 18×14 · wrapping enabled</div>

            <div style={{ position:'relative', lineHeight:0 }}>
              <canvas ref={canvasRef} width={W} height={H} className={styles.snakeCanvas} />
              {gameOver && (
                <div className={styles.termOver}>
                  <pre className={styles.termOverText}>{`Segmentation fault (core dumped)
score: ${score}${score === highScore && score > 0 ? '  [NEW RECORD]' : ''}

./snake --restart`}</pre>
                  <div className={styles.termBtns}>
                    <button className={styles.termBtn} onClick={restart}>--restart</button>
                    <button className={styles.termBtn} onClick={() => setMiniGameOpen(false)}>exit 0</button>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.termFooter}>
              <span className={styles.snakeScore}>score: <strong style={{ color:'#58a6ff' }}>{score}</strong></span>
              <span className={styles.snakeScore}>best:  <strong style={{ color:'#3fb950' }}>{highScore}</strong></span>
              <span className={styles.snakeHint}>↑↓←→ or wasd · wraps</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
