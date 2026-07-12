import { useState } from 'react';
import Image from 'next/image';
import { Project } from '@/types';
import { usePersonality } from '@/components/context/PersonalityContext';
import Modal from '@/components/overlays/Modal';
import styles from './ProjectCard.module.css';

interface ProjectCardProps {
  project: Project;
}

const fmtDate = (d?: Date | null) =>
  d ? d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present';

const toClassName = (s: string) =>
  s.replace(/[^a-zA-Z0-9\s]/g, '').split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');

const GAMER_GRADIENTS: Record<string, string> = {
  'vscode-portfolio':       '135deg, #0c0e1a, #1a1840, #141230',
  'portalcast-server':      '135deg, #0a0e1a, #10203a, #0c1830',
  'home-lab':               '135deg, #0a1420, #0f2535, #0a1828',
  'BellyBlaster':           '135deg, #200808, #3a1010, #1a0808',
  'spend-tracker':          '135deg, #0a0a18, #10152a, #0a0d20',
  'masters-thesis':         '135deg, #0a0a1a, #101a38, #0c1c30',
  'Robotest':               '135deg, #0a0810, #20103a, #180824',
  'minesweeper-solver':     '135deg, #0a1818, #123028, #0a1e20',
  'zombie-hunter':          '135deg, #080808, #101808, #0a1205',
  'school-admission-system':'135deg, #0a0a1a, #1a0a0a, #100808',
};

