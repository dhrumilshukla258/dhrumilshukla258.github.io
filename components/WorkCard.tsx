import Image from 'next/image';

import { WorkExp } from '@/types';

import styles from '@/styles/WorkCard.module.css';

interface WorkCardProps {
  work: WorkExp;
}

const WorkCard = ({ work }: WorkCardProps) => {
  return (
    <a
      href={work.link}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.card}
    >
      <div className={styles.content}>
        {
        work.logos && work.logos?.length > 0 && (
          <div className={styles.logoWrapper}>
            {work.logos.map((logo, idx) => (
              <Image
                key={idx}
                src={logo}
                alt={`${work.title} logo ${idx + 1}`}
                width={24}
                height={24}
                className={styles.logo}
              />
            ))}
          </div>
        )
        }
        <h3 className={styles.title}>{work.title}</h3>
        <p className={styles.description}>{work.description}</p>
      </div>
    </a>
  );
};

export default WorkCard;

