import { usePersonality } from '@/components/PersonalityContext';
import ProfessionalGame from '@/components/ProfessionalGame';
import { GamerGame }        from '@/components/GamerGame';

export function MinimizedDesktop() {
  const { personality } = usePersonality();
  if (personality === 'gamer')     return <GamerGame />;
  if (personality === 'technical') return <GamerGame />;
  return <ProfessionalGame />;
}
