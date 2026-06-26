import { useEffect, useRef } from 'react';
import { useMenu } from '@/components/context/MenuContext';
import { usePersonality } from '@/components/context/PersonalityContext';
import { drawProfessional, drawGamer, drawTechnical } from '@/components/animations/avatars';

type Phase =
  | 'walk-in'     // walking right along titlebar to View button
  | 'pause'       // brief stop before opening menu
  | 'open-menu'   // menu opens, character starts walking down
  | 'walk-down'   // character descends into dropdown toward glitch item
  | 'at-item'     // character arrives at glitch item, does action
  | 'glitch-fire' // glitch fires, character reacts
  | 'walk-out'    // character walks back up and left off screen
  | 'done';

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function easeInOut(t: number) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

export function GlitchUnlockTutorial() {
  const { setActiveMenu } = useMenu();
  const { personality } = usePersonality();
  const rafRef = useRef<number>(0);
  const personalityRef = useRef(personality);
  personalityRef.current = personality;

  useEffect(() => {
    const run = () => {
      const viewEl = Array.from(document.querySelectorAll<HTMLElement>('[class*="menuLabel"]'))
        .find(el => el.textContent?.trim() === 'View');
      if (!viewEl) return;

      const vRect = viewEl.getBoundingClientRect();
      const titlebarGround = vRect.bottom + 1;
      const viewCenterX = vRect.left + vRect.width / 2;

      const canvas = document.createElement('canvas');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;';
      document.body.appendChild(canvas);
      const ctx = canvas.getContext('2d')!;

      const SCALE = 0.30;
      const WALK_SPEED = 2.6;

      let phase: Phase = 'walk-in';
      let x = -60;
      let groundY = titlebarGround; // current ground the character stands on
      let walkT = 0;
      let actionT = 0;
      let pauseFrames = 0;
      let glitchItemX = viewCenterX;
      let glitchItemY = titlebarGround;
      let walkDownT = 0;  // 0→1 progress walking down to item
      let walkOutT = 0;   // 0→1 progress walking back out
      let startGround = titlebarGround;
      let startX = viewCenterX;
      let menuOpenedFrame = false;

      const findGlitchItem = (): { x: number; y: number } | null => {
        const el = document.querySelector<HTMLElement>('[class*="glitchItem"]');
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.bottom }; // stand ON the item row
      };

      const drawChar = (cx: number, gnd: number, p: string, wT: number, aT: number, isAction: boolean) => {
        ctx.save();
        ctx.translate(cx, gnd);
        ctx.scale(SCALE, SCALE);
        if (p === 'professional') {
          drawProfessional(ctx, 0, 0, wT, isAction ? aT : 0);
        } else if (p === 'gamer') {
          drawGamer(ctx, 0, 0, wT, 0, isAction, 0);
        } else {
          drawTechnical(ctx, 0, 0, wT, isAction ? 1 : 0, 0);
        }
        ctx.restore();
      };

      const tick = () => {
        walkT += 0.045;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const p = personalityRef.current;

        if (phase === 'walk-in') {
          x += WALK_SPEED;
          groundY = titlebarGround;
          if (x >= viewCenterX) {
            x = viewCenterX;
            phase = 'pause';
            pauseFrames = 14;
          }
          drawChar(x, groundY, p, walkT, 0, false);

        } else if (phase === 'pause') {
          pauseFrames--;
          drawChar(x, groundY, p, 0, 0, false);
          if (pauseFrames <= 0) {
            // open the menu
            setActiveMenu('view');
            menuOpenedFrame = false;
            phase = 'open-menu';
            pauseFrames = 22; // wait for glitch item to animate in
          }

        } else if (phase === 'open-menu') {
          pauseFrames--;
          drawChar(x, groundY, p, 0, 0, false);
          if (pauseFrames <= 0) {
            // find glitch item position
            const pos = findGlitchItem();
            if (pos) {
              glitchItemX = pos.x;
              glitchItemY = pos.y;
            } else {
              glitchItemX = viewCenterX;
              glitchItemY = titlebarGround + 120;
            }
            startGround = titlebarGround;
            startX = viewCenterX;
            walkDownT = 0;
            phase = 'walk-down';
          }

        } else if (phase === 'walk-down') {
          walkDownT = Math.min(1, walkDownT + 0.028);
          const t = easeInOut(walkDownT);
          groundY = lerp(startGround, glitchItemY, t);
          x = lerp(startX, glitchItemX, t);
          drawChar(x, groundY, p, walkT, 0, false);
          if (walkDownT >= 1) {
            phase = 'at-item';
            pauseFrames = 30; // stay on item briefly
            actionT = 0;
          }

        } else if (phase === 'at-item') {
          actionT = Math.min(1, actionT + 0.05);
          pauseFrames--;
          drawChar(x, groundY, p, walkT, actionT, true);
          if (pauseFrames <= 0) {
            // CLICK — close menu and fire glitch
            setActiveMenu(null);
            setTimeout(() => window.dispatchEvent(new Event('glitchPage')), 60);
            phase = 'glitch-fire';
            pauseFrames = 20;
          }

        } else if (phase === 'glitch-fire') {
          // character jumps/reacts
          const bounce = Math.abs(Math.sin(walkT * 8)) * 8;
          drawChar(x, groundY - bounce, p, walkT, 1, true);
          pauseFrames--;
          if (pauseFrames <= 0) {
            walkOutT = 0;
            startX = x;
            startGround = groundY;
            phase = 'walk-out';
          }

        } else if (phase === 'walk-out') {
          walkOutT = Math.min(1, walkOutT + 0.025);
          const t = easeInOut(walkOutT);
          // walk back up to titlebar then off left
          groundY = lerp(startGround, titlebarGround, Math.min(1, walkOutT * 2));
          x = lerp(startX, -100, t);
          drawChar(x, groundY, p, walkT, 0, false);
          if (walkOutT >= 1) phase = 'done';
        }

        if (phase !== 'done') {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          canvas.remove();
        }
      };

      rafRef.current = requestAnimationFrame(tick);
    };

    const onFound = () => setTimeout(run, 200);
    window.addEventListener('welcomeFound', onFound);
    return () => {
      window.removeEventListener('welcomeFound', onFound);
      cancelAnimationFrame(rafRef.current);
    };
  }, [setActiveMenu]);

  return null;
}