const ProjectCard = ({ project }: ProjectCardProps) => {
  const { personality } = usePersonality();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const startStr = fmtDate(project.startDate);
  const endStr = fmtDate(project.endDate);
  const gradient = GAMER_GRADIENTS[project.slug] ?? '135deg, #1a1a2e, #302b63';

  // ── C++ code for technical modal ────────────────────────────────────────────
  const td = project.technical;
  const cppCode = [
    `<span class="${styles.cppComment}">// projects.cpp — ${td.title}</span>`,
    ``,
    ...(td.architectureDiagram ? [
      `<span class="${styles.cppComment}">/*`,
      ` * Architecture:`,
      ...td.architectureDiagram.split('\n').map(l => ` * ${l}`),
      ` */</span>`,
      ``,
    ] : []),
    `<span class="${styles.cppDirective}">#include</span> <span class="${styles.cppString}">&lt;string&gt;</span>`,
    `<span class="${styles.cppDirective}">#include</span> <span class="${styles.cppString}">&lt;vector&gt;</span>`,
    ``,
    `<span class="${styles.cppComment}">/**`,
    ` * @brief  ${td.overview}`,
    ` * @since  ${startStr}`,
    ` * @until  ${endStr}`,
    ` * @link   ${project.link}`,
    ` */</span>`,
    `<span class="${styles.cppKeyword}">class</span> <span class="${styles.cppClassName}">${toClassName(td.title)}</span> {`,
    `<span class="${styles.cppKeyword}">public</span>:`,
    `    <span class="${styles.cppKeyword}">void</span> <span class="${styles.cppFunctionName}">details</span>() {`,
    `        <span class="${styles.cppType}">std::vector</span>&lt;<span class="${styles.cppType}">std::string</span>&gt; <span class="${styles.cppVariable}">description</span> = {`,
    ...td.description.map(l => `            <span class="${styles.cppString}">"${l.replace(/"/g, '\\"')}"</span>,`),
    `        };`,
    `    }`,
    `};`,
  ].join('\n');

  // ── Card renders ────────────────────────────────────────────────────────────

  if (personality === 'gamer') {
    const g = project.gamer;
    return (
      <>
        <div className={styles.gamerCard}>
          <div
            className={styles.gamerBanner}
            style={{ background: `linear-gradient(${gradient})` }}
          >
            <span className={styles.gamerBannerLabel}>{td.title}</span>
          </div>
          <div className={styles.gamerBody}>
            <p className={styles.gamerTitle}>{g.title}</p>
            <p className={styles.gamerOverview}>{g.overview}</p>
            <div className={styles.gamerFooter}>
              <a href={project.link} target="_blank" rel="noopener noreferrer" className={styles.gamerGhLink}>
                GitHub ↗
              </a>
              <button className={styles.gamerBtn} onClick={() => setIsModalOpen(true)}>
                More Info
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
            <p className={styles.gmTitle}>{td.title}</p>
            <p className={styles.gmDates}>{startStr} – {endStr}</p>
            <p className={styles.gmSectionLabel}>MISSION BRIEFING</p>
            <p className={styles.gmOverview}>{g.overview}</p>
            <p className={styles.gmSectionLabel} style={{ marginTop: '1rem' }}>ACHIEVEMENTS</p>
            <ul className={styles.gmList}>
              {g.highlights.map((h, i) => <li key={i}>{h}</li>)}
            </ul>
            <div className={styles.gmFooter}>
              <a href={project.link} target="_blank" rel="noopener noreferrer" className={styles.gamerLink}>
                View on GitHub ↗
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
            {project.techLogo && project.techLogo.length > 0 && (
              <div className={styles.logoWrapper}>
                {project.techLogo.map((logo, idx) => (
                  <Image key={idx} src={logo} alt="" width={24} height={24} className={styles.logo} />
                ))}
              </div>
            )}
            <div className={styles.header}>
              <h3 className={styles.title}>{td.title}</h3>
              {project.startDate && (
                <p className={styles.timeline}>{startStr} – {endStr}</p>
              )}
            </div>
            <ul className={styles.descriptionList}>
              {td.description.slice(0, 2).map((point, idx) => <li key={idx}>{point}</li>)}
            </ul>
            <div className={styles.footerRow}>
              <a href={project.link} target="_blank" rel="noopener noreferrer" className={styles.link}>GitHub</a>
              <button className={styles.button} onClick={() => setIsModalOpen(true)}>More Info</button>
            </div>
          </div>
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <section className={styles.titlebar}>
            <span className={styles.filelabel}>projects.cpp — {td.title}</span>
            <div className={styles.windowButtons}>
              <span className={styles.minimize} onClick={() => setIsModalOpen(false)} />
              <span className={styles.maximize} />
              <span className={styles.close} onClick={() => setIsModalOpen(false)} />
            </div>
          </section>
          <pre className={styles.codeBlock}>
            <code dangerouslySetInnerHTML={{ __html: cppCode }} />
          </pre>
        </Modal>
      </>
    );
  }

  // ── Professional (default) ──────────────────────────────────────────────────
  const p = project.professional;
  return (
    <>
      <div className={styles.proCard}>
        <div className={styles.proCardInner}>
          {project.techLogo && project.techLogo.length > 0 && (
            <div className={styles.logoWrapper}>
              {project.techLogo.map((logo, idx) => (
                <Image key={idx} src={logo} alt="" width={22} height={22} className={styles.logo} />
              ))}
            </div>
          )}
          <div className={styles.proCardHeader}>
            <h3 className={styles.proTitle}>{p.title}</h3>
            {project.startDate && (
              <p className={styles.proDatesInline}>{startStr} – {endStr}</p>
            )}
          </div>
          <hr className={styles.proRule} />
          <p className={styles.proOverviewText}>{p.overview}</p>
          <div className={styles.proCardFooter}>
            <a href={project.link} target="_blank" rel="noopener noreferrer" className={styles.proGhLink}>
              GitHub ↗
            </a>
            <button className={styles.button} onClick={() => setIsModalOpen(true)}>View Details</button>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <section className={styles.titlebar}>
          <span className={styles.proModalTitle}>{p.title}</span>
          <div className={styles.windowButtons}>
            <span className={styles.minimize} onClick={() => setIsModalOpen(false)} />
            <span className={styles.maximize} />
            <span className={styles.close} onClick={() => setIsModalOpen(false)} />
          </div>
        </section>
        <div className={styles.proBody}>
          <div className={styles.proHeader}>
            <h2 className={styles.proTitleModal}>{p.title}</h2>
            {project.startDate && (
              <p className={styles.proDates}>{startStr} – {endStr}</p>
            )}
          </div>
          <hr className={styles.proDivider} />
          {p.overview && (
            <div className={styles.proSection}>
              <h3 className={styles.proSectionLabel}>Overview</h3>
              <p className={styles.proText}>{p.overview}</p>
            </div>
          )}
          <div className={styles.proSection}>
            <h3 className={styles.proSectionLabel}>Highlights</h3>
            <ul className={styles.proList}>
              {p.description.map((d, i) => <li key={i}>{d}</li>)}
            </ul>
          </div>
          <div className={styles.proFooter}>
            <a href={project.link} target="_blank" rel="noopener noreferrer" className={styles.proLink}>
              View on GitHub ↗
            </a>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ProjectCard;
