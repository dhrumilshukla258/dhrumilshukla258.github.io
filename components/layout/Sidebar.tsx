import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { usePersonality } from '@/components/context/PersonalityContext';
import {
  VscHome,
  VscBriefcase,
  VscCode,
  VscFiles,
  VscMail,
  VscGithub,
  VscSettings,
  VscPackage,
  VscBeaker,
} from 'react-icons/vsc';
import styles from './Sidebar.module.css';

const sidebarTopItems = [
  { Icon: VscHome,      path: '/' },
  { Icon: VscBriefcase, path: '/work' },
  { Icon: VscPackage,   path: '/projects' },
  { Icon: VscFiles,     path: '/about' },
  { Icon: VscMail,      path: '/contact' },
  { Icon: VscGithub,    path: '/github' },
];

const sidebarBottomItems = [
  { Icon: VscSettings, path: '/settings' },
];

const Sidebar = () => {
  const router = useRouter();
  const { personality } = usePersonality();
  const [easterEggFound, setEasterEggFound] = useState(false);

  useEffect(() => {
    setEasterEggFound(!!localStorage.getItem('welcomeFound'));
    const onFound = () => setEasterEggFound(true);
    window.addEventListener('welcomeFound', onFound);
    window.addEventListener('storage', onFound);
    return () => {
      window.removeEventListener('welcomeFound', onFound);
      window.removeEventListener('storage', onFound);
    };
  }, []);

  const sidebarClass = personality === 'professional' ? styles.sidebar : styles.sidebarSmallOnly;

  const iconClass = (path: string) =>
    `${styles.iconContainer} ${router.pathname === path ? styles.active : ''}`;

  return (
    <aside className={sidebarClass}>
      <div className={styles.sidebarTop}>
        {sidebarTopItems.map(({ Icon, path }) => (
          <Link href={path} key={path}>
            <div className={iconClass(path)}>
              <Icon size={16} className={styles.icon} />
            </div>
          </Link>
        ))}
      </div>

      <div className={styles.sidebarBottom}>
        {easterEggFound && (
          <Link href="/welcome" className={styles.easterEggLink}>
            <div className={iconClass('/welcome')}>
              <VscBeaker size={16} className={styles.icon} />
            </div>
          </Link>
        )}
        {sidebarBottomItems.map(({ Icon, path }) => (
          <Link href={path} key={path}>
            <div className={iconClass(path)}>
              <Icon size={16} className={styles.icon} />
            </div>
          </Link>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
