import React, { useState } from 'react';
import Image from 'next/image';
import { WorkExp } from '@/types';
import { usePersonality } from '@/components/PersonalityContext';
import Modal from '@/components/Modal';
import styles from '@/styles/WorkCard.module.css';
import { format, intervalToDuration } from 'date-fns';

interface WorkCardProps {
  work: WorkExp;
}

const fmtDate = (d: Date | null | undefined) =>
  d ? format(new Date(d), 'MMM yyyy') : 'Present';

const fmtDuration = (start: Date, end: Date | null | undefined) => {
  const { years = 0, months = 0 } = intervalToDuration({ start, end: end ?? new Date() });
  const parts = [];
  if (years) parts.push(`${years} yr${years > 1 ? 's' : ''}`);
  if (months) parts.push(`${months} mo`);
  return parts.join(' ');
};

const xpPercent = (start: Date, end: Date | null | undefined) => {
  const { years = 0, months = 0 } = intervalToDuration({ start, end: end ?? new Date() });
  return Math.min(100, Math.round(((years * 12 + months) / 60) * 100)); // cap at 5 yrs
};

const WorkCard = ({ work }: WorkCardProps) => {
  const { personality } = usePersonality();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const start = new Date(work.startDate);
  const end = work.endDate ? new Date(work.endDate) : null;
  const duration = fmtDuration(start, end);
  const xp = xpPercent(start, end);

  // ── Python code for technical modal ────────────────────────────────────────
  const td = work.technical;
  const pythonCode = [
    `<span class="${styles.pyKw}">class</span> <span class="${styles.pyCls}">${work.company.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}</span>:`,
    `  <span class="${styles.pyStr}">"""`,
    `  Company: ${work.company}`,
    `  """</span>`,
    `  <span class="${styles.pyKw}">def</span> <span class="${styles.pyFn}">${work.jobtitle.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}</span>(`,
    `      <span class="${styles.pyVar}">start</span>=<span class="${styles.pyStr}">"${fmtDate(work.startDate)}"</span>,`,
    `      <span class="${styles.pyVar}">end</span>=<span class="${styles.pyStr}">"${fmtDate(end)}"</span>`,
    `  ):`,
    `    <span class="${styles.pyStr}">"""`,
    `    Duration: ${duration}`,
    `    Overview: ${td.overview}`,
    `    """</span>`,
    ``,
    `    <span class="${styles.pyVar}">description</span> = [`,
    ...td.description.map(l => `      <span class="${styles.pyStr}">"${l.replace(/"/g, '\\"')}"</span>,`),
    `    ]`,
    ``,
    `    <span class="${styles.pyVar}">tech_stack</span> = [${work.techStack.map(t => `<span class="${styles.pyStr}">"${t}"</span>`).join(', ')}]`,
  ].join('\n');

  // ── Card renders ────────────────────────────────────────────────────────────

  if (personality === 'gamer') {
    const g = work.gamer;
    return (
      <>
        <div className={styles.gamerCard}>
          <div className={styles.gamerBadge}>🏆 ACHIEVEMENT UNLOCKED</div>
          <div className={styles.gamerBody}>
            <p className={styles.gamerTitle}>{g.title}</p>
            <p className={styles.gamerDates}>
              {fmtDate(work.startDate)} → {fmtDate(end)}
            </p>
            <div className={styles.xpRow}>
              <span className={styles.xpLabel}>XP</span>
              <div className={styles.xpTrack}>
                <div className={styles.xpFill} style={{ width: `${xp}%` }} />
              </div>
              <span className={styles.xpValue}>{duration}</span>
            </div>
            <p className={styles.gamerOverview}>{g.overview}</p>
            <div className={styles.gamerCardFooter}>
              <button className={styles.gamerBtn} onClick={() => setIsModalOpen(true)}>
                Open career.log
              </button>
            </div>
          </div>
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <section className={styles.gamerModalBar}>
            <span className={styles.gamerModalLabel}>🎮 {g.title}</span>
            <div className={styles.windowButtons}>
              <span className={styles.minimize} onClick={() => setIsModalOpen(false)} />
              <span className={styles.maximize} />
              <span className={styles.close} onClick={() => setIsModalOpen(false)} />
            </div>
          </section>
          <div className={styles.gamerModalBody}>
            <p className={styles.gmCompany}>{work.company}</p>
            <p className={styles.gmDates}>{fmtDate(work.startDate)} → {fmtDate(end)} · {duration}</p>
            <div className={styles.xpRow} style={{ margin: '0.75rem 0 1.25rem' }}>
              <span className={styles.xpLabel}>XP</span>
              <div className={styles.xpTrack}><div className={styles.xpFill} style={{ width: `${xp}%` }} /></div>
              <span className={styles.xpValue}>{duration}</span>
            </div>
            <p className={styles.gmSectionLabel}>LORE</p>
            <p className={styles.gmOverview}>{g.overview}</p>
            <p className={styles.gmSectionLabel} style={{ marginTop: '1rem' }}>ACHIEVEMENTS</p>
            <ul className={styles.gmList}>
              {g.highlights.map((h, i) => <li key={i}>{h}</li>)}
            </ul>
            <div className={styles.gmFooter}>
              <a href={work.link} target="_blank" rel="noopener noreferrer" className={styles.gamerLink}>
                Visit HQ ↗
              </a>
            </div>
          </div>
        </Modal>
      </>
    );
  }

  if (personality === 'technical') {
    return (
      <>
        <div className={styles.card}>
          <div className={styles.content}>
            {work.techLogo.length > 0 && (
              <div className={styles.logoWrapper}>
                {work.techLogo.map((logo, idx) => (
                  <Image key={idx} src={logo} alt="" width={24} height={24} className={styles.logo} />
                ))}
              </div>
            )}
            <h3 className={styles.companytitle}>{work.company}</h3>
            <h3 className={styles.jobtitle}>{work.jobtitle}</h3>
            <div className={styles.footerRow}>
              <p className={styles.overview}>{work.technical.overview}</p>
              <button className={styles.button} onClick={() => setIsModalOpen(true)}>More Info</button>
            </div>
          </div>
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <section className={styles.titlebar}>
            <a href={work.link} className={styles.link}>experience.py — {work.company}</a>
            <div className={styles.windowButtons}>
              <span className={styles.minimize} onClick={() => setIsModalOpen(false)} />
              <span className={styles.maximize} />
              <span className={styles.close} onClick={() => setIsModalOpen(false)} />
            </div>
          </section>
          <pre className={styles.codeBlock}>
            <code dangerouslySetInnerHTML={{ __html: pythonCode }} />
          </pre>
        </Modal>
      </>
    );
  }

  // ── Professional (default) ──────────────────────────────────────────────────
  const p = work.professional;
  return (
    <>
      <div className={styles.proCard}>
        <div className={styles.proCardInner}>
          <div className={styles.proCardHeader}>
            <div>
              <h3 className={styles.proCompanyName}>{work.company}</h3>
              <p className={styles.proJobRole}>{work.jobtitle}</p>
            </div>
            {work.techLogo.length > 0 && (
              <div className={styles.logoWrapper}>
                {work.techLogo.map((logo, idx) => (
                  <Image key={idx} src={logo} alt="" width={22} height={22} className={styles.logo} />
                ))}
              </div>
            )}
          </div>
          <p className={styles.proDatesInline}>
            {fmtDate(work.startDate)} – {fmtDate(end)}
            {duration && <span className={styles.proDurationPill}>{duration}</span>}
          </p>
          <hr className={styles.proRule} />
          <p className={styles.proOverviewText}>{p.overview}</p>
          <div className={styles.proTagRow}>
            {work.techStack.map((t, i) => <span key={i} className={styles.proTag}>{t}</span>)}
          </div>
          <div className={styles.proCardFooter}>
            <button className={styles.button} onClick={() => setIsModalOpen(true)}>View Details</button>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <section className={styles.titlebar}>
          <span className={styles.proModalTitle}>{work.company}</span>
          <div className={styles.windowButtons}>
            <span className={styles.minimize} onClick={() => setIsModalOpen(false)} />
            <span className={styles.maximize} />
            <span className={styles.close} onClick={() => setIsModalOpen(false)} />
          </div>
        </section>
        <div className={styles.proBody}>
          <div className={styles.proHeader}>
            <h2 className={styles.proCompany}>{work.company}</h2>
            <p className={styles.proJobTitle}>{work.jobtitle}</p>
            <p className={styles.proDates}>
              {fmtDate(work.startDate)} – {fmtDate(end)}
              {duration && <span className={styles.proDuration}> · {duration}</span>}
            </p>
          </div>
          <hr className={styles.proDivider} />
          <div className={styles.proSection}>
            <h3 className={styles.proSectionLabel}>Overview</h3>
            <p className={styles.proText}>{p.overview}</p>
          </div>
          <div className={styles.proSection}>
            <h3 className={styles.proSectionLabel}>Highlights</h3>
            <ul className={styles.proList}>
              {p.description.map((d, i) => <li key={i}>{d}</li>)}
            </ul>
          </div>
          <div className={styles.proSection}>
            <h3 className={styles.proSectionLabel}>Tech Stack</h3>
            <div className={styles.proTags}>
              {work.techStack.map((t, i) => <span key={i} className={styles.proTag}>{t}</span>)}
            </div>
          </div>
          <div className={styles.proFooter}>
            <a href={work.link} target="_blank" rel="noopener noreferrer" className={styles.proLink}>
              View Company ↗
            </a>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default WorkCard;
