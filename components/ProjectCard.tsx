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
          project.techLogo && project.techLogo?.length > 0 && (
            <div className={styles.logoWrapper}>
              {project.techLogo.map((logo, idx) => (
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
        <div className={styles.header}>
        <h3 className={styles.title}>{project.title}</h3>
        {
          project.startDate && (
            <p className={styles.timeline}>
              {project.startDate?.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} –{' '}
              {project.endDate
                ? project.endDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                : 'Present'}
            </p>
          )
        }
        </div>
        <ul className={styles.descriptionList}>
          {
            project.description.map((point, idx) => (
              <li key={idx}>{point}</li>
            ))
          }
        </ul>
      </div>
    </a>
  );
};

export default ProjectCard;
