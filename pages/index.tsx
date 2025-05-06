import Link from 'next/link';
import { VscArrowRight } from 'react-icons/vsc';

import styles from '@/styles/HomePage.module.css';

export default function HomePage() {
  return (
    <div className={styles.heroLayout}>
      <div className={styles.container}>
        <div className={styles.infoSection}>
          <h1 className={styles.developerName}>
            Dhrumil <span className={styles.accentText}>Shukla</span>
          </h1>

          <div className={styles.developerRole}>Software Engineer</div>

          <p className={styles.bio}>
          Welcome! Here, you&apos;ll find a collection of projects I&apos;ve crafted, 
          from dynamic game engines to intuitive websites and mobile apps. With experience at 
          industry-leading teams, including NBA 2K and Lego 2K Drive, I&apos;m dedicated to delivering high-quality, 
          user-centric solutions in the gaming world and beyond.
          </p>

          <div className={styles.actionLinks}>
            <Link href="/projects" className={styles.primaryLink}>
              View Projects <VscArrowRight />
            </Link>
          </div>
        </div>
      </div>

      <div className={styles.decorElements}>
        <div className={styles.codeFlare}></div>
        <div className={styles.gridLines}></div>
        <div className={styles.codeBlock1}>{'{'}</div>
        <div className={styles.codeBlock2}>{'}'}</div>
        <div className={styles.codeBlock3}>{'<>'}</div>
        <div className={styles.codeBlock4}>{'/>'}</div>
        <div className={styles.orb1}></div>
        <div className={styles.orb2}></div>
        <div className={styles.orb3}></div>
        <div className={styles.codeSymbol1}>{'()'}</div>
        <div className={styles.codeSymbol2}>{'[]'}</div>
        <div className={styles.codeSymbol3}>{'=>'}</div>
        <div className={styles.dotPattern}></div>
        <div className={styles.mobileAccent}></div>
      </div>
    </div>
  );
}

export async function getStaticProps() {
  return {
    props: { title: 'Home' },
  };
}
