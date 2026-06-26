import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { usePersonality, PersonalityType } from '@/components/context/PersonalityContext';
import { personalityCards } from '@/data/about';
import { usePersonalityAnimation, ANIM_PERSONALITY_ORDER } from '@/components/context/PersonalityAnimationContext';
import { drawProfessional } from '@/components/animations/avatars';
import { drawGamer }        from '@/components/animations/avatars';
import { drawTechnical }    from '@/components/animations/avatars';
import styles from './PersonalityOnboardingModal.module.css';

const personalities: { type: PersonalityType; label: string; tagline: string; icon: string }[] = personalityCards;

// Matches each personality's defaultTheme accent (data/owner.ts + styles/themes.css)
const ACCENT: Record<string, string> = {
  professional: '#c4a35a', // professional theme
  gamer:        '#4fc3f7', // unreal theme
  technical:    '#f9826c', // github-dark theme
};


function easeOutCubic(t: number) { return 1 - Math.pow(1 - t, 3); }

function flyAvatarsToBar(
  cardRefs: (HTMLButtonElement | null)[],
  pillIconRefs: (HTMLSpanElement | null)[],
  onDone: () => void,
) {
  // Gather start/end positions
  const starts = cardRefs.map(el => {
    if (!el) return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });

  const ends = ANIM_PERSONALITY_ORDER.map((type, i) => {
    const el = pillIconRefs[i];
    if (!el) return { x: window.innerWidth / 2, y: 0 };
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });

  // Create full-screen canvas
  const canvas = document.createElement('canvas');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.cssText = 'position:fixed;inset:0;z-index:9999;pointer-events:none;';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d')!;

  const DURATION = 700;
  const start = performance.now();

  const TYPES: PersonalityType[] = ['professional', 'gamer', 'technical'];

  function frame(now: number) {
    const raw = Math.min((now - start) / DURATION, 1);
    const t   = easeOutCubic(raw);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    TYPES.forEach((type, i) => {
      const sx = starts[i].x, sy = starts[i].y;
      const ex = ends[i].x,   ey = ends[i].y;
      const x  = sx + (ex - sx) * t;
      const y  = sy + (ey - sy) * t;

      // Scale down as they approach the bar
      const scale = 1 - t * 0.7;
      const alpha = raw < 0.85 ? 1 : 1 - (raw - 0.85) / 0.15;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.translate(-x, -y);

      // Draw avatar centred on current position
      const ground = y + 20;
      const walkT  = raw * Math.PI * 4;
      if (type === 'professional') {
        drawProfessional(ctx, x, ground, walkT, Math.min(raw * 2, 1));
      } else if (type === 'gamer') {
        drawGamer(ctx, x, ground, walkT, Math.min(raw, 1), false, 0);
      } else {
        drawTechnical(ctx, x, ground, walkT, Math.min(raw * 2, 1), 0);
      }
      ctx.restore();
    });

    if (raw < 1) {
      requestAnimationFrame(frame);
    } else {
      canvas.remove();
      onDone();
    }
  }

  requestAnimationFrame(frame);
}

function MockCol({ label, a }: { label: string; a: string }) {
  return (
    <div className={styles.mockCol} style={{ borderColor: a + '33' }}>
      <div className={styles.mockColHead} style={{ color: a }}>{label}</div>
      <div className={styles.mockLine} style={{ width: '80%', background: a + '55' }} />
      <div className={styles.mockLine} style={{ width: '60%', background: a + '33' }} />
      <div className={styles.mockCard} style={{ borderColor: a + '44', background: a + '11' }}>
        <div className={styles.mockLine} style={{ width: '50%', background: a + '66' }} />
        <div className={styles.mockLine} style={{ width: '90%', background: a + '33' }} />
        <div className={styles.mockLine} style={{ width: '70%', background: a + '33' }} />
      </div>
      <div className={styles.mockCard} style={{ borderColor: a + '44', background: a + '11' }}>
        <div className={styles.mockLine} style={{ width: '55%', background: a + '66' }} />
        <div className={styles.mockLine} style={{ width: '85%', background: a + '33' }} />
      </div>
    </div>
  );
}

function VscodeMockup() {
  const P = ACCENT.professional;
  const G = ACCENT.gamer;
  const T = ACCENT.technical;
  return (
    <div className={styles.mockup}>
      <div className={styles.mockTitlebar}>
        <div className={styles.mockDots}><span /><span /><span /></div>
        <div className={styles.mockTabs}>
          <span className={styles.mockTab} style={{ color: P }}>index.tsx</span>
          <span className={styles.mockTab} style={{ color: G }}>welcome.tsx</span>
          <span className={styles.mockTab} style={{ color: T }}>about.tsx</span>
        </div>
      </div>
      <div className={styles.mockBody}>
        <div className={styles.mockSidebar}>
          {['work.tsx','projects.tsx','github.tsx','about.tsx','contact.tsx'].map(f => (
            <div key={f} className={styles.mockFile}>{f}</div>
          ))}
        </div>
        <MockCol label="Professional" a={P} />
        <MockCol label="Gamer"        a={G} />
        <MockCol label="Technical"    a={T} />
      </div>
      <div className={styles.mockBottombar}>
        <span style={{ color: P }}>◉ main</span>
        <span>Ln 1, Col 1</span>
        <span>UTF-8</span>
        <span>TypeScript</span>
      </div>
    </div>
  );
}

const PersonalityOnboardingModal = () => {
  const { setPersonality } = usePersonality();
  const { pillIconRefs } = usePersonalityAnimation();
  const [visible, setVisible] = useState(false);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([null, null, null]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const seen = localStorage.getItem('hasSeenPersonality');
      if (!seen) setVisible(true);
    }
  }, []);

  const pick = useCallback((type: PersonalityType, cardIndex: number) => {
    localStorage.setItem('hasSeenPersonality', 'true');

    // Hide the modal immediately, then fly avatars to the titlebar
    setVisible(false);
    setPersonality(type);

    // Slight delay so modal unmounts and pills are visible in DOM
    setTimeout(() => {
      flyAvatarsToBar(
        cardRefs.current,
        pillIconRefs.current,
        () => {},
      );
    }, 30);
  }, [setPersonality, pillIconRefs]);

  if (!visible) return null;

  return (
    <div className={styles.overlay}>
      <VscodeMockup />
      <div className={styles.scrim} />
      <div className={styles.modal}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>dhrumilshukla258.github.io</p>
          <h2 className={styles.heading}>Choose your experience</h2>
          <p className={styles.sub}>How do you want to explore this portfolio?</p>
        </div>
        <div className={styles.divider} />
        <div className={styles.cards}>
          {personalities.map(({ type, label, tagline, icon }, i) => (
            <button
              key={type}
              ref={el => { cardRefs.current[i] = el; }}
              className={styles.card}
              onClick={() => pick(type, i)}
              style={{ '--card-accent': ACCENT[type] } as React.CSSProperties}
            >
              <div className={styles.iconWrap}>
                <Image src={icon} alt={label} fill sizes="96px" className={styles.icon} />
              </div>
              <span className={styles.cardLabel} style={{ color: ACCENT[type] }}>{label}</span>
              <span className={styles.cardTagline}>{tagline}</span>
              <span className={styles.cardCta}>Select →</span>
            </button>
          ))}
        </div>
        <p className={styles.hint}>You can switch anytime from the top bar</p>
      </div>
    </div>
  );
};

export default PersonalityOnboardingModal;
