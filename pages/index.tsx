import Link from 'next/link';
import { VscArrowRight } from 'react-icons/vsc';
import { usePersonality } from '@/components/context/PersonalityContext';
import { owner, homeLinks } from '@/data/owner';
import styles from './HomePage.module.css';

export default function HomePage() {
  const { personality } = usePersonality();
  const links = homeLinks[personality as keyof typeof homeLinks] ?? homeLinks.professional;

  const renderHero = () => {
    if (personality === 'technical') {
      return (
        <div className={styles.infoSection}>
          <h1 className={styles.developerName}>
            {owner.name.split(' ')[0]} <span className={styles.accentText}>{owner.name.split(' ').slice(1).join(' ')}</span>
          </h1>
          <div className={styles.techComment}>{`// ${owner.title.toLowerCase().replace(/ /g, '_')}.cpp`}</div>
          <pre className={styles.techCodeBio}>{owner.bio.technical}</pre>
          <div className={styles.actionLinks}>
            <Link href={links[0].href} className={styles.primaryLink}>
              {links[0].label} <VscArrowRight />
            </Link>
            <Link href={links[1].href} className={styles.techLink}>
              {links[1].label} <VscArrowRight />
            </Link>
          </div>
        </div>
      );
    }

    if (personality === 'gamer') {
      return (
        <div className={styles.infoSection}>
          <h1 className={styles.developerName}>
            {owner.name.split(' ')[0]} <span className={styles.accentText}>{owner.name.split(' ').slice(1).join(' ')}</span>
          </h1>
          <div className={styles.gamerStatsBar}>
            <span>CLASS: {owner.title}</span>
            <span className={styles.gamerStatSep}>·</span>
            <span>LVL: {owner.yearsExperience}</span>
            <span className={styles.gamerStatSep}>·</span>
            <span>FACTION: {owner.faction}</span>
          </div>
          <p className={styles.bio}>{owner.bio.gamer}</p>
          <div className={styles.actionLinks}>
            <Link href={links[0].href} className={styles.primaryLink}>
              {links[0].label} <VscArrowRight />
            </Link>
            <Link href={links[1].href} className={styles.gamerSecondaryLink}>
              {links[1].label} <VscArrowRight />
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.infoSection}>
        <h1 className={styles.developerName}>
          {owner.name.split(' ')[0]} <span className={styles.accentText}>{owner.name.split(' ').slice(1).join(' ')}</span>
        </h1>
        <div className={styles.developerRole}>{owner.title}</div>
        <p className={styles.bio}>{owner.bio.professional}</p>
        <div className={styles.actionLinks}>
          <Link href={links[0].href} className={styles.primaryLink}>
            {links[0].label} <VscArrowRight />
          </Link>
          <Link href={links[1].href} className={styles.secondaryLink}>
            {links[1].label} <VscArrowRight />
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
    props: {
      title: 'Home',
      description: owner.description,
    },
  };
}
