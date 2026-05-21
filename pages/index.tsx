import Link from 'next/link';
import { VscArrowRight } from 'react-icons/vsc';
import { usePersonality } from '@/components/PersonalityContext';
import styles from '@/styles/HomePage.module.css';

export default function HomePage() {
  const { personality } = usePersonality();

  const renderHero = () => {
    if (personality === 'technical') {
      return (
        <div className={styles.infoSection}>
          <h1 className={styles.developerName}>
            Dhrumil <span className={styles.accentText}>Shukla</span>
          </h1>
          <div className={styles.techComment}>{'// software_engineer.cpp'}</div>
          <pre className={styles.techCodeBio}>{`/* Visual Concepts Entertainment — C++ Game Engineer
 * Shipped: NBA 2K Series · LEGO 2K Drive
 * Focus:   Gameplay Systems · UI/HUD · Shaders · Profiling
 * Stack:   C++ · Python · TypeScript · Perforce · Git
 * Status:  ACTIVE  [Oct 2020 → present]
 */`}</pre>
          <div className={styles.actionLinks}>
            <Link href="/projects" className={styles.primaryLink}>
              {'./projects.cpp'} <VscArrowRight />
            </Link>
            <Link href="/work" className={styles.techLink}>
              {'./experience.py'} <VscArrowRight />
            </Link>
          </div>
        </div>
      );
    }

    if (personality === 'gamer') {
      return (
        <div className={styles.infoSection}>
          <h1 className={styles.developerName}>
            Dhrumil <span className={styles.accentText}>Shukla</span>
          </h1>
          <div className={styles.gamerStatsBar}>
            <span>CLASS: Software Engineer</span>
            <span className={styles.gamerStatSep}>·</span>
            <span>LVL: 5+</span>
            <span className={styles.gamerStatSep}>·</span>
            <span>FACTION: 2K Games</span>
          </div>
          <p className={styles.bio}>
            Quest-hardened game dev who shipped NBA 2K Series and LEGO 2K Drive. Specializes in
            gameplay systems, UI/HUD, and performance sorcery. Currently on the main storyline at
            Visual Concepts — no plans to abandon this questline anytime soon.
          </p>
          <div className={styles.actionLinks}>
            <Link href="/projects" className={styles.primaryLink}>
              🏆 Achievement Board <VscArrowRight />
            </Link>
            <Link href="/work" className={styles.gamerSecondaryLink}>
              📋 Quest Log <VscArrowRight />
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.infoSection}>
        <h1 className={styles.developerName}>
          Dhrumil <span className={styles.accentText}>Shukla</span>
        </h1>
        <div className={styles.developerRole}>Software Engineer</div>
        <p className={styles.bio}>
          Software Engineer at Visual Concepts / 2K Games with 5+ years building gameplay systems,
          UI/HUD, and tools for the NBA 2K series. Passionate about clean code, team collaboration,
          and shipping great player experiences.
        </p>
        <div className={styles.actionLinks}>
          <Link href="/projects" className={styles.primaryLink}>
            View Projects <VscArrowRight />
          </Link>
          <Link href="/work" className={styles.secondaryLink}>
            Work Experience <VscArrowRight />
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.heroLayout}>
      <div className={styles.container}>
        {renderHero()}
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
