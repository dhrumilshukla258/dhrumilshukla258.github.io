import Image from 'next/image';
import styles from '@/styles/ThemeInfo.module.css';

interface PersonalityInfoProps {
  imagepath: string;
  personality: string;
  buttontext: string;
}

const PersonalityInfo = ({ imagepath, personality, buttontext }: PersonalityInfoProps) => {
  const setPersonality = (personality: string) => {
    document.documentElement.setAttribute('data-personality', personality);
    localStorage.setItem('personality', personality);
  };

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
