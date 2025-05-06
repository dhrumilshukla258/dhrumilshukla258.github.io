import Image from 'next/image';
import styles from '@/styles/ThemeInfo.module.css';
import { usePersonality } from '@/components/PersonalityContext';


interface PersonalityInfoProps {
  imagepath: string;
  personality: 'professional' | 'playful' | 'technical' | 'casual' | 'narrative';
  buttontext: string;
}

const PersonalityInfo = ({ imagepath, personality, buttontext }: PersonalityInfoProps) => {
 
  const { personality: currentPersonality, setPersonality } = usePersonality();
  
  return (
    <div className={styles.container}>
      <div className={styles.imageWrapper}>
        <Image
          src={imagepath}
          alt={buttontext}
          width={100}
          height={113.78}
          className={styles.themeImage}
        />
      </div>
      <div className={styles.info}>
        <button onClick={() => setPersonality(personality)}>{buttontext}</button>
      </div>
    </div>
  );
};

export default PersonalityInfo;
