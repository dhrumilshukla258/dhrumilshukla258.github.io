import React, { useState } from 'react';
import Image from 'next/image';
import { WorkExp } from '@/types';
import styles from '@/styles/WorkCard.module.css';
import Modal from '@/components/Modal'
interface WorkCardProps {
  work: WorkExp;
}
import { format, intervalToDuration, Duration} from 'date-fns';


const WorkCard = ({ work }: WorkCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  
const formatDate = (date: Date | null | undefined): string => {
  if (!date) return '';
  try {
    return format(new Date(date), 'MMM yyyy'); // Example format: "May 2025"
  } catch (error) {
    console.error("Error formatting date:", error);
    return '';
  }
};

function formatDurationString(duration: Duration): string {
  const parts: string[] = [];

  if (duration.years) {
    parts.push(`${duration.years} year${duration.years > 1 ? 's' : ''}`);
  }
  if (duration.months) {
    parts.push(`${duration.months} month${duration.months > 1 ? 's' : ''}`);
  }
  if (duration.days) {
    parts.push(`${duration.days} day${duration.days > 1 ? 's' : ''}`);
  }
  
  return parts.join(', ');
}

const start = new Date(work.startDate);
const end = work.endDate? new Date(work.endDate) : new Date();
const duration = intervalToDuration({start, end});
const formattedDuration = formatDurationString(duration);//`${duration.years}y ${duration.months}m`;

// Format the job details as a Python-like string
const pythonCode = `<div style="margin-left: ${0}em;"><span class="${styles.pythonKeyword}">class</span> <span class="${styles.pythonClassName}">${work.company.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}</span>:</div>  <span class="${styles.pythonString}">\"\"\"
  Company: ${work.company}
  \"\"\"</span>
  <span class="${styles.pythonKeyword}">def</span> <span class="${styles.pythonFunctionName}">${work.jobtitle.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}</span>(${formatDate(work.startDate)?.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}, ${work.endDate ? formatDate(work.endDate)?.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() : 'present'}):
    <span class="${styles.pythonString}">\"\"\"
    Position: ${work.jobtitle}
    Duration: ${formattedDuration}<div style="margin-left: ${2.2}em;">Overview: ${work.overview.split('\n')[0]}</div>    \"\"\"</span>

    <span class="${styles.pythonVariable}">description</span> = [${work.description.map((line) => {
  const indentLevel = 3; // Define your desired indent level (in spaces)
  const indentedLine = `<div style="margin-left: ${indentLevel}em;"><span class="${styles.pythonString}"> ~ ${line.replace(/"/g, '\\"')}</span>,</div>`;
  return indentedLine;
}).join('\n') || '    # No details provided'}      ]

    <div style="margin-left: ${2}em;"><span class="${styles.pythonVariable}">tech_stack</span> = [${work.techStack.map((tech) => { // Destructure tech and logo
        return `<span class="${styles.pythonString}">${tech.replace(/"/g, '\\"')}</span>, `;
      }).join('') || '            # No tech stack listed'}]
`;

  return (
    <>
    <div
      //href={work.link}
      //target="_blank"
      //rel="noopener noreferrer"
      className={styles.card}
    >
      <div className={styles.content}>
        <h3 className={styles.companytitle}>{work.company}</h3>
        <h3 className={styles.jobtitle}>{work.jobtitle}</h3>
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
        <div className={styles.footerRow}>
        <p className={styles.overview}>{work.overview}</p>
        <button className={styles.button} onClick={openModal}>More Info</button>
        </div>
      </div>
    </div>

    <Modal isOpen={isModalOpen} onClose={closeModal}>
      <section className={styles.titlebar}>
        <a href={work.link} className={styles.link}>{work.link}</a>
        <div className={styles.windowButtons}>
          <span className={styles.minimize} onClick={closeModal}></span>
          <span className={styles.maximize}></span>
          <span className={styles.close} onClick={closeModal}></span>
        </div>
      </section>
      <pre className={styles.codeBlock}>
        <code dangerouslySetInnerHTML={{ __html: pythonCode }} />
      </pre>
    </Modal>
    </>
  );
};

export default WorkCard;