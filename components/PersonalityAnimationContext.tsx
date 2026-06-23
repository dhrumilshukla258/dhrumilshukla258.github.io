import { createContext, useContext, useRef, useState, useCallback, ReactNode } from 'react';
import { PersonalityType } from './PersonalityContext';

export const ANIM_PERSONALITY_ORDER: PersonalityType[] = ['professional', 'gamer', 'technical'];

interface AnimContextType {
  pillIconRefs: React.MutableRefObject<(HTMLSpanElement | null)[]>;
  triggerSameClick: () => void;
  shaking: boolean;
}

const AnimContext = createContext<AnimContextType | null>(null);

export function PersonalityAnimationProvider({ children }: { children: ReactNode }) {
  const pillIconRefs = useRef<(HTMLSpanElement | null)[]>([null, null, null]);
  const [shaking, setShaking] = useState(false);

  const triggerSameClick = useCallback(() => {
    setShaking(true);
    setTimeout(() => setShaking(false), 600);
  }, []);

  return (
    <AnimContext.Provider value={{ pillIconRefs, triggerSameClick, shaking }}>
      {children}
    </AnimContext.Provider>
  );
}

export function usePersonalityAnimation() {
  const ctx = useContext(AnimContext);
  if (!ctx) throw new Error('usePersonalityAnimation must be used within PersonalityAnimationProvider');
  return ctx;
}
