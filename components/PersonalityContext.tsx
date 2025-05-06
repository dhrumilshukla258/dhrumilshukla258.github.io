import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type PersonalityType = 'professional' | 'playful' | 'technical' | 'casual' | 'narrative';

interface PersonalityContextType {
  personality: PersonalityType;
  setPersonality: (personality: PersonalityType) => void;
}

// Create context with a default value
const PersonalityContext = createContext<PersonalityContextType | undefined>(undefined);

interface PersonalityProviderProps {
  children: ReactNode;
}

// Create provider component
export function PersonalityProvider({ children }: PersonalityProviderProps) {
  // Get initial value from localStorage if available
  const [personality, setPersonality] = useState<PersonalityType>('professional'); // Default value

  // Load saved personality from localStorage when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPersonality = localStorage.getItem('personality') as PersonalityType | null;
      if (savedPersonality && isValidPersonality(savedPersonality)) {
        setPersonality(savedPersonality);
      }
    }
  }, []);

  // Save to localStorage whenever personality changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('personality', personality);
    }
  }, [personality]);

  return (
    <PersonalityContext.Provider value={{ personality, setPersonality }}>
      {children}
    </PersonalityContext.Provider>
  );
}

// Type guard to validate personality value
function isValidPersonality(value: string): value is PersonalityType {
  return ['professional', 'playful', 'technical', 'casual', 'narrative'].includes(value);
}

// Create custom hook to use the personality context
export function usePersonality(): PersonalityContextType {
  const context = useContext(PersonalityContext);
  if (context === undefined) {
    throw new Error('usePersonality must be used within a PersonalityProvider');
  }
  return context;
}