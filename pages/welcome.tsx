import Link from 'next/link';
import Image from 'next/image';
import { VscArrowRight, VscFileCode, VscGithub, VscBriefcase, VscAccount, VscMail, VscCode } from 'react-icons/vsc';
import { usePersonality } from '@/components/PersonalityContext';
import { pages } from '@/data/pages';
import { owner, welcomeScreen } from '@/data/owner';
import styles from '@/styles/WelcomePage.module.css';

const QUICK_OPENS = [
  { path: '/work',     label: 'Work Experience', icon: <VscBriefcase /> },
  { path: '/projects', label: 'Projects',        icon: <VscFileCode /> },
  { path: '/about',    label: 'About Me',        icon: <VscAccount /> },
  { path: '/contact',  label: 'Contact',         icon: <VscMail /> },
  { path: '/github',   label: 'GitHub',          icon: <VscGithub /> },
];

export default function WelcomePage() {
  const { personality } = usePersonality();
  const { headline, sub } = welcomeScreen[personality as keyof typeof welcomeScreen] ?? welcomeScreen.professional;

  const pagesByPersonality = pages
    .filter(p => p.path !== '/')
    .map(p => ({ path: p.path, ...p[personality] }));

  return (
    <div className={styles.root}>
      {/* ── Left panel ── */}
      <div className={styles.left}>
        <div className={styles.logoRow}>
          <VscCode size={38} className={styles.logoIcon} />
          <span className={styles.logoText}>Visual Studio Code</span>
        </div>

        <h1 className={styles.headline}>{headline}</h1>
        <p className={styles.sub}>{sub}</p>

        <section className={styles.section}>
          <div className={styles.sectionLabel}>START</div>
          <ul className={styles.linkList}>
            <li>
              <Link href="/work" className={styles.actionLink}>
                <VscBriefcase className={styles.linkIcon} />
                New File —&nbsp;<span className={styles.linkMuted}>experience.py</span>
              </Link>
            </li>
            <li>
              <Link href="/projects" className={styles.actionLink}>
                <VscFileCode className={styles.linkIcon} />
                Open Folder —&nbsp;<span className={styles.linkMuted}>./projects</span>
              </Link>
            </li>
            <li>
              <Link href="/github" className={styles.actionLink}>
                <VscGithub className={styles.linkIcon} />
                Clone Repository —&nbsp;<span className={styles.linkMuted}>github.com/{owner.github}</span>
              </Link>
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionLabel}>RECENT</div>
          <ul className={styles.linkList}>
            {pagesByPersonality.map(p => (
              <li key={p.path}>
                <Link href={p.path} className={styles.recentLink}>
                  <Image src={p.icon} alt="" width={14} height={14} className={styles.fileIcon} />
                  <span className={styles.fileName}>{p.name}</span>
                  <span className={styles.filePath}>{p.path}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* ── Right panel ── */}
      <div className={styles.right}>
        <section className={styles.section}>
          <div className={styles.sectionLabel}>ABOUT THIS PORTFOLIO</div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>{owner.name}</div>
            <div className={styles.cardRole}>{owner.title}</div>
            <p className={styles.cardBio}>{owner.bio.professional}</p>
            <div className={styles.tagRow}>
              {owner.stack.split(' · ').map(t => (
                <span key={t} className={styles.tag}>{t}</span>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionLabel}>SHIPPED</div>
          <div className={styles.shipList}>
            {owner.shipped.map(s => (
              <div key={s} className={styles.shipItem}>
                <span className={styles.shipDot} />
                {s}
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionLabel}>QUICK OPEN</div>
          <div className={styles.quickGrid}>
            {QUICK_OPENS.map(q => (
              <Link key={q.path} href={q.path} className={styles.quickCard}>
                <span className={styles.quickIcon}>{q.icon}</span>
                <span className={styles.quickLabel}>{q.label}</span>
                <VscArrowRight className={styles.quickArrow} />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export async function getStaticProps() {
  return { props: { title: 'Welcome' } };
}
