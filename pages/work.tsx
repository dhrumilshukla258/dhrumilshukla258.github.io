import React, { useState } from 'react';
import { format, intervalToDuration } from 'date-fns';
import { workexp } from '@/data/workexp';
import { WorkExp } from '@/types';
import { usePersonality } from '@/components/PersonalityContext';
import styles from '@/styles/WorkTimeline.module.css';

// ── helpers ────────────────────────────────────────────────────────────────────

const fmtDate = (d: Date | null | undefined) =>
  d ? format(new Date(d), 'MMM yyyy') : 'Present';

const fmtDuration = (start: Date, end: Date | null | undefined) => {
  const { years = 0, months = 0 } = intervalToDuration({ start, end: end ?? new Date() });
  const parts: string[] = [];
  if (years)  parts.push(`${years} yr${years > 1 ? 's' : ''}`);
  if (months) parts.push(`${months} mo`);
  return parts.join(' ');
};

const xpPercent = (start: Date, end: Date | null | undefined) => {
  const { years = 0, months = 0 } = intervalToDuration({ start, end: end ?? new Date() });
  return Math.min(100, Math.round(((years * 12 + months) / 60) * 100));
};

// ── group entries by year ──────────────────────────────────────────────────────

const utcYear = (d: Date) => new Date(d).getUTCFullYear();

function buildYearGroups(entries: WorkExp[]) {
  const sorted = [...entries].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  const map = new Map<number, WorkExp[]>();
  for (const e of sorted) {
    const y = utcYear(e.startDate);
    if (!map.has(y)) map.set(y, []);
    map.get(y)!.push(e);
  }

  return Array.from(map.entries()).sort(([a], [b]) => b - a);
}

// ── personality page headers ───────────────────────────────────────────────────

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

// ── single timeline entry ──────────────────────────────────────────────────────

