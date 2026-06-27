import { useState, useRef, useCallback, useEffect } from 'react';

type Dir = 'U' | 'D' | 'L' | 'R';
interface Pos { x: number; y: number }
const DELTA: Record<Dir, Pos> = { U:{x:0,y:-1}, D:{x:0,y:1}, L:{x:-1,y:0}, R:{x:1,y:0} };

function mkSnake(cx: number, cy: number): Pos[] {
  return [{ x: cx, y: cy }, { x: cx - 1, y: cy }, { x: cx - 2, y: cy }];
}
function mkFood(snake: Pos[], cols: number, rows: number): Pos {
  let pos: Pos;
  do { pos = { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) }; }
  while (snake.some(s => s.x === pos.x && s.y === pos.y));
  return pos;
}

export interface SnakeColors {
  bg: string; grid: string; snake: string; head: string; food: string;
}

interface Options {
  active:  boolean;
  colors:  SnakeColors;
  cols?:   number;
  rows?:   number;
  cell?:   number;
  speed?:  number;
}

export function useSnakeGame({ active, colors, cols = 24, rows = 18, cell = 20, speed = 120 }: Options) {
  const W = cols * cell;
  const H = rows * cell;

  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const snakeRef     = useRef<Pos[]>(mkSnake(Math.floor(cols / 2), Math.floor(rows / 2)));
  const foodRef      = useRef<Pos>(mkFood(snakeRef.current, cols, rows));
  const dirRef       = useRef<Dir>('R');
  const nextDirRef   = useRef<Dir>('R');
  const deadRef      = useRef(false);
  const scoreRef     = useRef(0);

  const [score, setScore]         = useState(0);
  const [gameOver, setGameOver]   = useState(false);
  const [highScore, setHighScore] = useState(0);

  const restart = useCallback(() => {
    snakeRef.current   = mkSnake(Math.floor(cols / 2), Math.floor(rows / 2));
    foodRef.current    = mkFood(snakeRef.current, cols, rows);
    dirRef.current     = 'R';
    nextDirRef.current = 'R';
    deadRef.current    = false;
    scoreRef.current   = 0;
    setScore(0);
    setGameOver(false);
  }, [cols, rows]);

  useEffect(() => {
    const saved = parseInt(localStorage.getItem('snake_hs') ?? '0', 10);
    setHighScore(saved);
  }, []);

  useEffect(() => { if (active) restart(); }, [active, restart]);

  const OPP: Record<Dir, Dir> = { U:'D', D:'U', L:'R', R:'L' };

  const pushDir = useCallback((d: Dir) => {
    if (d !== OPP[dirRef.current]) nextDirRef.current = d;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // keyboard
  useEffect(() => {
    if (!active) return;
    const MAP: Record<string, Dir> = { ArrowUp:'U', ArrowDown:'D', ArrowLeft:'L', ArrowRight:'R', w:'U', s:'D', a:'L', d:'R' };
    const onKey = (e: KeyboardEvent) => {
      const d = MAP[e.key];
      if (!d) return;
      if (e.key.startsWith('Arrow')) e.preventDefault();
      pushDir(d);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, pushDir]);

  // game loop
  useEffect(() => {
    if (!active || gameOver) return;
    const C = colors;

    function draw() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = C.bg;
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = C.grid;
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= cols; x++) { ctx.beginPath(); ctx.moveTo(x*cell,0); ctx.lineTo(x*cell,H); ctx.stroke(); }
      for (let y = 0; y <= rows; y++) { ctx.beginPath(); ctx.moveTo(0,y*cell); ctx.lineTo(W,y*cell); ctx.stroke(); }

      const f = foodRef.current;
      ctx.fillStyle = C.food;
      ctx.beginPath();
      ctx.arc(f.x*cell+cell/2, f.y*cell+cell/2, cell/2-2, 0, Math.PI*2);
      ctx.fill();

      snakeRef.current.forEach((seg, i) => {
        ctx.fillStyle = i === 0 ? C.head : C.snake;
        ctx.beginPath();
        ctx.roundRect(seg.x*cell+1, seg.y*cell+1, cell-2, cell-2, 3);
        ctx.fill();
      });
    }

    function tick() {
      if (deadRef.current) return;
      dirRef.current = nextDirRef.current;
      const head = snakeRef.current[0];
      const d = DELTA[dirRef.current];
      const next = { x: ((head.x+d.x)%cols+cols)%cols, y: ((head.y+d.y)%rows+rows)%rows };
      if (snakeRef.current.slice(1).some(s => s.x===next.x && s.y===next.y)) {
        deadRef.current = true;
        const sc = scoreRef.current;
        setGameOver(true);
        setHighScore(prev => { const h = Math.max(prev, sc); localStorage.setItem('snake_hs', String(h)); return h; });
        return;
      }
      const ate = next.x===foodRef.current.x && next.y===foodRef.current.y;
      const ns = [next, ...snakeRef.current];
      if (!ate) ns.pop();
      snakeRef.current = ns;
      if (ate) { scoreRef.current += 10; setScore(scoreRef.current); foodRef.current = mkFood(ns, cols, rows); }
      draw();
    }

    draw();
    const id = setInterval(tick, speed);
    return () => clearInterval(id);
  }, [active, gameOver, colors, cols, rows, cell, speed, W, H]);

  return { canvasRef, score, highScore, gameOver, restart, pushDir, W, H };
}
