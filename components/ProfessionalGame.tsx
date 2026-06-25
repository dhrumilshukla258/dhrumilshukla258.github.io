import { useSnakeGame } from '@/hooks/useSnakeGame';
import { useMenu } from '@/components/MenuContext';
import styles from '@/styles/ProfessionalGame.module.css';

const COLORS = {
  bg:    '#1e1e1e',
  grid:  '#252526',
  snake: '#4ec9b0',
  head:  '#9cdcfe',
  food:  '#ce9178',
};

export default function ProfessionalGame() {
  const { setMiniGameOpen } = useMenu();
  const { canvasRef, score, highScore, gameOver, restart, W, H } = useSnakeGame({
    active: true,
    colors: COLORS,
    cols: 30,
    rows: 22,
    cell: 22,
    speed: 110,
  });

  return (
    <div className={styles.root}>
      <div className={styles.window}>
        <div className={styles.titlebar}>
          <span className={styles.tabIcon}>🐍</span>
          <span className={styles.tabName}>snake.py — Professional Mode</span>
          <div className={styles.scores}>
            <span className={styles.scoreItem}>Score <strong>{score}</strong></span>
            <span className={styles.scoreItem}>Best <strong>{highScore}</strong></span>
          </div>
          <button className={styles.returnBtn} onClick={() => setMiniGameOpen(false)}>↩ VSCode</button>
        </div>

        <div className={styles.canvasWrap}>
          <canvas ref={canvasRef} width={W} height={H} className={styles.canvas} />
          {gameOver && (
            <div className={styles.overlay}>
              <p className={styles.overTitle}>Process exited</p>
              <p className={styles.overScore}>Score: {score}</p>
              {score > 0 && score === highScore && (
                <p className={styles.newRecord}>New high score!</p>
              )}
              <button className={styles.restartBtn} onClick={restart}>
                Restart
              </button>
              <button className={styles.exitBtn} onClick={() => setMiniGameOpen(false)}>
                Close
              </button>
            </div>
          )}
        </div>

        <div className={styles.hint}>Arrow keys or WASD · wraps around edges</div>
      </div>
    </div>
  );
}
