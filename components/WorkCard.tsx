import React, { useState } from 'react';
import { WorkExp } from '@/types';
import styles from '@/styles/WorkCard.module.css';

interface WorkCardProps {
  work: WorkExp;
}

const WorkCard = ({ work }: WorkCardProps) => {
  const [open, setOpen] = useState(false);

  // Format the job details as a Python-like string
  const pythonCode = `<span class="${styles.pythonKeyword}">class</span> <span class="${styles.pythonClassName}">${work.company.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}</span>:
    <span class="${styles.pythonString}">\"\"\"
    Company: ${work.company}
    \"\"\"</span>
    <span class="${styles.pythonKeyword}">def</span> <span class="${styles.pythonFunctionName}">${work.jobtitle.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}</span>(${work.startDate?.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}, ${work.endDate
    ? work.endDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).replace(/[^a-zA-Z0-9]/g, '_').toLowerCase(): 'present'}):
        <span class="${styles.pythonString}">\"\"\"
        Position: ${work.jobtitle}
        Duration: ${work.startDate?.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - ${work.endDate
    ? work.endDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }): 'Present'}
        Overview: ${work.overview}
        \"\"\"</span>

        <span class="${styles.pythonVariable}">description</span> = [
${work.description.map(line => `            <span class="${styles.pythonString}">"${line.replace(/"/g, '\\"')}"</span>,`).join('\n') || '            # No details provided'}
        ]

        <span class="${styles.pythonVariable}">technologies</span> = [
${work.techStack.map(([tech, logo]) => { // Destructure tech and logo
            const logoDisplay = logo
                ? `<Image src="${logo}" alt="${tech} Logo" width="24" height="24" style="display: inline-block; vertical-align: middle; margin-right: 8px;" />`
                : '';
            return `            <span class="${styles.pythonString}">"${tech.replace(/"/g, '\\"')}"</span>${logoDisplay},`;
        }).join('\n') || '            # No tech stack listed'
}
        ]
`;

  return (
    <>
    <a
      //href={work.link}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.card}
    >
      <div className={styles.content}>
        <h3 className={styles.companytitle}>{work.company}</h3>
        <h3 className={styles.jobtitle}>{work.jobtitle}</h3>
        <div className={styles.footerRow}>
        <p className={styles.overview}>{work.overview}</p>
        <button className={styles.button} onClick={() => setOpen(true)}>More Info</button>
        </div>
      </div>
    </a>

    {open && (
        <div className={styles.modalOverlay} onClick={() => setOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <pre className={styles.codeBlock}>
            <code dangerouslySetInnerHTML={{ __html: pythonCode }} />
            </pre>
            <button className={styles.closeButton} onClick={() => setOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
};

export default WorkCard;

/*
  <h2>{work.jobtitle} @ {work.company}</h2>
  <p>{work.description}</p> {/* Assuming `work.details` contains long description }
        {
        work.techLogo && work.techLogo?.length > 0 && (
          <div className={styles.logoWrapper} >
            {work.techLogo.map((logo, idx) => (
              <Image
                key={idx}
                src={logo}
                alt={`${work.company} logo ${idx + 1}`}
                width={24}
                height={24}
                className={styles.logo}
              />
            ))}
          </div>
        )
        }
*/
