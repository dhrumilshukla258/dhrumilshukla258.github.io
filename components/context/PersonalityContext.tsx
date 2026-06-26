import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { defaultTheme } from '@/data/owner';

export type PersonalityType = 'professional' | 'gamer' | 'technical';

const PERSONALITY_DEFAULTS: Record<PersonalityType, string> = {
  professional: defaultTheme.professional ?? 'github-dark',
  gamer:        defaultTheme.gamer        ?? 'unreal',
  technical:    defaultTheme.technical    ?? 'github-dark',
};

interface PersonalityContextType {
  personality: PersonalityType;
  setPersonality: (personality: PersonalityType) => void;
}

const PersonalityContext = createContext<PersonalityContextType | undefined>(undefined);

interface PersonalityProviderProps {
  children: ReactNode;
}

function getPersonalityThemeKey(p: PersonalityType) {
  return `theme_${p}`;
}

function applyPersonality(p: PersonalityType) {
  // Apply per-personality theme
  const savedTheme = localStorage.getItem(getPersonalityThemeKey(p));
  const theme = savedTheme || PERSONALITY_DEFAULTS[p];
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.setAttribute('data-personality', p);
}

export function PersonalityProvider({ children }: PersonalityProviderProps) {
  const [personality, setPersonalityState] = useState<PersonalityType>('professional');

  // Load saved personality on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('personality') as PersonalityType | null;
      const p = saved && isValidPersonality(saved) ? saved : 'professional';
      setPersonalityState(p);
      applyPersonality(p);
    }
  }, []);

  const setPersonality = (p: PersonalityType) => {
    setPersonalityState(p);
    localStorage.setItem('personality', p);
    applyPersonality(p);
  };

  return (
    <PersonalityContext.Provider value={{ personality, setPersonality }}>
      {children}
    </PersonalityContext.Provider>
  );
}

function isValidPersonality(value: string): value is PersonalityType {
  return ['professional', 'gamer', 'technical'].includes(value);
}

export function usePersonality(): PersonalityContextType {
  const context = useContext(PersonalityContext);
  if (context === undefined) {
    throw new Error('usePersonality must be used within a PersonalityProvider');
  }
  return context;
}

// Call this when changing theme so it's saved under the current personality
export function saveThemeForPersonality(theme: string) {
  const saved = localStorage.getItem('personality') as PersonalityType | null;
  const p = saved && isValidPersonality(saved) ? saved : 'professional';
  localStorage.setItem(getPersonalityThemeKey(p), theme);
  // Legacy key for _app.tsx initial load
  localStorage.setItem('theme', theme);
}
