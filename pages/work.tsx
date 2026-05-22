import WorkCard from '@/components/WorkCard';
import { workexp } from '@/data/workexp';
import { usePersonality } from '@/components/PersonalityContext';
import styles from '@/styles/WorkPage.module.css';

const pageHeaders = {
  professional: {
    title: 'Work Experience',
    subtitle: 'A record of my professional journey across game development, research, and data science.',
  },
  technical: {
    title: 'experience.py',
    subtitle: '# 5+ years of C++ game engineering, ML research, and data pipelines across industry and academia.',
  },
  gamer: {
    title: '📋 career.log',
    subtitle: 'ACTIVE QUESTS: 1  ·  COMPLETED: 4  ·  TOTAL XP: 5+ years  ·  CURRENT FACTION: Visual Concepts / 2K Games',
  },
};

const WorkPage = () => {
  const { personality } = usePersonality();
  const header = pageHeaders[personality];

  return (
    <div className={styles.layout}>
      <h1 className={`${styles.pageTitle} ${personality === 'gamer' ? styles.gamerTitle : ''}`}>
        {header.title}
      </h1>
      <p className={styles.pageSubtitle}>{header.subtitle}</p>
      <div className={styles.container}>
        {workexp.map((work) => (
          <WorkCard key={work.slug} work={work} />
        ))}
      </div>
    </div>
  );
};

export async function getStaticProps() {
  return { props: { title: 'Experience' } };
}

export default WorkPage;
