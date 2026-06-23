import Image from 'next/image';
import { usePersonality, PersonalityType } from '@/components/PersonalityContext';
import { usePersonalityAnimation, ANIM_PERSONALITY_ORDER } from '@/components/PersonalityAnimationContext';
import { usePageTransition } from '@/components/PageTransition';
import styles from '@/styles/Titlebar.module.css';

const personalities: { type: PersonalityType; label: string }[] = [
  { type: 'professional', label: 'Professional' },
  { type: 'gamer', label: 'Gamer' },
  { type: 'technical', label: 'Technical' },
];

const Titlebar = () => {
  const { personality, setPersonality } = usePersonality();
  const { pillIconRefs, triggerSameClick, shaking } = usePersonalityAnimation();
  const { trigger: triggerTransition, isActive: isTransitioning } = usePageTransition();

  return (
    <section className={styles.titlebar}>
      <Image
        src="/logos/vscode_icon.svg"
        alt="VSCode Icon"
        height={15}
        width={15}
        className={styles.icon}
      />
      <div className={styles.items}>
        <p>File</p>
        <p>Edit</p>
        <p>View</p>
        <p>Go</p>
        <p>Run</p>
        <p>Terminal</p>
        <p>Help</p>
      </div>

      <div className={`${styles.personalityPill} ${shaking ? styles.pillShake : ''}`}>
        {personalities.map(({ type, label }) => {
          const animIndex = ANIM_PERSONALITY_ORDER.indexOf(type);
          return (
            <button
              key={type}
              className={`${styles.pillOption} ${personality === type ? styles.pillActive : ''}`}
              onClick={() => {
                if (isTransitioning) return;
                if (personality === type) { triggerSameClick(); return; }
                triggerTransition(type, () => setPersonality(type));
              }}
            >
              <span
                className={`${styles.pillIcon} ${personality === type ? styles.pillIconActive : ''}`}
                ref={(el) => { pillIconRefs.current[animIndex] = el; }}
              >
                <Image
                  src={`/personality/${type}.png`}
                  alt={label}
                  fill
                  className="image-contain"
                />
              </span>
              <span className={styles.pillLabel}>{label}</span>
            </button>
          );
        })}
      </div>

      <div className={styles.windowButtons}>
        <span className={styles.minimize}></span>
        <span className={styles.maximize}></span>
        <span className={styles.close}></span>
      </div>
    </section>
  );
};

export default Titlebar;
