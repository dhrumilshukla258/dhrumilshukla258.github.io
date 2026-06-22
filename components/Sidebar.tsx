import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  VscHome,
  VscBriefcase,
  VscCode,
  VscFiles,
  VscMail,
  VscGithub,
  VscSettings,
} from 'react-icons/vsc';
import styles from '@/styles/Sidebar.module.css';

const sidebarTopItems = [
  { Icon: VscHome, path: '/' },
  { Icon: VscBriefcase, path: '/work' },
  { Icon: VscCode, path: '/projects' },
  { Icon: VscFiles, path: '/about' },
  { Icon: VscMail, path: '/contact' },
  { Icon: VscGithub, path: '/github' },
];

const sidebarBottomItems = [
  { Icon: VscSettings, path: '/settings' },
];

const Sidebar = () => {
  const router = useRouter();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarTop}>
        {sidebarTopItems.map(({ Icon, path }) => (
          <Link href={path} key={path}>
            <div
              className={`${styles.iconContainer} ${
                router.pathname === path && styles.active
              }`}
            >
              <Icon
                size={16}
                fill={
                  router.pathname === path
                    ? 'rgb(225, 228, 232)'
                    : 'rgb(106, 115, 125)'
                }
                className={styles.icon}
              />
            </div>
          </Link>
        ))}
      </div>


      <div className={styles.sidebarBottom}>
        {sidebarBottomItems.map(({ Icon, path }) => (
          <Link href={path} key={path}>
            <div
              className={`${styles.iconContainer} ${
                router.pathname === path && styles.active
              }`}
            >
              <Icon
                size={16}
                fill={
                  router.pathname === path
                    ? 'rgb(225, 228, 232)'
                    : 'rgb(106, 115, 125)'
                }
                className={styles.icon}
              />
            </div>
          </Link>
        ))}
      </div>

      
    </aside>
  );
};

export default Sidebar;
