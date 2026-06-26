import { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';
import { PersonalityType } from '@/components/context/PersonalityContext';
import { ProfessionalEffect } from './effects/professional/index';
import { GamerEffect }        from './effects/gamer/index';
import { TechnicalEffect }    from './effects/technical/index';
import styles from './PageTransition.module.css';

interface TransCtx {
  trigger: (type: PersonalityType, commit: () => void) => void;
  isActive: boolean;
}
const Ctx = createContext<TransCtx>({ trigger: () => {}, isActive: false });
export function usePageTransition() { return useContext(Ctx); }

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const [effect, setEffect] = useState<PersonalityType | null>(null);
  const commitRef = useRef<(() => void) | null>(null);

  const trigger = useCallback((type: PersonalityType, commit: () => void) => {
    commitRef.current = commit;
    setEffect(type);
  }, []);

  const handleMid  = useCallback(() => { commitRef.current?.(); commitRef.current = null; }, []);
  const handleDone = useCallback(() => setEffect(null), []);

  return (
    <Ctx.Provider value={{ trigger, isActive: !!effect }}>
      {children}
      {effect === 'professional' && <ProfessionalEffect onMid={handleMid} onDone={handleDone} />}
      {effect === 'gamer'        && <GamerEffect     onMid={handleMid} onDone={handleDone} />}
      {effect === 'technical'    && <TechnicalEffect onMid={handleMid} onDone={handleDone} />}
    </Ctx.Provider>
  );
}