const TimelineEntry = ({ work, isOpen, onToggle, personality }: {
  work: WorkExp;
  isOpen: boolean;
  onToggle: () => void;
  personality: 'professional' | 'technical' | 'gamer';
}) => {
  const start  = new Date(work.startDate);
  const end    = work.endDate ? new Date(work.endDate) : null;
  const isActive = !end;
  const duration = fmtDuration(start, end);
  const xp = xpPercent(start, end);

  const dateRange = `${fmtDate(start)} – ${fmtDate(end)}`;

  // ── gamer ──────────────────────────────────────────────────────────────────
  if (personality === 'gamer') {
    const g = work.gamer;
    return (
      <div className={styles.entry}>
        <div
          className={`${styles.dot} ${styles.dotGamer} ${isActive ? styles.dotActive : ''}`}
          onClick={onToggle}
        />
        <div
          className={`${styles.card} ${styles.cardGamer} ${isOpen ? styles.cardExpanded : ''}`}
          onClick={onToggle}
        >
          <div className={styles.gamerBadge}>🏆 ACHIEVEMENT UNLOCKED</div>
          <div className={styles.cardHeader}>
            <div className={styles.headerLeft}>
              <p className={`${styles.company} ${styles.companyGamer}`}>{g.title}</p>
              <p className={styles.role}>{work.company}</p>
            </div>
            <span className={styles.dates}>{dateRange}</span>
            <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}>▼</span>
          </div>
          <div className={styles.xpRow}>
            <span className={styles.xpLabel}>XP</span>
            <div className={styles.xpTrack}><div className={styles.xpFill} style={{ width: `${xp}%` }} /></div>
            <span className={styles.xpValue}>{duration}</span>
          </div>

          {isOpen && (
            <div className={`${styles.expandBody} ${styles.expandBodyGamer}`} onClick={e => e.stopPropagation()}>
              <p className={styles.overview}>{g.overview}</p>
              <p className={`${styles.sectionLabel} ${styles.sectionLabelGamer}`}>ACHIEVEMENTS</p>
              <ul className={`${styles.list} ${styles.listGamer}`}>
                {g.highlights.map((h, i) => <li key={i}>{h}</li>)}
              </ul>
              <div className={styles.footer}>
                <a href={work.link} target="_blank" rel="noopener noreferrer" className={`${styles.link} ${styles.linkGamer}`}>
                  Visit HQ ↗
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── technical ──────────────────────────────────────────────────────────────
  if (personality === 'technical') {
    const td = work.technical;
    const classSlug = work.company.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const fnSlug    = work.jobtitle.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();

    const pythonLines = [
      `<span class="${styles.pyKw}">class</span> <span class="${styles.pyCls}">${classSlug}</span>:`,
      `  <span class="${styles.pyStr}">"""`,
      `  Company: ${work.company}`,
      `  """</span>`,
      `  <span class="${styles.pyKw}">def</span> <span class="${styles.pyFn}">${fnSlug}</span>(`,
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

    return (
      <div className={styles.entry}>
        <div
          className={`${styles.dot} ${styles.dotTech} ${isActive ? styles.dotActive : ''}`}
          onClick={onToggle}
        />
        <div
          className={`${styles.card} ${styles.cardTech} ${isOpen ? styles.cardExpanded : ''}`}
          onClick={onToggle}
        >
          <div className={styles.techPrefix}>
            {`* ${format(start, 'MMMuuuu').toLowerCase()} `}
            <span className={styles.pyCls}>{classSlug}</span>
          </div>
          <div className={styles.cardHeader}>
            <div className={styles.headerLeft}>
              <p className={`${styles.company} ${styles.companyTech}`}>{work.company}</p>
              <p className={styles.role}>{work.jobtitle}</p>
            </div>
            <span className={styles.dates}>{dateRange}</span>
            <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}>▼</span>
          </div>

          {isOpen && (
            <div className={`${styles.expandBody} ${styles.expandBodyTech}`} onClick={e => e.stopPropagation()}>
              <pre
                className={styles.codeBlock}
                dangerouslySetInnerHTML={{ __html: pythonLines }}
              />
              <div className={styles.footer}>
                <a href={work.link} target="_blank" rel="noopener noreferrer" className={`${styles.link} ${styles.linkTech}`}>
                  experience.py — {work.company} ↗
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── professional ───────────────────────────────────────────────────────────
  const p = work.professional;
  return (
    <div className={styles.entry}>
      <div
        className={`${styles.dot} ${isActive ? styles.dotActive : ''}`}
        onClick={onToggle}
      />
      <div
        className={`${styles.card} ${isOpen ? styles.cardExpanded : ''}`}
        onClick={onToggle}
      >
        <div className={styles.cardHeader}>
          <div className={styles.headerLeft}>
            <p className={styles.company}>{work.company}</p>
            <p className={styles.role}>{work.jobtitle}</p>
          </div>
          <span className={styles.dates}>{dateRange}</span>
          <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}>▼</span>
        </div>

        {isOpen && (
          <div className={styles.expandBody} onClick={e => e.stopPropagation()}>
            <p className={styles.overview}>{p.overview}</p>
            <p className={styles.sectionLabel}>Highlights</p>
            <ul className={styles.list}>
              {p.description.map((d, i) => <li key={i}>{d}</li>)}
            </ul>
            <p className={styles.sectionLabel}>Tech Stack</p>
            <div className={styles.tagRow}>
              {work.techStack.map((t, i) => <span key={i} className={styles.tag}>{t}</span>)}
            </div>
            <div className={styles.footer}>
              <a href={work.link} target="_blank" rel="noopener noreferrer" className={styles.link}>
                View Company ↗
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── page ───────────────────────────────────────────────────────────────────────

const WorkPage = () => {
  const { personality } = usePersonality();
  const header = pageHeaders[personality];
  const yearGroups = buildYearGroups(workexp);
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  const toggle = (slug: string) =>
    setOpenSlug(prev => (prev === slug ? null : slug));

  return (
    <div className={styles.layout}>
      <h1 className={`${styles.pageTitle} ${personality === 'gamer' ? styles.gamerTitle : ''}`}>
        {header.title}
      </h1>
      <p className={styles.pageSubtitle}>{header.subtitle}</p>

      <div className={styles.timeline}>
        {yearGroups.map(([year, entries]) => (
          <React.Fragment key={year}>
            <div className={styles.yearMarker}>
              <span className={styles.yearLabel}>{year}</span>
              <span className={styles.yearTick} />
            </div>
            {entries.map(work => (
              <TimelineEntry
                key={work.slug}
                work={work}
                isOpen={openSlug === work.slug}
                onToggle={() => toggle(work.slug)}
                personality={personality}
              />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export async function getStaticProps() {
  return { props: { title: 'Experience' } };
}

export default WorkPage;