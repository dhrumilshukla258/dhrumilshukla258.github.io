import { useEffect, useState } from 'react';
import { usePersonality } from '@/components/context/PersonalityContext';
import { useMenu } from '@/components/context/MenuContext';
import { useSnakeGame, SnakeColors } from '@/games/snake/useSnakeGame';
import styles from './MiniSnake.module.css';

// Per-theme palettes for professional personality (matches VSCode theme colors)
const THEME_COLORS: Record<string, SnakeColors> = {
  'github-dark':  { bg:'#1a1f23', grid:'#1f2428', snake:'#f9826c', head:'#ffaa94', food:'#58a6ff' },
  'unreal':       { bg:'#1a1a1a', grid:'#222222', snake:'#4fc3f7', head:'#7dd8f8', food:'#e07040' },
  'dracula':      { bg:'#282a36', grid:'#343746', snake:'#bd93f9', head:'#d4b2ff', food:'#ff79c6' },
  'ayu-dark':     { bg:'#0a0e14', grid:'#101620', snake:'#e6b450', head:'#f0c870', food:'#ff7733' },
  'ayu-mirage':   { bg:'#1f2430', grid:'#252e3d', snake:'#e6b450', head:'#f0c870', food:'#ff7733' },
  'nord':         { bg:'#2e3440', grid:'#3b4252', snake:'#88c0d0', head:'#a3d4e0', food:'#bf616a' },
  'night-owl':    { bg:'#011627', grid:'#031d33', snake:'#82aaff', head:'#a0bcff', food:'#f78c6c' },
  'professional': { bg:'#1a1712', grid:'#22201a', snake:'#c8a84b', head:'#e8bf6a', food:'#e07040' },
  'vscode':       { bg:'#1e1e1e', grid:'#252526', snake:'#569cd6', head:'#7db8e8', food:'#dcdcaa' },
  'unity':        { bg:'#3c3c3c', grid:'#454545', snake:'#4f80f8', head:'#7a9ff8', food:'#e07040' },
};

const PERSONALITY_COLORS: Record<string, SnakeColors> = {
  gamer:     { bg:'#080810', grid:'#10101c', snake:'#39c95a', head:'#5dde78', food:'#c47829' },
  technical: { bg:'#0d1117', grid:'#161b22', snake:'#58a6ff', head:'#79c0ff', food:'#3fb950' },
};

function getThemeId(): string {
  if (typeof document === 'undefined') return 'github-dark';
  return document.documentElement.getAttribute('data-theme') ?? 'github-dark';
}

function useThemeColors(personality: string): SnakeColors {
  const [colors, setColors] = useState<SnakeColors>(() => {
    if (personality !== 'professional') return PERSONALITY_COLORS[personality] ?? PERSONALITY_COLORS.gamer;
    return THEME_COLORS[getThemeId()] ?? THEME_COLORS['github-dark'];
  });

  useEffect(() => {
    if (personality !== 'professional') {
      setColors(PERSONALITY_COLORS[personality] ?? PERSONALITY_COLORS.gamer);
      return;
    }

    const update = () => setColors(THEME_COLORS[getThemeId()] ?? THEME_COLORS['github-dark']);
    update();

    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, [personality]);

  return colors;
}

const LABELS = {
  professional: { title:'snake.exe — Minimized', over:'Process terminated.', restart:'Restart Process', exit:'Restore Window' },
  gamer:        { title:'🐍 SNEK.EXE',           over:'GAME OVER',           restart:'TRY AGAIN',       exit:'RESTORE' },
  technical:    { title:'$ ./snake --play',       over:'Segmentation fault (core dumped)', restart:'./snake --restart', exit:'exit 0' },
};

const CELL = 22;
const V_CHROME = 62;  // titlebar + hint bar
const H_CHROME = 4;   // border * 2

function calcGrid(winW: number, winH: number) {
  const isMobile = winW < 768;
  // On mobile leave extra vertical room for browser chrome + D-pad
  const maxW = Math.min(winW, 900) - H_CHROME;
  const maxH = Math.min(winH, isMobile ? 560 : 700) - V_CHROME - (isMobile ? 16 : 0);
  const cols = Math.floor(maxW / CELL);
  const rows = Math.floor(maxH / CELL);
  return { cols: Math.max(cols, 10), rows: Math.max(rows, 8) };
}

interface Props { onRestore: () => void }

export function MiniSnake({ onRestore }: Props) {
  const { personality } = usePersonality();
  const { miniGameOpen } = useMenu();
  const C = useThemeColors(personality);
  const L = LABELS[personality as keyof typeof LABELS] ?? LABELS.professional;

  const [grid, setGrid] = useState(() =>
    typeof window !== 'undefined'
      ? calcGrid(window.innerWidth, window.innerHeight)
      : { cols: 28, rows: 20 }
  );

  useEffect(() => {
    const onResize = () => setGrid(calcGrid(window.innerWidth, window.innerHeight));
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const { canvasRef, score, highScore, gameOver, restart, pushDir, W, H } = useSnakeGame({
    active: miniGameOpen, colors: C, cols: grid.cols, rows: grid.rows, cell: CELL,
  });

  return (
    <div className={styles.screen} style={{ background: C.bg }}>
      <div className={styles.window} style={{ borderColor: C.grid }}>
        <div className={styles.titlebar} style={{ background: C.grid, color: C.head }}>
          <span className={styles.title}>{L.title}</span>
          <div className={styles.scores}>
            <span>Score: {score}</span>
            <span>Best: {highScore}</span>
          </div>
          <button className={styles.closeBtn} onClick={onRestore}>✕</button>
        </div>

        <div className={styles.canvasWrap}>
          <canvas ref={canvasRef} width={W} height={H} className={styles.canvas} />
          {gameOver && (
            <div className={styles.gameOver} style={{ background: C.bg + 'ee', color: C.head }}>
              <p className={styles.overTitle} style={{ color: C.food }}>{L.over}</p>
              <p className={styles.overScore}>Score: {score}</p>
              {score > 0 && score === highScore && <p className={styles.newRecord} style={{ color: C.head }}>New record!</p>}
              <button className={styles.restartBtn} style={{ borderColor: C.snake, color: C.snake }} onClick={restart}>{L.restart}</button>
              <button className={styles.exitBtn} style={{ color: C.head + '88' }} onClick={onRestore}>{L.exit}</button>
            </div>
          )}

          {/* On-screen D-pad — only visible on touch devices via CSS */}
          <div className={styles.dpad} style={{ '--snake-color': C.snake } as React.CSSProperties}>
            <button className={`${styles.dBtn} ${styles.dUp}`}     onPointerDown={() => pushDir('U')}>▲</button>
            <button className={`${styles.dBtn} ${styles.dLeft}`}   onPointerDown={() => pushDir('L')}>◀</button>
<button className={`${styles.dBtn} ${styles.dDown}`}   onPointerDown={() => pushDir('D')}>▼</button>
            <button className={`${styles.dBtn} ${styles.dRight}`}  onPointerDown={() => pushDir('R')}>▶</button>
          </div>
        </div>

        <div className={styles.hint} style={{ background: C.grid, color: C.head + '55' }}>
          Arrow keys or WASD · snake wraps around edges
        </div>
      </div>
    </div>
  );
}
