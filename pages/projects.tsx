import ProjectCard from '@/components/ProjectCard';
import { projects, projectPageHeaders } from '@/data/projects';
import { usePersonality } from '@/components/PersonalityContext';
import styles from '@/styles/ProjectsPage.module.css';

const ProjectsPage = () => {
  const { personality } = usePersonality();
  const header = projectPageHeaders[personality];

  return (
    <div className={styles.layout}>
      <h1 className={`${styles.pageTitle} ${personality === 'gamer' ? styles.gamerPageTitle : ''}`}>
        {header.title}
      </h1>
      <p className={styles.pageSubtitle}>{header.subtitle}</p>
      <div className={`${styles.container} ${personality === 'gamer' ? styles.gamerGrid : ''}`}>
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </div>
  );
};

export async function getStaticProps() {
  return { props: { title: 'Projects' } };
}

export default ProjectsPage;
