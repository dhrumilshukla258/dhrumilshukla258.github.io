import { usePersonality } from '@/components/PersonalityContext';
import { useMenu } from '@/components/MenuContext';
import { useSnakeGame } from '@/hooks/useSnakeGame';
import styles from '@/styles/MiniSnake.module.css';

const COLORS = {
  professional: { bg:'#1a1712', grid:'#22201a', snake:'#c8a84b', head:'#e8bf6a', food:'#e07040' },
  gamer:        { bg:'#080810', grid:'#10101c', snake:'#39c95a', head:'#5dde78', food:'#c47829' },
  technical:    { bg:'#0d1117', grid:'#161b22', snake:'#58a6ff', head:'#79c0ff', food:'#3fb950' },
};

const LABELS = {
  professional: { title:'snake.exe — Minimized', over:'Process terminated.', restart:'Restart Process', exit:'Restore Window' },
  gamer:        { title:'🐍 SNEK.EXE',           over:'GAME OVER',           restart:'TRY AGAIN',       exit:'RESTORE' },
  technical:    { title:'$ ./snake --play',       over:'Segmentation fault (core dumped)', restart:'./snake --restart', exit:'exit 0' },
};

interface Props { onRestore: () => void }

export function MiniSnake({ onRestore }: Props) {
  const { personality } = usePersonality();
  const { miniGameOpen } = useMenu();
  const C = COLORS[personality];
  const L = LABELS[personality];

  const { canvasRef, score, highScore, gameOver, restart, W, H } = useSnakeGame({
    active: miniGameOpen, colors: C, cols: 28, rows: 20, cell: 22,
  });

  return (
    <div className={styles.window} style={{ borderColor: C.grid, background: C.bg }}>
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
      </div>

      <div className={styles.hint} style={{ color: C.head + '55' }}>
        Arrow keys or WASD · snake wraps around edges
      </div>
    </div>
  );
}
