import WorkCard from '@/components/WorkCard';
import { workexp } from '@/data/workexp';

import styles from '@/styles/WorkPage.module.css';

const WorkPage = () => {
  return (
    <div className={styles.layout}>
      <h1 className={styles.pageTitle}>My Work Exprience</h1>
      <p className={styles.pageSubtitle}>
        Here&apos;s a collection of my recent work.
      </p>
      <div className={styles.container}>
        {workexp.map((work) => (
          <WorkCard key={work.slug} work={work} />
        ))}
      </div>
    </div>
  );
};

export async function getStaticProps() {
  return {
    props: { title: 'Work' },
  };
}

export default WorkPage;
