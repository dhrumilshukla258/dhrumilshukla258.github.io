import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import Image from 'next/image';
import { PersonalityType } from './PersonalityContext';
import v from '@/styles/PersonalityVehicles.module.css';

export const ANIM_PERSONALITY_ORDER: PersonalityType[] = ['professional', 'gamer', 'technical'];

interface FlyIcon {
  type: PersonalityType;
  fromRect: DOMRect;
  toRect: DOMRect;
  animName: string;
}

interface AnimContextType {
  pillIconRefs: React.MutableRefObject<(HTMLSpanElement | null)[]>;
  triggerFlyIn: (fromRects: DOMRect[]) => void;
  triggerSwitch: (type: PersonalityType) => void;
  isAnimating: boolean;
  glowing: boolean;
}

const AnimContext = createContext<AnimContextType | null>(null);

let animCounter = 0;

// Vehicle size during travel (px) — big enough to see the emoji clearly
const TRAVEL_SIZE = 80;

const DURATIONS: Record<PersonalityType, number> = {
  professional: 1.0,
  gamer: 1.0,
  technical: 1.0,
};

// Staggered so you watch each vehicle arrive one at a time
const DELAYS: Record<PersonalityType, number> = {
  professional: 0,
  gamer: 0.35,
  technical: 0.7,
};

function buildKeyframes(id: number, type: PersonalityType, from: DOMRect, to: DOMRect): string {
  const name = `pAnim${id}_${type}`;
  const ex = to.left;
  const ey = to.top;
  const ew = to.width;
  const eh = to.height;
  const W = window.innerWidth;
  const H = window.innerHeight;

  // Shared waypoints: bottom-right → right side → top-right → pill
  const sx   = W - TRAVEL_SIZE - 20;      // bottom-right X
  const sy   = H - TRAVEL_SIZE - 20;      // bottom-right Y
  const rx   = W - TRAVEL_SIZE - 20;      // right side (same X, mid height)
  const ry   = H / 2 - TRAVEL_SIZE / 2;
  const trx  = W - TRAVEL_SIZE - 20;      // top-right (same X, near titlebar)
  const try_ = ey + 4;

  if (type === 'professional') {
    // Briefcase drives right, turns up, slides left into the pill
    return `
      @keyframes ${name} {
        0%   { left:${sx}px;  top:${sy}px;   width:${TRAVEL_SIZE}px; height:${TRAVEL_SIZE}px; opacity:0; }
        6%   { left:${sx}px;  top:${sy}px;   width:${TRAVEL_SIZE}px; height:${TRAVEL_SIZE}px; opacity:1; }
        38%  { left:${rx}px;  top:${ry}px;   width:${TRAVEL_SIZE}px; height:${TRAVEL_SIZE}px; opacity:1; }
        65%  { left:${trx}px; top:${try_}px; width:${TRAVEL_SIZE}px; height:${TRAVEL_SIZE}px; opacity:1; }
        85%  { left:${ex}px;  top:${ey}px;   width:${ew}px;          height:${eh}px;          opacity:1; }
        100% { left:${ex}px;  top:${ey}px;   width:${ew}px;          height:${eh}px;          opacity:0; }
      }
    `;
  }

  if (type === 'gamer') {
    // Car skids right, powerslides up, drifts into the pill
    return `
      @keyframes ${name} {
        0%   { left:${sx}px;      top:${sy}px;       width:${TRAVEL_SIZE}px; height:${TRAVEL_SIZE}px; opacity:0; }
        6%   { left:${sx}px;      top:${sy}px;       width:${TRAVEL_SIZE}px; height:${TRAVEL_SIZE}px; opacity:1; }
        35%  { left:${rx + 10}px; top:${ry + 12}px;  width:${TRAVEL_SIZE}px; height:${TRAVEL_SIZE}px; }
        40%  { left:${rx - 10}px; top:${ry - 8}px;   width:${TRAVEL_SIZE}px; height:${TRAVEL_SIZE}px; }
        65%  { left:${trx}px;     top:${try_}px;     width:${TRAVEL_SIZE}px; height:${TRAVEL_SIZE}px; opacity:1; }
        82%  { left:${ex - 8}px;  top:${ey - 5}px;   width:${ew}px; height:${eh}px; opacity:1; }
        100% { left:${ex}px;      top:${ey}px;        width:${ew}px; height:${eh}px; opacity:0; }
      }
    `;
  }

  if (type === 'technical') {
    // Rocket warps to right, warps to top-right, fires into the pill with a burst
    return `
      @keyframes ${name} {
        0%   { left:${sx}px;  top:${sy}px;   width:${TRAVEL_SIZE}px; height:${TRAVEL_SIZE}px; opacity:1;
               filter: drop-shadow(0 0 10px cyan); }
        5%   { opacity:0; }
        8%   { left:${rx}px;  top:${ry}px;   width:${TRAVEL_SIZE}px; height:${TRAVEL_SIZE}px; opacity:1;
               filter: drop-shadow(0 0 16px cyan); }
        13%  { opacity:0; }
        16%  { left:${trx}px; top:${try_}px; width:${TRAVEL_SIZE}px; height:${TRAVEL_SIZE}px; opacity:1;
               filter: drop-shadow(0 0 20px cyan); }
        78%  { left:${trx}px; top:${try_}px; width:${TRAVEL_SIZE}px; height:${TRAVEL_SIZE}px; opacity:1; }
        88%  { left:${ex}px;  top:${ey}px;   width:${ew * 2}px; height:${eh * 2}px; opacity:0.6;
               filter: brightness(4) blur(1px); }
        100% { left:${ex}px;  top:${ey}px;   width:${ew}px; height:${eh}px; opacity:0; filter:none; }
      }
    `;
  }

  return '';
}

