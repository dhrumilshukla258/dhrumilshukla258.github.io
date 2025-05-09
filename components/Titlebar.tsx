import Image from 'next/image';
import { usePersonality } from '@/components/PersonalityContext';
import styles from '@/styles/Titlebar.module.css';

const Titlebar = () => {
  const { personality } = usePersonality();
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
      <div style={{ width: '24px', height: '24px', marginRight: '8px', position: 'relative'}}>
          <Image
            src={'/personality/' + personality + '.png'}
            alt="Personality"
            fill
            className="image-contain"
          />
        </div>
      <p>
        Dhrumil Shukla - Visual Studio Code
      </p>
      <div className={styles.windowButtons}>
        <span className={styles.minimize}></span>
        <span className={styles.maximize}></span>
        <span className={styles.close}></span>
      </div>
    </section>
  );
};

export default Titlebar;
