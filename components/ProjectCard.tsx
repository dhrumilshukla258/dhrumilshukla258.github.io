import Image from 'next/image';

import { Project } from '@/types';

import styles from '@/styles/ProjectCard.module.css';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  return (
    <a
      href={project.link}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.card}
    >
      <div className={styles.content}>
        {
        project.logos?.length > 0 && (
          <div className={styles.logoWrapper}>
            {project.logos.map((logo, idx) => (
              <Image
                key={idx}
                src={logo}
                alt={`${project.title} logo ${idx + 1}`}
                width={24}
                height={24}
                className={styles.logo}
              />
            ))}
          </div>
        )
        }
        <h3 className={styles.title}>{project.title}</h3>
        <p className={styles.description}>{project.description}</p>
      </div>
    </a>
  );
};

export default ProjectCard;