function VehicleOverlay({ type, landing }: { type: PersonalityType; landing: boolean }) {
  if (type === 'gamer') {
    return (
      <div className={v.gamerWrap}>
        <span className={v.gamerSpark}>✨</span>
        <span className={v.gamerBall}>🏀</span>
        <span className={v.gamerCar}>🏎️</span>
        <div className={v.iconInside} style={{ bottom: '36%', top: 'auto', left: '50%', transform: 'translateX(-50%)' }}>
          <Image src="/personality/gamer.png" alt="gamer" fill style={{ objectFit: 'contain' }} />
        </div>
      </div>
    );
  }
  if (type === 'technical') {
    return (
      <div className={v.techWrap}>
        <span className={`${v.techTrail1} ${landing ? v.vehicleFadeOut : ''}`}>⚡</span>
        <span className={`${v.techTrail2} ${landing ? v.vehicleFadeOut : ''}`}>💫</span>
        <span className={v.techShip}>🚀</span>
        <div className={v.iconInside}>
          <Image src="/personality/technical.png" alt="technical" fill style={{ objectFit: 'contain' }} />
        </div>
      </div>
    );
  }
  if (type === 'professional') {
    return (
      <div className={v.proWrap}>
        <span className={v.proStar1}>⭐</span>
        <span className={v.proStar2}>✨</span>
        <span className={v.proBriefcase}>💼</span>
        <div className={v.iconInside}>
          <Image src="/personality/professional.png" alt="professional" fill style={{ objectFit: 'contain' }} />
        </div>
      </div>
    );
  }
  return null;
}

export function PersonalityAnimationProvider({ children }: { children: ReactNode }) {
  const pillIconRefs = useRef<(HTMLSpanElement | null)[]>([null, null, null]);
  const [icons, setIcons] = useState<FlyIcon[] | null>(null);
  const [landing, setLanding] = useState(false);
  const [glowing, setGlowing] = useState(false);
  const styleRef = useRef<HTMLStyleElement | null>(null);
  const landCount = useRef(0);
  const expectedCount = useRef(0);

  const triggerFlyIn = useCallback((fromRects: DOMRect[]) => {
    const toRects = pillIconRefs.current.map((ref) => ref?.getBoundingClientRect() ?? null);
    if (toRects.some((r) => !r)) return;

    const id = ++animCounter;
    landCount.current = 0;
    expectedCount.current = ANIM_PERSONALITY_ORDER.length;

    const flyIcons: FlyIcon[] = ANIM_PERSONALITY_ORDER.map((type, i) => ({
      type,
      fromRect: fromRects[i],
      toRect: toRects[i] as DOMRect,
      animName: `pAnim${id}_${type}`,
    }));

    const css = flyIcons
      .map(({ type, fromRect, toRect }) => buildKeyframes(id, type, fromRect, toRect))
      .join('\n');

    styleRef.current?.remove();
    const el = document.createElement('style');
    el.textContent = css;
    document.head.appendChild(el);
    styleRef.current = el;

    setLanding(false);
    setGlowing(false);
    setIcons(flyIcons);
  }, []);

  const onIconDone = useCallback(() => {
    landCount.current += 1;
    if (landCount.current < expectedCount.current) return;
    setLanding(true);
    setGlowing(true);
    setTimeout(() => {
      setIcons(null);
      styleRef.current?.remove();
      styleRef.current = null;
      setTimeout(() => setGlowing(false), 900);
    }, 300);
  }, []);

  const triggerSwitch = useCallback((type: PersonalityType) => {
    const animIndex = ANIM_PERSONALITY_ORDER.indexOf(type);
    const toRect = pillIconRefs.current[animIndex]?.getBoundingClientRect();
    if (!toRect) return;

    const W = window.innerWidth;
    const H = window.innerHeight;

    // fromRect is a placeholder — buildKeyframes uses window dimensions for start position
    const from = new DOMRect(W - TRAVEL_SIZE - 20, H - TRAVEL_SIZE - 20, TRAVEL_SIZE, TRAVEL_SIZE);
    const id = ++animCounter;
    landCount.current = 0;
    expectedCount.current = 1;

    const animName = `pAnim${id}_${type}`;
    const css = buildKeyframes(id, type, from, toRect);

    styleRef.current?.remove();
    const el = document.createElement('style');
    el.textContent = css;
    document.head.appendChild(el);
    styleRef.current = el;

    setLanding(false);
    setGlowing(false);
    setIcons([{ type, fromRect: from, toRect, animName }]);
  }, []);

  useEffect(() => () => { styleRef.current?.remove(); }, []);

  return (
    <AnimContext.Provider value={{ pillIconRefs, triggerFlyIn, triggerSwitch, isAnimating: !!icons, glowing }}>
      {children}

      {icons && (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 600 }}>
          {icons.map(({ type, fromRect, animName }) => (
            <div
              key={type}
              onAnimationEnd={onIconDone}
              style={{
                position: 'fixed',
                left: fromRect.left,
                top: fromRect.top,
                width: TRAVEL_SIZE,
                height: TRAVEL_SIZE,
                animation: `${animName} ${DURATIONS[type]}s cubic-bezier(0.4,0,0.2,1) ${DELAYS[type]}s both`,
                overflow: 'visible',
              }}
            >
              <VehicleOverlay type={type} landing={landing} />
            </div>
          ))}
        </div>
      )}
    </AnimContext.Provider>
  );
}

export function usePersonalityAnimation() {
  const ctx = useContext(AnimContext);
  if (!ctx) throw new Error('usePersonalityAnimation must be used within PersonalityAnimationProvider');
  return ctx;
}
