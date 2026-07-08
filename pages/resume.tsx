import { useEffect, Fragment } from 'react';
import Link from 'next/link';
import { VscAccount, VscTools, VscMortarBoard, VscBook, VscBriefcase, VscFolder } from 'react-icons/vsc';
import { resume } from '@/data/resume';
import styles from './ResumePage.module.css';

const SECTION_ICONS = {
  profile: VscAccount,
  skills: VscTools,
  education: VscMortarBoard,
  publications: VscBook,
  experience: VscBriefcase,
  projects: VscFolder,
} as const;

// Renders *word* as <em>word</em> — the only markup allowed in data/resume.ts bullet/label strings.
const renderBullet = (text: string) =>
  text.split(/(\*[^*]+\*)/g).map((part, i) =>
    part.startsWith('*') && part.endsWith('*')
      ? <em key={i}>{part.slice(1, -1)}</em>
      : <Fragment key={i}>{part}</Fragment>
  );

const SectionTitle = ({ icon: Icon, children }: { icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) => (
  <div className={styles.sectionTitle}>
    <Icon className={styles.sectionIcon} /> {children} <span className={styles.sectionRule} />
  </div>
);

const ResumePage = () => {
  useEffect(() => {
    document.documentElement.classList.add('resumeMode');
    document.body.classList.add('resumeMode');
    return () => {
      document.documentElement.classList.remove('resumeMode');
      document.body.classList.remove('resumeMode');
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => window.print(), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <Link href="/contact" className={styles.backLink}>← Back to portfolio</Link>
        <button className={styles.printButton} onClick={() => window.print()}>
          Print / Save as PDF
        </button>
      </div>

      <div className={styles.sheet}>
        <div className={styles.nameRow}>
          <span className={styles.name}>{resume.name}</span>
          <span className={styles.role}>{resume.role}</span>
        </div>

        <div className={styles.contactRow}>
          {resume.contacts.slice(0, 4).map((c, i) => (
            <div className={styles.contactItem} key={i}>
              <span className={styles.iconCircle}>{c.icon}</span>
              {c.href ? <a href={c.href} className={styles.inlineLink}>{c.label}</a> : c.label}
            </div>
          ))}
        </div>
        <div className={styles.contactRow} style={{ marginTop: 4 }}>
          {resume.contacts.slice(4).map((c, i) => (
            <div className={styles.contactItem} key={i}>
              <span className={styles.iconCircle}>{c.icon}</span>
              {c.href ? <a href={c.href} target="_blank" rel="noopener noreferrer" className={styles.inlineLink}>{c.label}</a> : c.label}
            </div>
          ))}
        </div>

        <hr className={styles.headRule} />

        <div className={styles.columns}>
          <div className={styles.colLeft}>

            <div className={styles.section}>
              <SectionTitle icon={SECTION_ICONS.profile}>Profile</SectionTitle>
              <p className={styles.profileText}>{resume.profile}</p>
            </div>

            <div className={styles.section}>
              <SectionTitle icon={SECTION_ICONS.skills}>Skills</SectionTitle>
              {resume.skills.map(group => (
                <div className={styles.skillGroup} key={group.label}>
                  <h4>{group.label}</h4>
                  <p>{group.items}</p>
                </div>
              ))}
            </div>

            <div className={styles.section}>
              <SectionTitle icon={SECTION_ICONS.education}>Education</SectionTitle>
              {resume.education.map(e => (
                <div className={styles.eduEntry} key={e.school}>
                  <div className={styles.degree}>{e.degree}</div>
                  <div className={styles.school}>{e.school}</div>
                  <div className={styles.dates}>{e.dates}</div>
                </div>
              ))}
            </div>

            <div className={styles.section}>
              <SectionTitle icon={SECTION_ICONS.publications}>Publications</SectionTitle>
              {resume.publications.map(pub => (
                <div className={styles.pubEntry} key={pub.title}>
                  <div className={styles.pubTitle}>{pub.title}</div>
                  <div className={styles.pubDate}>{pub.date}</div>
                  <div className={styles.pubAuthors}>{pub.authors}</div>
                  <div className={styles.pubTech}>
                    <strong>Technologies</strong>: {pub.technologies}
                  </div>
                </div>
              ))}
            </div>

          </div>

          <div className={styles.colRight}>

            <div className={styles.section}>
              <SectionTitle icon={SECTION_ICONS.experience}>Work Experience</SectionTitle>
              {resume.experience.map(job => (
                <Fragment key={job.company}>
                  <div className={styles.jobHeader}>
                    <span className={styles.jobTitle}>{job.title}</span>{' '}
                    <span className={styles.jobCompany}>
                      {job.companyHref
                        ? <a href={job.companyHref} target="_blank" rel="noopener noreferrer" className={styles.inlineLink}>{job.company}</a>
                        : job.company}
                    </span>
                  </div>
                  <div className={styles.jobMeta}>{job.dates}</div>
                  <ul>
                    {job.bullets.map((b, i) => <li key={i}>{renderBullet(b)}</li>)}
                    {job.subGroups?.map(group => (
                      <li key={group.label}>
                        {renderBullet(group.label)}
                        <ul>
                          {group.bullets.map((b, i) => <li key={i}>{renderBullet(b)}</li>)}
                        </ul>
                      </li>
                    ))}
                  </ul>
                </Fragment>
              ))}
            </div>

            <div className={styles.section}>
              <SectionTitle icon={SECTION_ICONS.projects}>Projects</SectionTitle>
              {resume.projects.map(proj => (
                <Fragment key={proj.title}>
                  <div className={styles.projTitle}>
                    {proj.href
                      ? <a href={proj.href} target="_blank" rel="noopener noreferrer" className={styles.inlineLink}>{proj.title}</a>
                      : proj.title}
                  </div>
                  <div className={styles.projDates}>{proj.dates}</div>
                  <ul>
                    {proj.bullets.map((b, i) => <li key={i}>{renderBullet(b)}</li>)}
                  </ul>
                </Fragment>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export async function getStaticProps() {
  return {
    props: {
      title: 'Resume',
      description: 'Downloadable resume for Dhrumil Shukla, Software Engineer.',
    },
  };
}

export default ResumePage;
