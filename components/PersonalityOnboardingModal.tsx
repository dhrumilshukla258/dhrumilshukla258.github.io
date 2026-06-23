import { useState, useEffect } from 'react';
import Image from 'next/image';
import { usePersonality, PersonalityType } from '@/components/PersonalityContext';
import { usePageTransition } from '@/components/PageTransition';
import styles from '@/styles/PersonalityOnboardingModal.module.css';

const personalities: { type: PersonalityType; label: string; tagline: string; icon: string }[] = [
  {
    type: 'professional',
    label: 'Professional',
    tagline: "Clean, formal, résumé-ready. See my experience through a recruiter's lens.",
    icon: '/personality/professional.png',
  },
  {
    type: 'gamer',
    label: 'Gamer',
    tagline: 'XP, achievements, and side quests. See my story the way I actually live it.',
    icon: '/personality/gamer.png',
  },
  {
    type: 'technical',
    label: 'Technical',
    tagline: 'Raw specs, stack decisions, and implementation depth — for engineers.',
    icon: '/personality/technical.png',
  },
];

const PersonalityOnboardingModal = () => {
  const { setPersonality } = usePersonality();
  const { trigger: triggerTransition } = usePageTransition();
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const seen = localStorage.getItem('hasSeenPersonality');
      if (!seen) {
        setVisible(true);
        const t = setTimeout(() => setActive(true), 50);
        return () => clearTimeout(t);
      }
    }
  }, []);

  const pick = (type: PersonalityType) => {
    localStorage.setItem('hasSeenPersonality', 'true');
    setActive(false);
    setTimeout(() => {
      setVisible(false);
      triggerTransition(type, () => setPersonality(type));
    }, 320);
  };

  if (!visible) return null;

  return (
    <div className={`${styles.overlay} ${active ? styles.overlayActive : ''}`}>
      <div className={`${styles.modal} ${active ? styles.modalActive : ''}`}>
        <p className={styles.eyebrow}>welcome to my portfolio</p>
        <h2 className={styles.heading}>How do you want to see me?</h2>
        <p className={styles.sub}>Pick a lens — you can always switch it from the top bar.</p>
        <div className={styles.cards}>
          {personalities.map(({ type, label, tagline, icon }) => (
            <button key={type} className={styles.card} onClick={() => pick(type)}>
              <div className={styles.iconWrap}>
                <Image src={icon} alt={label} fill className={styles.icon} />
              </div>
              <div className={styles.cardText}>
                <span className={styles.cardLabel}>{label}</span>
                <span className={styles.cardTagline}>{tagline}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PersonalityOnboardingModal;
